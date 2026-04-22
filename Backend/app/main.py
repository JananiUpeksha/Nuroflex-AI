"""
app/main.py  —  FastAPI routes only.
All AI logic lives in app/services/ai_service.py
All YouTube logic lives in app/services/discovery.py
"""

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import os, random
from datetime import date
from threading import Lock

from app.core.database import engine, Base, get_db
from app.core.trainer import NeuroTrainer
from app.core.environment import StudyEnvironment
from app.core.dao import StudentDAO
from app.models.student_db import StudentDB
from app.services.discovery import ContentDiscovery
from app.services.ai_service import generate_quiz, generate_weekly_quiz, chat_with_tutor

# ── App setup ──────────────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

trainer          = NeuroTrainer()
discovery_service = ContentDiscovery()
env              = StudyEnvironment()

# ── YouTube Quota Guard ────────────────────────────────────────────────────────
MAX_DAILY_FETCHES = 150
_yt_quota: dict   = {"count": 0, "reset_date": date.today()}
_yt_quota_lock    = Lock()

def _yt_quota_available() -> bool:
    with _yt_quota_lock:
        today = date.today()
        if _yt_quota["reset_date"] != today:
            _yt_quota["count"]      = 0
            _yt_quota["reset_date"] = today
        if _yt_quota["count"] >= MAX_DAILY_FETCHES:
            return False
        _yt_quota["count"] += 1
        return True

# ── YouTube Learning-Stack Cache ───────────────────────────────────────────────
_stack_cache: dict[str, list] = {}
_stack_cache_lock = Lock()

def get_learning_stack(topic: str) -> list:
    with _stack_cache_lock:
        if topic in _stack_cache:
            return _stack_cache[topic]
    if not _yt_quota_available():
        print(f"[yt-quota] Daily limit reached, skipping '{topic}'")
        return []
    try:
        stack = discovery_service.fetch_learning_stack(topic)
    except Exception as exc:
        print(f"[youtube] fetch failed for '{topic}': {exc}")
        stack = []
    with _stack_cache_lock:
        _stack_cache[topic] = stack
    return stack

# ── Constants ──────────────────────────────────────────────────────────────────
AUTHORIZED_STUDENTS = [
    "Janani Upeksha", "Aman Perera", "Sarah Silva", "Raj Kumar",
    "Li Wei", "Elena Rossi", "Victor Hugo", "Chloe Bennet",
    "Omar Hassan", "Yuki Tanaka",
]

TOPIC_POOL = [
    "Polynomials", "Chain Rule", "Integration by Parts",
    "Matrix Multiplication", "Probability",
]

DAYS       = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
ACTIVITIES = ["Watch Video", "Take Quiz", "Active Recall", "Take a Break"]

# ── Plan helpers ───────────────────────────────────────────────────────────────
def get_detailed_mission(topic: str, t_type: str) -> str:
    descriptions = {
        "Video":    f"Visualizing {topic}: Explore core geometry and logic. Watch how these functions behave in real-time space.",
        "Quiz":     f"{topic} Instinct: Speed is key. Solve these drills to turn theoretical knowledge into a neural reflex.",
        "Exercise": f"{topic} Deep Dive: Bridge theory to engineering. Solve problems requiring multi-step logic.",
        "Rest":     "Neural Consolidation: Your brain is re-wiring. Step away to allow the synaptic connections to solidify.",
    }
    return descriptions.get(t_type, f"Advanced neural reinforcement for {topic}.")

def _activity_to_type(activity: str) -> str:
    if "Video"  in activity: return "Video"
    if "Quiz"   in activity: return "Quiz"
    if "Recall" in activity: return "Exercise"
    return "Rest"

