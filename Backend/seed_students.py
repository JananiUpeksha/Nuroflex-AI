"""
seed_students.py  —  Seed the NeuroFlex DB with realistic student profiles.
"""
import argparse
import numpy as np
import pandas as pd
from app.core.database  import SessionLocal, engine, Base
from app.models.student_db import StudentDB

NAMED_PROFILES = {
    "Janani Upeksha": [0.75, 0.70, 0.80, 0.85, 0.20, 0.80],
    "Aman Perera":    [0.55, 0.60, 0.65, 0.70, 0.35, 0.65],
    "Sarah Silva":    [0.85, 0.80, 0.90, 0.90, 0.15, 0.90],
    "Raj Kumar":      [0.40, 0.35, 0.50, 0.55, 0.65, 0.50],
    "Li Wei":         [0.90, 0.85, 0.95, 0.80, 0.10, 0.92],
    "Elena Rossi":    [0.60, 0.55, 0.70, 0.75, 0.40, 0.70],
    "Victor Hugo":    [0.30, 0.25, 0.45, 0.40, 0.80, 0.40],
    "Chloe Bennet":   [0.70, 0.75, 0.75, 0.80, 0.25, 0.75],
    "Omar Hassan":    [0.50, 0.50, 0.60, 0.65, 0.45, 0.60],
    "Yuki Tanaka":    [0.80, 0.78, 0.85, 0.88, 0.18, 0.85],
}

TOPIC_POOL = [
    "Polynomials", "Chain Rule", "Integration by Parts",
    "Matrix Multiplication", "Probability",
]

def _noise(arr, scale=0.05):
    noisy = np.clip(np.array(arr, dtype=np.float32) + np.random.uniform(-scale, scale, len(arr)), 0.0, 1.0)
    return noisy.tolist()

def _make_topic_dict(base_val, topics=TOPIC_POOL, noise_scale=0.08):
    return {
        t: round(float(np.clip(base_val + np.random.uniform(-noise_scale, noise_scale), 0.0, 1.0)), 3)
        for t in topics
    }

def save_named_students(db):
    print("Seeding named students...")
    for name, profile in NAMED_PROFILES.items():
        p = _noise(profile, scale=0.03)
        mastery, speed, connectivity, resilience, stress, retention = p
        student = StudentDB(
            student_id           = name,
            topic_mastery        = _make_topic_dict(mastery),
            response_speed       = _make_topic_dict(speed, noise_scale=0.05),
            connectivity_score   = round(float(connectivity), 3),
            resilience_factor    = round(float(resilience), 3),
            current_stress_level = round(float(stress), 3),
            retention_score      = round(float(retention), 3),
            study_plan           = None,
        )
        db.merge(student)
        print(f"  {name:<20} mastery={mastery:.2f}  stress={stress:.2f}")

def save_dataset_students(db, max_usa=5, max_asia=5):
    import os
    usa_files = ["44732737_skill_builder_data.csv", "44736253_skill_builder_data.csv"]
    usa_frames = [pd.read_csv(f, low_memory=False, encoding="latin-1").head(2000) for f in usa_files if os.path.exists(f)]
    if usa_frames:
        print("\nSeeding USA students...")
        usa_df = pd.concat(usa_frames, ignore_index=True)
        speed_ceil   = float(usa_df["ms_first_response"].clip(lower=0).quantile(0.95)) or 1.0
        hint_ceil    = float(usa_df["hint_count"].max()) or 1.0
        total_skills = usa_df["skill_id"].nunique() or 1
        count = 0
        for uid, grp in usa_df.groupby("user_id"):
            if count >= max_usa:
                break
            sid        = f"USA_{uid}"
            mastery    = float(grp["correct"].mean())
            speed      = float(np.clip(1.0 - grp["ms_first_response"].clip(lower=0).median() / speed_ceil, 0.0, 1.0))
            connectivity = float(np.clip(grp["skill_id"].nunique() / total_skills, 0.0, 1.0))
            resilience = float(np.clip(1.0 - (grp["attempt_count"].mean() - 1.0) / 5.0, 0.0, 1.0))
            stress     = float(np.clip(grp["hint_count"].mean() / hint_ceil, 0.0, 1.0))
            opp        = grp["opportunity"].clip(lower=1)
            retention  = float(np.clip((grp["correct"] * opp).sum() / opp.sum(), 0.0, 1.0))
            student = StudentDB(
                student_id=sid, topic_mastery=_make_topic_dict(mastery),
                response_speed=_make_topic_dict(speed), connectivity_score=round(connectivity,3),
                resilience_factor=round(resilience,3), current_stress_level=round(stress,3),
                retention_score=round(retention,3), study_plan=None,
            )
            db.merge(student)
            print(f"  {sid:<30} mastery={mastery:.2f}  stress={stress:.2f}")
            count += 1
    else:
        print("\nUSA CSV files not found — skipping.")

    asia_file = "Info_UserData.csv"
    if os.path.exists(asia_file):
        print("\nSeeding Asia students...")
        asia_df      = pd.read_csv(asia_file).head(2000)
        points_ceil  = float(asia_df["points"].quantile(0.95)) or 1.0
        badges_ceil  = float(asia_df["badges_cnt"].quantile(0.95)) or 1.0
        grade_max    = float(asia_df["user_grade"].max()) or 1.0
        teacher_ceil = float(asia_df["has_teacher_cnt"].quantile(0.95)) or 1.0
        class_ceil   = float(asia_df["belongs_to_class_cnt"].quantile(0.95)) or 1.0
        count = 0
        for _, row in asia_df.reset_index().iterrows():
            if count >= max_asia:
                break
            sid          = f"ASIA_{row['uuid']}"
            mastery      = float(np.clip(row["points"] / points_ceil, 0.0, 1.0))
            speed        = float(np.clip(0.3 + 0.6 * (row["user_grade"] / grade_max), 0.0, 1.0))
            connectivity = float(np.clip(0.5*(row["has_teacher_cnt"]/teacher_ceil) + 0.5*(row["belongs_to_class_cnt"]/class_ceil), 0.0, 1.0))
            resilience   = float(np.clip(row["badges_cnt"] / badges_ceil, 0.0, 1.0))
            stress       = float(np.clip(0.4*float(row["is_self_coach"]) + 0.3*(1.0 - row["has_teacher_cnt"]/teacher_ceil) + 0.3*(row["belongs_to_class_cnt"]/class_ceil), 0.0, 1.0))
            grade_median = asia_df[asia_df["user_grade"]==row["user_grade"]]["points"].median() or 1.0
            retention    = float(np.clip(row["points"] / grade_median / 2.0, 0.0, 1.0))
            student = StudentDB(
                student_id=sid, topic_mastery=_make_topic_dict(mastery),
                response_speed=_make_topic_dict(speed), connectivity_score=round(connectivity,3),
                resilience_factor=round(resilience,3), current_stress_level=round(stress,3),
                retention_score=round(retention,3), study_plan=None,
            )
            db.merge(student)
            print(f"  {sid:<30} mastery={mastery:.2f}  stress={stress:.2f}")
            count += 1
    else:
        print("Info_UserData.csv not found — skipping.")

def main(reset=False):
    print("=" * 60)
    print("  NeuroFlex — Student Database Seeder")
    print("=" * 60)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if reset:
            print("\nResetting student table...")
            db.query(StudentDB).delete()
            db.commit()
        save_named_students(db)
        save_dataset_students(db)
        db.commit()
        total = db.query(StudentDB).count()
        print(f"\nDone! Total students in DB: {total}")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true")
    args = parser.parse_args()
    main(reset=args.reset)
