from pydantic import BaseModel
from typing import Optional


class EventCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    location: Optional[str] = ""
    event_date: Optional[str] = None
    tags: Optional[str] = ""
    status: Optional[str] = "Publicado"


class EventUpdate(BaseModel):
    title: str
    description: Optional[str] = ""
    location: Optional[str] = ""
    event_date: Optional[str] = None
    tags: Optional[str] = ""
    status: Optional[str] = "Publicado"


class EventResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    location: Optional[str]
    event_date: Optional[str]
    tags: Optional[str]
    status: Optional[str]

    class Config:
        from_attributes = True