def _to_array(plan_dict: dict) -> list:
    result = []
    for day, details in plan_dict.items():
        activity     = details.get("activity", "")
        t_type       = _activity_to_type(activity)
        topic        = details.get("topic", day)
        stored_stack = details.get("learning_stack")
        if stored_stack is None and t_type != "Rest":
            stored_stack = get_learning_stack(topic)
        result.append({
            "day":            day,
            "task_title":     topic,
            "raw_topic":      topic,
            "type":           t_type,
            "instruction":    get_detailed_mission(topic, t_type),
            "learning_stack": stored_stack or [],
            "youtube_id":     "5qap5aO4i9A" if t_type == "Rest" else None,
            "resource_link":  "https://en.wikipedia.org/wiki/Mathematics",
        })
    return result

def _build_plan(state, topics: list[str]) -> dict:
    unique_topics = set(t for t in topics if t)
    stacks = {topic: get_learning_stack(topic) for topic in unique_topics}
    plan: dict = {}
    for i, day in enumerate(DAYS):
        topic    = topics[i]
        activity = ACTIVITIES[trainer.get_action(state, False)]
        t_type   = _activity_to_type(activity)
        plan[day] = {
            "topic":          topic,
            "activity":       activity,
            "learning_stack": stacks.get(topic, []) if t_type != "Rest" else [],
        }
    return plan

# ── Startup ────────────────────────────────────────────────────────────────────
@app.on_event("startup")
def seed_database():
    db = next(get_db())
    for name in AUTHORIZED_STUDENTS:
        if not StudentDAO.get_student(db, name):
            db.add(StudentDB(
                student_id=name,
                topic_mastery={t: 0.5 for t in TOPIC_POOL},
                response_speed={t: 0.5 for t in TOPIC_POOL},
                connectivity_score=0.9,
                resilience_factor=0.8,
                current_stress_level=0.2,
                study_plan=None,
            ))
    db.commit()

# ── Study Plan Routes ──────────────────────────────────────────────────────────
@app.get("/generate-7day-plan/{student_id}")
async def generate_plan(student_id: str, db: Session = Depends(get_db)):
    student = StudentDAO.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if student.study_plan:
        return {"weekly_plan": _to_array(student.study_plan)}
    state  = StudentDAO.get_student_state_vector(db, student_id)
    topics = random.sample(TOPIC_POOL, 5) + random.sample(TOPIC_POOL, 2)
    plan   = _build_plan(state, topics)
    StudentDAO.save_study_plan(db, student_id, plan)
    return {"weekly_plan": _to_array(plan)}


@app.get("/student-report/{student_id}")
async def get_student_report(student_id: str, db: Session = Depends(get_db)):
    student = StudentDAO.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return {
        "status": "Optimal State",
        "details": {
            "ai_advice":           "Neural growth detected.",
            "learning_efficiency": "85%",
            "focus":               "90%",
            "consistency_score":   "95%",
            "memory_strength":     "80%",
            "strong_area":         "Logic",
            "weak_area":           "Speed",
        },
    }

# ── AI Routes ──────────────────────────────────────────────────────────────────

@app.get("/quiz/{topic}")
async def get_quiz(topic: str):
    """Generate 5 MCQ questions for a single topic."""
    try:
        questions = await generate_quiz(topic)
        return {"questions": questions}
    except ValueError:
        raise HTTPException(status_code=429, detail="Rate limit reached — please wait a moment")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class WeeklyQuizRequest(BaseModel):
    topics: list[str]

@app.post("/quiz/weekly")
async def get_weekly_quiz(req: WeeklyQuizRequest):
    """Generate 5 questions per topic, merged and shuffled."""
    if not req.topics:
        raise HTTPException(status_code=400, detail="No topics provided")
    try:
        questions = await generate_weekly_quiz(req.topics)
        return {"questions": questions}
    except ValueError:
        raise HTTPException(status_code=429, detail="Rate limit reached — please wait a moment")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class ChatRequest(BaseModel):
    topic:   str
    history: list[dict]   # [{"role": "user"|"ai", "text": "..."}]
    message: str

@app.post("/chat")
async def chat(req: ChatRequest):
    """Continue a tutoring conversation for a topic."""
    try:
        reply = await chat_with_tutor(req.topic, req.history, req.message)
        return {"reply": reply}
    except ValueError:
        raise HTTPException(status_code=429, detail="Rate limit reached — please wait a moment")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))