import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Trophy, Sparkles, Video, BookOpen, Coffee,
  Target, X, Check, Brain, MessageCircle, Send, Loader2,
  ChevronRight, RotateCcw, Zap
} from 'lucide-react';

interface StudyPlanProps { userName: string; onBack: () => void; }

const API = 'http://127.0.0.1:8000';

interface QuizQuestion {
  question:    string;
  options:     string[];
  correct:     number;
  explanation: string;
}
interface ChatMessage { role: 'user' | 'ai'; text: string; }

async function fetchQuiz(topic: string): Promise<QuizQuestion[]> {
  const res = await fetch(`${API}/quiz/${encodeURIComponent(topic)}`);
  if (res.status === 429) throw new Error('RATE_LIMITED');
  if (!res.ok) throw new Error('Quiz fetch failed');
  const data = await res.json();
  return data.questions ?? [];
}

async function fetchWeeklyQuiz(topics: string[]): Promise<QuizQuestion[]> {
  const res = await fetch(`${API}/quiz/weekly`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topics }),
  });
  if (res.status === 429) throw new Error('RATE_LIMITED');
  if (!res.ok) throw new Error('Weekly quiz fetch failed');
  const data = await res.json();
  return data.questions ?? [];
}

async function fetchChatReply(
  topic: string,
  history: ChatMessage[],
  message: string,
): Promise<string> {
  const res = await fetch(`${API}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, history, message }),
  });
  if (res.status === 429) throw new Error('RATE_LIMITED');
  if (!res.ok) throw new Error('Chat fetch failed');
  const data = await res.json();
  return data.reply ?? 'No response.';
}

// ── Relaxing YouTube links (opens in new tab — never embeds) ──────────────────
const REST_LINKS = [
  "https://www.youtube.com/watch?v=inpok4MKVLM",
  "https://www.youtube.com/watch?v=4xDzrJKXOOY",
  "https://www.youtube.com/watch?v=1ZYbU82GVz4",
  "https://www.youtube.com/watch?v=sjkrrmBnpGE",
];

const getRestLink = () => REST_LINKS[Math.floor(Math.random() * REST_LINKS.length)];

// ── Quiz UI ───────────────────────────────────────────────────────────────────
const QuizUI = ({
  questions, loading, loadingMsg, onClose,
}: {
  questions: QuizQuestion[];
  loading: boolean;
  loadingMsg: string;
  onClose: () => void;
}) => {
  const [current,  setCurrent]  = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score,    setScore]    = useState(0);
  const [finished, setFinished] = useState(false);
  const [showExp,  setShowExp]  = useState(false);

  const retry = () => { setCurrent(0); setSelected(null); setScore(0); setFinished(false); setShowExp(false); };
  const next  = () => {
    if (current + 1 >= questions.length) { setFinished(true); return; }
    setCurrent(c => c + 1); setSelected(null); setShowExp(false);
  };
  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx); setShowExp(true);
    if (idx === questions[current].correct) setScore(s => s + 1);
  };

  const q   = questions[current];
  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;
  const grade = pct >= 90 ? { label: 'S', color: 'text-yellow-400',  msg: '🏆 Perfect Neural Mastery!'        }
              : pct >= 80 ? { label: 'A', color: 'text-emerald-400', msg: '🔥 Excellent Performance!'          }
              : pct >= 70 ? { label: 'B', color: 'text-blue-400',    msg: '💪 Great Effort, Keep Going!'       }
              : pct >= 60 ? { label: 'C', color: 'text-amber-400',   msg: '📚 Good Start, Review Weak Areas!'  }
              :             { label: 'F', color: 'text-rose-400',     msg: '🔁 Revisit All Topics This Week!'   };

  return (
    <div className="p-8 flex-1 overflow-y-auto">
      {loading && (
        <div className="flex flex-col items-center gap-4 py-16">
          <Loader2 size={40} className="text-[#6C4AB6] animate-spin" />
          <p className="text-white/60 font-bold uppercase tracking-widest text-xs">{loadingMsg}</p>
          <p className="text-white/30 text-xs">This may take a few seconds</p>
        </div>
      )}

      {!loading && questions.length === 0 && (
        <p className="text-white/60 text-center py-16">Failed to generate quiz. Try again.</p>
      )}

      {!loading && finished && (
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
              <circle cx="50" cy="50" r="42" fill="none" stroke="#6C4AB6" strokeWidth="8"
                strokeDasharray={`${pct * 2.638} 263.8`} strokeLinecap="round"/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-black ${grade.color}`}>{grade.label}</span>
              <span className="text-white/40 text-xs font-bold">{pct}%</span>
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-white font-black text-2xl">{score}/{questions.length} Correct</p>
            <p className="text-white/50 text-sm">{grade.msg}</p>
          </div>
          <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-white/50 text-xs font-black uppercase tracking-widest mb-3">Summary</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                <p className="text-emerald-400 font-black text-2xl">{score}</p>
                <p className="text-white/40 text-xs mt-1">Correct</p>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-center">
                <p className="text-rose-400 font-black text-2xl">{questions.length - score}</p>
                <p className="text-white/40 text-xs mt-1">Incorrect</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={retry} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 text-white font-black text-sm hover:bg-white/20 transition-all">
              <RotateCcw size={16}/> Retry
            </button>
            <button onClick={onClose} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#6C4AB6] text-white font-black text-sm hover:bg-[#7d5bc9] transition-all">
              Done
            </button>
          </div>
        </div>
      )}

      {!loading && !finished && q && (
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-xs font-bold">Question {current + 1} of {questions.length}</span>
              <span className="text-white/40 text-xs font-bold">Score: {score}/{current}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#6C4AB6] to-indigo-400 rounded-full transition-all duration-500"
                style={{ width: `${(current / questions.length) * 100}%` }} />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="shrink-0 w-8 h-8 rounded-lg bg-[#6C4AB6]/30 border border-[#6C4AB6]/40 flex items-center justify-center text-[#6C4AB6] font-black text-xs">
              {current + 1}
            </span>
            <p className="text-white font-black text-lg leading-snug">{q.question}</p>
          </div>

          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const isCorrect  = i === q.correct;
              const isSelected = i === selected;
              let cls = 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 cursor-pointer';
              if (selected !== null) {
                if (isCorrect)       cls = 'border-emerald-500 bg-emerald-500/20 text-emerald-300 cursor-default';
                else if (isSelected) cls = 'border-rose-500 bg-rose-500/20 text-rose-300 cursor-default';
                else                 cls = 'border-white/5 bg-white/3 text-white/25 cursor-default';
              }
              return (
                <button key={i} onClick={() => handleAnswer(i)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 font-bold text-sm transition-all ${cls}`}>
                  <span className="font-black mr-3 opacity-60">{String.fromCharCode(65 + i)}.</span>{opt}
                </button>
              );
            })}
          </div>

          {showExp && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-white/50 text-xs font-black uppercase tracking-widest mb-1">Explanation</p>
              <p className="text-white/80 text-sm leading-relaxed">{q.explanation}</p>
            </div>
          )}

          {selected !== null && (
            <button onClick={next}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#6C4AB6] text-white font-black uppercase tracking-widest text-sm hover:bg-[#7d5bc9] transition-all">
              {current + 1 >= questions.length ? '🏆 See Results' : 'Next Question'}
              <ChevronRight size={18}/>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ── Daily Quiz Modal ──────────────────────────────────────────────────────────
const QuizModal = ({ topic, onClose }: { topic: string; onClose: () => void }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    fetchQuiz(topic)
      .then(q => setQuestions(q))
      .catch(e => {
        if (e.message === 'RATE_LIMITED')
          setQuestions([{ question: '⚠️ Rate limit reached. Please wait ~1 minute.', options: [], correct: -1, explanation: '' }]);
      })
      .finally(() => setLoading(false));
  }, [topic]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl bg-[#0F0F1A] border border-[#6C4AB6]/40 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#6C4AB6] p-2 rounded-xl"><Zap size={18} className="text-white"/></div>
            <span className="text-white font-black uppercase tracking-widest text-sm">{topic} · Quiz</span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={22}/></button>
        </div>
        <QuizUI questions={questions} loading={loading} loadingMsg="Generating quiz with AI..." onClose={onClose}/>
      </div>
    </div>
  );
};

// ── Weekly Quiz Modal ─────────────────────────────────────────────────────────
const WeeklyQuizModal = ({ plan, onClose }: { plan: any[]; onClose: () => void }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const topics = [...new Set(plan.filter(d => d.type !== 'Rest').map(d => d.raw_topic))] as string[];
    fetchWeeklyQuiz(topics)
      .then(q => setQuestions(q))
      .catch(e => {
        if (e.message === 'RATE_LIMITED')
          setQuestions([{ question: '⚠️ Rate limit reached. Please wait ~1 minute.', options: [], correct: -1, explanation: '' }]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl bg-[#0F0F1A] border border-[#6C4AB6]/40 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#6C4AB6] to-indigo-500 p-2 rounded-xl">
              <Trophy size={18} className="text-white"/>
            </div>
            <div>
              <p className="text-white font-black uppercase tracking-widest text-sm">Weekly Assessment</p>
              {!loading && questions.length > 0 && (
                <p className="text-white/40 text-xs mt-0.5">{questions.length} questions · All topics</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={22}/></button>
        </div>
        <QuizUI questions={questions} loading={loading} loadingMsg="Generating questions per topic..." onClose={onClose}/>
      </div>
    </div>
  );
};

// ── Chat Modal ────────────────────────────────────────────────────────────────
const ChatModal = ({ topic, onClose }: { topic: string; onClose: () => void }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', text: `Hey! I'm your AI tutor for ${topic}. Ask me anything — concepts, examples, tricks, or practice problems. Let's go! 🚀` }
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const newHistory = [...messages, { role: 'user' as const, text }];
    setMessages(newHistory);
    setLoading(true);
    try {
      const reply = await fetchChatReply(topic, newHistory, text);
      setMessages(m => [...m, { role: 'ai', text: reply }]);
    } catch (e: any) {
      const msg = e.message === 'RATE_LIMITED'
        ? '⚠️ Rate limit reached. Please wait ~1 minute.'
        : '⚠️ Something went wrong. Please try again.';
      setMessages(m => [...m, { role: 'ai', text: msg }]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl h-[600px] bg-[#0F0F1A] border border-[#6C4AB6]/40 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#6C4AB6] p-2 rounded-xl"><Brain size={18} className="text-white"/></div>
            <div>
              <p className="text-white font-black uppercase tracking-widest text-sm">AI Tutor</p>
              <p className="text-white/40 text-xs">{topic}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={22}/></button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed font-medium
                ${msg.role === 'user'
                  ? 'bg-[#6C4AB6] text-white rounded-br-sm'
                  : 'bg-white/8 border border-white/10 text-white/85 rounded-bl-sm'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/8 border border-white/10 px-5 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                <Loader2 size={14} className="text-[#6C4AB6] animate-spin"/>
                <span className="text-white/40 text-xs font-bold">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        <div className="px-6 py-4 border-t border-white/10 shrink-0">
          <div className="flex gap-3 items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder={`Ask anything about ${topic}...`}
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/25 font-medium"/>
            <button onClick={send} disabled={loading || !input.trim()}
              className="bg-[#6C4AB6] p-2 rounded-lg disabled:opacity-30 hover:bg-[#7d5bc9] transition-all">
              <Send size={16} className="text-white"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Topic Icons & Day Themes ──────────────────────────────────────────────────
const TOPIC_ICONS: Record<string, string> = {
  "Polynomials":           "📐",
  "Chain Rule":            "🔗",
  "Integration by Parts":  "∫",
  "Matrix Multiplication": "🔢",
  "Probability":           "🎲",
};

const DAY_THEME: Record<string, {
  card: string; iconText: string;
  badge: string; badgeText: string;
  btnSolid: string; btnSolidHover: string;
  btnOutline: string; btnOutlineText: string; btnOutlineHover: string;
}> = {
  Monday:    { card: "bg-blue-50 border-blue-200",       iconText: "text-blue-700",    badge: "bg-blue-600",    badgeText: "text-white", btnSolid: "bg-blue-600",    btnSolidHover: "hover:bg-blue-700",    btnOutline: "border-blue-600",   btnOutlineText: "text-blue-600",   btnOutlineHover: "hover:bg-blue-600"   },
  Tuesday:   { card: "bg-emerald-50 border-emerald-200", iconText: "text-emerald-700", badge: "bg-emerald-600", badgeText: "text-white", btnSolid: "bg-emerald-600", btnSolidHover: "hover:bg-emerald-700", btnOutline: "border-emerald-600", btnOutlineText: "text-emerald-600", btnOutlineHover: "hover:bg-emerald-600" },
  Wednesday: { card: "bg-amber-50 border-amber-200",     iconText: "text-amber-700",   badge: "bg-amber-500",   badgeText: "text-white", btnSolid: "bg-amber-500",   btnSolidHover: "hover:bg-amber-600",   btnOutline: "border-amber-500",  btnOutlineText: "text-amber-600",  btnOutlineHover: "hover:bg-amber-500"  },
  Thursday:  { card: "bg-rose-50 border-rose-200",       iconText: "text-rose-700",    badge: "bg-rose-600",    badgeText: "text-white", btnSolid: "bg-rose-600",    btnSolidHover: "hover:bg-rose-700",    btnOutline: "border-rose-600",   btnOutlineText: "text-rose-600",   btnOutlineHover: "hover:bg-rose-600"   },
  Friday:    { card: "bg-indigo-50 border-indigo-200",   iconText: "text-indigo-700",  badge: "bg-indigo-600",  badgeText: "text-white", btnSolid: "bg-indigo-600",  btnSolidHover: "hover:bg-indigo-700",  btnOutline: "border-indigo-600", btnOutlineText: "text-indigo-600", btnOutlineHover: "hover:bg-indigo-600" },
  Saturday:  { card: "bg-violet-50 border-violet-200",   iconText: "text-violet-700",  badge: "bg-violet-600",  badgeText: "text-white", btnSolid: "bg-violet-600",  btnSolidHover: "hover:bg-violet-700",  btnOutline: "border-violet-600", btnOutlineText: "text-violet-600", btnOutlineHover: "hover:bg-violet-600" },
  Sunday:    { card: "bg-slate-50 border-slate-200",     iconText: "text-slate-700",   badge: "bg-slate-600",   badgeText: "text-white", btnSolid: "bg-slate-600",   btnSolidHover: "hover:bg-slate-700",   btnOutline: "border-slate-600",  btnOutlineText: "text-slate-600",  btnOutlineHover: "hover:bg-slate-600"  },
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const StudyPlanPage = ({ userName, onBack }: StudyPlanProps) => {
  const [plan,            setPlan]            = useState<any[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [subStatuses,     setSubStatuses]     = useState<Record<string, string>>({});
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [quizTopic,       setQuizTopic]       = useState<string | null>(null);
  const [chatTopic,       setChatTopic]       = useState<string | null>(null);
  const [weeklyQuiz,      setWeeklyQuiz]      = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/generate-7day-plan/${encodeURIComponent(userName)}`)
      .then(res => res.json())
      .then(data => { setPlan(data.weekly_plan); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userName]);

  const extractVideoId = (urlOrId: string): string => {
    if (!urlOrId) return '';
    try {
      const url = new URL(urlOrId);
      return url.searchParams.get('v') || url.pathname.split('/').pop() || urlOrId;
    } catch { return urlOrId; }
  };

  const getVideoForStep = (item: any, stepIndex: number): string | null => {
    const stack: any[] = item.learning_stack || [];
    if (!stack.length) return null;
    const entry = stack[stepIndex % stack.length];
    if (!entry) return null;
    const raw = entry.video_id || entry.videoId || entry.id || entry.url || entry.link || null;
    return raw ? extractVideoId(raw) : null;
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="w-16 h-16 border-4 border-[#6C4AB6] border-t-transparent rounded-full animate-spin mb-4"/>
      <p className="font-black text-[#6C4AB6] tracking-widest uppercase text-xs">Mapping Neural Path...</p>
    </div>
  );

  const steps = [
    { label: "Lesson",    icon: <Video size={14}/>,    color: "bg-blue-50 border-blue-200 text-blue-700"          },
    { label: "Practice",  icon: <BookOpen size={14}/>, color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
    { label: "Challenge", icon: <Target size={14}/>,   color: "bg-orange-50 border-orange-200 text-orange-700"    },
  ];

  return (
    <div className="h-screen bg-[#F8FAFC] p-6 font-sans flex flex-col relative overflow-hidden">

      {/* Video modal */}
      {selectedVideoId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-[2.5rem] overflow-hidden border-4 border-[#6C4AB6]">
            <button onClick={() => setSelectedVideoId(null)} className="absolute top-6 right-6 z-10 text-white bg-white/10 p-2 rounded-full hover:bg-white/20">
              <X size={28}/>
            </button>
            <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1`}
              frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen/>
          </div>
        </div>
      )}

      {quizTopic  && <QuizModal       topic={quizTopic} onClose={() => setQuizTopic(null)}/>}
      {chatTopic  && <ChatModal       topic={chatTopic} onClose={() => setChatTopic(null)}/>}
      {weeklyQuiz && <WeeklyQuizModal plan={plan}       onClose={() => setWeeklyQuiz(false)}/>}

      {/* Back */}
      <div className="max-w-5xl mx-auto w-full mb-4 z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 font-bold hover:text-[#6C4AB6]">
          <ArrowLeft size={18}/> BACK
        </button>
      </div>

      <div className="max-w-5xl mx-auto w-full bg-white rounded-[3rem] shadow-xl flex-1 flex flex-col overflow-hidden border border-slate-100 z-10">
        <div className="px-10 py-6 border-b flex items-center gap-4 bg-white/80">
          <div className="bg-[#6C4AB6] p-3 rounded-2xl text-white shadow-lg"><Sparkles size={24}/></div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
            Success Roadmap: {userName}
          </h1>
        </div>

        <div className="flex-1 px-8 py-6 overflow-y-auto space-y-5 bg-slate-50/30">
          {plan.map((item, pIdx) => {
            const theme     = DAY_THEME[item.day] ?? DAY_THEME.Sunday;
            const topicIcon = TOPIC_ICONS[item.raw_topic] ?? "📚";
            const isRest    = item.type === 'Rest';

            return (
              <div key={`${item.day}-${pIdx}`}
                className={`flex flex-col md:flex-row items-start md:items-center justify-between p-7 rounded-[2.5rem] border-2 shadow-sm gap-6 ${
                  isRest ? 'bg-purple-50 border-purple-200' : theme.card
                }`}>

                <div className="flex items-center gap-6 flex-1">
                  {/* Day icon */}
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center bg-white shadow-md shrink-0 ${
                    isRest ? 'text-purple-600' : theme.iconText
                  }`}>
                    <span className="font-black text-xl leading-none">{item.day[0]}</span>
                    <span className="text-lg leading-none mt-0.5">{isRest ? '☕' : topicIcon}</span>
                  </div>

                  <div>
                    {/* Day name + badge */}
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h4 className="font-black text-slate-800 text-2xl tracking-tight leading-none">{item.day}</h4>
                      {isRest ? (
                        <span className="px-4 py-1.5 bg-purple-500 text-white rounded-full text-sm font-black uppercase tracking-widest flex items-center gap-1.5">
                          ☕ Rest Day
                        </span>
                      ) : (
                        <span className={`px-4 py-1.5 ${theme.badge} ${theme.badgeText} rounded-full text-sm font-black uppercase tracking-widest flex items-center gap-1.5`}>
                          <span>{topicIcon}</span> {item.task_title}
                        </span>
                      )}
                    </div>

                    {/* Instruction */}
                    <p className="text-[14px] font-bold text-slate-600 italic leading-relaxed">
                      {isRest
                        ? '"Your brain is rewiring. Rest is part of the plan. Recharge today."'
                        : `"${item.instruction}"`}
                    </p>

                    {/* Quiz / Chat buttons — only on study days */}
                    {!isRest && (
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => setQuizTopic(item.raw_topic)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl ${theme.btnSolid} ${theme.btnSolidHover} text-white font-black text-[11px] uppercase tracking-widest transition-all shadow-sm hover:scale-105`}>
                          <Zap size={12}/> AI Quiz
                        </button>
                        <button onClick={() => setChatTopic(item.raw_topic)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border-2 ${theme.btnOutline} ${theme.btnOutlineText} font-black text-[11px] uppercase tracking-widest ${theme.btnOutlineHover} hover:text-white transition-all shadow-sm hover:scale-105`}>
                          <MessageCircle size={12}/> Ask AI
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side */}
                <div className="flex flex-col gap-3 w-full md:w-[280px]">
                  {isRest ? (
                    <div className="flex flex-col gap-3">
                      {/* Neural Recharge — opens YouTube in new tab */}
                      <button
                        onClick={() => window.open(getRestLink(), '_blank')}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black text-xs uppercase shadow-md flex items-center justify-center gap-3 hover:scale-105 transition-all">
                        <Coffee size={20}/> Neural Recharge
                      </button>
                      <div className="bg-purple-100 border border-purple-200 rounded-2xl px-4 py-3 text-center">
                        <p className="text-purple-700 font-black text-xs uppercase tracking-widest mb-1">Today's Tip</p>
                        <p className="text-purple-600 text-xs font-medium">Sleep, hydrate, take a walk 🌿</p>
                      </div>
                    </div>
                  ) : (
                    steps.map((step, sIdx) => {
                      const id      = `${item.day}-${sIdx}`;
                      const status  = subStatuses[id];
                      const videoId = getVideoForStep(item, sIdx);
                      const handleStepClick = () => {
                        if (videoId) setSelectedVideoId(videoId);
                        else window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(`${item.raw_topic} ${step.label} tutorial`)}`, '_blank');
                      };
                      return (
                        <div key={sIdx} className="flex items-center gap-2">
                          <button onClick={handleStepClick}
                            className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl font-black text-[10px] uppercase border-2 transition-all shadow-sm hover:scale-105
                              ${status === 'done'   ? 'bg-emerald-500 border-emerald-500 text-white' :
                                status === 'missed' ? 'bg-rose-500 border-rose-500 text-white' :
                                `bg-white ${step.color}`}`}>
                            {step.icon} {step.label}
                          </button>
                          <div className="flex gap-1">
                            <button onClick={e => { e.stopPropagation(); setSubStatuses(p => ({ ...p, [id]: status === 'done' ? '' : 'done' })); }}
                              className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors ${status === 'done' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-300 hover:border-emerald-400'}`}>
                              <Check size={14}/>
                            </button>
                            <button onClick={e => { e.stopPropagation(); setSubStatuses(p => ({ ...p, [id]: status === 'missed' ? '' : 'missed' })); }}
                              className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors ${status === 'missed' ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-slate-300 hover:border-rose-400'}`}>
                              <X size={14}/>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}

          <div className="pt-10 flex flex-col items-center pb-6">
            <button onClick={() => setWeeklyQuiz(true)}
              className="flex items-center gap-4 bg-gradient-to-r from-[#6C4AB6] to-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black text-sm shadow-xl hover:scale-105 transition-all group">
              <Trophy size={22} className="group-hover:rotate-12 transition-transform"/> TAKE WEEKLY ASSESSMENT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanPage;