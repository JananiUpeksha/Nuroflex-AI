import numpy as np
import random
from app.models.dqn_brain import build_dqn
from app.core.reward_system import calculate_reward


class NeuroTrainer:
    def __init__(self, state_size=6, action_size=4):
        self.state_size   = state_size
        self.action_size  = action_size
        self.brain        = build_dqn(state_size, action_size)
        self.epsilon      = 1.0       # Only used during training
        self.epsilon_decay = 0.995
        self.epsilon_min  = 0.01
        self.gamma        = 0.95

    def get_action(self, state, training: bool = False):
        """
        Returns the best action for a given state.

        ✅ FIX: Added a `training` flag.
        - During TRAINING  (training=True)  → epsilon-greedy (explore/exploit mix)
        - During INFERENCE (training=False) → always exploit (deterministic output)

        Previously epsilon was never set to 0 for inference, so the AI would
        randomly pick actions even when serving real students, causing a different
        recommendation every refresh.
        """
        state = np.reshape(state, [1, self.state_size])

        if training and np.random.rand() <= self.epsilon:
            return random.randrange(self.action_size)

        act_values = self.brain.predict(state, verbose=0)
        return int(np.argmax(act_values[0]))

    def train_step(self, memory, batch_size=32):
        if len(memory) < batch_size:
            return

        states, actions, rewards, next_states, dones = memory.sample(batch_size)

        targets      = self.brain.predict(states,      verbose=0)
        next_q_values = self.brain.predict(next_states, verbose=0)

        for i in range(batch_size):
            # Bellman Equation: Q = Reward + Gamma * Max(Next_Q)
            targets[i][actions[i]] = (
                rewards[i] + self.gamma * np.max(next_q_values[i]) * (1 - dones[i])
            )

        self.brain.fit(states, targets, epochs=1, verbose=0)

        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay

    def update_brain(self, memory, batch_size=32):
        """Alias kept for backward compatibility."""
        self.train_step(memory, batch_size)