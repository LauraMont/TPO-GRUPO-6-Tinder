from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List
from jose import jwt, JWTError
from app.services.mongo_repository import MongoProfileRepository
from app.core.config import get_settings

router = APIRouter(prefix="/profile", tags=["Profile"])

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


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    bio: Optional[str] = None
    interests: Optional[List[str]] = None
    photos: Optional[List[str]] = None
    location: Optional[str] = None
    gender: Optional[str] = None
    looking_for: Optional[str] = None


@router.get("/me")
def get_my_profile(user_id: str = Depends(get_user_id_from_token)):
    settings = get_settings()
    repo = MongoProfileRepository(settings)
    profile = repo.get_profile(user_id)
    if not profile:
        return {"userId": user_id, "name": "", "age": None, "bio": "", "interests": [], "photos": []}
    return profile


@router.put("/me")
def update_my_profile(
    payload: ProfileUpdate,
    user_id: str = Depends(get_user_id_from_token)
):
    settings = get_settings()
    repo = MongoProfileRepository(settings)
    update_data = {k: v for k, v in payload.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No hay datos para actualizar")
    repo.upsert_profile(user_id, update_data)
    return repo.get_profile(user_id)
