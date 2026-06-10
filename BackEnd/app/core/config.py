from __future__ import annotations
import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    neo4j_uri: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    neo4j_user: str = os.getenv("NEO4J_USER", "neo4j")
    neo4j_password: str = os.getenv("NEO4J_PASSWORD", "password123")
    neo4j_database: str = os.getenv("NEO4J_DATABASE", "neo4j")
    mongo_uri: str = os.getenv("MONGO_URI", "mongodb://admin:password123@localhost:27018/?authSource=admin")
    mongo_db: str = os.getenv("MONGO_DB", "tinderlike")
    mongo_collection: str = os.getenv("MONGO_COLLECTION", "profiles")
    feed_limit: int = int(os.getenv("FEED_LIMIT", "20"))


def get_settings() -> Settings:
    return Settings()
