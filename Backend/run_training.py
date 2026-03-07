from app.core.trainer import NeuroTrainer
from app.core.environment import StudyEnvironment
from app.core.memory import ReplayBuffer
from app.core.reward_system import calculate_reward
import numpy as np

env = StudyEnvironment()
trainer = NeuroTrainer()
memory = ReplayBuffer()

for episode in range(1000):
    # Start with a random student state [Mastery, Speed, Conn, Resil, Stress, Reten]
    state = np.random.rand(6) 
    total_reward = 0

    for day in range(7): # 7-day study plan
        action = trainer.get_action(state)
        next_state = env.step(state, action)
        reward = calculate_reward(state, next_state)
        
        # Save to memory
        memory.add(state, action, reward, next_state, day == 6)
        
        state = next_state
        total_reward += reward
        
    # Let the brain learn from the week's data
    trainer.train_step(memory)

    if episode % 10 == 0:
        print(f"Episode: {episode} | Reward: {total_reward:.2f} | Epsilon: {trainer.epsilon:.2f}")