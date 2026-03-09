import React, { useState } from 'react';
import { 
  LayoutDashboard, Palette, LineChart, Settings, Search, 
  Bell, BookOpen, FileText, BarChart2, CircleDot, 
  Verified, ChevronLeft, ChevronRight, LogOut, Zap, 
  ClipboardList, History, CheckCircle2, Sparkles, Target, 
  Trophy, Clock, Flame, Brain, ChevronDown, Award, 
  TrendingUp, Calendar as CalendarIcon, Layers, Activity, 
  Star, BookMarked, GraduationCap, ArrowRight
} from 'lucide-react';
import studentImg from '../assets/images/student.png';

interface StudentDashboardProps {
  userName: string;
  onLogout: () => void;
  onNavigateToPlan: () => void;
}

const lessons = [
  { title: 'Calculus I',       prog: 70, color: 'bg-[#6C4AB6]',   bg: 'bg-purple-50',  icon: <BookOpen size={20} />,   students: 42, avg: '85%' },
  { title: 'Linear Algebra',   prog: 45, color: 'bg-orange-400',  bg: 'bg-orange-50',  icon: <FileText size={20} />,   students: 28, avg: '72%' },
  { title: 'Statistics',       prog: 20, color: 'bg-emerald-500', bg: 'bg-emerald-50',  icon: <BarChart2 size={20} />,  students: 35, avg: '68%' },
  { title: 'Trigonometry',     prog: 90, color: 'bg-pink-500',    bg: 'bg-pink-50',    icon: <CircleDot size={20} />,  students: 22, avg: '93%' },
];

const achievements = [
  { title: '7-Day Streak',    icon: <Flame size={16} />,        color: 'from-orange-400 to-pink-500' },
  { title: 'Top Performer',   icon: <Trophy size={16} />,       color: 'from-yellow-400 to-amber-500' },
  { title: 'Quiz Master',     icon: <Star size={16} />,         color: 'from-blue-400 to-indigo-500' },
];

const quickStats = [
  { label: 'Avg. Score',   val: '87.5%', dot: 'bg-blue-400'    },
  { label: 'Study Time',   val: '42.8h', dot: 'bg-purple-400'  },
  { label: 'Completion',   val: '62%',   dot: 'bg-orange-400'  },
  { label: 'Questions',    val: '248',   dot: 'bg-emerald-400' },
];

