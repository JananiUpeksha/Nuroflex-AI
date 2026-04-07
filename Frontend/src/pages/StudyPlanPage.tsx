import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Sparkles, Video, BookOpen, Coffee, Target, X, Check } from 'lucide-react';

interface StudyPlanProps { userName: string; onBack: () => void; }

const StudyPlanPage = ({ userName, onBack }: StudyPlanProps) => {
  const [plan, setPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subStatuses, setSubStatuses] = useState<Record<string, string>>({});
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/generate-7day-plan/${userName}`)
      .then(res => res.json())
      .then(data => { setPlan(data.weekly_plan); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userName]);

  const setStepStatus = (id: string, status: string) => {
    setSubStatuses(prev => ({ ...prev, [id]: status }));
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'Video': return <Video size={22} className="text-blue-600" />;
      case 'Quiz': return <BookOpen size={22} className="text-emerald-600" />;
      case 'Exercise': return <Target size={22} className="text-orange-600" />;
      case 'Rest': return <Coffee size={22} className="text-purple-600" />;
      default: return <Sparkles size={22} />;
    }
  };

  const getTaskColor = (type: string) => {
    switch (type) {
      case 'Video': return 'bg-blue-50 border-blue-200';
      case 'Quiz': return 'bg-emerald-50 border-emerald-200';
      case 'Exercise': return 'bg-orange-50 border-orange-200';
      case 'Rest': return 'bg-purple-50 border-purple-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="w-16 h-16 border-4 border-[#6C4AB6] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-black text-[#6C4AB6] tracking-widest uppercase text-xs">Mapping Neural Path...</p>
    </div>
  );

  return (
    <div className="h-screen bg-[#F8FAFC] p-6 font-sans flex flex-col relative overflow-hidden">
      
      {/* VIDEO MODAL */}
      {selectedVideoId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-[#6C4AB6]">
            <button onClick={() => setSelectedVideoId(null)} className="absolute top-6 right-6 z-[110] bg-white/20 p-3 rounded-full text-white hover:bg-white/40"><X size={28} /></button>
            <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1`} frameBorder="0" allowFullScreen></iframe>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto w-full mb-4 z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-[#6C4AB6] font-bold text-sm">
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
      </div>

      <div className="max-w-5xl mx-auto w-full bg-white rounded-[3rem] shadow-xl flex-1 flex flex-col overflow-hidden border border-slate-100 z-10">
        {/* HEADER SECTION */}
        <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="bg-[#6C4AB6] p-3 rounded-2xl text-white shadow-lg"><Sparkles size={24} /></div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Success Roadmap</h1>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Designed for {userName}</p>
            </div>
          </div>
        </div>

        {/* SCROLLABLE PLAN CONTENT */}
        <div className="flex-1 px-8 py-6 overflow-y-auto space-y-5 bg-slate-50/30">
          {plan.map((item) => (
            <div key={item.day} className={`flex flex-col md:flex-row items-center justify-between p-7 rounded-[2.5rem] border-2 transition-all ${getTaskColor(item.type)} shadow-sm hover:shadow-md`}>
              
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-md shrink-0 bg-white text-[#6C4AB6]`}>
                  {item.day[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getTaskIcon(item.type)}
                    <h4 className="font-black text-slate-800 text-lg">{item.day}</h4>
                  </div>
                  <h5 className="text-sm font-black text-[#6C4AB6] mb-1 uppercase tracking-tight">{item.task_title}</h5>
                  {/* LARGER MISSION TEXT */}
                  <p className="text-[14px] font-bold text-slate-600 leading-relaxed italic">"{item.instruction}"</p>
                </div>
              </div>

              {/* VERTICAL BUTTONS WITH HORIZONTAL STATUS MARKS */}
              <div className="flex flex-col gap-3 mt-6 md:mt-0 w-full md:w-[280px]">
                {[
                  { label: "Lesson", icon: <Video size={14} />, color: "text-blue-700" },
                  { label: "Practice", icon: <BookOpen size={14} />, color: "text-emerald-700" },
                  { label: "Challenge", icon: <Target size={14} />, color: "text-orange-700" }
                ].map((step, idx) => {
                  const stepId = `${item.day}-${idx}`;
                  const isDone = subStatuses[stepId] === 'done';
                  const isMissed = subStatuses[stepId] === 'missed';

                  return (
                    <div key={idx} className="flex items-center gap-3 w-full">
                      {/* SMALLER BUTTON HEIGHT */}
                      <button 
                        onClick={() => item.learning_stack?.[idx] && setSelectedVideoId(item.learning_stack[idx].video_id)}
                        className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border shadow-sm
                          ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 
                            isMissed ? 'bg-red-400 border-red-400 text-white' : 
                            'bg-white border-white/50 ' + step.color}`}
                      >
                        {step.icon} {step.label}
                      </button>
                      
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setStepStatus(stepId, 'done')}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-300 hover:text-emerald-500'}`}
                        >
                          <Check size={14} />
                        </button>
                        <button 
                          onClick={() => setStepStatus(stepId, 'missed')}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${isMissed ? 'bg-red-400 border-red-400 text-white' : 'bg-white border-slate-200 text-slate-300 hover:text-red-400'}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* NON-STICKY ASSESSMENT BUTTON AT THE END OF PLAN */}
          <div className="pt-8 pb-4 flex flex-col items-center gap-4">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ready for your milestone?</p>
             <button className="flex items-center gap-3 bg-gradient-to-r from-[#6C4AB6] to-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-all group">
              <Trophy size={18} className="group-hover:rotate-12 transition-transform" /> 
              TAKE WEEKLY ASSESSMENT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanPage;