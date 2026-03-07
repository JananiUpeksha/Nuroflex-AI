import React from 'react';
import { 
  LayoutDashboard, BookOpen, Users, FileText, BarChart2, 
  Settings, Search, Bell, LogOut, Zap, History, 
  CheckCircle2, AlertCircle, Star, FileBarChart, TrendingUp,
  GraduationCap, Award, Brain, UserCheck, PieChart, ArrowRight,
  FileSpreadsheet, FileJson, Eye, UsersRound, ClipboardList
} from 'lucide-react';

import instructorImg from '../assets/images/Instructor.png';

interface InstructorDashboardProps {
  userName: string;
  onLogout: () => void;
}

const InstructorDashboard = ({ userName, onLogout }: InstructorDashboardProps) => {
  const courses = [
    { title: 'Calculus I', students: 42, rating: 4.7, progress: 75, color: 'from-purple-500 to-indigo-600', lightColor: 'bg-purple-50', icon: '∫' },
    { title: 'Linear Algebra', students: 28, rating: 4.5, progress: 60, color: 'from-orange-500 to-pink-500', lightColor: 'bg-orange-50', icon: '∑' },
    { title: 'Probability & Stats', students: 35, rating: 4.8, progress: 45, color: 'from-emerald-500 to-teal-500', lightColor: 'bg-emerald-50', icon: 'π' },
    { title: 'Discrete Math', students: 22, rating: 4.6, progress: 30, color: 'from-blue-500 to-cyan-500', lightColor: 'bg-blue-50', icon: 'Δ' },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-800">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white flex flex-col shrink-0 border-r border-slate-200 z-30">
        <div className="p-4 flex items-center gap-2 shrink-0">
          <div className="bg-[#6C4AB6] text-white p-1.5 rounded-lg">
            <Brain size={18} />
          </div>
          <h2 className="text-lg font-black tracking-tight text-[#6C4AB6]">NeuroFlex</h2>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#6C4AB6] text-white shadow-md shadow-purple-200">
            <LayoutDashboard size={18} /> 
            <span className="text-sm font-bold">Dashboard</span>
          </button>
          {[
            { icon: BookOpen, label: 'My Courses' },
            { icon: Users, label: 'Students' },
            { icon: FileText, label: 'Assignments' },
            { icon: BarChart2, label: 'Analytics' },
            { icon: Settings, label: 'Settings' },
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-50 transition-all font-semibold">
              <item.icon size={18} />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 shrink-0">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-400 hover:bg-red-50 font-bold transition-all text-sm">
            <LogOut size={18} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* HEADER */}
        <header className="h-14 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-20">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input className="w-full pl-10 pr-4 py-1.5 bg-slate-100 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-200" placeholder="Search..." />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-lg relative text-slate-400"><Bell size={18} /></button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C4AB6] to-[#9D84D8] flex items-center justify-center text-white font-black text-xs">
              {userName?.[0] || 'I'}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-5 flex flex-col gap-4 overflow-hidden relative">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6C4AB6 1px, transparent 0)', backgroundSize: '24px 24px' }} />

          {/* BANNER */}
          <div className="relative bg-gradient-to-r from-[#6C4AB6] via-[#8A6FD0] to-indigo-500 rounded-[2.5rem] p-10 h-56 text-white overflow-hidden shadow-xl shrink-0 flex items-center">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap size={20} className="text-yellow-300" />
                <span className="text-[10px] font-black uppercase bg-white/20 px-3 py-1 rounded-full tracking-widest">Instructor Hub</span>
              </div>
              <h1 className="text-4xl font-black mb-1 leading-none tracking-tight">Welcome, Prof. {userName}</h1>
              <p className="text-purple-100 text-lg opacity-90 font-medium">Your courses are 79% complete for this semester.</p>
              <button className="mt-6 bg-[#FFD166] text-slate-900 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-yellow-500/20 hover:scale-[1.02] transition-all active:scale-95">
                Review Submissions
              </button>
            </div>
            <img src={instructorImg} alt="" className="absolute right-12 bottom-0 h-full w-auto object-contain hidden lg:block translate-y-4 pointer-events-none" />
          </div>

          {/* MAIN GRID */}
          <div className="flex-1 flex gap-5 min-h-0 overflow-hidden">
            
            {/* LEFT: STUDENT REPORTS */}
            <div className="flex-[1.4] bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-6 text-white shadow-2xl border border-white/5 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-xl"><UserCheck size={24} className="text-purple-400" /></div>
                  <h3 className="font-black text-xl">Student Reports</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-6 shrink-0">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <PieChart className="text-blue-400 mb-1" size={16} />
                  <p className="text-xl font-black">127</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase">Files</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <FileSpreadsheet className="text-emerald-400 mb-1" size={16} />
                  <p className="text-xl font-black">4</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase">Summaries</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <FileJson className="text-yellow-400 mb-1" size={16} />
                  <p className="text-xl font-black">38</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase">Graded</p>
                </div>
              </div>

              <div className="flex-1 space-y-2 mb-5 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                {courses.slice(0, 2).map((c, i) => (
                  <div key={i} className="p-2.5 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-purple-300 font-bold text-xs">{c.icon}</div>
                      <div><h4 className="font-bold text-xs truncate max-w-[150px]">{c.title} Performance</h4><p className="text-[9px] text-slate-500">Analytics Syncing</p></div>
                    </div>
                    <ArrowRight size={16} className="text-slate-600 group-hover:text-white" />
                  </div>
                ))}
              </div>

              <button className="w-full bg-[#6C4AB6] text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-indigo-600 shrink-0">
                <Eye size={16} /> VIEW ALL STUDENT REPORTS
              </button>
            </div>

            {/* RIGHT: COURSES & VIBRANT SUCCESS CIRCLE */}
            <div className="flex-1 flex flex-col gap-5 min-h-0 overflow-hidden">
              {/* Reduced height of My Courses */}
              <div className="flex-[1.2] bg-white rounded-[2rem] p-5 border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <h3 className="font-black text-lg">My Courses</h3>
                  <button className="text-[9px] font-black text-[#6C4AB6] uppercase hover:underline">Manage</button>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar min-h-0">
                  {courses.map((c, i) => (
                    <div key={i} className={`${c.lightColor} p-2.5 rounded-xl flex items-center gap-3 border border-transparent hover:border-slate-200 transition-all`}>
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center text-white text-xs font-black shadow-sm`}>{c.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between"><p className="text-xs font-black text-slate-800 truncate">{c.title}</p><div className="flex items-center gap-1"><Star size={10} className="text-yellow-500 fill-current" /><span className="text-[9px] font-black">{c.rating}</span></div></div>
                        <div className="w-full bg-white/60 h-1.5 rounded-full mt-1.5 overflow-hidden"><div className={`h-full rounded-full bg-gradient-to-r ${c.color}`} style={{ width: `${c.progress}%` }}></div></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* VIBRANT SUCCESS CARD WITH PROGRESS CIRCLE */}
              <div className="h-44 bg-gradient-to-br from-[#00b894] via-[#00a8ff] to-[#6c5ce7] rounded-[2rem] p-6 text-white shadow-[0_15px_30px_rgba(0,184,148,0.3)] flex items-center gap-6 shrink-0 relative overflow-hidden group hover:scale-[1.01] transition-transform">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
                
                {/* Progress Circle */}
                <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-white/20" cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" />
                    <circle 
                      className="text-white transition-all duration-1000 ease-out" 
                      cx="48" cy="48" r="40" fill="transparent" 
                      stroke="currentColor" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * 79) / 100} 
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black leading-none">79<span className="text-sm">%</span></span>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Award size={18} className="text-yellow-300" />
                    <h3 className="font-black text-[10px] uppercase tracking-widest text-white">Overall Success</h3>
                  </div>
                  <p className="text-xs font-bold text-white/90 leading-tight mb-2">Excellent! Your semester success rate is climbing.</p>
                  <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md">
                    <TrendingUp size={12} /> +4.2% Growth
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InstructorDashboard;