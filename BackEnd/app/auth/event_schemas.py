from pydantic import BaseModel
from datetime import date, time
from typing import Optional

# Lo que viene desde React al crear/editar
class EventCreate(BaseModel):
    title: str
    category: str
    event_date: date  # Pydantic convierte automáticamente '2026-05-24' a objeto date
    event_time: time  # Pydantic convierte '18:00' a objeto time
    location: str
    banner_url: Optional[str] = None
    description: str
    max_capacity: Optional[int] = 0
    publish_state: Optional[str] = "Borrador"

class EventUpdate(EventCreate):
    expected_attendance: Optional[int] = 0

# Lo que el Backend le responde al Frontend
class EventResponse(EventUpdate):
    id: int

    class Config:
        from_attributes = True # Permite leer modelos de SQLAlchemy