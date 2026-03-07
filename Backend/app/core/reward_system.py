def calculate_reward(old_state, new_state):
    """
    State indices:
    0: Mastery (Knowledge)
    1: Response Speed (Lower is better)
    4: Stress Level
    """
    # 1. Knowledge Gain (Index 0)
    knowledge_gain = new_state[0] - old_state[0]
    
    # 2. Speed Improvement (Index 1) 
    # Since lower speed is better, a 'gain' is old - new
    speed_improvement = old_state[1] - new_state[1]
    
    # 3. Stress Penalty (Index 4)
    stress_penalty = 0
    if new_state[4] > 0.8:
        stress_penalty = -5  # Penalty for pushing the student too hard
        
    # Final Reward Calculation
    return knowledge_gain + (speed_improvement * 0.1) + stress_penalty