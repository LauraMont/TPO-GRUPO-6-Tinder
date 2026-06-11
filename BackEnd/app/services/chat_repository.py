from __future__ import annotations

from datetime import datetime
from typing import Any

from pymongo import ASCENDING, DESCENDING, MongoClient

from app.core.config import Settings


class MongoChatRepository:
    def __init__(self, settings: Settings) -> None:
        self._client = MongoClient(settings.mongo_uri, serverSelectionTimeoutMS=3000)
        self._collection = self._client[settings.mongo_db]["messages"]
        self._collection.create_index(
            [("conversation_id", ASCENDING), ("created_at", DESCENDING)]
        )

    def close(self) -> None:
        self._client.close()

    def save_message(self, message: dict[str, Any]) -> None:
        self._collection.insert_one(
            {
                "_id": message["id"],
                "conversation_id": message["conversation_id"],
                "sender_id": message["sender_id"],
                "recipient_id": message["recipient_id"],
                "text": message["text"],
                "created_at": message["created_at"],
            }
        )

    def list_recent_messages(self, conversation_id: str, limit: int) -> list[dict[str, Any]]:
        cursor = (
            self._collection.find({"conversation_id": conversation_id})
            .sort("created_at", DESCENDING)
            .limit(limit)
        )
        messages = [self._normalize_message(document) for document in cursor]
        messages.reverse()
        return messages

    @staticmethod
    def _normalize_message(document: dict[str, Any]) -> dict[str, Any]:
        created_at = document["created_at"]
        if isinstance(created_at, datetime):
            created_at = created_at.isoformat()
        return {
            "type": "message",
            "id": str(document["_id"]),
            "sender_id": str(document["sender_id"]),
            "recipient_id": str(document["recipient_id"]),
            "text": document["text"],
            "created_at": created_at,
        }
