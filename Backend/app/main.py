"""
app/main.py
"""
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import os, random
from datetime import date
from threading import Lock

from app.core.database       import engine, Base, get_db
from app.core.trainer        import NeuroTrainer
from app.core.environment    import StudyEnvironment
from app.core.dao            import StudentDAO
from app.models.student_db   import StudentDB
from app.services.discovery  import ContentDiscovery
from app.services.ai_service import generate_quiz, generate_weekly_quiz, chat_with_tutor

MODEL_PATH = "app/models/neuro_brain_global.h5"
trainer    = NeuroTrainer()

if os.path.exists(MODEL_PATH):
    trainer.brain.load_weights(MODEL_PATH)
    print("Trained model loaded from " + MODEL_PATH)
else:
    print("WARNING: No trained model found.")

Base.metadata.create_all(bind=engine)
app = FastAPI(title="NeuroFlex API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

discovery_service = ContentDiscovery()
env               = StudyEnvironment()

MAX_DAILY_FETCHES = 150
_yt_quota         = {"count": 0, "reset_date": date.today()}
_yt_quota_lock    = Lock()

def _yt_quota_available():
    with _yt_quota_lock:
        today = date.today()
        if _yt_quota["reset_date"] != today:
            _yt_quota["count"]      = 0
            _yt_quota["reset_date"] = today
        if _yt_quota["count"] >= MAX_DAILY_FETCHES:
            return False
        _yt_quota["count"] += 1
        return True

_stack_cache      = {}
_stack_cache_lock = Lock()

def get_learning_stack(topic):
    with _stack_cache_lock:
        if topic in _stack_cache:
            return _stack_cache[topic]
    if not _yt_quota_available():
        return []
    try:
        stack = discovery_service.fetch_learning_stack(topic)
    except Exception as exc:
        stack = []
    with _stack_cache_lock:
        _stack_cache[topic] = stack
    return stack

AUTHORIZED_STUDENTS = [
    "Janani Upeksha", "Aman Perera", "Sarah Silva", "Raj Kumar",
    "Li Wei",         "Elena Rossi", "Victor Hugo", "Chloe Bennet",
    "Omar Hassan",    "Yuki Tanaka", 
]

TOPIC_POOL = [
    "Polynomials", "Chain Rule", "Integration by Parts",
    "Matrix Multiplication", "Probability",
]

DAYS    = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
ACTIONS = ["Watch Video", "Take Quiz", "Active Recall", "Take a Break"]

def get_detailed_mission(topic, t_type):
    descriptions = {
        "Video":    f"Visualizing {topic}: Explore core geometry and logic.",
        "Quiz":     f"{topic} Instinct: Speed is key. Solve these drills.",
        "Exercise": f"{topic} Deep Dive: Bridge theory to engineering.",
        "Rest":     "Neural Consolidation: Step away to allow synaptic connections to solidify.",
    }
    return descriptions.get(t_type, f"Advanced neural reinforcement for {topic}.")

def _activity_to_type(activity):
    if "Video"  in activity: return "Video"
    if "Quiz"   in activity: return "Quiz"
    if "Recall" in activity: return "Exercise"
    return "Rest"

def _to_array(plan_dict):
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
    unique_topics = {t for t in topics if t}
    stacks = {t: get_learning_stack(t) for t in unique_topics}
    plan = {}
    current_state = state.copy()
    for i, day in enumerate(DAYS):
        topic    = topics[i]
        action   = trainer.get_action(current_state, training=False)
        activity = ACTIONS[action]
        t_type   = _activity_to_type(activity)
        current_state = env.step(current_state, action)
        plan[day] = {"topic": topic, "activity": activity, "learning_stack": stacks.get(topic, []) if t_type != "Rest" else []}
    return plan

@app.on_event("startup")
def seed_database():
    db = next(get_db())
    for name in AUTHORIZED_STUDENTS:
        if not StudentDAO.get_student(db, name):
            db.add(StudentDB(
                student_id           = name,
                topic_mastery        = {t: 0.5 for t in TOPIC_POOL},
                response_speed       = {t: 0.5 for t in TOPIC_POOL},
                connectivity_score   = 0.7,
                resilience_factor    = 0.7,
                current_stress_level = 0.3,
                retention_score      = 0.7,
                study_plan           = None,
            ))
    db.commit()

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

    mastery_values = list(student.topic_mastery.values())  if student.topic_mastery  else [0.5]
    speed_values   = list(student.response_speed.values()) if student.response_speed else [0.5]
    avg_mastery    = round(sum(mastery_values) / len(mastery_values), 2)
    avg_speed      = round(sum(speed_values)   / len(speed_values),   2)
    stress         = round(student.current_stress_level or 0.3, 2)
    resilience     = round(student.resilience_factor    or 0.7, 2)
    connectivity   = round(student.connectivity_score   or 0.7, 2)
    retention      = round(student.retention_score      or 0.7, 2)

    topic_mastery = {k: round(v * 100) for k, v in (student.topic_mastery or {}).items()}
    topic_speed   = {k: round(v * 100) for k, v in (student.response_speed or {}).items()}

    # Strong and weak topics
    if student.topic_mastery:
        strong_topic = max(student.topic_mastery, key=student.topic_mastery.get)
        weak_topic   = min(student.topic_mastery, key=student.topic_mastery.get)
        strong_pct   = round(student.topic_mastery[strong_topic] * 100)
        weak_pct     = round(student.topic_mastery[weak_topic]   * 100)
    else:
        strong_topic = weak_topic = "N/A"
        strong_pct   = weak_pct   = 0

    # Status
    if stress > 0.75:
        status = "High Stress — Needs Support"
    elif avg_mastery >= 0.80:
        status = "High Performer"
    elif avg_mastery < 0.40:
        status = "Needs Attention"
    else:
        status = "On Track"

    # Dynamic AI advice based on actual student data
    advice_parts = []
    if stress > 0.75:
        advice_parts.append(f"Student is under high cognitive load ({round(stress*100)}% stress). Immediate intervention needed — reduce workload and prescribe rest.")
    elif stress > 0.55:
        advice_parts.append(f"Stress is elevated at {round(stress*100)}%. Monitor closely and avoid adding new topics this week.")

    if avg_mastery >= 0.80:
        advice_parts.append(f"Excellent mastery across all topics ({round(avg_mastery*100)}%). Ready for advanced challenge problems.")
    elif avg_mastery >= 0.60:
        advice_parts.append(f"Solid mastery at {round(avg_mastery*100)}%. Focus on converting passive knowledge to active recall skills.")
    elif avg_mastery >= 0.40:
        advice_parts.append(f"Moderate mastery at {round(avg_mastery*100)}%. Needs consistent daily practice, especially in {weak_topic}.")
    else:
        advice_parts.append(f"Low mastery at {round(avg_mastery*100)}%. Start with foundational videos and avoid quizzes until confidence builds.")

    if avg_speed < 0.40:
        advice_parts.append(f"Response speed is slow ({round(avg_speed*100)}%). Assign timed daily drills to build fluency.")
    elif avg_speed >= 0.80:
        advice_parts.append(f"Response speed is excellent ({round(avg_speed*100)}%).")

    if resilience < 0.50:
        advice_parts.append(f"Resilience is low ({round(resilience*100)}%) — student struggles after mistakes. Positive reinforcement and retry culture are essential.")

    advice = " ".join(advice_parts) if advice_parts else "Student is progressing steadily. Continue current plan."

    # Dynamic action plan
    actions = []
    if stress > 0.75:
        actions.append(f"URGENT: Reduce assignment load immediately — stress at {round(stress*100)}%. Prescribe 2-3 rest days this week.")
    if weak_pct < 50:
        actions.append(f"Schedule focused sessions on {weak_topic} ({weak_pct}% mastery) — this is the biggest gap to close.")
    if avg_speed < 0.45:
        actions.append(f"Assign 10-minute daily speed drills — response time is only {round(avg_speed*100)}% of optimal.")
    if resilience < 0.50:
        actions.append(f"Implement a retry policy — resilience score is {round(resilience*100)}%. Celebrate attempts, not just correct answers.")
    if connectivity < 0.55:
        actions.append(f"Introduce cross-topic problems — connectivity score is low ({round(connectivity*100)}%). Student is learning topics in isolation.")
    if retention < 0.55:
        actions.append(f"Add spaced repetition for {weak_topic} and {strong_topic} — retention at {round(retention*100)}% means concepts are fading.")
    if strong_pct >= 80 and avg_mastery >= 0.70:
        actions.append(f"Student excels at {strong_topic} ({strong_pct}%). Use this as a confidence anchor — introduce harder variants of this topic.")
    if not actions:
        actions.append(f"Student is performing well overall. Consider peer tutoring or advanced challenges in {strong_topic} to maintain momentum.")

    # Study plan summary
    plan      = student.study_plan or {}
    rest_days  = sum(1 for d in plan.values() if "Break" in d.get("activity", ""))
    study_days = len(plan) - rest_days

    return {
        "status": status,
        "details": {
            "ai_advice":           advice,
            "learning_efficiency": f"{round(avg_mastery * 100)}%",
            "focus":               f"{round(avg_speed * 100)}%",
            "consistency_score":   f"{round(connectivity * 100)}%",
            "memory_strength":     f"{round(retention * 100)}%",
            "resilience":          f"{round(resilience * 100)}%",
            "stress_level":        f"{round(stress * 100)}%",
            "strong_area":         strong_topic,
            "weak_area":           weak_topic,
            "strong_pct":          strong_pct,
            "weak_pct":            weak_pct,
            "topic_mastery":       topic_mastery,
            "topic_speed":         topic_speed,
            "study_days":          study_days,
            "rest_days":           rest_days,
            "action_plan":         actions,
            "avg_mastery":         avg_mastery,
            "avg_speed":           avg_speed,
            "stress":              stress,
            "resilience_raw":      resilience,
        },
    }

@app.get("/recommend-action/{student_id}")
async def recommend_action(student_id: str, db: Session = Depends(get_db)):
    state = StudentDAO.get_student_state_vector(db, student_id)
    if state is None:
        raise HTTPException(status_code=404, detail="Student not found")
    action_idx = trainer.get_action(state, training=False)
    return {"student_id": student_id, "recommended_action": ACTIONS[action_idx]}

class StateUpdateRequest(BaseModel):
    mastery_delta: float = 0.0
    stress_delta:  float = 0.0

@app.post("/update-state/{student_id}")
async def update_state(student_id: str, req: StateUpdateRequest, db: Session = Depends(get_db)):
    student = StudentDAO.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    StudentDAO.update_student_state(db, student_id, mastery_delta=req.mastery_delta, stress_delta=req.stress_delta)
    return {"status": "updated", "student_id": student_id}

@app.get("/quiz/{topic}")
async def get_quiz(topic: str):
    try:
        return {"questions": await generate_quiz(topic)}
    except ValueError:
        raise HTTPException(status_code=429, detail="Rate limit reached")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class WeeklyQuizRequest(BaseModel):
    topics: list[str]

@app.post("/quiz/weekly")
async def get_weekly_quiz(req: WeeklyQuizRequest):
    if not req.topics:
        raise HTTPException(status_code=400, detail="No topics provided")
    try:
        return {"questions": await generate_weekly_quiz(req.topics)}
    except ValueError:
        raise HTTPException(status_code=429, detail="Rate limit reached")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ChatRequest(BaseModel):
    topic:   str
    history: list[dict]
    message: str

@app.post("/chat")
async def chat(req: ChatRequest):
    try:
        return {"reply": await chat_with_tutor(req.topic, req.history, req.message)}
    except ValueError:
        raise HTTPException(status_code=429, detail="Rate limit reached")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
