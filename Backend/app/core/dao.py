import numpy as np
from app.models.student_db import StudentDB


class StudentDAO:
    @staticmethod
    def get_student_state_vector(db, student_id: str):
        """
        ✅ FIX: Previously this IGNORED the database entirely and returned a
        hardcoded vector for any ID containing 'STUDENT'. That caused the AI
        to always start from the same random-feeling state and pick different
        topics every refresh.

        Now we actually query SQLite and build the state vector from the
        student's real stored data.
        """
        student = db.query(StudentDB).filter(
            StudentDB.student_id == student_id
        ).first()

        if student is None:
            return None

        # --- Pillar 1: Mastery (average across all topics) ---
        mastery_values = list(student.topic_mastery.values()) if student.topic_mastery else [0.5]
        avg_mastery = sum(mastery_values) / len(mastery_values)

        # --- Pillar 2: Speed (average across all topics) ---
        speed_values = list(student.response_speed.values()) if student.response_speed else [0.5]
        avg_speed = sum(speed_values) / len(speed_values)

        # --- Pillars 3 & 4: Connectivity and Resilience (direct from DB) ---
        connectivity = student.connectivity_score if student.connectivity_score is not None else 1.0
        resilience   = student.resilience_factor  if student.resilience_factor  is not None else 1.0

        # --- Pillar 5: Stress ---
        stress = student.current_stress_level if student.current_stress_level is not None else 0.2

        # Return: [Mastery, Speed, Connectivity, Resilience, Stress, Retention]
        # Retention defaults to 1.0 here; it gets recalculated live in /analyze-brain-state
        return np.array([avg_mastery, avg_speed, connectivity, resilience, stress, 1.0])

    @staticmethod
    def get_student(db, student_id: str):
        """Returns the full StudentDB ORM object."""
        return db.query(StudentDB).filter(
            StudentDB.student_id == student_id
        ).first()

    @staticmethod
    def save_study_plan(db, student_id: str, plan: dict):
        """
        Persists the generated study plan to the DB so it stays the same
        on every subsequent refresh.
        """
        student = db.query(StudentDB).filter(
            StudentDB.student_id == student_id
        ).first()

        if student:
            student.study_plan = plan
            db.commit()