function LessonCard({ lesson }: { lesson: typeof lessons[0] }) {
  return (
    <div className={`${lesson.bg} p-4 rounded-xl hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer group`}>
      <div className="flex gap-3 items-start">
        <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center text-[#6C4AB6] group-hover:scale-110 transition-transform">
          {lesson.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm truncate">{lesson.title}</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {lesson.students} students • Avg {lesson.avg}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-bold text-slate-700">Progress</span>
          <span className="font-black text-[#6C4AB6]">{lesson.prog}%</span>
        </div>
        <div className="bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className={`${lesson.color} h-full rounded-full transition-all duration-500 group-hover:scale-x-105`}
            style={{ width: `${lesson.prog}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard({
  userName,
  onLogout,
  onNavigateToPlan,
}: StudentDashboardProps) {
  const [currentDate] = useState(new Date());

  const daysInMonth   = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days      = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
        .animate-blob {
          animation: blob 8s infinite;
        }
        @keyframes blob {
          0%   { transform: translate(0px, 0px) scale(1); }
          33%  { transform: translate(35px, -55px) scale(1.12); }
          66%  { transform: translate(-25px, 25px) scale(0.92); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
      `}</style>

      {/* Sidebar – unchanged */}
      <aside className="w-72 border-r border-slate-200/80 bg-white/80 backdrop-blur-xl flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-2">
          <div className="bg-gradient-to-br from-[#6C4AB6] to-[#9D84D8] text-white p-2 rounded-xl shadow-lg shadow-purple-200">
            <Brain size={22} />
          </div>
          <h2 className="text-xl font-black tracking-tight bg-gradient-to-r from-[#6C4AB6] to-[#9D84D8] bg-clip-text text-transparent">
            NeuroFlex
          </h2>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[#6C4AB6] to-[#9D84D8] text-white shadow-lg shadow-purple-200 font-bold transform hover:scale-[1.02] transition-all">
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-[#6C4AB6] font-semibold transition-all group">
            <Palette size={20} className="group-hover:rotate-12 transition-transform" /> Themes
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-[#6C4AB6] font-semibold transition-all group">
            <LineChart size={20} className="group-hover:scale-110 transition-transform" /> Status
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-[#6C4AB6] font-semibold transition-all group">
            <Settings size={20} className="group-hover:rotate-90 transition-transform" /> Settings
          </button>
        </nav>

        <div className="px-4 mb-4">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Achievements</p>
            <div className="flex gap-2">
              {achievements.map((ach, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${ach.color} flex items-center justify-center text-white shadow-lg`}
                >
                  {ach.icon}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200/80">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-50 font-bold transition-all group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-slate-200/80 bg-white/70 backdrop-blur-xl px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center flex-1 max-w-lg">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                className="w-full pl-11 pr-4 py-2.5 bg-slate-100/80 rounded-2xl outline-none text-sm focus:ring-2 focus:ring-purple-200 transition-all"
                placeholder="Search lessons, topics, or resources..."
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 relative transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-700">{userName}</p>
                <p className="text-[10px] text-slate-400">Student</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C4AB6] to-[#9D84D8] flex items-center justify-center text-white font-black shadow-lg shadow-purple-200 uppercase">
                {userName ? userName[0] : 'J'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 pb-4 overflow-hidden flex flex-col">
          <div className="flex flex-col h-full max-w-7xl mx-auto space-y-5">

            {/* Welcome Banner – unchanged height */}
            <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-r from-[#6C4AB6] via-[#8A6FD0] to-indigo-600 h-48 shadow-2xl shadow-purple-200/50 shrink-0">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 -left-4 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
                <div className="absolute top-0 -right-4 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" style={{ animationDelay: '2s' }} />
              </div>

              <div className="relative z-10 px-8 py-6 flex items-center justify-between h-full">
                <div className="max-w-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-yellow-300" />
                    <span className="text-xs font-black uppercase bg-white/20 px-3 py-1 rounded-full tracking-widest text-white">
                      Welcome Back
                    </span>
                  </div>
                  <h1 className="text-3xl font-black mb-1 text-white">Ready to learn, {userName}?</h1>
                  <p className="text-purple-100 text-sm mb-4 flex items-center gap-2">
                    <Target size={14} /> Your learning paths are ready.
                  </p>
                  <button className="group bg-white text-[#6C4AB6] px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all flex items-center gap-2">
                    Resume Learning <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <img
                  src={studentImg}
                  alt="student"
                  className="absolute right-8 bottom-0 h-[92%] hidden lg:block drop-shadow-2xl pointer-events-none"
                />
              </div>
            </div>

            {/* Main Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 overflow-hidden">

              {/* Left Column */}
              <div className="flex flex-col gap-5 h-full">

                {/* My Lessons – unchanged */}
                <div className="glass-card rounded-2xl p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-br from-[#6C4AB6] to-[#9D84D8] rounded-xl shadow-lg shadow-purple-200">
                        <BookMarked size={18} className="text-white" />
                      </div>
                      <h2 className="text-lg font-black bg-gradient-to-r from-[#6C4AB6] to-[#9D84D8] bg-clip-text text-transparent">
                        My Lessons
                      </h2>
                    </div>
                    <button className="text-sm text-[#6C4AB6] font-bold hover:underline flex items-center gap-1">
                      View All <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 flex-1">
                    {lessons.map((lesson, i) => (
                      <LessonCard key={i} lesson={lesson} />
                    ))}
                  </div>
                </div>

                {/* New bottom row – two modern cards */}
                <div className="grid grid-cols-2 gap-5 h-72 shrink-0">

                  {/* Learning Momentum */}
                  <div className="glass-card rounded-2xl p-5 flex flex-col relative overflow-hidden group">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg">
                        <Flame size={16} className="text-white" />
                      </div>
                      <h2 className="font-black text-sm">Learning Momentum</h2>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative w-20 h-20">
                        <svg className="w-20 h-20 -rotate-90">
                          <circle cx="40" cy="40" r="36" stroke="#e2e8f0" strokeWidth="8" fill="none" />
                          <circle cx="40" cy="40" r="36" stroke="#f59e0b" strokeWidth="8" fill="none"
                            strokeDasharray="226" strokeDashoffset="45" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-xs">
                          <span className="font-black text-slate-800">7</span>
                          <span className="text-[9px] text-slate-500">days</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-600 mb-1">You're on fire!</p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">+15 XP today</span>
                          <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">Algebra Quiz</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 mt-auto">
                      Last activity: <span className="font-medium text-slate-700">2 hours ago</span>
                    </div>
                  </div>

                  {/* Next Up – Smart Path */}
                  <div className="glass-card rounded-2xl p-5 bg-gradient-to-br from-[#6C4AB6]/5 to-indigo-600/5 flex flex-col relative overflow-hidden border-t-4 border-t-[#6C4AB6]/60">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                        <Brain size={16} className="text-white" />
                      </div>
                      <h2 className="font-black text-sm">Next Up</h2>
                    </div>

                    <p className="text-sm font-bold text-slate-800 mb-1">Probability Theory</p>
                    <p className="text-xs text-slate-600 mb-3 leading-snug">
                      Recommended based on your Statistics progress (only 20% complete)
                    </p>

                    <div className="mb-4">
                      <div className="flex justify-between text-[10px] font-medium mb-1.5">
                        <span>Match Confidence</span>
                        <span className="text-[#6C4AB6] font-bold">87%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#6C4AB6] to-indigo-600 w-[87%]" />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <button className="flex-1 bg-[#6C4AB6] text-white py-2 rounded-xl text-xs font-bold hover:shadow-lg transition-all">
                        Start Now
                      </button>
                      <button className="flex-1 bg-white border border-slate-300 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all">
                        Preview
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column – unchanged */}
              <div className="flex flex-col gap-5 h-full">

                <div className="glass-card rounded-2xl p-5 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-br from-[#6C4AB6] to-[#9D84D8] rounded-xl shadow-lg">
                        <CalendarIcon size={16} className="text-white" />
                      </div>
                      <h2 className="font-black text-sm">Calendar</h2>
                    </div>
                    <div className="flex gap-1 text-slate-400">
                      <button className="p-1 hover:bg-slate-100 rounded-lg"><ChevronLeft size={14} /></button>
                      <button className="p-1 hover:bg-slate-100 rounded-lg"><ChevronRight size={14} /></button>
                    </div>
                  </div>

                  <div className="text-center mb-2">
                    <p className="text-xs font-bold text-[#6C4AB6]">
                      {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="grid grid-cols-7 text-[10px] text-slate-400 text-center mb-2 font-bold">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d}>{d}</span>)}
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-xs flex-1 content-start">
                    {emptyDays.map((_, i) => <div key={i} />)}
                    {days.slice(0, 28).map(d => (
                      <div
                        key={d}
                        className={`p-1.5 rounded-xl transition-all ${
                          d === 6
                            ? 'bg-gradient-to-br from-[#6C4AB6] to-[#9D84D8] text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-100 cursor-pointer'
                        }`}
                      >
                        {d}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={onNavigateToPlan}
                    className="mt-4 w-full bg-gradient-to-r from-[#6C4AB6] to-[#9D84D8] text-white py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    <ClipboardList size={16} /> Generate Plan
                  </button>
                </div>

                <div className="glass-card rounded-2xl p-5 flex flex-col h-64 shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-100 rounded-lg">
                        <TrendingUp size={16} className="text-emerald-600" />
                      </div>
                      <span className="text-xs font-black tracking-tight">Quick Stats</span>
                    </div>
                    <Activity size={14} className="text-slate-300" />
                  </div>

                  <div className="flex-1 flex flex-col justify-between text-xs">
                    <div className="space-y-3">
                      {quickStats.map((stat, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className={`w-1 h-1 rounded-full ${stat.dot}`} />
                            <span className="text-[10px] font-bold text-slate-500">{stat.label}</span>
                          </div>
                          <span className="font-black text-slate-800">{stat.val}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="bg-slate-50 rounded-xl p-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Flame size={14} className="text-orange-500" />
                          <span className="font-black uppercase text-slate-400 text-[10px]">Streak</span>
                        </div>
                        <span className="font-black text-slate-700">7 Days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}