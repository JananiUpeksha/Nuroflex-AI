"""
app/models/student_db.py

FIX: Added retention_score column.
Without it, the DAO always defaulted retention to 1.0 because it had
nowhere to read/write it from the database.
"""
from sqlalchemy import Column, String, Float, JSON
from app.core.database import Base


class StudentDB(Base):
    __tablename__ = "students"

    student_id           = Column(String, primary_key=True, index=True)
    topic_mastery        = Column(JSON)
    response_speed       = Column(JSON)
    connectivity_score   = Column(Float)
    resilience_factor    = Column(Float)
    current_stress_level = Column(Float)
    retention_score      = Column(Float, nullable=True, default=0.7)  # NEW
    study_plan           = Column(JSON,  nullable=True)