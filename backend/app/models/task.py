from sqlalchemy import Column, Integer, String
from backend.app.db.database import Base

#creating a new PostgreSQL table called "tasks" with the following columns:
# id: An integer that serves as the primary key for the table.

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    status = Column(String, default="todo")
    board_id = Column(Integer)