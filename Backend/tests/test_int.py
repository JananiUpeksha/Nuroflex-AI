"""
tests/test_int.py
Integration tests — only the AI and CORS endpoints.
DB-dependent endpoints (study plan, student report) are tested in test_system.py.
All Groq calls are mocked — no network, no quota consumed.

Run: pytest tests/test_int.py -v
"""

import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

SAMPLE_QUESTIONS = [
    {
        "question":    f"Q{i}",
        "options":     ["A", "B", "C", "D"],
        "correct":     0,
        "explanation": f"E{i}",
    }
    for i in range(5)
]


@pytest.fixture(scope="module")
def client():
    with patch("app.services.ai_service.GROQ_API_KEY", "fake-test-key"), \
         patch("app.main.discovery_service"):
        from app.main import app
        with TestClient(app) as c:
            yield c


# ══════════════════════════════════════════════════════════════════════════════
# 1. Daily quiz  GET /quiz/{topic}
# ══════════════════════════════════════════════════════════════════════════════
class TestDailyQuizEndpoint:

    def test_returns_questions_list(self, client):
        with patch("app.main.generate_quiz", new=AsyncMock(return_value=SAMPLE_QUESTIONS)):
            res = client.get("/quiz/Polynomials")
        assert res.status_code == 200
        assert "questions" in res.json()
        assert len(res.json()["questions"]) == 5

    def test_question_structure(self, client):
        with patch("app.main.generate_quiz", new=AsyncMock(return_value=SAMPLE_QUESTIONS)):
            res = client.get("/quiz/Chain%20Rule")
        for q in res.json()["questions"]:
            assert "question"    in q
            assert "options"     in q
            assert "correct"     in q
            assert "explanation" in q

    def test_rate_limit_returns_429(self, client):
        with patch("app.main.generate_quiz", new=AsyncMock(side_effect=ValueError("RATE_LIMITED"))):
            res = client.get("/quiz/Probability")
        assert res.status_code == 429

    def test_server_error_returns_500(self, client):
        with patch("app.main.generate_quiz", new=AsyncMock(side_effect=RuntimeError("broke"))):
            res = client.get("/quiz/Probability")
        assert res.status_code == 500

    def test_url_encoded_topic(self, client):
        with patch("app.main.generate_quiz", new=AsyncMock(return_value=SAMPLE_QUESTIONS)):
            res = client.get("/quiz/Integration%20by%20Parts")
        assert res.status_code == 200


# ══════════════════════════════════════════════════════════════════════════════
# 2. Weekly quiz  POST /quiz/weekly
# ══════════════════════════════════════════════════════════════════════════════
class TestWeeklyQuizEndpoint:

    def test_returns_merged_questions(self, client):
        weekly = SAMPLE_QUESTIONS * 3
        with patch("app.main.generate_weekly_quiz", new=AsyncMock(return_value=weekly)):
            res = client.post("/quiz/weekly", json={"topics": ["Polynomials", "Chain Rule", "Probability"]})
        assert res.status_code == 200
        assert len(res.json()["questions"]) == 15

    def test_empty_topics_returns_400(self, client):
        res = client.post("/quiz/weekly", json={"topics": []})
        assert res.status_code == 400

    def test_missing_topics_field_returns_422(self, client):
        res = client.post("/quiz/weekly", json={})
        assert res.status_code == 422

    def test_rate_limit_returns_429(self, client):
        with patch("app.main.generate_weekly_quiz", new=AsyncMock(side_effect=ValueError("RATE_LIMITED"))):
            res = client.post("/quiz/weekly", json={"topics": ["Polynomials"]})
        assert res.status_code == 429


# ══════════════════════════════════════════════════════════════════════════════
# 3. Chat  POST /chat
# ══════════════════════════════════════════════════════════════════════════════
class TestChatEndpoint:

    def test_returns_reply(self, client):
        with patch("app.main.chat_with_tutor", new=AsyncMock(return_value="Great question!")):
            res = client.post("/chat", json={
                "topic":   "Integration by Parts",
                "history": [],
                "message": "Explain it simply",
            })
        assert res.status_code == 200
        assert res.json()["reply"] == "Great question!"

    def test_with_history(self, client):
        history = [{"role": "user", "text": "Hi"}, {"role": "ai", "text": "Hello!"}]
        with patch("app.main.chat_with_tutor", new=AsyncMock(return_value="Sure!")):
            res = client.post("/chat", json={
                "topic":   "Probability",
                "history": history,
                "message": "Continue",
            })
        assert res.status_code == 200

    def test_missing_message_returns_422(self, client):
        res = client.post("/chat", json={"topic": "Polynomials", "history": []})
        assert res.status_code == 422

    def test_missing_topic_returns_422(self, client):
        res = client.post("/chat", json={"history": [], "message": "hi"})
        assert res.status_code == 422

    def test_rate_limit_returns_429(self, client):
        with patch("app.main.chat_with_tutor", new=AsyncMock(side_effect=ValueError("RATE_LIMITED"))):
            res = client.post("/chat", json={
                "topic": "Polynomials", "history": [], "message": "hi"
            })
        assert res.status_code == 429

    def test_empty_history_is_valid(self, client):
        with patch("app.main.chat_with_tutor", new=AsyncMock(return_value="answer")):
            res = client.post("/chat", json={
                "topic": "Polynomials", "history": [], "message": "What is it?"
            })
        assert res.status_code == 200


# ══════════════════════════════════════════════════════════════════════════════
# 4. CORS
# ══════════════════════════════════════════════════════════════════════════════
class TestCORSHeaders:

    def test_options_preflight_allowed(self, client):
        res = client.options(
            "/chat",
            headers={
                "Origin":                        "http://localhost:5173",
                "Access-Control-Request-Method": "POST",
            }
        )
        assert res.status_code in (200, 204)