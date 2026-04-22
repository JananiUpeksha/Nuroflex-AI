import React, { useState } from 'react';
import { ArrowLeft, Search, UserCheck, TrendingUp, Brain, Target, Zap, Activity } from 'lucide-react';

const StudentProgressPage = ({ onBack }: { onBack: () => void }) => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const AUTHORIZED_STUDENTS = [
    "Janani Upeksha", "Aman Perera", "Sarah Silva", "Raj Kumar", 
    "Li Wei", "Elena Rossi", "Victor Hugo", "Chloe Bennet", 
    "Omar Hassan", "Yuki Tanaka"
  ];

  const handleGetReport = async () => {
    if (!selectedStudent) {
      alert("Please select a Student Name");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/student-report/${encodeURIComponent(selectedStudent)}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      alert("Backend server is offline or Student not found!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#F1F5F9] p-6 font-sans flex flex-col relative overflow-hidden">
      <div className="max-w-4xl mx-auto w-full mb-4 z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-[#6C4AB6] font-bold text-sm">
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      <div className="max-w-4xl mx-auto w-full bg-white rounded-[2.5rem] shadow-xl flex-1 flex flex-col overflow-hidden border border-slate-200 z-10">
        <div className="px-10 py-8 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-[#6C4AB6] p-3 rounded-2xl text-white shadow-lg"><TrendingUp size={24} /></div>
            <div>
              <h1 className="text-3xl font-black text-slate-800">Student Analytics</h1>
              <p className="text-slate-400 font-bold text-sm italic">Neural Performance Dashboard</p>
            </div>
          </div>
        </div>

        {/* Selection Bar */}
        <div className="px-10 py-6 bg-slate-50/50 border-b border-slate-100">
          <div className="grid grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</label>
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full mt-1 p-3 bg-white border rounded-xl font-bold text-xs outline-none focus:border-[#6C4AB6]">
                <option value="Maths">Mathematics</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade</label>
              <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="w-full mt-1 p-3 bg-white border rounded-xl font-bold text-xs outline-none focus:border-[#6C4AB6]">
                <option value="Grade 10">Grade 10</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</label>
              <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="w-full mt-1 p-3 bg-white border rounded-xl font-bold text-xs outline-none focus:border-[#6C4AB6]">
                <option value="">Choose Student</option>
                {AUTHORIZED_STUDENTS.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <button onClick={handleGetReport} disabled={loading} className="bg-[#6C4AB6] text-white py-3 rounded-xl font-black text-xs uppercase hover:bg-[#5a3da1] transition-all">
              {loading ? "Analyzing..." : "Get Report"}
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="flex-1 overflow-y-auto p-10 bg-white">
          {!reportData ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50">
              <UserCheck size={60} strokeWidth={1} />
              <p className="font-bold text-xs mt-4">Select a student for NeuroFlex Analytics</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#6C4AB6] to-[#9D84D8] flex items-center justify-center text-white font-black text-2xl shadow-xl">{selectedStudent[0]}</div>
                  <div><h2 className="text-2xl font-black text-slate-800">{selectedStudent}</h2><p className="text-xs font-bold text-slate-400 uppercase">Grade 10 • Mathematics</p></div>
                </div>
                <div className="px-6 py-2 rounded-full font-black text-[10px] uppercase bg-emerald-50 text-emerald-500 border border-emerald-100">{reportData.status}</div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                  <div className="flex items-center gap-3 mb-4 text-[#6C4AB6]"><Brain size={20} /><span className="text-[10px] font-black uppercase tracking-widest">Neural Diagnostic</span></div>
                  <p className="text-sm font-bold text-slate-700 italic">"{reportData.details.ai_advice}"</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Mastery Gain", val: reportData.details.learning_efficiency },
                    { label: "Focus Score", val: reportData.details.focus },
                    { label: "Consistency", val: reportData.details.consistency_score },
                    { label: "Retention", val: reportData.details.memory_strength }
                  ].map((m, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">{m.label}</span>
                      <span className="text-xl font-black text-[#6C4AB6]">{m.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProgressPage;