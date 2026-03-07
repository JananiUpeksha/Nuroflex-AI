import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Clock, CheckCircle, XCircle, AlertCircle, PlayCircle, Trophy } from 'lucide-react';

interface StudyPlanProps {
  userName: string;
  onBack: () => void;
}

const StudyPlanPage = ({ userName, onBack }: StudyPlanProps) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [showCelebration, setShowCelebration] = useState(false);

  const setDayStatus = (day: string, status: string) => {
    setStatuses(prev => ({ ...prev, [day]: status }));
  };

  useEffect(() => {
    const allCompleted = days.every(day => statuses[day] === 'completed');
    if (allCompleted && Object.keys(statuses).length === 7) {
      setShowCelebration(true);
    }
  }, [statuses]);

  return (
    <div className="h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] p-6 font-sans relative overflow-hidden flex flex-col">
      {/* Decorative background shapes for a "Beautiful" look */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-[120px] pointer-events-none"></div>

      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[3rem] p-10 text-center shadow-2xl border-4 border-[#6C4AB6] max-w-sm">
            <Trophy size={60} className="text-[#FFD166] mx-auto mb-4" />
            <h2 className="text-3xl font-black text-slate-800 mb-2">Goal Met!</h2>
            <p className="text-slate-500 font-bold mb-8 italic">Perfect Week, {userName}!</p>
            <button onClick={() => setShowCelebration(false)} className="w-full bg-[#6C4AB6] text-white py-4 rounded-2xl font-black">AWESOME</button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto w-full mb-4 z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-[#6C4AB6] font-bold text-sm">
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
      </div>

      <div className="max-w-6xl mx-auto w-full bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-2xl flex-1 flex flex-col overflow-hidden z-10">
        <div className="px-10 py-6 border-b border-slate-200/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-[#6C4AB6] to-[#9D84D8] p-3 rounded-2xl text-white shadow-lg shadow-purple-200">
              <Star size={24} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Weekly Study Plan</h1>
              <p className="text-slate-400 text-sm font-bold italic">Interactive Neural Path for {userName}</p>
            </div>
          </div>
        </div>

        {/* VERTICAL ROWS LIST */}
        <div className="flex-1 px-10 py-6 flex flex-col justify-between gap-2">
          {days.map((day) => (
            <div key={day} className="flex items-center justify-between p-4 rounded-[1.5rem] bg-white border border-slate-100 shadow-sm hover:border-purple-200 transition-all">
              <div className="flex items-center gap-8">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-inner ${statuses[day] === 'completed' ? 'bg-[#6C4AB6] text-white' : 'bg-slate-50 text-[#6C4AB6]'}`}>
                  {day[0]}
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-base">{day}</h4>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase">Calculus: Integrals & Differentiation</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setDayStatus(day, 'completed')}
                  className={`px-8 py-2.5 rounded-xl text-[10px] font-black border-2 transition-all ${statuses[day] === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-200'}`}
                >
                  DONE
                </button>
                <button 
                  onClick={() => setDayStatus(day, 'half')}
                  className={`px-8 py-2.5 rounded-xl text-[10px] font-black border-2 transition-all ${statuses[day] === 'half' ? 'bg-orange-400 border-orange-400 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-orange-200'}`}
                >
                  HALF
                </button>
                <button 
                  onClick={() => setDayStatus(day, 'not')}
                  className={`px-8 py-2.5 rounded-xl text-[10px] font-black border-2 transition-all ${statuses[day] === 'not' ? 'bg-red-400 border-red-400 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-red-200'}`}
                >
                  NOT
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-200/50 flex justify-center">
           <button className="flex items-center gap-3 bg-gradient-to-r from-[#00A991] to-emerald-600 text-white px-16 py-4 rounded-[2rem] font-black text-lg shadow-xl hover:scale-[1.02] transition-all">
            <PlayCircle size={24} /> TAKE WEEKLY QUIZ
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanPage;
