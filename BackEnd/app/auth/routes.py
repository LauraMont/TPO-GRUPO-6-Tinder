from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

# Register --> Registro.
from .database import get_db
from .schemas import (
    UserRegister,
    UserLogin,
    TokenResponse
)

from .security import (
    hash_password,
    verify_password,
    create_access_token
)

# Importamos tu nuevo repositorio
from app.services.postgres_repository import PostgreSQLRepository

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register")
def register(
    payload: UserRegister,
    db: Session = Depends(get_db)
):
    # Instanciamos el repositorio pasándole la sesión db
    repo = PostgreSQLRepository(db)

    existing = repo.get_user_by_email(payload.email)

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email ya registrado"
        )

    repo.create_user(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password)
    )

    return {
        "message": "Usuario creado"
    }


# Login.
@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    payload: UserLogin,
    db: Session = Depends(get_db)
):
    # Instanciamos el repositorio pasándole la sesión db
    repo = PostgreSQLRepository(db)

    user = repo.get_user_by_email(payload.email)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Credenciales inválidas"
        )

    if not verify_password(
        payload.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Credenciales inválidas"
        )

    token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }