from sqlalchemy import Column, String, Float, JSON
from app.core.database import Base


class StudentDB(Base):
    __tablename__ = "students"

    student_id = Column(String, primary_key=True, index=True)

    # Pillar data stored as JSON dictionaries
    topic_mastery = Column(JSON)
    response_speed = Column(JSON)
    connectivity_score = Column(Float)
    resilience_factor = Column(Float)
    current_stress_level = Column(Float)

    # ✅ FIX: Store the generated study plan so it never changes on refresh
    # Once generated for a student, this is returned as-is every time
    study_plan = Column(JSON, nullable=True)