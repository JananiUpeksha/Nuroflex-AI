import os, json, asyncio, httpx
from datetime import datetime
from threading import Lock

# ── Groq config ────────────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL   = "llama-3.1-8b-instant"   # 14,400 req/day, 30 RPM free tier

# ── Rate-limit guard (25 RPM — safely under Groq's 30 RPM free limit) ─────────
MAX_RPM   = 25
_quota: dict = {"count": 0, "reset_minute": None}
_lock         = Lock()

def _available() -> bool:
    with _lock:
        now = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
        if _quota["reset_minute"] != now:
            _quota["count"]        = 0
            _quota["reset_minute"] = now
        if _quota["count"] >= MAX_RPM:
            return False
        _quota["count"] += 1
        return True

# ── Low-level Groq call ────────────────────────────────────────────────────────
async def _call_groq(prompt: str, max_tokens: int = 1024) -> str:
    """
    Send a single prompt to Groq and return the text response.
    Raises ValueError on rate-limit, RuntimeError on API errors.
    """
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY not set in backend .env")
    if not _available():
        raise ValueError("RATE_LIMITED")

    payload = {
        "model":      GROQ_MODEL,
        "messages":   [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
    }
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            res = await client.post(
                GROQ_URL,
                json=payload,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type":  "application/json",
                },
            )
    except httpx.TimeoutException:
        raise RuntimeError("Groq request timed out")
    except Exception as e:
        raise RuntimeError(f"Groq request failed: {e}")

    if res.status_code == 429:
        raise ValueError("RATE_LIMITED")
    if not res.is_success:
        raise RuntimeError(f"Groq API error {res.status_code}: {res.text}")

    data = res.json()
    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError):
        raise RuntimeError("Unexpected Groq response format")

# ── Shared JSON parser ─────────────────────────────────────────────────────────
def _parse_json(raw: str) -> list:
    clean = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(clean)

# ── Public service functions ───────────────────────────────────────────────────

async def generate_quiz(topic: str) -> list[dict]:
    """
    Generate 5 MCQ questions for a single topic.
    Returns a list of QuizQuestion dicts.
    """
    prompt = f"""Generate exactly 5 multiple-choice quiz questions about "{topic}" for a math student.
Return ONLY valid JSON array, no markdown, no extra text:
[
  {{
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correct": 0,
    "explanation": "..."
  }}
]
"correct" is the 0-based index of the correct option."""

    raw = await _call_groq(prompt, max_tokens=1024)
    return _parse_json(raw)


async def generate_weekly_quiz(topics: list[str]) -> list[dict]:
    """
    Generate 5 questions per topic sequentially with a small stagger,
    then shuffle and return all questions merged.
    """
    all_questions: list[dict] = []
    for i, topic in enumerate(topics):
        if i > 0:
            await asyncio.sleep(0.8)   # stagger to stay under RPM
        try:
            batch = await generate_quiz(topic)
            all_questions.extend(batch)
        except Exception as exc:
            print(f"[ai_service] weekly quiz batch failed for '{topic}': {exc}")

    # Shuffle so topics are interleaved
    import random
    random.shuffle(all_questions)
    return all_questions


async def chat_with_tutor(
    topic: str,
    history: list[dict],   # [{"role": "user"|"ai", "text": "..."}]
    message: str,
) -> str:
    """
    Continue a tutoring conversation for a given topic.
    history is the previous turns; message is the new student input.
    Returns the tutor's reply text.
    """
    history_text = "\n".join(
        f"{'Student' if m['role'] == 'user' else 'Tutor'}: {m['text']}"
        for m in history
    )

    prompt = f"""You are an expert, friendly math tutor specializing in "{topic}".
Keep responses concise (3-5 sentences max), use simple language, and include a short example when helpful.
Never use markdown formatting like ** or ## in your response — plain text only.
Conversation so far:
{history_text}
Student: {message}
Tutor:"""

    return await _call_groq(prompt, max_tokens=512)