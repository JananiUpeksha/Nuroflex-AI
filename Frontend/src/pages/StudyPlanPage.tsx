import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, PlayCircle, Trophy, Sparkles } from 'lucide-react';

interface StudyPlanProps {
  userName: string;
  onBack: () => void;
}

const StudyPlanPage = ({ userName, onBack }: StudyPlanProps) => {
  const [plan, setPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/generate-7day-plan/${userName}`)
      .then(res => res.json())
      .then(data => {
        setPlan(data.weekly_plan);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userName]);

  const setDayStatus = (day: string, status: string) => {
    setStatuses(prev => ({ ...prev, [day]: status }));
  };

  useEffect(() => {
    if (plan.length > 0) {
      const allDone = plan.every(item => statuses[item.day] === 'completed');
      if (allDone && Object.keys(statuses).length === 7) setShowCelebration(true);
    }
  }, [statuses, plan]);

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#6C4AB6]">PREPARING PATH...</div>;

  return (
    <div className="h-screen bg-[#F8FAFC] p-6 font-sans flex flex-col relative overflow-hidden">
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] p-10 text-center shadow-2xl border-4 border-[#6C4AB6] max-w-sm">
            <Trophy size={60} className="text-[#FFD166] mx-auto mb-4" />
            <h2 className="text-3xl font-black text-slate-800">Perfect Week!</h2>
            <p className="text-slate-500 font-bold mb-8">You reached your target, {userName}!</p>
            <button onClick={() => setShowCelebration(false)} className="w-full bg-[#6C4AB6] text-white py-4 rounded-2xl font-black">CONTINUE</button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto w-full mb-4 z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-[#6C4AB6] font-bold text-sm">
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
      </div>

      <div className="max-w-5xl mx-auto w-full bg-white rounded-[2.5rem] shadow-xl flex-1 flex flex-col overflow-hidden border border-slate-100 z-10">
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-[#6C4AB6] p-3 rounded-2xl text-white shadow-lg shadow-purple-200">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Your Study Plan</h1>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest italic">Personalized for {userName}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-10 py-6 overflow-y-auto space-y-4">
          {plan.map((item) => (
            <div key={item.day} className="flex items-center justify-between p-5 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-purple-200 transition-all">
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${statuses[item.day] === 'completed' ? 'bg-[#6C4AB6] text-white' : 'bg-white text-[#6C4AB6]'}`}>
                  {item.day[0]}
                </div>
                <div className="max-w-md">
                  <h4 className="font-black text-slate-800 text-lg">{item.day}</h4>
                  <p className="text-sm font-bold text-slate-500 leading-snug">{item.task}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setDayStatus(item.day, 'completed')} className={`px-6 py-3 rounded-xl text-[10px] font-black border-2 transition-all ${statuses[item.day] === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-400 hover:border-emerald-200'}`}>DONE</button>
                <button onClick={() => setDayStatus(item.day, 'not')} className={`px-6 py-3 rounded-xl text-[10px] font-black border-2 transition-all ${statuses[item.day] === 'not' ? 'bg-red-400 border-red-400 text-white' : 'bg-white border-slate-200 text-slate-400 hover:border-red-200'}`}>NOT</button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-center">
           <button className="flex items-center gap-3 bg-gradient-to-r from-[#00A991] to-emerald-600 text-white px-16 py-4 rounded-[2rem] font-black text-lg shadow-xl hover:scale-[1.02] transition-all">
            <PlayCircle size={24} /> TAKE WEEKLY ASSESSMENT
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanPage;