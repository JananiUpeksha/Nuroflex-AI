from app.core.loader import NeuroDataLoader
from app.core.trainer import NeuroTrainer
from app.core.memory import ReplayBuffer

def start_global_training():
    loader = NeuroDataLoader()
    trainer = NeuroTrainer()
    memory = ReplayBuffer()

    # Load and add USA data to memory
    usa_states = loader.load_usa_tribe()
    for s in usa_states:
        reward = s[0] * (1 - s[4]) # Reward = Mastery * (1 - Stress)
        memory.add(s, 1, reward, s, False)

    # Load and add Asia data to memory
    asia_states = loader.load_asia_tribe()
    for s in asia_states:
        memory.add(s, 1, s[0], s, False)

    print(f"🧠 Training on {len(usa_states) + len(asia_states)} real student interactions...")
    trainer.train_step(memory, batch_size=64)
    trainer.brain.save('app/models/neuro_brain_global.h5')
    print("✅ Global Neuro-Brain Saved!")

if __name__ == "__main__":
    start_global_training()
