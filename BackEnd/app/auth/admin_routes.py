from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from .database import get_db
from .models import Event
from .event_schemas import (
    EventCreate,
    EventUpdate
)
from .security import require_admin

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

#Creación de eventos.
@router.post("/events")
def create_event(
    payload: EventCreate,
    #admin=Depends(require_admin),
    db: Session = Depends(get_db)
):

    event = Event(
        title=payload.title,
        description=payload.description
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return event

#Lista de eventos
@router.get("/events")
def get_events(
    db: Session = Depends(get_db)
):

    return db.query(Event).all()

#Edición de eventos.
@router.put("/events/{event_id}")
def update_event(
    event_id: int,
    payload: EventUpdate,
    db: Session = Depends(get_db)
):

    event = (
        db.query(Event)
        .filter(Event.id == event_id)
        .first()
    )

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Evento no encontrado"
        )

    event.title = payload.title
    event.description = payload.description

    db.commit()

    return event

#Eliminación de evento.
@router.delete("/events/{event_id}")
def delete_event(
    event_id: int,
    db: Session = Depends(get_db)
):

    event = (
        db.query(Event)
        .filter(Event.id == event_id)
        .first()
    )

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Evento no encontrado"
        )

    db.delete(event)
    db.commit()

    return {
        "message": "Evento eliminado"
    }

