from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import get_db
from .event_schemas import EventCreate, EventUpdate
from .security import require_admin
from app.services.postgres_repository import PostgreSQLRepository

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/events")
def create_event(
    payload: EventCreate,
    admin=Depends(require_admin),
    db: Session = Depends(get_db)
):
    repo = PostgreSQLRepository(db)
    return repo.create_event(
        title=payload.title,
        description=payload.description,
        location=payload.location,
        event_date=payload.event_date,
        tags=payload.tags,
        status=payload.status,
    )


@router.get("/events")
def get_events(db: Session = Depends(get_db)):
    repo = PostgreSQLRepository(db)
    return repo.get_all_events()


@router.put("/events/{event_id}")
def update_event(
    event_id: int,
    payload: EventUpdate,
    admin=Depends(require_admin),
    db: Session = Depends(get_db)
):
    repo = PostgreSQLRepository(db)
    event = repo.get_event_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    event.title = payload.title
    event.description = payload.description
    event.location = payload.location
    event.event_date = payload.event_date
    event.tags = payload.tags
    event.status = payload.status
    repo.save_changes()
    return event


@router.delete("/events/{event_id}")
def delete_event(
    event_id: int,
    admin=Depends(require_admin),
    db: Session = Depends(get_db)
):
    repo = PostgreSQLRepository(db)
    event = repo.get_event_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    repo.delete_event(event)
    return {"message": "Evento eliminado correctamente"}
