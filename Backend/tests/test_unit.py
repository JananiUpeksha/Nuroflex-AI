"""
tests/test_unit.py
Unit tests — pure logic, no network, no DB, no real AI calls.
All external dependencies are mocked.

Run: pytest tests/test_unit.py -v
"""

import pytest, json, asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime


# ══════════════════════════════════════════════════════════════════════════════
# 1. ai_service — _parse_json
# ══════════════════════════════════════════════════════════════════════════════
class TestParseJson:
    """Unit tests for the shared JSON parser in ai_service."""

    def _parse(self, raw: str):
        from app.services.ai_service import _parse_json
        return _parse_json(raw)

    def test_plain_json_array(self):
        raw = '[{"question": "Q1", "options": ["A","B","C","D"], "correct": 0, "explanation": "E"}]'
        result = self._parse(raw)
        assert isinstance(result, list)
        assert result[0]["question"] == "Q1"

    def test_strips_markdown_fences(self):
        raw = '```json\n[{"question": "Q2", "options": [], "correct": 0, "explanation": ""}]\n```'
        result = self._parse(raw)
        assert result[0]["question"] == "Q2"

    def test_strips_plain_fences(self):
        raw = '```[{"question": "Q3", "options": [], "correct": 1, "explanation": ""}]```'
        result = self._parse(raw)
        assert result[0]["correct"] == 1

    def test_raises_on_invalid_json(self):
        with pytest.raises(json.JSONDecodeError):
            self._parse("not json at all")

    def test_empty_array(self):
        result = self._parse("[]")
        assert result == []

    def test_multiple_questions(self):
        items = [{"question": f"Q{i}", "options": ["A","B","C","D"], "correct": 0, "explanation": ""} for i in range(5)]
        raw = json.dumps(items)
        result = self._parse(raw)
        assert len(result) == 5


