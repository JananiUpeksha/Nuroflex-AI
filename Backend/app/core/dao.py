"""
app/core/dao.py

FIX: Added update_student_state() — simulate_session.py calls
POST /update-state but the original DAO had no such method, causing
a crash whenever the simulation ran.
Also fixed retention default from 1.0 → 0.7.
"""
import numpy as np
from app.models.student_db import StudentDB


class StudentDAO:

    @staticmethod
    def get_student_state_vector(db, student_id: str):
        """Returns [Mastery, Speed, Connectivity, Resilience, Stress, Retention] or None."""
        student = db.query(StudentDB).filter(StudentDB.student_id == student_id).first()
        if student is None:
            return None

        mastery_values = list(student.topic_mastery.values())  if student.topic_mastery  else [0.5]
        speed_values   = list(student.response_speed.values()) if student.response_speed else [0.5]

        avg_mastery  = sum(mastery_values) / len(mastery_values)
        avg_speed    = sum(speed_values)   / len(speed_values)
        connectivity = student.connectivity_score   if student.connectivity_score   is not None else 0.7
        resilience   = student.resilience_factor    if student.resilience_factor    is not None else 0.7
        stress       = student.current_stress_level if student.current_stress_level is not None else 0.3
        retention    = student.retention_score      if getattr(student, "retention_score", None) is not None else 0.7  # FIX: was 1.0

        return np.array([avg_mastery, avg_speed, connectivity, resilience, stress, retention],
                        dtype=np.float32)

    @staticmethod
    def get_student(db, student_id: str):
        return db.query(StudentDB).filter(StudentDB.student_id == student_id).first()

    @staticmethod
    def save_study_plan(db, student_id: str, plan: dict):
        student = db.query(StudentDB).filter(StudentDB.student_id == student_id).first()
        if student:
            student.study_plan = plan
            db.commit()

    @staticmethod
    def update_student_state(db, student_id: str,
                             mastery_delta: float = 0.0,
                             stress_delta:  float = 0.0):
        """
        NEW METHOD — applies incremental mastery/stress changes.
        Called by POST /update-state (used in simulate_session.py).
        """
        student = db.query(StudentDB).filter(StudentDB.student_id == student_id).first()
        if not student:
            return

        if student.topic_mastery:
            student.topic_mastery = {
                k: float(np.clip(v + mastery_delta, 0.0, 1.0))
                for k, v in student.topic_mastery.items()
            }

        current_stress = student.current_stress_level or 0.3
        student.current_stress_level = float(np.clip(current_stress + stress_delta, 0.0, 1.0))
        db.commit()