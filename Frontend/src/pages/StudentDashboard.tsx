import React, { useState } from 'react';
import { 
  LayoutDashboard, Palette, LineChart, Settings, Search, 
  Bell, BookOpen, FileText, BarChart2, CircleDot, 
  Verified, ChevronLeft, ChevronRight, 
  LogOut, Zap, ClipboardList, History, CheckCircle2 
} from 'lucide-react';
import studentImg from '../assets/images/student.png';

interface StudentDashboardProps {
  userName: string;
  onLogout: () => void;
  onNavigateToPlan: () => void;
}

const StudentDashboard = ({ userName, onLogout, onNavigateToPlan }: StudentDashboardProps) => {

  const [currentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth()+1,0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(),currentDate.getMonth(),1).getDay();

  const days = Array.from({length:daysInMonth},(_,i)=>i+1);
  const emptyDays = Array.from({length:firstDayOfMonth},(_,i)=>i);

  // Lessons with 4 different icons
  const lessons = [
    {title:'Calculus I', prog:70, color:'bg-[#6C4AB6]', bg:'bg-purple-50', icon:<BookOpen size={22}/>},
    {title:'Linear Algebra', prog:45, color:'bg-orange-400', bg:'bg-orange-50', icon:<FileText size={22}/>},
    {title:'Statistics', prog:20, color:'bg-emerald-500', bg:'bg-emerald-50', icon:<BarChart2 size={22}/>},
    {title:'Trigonometry', prog:90, color:'bg-pink-500', bg:'bg-pink-50', icon:<CircleDot size={22}/>}
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F7] font-sans text-slate-900">

      {/* SIDEBAR */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">

        <div className="p-5 flex items-center gap-2">
          <div className="bg-[#6C4AB6] text-white p-1.5 rounded-lg">
            <Zap size={18} fill="currentColor"/>
          </div>
          <h2 className="text-lg font-black tracking-tight text-[#6C4AB6]">
            NeuroFlex.
          </h2>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-3">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#6C4AB6]/10 text-[#6C4AB6] font-bold">
            <LayoutDashboard size={20}/>
            Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-50 font-semibold">
            <Palette size={20}/> Themes
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-50 font-semibold">
            <LineChart size={20}/> Status
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-50 font-semibold">
            <Settings size={20}/> Settings
          </button>
        </nav>

        <div className="p-5">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-50 font-bold"
          >
            <LogOut size={20}/>
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <header className="h-14 border-b border-slate-200 bg-white px-8 flex items-center justify-between">

          <div className="flex items-center flex-1 max-w-lg">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                className="w-full pl-11 pr-4 py-2 bg-slate-100 rounded-xl outline-none text-sm"
                placeholder="Search lessons..."
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 relative">
              <Bell size={20}/>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C4AB6] to-[#9D84D8] flex items-center justify-center text-white font-black">
              {userName ? userName[0].toUpperCase() : 'J'}
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 overflow-hidden relative">
          
          {/* Soft Background */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage:'radial-gradient(#6C4AB6 1px, transparent 0)', backgroundSize:'24px 24px' }}
          />

          <div className="relative max-w-7xl mx-auto space-y-6">

            {/* BANNER */}
            <div className="w-full bg-gradient-to-r from-[#6C4AB6] to-indigo-600 rounded-[2rem] p-8 min-h-[200px] text-white relative overflow-hidden flex items-center">
              <div className="relative z-10 max-w-lg">
                <h1 className="text-3xl font-black mb-2">Welcome back, {userName}!</h1>
                <p className="text-purple-100 text-sm mb-6">
                  Your customized learning paths are ready. You have 3 lessons waiting.
                </p>
                <button className="bg-[#FFD166] text-slate-900 px-8 py-3 rounded-xl font-black text-sm">
                  Resume Learning
                </button>
              </div>
              <img
                src={studentImg}
                alt="student"
                className="absolute right-10 bottom-0 h-[95%] hidden lg:block"
              />
            </div>

            {/* CONTENT GRID */}
            <div className="flex gap-6">

              {/* LEFT COLUMN */}
              <div className="flex-1 space-y-5">

                {/* LESSONS - made more compact */}
                <div className="bg-white p-5 rounded-[2rem] border border-slate-200">
                  <div className="flex justify-between mb-3">
                    <h2 className="text-lg font-black">My Lessons</h2>
                    <button className="text-sm text-[#6C4AB6] font-bold">View All</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {lessons.map((c,i)=>(
                      <div key={i} className={`${c.bg} p-3.5 rounded-xl flex gap-3 items-center`}>
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#6C4AB6] shrink-0">
                          {c.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm truncate">{c.title}</h4>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex-1 bg-slate-200 h-1.5 rounded-full">
                              <div className={`${c.color} h-1.5 rounded-full`} style={{width:`${c.prog}%`}}/>
                            </div>
                            <span className="text-xs font-bold shrink-0">{c.prog}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RECENT ACTIVITY - no scroll, shorter */}
                <div className="bg-white p-5 rounded-[2rem] border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <History size={18} className="text-[#6C4AB6]" />
                    <h2 className="font-black text-lg">Recent Activity</h2>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex justify-between bg-[#F8FAFC] p-3 rounded-lg text-sm">
                      <div className="flex gap-2 items-center">
                        <CheckCircle2 className="text-emerald-500"/>
                        Completed Algebra Quiz
                      </div>
                      <span className="text-xs text-slate-400">2h ago</span>
                    </div>
                    <div className="flex justify-between bg-[#F8FAFC] p-3 rounded-lg text-sm">
                      <div className="flex gap-2 items-center">
                        <Verified className="text-blue-500"/>
                        Watched Limits Lesson
                      </div>
                      <span className="text-xs text-slate-400">Yesterday</span>
                    </div>
                  </div>
                </div>

                {/* DAILY FOCUS - reference for bottom alignment */}
                <div className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white p-6 rounded-[2rem]">
                  <h3 className="font-black text-lg mb-2">Today's Focus</h3>
                  <p className="text-sm opacity-90 mb-4">
                    Finish your Calculus practice and review probability concepts.
                  </p>
                  <div className="flex gap-4">
                    <div className="bg-white/20 px-4 py-2 rounded-lg text-sm font-bold">45 min Study</div>
                    <div className="bg-white/20 px-4 py-2 rounded-lg text-sm font-bold">10 Questions</div>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN */}
              <div className="w-72 space-y-5 flex flex-col">

                {/* CALENDAR - slightly taller */}
                <div className="bg-white p-5 rounded-[2rem] border border-slate-200 flex flex-col">
                  <div className="flex justify-between mb-4">
                    <h2 className="font-black">Calendar</h2>
                    <div className="flex gap-2 text-slate-400">
                      <ChevronLeft size={18}/>
                      <ChevronRight size={18}/>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 text-xs text-slate-400 text-center mb-2">
                    {['S','M','T','W','T','F','S'].map(d=><span key={d}>{d}</span>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-sm flex-1">
                    {emptyDays.map((d,i)=><div key={i}/>)}
                    {days.slice(0,28).map(d=>(
                      <div key={d} className={`p-2 rounded-lg ${d===6?'bg-[#6C4AB6] text-white':'text-slate-400'}`}>{d}</div>
                    ))}
                  </div>
                  <button
                    onClick={onNavigateToPlan}
                    className="w-full mt-5 flex items-center justify-center gap-2 bg-gradient-to-r from-[#6C4AB6] to-[#9D84D8] text-white py-3 rounded-xl font-bold text-sm"
                  >
                    <ClipboardList size={18}/>
                    GENERATE PLAN
                  </button>
                </div>

                {/* WEEKLY GOAL */}
                <div className="bg-gradient-to-br from-[#6C4AB6] to-[#9D84D8] p-5 rounded-[2rem] text-white">
                  <h3 className="font-black text-sm mb-1">Weekly Goal</h3>
                  <p className="text-xs opacity-70 mb-3">Target: 20 Hours</p>
                  <p className="text-2xl font-black">15.5 hrs</p>
                </div>

                {/* STUDY STREAK - pushed lower with mt-auto */}
                <div className="bg-gradient-to-br from-orange-400 to-pink-500 p-5 rounded-[2rem] text-white mt-auto">
                  <h3 className="font-black text-sm mb-2">🔥 Study Streak</h3>
                  <p className="text-3xl font-black">7 Days</p>
                  <p className="text-xs opacity-80 mt-1">Keep learning daily to maintain your streak!</p>
                </div>

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
};

export default StudentDashboard;