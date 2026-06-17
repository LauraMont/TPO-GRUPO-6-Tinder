from __future__ import annotations

from fastapi import Depends, FastAPI, Header, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import Settings, get_settings
from app.models import FeedResponse, MatchesResponse, SwipeResponse
from app.services.mongo_repository import MongoProfileRepository
from app.services.neo4j_repository import Neo4jSwipeRepository
from app.services.swipe_repository import MongoNeo4jSwipeRepository, SwipeRepository
from app.auth.routes import router as auth_router
from app.auth.admin_routes import router as admin_router
from app.auth.profile_routes import router as profile_router
from app.auth.events_routes import router as events_router
from app.chat_routes import router as chat_router
from jose import jwt, JWTError

SECRET_KEY = "TPO_UADE_SECRET_2026"
ALGORITHM = "HS256"


def get_current_user_id(authorization: str | None = Header(default=None)) -> str:
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            if user_id:
                return str(user_id)
        except JWTError:
            pass
        raw = token
        if len(raw) > 10:
            return raw
    return "anonymous"


def get_repository(request: Request) -> SwipeRepository:
    repository = request.app.state.repository
    if repository is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Repository not configured")
    return repository


def create_app(repository: SwipeRepository | None = None, settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    if repository is None:
        repository = MongoNeo4jSwipeRepository(
            profiles=MongoProfileRepository(settings),
            graph=Neo4jSwipeRepository(settings),
        )

    app = FastAPI(title="Tinder Backend API", version="1.0.0")
    app.state.repository = repository

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/health/db")
    def health_db(repository: SwipeRepository = Depends(get_repository)) -> dict[str, str]:
        diagnostics = getattr(repository, "diagnostics", None)
        if callable(diagnostics):
            return diagnostics()
        return {"repository": "diagnostics not available"}

    @app.on_event("startup")
    def startup() -> None:
        try:
            from app.auth.database import engine
            from app.auth.models import Base
            Base.metadata.create_all(bind=engine)
        except Exception as exc:
            print(f"[startup] DB init warning: {exc}")

    @app.on_event("shutdown")
    def shutdown() -> None:
        close = getattr(app.state.repository, "close", None)
        if callable(close):
            close()

    @app.get("/api/discover/feed", response_model=FeedResponse)
    def discover_feed(
        user_id: str = Depends(get_current_user_id),
        repository: SwipeRepository = Depends(get_repository),
        debug: bool = Query(default=False),
    ) -> FeedResponse:
        try:
            profiles = repository.get_feed(user_id=user_id, limit=settings.feed_limit)
        except RuntimeError as exc:
            if debug:
                diagnostics = getattr(repository, "diagnostics", None)
                detail = {
                    "error": str(exc),
                    "diagnostics": diagnostics() if callable(diagnostics) else None,
                }
                raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail) from exc
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
        return FeedResponse(user_id=user_id, count=len(profiles), profiles=profiles)

    @app.post("/api/swipe/like/{target_user_id}", response_model=SwipeResponse)
    def swipe_like(
        target_user_id: str,
        user_id: str = Depends(get_current_user_id),
        repository: SwipeRepository = Depends(get_repository),
    ) -> SwipeResponse:
        try:
            result = repository.register_like(user_id=user_id, target_user_id=target_user_id)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
        return SwipeResponse(**result)

    @app.post("/api/swipe/pass/{target_user_id}", response_model=SwipeResponse)
    def swipe_pass(
        target_user_id: str,
        user_id: str = Depends(get_current_user_id),
        repository: SwipeRepository = Depends(get_repository),
    ) -> SwipeResponse:
        try:
            result = repository.register_pass(user_id=user_id, target_user_id=target_user_id)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
        return SwipeResponse(**result)

    @app.get("/api/matches", response_model=MatchesResponse)
    def matches(
        user_id: str = Depends(get_current_user_id),
        repository: SwipeRepository = Depends(get_repository),
    ) -> MatchesResponse:
        matches_list = repository.list_matches(user_id=user_id)
        return MatchesResponse(user_id=user_id, count=len(matches_list), matches=matches_list)

    app.include_router(auth_router)
    app.include_router(admin_router)
    app.include_router(profile_router)
    app.include_router(events_router)
    app.include_router(chat_router)
    return app


app = create_app()
