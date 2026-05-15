"""
simulate_session.py  —  Dynamic Neuro-Simulation
Runs a multi-step session for a student using the REAL StudyEnvironment
physics instead of hardcoded deltas.

Usage:
    python simulate_session.py
    python simulate_session.py --student "Aman Perera" --steps 7
"""
import argparse
import requests
import time
import json

BASE_URL   = "http://127.0.0.1:8000"
ACTIONS    = ["Watch Video", "Take Quiz", "Active Recall", "Take a Break"]

# Maps environment action index → (mastery_delta, stress_delta) derived from
# StudyEnvironment.action_effects so the HTTP update mirrors env physics.
# These match environment.py exactly:
#   0 Watch Video   : mastery +0.05, stress +0.05
#   1 Take Quiz     : mastery +0.10, stress +0.20
#   2 Active Recall : mastery +0.15, stress +0.10
#   3 Take a Break  : mastery +0.00, stress -0.30
ACTION_DELTAS = {
    "Watch Video":   {"mastery_delta":  0.05, "stress_delta":  0.05},
    "Take Quiz":     {"mastery_delta":  0.10, "stress_delta":  0.20},
    "Active Recall": {"mastery_delta":  0.15, "stress_delta":  0.10},
    "Take a Break":  {"mastery_delta":  0.00, "stress_delta": -0.30},
}


def get_recommendation(student_id: str) -> dict:
    res = requests.get(f"{BASE_URL}/recommend-action/{student_id}", timeout=10)
    res.raise_for_status()
    return res.json()


def push_state_update(student_id: str, mastery_delta: float, stress_delta: float) -> dict:
    payload = {"mastery_delta": mastery_delta, "stress_delta": stress_delta}
    res = requests.post(f"{BASE_URL}/update-state/{student_id}", json=payload, timeout=10)
    res.raise_for_status()
    return res.json()


def get_student_report(student_id: str) -> dict:
    res = requests.get(f"{BASE_URL}/student-report/{student_id}", timeout=10)
    res.raise_for_status()
    return res.json()


def run_simulation(student_id: str, steps: int = 7, delay: float = 0.5):
    print("=" * 60)
    print(f"  NeuroFlex Dynamic Simulation")
    print(f"  Student : {student_id}")
    print(f"  Steps   : {steps}")
    print("=" * 60)

    # Snapshot state BEFORE simulation
    report_before = get_student_report(student_id)
    details_before = report_before.get("details", {})
    mastery_before = details_before.get("avg_mastery", "?")
    stress_before  = details_before.get("stress",      "?")
    print(f"\n📊 BEFORE  |  Mastery: {mastery_before:.2f}  Stress: {stress_before:.2f}\n")

    history = []

    for step in range(1, steps + 1):
        # 1. Ask DQN for the best action given current DB state
        rec    = get_recommendation(student_id)
        action = rec["recommended_action"]
        deltas = ACTION_DELTAS[action]

        # 2. Apply environment-derived deltas back to DB
        push_state_update(
            student_id,
            mastery_delta=deltas["mastery_delta"],
            stress_delta=deltas["stress_delta"],
        )

        # 3. Read the updated state so we show real values
        report  = get_student_report(student_id)
        details = report.get("details", {})
        mastery = details.get("avg_mastery", 0.0)
        stress  = details.get("stress",      0.0)
        status  = report.get("status", "")

        # Emoji flavour
        if action == "Take a Break":
            icon = "💤"
        elif action == "Active Recall":
            icon = "🧠"
        elif action == "Take Quiz":
            icon = "📝"
        else:
            icon = "📺"

        print(
            f"Step {step:>2} {icon}  {action:<18} "
            f"| Mastery: {mastery:.3f}  Stress: {stress:.3f}  | {status}"
        )

        history.append({
            "step":          step,
            "action":        action,
            "mastery_after": round(mastery, 4),
            "stress_after":  round(stress,  4),
            "status":        status,
        })

        if delay > 0:
            time.sleep(delay)

    # Final snapshot
    report_after  = get_student_report(student_id)
    details_after = report_after.get("details", {})
    mastery_after = details_after.get("avg_mastery", "?")
    stress_after  = details_after.get("stress",      "?")

    print(f"\n📊 AFTER   |  Mastery: {mastery_after:.2f}  Stress: {stress_after:.2f}")
    print(f"\n🎯 AI Advice: {details_after.get('ai_advice', 'N/A')}")

    if isinstance(mastery_before, float) and isinstance(mastery_after, float):
        mastery_gain = mastery_after - mastery_before
        stress_delta = stress_after  - stress_before
        print(f"\n📈 Summary")
        print(f"   Mastery change : {mastery_gain:+.3f}")
        print(f"   Stress change  : {stress_delta:+.3f}")

    print("\n📋 Full action log:")
    print(json.dumps(history, indent=2))
    print("\n✅ Simulation complete.")
    return history


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="NeuroFlex Dynamic Session Simulation")
    parser.add_argument("--student", default="CS_STUDENT_001",  help="Student ID")
    parser.add_argument("--steps",   default=7,   type=int,     help="Number of steps (default 7)")
    parser.add_argument("--delay",   default=0.5, type=float,   help="Seconds between steps (default 0.5)")
    args = parser.parse_args()

    run_simulation(
        student_id=args.student,
        steps=args.steps,
        delay=args.delay,
    )