from sqlalchemy.orm import Session
from app.auth.models import User, Event


class PostgreSQLRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def get_user_by_id(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def create_user(self, name: str, email: str, password_hash: str) -> User:
        user = User(name=name, email=email, password_hash=password_hash, role="USER")
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_all_events(self) -> list[Event]:
        return self.db.query(Event).order_by(Event.id.desc()).all()

    def get_event_by_id(self, event_id: int) -> Event | None:
        return self.db.query(Event).filter(Event.id == event_id).first()

    def create_event(self, title: str, description: str = "", location: str = "",
                     event_date: str = None, tags: str = "", status: str = "Publicado") -> Event:
        event = Event(
            title=title,
            description=description,
            location=location,
            event_date=event_date,
            tags=tags,
            status=status,
        )
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def save_changes(self):
        self.db.commit()

    def delete_event(self, event: Event):
        self.db.delete(event)
        self.db.commit()
