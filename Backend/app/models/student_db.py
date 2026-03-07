from sqlalchemy import Column, String, Float, JSON
from app.core.database import Base

class StudentDB(Base):
    __tablename__ = "students"

    student_id = Column(String, primary_key=True, index=True)
    
    # We store the dictionaries as JSON columns
    topic_mastery = Column(JSON)  
    response_speed = Column(JSON)
    connectivity_score = Column(Float)
    resilience_factor = Column(Float)
    current_stress_level = Column(Float)