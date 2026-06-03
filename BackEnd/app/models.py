from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class FeedResponse(BaseModel):
    user_id: str
    count: int
    profiles: list[dict[str, Any]] = Field(default_factory=list)


class SwipeResponse(BaseModel):
    user_id: str
    target_user_id: str
    status: str
    is_match: bool = False


class MatchesResponse(BaseModel):
    user_id: str
    count: int
    matches: list[dict[str, Any]] = Field(default_factory=list)