import React from 'react';
import { 
  LayoutDashboard, BookOpen, Users, FileText, BarChart2, 
  Search, LogOut, GraduationCap, Award, 
  Brain, TrendingUp, PieChart, FileSpreadsheet, FileJson, ArrowRight 
} from 'lucide-react';
import instructorImg from '../assets/images/Instructor.png';

interface InstructorDashboardProps {
  userName: string;
  onLogout: () => void;
  onNavigateToReports: () => void;
}

const InstructorDashboard = ({ userName, onLogout, onNavigateToReports }: InstructorDashboardProps) => {

  const courses = [
    { title: '📐 Calculus I', students: 42, rating: 4.7, progress: 75, color: 'bg-[#6C4AB6]', bg: 'bg-purple-50', icon: <BookOpen size={20} /> },
    { title: '📊 Linear Algebra', students: 28, rating: 4.5, progress: 60, color: 'bg-orange-400', bg: 'bg-orange-50', icon: <FileText size={20} /> },
    { title: '📈 Probability & Stats', students: 35, rating: 4.8, progress: 45, color: 'bg-emerald-500', bg: 'bg-emerald-50', icon: <BarChart2 size={20} /> },
    { title: '🧠 Discrete Math', students: 22, rating: 4.6, progress: 30, color: 'bg-blue-500', bg: 'bg-blue-50', icon: <PieChart size={20} /> },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F1F5F9] font-sans text-slate-900">

      {/* Sidebar - unchanged */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-[#6C4AB6] text-white p-2.5 rounded-2xl shadow-lg shadow-purple-100">
            <Brain size={24}/>
          </div>
          <h2 className="text-2xl font-black tracking-tighter text-[#6C4AB6]">
            NeuroFlex
          </h2>
        </div>

        <nav className="flex-1 px-6 space-y-2 mt-4">
          <button className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl bg-[#6C4AB6] text-white shadow-xl shadow-purple-100 font-black text-sm transition-transform active:scale-95">
            <LayoutDashboard size={20}/> Dashboard
          </button>

          {['My Courses','Students','Assignments','Analytics','Settings'].map((label,i)=>(
            <button key={i} className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-[#6C4AB6] font-bold text-sm transition-all">
              <Users size={20}/> {label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 font-black text-sm transition-colors">
            <LogOut size={20}/> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header - slightly less padding */}
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
            <input
              className="w-full pl-12 pr-6 py-3 bg-slate-100 rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-purple-200 transition-all"
              placeholder="Search student records or course data..."
            />
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-sm font-black text-slate-800 leading-none">Prof. {userName}</p>
              <p className="text-[11px] text-[#6C4AB6] font-black uppercase tracking-[0.15em] mt-1.5">Lead Instructor</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6C4AB6] to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg border-2 border-white">
              {userName?.[0] || 'P'}
            </div>
          </div>
        </header>

        {/* Main Dashboard Area - reduced padding */}
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#F1F5F9]">
          <div className="max-w-7xl mx-auto space-y-6 pb-4">

            {/* Banner - reduced height + tighter content */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-[#6C4AB6] via-[#7B5CC4] to-indigo-700 h-52 shadow-2xl shadow-purple-200/50 shrink-0 border border-white/10">
              <div className="relative z-10 px-10 flex items-center justify-between h-full">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <GraduationCap size={18} className="text-yellow-400"/>
                    <span className="text-[10px] font-black uppercase bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-white tracking-[0.2em] border border-white/20">
                      Neural System Active
                    </span>
                  </div>
                  <h1 className="text-3xl font-black text-white mb-1.5 leading-tight">
                    Welcome back, {userName}
                  </h1>
                  <p className="text-purple-100 text-sm font-bold opacity-90 mb-5">
                    Current Performance: <span className="text-white">79% Mastery</span> across 127 active research participants.
                  </p>
                  <button className="bg-white text-[#6C4AB6] px-7 py-2.5 rounded-2xl font-black text-xs shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">
                    Review Pending Submissions
                  </button>
                </div>
                <img
                  src={instructorImg}
                  alt="instructor"
                  className="absolute right-10 bottom-0 h-[110%] hidden lg:block drop-shadow-2xl object-contain pointer-events-none"
                />
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6 flex flex-col">
                
                {/* Courses Card */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 flex-1">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Live Course Analytics
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {courses.map((course,i)=>(
                      <div key={i} className={`${course.bg} p-5 rounded-2xl border border-transparent hover:border-[#6C4AB6]/30 transition-all hover:shadow-lg group cursor-pointer`}>
                        <div className="flex gap-4 items-start">
                          <div className="w-11 h-11 rounded-xl bg-white shadow-md flex items-center justify-center text-[#6C4AB6] shrink-0 group-hover:scale-110 transition-transform">
                            {course.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-base text-slate-800 truncate">{course.title}</h4>
                            <p className="text-[11px] text-slate-500 font-black mt-0.5 uppercase tracking-tighter">
                              {course.students} Participants • ⭐ {course.rating} Avg
                            </p>
                            <div className="mt-3 w-full bg-white/80 rounded-full h-2">
                              <div className={`${course.color} h-2 rounded-full shadow-sm`} style={{width:`${course.progress}%`}}/>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syllabus Gain</span>
                                <span className="text-[11px] font-black text-[#6C4AB6]">{course.progress}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Stats Section */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200">
                  <div className="grid grid-cols-3 gap-5">
                    {[
                      {icon:PieChart,label:'Submissions',value:'127', color:'text-blue-600', bg:'bg-blue-50'},
                      {icon:FileSpreadsheet,label:'Summaries',value:'12', color:'text-emerald-600', bg:'bg-emerald-50'},
                      {icon:FileJson,label:'Graded',value:'96', color:'text-orange-600', bg:'bg-orange-50'}
                    ].map((item,i)=>(
                      <div key={i} className={`${item.bg} p-5 rounded-2xl text-center border border-white`}>
                        <item.icon size={24} className={`${item.color} mx-auto mb-2`}/>
                        <p className="text-2xl font-black text-slate-800">{item.value}</p>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6 flex flex-col">
                
                {/* Semester Success Card - reduced height */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 flex flex-col justify-center h-[240px]">
                  <div className="flex items-center gap-3 mb-5">
                    <Award size={22} className="text-yellow-500"/>
                    <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-800">Term Mastery</h3>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="relative w-28 h-28 mb-4">
                      <svg className="w-28 h-28 transform -rotate-90">
                        <circle cx="56" cy="56" r="48" stroke="#F1F5F9" strokeWidth="10" fill="none"/>
                        <circle cx="56" cy="56" r="48" stroke="#6C4AB6" strokeWidth="10" fill="none"
                          strokeDasharray="301" strokeDashoffset="63" strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-slate-800">79%</span>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-500 mb-2">Aggregate Student Growth</p>
                      <div className="inline-flex items-center gap-1.5 bg-emerald-100 px-3 py-1 rounded-full text-[11px] font-black text-emerald-700">
                        <TrendingUp size={14}/> +4.2% IMPROVEMENT
                      </div>
                    </div>
                  </div>
                </div>

                {/* Neural Insights Card */}
                <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-purple-100 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-5">Neural Insights</h3>
                    <div className="space-y-4">
                      {[
                        { text: "Engagement Lift", val: "+12.4%", up: true },
                        { text: "Predictive Accuracy", val: "84.2%", up: true },
                        { text: "Recall Rate", val: "91.8%", up: true }
                      ].map((insight, idx) => (
                        <div key={idx} className="flex items-center justify-between group">
                          <span className="text-xs font-bold text-slate-600 group-hover:text-[#6C4AB6] transition-colors">{insight.text}</span>
                          <span className="text-xs font-black text-[#6C4AB6] bg-purple-50 px-2 py-0.5 rounded-md">{insight.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    onClick={onNavigateToReports}
                    className="w-full mt-6 bg-gradient-to-r from-[#6C4AB6] to-indigo-600 text-white py-4 rounded-3xl font-black text-xs uppercase tracking-[0.25em] shadow-2xl shadow-purple-200 hover:shadow-purple-300 hover:translate-y-[-2px] active:translate-y-[0px] transition-all flex items-center justify-center gap-3 border border-white/20"
                  >
                    View Full Student Analytics <ArrowRight size={18} />
                  </button>
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