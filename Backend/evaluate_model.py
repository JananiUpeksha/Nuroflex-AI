"""
evaluate_model.py  —  Verify your trained model
Run after both phases:  python evaluate_model.py
"""
import os, json
import numpy as np
import matplotlib.pyplot as plt

from app.core.trainer       import NeuroTrainer
from app.core.environment   import StudyEnvironment
from app.core.reward_system import calculate_reward

MODEL_PATH = "app/models/neuro_brain_global.h5"
LOG_DIR    = "training_logs"
ACTIONS    = ["Watch Video", "Take Quiz", "Active Recall", "Take a Break"]

ARCHETYPES = {
    "Advanced & Calm":       [0.85, 0.80, 0.90, 0.85, 0.15, 0.90],
    "Average Learner":       [0.50, 0.50, 0.65, 0.60, 0.40, 0.70],
    "Stressed & Burned Out": [0.35, 0.25, 0.45, 0.30, 0.85, 0.45],
    "Fast but Stressed":     [0.65, 0.80, 0.70, 0.55, 0.75, 0.65],
    "Beginner, Motivated":   [0.20, 0.30, 0.50, 0.80, 0.25, 0.80],
}
EXPECTED = {
    "Advanced & Calm":       ["Take Quiz", "Active Recall"],
    "Average Learner":       ["Watch Video", "Active Recall", "Take Quiz"],
    "Stressed & Burned Out": ["Take a Break"],
    "Fast but Stressed":     ["Take a Break", "Watch Video"],
    "Beginner, Motivated":   ["Watch Video", "Active Recall"],
}


def simulate_week(trainer, env, state):
    state    = np.array(state, dtype=np.float32)
    timeline = []
    for day in range(7):
        action     = trainer.get_action(state, training=False)
        next_state = env.step(state, action)
        reward     = calculate_reward(state, next_state)
        timeline.append({
            "day":     day + 1,
            "action":  ACTIONS[action],
            "reward":  round(float(reward), 4),
            "mastery": round(float(next_state[0]), 3),
            "stress":  round(float(next_state[4]), 3),
        })
        state = next_state
    return timeline, state


def main():
    print("=" * 65)
    print("  NeuroFlex DQN - Model Evaluation")
    print("=" * 65)

    if not os.path.exists(MODEL_PATH):
        print(f"Model not found at {MODEL_PATH}")
        print("   Run:  python train_global.py && python run_training.py")
        return

    trainer = NeuroTrainer()
    trainer.brain.load_weights(MODEL_PATH)
    print(f"Model loaded\n")

    env     = StudyEnvironment()
    results = {}
    passed  = 0

    for archetype, state in ARCHETYPES.items():
        timeline, final = simulate_week(trainer, env, state)
        actions_taken   = [t["action"] for t in timeline]
        total_reward    = sum(t["reward"] for t in timeline)
        mastery_gain    = float(final[0]) - float(state[0])
        stress_change   = float(final[4]) - float(state[4])
        ok              = any(e in actions_taken for e in EXPECTED[archetype])
        verdict         = "PASS" if ok else "REVIEW"
        if ok:
            passed += 1

        results[archetype] = {
            "timeline":     timeline,
            "total_reward": round(float(total_reward), 3),
            "mastery_gain": round(float(mastery_gain), 3),
            "stress_change":round(float(stress_change), 3),
            "verdict":      verdict,
        }
        print(f"{archetype}")
        print(f"  State   : Mastery={state[0]:.2f}  Stress={state[4]:.2f}")
        print(f"  Actions : {' -> '.join(actions_taken)}")
        print(f"  Mastery gain  : {mastery_gain:+.3f}")
        print(f"  Stress change : {stress_change:+.3f}")
        print(f"  Total reward  : {total_reward:+.3f}")
        print(f"  Verdict : {'OK' if ok else 'REVIEW'}\n")

    print(f"Score: {passed}/{len(ARCHETYPES)} archetypes handled correctly")

    os.makedirs(LOG_DIR, exist_ok=True)
    n = len(results)
    fig, axes = plt.subplots(n, 1, figsize=(12, 3*n), sharex=True)
    if n == 1: axes = [axes]
    for ax, (arch, data) in zip(axes, results.items()):
        days    = [t["day"]    for t in data["timeline"]]
        mastery = [t["mastery"] for t in data["timeline"]]
        stress  = [t["stress"]  for t in data["timeline"]]
        actions = [t["action"]  for t in data["timeline"]]
        ax.plot(days, mastery, "o-", color="steelblue", label="Mastery", lw=2)
        ax.plot(days, stress,  "s--", color="tomato",  label="Stress",  lw=2)
        for d, a in zip(days, actions):
            short = a.replace("Active Recall","Recall").replace("Watch Video","Video").replace("Take a Break","Break").replace("Take Quiz","Quiz")
            ax.annotate(short, (d, mastery[d-1]+0.03), ha="center", fontsize=7, color="steelblue")
        ax.set_title(f"{arch}  |  {data['verdict']}  |  Reward: {data['total_reward']:+.2f}", fontsize=10)
        ax.set_ylim(0, 1.15); ax.set_ylabel("Level"); ax.legend(loc="lower right", fontsize=8); ax.grid(alpha=0.3)
    axes[-1].set_xlabel("Day")
    plt.suptitle("NeuroFlex DQN - 7-Day Simulation per Student Archetype", fontsize=13, y=1.01)
    plt.tight_layout()
    chart_path = os.path.join(LOG_DIR, "evaluation_report.png")
    plt.savefig(chart_path, dpi=150, bbox_inches="tight"); plt.close()
    print(f"\nChart -> {chart_path}")

    with open(os.path.join(LOG_DIR, "evaluation_report.json"), "w") as f:
        json.dump({"score": f"{passed}/{n}", "archetypes": results}, f, indent=2)
    print(f"Report -> {os.path.join(LOG_DIR, 'evaluation_report.json')}")


if __name__ == "__main__":
    main()
