from app.core.database import SessionLocal, engine, Base
from app.models.student_db import StudentDB

# Ensure tables are created
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    test_student = StudentDB(
        student_id="CS_STUDENT_001",
        topic_mastery={"ML": 0.8, "DevOps": 0.4},
        response_speed={"ML": 12.5, "DevOps": 45.0},
        connectivity_score=0.65,
        resilience_factor=0.8,
        current_stress_level=0.2
    )
    db.add(test_student)
    db.commit()
    print("✅ Student saved to SQLite successfully!")
except Exception as e:
    print(f"❌ Error: {e}")
finally:
    db.close()
