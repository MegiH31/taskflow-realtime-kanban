from sqlalchemy import Column, Integer, String
from backend.app.db.database import Base


class Board(Base):
    __tablename__ = "boards"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(String)