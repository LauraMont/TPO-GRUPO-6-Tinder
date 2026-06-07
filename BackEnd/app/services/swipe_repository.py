from __future__ import annotations

from typing import Any, Protocol
from neo4j.exceptions import Neo4jError

from app.services.mongo_repository import MongoProfileRepository
from app.services.neo4j_repository import Neo4jSwipeRepository
from app.services.cassandra_repository import CassandraSwipeRepository 


class SwipeRepository(Protocol):
    def get_feed(self, user_id: str, limit: int) -> list[dict[str, Any]]:
        ...

    def register_like(self, user_id: str, target_user_id: str) -> dict[str, Any]:
        ...

    def register_pass(self, user_id: str, target_user_id: str) -> dict[str, Any]:
        ...

    def list_matches(self, user_id: str) -> list[dict[str, Any]]:
        ...


class MongoNeo4jSwipeRepository:
    def __init__(self, profiles: MongoProfileRepository, graph: Neo4jSwipeRepository, cassandra_repo: CassandraSwipeRepository) -> None:
        self._profiles = profiles
        self._graph = graph
        self._cassandra_repo = cassandra_repo 

    def close(self) -> None:
        close_profiles = getattr(self._profiles, "close", None)
        if callable(close_profiles):
            close_profiles()
        close_graph = getattr(self._graph, "close", None)
        if callable(close_graph):
            close_graph()

    def get_feed(self, user_id: str, limit: int) -> list[dict[str, Any]]:
        try:
            seen_user_ids = set(self._graph.get_seen_user_ids(user_id))
            seen_user_ids.add(user_id)

            recommended_user_ids = [
                recommended_user_id
                for recommended_user_id in self._graph.get_recommended_user_ids(user_id=user_id, limit=limit * 3)
                if recommended_user_id not in seen_user_ids
            ]
        except Neo4jError as exc:
            raise RuntimeError(f"Neo4j failed while building recommendations: {exc}") from exc

        try:
            profiles = self._profiles.list_profiles_by_ids(recommended_user_ids)
            profiles_by_id = {profile["userId"]: profile for profile in profiles if profile.get("userId")}
            ordered_profiles = [profiles_by_id[user_id] for user_id in recommended_user_ids if user_id in profiles_by_id]
        except Exception as exc:
            raise RuntimeError(f"MongoDB failed while hydrating recommendations: {exc}") from exc

        return ordered_profiles[:limit]

    def diagnostics(self) -> dict[str, str]:
        status: dict[str, str] = {}
        try:
            self._graph.ping()
            status["neo4j"] = "ok"
        except Exception as exc:
            status["neo4j"] = f"error: {exc}"

        try:
            self._profiles.ping()
            status["mongodb"] = "ok"
        except Exception as exc:
            status["mongodb"] = f"error: {exc}"

        return status

    def register_like(self, user_id: str, target_user_id: str) -> dict[str, Any]:
        if self._profiles.get_profile(target_user_id) is None:
            raise ValueError("User or target user not found")
        
        result = self._graph.register_like(user_id=user_id, target_user_id=target_user_id)
        
        try:
            if self._cassandra_repo:
                self._cassandra_repo.log_swipe(user_id, target_user_id, 'LIKE')
        except Exception as exc:
            print(f"⚠️ Error al persistir historial en Cassandra: {exc}")
            
        return result

    def register_pass(self, user_id: str, target_user_id: str) -> dict[str, Any]:
        if self._profiles.get_profile(target_user_id) is None:
            raise ValueError("User or target user not found")
        
        result = self._graph.register_pass(user_id=user_id, target_user_id=target_user_id)
        
        try:
            if self._cassandra_repo:
                self._cassandra_repo.log_swipe(user_id, target_user_id, 'DISLIKE')
        except Exception as exc:
            print(f"⚠️ Error al persistir historial en Cassandra: {exc}")
            
        return result

    def list_matches(self, user_id: str) -> list[dict[str, Any]]:
        match_records = self._graph.list_match_records(user_id)
        matched_user_ids = [record["user_id"] for record in match_records if record.get("user_id")]
        profiles = self._profiles.list_profiles_by_ids(matched_user_ids)
        profiles_by_id = {profile["userId"]: profile for profile in profiles if profile.get("userId")}

        matched_profiles: list[dict[str, Any]] = []
        for record in match_records:
            matched_id = record.get("user_id")
            profile = profiles_by_id.get(matched_id)
            if profile is None:
                continue
            matched_profiles.append({**profile, "match_created_at": record.get("match_created_at")})
        return matched_profiles

    def get_user_swipe_history(self, user_id: str) -> list[dict[str, Any]]:
        if self._cassandra_repo:
            return self._cassandra_repo.get_history(user_id)
        return []


class InMemorySwipeRepository:
    def __init__(self, users: list[dict[str, Any]] | None = None) -> None:
        self.users = users or []
        self.likes: set[tuple[str, str]] = set()
        self.passes: set[tuple[str, str]] = set()
        self.matches: set[frozenset[str]] = set()

    def _find_user(self, user_id: str) -> dict[str, Any] | None:
        for user in self.users:
            if user.get("id") == user_id:
                return user
        return None

    def _ensure_user(self, user_id: str) -> dict[str, Any]:
        user = self._find_user(user_id)
        if user is not None:
            return user

        user = {
            "id": user_id,
            "userId": user_id,
            "name": "Tu perfil",
            "bio": "Perfil temporal para pruebas.",
            "age": None,
            "photos": [],
            "latitude": None,
            "longitude": None,
            "last_active_at": None,
        }
        self.users.append(user)
        return user

    def get_feed(self, user_id: str, limit: int) -> list[dict[str, Any]]:
        self._ensure_user(user_id)
        seen = {target for source, target in self.likes | self.passes if source == user_id}
        seen |= {next(iter(match - {user_id})) for match in self.matches if user_id in match}
        feed = [
            {**user, "id": user.get("id") or user.get("userId"), "userId": user.get("userId") or user.get("id")}
            for user in self.users
            if (user.get("id") or user.get("userId")) != user_id and (user.get("id") or user.get("userId")) not in seen
        ]
        return feed[:limit]

    def register_like(self, user_id: str, target_user_id: str) -> dict[str, Any]:
        self._ensure_user(user_id)
        if self._find_user(target_user_id) is None:
            raise ValueError("User or target user not found")
        self.likes.add((user_id, target_user_id))
        is_match = (target_user_id, user_id) in self.likes
        if is_match:
            self.matches.add(frozenset({user_id, target_user_id}))
        return {
            "user_id": user_id,
            "target_user_id": target_user_id,
            "status": "like",
            "is_match": is_match,
        }

    def register_pass(self, user_id: str, target_user_id: str) -> dict[str, Any]:
        self._ensure_user(user_id)
        if self._find_user(target_user_id) is None:
            raise ValueError("User or target user not found")
        self.passes.add((user_id, target_user_id))
        return {
            "user_id": user_id,
            "target_user_id": target_user_id,
            "status": "pass",
            "is_match": False,
        }

    def list_matches(self, user_id: str) -> list[dict[str, Any]]:
        self._ensure_user(user_id)
        matches: list[dict[str, Any]] = []
        for match in self.matches:
            if user_id not in match:
                continue
            other_id = next(iter(match - {user_id}))
            other = self._find_user(other_id)
            if other is not None:
                matches.append({**other, "id": other.get("id") or other.get("userId"), "userId": other.get("userId") or other.get("id")})
        return matches
