import React, { useState } from 'react';
import { ArrowLeft, UserCheck, TrendingUp, Brain, Target, Zap, Activity, BookOpen, Coffee, AlertTriangle, CheckCircle, Star } from 'lucide-react';

const StudentProgressPage = ({ onBack }: { onBack: () => void }) => {
  const [selectedSubject,  setSelectedSubject]  = useState('Mathematics');
  const [selectedGrade,    setSelectedGrade]    = useState('Grade 10');
  const [selectedStudent,  setSelectedStudent]  = useState('');
  const [reportedStudent,  setReportedStudent]  = useState('');
  const [reportData,       setReportData]       = useState<any>(null);
  const [loading,          setLoading]          = useState(false);

  const AUTHORIZED_STUDENTS = [
    "Janani Upeksha", "Aman Perera", "Sarah Silva", "Raj Kumar",
    "Li Wei", "Elena Rossi", "Victor Hugo", "Chloe Bennet",
    "Omar Hassan", "Yuki Tanaka"
  ];

  const handleGetReport = async () => {
    if (!selectedStudent) { alert("Please select a student"); return; }
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/student-report/${encodeURIComponent(selectedStudent)}`);
      if (!res.ok) throw new Error("Failed");
      setReportedStudent(selectedStudent);
      setReportData(await res.json());
    } catch {
      alert("Backend offline or student not found!");
    } finally {
      setLoading(false);
    }
  };

  const barColor = (pct: number) =>
    pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-500';

  const statusStyle = (status: string) => {
    if (status.includes('High Performer'))  return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    if (status.includes('High Stress'))     return 'bg-rose-50 text-rose-600 border-rose-200';
    if (status.includes('Needs Attention')) return 'bg-amber-50 text-amber-600 border-amber-200';
    return 'bg-blue-50 text-blue-600 border-blue-200';
  };

  const statusIcon = (status: string) => {
    if (status.includes('High Performer'))  return <Star size={14}/>;
    if (status.includes('High Stress'))     return <AlertTriangle size={14}/>;
    if (status.includes('Needs Attention')) return <AlertTriangle size={14}/>;
    return <CheckCircle size={14}/>;
  };

  const d = reportData?.details;

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-[#6C4AB6] font-bold text-sm mb-4">
          <ArrowLeft size={18}/> Back
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">

          {/* Header */}
          <div className="px-10 py-8 border-b flex items-center gap-4">
            <div className="bg-[#6C4AB6] p-3 rounded-2xl text-white shadow-lg"><TrendingUp size={24}/></div>
            <div>
              <h1 className="text-3xl font-black text-slate-800">Student Analytics</h1>
              <p className="text-slate-400 font-bold text-sm italic">Neural Performance Dashboard</p>
            </div>
          </div>

          {/* Filters */}
          <div className="px-10 py-6 bg-slate-50 border-b grid grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</label>
              <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
                className="w-full mt-1 p-3 bg-white border rounded-xl font-bold text-xs outline-none focus:border-[#6C4AB6]">
                <option>Mathematics</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade</label>
              <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)}
                className="w-full mt-1 p-3 bg-white border rounded-xl font-bold text-xs outline-none focus:border-[#6C4AB6]">
                <option>Grade 10</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</label>
              <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
                className="w-full mt-1 p-3 bg-white border rounded-xl font-bold text-xs outline-none focus:border-[#6C4AB6]">
                <option value="">Choose Student</option>
                {AUTHORIZED_STUDENTS.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <button onClick={handleGetReport} disabled={loading}
              className="bg-[#6C4AB6] text-white py-3 rounded-xl font-black text-xs uppercase hover:bg-[#5a3da1] transition-all disabled:opacity-60">
              {loading ? "Analyzing..." : "Get Report"}
            </button>
          </div>

          {/* Content */}
          <div className="p-10">
            {!reportData ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                <UserCheck size={60} strokeWidth={1}/>
                <p className="font-bold text-xs mt-4">Select a student and click Get Report to view analytics</p>
              </div>
            ) : (
              <div className="space-y-8">

                {/* Student Header — uses reportedStudent not selectedStudent */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#6C4AB6] to-[#9D84D8] flex items-center justify-center text-white font-black text-2xl shadow-xl">
                      {reportedStudent[0]}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800">{reportedStudent}</h2>
                      <p className="text-xs font-bold text-slate-400 uppercase">Grade 10 · Mathematics</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-5 py-2 rounded-full font-black text-xs uppercase border ${statusStyle(reportData.status)}`}>
                    {statusIcon(reportData.status)} {reportData.status}
                  </div>
                </div>

                {/* AI Diagnostic */}
                <div className="bg-gradient-to-r from-[#6C4AB6]/10 to-indigo-50 border border-[#6C4AB6]/20 rounded-2xl p-6 flex items-start gap-4">
                  <div className="bg-[#6C4AB6] p-2 rounded-xl text-white shrink-0"><Brain size={20}/></div>
                  <div>
                    <p className="text-[10px] font-black text-[#6C4AB6] uppercase tracking-widest mb-2">AI Diagnostic</p>
                    <p className="text-slate-700 font-bold text-sm leading-relaxed">"{d.ai_advice}"</p>
                  </div>
                </div>

                {/* Key Metrics */}
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity size={14}/> Neural Pillars
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Mastery Level",    val: d.learning_efficiency, icon: <Target size={16}/>,        desc: "Overall topic knowledge",                  isStress: false },
                      { label: "Response Speed",   val: d.focus,               icon: <Zap size={16}/>,           desc: "How fast student responds",                isStress: false },
                      { label: "Memory Retention", val: d.memory_strength,     icon: <Brain size={16}/>,         desc: "Long-term recall strength",                isStress: false },
                      { label: "Resilience",       val: d.resilience,          icon: <Activity size={16}/>,      desc: "Recovery after mistakes",                  isStress: false },
                      { label: "Connectivity",     val: d.consistency_score,   icon: <TrendingUp size={16}/>,    desc: "Cross-topic connections",                  isStress: false },
                      { label: "Stress Level",     val: d.stress_level,        icon: <AlertTriangle size={16}/>, desc: "Current cognitive load (lower is better)", isStress: true  },
                    ].map((m, i) => {
                      const pct   = parseInt(m.val);
                      const color = m.isStress
                        ? (pct > 75 ? 'bg-rose-500' : pct > 50 ? 'bg-amber-400' : 'bg-emerald-500')
                        : barColor(pct);
                      return (
                        <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-slate-500">
                              {m.icon}
                              <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                            </div>
                            <span className="text-xl font-black text-slate-800">{m.val}</span>
                          </div>
                          <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${color}`} style={{ width: m.val }}/>
                          </div>
                          <p className="text-slate-400 text-[10px] mt-2">{m.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Topic Mastery Breakdown */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <BookOpen size={14}/> Topic-by-Topic Mastery Breakdown
                  </p>
                  <div className="space-y-5">
                    {Object.entries(d.topic_mastery as Record<string, number>).map(([topic, pct]) => {
                      const speedPct = d.topic_speed?.[topic] ?? pct;
                      return (
                        <div key={topic}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-black text-slate-700">{topic}</span>
                            <div className="flex gap-4">
                              <span className="text-xs font-bold text-slate-500">
                                Mastery: <span className="text-slate-800 font-black">{pct}%</span>
                              </span>
                              <span className="text-xs font-bold text-slate-500">
                                Speed: <span className="text-slate-800 font-black">{speedPct}%</span>
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${barColor(pct)}`} style={{ width: `${pct}%` }}/>
                            </div>
                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-blue-400" style={{ width: `${speedPct}%` }}/>
                            </div>
                          </div>
                          <div className="flex gap-4 mt-1">
                            <span className="text-[9px] text-slate-400">■ Mastery</span>
                            <span className="text-[9px] text-blue-400">■ Speed</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Strong / Weak / Study / Rest */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Star size={12}/> Strongest Topic
                    </p>
                    <p className="text-xl font-black text-emerald-700">{d.strong_area}</p>
                    <div className="mt-2 h-2 bg-emerald-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${d.strong_pct}%` }}/>
                    </div>
                    <p className="text-emerald-600 text-xs mt-1">{d.strong_pct}% mastery — highest in profile</p>
                  </div>

                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <AlertTriangle size={12}/> Needs Most Focus
                    </p>
                    <p className="text-xl font-black text-rose-700">{d.weak_area}</p>
                    <div className="mt-2 h-2 bg-rose-200 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${d.weak_pct}%` }}/>
                    </div>
                    <p className="text-rose-600 text-xs mt-1">{d.weak_pct}% mastery — prioritise targeted review</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <BookOpen size={12}/> Study Days This Week
                    </p>
                    <p className="text-4xl font-black text-blue-700">
                      {d.study_days}
                      <span className="text-base font-bold text-blue-400"> / 7 days</span>
                    </p>
                    <p className="text-blue-600 text-xs mt-2">AI-scheduled active learning sessions</p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Coffee size={12}/> Rest Days This Week
                    </p>
                    <p className="text-4xl font-black text-purple-700">
                      {d.rest_days}
                      <span className="text-base font-bold text-purple-400"> / 7 days</span>
                    </p>
                    <p className="text-purple-600 text-xs mt-2">AI-prescribed neural recovery sessions</p>
                  </div>
                </div>

                {/* Instructor Action Plan — fully dynamic from backend */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Target size={14}/> Instructor Action Plan
                  </p>
                  <ul className="space-y-3">
                    {(d.action_plan as string[]).map((action: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 bg-white border border-amber-100 rounded-xl px-4 py-3">
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-sm text-amber-900 font-medium leading-relaxed">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProgressPage;