from __future__ import annotations

from typing import Any

from neo4j import GraphDatabase

from app.core.config import Settings


class Neo4jSwipeRepository:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._driver = GraphDatabase.driver(
            settings.neo4j_uri,
            auth=(settings.neo4j_user, settings.neo4j_password),
        )

    def close(self) -> None:
        self._driver.close()

    def ping(self) -> None:
        with self._session() as session:
            session.run("RETURN 1 AS ok").single()

    def _session(self):
        return self._driver.session(database=self._settings.neo4j_database)

    def seed_users(self, users: list[dict[str, Any]]) -> None:
        query = """
        UNWIND $users AS user
        MERGE (u:User {userId: coalesce(user.userId, user.id)})
        SET u += user
        SET u.userId = coalesce(user.userId, user.id)
        """
        with self._session() as session:
            session.run(query, users=users)

    def get_seen_user_ids(self, user_id: str) -> list[str]:
        query = """
        MATCH (me:User {userId: $user_id})-[r:LIKES|PASSED|MATCHES]-(other:User)
        RETURN collect(DISTINCT other.userId) AS user_ids
        """
        with self._session() as session:
            record = session.run(query, user_id=user_id).single()
            if record is None:
                return []
            return [other_user_id for other_user_id in record["user_ids"] if other_user_id]

    def list_match_records(self, user_id: str) -> list[dict[str, Any]]:
        query = """
        MATCH (me:User {userId: $user_id})-[match:MATCHES]-(other:User)
        RETURN other.userId AS user_id, toString(match.created_at) AS match_created_at
        ORDER BY match.created_at DESC
        """
        with self._session() as session:
            result = session.run(query, user_id=user_id)
            return [record.data() for record in result]

    def get_recommended_user_ids(self, user_id: str, limit: int) -> list[str]:
        query = """
        MERGE (me:User {userId: $user_id})
            ON CREATE SET me.created_at = datetime()
        WITH me
        MATCH (candidate:User)
        WHERE candidate.userId <> $user_id
          AND NOT EXISTS { MATCH (me)-[:LIKES|PASSED|MATCHES]->(candidate) }
          AND NOT EXISTS { MATCH (candidate)-[:MATCHES]->(me) }
        OPTIONAL MATCH p = shortestPath((me)-[*1..3]-(candidate))
        WITH candidate, p,
             CASE WHEN p IS NULL THEN null ELSE length(p) END AS degrees_of_separation
        RETURN candidate.userId AS user_id
        ORDER BY
          CASE WHEN degrees_of_separation IS NULL THEN 1 ELSE 0 END,
          degrees_of_separation ASC,
          candidate.last_active_at DESC
        LIMIT $limit
        """
        with self._session() as session:
            result = session.run(query, user_id=user_id, limit=limit)
            return [record["user_id"] for record in result if record.get("user_id")]

    def register_like(self, user_id: str, target_user_id: str) -> dict[str, Any]:
        query = """
        MERGE (me:User {userId: $user_id})
            ON CREATE SET me.created_at = datetime()
        WITH me
        MERGE (target:User {userId: $target_user_id})
            ON CREATE SET target.created_at = datetime()
        MERGE (me)-[like:LIKES]->(target)
          ON CREATE SET like.created_at = datetime()
        WITH me, target, like
        OPTIONAL MATCH (target)-[reverse_like:LIKES]->(me)
        WITH me, target, like, reverse_like, reverse_like IS NOT NULL AS mutual_like
        FOREACH (_ IN CASE WHEN mutual_like THEN [1] ELSE [] END |
            MERGE (me)-[match_rel:MATCHES]-(target)
                ON CREATE SET match_rel.created_at = datetime()
        )
        RETURN mutual_like AS is_match, like.created_at AS created_at
        """
        with self._session() as session:
            record = session.run(
                query,
                user_id=user_id,
                target_user_id=target_user_id,
            ).single()
            if record is None:
                raise ValueError("User or target user not found")
            return {
                "user_id": user_id,
                "target_user_id": target_user_id,
                "status": "like",
                "is_match": bool(record["is_match"]),
            }

    def register_pass(self, user_id: str, target_user_id: str) -> dict[str, Any]:
        query = """
        MERGE (me:User {userId: $user_id})
            ON CREATE SET me.created_at = datetime()
        WITH me
        MERGE (target:User {userId: $target_user_id})
            ON CREATE SET target.created_at = datetime()
        MERGE (me)-[passed:PASSED]->(target)
          ON CREATE SET passed.created_at = datetime()
        RETURN passed.created_at AS created_at
        """
        with self._session() as session:
            record = session.run(
                query,
                user_id=user_id,
                target_user_id=target_user_id,
            ).single()
            if record is None:
                raise ValueError("User or target user not found")
            return {
                "user_id": user_id,
                "target_user_id": target_user_id,
                "status": "pass",
                "is_match": False,
            }

    def list_matches(self, user_id: str) -> list[dict[str, Any]]:
        query = """
        MERGE (me:User {userId: $user_id})
            ON CREATE SET me.created_at = datetime()
        WITH me
        MATCH (me)-[match:MATCHES]-(other:User)
        RETURN other { .*, id: other.userId, match_created_at: match.created_at } AS profile
        ORDER BY match.created_at DESC
        """
        with self._session() as session:
            result = session.run(query, user_id=user_id)
            return [record["profile"] for record in result]