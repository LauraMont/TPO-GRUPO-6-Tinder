from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from jose import jwt, JWTError
from app.services.mongo_repository import MongoProfileRepository
from app.core.config import get_settings
import pymongo
from datetime import datetime

router = APIRouter(prefix="/events", tags=["Events"])

SECRET_KEY = "TPO_UADE_SECRET_2026"
ALGORITHM = "HS256"


def get_user_id_from_token(authorization: str | None = Header(default=None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autenticado")
    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return str(payload.get("sub"))
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")


def get_events_collection():
    settings = get_settings()
    from pymongo import MongoClient
    client = MongoClient(settings.mongo_uri)
    db = client[settings.mongo_db]
    return db["eventos_detalles"], client


class EventCreate(BaseModel):
    titulo: str
    descripcion: Optional[str] = ""
    ubicacion_nombre: Optional[str] = ""
    fecha_hora: Optional[str] = None
    tags: Optional[List[str]] = []


@router.get("/")
def list_events():
    col, client = get_events_collection()
    try:
        events = list(col.find({}, {"_id": 0}))
        return events
    finally:
        client.close()


@router.post("/attend/{event_id}")
def attend_event(event_id: str, user_id: str = Depends(get_user_id_from_token)):
    col, client = get_events_collection()
    try:
        col.update_one(
            {"id": event_id},
            {"$addToSet": {"asistentes": user_id}}
        )
        return {"message": "Asistencia registrada"}
    finally:
        client.close()


@router.delete("/attend/{event_id}")
def cancel_attendance(event_id: str, user_id: str = Depends(get_user_id_from_token)):
    col, client = get_events_collection()
    try:
        col.update_one(
            {"id": event_id},
            {"$pull": {"asistentes": user_id}}
        )
        return {"message": "Asistencia cancelada"}
    finally:
        client.close()
