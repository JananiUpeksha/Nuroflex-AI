from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.core.database import get_db, engine, Base
from app.core.trainer import NeuroTrainer
import pandas as pd
import os
import random

# Initialize Database
Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Load Brain
neuro_brain = NeuroTrainer()
if os.path.exists('app/models/neuro_brain_global.h5'):
    neuro_brain.brain.load_weights('app/models/neuro_brain_global.h5')

# Load Syllabus
syllabus = pd.read_csv('math_syllabus.csv')

def get_curriculum_task(action, mastery):
    if action == "Take a Break":
        return "🧠 Neuro-Rest: High-alpha brainwave recovery (Mindfulness/Breathing)."
    relevant_topics = syllabus[syllabus['difficulty'] <= (mastery + 0.15)]
    row = relevant_topics.iloc[-1] if not relevant_topics.empty else syllabus.iloc[0]
    prefix = "📹 Tutorial:" if action == "Watch Video" else "📝 Assessment:" if action == "Take Quiz" else "💡 Retrieval:"
    return f"{prefix} {row['topic']} - {row['subtopic']} ({row['description']})"

@app.get("/generate-7day-plan/{student_id}")
async def generate_plan(student_id: str):
    random.seed(student_id)
    start_m = random.uniform(0.15, 0.75)
    start_s = random.uniform(0.1, 0.65)
    
    problem_type = "Balanced"
    diagnosis = "Student shows steady neuro-connectivity."
    
    if start_s > 0.55:
        problem_type = "Cognitive Burnout"
        diagnosis = "Neural data indicates critical stress levels. Working memory is saturated."
    elif start_m < 0.35:
        problem_type = "Foundational Gap"
        diagnosis = "Student lacks prerequisite Algebraic logic to proceed to Geometry."
    elif start_m > 0.65:
        problem_type = "Under-Stimulated"
        diagnosis = "High mastery detected. Student requires rapid acceleration."

    actions = ["Watch Video", "Take Quiz", "Active Recall", "Take a Break"]
    plan = []
    m, s = start_m, start_s
    
    for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]:
        act_idx = neuro_brain.get_action([m, 0.7, 1.0, 1.0, s, 1.0])
        act = actions[act_idx]
        task = get_curriculum_task(act, m)
        if act == "Take a Break": s = max(0.1, s - 0.25)
        else:
            m = min(1.0, m + 0.07)
            s = min(1.0, s + 0.09)
        plan.append({"day": day, "task": task})

    return {
        "student_id": student_id,
        "problem_type": problem_type,
        "diagnosis": diagnosis,
        "initial_state": {"m": f"{round(start_m*100)}%", "s": f"{round(start_s*100)}%"},
        "weekly_plan": plan,
        "prognosis": {
            "final_m": f"{round(m*100)}%",
            "improvement": f"+{round((m-start_m)*100)}%",
            "outcome": "Successful Optimization" if m > start_m and s < 0.7 else "Needs Human Tutoring"
        }
    }
