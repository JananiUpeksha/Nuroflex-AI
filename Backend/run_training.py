"""
run_training.py  —  PHASE 2: RL Simulation Fine-Tuning
Run AFTER train_global.py:  python run_training.py
"""
import os, json, time, collections
import numpy as np
import matplotlib.pyplot as plt

from app.core.trainer       import NeuroTrainer
from app.core.environment   import StudyEnvironment
from app.core.memory        import ReplayBuffer
from app.core.reward_system import calculate_reward

EPISODES   = 1000
BATCH_SIZE = 64
MODEL_PATH = "app/models/neuro_brain_global.h5"
LOG_DIR    = "training_logs"
ACTIONS    = ["Watch Video", "Take Quiz", "Active Recall", "Take a Break"]
os.makedirs("app/models", exist_ok=True)
os.makedirs(LOG_DIR,      exist_ok=True)


def sample_student_state() -> np.ndarray:
    archetypes = [
        [0.2, 0.3, 0.5, 0.5, 0.3, 0.8],
        [0.3, 0.2, 0.4, 0.3, 0.7, 0.5],
        [0.5, 0.5, 0.7, 0.6, 0.4, 0.7],
        [0.8, 0.8, 0.9, 0.8, 0.2, 0.9],
    ]
    base  = np.array(archetypes[np.random.randint(4)], dtype=np.float32)
    noise = np.random.uniform(-0.1, 0.1, size=6).astype(np.float32)
    return np.clip(base + noise, 0.0, 1.0)


def run_training(trainer, memory):
    env           = StudyEnvironment()
    rewards       = []
    epsilons      = []
    action_counts = collections.Counter()
    start         = time.time()

    print(f"\n🔁 Phase-2 RL training for {EPISODES} episodes ...")
    for ep in range(EPISODES):
        state        = sample_student_state()
        total_reward = 0.0

        for day in range(7):
            action     = trainer.get_action(state, training=True)
            next_state = env.step(state, action)
            reward     = calculate_reward(state, next_state)
            memory.add(state, action, reward, next_state, day == 6)
            if len(memory) >= BATCH_SIZE:
                trainer.train_step(memory, batch_size=BATCH_SIZE)
            action_counts[ACTIONS[action]] += 1
            state        = next_state
            total_reward += reward

        rewards.append(round(total_reward, 4))
        epsilons.append(round(trainer.epsilon, 4))

        if ep % 100 == 0 or ep == EPISODES - 1:
            avg = np.mean(rewards[-100:]) if len(rewards) >= 100 else np.mean(rewards)
            print(f"  Ep {ep:>4}/{EPISODES} | Reward: {total_reward:+.3f} | "
                  f"Avg(100): {avg:+.3f} | ε: {trainer.epsilon:.3f} | {time.time()-start:.0f}s")

    return rewards, epsilons, action_counts


def plot_rewards(rewards, epsilons):
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8), sharex=True)
    w      = 50
    smooth = np.convolve(rewards, np.ones(w)/w, mode="valid")
    ax1.plot(rewards, alpha=0.2, color="steelblue")
    ax1.plot(range(w-1, len(rewards)), smooth, color="steelblue", lw=2.5, label=f"Rolling mean (w={w})")
    ax1.axhline(0, color="gray", ls="--", lw=0.8)
    ax1.set_ylabel("Reward"); ax1.set_title("Phase 2 RL Fine-Tuning"); ax1.legend(); ax1.grid(alpha=0.3)
    ax2.plot(epsilons, color="tomato", lw=2)
    ax2.set_ylabel("Epsilon"); ax2.set_xlabel("Episode"); ax2.grid(alpha=0.3)
    plt.tight_layout()
    path = os.path.join(LOG_DIR, "phase2_training_curve.png")
    plt.savefig(path, dpi=150); plt.close()
    print(f"  📊 Reward curve → {path}")


def plot_actions(action_counts):
    labels = list(action_counts.keys())
    values = [action_counts[l] for l in labels]
    colors = ["#4C72B0", "#DD8452", "#55A868", "#C44E52"]
    plt.figure(figsize=(8, 5))
    bars = plt.bar(labels, values, color=colors, edgecolor="white")
    total = sum(values)
    for bar, val in zip(bars, values):
        plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 50,
                 f"{val:,} ({val/total*100:.1f}%)", ha="center", fontsize=9)
    plt.title("Action Distribution During Training")
    plt.ylabel("Times chosen")
    plt.tight_layout()
    path = os.path.join(LOG_DIR, "phase2_action_distribution.png")
    plt.savefig(path, dpi=150); plt.close()
    print(f"  📊 Actions chart → {path}")


def main():
    print("=" * 60)
    print("  NeuroFlex — PHASE 2: RL Simulation Fine-Tuning")
    print("=" * 60)

    trainer = NeuroTrainer()
    memory  = ReplayBuffer(capacity=50_000)

    if os.path.exists(MODEL_PATH):
        trainer.brain.load_weights(MODEL_PATH)
        trainer.epsilon = 0.4
        print(f"✅ Loaded Phase-1 weights | starting ε=0.4")
    else:
        print("⚠️  No Phase-1 model found. Run train_global.py first!")

    rewards, epsilons, action_counts = run_training(trainer, memory)

    trainer.brain.save(MODEL_PATH)
    print(f"\n✅ Model saved → {MODEL_PATH}")

    log = {
        "episodes":      EPISODES,
        "rewards":       rewards,
        "epsilons":      epsilons,
        "action_counts": dict(action_counts),
        "avg_last_100":  round(float(np.mean(rewards[-100:])), 4),
    }
    with open(os.path.join(LOG_DIR, "phase2_rewards.json"), "w") as f:
        json.dump(log, f, indent=2)

    plot_rewards(rewards, epsilons)
    plot_actions(action_counts)

    print("\n" + "=" * 60)
    print("  SUMMARY")
    print("=" * 60)
    print(f"  Avg reward (last 100) : {log['avg_last_100']:+.4f}")
    print(f"  Final epsilon         : {trainer.epsilon:.4f}")
    total = sum(action_counts.values())
    for a, c in action_counts.most_common():
        print(f"    {a:<20} {c:>6,}  ({c/total*100:.1f}%)")
    print("\n🎉 Phase 2 done! Start your server:  uvicorn app.main:app --reload")


if __name__ == "__main__":
    main()
