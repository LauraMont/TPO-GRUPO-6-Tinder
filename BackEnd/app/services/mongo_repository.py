from __future__ import annotations

from typing import Any

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure

from app.core.config import Settings


class MongoProfileRepository:
    def __init__(self, settings: Settings) -> None:
        print(f"🚨 DEBUG IMPORTANTE - Intentando conectar a: {settings.mongo_uri}")
        self._settings = settings
        self._client = MongoClient(settings.mongo_uri, serverSelectionTimeoutMS=3000)
        # --- PRE-FLIGHT PING ---
        # Forzamos la conexión inmediatamente para fallar rápido si hay problemas
        try:
            self._client.admin.command("ping")
        except (ConnectionFailure, OperationFailure) as exc:
            raise RuntimeError(f"Error al intentar conectar con MongoDB: {exc}") from exc
        self._collection = self._client[settings.mongo_db][settings.mongo_collection]

    def close(self) -> None:
        self._client.close()

    def ping(self) -> None:
        self._client.admin.command("ping")

    def _normalize_profile(self, document: dict[str, Any]) -> dict[str, Any]:
        profile_id = document.get("userId") or document.get("id") or document.get("_id")
        profile_id = str(profile_id) if profile_id is not None else None
        profile = {key: value for key, value in document.items() if key != "_id"}
        if profile_id is not None:
            profile["id"] = profile_id
            profile["userId"] = profile_id
        return profile

    def get_profile(self, user_id: str) -> dict[str, Any] | None:
        document = self._collection.find_one({"userId": user_id}, {"_id": 0})
        if document is None:
            document = self._collection.find_one({"id": user_id}, {"_id": 0})
        if document is None:
            return None
        return self._normalize_profile(document)

    def list_profiles(self, exclude_user_ids: list[str] | set[str] | None = None, limit: int | None = None) -> list[dict[str, Any]]:
        query: dict[str, Any] = {}
        if exclude_user_ids:
            query = {"userId": {"$nin": list(exclude_user_ids)}}

        cursor = self._collection.find(query, {"_id": 0}).sort("last_active_at", -1)
        if limit is not None:
            cursor = cursor.limit(limit)
        return [self._normalize_profile(document) for document in cursor]

    def list_profiles_by_ids(self, user_ids: list[str]) -> list[dict[str, Any]]:
        if not user_ids:
            return []

        documents = self._collection.find({"userId": {"$in": user_ids}}, {"_id": 0})
        profiles_by_id = {str(document.get("userId") or document.get("id")): self._normalize_profile(document) for document in documents}
        return [profiles_by_id[user_id] for user_id in user_ids if user_id in profiles_by_id]