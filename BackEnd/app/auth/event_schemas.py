from pydantic import BaseModel


class EventCreate(BaseModel):
    title: str
    description: str


class EventUpdate(BaseModel):
    title: str
    description: str


class EventResponse(BaseModel):
    id: int
    title: str
    description: str

    class Config:
        from_attributes = True