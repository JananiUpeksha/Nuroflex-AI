"""
tests/test_system.py
System tests — treat the running server as a black box.
Requires: uvicorn app.main:app --reload running on port 8000.

Run:  pytest tests/test_system.py -v -m system
Skip: pytest tests/ -m "not system"
"""

import pytest, requests

BASE = "http://127.0.0.1:8000"
pytestmark = pytest.mark.system


def server_running() -> bool:
    try:
        requests.get(f"{BASE}/docs", timeout=3)
        return True
    except Exception:
        return False


@pytest.fixture(scope="module", autouse=True)
def require_server():
    if not server_running():
        pytest.skip("uvicorn not running — start with: uvicorn app.main:app --reload")


# ══════════════════════════════════════════════════════════════════════════════
# 1. Server availability
# ══════════════════════════════════════════════════════════════════════════════
class TestServerAvailability:

    def test_docs_endpoint_reachable(self):
        res = requests.get(f"{BASE}/docs", timeout=5)
        assert res.status_code == 200

    def test_openapi_schema_available(self):
        res = requests.get(f"{BASE}/openapi.json", timeout=5)
        assert res.status_code == 200
        assert "paths" in res.json()


# ══════════════════════════════════════════════════════════════════════════════
# 2. Study plan — end-to-end
# ══════════════════════════════════════════════════════════════════════════════
class TestStudyPlanE2E:

    def test_returns_7_day_plan(self):
        res = requests.get(f"{BASE}/generate-7day-plan/Janani%20Upeksha", timeout=10)
        assert res.status_code == 200
        assert len(res.json()["weekly_plan"]) == 7

    def test_plan_days_in_order(self):
        res = requests.get(f"{BASE}/generate-7day-plan/Aman%20Perera", timeout=10)
        days = [d["day"] for d in res.json()["weekly_plan"]]
        assert days == ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]

    def test_all_topics_from_pool(self):
        valid = {"Polynomials","Chain Rule","Integration by Parts","Matrix Multiplication","Probability"}
        res = requests.get(f"{BASE}/generate-7day-plan/Sarah%20Silva", timeout=10)
        for day in res.json()["weekly_plan"]:
            if day["type"] != "Rest":
                assert day["raw_topic"] in valid

    def test_plan_is_idempotent(self):
        url = f"{BASE}/generate-7day-plan/Raj%20Kumar"
        plan1 = requests.get(url, timeout=10).json()["weekly_plan"]
        plan2 = requests.get(url, timeout=10).json()["weekly_plan"]
        assert [d["raw_topic"] for d in plan1] == [d["raw_topic"] for d in plan2]

    def test_unknown_student_404(self):
        res = requests.get(f"{BASE}/generate-7day-plan/Nobody%20Here", timeout=5)
        assert res.status_code == 404


# ══════════════════════════════════════════════════════════════════════════════
# 3. Student report — end-to-end
# ══════════════════════════════════════════════════════════════════════════════
class TestStudentReportE2E:

    def test_report_structure(self):
        res = requests.get(f"{BASE}/student-report/Li%20Wei", timeout=5)
        assert res.status_code == 200
        assert "status"  in res.json()
        assert "details" in res.json()

    def test_report_detail_fields(self):
        res = requests.get(f"{BASE}/student-report/Elena%20Rossi", timeout=5)
        details = res.json()["details"]
        for key in ["ai_advice","learning_efficiency","focus","consistency_score","memory_strength"]:
            assert key in details


# ══════════════════════════════════════════════════════════════════════════════
# 4. Daily quiz — end-to-end (real Groq call)
# ══════════════════════════════════════════════════════════════════════════════
class TestDailyQuizE2E:

    def test_returns_5_questions(self):
        res = requests.get(f"{BASE}/quiz/Polynomials", timeout=30)
        assert res.status_code == 200
        assert len(res.json()["questions"]) == 5

    def test_question_has_4_options(self):
        res = requests.get(f"{BASE}/quiz/Probability", timeout=30)
        for q in res.json()["questions"]:
            assert len(q["options"]) == 4

    def test_correct_index_in_range(self):
        res = requests.get(f"{BASE}/quiz/Chain%20Rule", timeout=30)
        for q in res.json()["questions"]:
            assert 0 <= q["correct"] <= 3

    def test_explanation_is_non_empty(self):
        res = requests.get(f"{BASE}/quiz/Matrix%20Multiplication", timeout=30)
        for q in res.json()["questions"]:
            assert len(q["explanation"]) > 0


# ══════════════════════════════════════════════════════════════════════════════
# 5. Weekly quiz — end-to-end
# ══════════════════════════════════════════════════════════════════════════════
class TestWeeklyQuizE2E:

    def test_empty_topics_returns_400(self):
        res = requests.post(f"{BASE}/quiz/weekly", json={"topics": []}, timeout=5)
        assert res.status_code == 400

    def test_question_structure_valid(self):
        res = requests.post(
            f"{BASE}/quiz/weekly",
            json={"topics": ["Chain Rule"]},
            timeout=30,
        )
        for q in res.json()["questions"]:
            assert "question"    in q
            assert "options"     in q
            assert "correct"     in q
            assert "explanation" in q


# ══════════════════════════════════════════════════════════════════════════════
# 6. Chat — end-to-end
# ══════════════════════════════════════════════════════════════════════════════
class TestChatE2E:

    def test_missing_fields_return_422(self):
        res = requests.post(f"{BASE}/chat", json={"topic": "Polynomials"}, timeout=5)
        assert res.status_code == 422


# ══════════════════════════════════════════════════════════════════════════════
# 7. CORS — end-to-end
# ══════════════════════════════════════════════════════════════════════════════
class TestCORSE2E:

    def test_cors_header_on_plan_response(self):
        res = requests.get(
            f"{BASE}/generate-7day-plan/Chloe%20Bennet",
            headers={"Origin": "http://localhost:5173"},
            timeout=10,
        )
        assert "access-control-allow-origin" in res.headers

    def test_cors_wildcard_value(self):
        res = requests.get(
            f"{BASE}/generate-7day-plan/Omar%20Hassan",
            headers={"Origin": "http://localhost:5173"},
            timeout=10,
        )
        assert res.headers.get("access-control-allow-origin") == "*"