from fastapi import FastAPI
from app.schemas.student_state import StudentState
from app.core.memory import ReplayBuffer

app = FastAPI()

# Initialize a global memory buffer
# In a real production app, you might use Redis or a DB for this
memory = ReplayBuffer(capacity=5000)

# File: app/main.py
@app.post("/analyze-brain-state")
async def analyze_state(state: StudentState):
    # Pillar 1: Calculate Knowledge/Retention
    retention_report = {}
    for topic, last_seen in state.last_interaction.items():
        stability = state.retention_strength.get(topic, 0)
        retention_report[topic] = calculate_retention(last_seen, stability)
    
    # Pillar 2-4: Simplified Logic for the Diagnostic Report
    avg_speed = sum(state.response_speed.values()) / len(state.response_speed) if state.response_speed else 0
    
    return {
        "student_id": state.student_id,
        "neuro_scorecard": {
            "knowledge_retention": retention_report,
            "fluency_speed": "High Efficiency" if avg_speed < 15 else "Needs Drills",
            "brain_connectivity": f"{state.connectivity_score * 100}%",
            "resilience_grit": "Strong Recovery" if state.resilience_factor > 0.7 else "Support Needed"
        },
        "stress_level": "Optimal Flow" if state.current_stress_level < 0.7 else "Overloaded"
    }


    from app.core.database import SessionLocal, engine, Base

# Create the database file and tables on startup
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()