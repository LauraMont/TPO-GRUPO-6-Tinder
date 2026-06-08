from datetime import datetime, timedelta
import hashlib

from jose import jwt
from fastapi import Header
from fastapi import HTTPException
from fastapi.security import HTTPBearer
from fastapi.security import HTTPAuthorizationCredentials

from jose import JWTError
from fastapi import Depends

SECRET_KEY = "TPO_UADE_SECRET_2026"
ALGORITHM = "HS256"
security = HTTPBearer()


def hash_password(password: str):
    return hashlib.sha256(
        password.encode()
    ).hexdigest()


def verify_password(password: str, hashed: str):
    return (
        hashlib.sha256(
            password.encode()
        ).hexdigest()
        == hashed
    )


def create_access_token(data: dict):

    payload = data.copy()

    payload["exp"] = (
        datetime.utcnow() +
        timedelta(hours=24)
    )

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

#Creación de dependencia de autenticación para proteger JWT.
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Token inválido"
        )
#Obtención de rol
def require_admin(user=Depends(get_current_user)):

    if user.get("role") != "ADMIN":

        raise HTTPException(
            status_code=403,
            detail="Solo administradores"
        )

    return user

