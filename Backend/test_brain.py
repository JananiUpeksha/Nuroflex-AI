import numpy as np
from app.core.trainer import NeuroTrainer

trainer = NeuroTrainer()
trainer.brain.load_weights('app/models/neuro_brain_global.h5')

actions = ["Watch Video", "Take Quiz", "Active Recall", "Take a Break"]

# Scenario A: High Stress, High Response Time (Low Speed)
# [Mastery, Speed, Connectivity, Resilience, Stress, Retention]
burnout_student = np.array([0.4, 0.1, 1.0, 1.0, 0.9, 1.0])

# Scenario B: High Mastery, Low Stress, Good Speed
pro_student = np.array([0.9, 0.8, 1.0, 1.0, 0.1, 1.0])

print("🤖 NeuroFlex AI Decision Testing:")
print(f"Student A (Burnout) -> Recommended: {actions[trainer.get_action(burnout_student)]}")
print(f"Student B (Pro) -> Recommended: {actions[trainer.get_action(pro_student)]}")
