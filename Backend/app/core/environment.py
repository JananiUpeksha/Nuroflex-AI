"""
app/core/environment.py
"""
import numpy as np


class StudyEnvironment:

    def __init__(self):
        # Actions: 0=Watch Video, 1=Take Quiz, 2=Active Recall, 3=Take a Break
        self.action_effects = {
            0: {"mastery": 0.05, "speed":  0.02, "stress":  0.05},  # Video
            1: {"mastery": 0.10, "speed":  0.05, "stress":  0.20},  # Quiz
            2: {"mastery": 0.15, "speed":  0.10, "stress":  0.10},  # Active Recall
            3: {"mastery": 0.00, "speed":  0.00, "stress": -0.30},  # Break
        }

    def step(self, current_state: np.ndarray, action: int) -> np.ndarray:
        """
        State: [Mastery, Speed, Connectivity, Resilience, Stress, Retention]

        FIX: Original subtracted speed delta which made students SLOWER after
        studying. Speed now adds correctly with np.clip like every other dimension.
        """
        new_state = current_state.copy().astype(np.float32)
        effect    = self.action_effects[action]

        new_state[0] = np.clip(new_state[0] + effect["mastery"], 0.0, 1.0)  # Mastery
        new_state[1] = np.clip(new_state[1] + effect["speed"],   0.0, 1.0)  # Speed (fixed)
        new_state[4] = np.clip(new_state[4] + effect["stress"],  0.0, 1.0)  # Stress

        # Connectivity grows slowly as mastery grows
        new_state[2] = np.clip(new_state[2] + 0.01 * effect["mastery"], 0.0, 1.0)
        # Resilience inches up each day
        new_state[3] = np.clip(new_state[3] + 0.005, 0.0, 1.0)
        # Retention improves with active learning, decays under heavy stress
        retention_delta = 0.05 * effect["mastery"] - 0.02 * max(0.0, float(new_state[4]) - 0.7)
        new_state[5] = np.clip(new_state[5] + retention_delta, 0.0, 1.0)

        return new_state