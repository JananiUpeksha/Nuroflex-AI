import numpy as np
import random
from app.models.dqn_brain import build_dqn
from app.core.reward_system import calculate_reward

class NeuroTrainer:
    def __init__(self, state_size=6, action_size=4):
        self.state_size = state_size # Save this for reshaping
        self.brain = build_dqn(state_size, action_size)
        self.epsilon = 1.0  
        self.epsilon_decay = 0.995
        self.epsilon_min = 0.01
        self.gamma = 0.95   

    def get_action(self, state):
        """Decides whether to explore or exploit."""
        state = np.reshape(state, [1, self.state_size])
        if np.random.rand() <= self.epsilon:
            return random.randrange(self.brain.output_shape[1])
        act_values = self.brain.predict(state, verbose=0)
        return np.argmax(act_values[0])

    def train_step(self, memory, batch_size=32):
        if len(memory) < batch_size:
            return 

        states, actions, rewards, next_states, dones = memory.sample(batch_size)

        # Predict current and future values
        targets = self.brain.predict(states, verbose=0)
        next_q_values = self.brain.predict(next_states, verbose=0)

        for i in range(batch_size):
            # The Bellman Equation: Q = Reward + Gamma * Max(Next_Q)
            targets[i][actions[i]] = rewards[i] + self.gamma * np.max(next_q_values[i]) * (1 - dones[i])

        self.brain.fit(states, targets, epochs=1, verbose=0)

        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay

    def update_brain(self, memory, batch_size=32):
        """Learns from the ReplayBuffer experiences."""
        if len(memory) < batch_size:
            return

        # Sample a batch of random experiences
        states, actions, rewards, next_states, dones = memory.sample(batch_size)

        # Standard DQN update logic
        targets = self.brain.predict(states, verbose=0)
        next_q_values = self.brain.predict(next_states, verbose=0)

        for i in range(batch_size):
            # Target = Reward + Discounted future value
            targets[i][actions[i]] = rewards[i] + self.gamma * np.max(next_q_values[i]) * (1 - dones[i])

        self.brain.fit(states, targets, epochs=1, verbose=0)