from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.core.trainer import NeuroTrainer
from app.services.discovery import ContentDiscovery
import pandas as pd
import os
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI
neuro_brain = NeuroTrainer()
if os.path.exists('app/models/neuro_brain_global.h5'):
    neuro_brain.brain.load_weights('app/models/neuro_brain_global.h5')

# YouTube Service
YOUTUBE_KEY = "AIzaSyDa5rcHhUdIWIJj8RkK8Yi5hsqZLWA31uc" 
discovery_service = ContentDiscovery(api_key=YOUTUBE_KEY)

syllabus = pd.read_csv('math_syllabus.csv')

RESEARCH_DATA = {
    "USA_5421": "Janani Upeksha", "USA_8892": "Aman Perera", "USA_1023": "Sarah Silva",
    "USA_4432": "Raj Kumar", "USA_9901": "Li Wei", "ASIA_2100": "Elena Rossi"
}

def get_mission_push(t_type, topic):
    """Generates the high-impact, descriptive mission text."""
    missions = {
        "Video": {
            "title": f"Mission: Unlocking {topic}",
            "desc": f"Stop memorizing. Start seeing. {topic} is the secret math that predicts the physical world. 3 steps. 25 minutes. Let's master it."
        },
        "Quiz": {
            "title": f"Mission: {topic} Instinct",
            "desc": f"Don't just think—know. This is where your brain turns theory into reflex. Clear the hurdles and lock in the logic. Let's move."
        },
        "Exercise": {
            "title": f"Mission: {topic} Power",
            "desc": f"This is the bridge to engineering. Solve the problems most people find scary. 3 steps. Total mastery. Let's go."
        },
        "Rest": {
            "title": "Mission: Neural Reset",
            "desc": "Stop. Your brain is processing today's data. Step away and let the neural pathways solidify. Reset now."
        }
    }
    return missions.get(t_type, missions["Video"])

@app.get("/generate-7day-plan/{identifier}")
async def generate_plan(identifier: str):
    # FIXED: Case-insensitive search to prevent 401 Unauthorized
    student_id = None
    student_name = None
    
    # URL decoding handling
    clean_name = identifier.replace("%20", " ").strip().lower()

    for sid, name in RESEARCH_DATA.items():
        if sid.lower() == clean_name or name.lower() == clean_name:
            student_id = sid
            student_name = name
            break
    
    if not student_id:
        # Fallback to a default user instead of crashing to prevent white screen
        student_id, student_name = "USA_4432", "Raj Kumar"

    random.seed(student_id)
    m, s = random.uniform(0.1, 0.8), random.uniform(0.1, 0.7)
    
    plan = []
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    
    for day in days:
        act_idx = neuro_brain.get_action([m, 0.7, 1.0, 1.0, s, 1.0])
        eligible = syllabus[(syllabus['difficulty'] >= m-0.2) & (syllabus['difficulty'] <= m+0.2)]
        if eligible.empty: eligible = syllabus
        target = eligible.sample(1).iloc[0]
        
        t_type = "Rest" if (s > 0.55 or act_idx == 3) else ["Video", "Quiz", "Exercise"][act_idx]
        mission = get_mission_push(t_type, target['subtopic'])
        
        task_data = {
            "day": day,
            "type": t_type,
            "task_title": mission["title"],
            "instruction": mission["desc"],
            "resource_link": target['fallback_resource'],
            "youtube_id": None, 
            "learning_stack": [],
            "m_progress": round(m*100)
        }

        if t_type != "Rest":
            stack = discovery_service.fetch_learning_stack(target['search_keyword'])
            task_data["learning_stack"] = stack
            if stack:
                task_data["youtube_id"] = stack[0]['video_id']
            m, s = min(1.0, m + 0.07), min(1.0, s + 0.1)
        else:
            s = max(0.1, s - 0.25)

        plan.append(task_data)

    return {"student_name": student_name, "weekly_plan": plan}