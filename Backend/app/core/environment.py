import numpy as np
from app.core.neuro_logic import calculate_retention

class StudyEnvironment:
    def __init__(self):
        # Actions: 0=Video, 1=Quiz, 2=Active Recall, 3=Break
        self.action_effects = {
            0: {"mastery": 0.05, "stress": 0.05, "speed": -0.01}, # Video: Slow gain
            1: {"mastery": 0.10, "stress": 0.20, "speed": 0.05},  # Quiz: High stress/High gain
            2: {"mastery": 0.15, "stress": 0.10, "speed": 0.10}, # Recall: Best for mastery
            3: {"mastery": 0.00, "stress": -0.30, "speed": 0.00} # Break: Reduces stress
        }

    def step(self, current_state, action):
        """
        Calculates the 'Next State' based on an action.
        current_state: [Mastery, Speed, Connectivity, Resilience, Stress, Retention]
        """
        new_state = current_state.copy()
        effect = self.action_effects[action]

        # Apply Neuro-Logic changes
        new_state[0] = np.clip(new_state[0] + effect["mastery"], 0, 1) # Mastery
        new_state[1] = max(0, new_state[1] - effect["speed"])         # Speed
        new_state[4] = np.clip(new_state[4] + effect["stress"], 0, 1)  # Stress

        return new_state