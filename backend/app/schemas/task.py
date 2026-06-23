from pydantic import BaseModel

#what client sends when creating a new task
class TaskCreate(BaseModel):
    title: str
    description: str
    status: str
    board_id: int

#what API returns when client requests task data
class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    status: str
    board_id: int

class Config:
        from_attributes = True