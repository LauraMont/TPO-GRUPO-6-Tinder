from __future__ import annotations

import asyncio
import json
import logging
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from jose import JWTError, jwt
from redis.asyncio import Redis

from app.auth.security import ALGORITHM, SECRET_KEY
from app.core.config import get_settings
from app.services.chat_repository import MongoChatRepository


router = APIRouter(tags=["Chat"])
logger = logging.getLogger("chat")
HISTORY_LIMIT = 50


def _user_id_from_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
    user_id = payload.get("sub")
    return str(user_id) if user_id is not None else None


def _conversation_id(user_id: str, other_user_id: str) -> str:
    return ":".join(sorted((user_id, other_user_id)))


async def _send_json(websocket: WebSocket, send_lock: asyncio.Lock, payload: dict) -> None:
    async with send_lock:
        await websocket.send_json(payload)


async def _send_history(
    websocket: WebSocket,
    send_lock: asyncio.Lock,
    chat_repository: MongoChatRepository,
    conversation_id: str,
) -> None:
    history = await asyncio.to_thread(
        chat_repository.list_recent_messages, conversation_id, HISTORY_LIMIT
    )
    await _send_json(websocket, send_lock, {"type": "history", "messages": history})


@router.websocket("/ws/chat/{other_user_id}")
async def chat_websocket(websocket: WebSocket, other_user_id: str, token: str) -> None:
    user_id = _user_id_from_token(token)
    if user_id is None or user_id == other_user_id:
        await websocket.accept()
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    repository = websocket.app.state.repository
    if not repository.are_matched(user_id, other_user_id):
        await websocket.accept()
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    settings = get_settings()
    redis = Redis.from_url(settings.redis_url, decode_responses=True)
    chat_repository = MongoChatRepository(settings)
    pubsub = redis.pubsub()
    conversation_id = _conversation_id(user_id, other_user_id)
    channel = f"chat:channel:{conversation_id}"
    online_users_key = "chat:online-users"
    connection_id = str(uuid4())
    user_connections_key = f"chat:user:{user_id}:connections"
    send_lock = asyncio.Lock()

    try:
        await pubsub.subscribe(channel)
        await redis.sadd(user_connections_key, connection_id)
        await redis.sadd(online_users_key, user_id)
        await websocket.accept()
        logger.info("connected user=%s other=%s connection=%s", user_id, other_user_id, connection_id)
        await _send_json(
            websocket,
            send_lock,
            {
                "type": "connected",
                "user_id": user_id,
                "other_user_online": bool(await redis.sismember(online_users_key, other_user_id)),
            },
        )
        await _send_history(websocket, send_lock, chat_repository, conversation_id)
        await redis.publish(channel, json.dumps({"type": "presence", "user_id": user_id, "online": True}))

        async def forward_redis_messages() -> None:
            async for event in pubsub.listen():
                if event["type"] == "message":
                    payload = json.loads(event["data"])
                    if payload.pop("_origin_connection_id", None) == connection_id:
                        continue
                    await _send_json(websocket, send_lock, payload)

        forward_task = asyncio.create_task(forward_redis_messages())
        try:
            while True:
                payload = await websocket.receive_json()
                if payload.get("type") == "sync":
                    await _send_history(websocket, send_lock, chat_repository, conversation_id)
                    continue
                text = str(payload.get("text", "")).strip()
                if not text:
                    continue
                message_id = str(uuid4())
                message = {
                    "type": "message",
                    "id": message_id,
                    "sender_id": user_id,
                    "recipient_id": other_user_id,
                    "text": text,
                    "created_at": datetime.now(timezone.utc),
                    "conversation_id": conversation_id,
                }
                await asyncio.to_thread(chat_repository.save_message, message)
                outbound_message = {**message, "created_at": message["created_at"].isoformat()}
                outbound_message.pop("conversation_id")
                await _send_json(websocket, send_lock, outbound_message)
                pubsub_message = {**outbound_message, "_origin_connection_id": connection_id}
                subscribers = await redis.publish(channel, json.dumps(pubsub_message))
                logger.info(
                    "published message=%s sender=%s recipient=%s subscribers=%s",
                    message_id,
                    user_id,
                    other_user_id,
                    subscribers,
                )
        finally:
            forward_task.cancel()
            await asyncio.gather(forward_task, return_exceptions=True)
    except WebSocketDisconnect:
        pass
    finally:
        await redis.srem(user_connections_key, connection_id)
        if await redis.scard(user_connections_key) == 0:
            await redis.srem(online_users_key, user_id)
            await redis.publish(channel, json.dumps({"type": "presence", "user_id": user_id, "online": False}))
        await pubsub.unsubscribe(channel)
        await pubsub.aclose()
        await redis.aclose()
        chat_repository.close()
        logger.info("disconnected user=%s other=%s connection=%s", user_id, other_user_id, connection_id)
