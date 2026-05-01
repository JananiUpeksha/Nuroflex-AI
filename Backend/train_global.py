"""
train_global.py  —  PHASE 1: Real-Data Pre-Training
Run from project root:  python train_global.py
"""
import os, json, time
import numpy as np
import matplotlib.pyplot as plt

from app.core.loader        import NeuroDataLoader
from app.core.trainer       import NeuroTrainer
from app.core.memory        import ReplayBuffer
from app.core.environment   import StudyEnvironment
from app.core.reward_system import calculate_reward

BATCH_SIZE         = 64
FINE_TUNE_EPISODES = 300
MODEL_PATH         = "app/models/neuro_brain_global.h5"
LOG_DIR            = "training_logs"
os.makedirs("app/models", exist_ok=True)
os.makedirs(LOG_DIR,      exist_ok=True)


def seed_memory(memory, loader):
    env  = StudyEnvironment()
    usa  = loader.load_usa_tribe()
    asia = loader.load_asia_tribe()

    for s in usa:
        reward = float(s[0] * (1 - s[4]))
        action = int(np.argmax([s[0], s[1], s[2], 1 - s[4]]))
        memory.add(s, action, reward, env.step(s, action), False)

    for s in asia:
        memory.add(s, 2, float(s[0]), env.step(s, 2), False)

    total = len(usa) + len(asia)
    print(f"  ✅ {total:,} real interactions seeded into replay buffer")
    return total


def fine_tune(trainer, memory, episodes=FINE_TUNE_EPISODES):
    env     = StudyEnvironment()
    rewards, epsilons = [], []
    start   = time.time()
    print(f"\n🔁 Fine-tuning for {episodes} RL episodes ...")

    for ep in range(episodes):
        state        = np.random.rand(6).astype(np.float32)
        total_reward = 0.0
        for day in range(7):
            action     = trainer.get_action(state, training=True)
            next_state = env.step(state, action)
            reward     = calculate_reward(state, next_state)
            memory.add(state, action, reward, next_state, day == 6)
            trainer.train_step(memory, batch_size=BATCH_SIZE)
            state        = next_state
            total_reward += reward
        rewards.append(round(total_reward, 4))
        epsilons.append(round(trainer.epsilon, 4))
        if ep % 50 == 0:
            print(f"  Ep {ep:>4}/{episodes} | Reward: {total_reward:+.3f} | ε: {trainer.epsilon:.3f} | {time.time()-start:.0f}s")

    return rewards, epsilons


def plot_curve(rewards, epsilons, tag):
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 8), sharex=True)
    w = max(1, len(rewards) // 20)
    smooth = np.convolve(rewards, np.ones(w)/w, mode="valid")
    ax1.plot(rewards, alpha=0.3, color="steelblue")
    ax1.plot(range(w-1, len(rewards)), smooth, color="steelblue", lw=2, label=f"Rolling mean (w={w})")
    ax1.set_ylabel("Reward"); ax1.set_title(f"Phase 1 Training Curve"); ax1.legend(); ax1.grid(alpha=0.3)
    ax2.plot(epsilons, color="tomato", lw=2)
    ax2.set_ylabel("Epsilon"); ax2.set_xlabel("Episode"); ax2.grid(alpha=0.3)
    plt.tight_layout()
    path = os.path.join(LOG_DIR, f"{tag}_training_curve.png")
    plt.savefig(path, dpi=150); plt.close()
    print(f"  📊 Chart saved → {path}")


def main():
    print("=" * 60)
    print("  NeuroFlex — PHASE 1: Real-Data Pre-Training")
    print("=" * 60)

    loader  = NeuroDataLoader()
    trainer = NeuroTrainer()
    memory  = ReplayBuffer(capacity=50_000)

    print("\n📂 Loading real student datasets ...")
    seed_memory(memory, loader)

    print(f"\n🧠 Initial supervised pass (50 batches) ...")
    for _ in range(50):
        trainer.train_step(memory, batch_size=BATCH_SIZE)
    print("  ✅ Done")

    rewards, epsilons = fine_tune(trainer, memory)

    trainer.brain.save(MODEL_PATH)
    print(f"\n✅ Model saved → {MODEL_PATH}")

    with open(os.path.join(LOG_DIR, "phase1_rewards.json"), "w") as f:
        json.dump({"rewards": rewards, "epsilons": epsilons}, f, indent=2)

    plot_curve(rewards, epsilons, "phase1")
    print("\n🎉 Phase 1 done! Run  python run_training.py  next.")


if __name__ == "__main__":
    main()
