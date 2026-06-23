from pydantic import BaseModel

class BoardCreate(BaseModel):
    name: str
    description: str | None = None


class BoardResponse(BaseModel):
    id: int
    name: str
    description: str | None = None

    class Config:
        from_attributes = True