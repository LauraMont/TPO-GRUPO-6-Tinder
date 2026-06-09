from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from .database import get_db
from .event_schemas import (
    EventCreate,
    EventUpdate
)
from .security import require_admin

# Importamos tu nuevo repositorio
from app.services.postgres_repository import PostgreSQLRepository

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)
# ... tus otros imports
from .event_schemas import EventResponse, EventCreate, EventUpdate

# Agregamos response_model para asegurar que devuelva todo el objeto estructurado
@router.get("/events", response_model=list[EventResponse])
def get_events(db: Session = Depends(get_db)):
    repo = PostgreSQLRepository(db)
    return repo.get_all_events()


@router.post("/events", response_model=EventResponse)
def create_event(payload: EventCreate, admin=Depends(require_admin), db: Session = Depends(get_db)):
    repo = PostgreSQLRepository(db)
    # Pasamos el diccionario completo extraído de Pydantic al repositorio
    return repo.create_event(**payload.model_dump())


@router.put("/events/{event_id}", response_model=EventResponse)
def update_event(event_id: int, payload: EventUpdate, admin=Depends(require_admin), db: Session = Depends(get_db)):
    repo = PostgreSQLRepository(db)
    event = repo.get_event_by_id(event_id)

    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    # Actualizamos dinámicamente todos los campos enviados
    for key, value in payload.model_dump().items():
        setattr(event, key, value)

    repo.save_changes()
    return event