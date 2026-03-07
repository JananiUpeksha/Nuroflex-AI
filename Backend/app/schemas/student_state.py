# File: app/schemas/student_state.py
from pydantic import BaseModel
from typing import Dict
from datetime import datetime

class StudentState(BaseModel):
    student_id: str
    
    # Pillar 1: Knowledge (Existing)
    topic_mastery: Dict[str, float]
    
    # Pillar 2: Speed (New) - Average time taken per topic
    response_speed: Dict[str, float]     
    
    # Pillar 3: Connectivity (New) - Score for cross-topic tasks
    connectivity_score: float            
    
    # Pillar 4: Resilience (New) - Rate of recovery after mistakes
    resilience_factor: float             

    current_stress_level: float 
    last_interaction: Dict[str, datetime]
    retention_strength: Dict[str, int]

    class Config:
        arbitrary_types_allowed = True