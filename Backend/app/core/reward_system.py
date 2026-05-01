"""
app/core/reward_system.py

Stronger stress penalty so the model learns to recommend
Take a Break when a student is in the burnout zone (stress > 0.7).
"""


def calculate_reward(old_state, new_state) -> float:
    """
    State indices:
      0  Mastery
      1  Speed        (higher = faster = better)
      4  Stress       (higher = worse)
      5  Retention
    """
    knowledge_gain    = float(new_state[0] - old_state[0])
    speed_improvement = float(new_state[1] - old_state[1])
    retention_gain    = float(new_state[5] - old_state[5]) * 0.5

    # Graduated stress penalty — gets heavier as stress climbs
    stress_level = float(new_state[4])
    if stress_level > 0.8:
        stress_penalty = -10.0   # hard burnout — must break
    elif stress_level > 0.7:
        stress_penalty = -5.0    # danger zone
    else:
        stress_penalty = 0.0

    # Bonus when stress was high and the action reduced it
    stress_relief_bonus = 0.0
    if float(old_state[4]) > 0.65 and float(new_state[4]) < float(old_state[4]):
        stress_relief_bonus = 2.0

    return (
        knowledge_gain
        + speed_improvement * 0.1
        + retention_gain
        + stress_penalty
        + stress_relief_bonus
    )
