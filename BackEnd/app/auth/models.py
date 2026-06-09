from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime
from sqlalchemy.sql import func
from datetime import datetime
from .database import Base


class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False)

    password_hash = Column(String, nullable=False)

    role = Column(String, default="USER")

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

from sqlalchemy import String, Text, Date, Time

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)
    event_date = Column(Date, nullable=False)
    event_time = Column(Time, nullable=False)
    location = Column(String(200), nullable=False)
    banner_url = Column(Text)
    description = Column(Text)
    expected_attendance = Column(Integer, default=0)
    max_capacity = Column(Integer, default=0)
    publish_state = Column(String(20), default="Borrador")
    created_at = Column(DateTime, server_default=func.now())
    