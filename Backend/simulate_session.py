import requests
import time

BASE_URL = "http://127.0.0.1:8000"
STUDENT_ID = "CS_STUDENT_001"

def run_simulation(steps=5):
    print(f"🚀 Starting Dynamic Neuro-Simulation for {STUDENT_ID}...\n")
    
    for i in range(steps):
        # 1. Get Recommendation
        res = requests.get(f"{BASE_URL}/recommend-action/{STUDENT_ID}")
        data = res.json()
        action = data['recommended_action']
        
        # 2. Decide the Impact
        m_delta, s_delta = 0.0, 0.0
        if action == "Take a Break":
            s_delta = -0.2  # Stress goes down
            impact = "💤 Resting..."
        elif action == "Active Recall" or action == "Take Quiz":
            m_delta = 0.1   # Mastery goes up
            s_delta = 0.05  # Stress goes up slightly from effort
            impact = "🧠 Learning..."
        else:
            impact = "📺 Reviewing..."

        # 3. POST the update back to the server
        requests.post(f"{BASE_URL}/update-state/{STUDENT_ID}", 
                      json={"mastery_delta": m_delta, "stress_delta": s_delta})
        
        print(f"Step {i+1}: AI -> {action} | {impact}")
        time.sleep(1)

if __name__ == "__main__":
    run_simulation()
