from sqlalchemy import Column, Integer, String
from app.core.database import Base


class SyllabusDB(Base):
    __tablename__ = "syllabus"

    id          = Column(Integer, primary_key=True, autoincrement=True)
    skill_name  = Column(String, nullable=False)
    category    = Column(String)
    region      = Column(String)
    difficulty  = Column(String)
    best_action = Column(String)