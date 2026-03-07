import random
import numpy as np
from collections import deque

class ReplayBuffer:
    def __init__(self, capacity: int = 10000):
        # deque automatically handles the "FIFO" (First-In-First-Out) logic
        self.buffer = deque(maxlen=capacity)

    def add(self, state, action, reward, next_state, done):
        """
        Saves a single learning step.
        done: Boolean (True if the student finished the 7-day plan)
        """
        self.buffer.append((state, action, reward, next_state, done))

    def sample(self, batch_size: int):
        """
        Provides a random batch of experiences for the AI to learn from.
        """
        batch = random.sample(self.buffer, batch_size)
        
        # We "unzip" the batch into separate arrays for the AI
        states, actions, rewards, next_states, dones = zip(*batch)
        
        return (
            np.array(states), 
            np.array(actions), 
            np.array(rewards), 
            np.array(next_states), 
            np.array(dones)
        )

    def __len__(self):
        return len(self.buffer)