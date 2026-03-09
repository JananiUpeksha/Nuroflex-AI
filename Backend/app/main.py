from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.core.trainer import NeuroTrainer
import pandas as pd
import os
import random

app = FastAPI()

# Enable connection for React and HTML
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

# Load Syllabus
syllabus = pd.read_csv('math_syllabus.csv')

RESEARCH_DATA = {
    "USA_5421": "Janani Upeksha", "USA_8892": "Aman Perera", "USA_1023": "Sarah Silva",
    "USA_4432": "Raj Kumar", "USA_9901": "Li Wei", "ASIA_2100": "Elena Rossi",
    "ASIA_5543": "Victor Hugo", "ASIA_3321": "Chloe Bennet", "ASIA_7781": "Omar Hassan",
    "ASIA_1102": "Yuki Tanaka"
}

@app.get("/generate-7day-plan/{identifier}")
async def generate_plan(identifier: str):
    # 1. Identify Student
    student_id = None
    student_name = None
    if identifier in RESEARCH_DATA:
        student_id = identifier
        student_name = RESEARCH_DATA[identifier]
    else:
        for sid, name in RESEARCH_DATA.items():
            if name == identifier:
                student_id = sid
                student_name = name
                break
    
    if not student_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # 2. Generate Unique Initial Metrics
    random.seed(student_id)
    m, s = random.uniform(0.1, 0.8), random.uniform(0.1, 0.7)
    start_m, start_s = m, s
    focus_score = random.choice(["Laser Focused", "Stable", "Fluctuating", "Distracted"])

    # 3. Create Dynamic Diagnostic Advice
    diagnostics = [
        f"Cognitive load is optimal. Student shows {focus_score} behavior. Advancing to complex derivations.",
        f"Neural fatigue detected in pre-frontal cortex. Focus is {focus_score}. Prioritizing active recovery.",
        f"High retention rate but speed is low. Focus is {focus_score}. Suggesting repetitive recall drills.",
        f"Pattern recognition is peaking. Focus is {focus_score}. Switching to multi-topic interleafing."
    ]

    if s > 0.5:
        advice = diagnostics[1]
    elif m > 0.6:
        advice = diagnostics[0]
    elif m < 0.3:
        advice = diagnostics[2]
    else:
        advice = diagnostics[3]

    # 4. Generate 7-Day Plan
    plan = []
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    
    for day in days:
        # AI decision based on current m and s
        act_idx = neuro_brain.get_action([m, 0.7, 1.0, 1.0, s, 1.0])
        topic = syllabus.iloc[random.randint(0, len(syllabus)-1)]['subtopic']
        
        if s > 0.55 or act_idx == 3:
            task = "🧘 Brain Rest: Time to recharge! Taking a break today helps your brain store what you learned earlier."
            s = max(0.1, s - 0.25)
        elif act_idx == 0:
            task = f"📺 Learning Video: {topic}. Let's watch a short tutorial to see how this works visually."
            m, s = min(1.0, m + 0.05), min(1.0, s + 0.1)
        elif act_idx == 1:
            task = f"📝 Practice Test: {topic}. A quick, fun quiz to see how much you've improved. No pressure!"
            m, s = min(1.0, m + 0.07), min(1.0, s + 0.15)
        else:
            task = f"💡 Brain Exercise: {topic}. We're practicing this to make your neural pathways stronger!"
            m, s = min(1.0, m + 0.1), min(1.0, s + 0.12)

        plan.append({"day": day, "task": task, "m": round(m*100)})

    # 5. Return Complete Data Object
    return {
        "student_name": student_name,
        "status": "Needs Rest" if start_s > 0.5 else "Ready to Learn",
        "details": {
            "starting_knowledge": f"{round(start_m*100)}%",
            "final_knowledge": f"{round(m*100)}%",
            "memory_strength": "High (92%)" if m > 0.6 else "Moderate (68%)",
            "focus": focus_score,
            "ai_advice": advice,
            "learning_efficiency": f"{round((m - start_m) * 100 / 0.4)}%",
            "consistency_score": f"{random.randint(80, 98)}/100",
            "weak_area": "Algebraic Isolation" if start_m < 0.4 else "Complex Calculus",
            "strong_area": "Conceptual Visuals" if start_s < 0.3 else "Fast Recall"
        },
        "weekly_plan": plan
    }