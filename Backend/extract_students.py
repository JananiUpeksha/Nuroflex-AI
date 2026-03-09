import pandas as pd
import numpy as np
from app.core.database import SessionLocal, engine, Base
from app.models.student_db import StudentDB

# 1. Load Data (Adjust filenames if they differ slightly)
usa_df = pd.read_csv('44732737_skill_builder_data.csv', low_memory=False).head(1000)
asia_df = pd.read_csv('Info_UserData.csv').head(1000)

db = SessionLocal()
Base.metadata.create_all(bind=engine)

def save_student(sid, mastery, speed, stress, resilience):
    student = StudentDB(
        student_id=str(sid),
        topic_mastery={"Math": mastery},
        response_speed={"Math": speed},
        connectivity_score=round(np.random.uniform(0.5, 0.9), 2),
        resilience_factor=resilience,
        current_stress_level=stress
    )
    db.merge(student) # merge prevents duplicates

# Extract 5 USA Students
for sid in usa_df['user_id'].unique()[:5]:
    sub = usa_df[usa_df['user_id'] == sid]
    save_student(f"USA_{sid}", sub['correct'].mean(), 0.5, 0.3, 0.7)

# Extract 5 Asian Students
for sid in asia_df['user_id'].unique()[:5]:
    sub = asia_df[asia_df['user_id'] == sid]
    save_student(f"ASIA_{sid}", (sub['points'].mean()/50000), 0.6, 0.2, 0.8)

db.commit()
db.close()
print("✅ 10 Students successfully extracted from datasets into NeuroFlex DB!")
