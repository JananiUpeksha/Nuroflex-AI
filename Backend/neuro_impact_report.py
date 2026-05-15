"""
neuro_impact_report.py  —  Real-Data Impact Chart
"""
import argparse
import requests
import time
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

BASE_URL = "http://127.0.0.1:8000"

ACTION_DELTAS = {
    "Watch Video":   {"mastery_delta":  0.05, "stress_delta":  0.05},
    "Take Quiz":     {"mastery_delta":  0.10, "stress_delta":  0.20},
    "Active Recall": {"mastery_delta":  0.15, "stress_delta":  0.10},
    "Take a Break":  {"mastery_delta":  0.00, "stress_delta": -0.30},
}

ACTION_COLORS = {
    "Watch Video":   "#4C72B0",
    "Take Quiz":     "#DD8452",
    "Active Recall": "#55A868",
    "Take a Break":  "#C44E52",
}

def get_report(student_id):
    res = requests.get(f"{BASE_URL}/student-report/{student_id}", timeout=10)
    res.raise_for_status()
    return res.json()

def get_recommendation(student_id):
    res = requests.get(f"{BASE_URL}/recommend-action/{student_id}", timeout=10)
    res.raise_for_status()
    return res.json()["recommended_action"]

def push_update(student_id, mastery_delta, stress_delta):
    requests.post(f"{BASE_URL}/update-state/{student_id}",
        json={"mastery_delta": mastery_delta, "stress_delta": stress_delta}, timeout=10).raise_for_status()

def collect_data(student_id, steps, delay):
    step_labels, mastery_vals, stress_vals, actions_taken = [], [], [], []
    report  = get_report(student_id)
    details = report["details"]
    mastery_vals.append(details["avg_mastery"])
    stress_vals.append(details["stress"])
    step_labels.append(0)
    actions_taken.append(None)
    print(f"  Step  0 (baseline)  | Mastery: {details['avg_mastery']:.3f}  Stress: {details['stress']:.3f}")
    for step in range(1, steps + 1):
        action = get_recommendation(student_id)
        deltas = ACTION_DELTAS[action]
        push_update(student_id, deltas["mastery_delta"], deltas["stress_delta"])
        report  = get_report(student_id)
        details = report["details"]
        mastery = details["avg_mastery"]
        stress  = details["stress"]
        step_labels.append(step)
        mastery_vals.append(mastery)
        stress_vals.append(stress)
        actions_taken.append(action)
        print(f"  Step {step:>2}  {action:<18} | Mastery: {mastery:.3f}  Stress: {stress:.3f}")
        if delay > 0:
            time.sleep(delay)
    return step_labels, mastery_vals, stress_vals, actions_taken

def plot(student_id, step_labels, mastery_vals, stress_vals, actions_taken, output_path):
    fig, ax = plt.subplots(figsize=(12, 6))
    ax.plot(step_labels, mastery_vals, "o-",  color="#2196F3", linewidth=2.5, label="Mastery", zorder=3)
    ax.plot(step_labels, stress_vals,  "s--", color="#F44336", linewidth=2.5, label="Stress", zorder=3)
    for i, (step, action) in enumerate(zip(step_labels[1:], actions_taken[1:]), start=1):
        color = ACTION_COLORS.get(action, "#999")
        ax.axvline(x=step, color=color, alpha=0.25, linewidth=8, zorder=1)
        ax.annotate(
            action.replace("Active Recall","Recall").replace("Watch Video","Video")
                  .replace("Take a Break","Break").replace("Take Quiz","Quiz"),
            xy=(step, mastery_vals[i] + 0.02), ha="center", va="bottom",
            fontsize=8, color=color, fontweight="bold",
        )
    ax.axhline(y=0.75, color="#FF9800", linestyle=":", linewidth=1.5, alpha=0.8)
    ax.text(0.01, 0.77, "Burnout threshold (0.75)", transform=ax.get_yaxis_transform(), fontsize=8, color="#FF9800")
    ax.set_xlim(-0.3, max(step_labels) + 0.3)
    ax.set_ylim(0, 1.15)
    ax.set_xlabel("Simulation Step", fontsize=12)
    ax.set_ylabel("Pillar Level (0.0 - 1.0)", fontsize=12)
    ax.set_title(f"NeuroFlex AI — Real Impact Report\nStudent: {student_id}", fontsize=14, fontweight="bold")
    ax.set_xticks(step_labels)
    ax.grid(axis="y", alpha=0.3)
    patches = [mpatches.Patch(color=c, label=a) for a, c in ACTION_COLORS.items()]
    ax.legend(handles=patches + [
        plt.Line2D([0],[0], color="#2196F3", marker="o", lw=2, label="Mastery"),
        plt.Line2D([0],[0], color="#F44336", marker="s", lw=2, linestyle="--", label="Stress"),
    ], loc="upper left", fontsize=9, ncol=2)
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"\nChart saved -> {output_path}")

def main(student_id, steps, delay, output):
    print("=" * 60)
    print("  NeuroFlex — Real-Data Impact Report Generator")
    print(f"  Student: {student_id}  |  Steps: {steps}")
    print("=" * 60 + "\n")
    step_labels, mastery_vals, stress_vals, actions_taken = collect_data(student_id, steps, delay)
    mastery_gain = mastery_vals[-1] - mastery_vals[0]
    stress_delta = stress_vals[-1]  - stress_vals[0]
    print(f"\nMastery change : {mastery_gain:+.3f}")
    print(f"Stress change  : {stress_delta:+.3f}")
    plot(student_id, step_labels, mastery_vals, stress_vals, actions_taken, output)
    print("Done.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--student", default="CS_STUDENT_001")
    parser.add_argument("--steps",   default=7,   type=int)
    parser.add_argument("--delay",   default=0.3, type=float)
    parser.add_argument("--output",  default="neuro_impact_report.png")
    args = parser.parse_args()
    main(args.student, args.steps, args.delay, args.output)