# ══════════════════════════════════════════════════════════════════════════════
# 2. ai_service — rate-limit guard (_available)
# ══════════════════════════════════════════════════════════════════════════════
class TestRateLimitGuard:
    """Unit tests for the per-minute RPM guard."""

    def setup_method(self):
        # Reset quota state before each test
        import app.services.ai_service as svc
        svc._quota["count"] = 0
        svc._quota["reset_minute"] = None

    def test_allows_first_request(self):
        from app.services.ai_service import _available
        assert _available() is True

    def test_increments_counter(self):
        import app.services.ai_service as svc
        from app.services.ai_service import _available
        _available()
        assert svc._quota["count"] == 1

    def test_blocks_after_max_rpm(self):
        import app.services.ai_service as svc
        from app.services.ai_service import _available, MAX_RPM
        svc._quota["count"] = MAX_RPM
        svc._quota["reset_minute"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
        assert _available() is False

    def test_resets_on_new_minute(self):
        import app.services.ai_service as svc
        from app.services.ai_service import _available, MAX_RPM
        # Simulate previous minute fully used
        svc._quota["count"] = MAX_RPM
        svc._quota["reset_minute"] = "2000-01-01 00:00"   # old minute
        # Should reset and allow
        assert _available() is True
        assert svc._quota["count"] == 1

    def test_allows_exactly_max_rpm_requests(self):
        import app.services.ai_service as svc
        from app.services.ai_service import _available, MAX_RPM
        svc._quota["reset_minute"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
        svc._quota["count"] = 0
        results = [_available() for _ in range(MAX_RPM + 2)]
        assert results[:MAX_RPM] == [True] * MAX_RPM
        assert results[MAX_RPM] is False


# ══════════════════════════════════════════════════════════════════════════════
# 3. ai_service — _call_groq
# ══════════════════════════════════════════════════════════════════════════════
class TestCallGroq:
    """Unit tests for the low-level Groq HTTP wrapper."""

    def setup_method(self):
        import app.services.ai_service as svc
        svc._quota["count"] = 0
        svc._quota["reset_minute"] = None

    @pytest.mark.asyncio
    async def test_raises_if_no_api_key(self):
        with patch("app.services.ai_service.GROQ_API_KEY", None):
            from app.services.ai_service import _call_groq
            with pytest.raises(RuntimeError, match="GROQ_API_KEY"):
                await _call_groq("hi")

    @pytest.mark.asyncio
    async def test_raises_value_error_on_rate_limit(self):
        import app.services.ai_service as svc
        from app.services.ai_service import _call_groq, MAX_RPM
        svc._quota["count"] = MAX_RPM
        svc._quota["reset_minute"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
        with patch("app.services.ai_service.GROQ_API_KEY", "fake-key"):
            with pytest.raises(ValueError, match="RATE_LIMITED"):
                await _call_groq("hi")

    @pytest.mark.asyncio
    async def test_returns_text_on_success(self):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.is_success = True
        mock_response.json.return_value = {
            "choices": [{"message": {"content": "Hello!"}}]
        }
        with patch("app.services.ai_service.GROQ_API_KEY", "fake-key"), \
             patch("httpx.AsyncClient") as MockClient:
            instance = MockClient.return_value.__aenter__.return_value
            instance.post = AsyncMock(return_value=mock_response)
            from app.services.ai_service import _call_groq
            result = await _call_groq("hi")
        assert result == "Hello!"

    @pytest.mark.asyncio
    async def test_raises_runtime_error_on_429(self):
        mock_response = MagicMock()
        mock_response.status_code = 429
        mock_response.is_success = False
        with patch("app.services.ai_service.GROQ_API_KEY", "fake-key"), \
             patch("httpx.AsyncClient") as MockClient:
            instance = MockClient.return_value.__aenter__.return_value
            instance.post = AsyncMock(return_value=mock_response)
            from app.services.ai_service import _call_groq
            with pytest.raises(ValueError, match="RATE_LIMITED"):
                await _call_groq("hi")

    @pytest.mark.asyncio
    async def test_raises_on_timeout(self):
        import httpx
        with patch("app.services.ai_service.GROQ_API_KEY", "fake-key"), \
             patch("httpx.AsyncClient") as MockClient:
            instance = MockClient.return_value.__aenter__.return_value
            instance.post = AsyncMock(side_effect=httpx.TimeoutException("timeout"))
            from app.services.ai_service import _call_groq
            with pytest.raises(RuntimeError, match="timed out"):
                await _call_groq("hi")

    @pytest.mark.asyncio
    async def test_raises_on_malformed_response(self):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.is_success = True
        mock_response.json.return_value = {"unexpected": "structure"}
        with patch("app.services.ai_service.GROQ_API_KEY", "fake-key"), \
             patch("httpx.AsyncClient") as MockClient:
            instance = MockClient.return_value.__aenter__.return_value
            instance.post = AsyncMock(return_value=mock_response)
            from app.services.ai_service import _call_groq
            with pytest.raises(RuntimeError, match="Unexpected"):
                await _call_groq("hi")


# ══════════════════════════════════════════════════════════════════════════════
# 4. ai_service — generate_quiz
# ══════════════════════════════════════════════════════════════════════════════
class TestGenerateQuiz:
    """Unit tests for the quiz generation service function."""

    def setup_method(self):
        import app.services.ai_service as svc
        svc._quota["count"] = 0
        svc._quota["reset_minute"] = None

    def _make_questions(self, n=5):
        return [
            {"question": f"Q{i}", "options": ["A","B","C","D"], "correct": 0, "explanation": f"E{i}"}
            for i in range(n)
        ]

    @pytest.mark.asyncio
    async def test_returns_list_of_dicts(self):
        questions = self._make_questions()
        with patch("app.services.ai_service._call_groq", new=AsyncMock(return_value=json.dumps(questions))):
            from app.services.ai_service import generate_quiz
            result = await generate_quiz("Polynomials")
        assert isinstance(result, list)
        assert len(result) == 5

    @pytest.mark.asyncio
    async def test_each_question_has_required_keys(self):
        questions = self._make_questions()
        with patch("app.services.ai_service._call_groq", new=AsyncMock(return_value=json.dumps(questions))):
            from app.services.ai_service import generate_quiz
            result = await generate_quiz("Chain Rule")
        for q in result:
            assert "question"    in q
            assert "options"     in q
            assert "correct"     in q
            assert "explanation" in q

    @pytest.mark.asyncio
    async def test_propagates_rate_limit_error(self):
        with patch("app.services.ai_service._call_groq", new=AsyncMock(side_effect=ValueError("RATE_LIMITED"))):
            from app.services.ai_service import generate_quiz
            with pytest.raises(ValueError, match="RATE_LIMITED"):
                await generate_quiz("Probability")


# ══════════════════════════════════════════════════════════════════════════════
# 5. ai_service — generate_weekly_quiz
# ══════════════════════════════════════════════════════════════════════════════
class TestGenerateWeeklyQuiz:
    """Unit tests for the weekly quiz batch generator."""

    def _make_questions(self, n=5):
        return [
            {"question": f"Q{i}", "options": ["A","B","C","D"], "correct": 0, "explanation": ""}
            for i in range(n)
        ]

    @pytest.mark.asyncio
    async def test_merges_all_topic_batches(self):
        questions = self._make_questions(5)
        with patch("app.services.ai_service.generate_quiz", new=AsyncMock(return_value=questions)), \
             patch("asyncio.sleep", new=AsyncMock()):
            from app.services.ai_service import generate_weekly_quiz
            result = await generate_weekly_quiz(["Polynomials", "Chain Rule", "Probability"])
        assert len(result) == 15   # 3 topics × 5 questions

    @pytest.mark.asyncio
    async def test_skips_failed_topic_gracefully(self):
        good = self._make_questions(5)
        async def mock_quiz(topic):
            if topic == "Bad Topic": raise RuntimeError("fail")
            return good
        with patch("app.services.ai_service.generate_quiz", new=mock_quiz), \
             patch("asyncio.sleep", new=AsyncMock()):
            from app.services.ai_service import generate_weekly_quiz
            result = await generate_weekly_quiz(["Polynomials", "Bad Topic", "Probability"])
        assert len(result) == 10   # only 2 successful × 5

    @pytest.mark.asyncio
    async def test_returns_empty_list_when_all_fail(self):
        with patch("app.services.ai_service.generate_quiz", new=AsyncMock(side_effect=RuntimeError("fail"))), \
             patch("asyncio.sleep", new=AsyncMock()):
            from app.services.ai_service import generate_weekly_quiz
            result = await generate_weekly_quiz(["A", "B"])
        assert result == []

    @pytest.mark.asyncio
    async def test_result_is_shuffled(self):
        # Questions from different topics should be interleaved (not strictly ordered)
        topic_questions = {
            "T1": [{"question": f"T1-Q{i}", "options": [], "correct": 0, "explanation": ""} for i in range(5)],
            "T2": [{"question": f"T2-Q{i}", "options": [], "correct": 0, "explanation": ""} for i in range(5)],
        }
        async def mock_quiz(topic): return topic_questions[topic]
        with patch("app.services.ai_service.generate_quiz", new=mock_quiz), \
             patch("asyncio.sleep", new=AsyncMock()):
            from app.services.ai_service import generate_weekly_quiz
            result = await generate_weekly_quiz(["T1", "T2"])
        assert len(result) == 10


# ══════════════════════════════════════════════════════════════════════════════
# 6. ai_service — chat_with_tutor
# ══════════════════════════════════════════════════════════════════════════════
class TestChatWithTutor:
    """Unit tests for the chat service function."""

    @pytest.mark.asyncio
    async def test_returns_string_reply(self):
        with patch("app.services.ai_service._call_groq", new=AsyncMock(return_value="Great question!")):
            from app.services.ai_service import chat_with_tutor
            result = await chat_with_tutor("Polynomials", [], "What is a polynomial?")
        assert result == "Great question!"

    @pytest.mark.asyncio
    async def test_includes_history_in_prompt(self):
        captured = {}
        async def mock_call(prompt, **kwargs):
            captured["prompt"] = prompt
            return "reply"
        with patch("app.services.ai_service._call_groq", new=mock_call):
            from app.services.ai_service import chat_with_tutor
            history = [{"role": "user", "text": "Hello"}, {"role": "ai", "text": "Hi!"}]
            await chat_with_tutor("Chain Rule", history, "Explain it")
        assert "Student: Hello" in captured["prompt"]
        assert "Tutor: Hi!"    in captured["prompt"]
        assert "Explain it"    in captured["prompt"]

    @pytest.mark.asyncio
    async def test_includes_topic_in_prompt(self):
        captured = {}
        async def mock_call(prompt, **kwargs):
            captured["prompt"] = prompt
            return "reply"
        with patch("app.services.ai_service._call_groq", new=mock_call):
            from app.services.ai_service import chat_with_tutor
            await chat_with_tutor("Matrix Multiplication", [], "hi")
        assert "Matrix Multiplication" in captured["prompt"]

    @pytest.mark.asyncio
    async def test_propagates_rate_limit(self):
        with patch("app.services.ai_service._call_groq", new=AsyncMock(side_effect=ValueError("RATE_LIMITED"))):
            from app.services.ai_service import chat_with_tutor
            with pytest.raises(ValueError, match="RATE_LIMITED"):
                await chat_with_tutor("Probability", [], "hi")


# ══════════════════════════════════════════════════════════════════════════════
# 7. main.py — plan helpers (no DB, no network)
# ══════════════════════════════════════════════════════════════════════════════
class TestPlanHelpers:
    """Unit tests for _activity_to_type and get_detailed_mission."""

    def test_activity_to_type_video(self):
        from app.main import _activity_to_type
        assert _activity_to_type("Watch Video") == "Video"

    def test_activity_to_type_quiz(self):
        from app.main import _activity_to_type
        assert _activity_to_type("Take Quiz") == "Quiz"

    def test_activity_to_type_exercise(self):
        from app.main import _activity_to_type
        assert _activity_to_type("Active Recall") == "Exercise"

    def test_activity_to_type_rest(self):
        from app.main import _activity_to_type
        assert _activity_to_type("Take a Break") == "Rest"

    def test_activity_to_type_unknown_defaults_rest(self):
        from app.main import _activity_to_type
        assert _activity_to_type("Something Random") == "Rest"

    def test_mission_video(self):
        from app.main import get_detailed_mission
        result = get_detailed_mission("Polynomials", "Video")
        assert "Polynomials" in result
        assert "Visualizing" in result

    def test_mission_quiz(self):
        from app.main import get_detailed_mission
        result = get_detailed_mission("Chain Rule", "Quiz")
        assert "Chain Rule" in result
        assert "Instinct" in result

    def test_mission_rest(self):
        from app.main import get_detailed_mission
        result = get_detailed_mission("anything", "Rest")
        assert "Neural Consolidation" in result

    def test_mission_unknown_type(self):
        from app.main import get_detailed_mission
        result = get_detailed_mission("Probability", "Unknown")
        assert "Probability" in result


# ══════════════════════════════════════════════════════════════════════════════
# 8. YouTube quota guard (no network)
# ══════════════════════════════════════════════════════════════════════════════
class TestYouTubeQuotaGuard:
    """Unit tests for the YouTube daily quota counter."""

    def setup_method(self):
        import app.main as m
        from datetime import date
        m._yt_quota["count"]      = 0
        m._yt_quota["reset_date"] = date.today()

    def test_allows_first_fetch(self):
        from app.main import _yt_quota_available
        assert _yt_quota_available() is True

    def test_blocks_after_max(self):
        import app.main as m
        from app.main import _yt_quota_available, MAX_DAILY_FETCHES
        m._yt_quota["count"] = MAX_DAILY_FETCHES
        assert _yt_quota_available() is False

    def test_resets_on_new_day(self):
        import app.main as m
        from app.main import _yt_quota_available, MAX_DAILY_FETCHES
        from datetime import date, timedelta
        m._yt_quota["count"]      = MAX_DAILY_FETCHES
        m._yt_quota["reset_date"] = date.today() - timedelta(days=1)
        assert _yt_quota_available() is True
        assert m._yt_quota["count"] == 1