import React, { useState } from 'react';
import { ArrowLeft, Search, UserCheck, TrendingUp, Brain, Target, Zap, Activity } from 'lucide-react';

const StudentProgressPage = ({ onBack }: { onBack: () => void }) => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // The 10 Verified Students from the Research Database
  const AUTHORIZED_STUDENTS = [
    "Janani Upeksha", "Aman Perera", "Sarah Silva", "Raj Kumar", 
    "Li Wei", "Elena Rossi", "Victor Hugo", "Chloe Bennet", 
    "Omar Hassan", "Yuki Tanaka"
  ];

  const handleGetReport = async () => {
    if (!selectedSubject || !selectedGrade || !selectedStudent) {
      alert("Please select Subject, Grade, and Student Name");
      return;
    }

    setLoading(true);
    try {
      // Connect to Backend to fetch the updated Instructor Summary
      const res = await fetch(`http://127.0.0.1:8000/generate-7day-plan/${selectedStudent}`);
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      console.error("Connection failed:", err);
      alert("Backend server is offline!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#F1F5F9] p-6 font-sans flex flex-col relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto w-full mb-4 z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-[#6C4AB6] font-bold text-sm transition-colors">
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
      </div>

      <div className="max-w-4xl mx-auto w-full bg-white rounded-[2.5rem] shadow-xl flex-1 flex flex-col overflow-hidden border border-slate-200 z-10">
        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-[#6C4AB6] p-3 rounded-2xl text-white shadow-lg shadow-purple-200">
              <TrendingUp size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800">Student Analytics</h1>
              <p className="text-slate-400 font-bold text-sm italic">Neural Performance Dashboard</p>
            </div>
          </div>
        </div>

        {/* SLIM SELECTION BAR */}
        <div className="px-10 py-6 bg-slate-50/50 border-b border-slate-100">
          <div className="grid grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Subject</label>
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full mt-1 p-3 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-[#6C4AB6] transition-all">
                <option value="">Select</option>
                <option value="Maths">Mathematics</option>
                <option value="English">English</option>
                <option value="Science">Science</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Grade</label>
              <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="w-full mt-1 p-3 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-[#6C4AB6] transition-all">
                <option value="">Select</option>
                <option value="Grade 6">Grade 6</option>
                <option value="Grade 7">Grade 7</option>
                <option value="Grade 8">Grade 8</option>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Student Name</label>
              <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="w-full mt-1 p-3 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-[#6C4AB6] transition-all">
                <option value="">Choose Student</option>
                {AUTHORIZED_STUDENTS.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <button 
              onClick={handleGetReport} 
              disabled={loading}
              className="bg-[#6C4AB6] text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-[#5a3da1] disabled:bg-slate-300 transition-all flex items-center justify-center gap-2"
            >
              <Search size={16} /> {loading ? "Analyzing..." : "Get Report"}
            </button>
          </div>
        </div>

        {/* ANALYTICS CONTENT */}
        <div className="flex-1 overflow-y-auto p-10 bg-white">
          {!reportData ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50">
              <UserCheck size={60} strokeWidth={1} />
              <p className="font-bold text-xs uppercase mt-4 tracking-widest">Select a student to load NeuroFlex Analytics</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* STATUS HEADER */}
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#6C4AB6] to-[#9D84D8] flex items-center justify-center text-white font-black text-2xl shadow-xl">{selectedStudent[0]}</div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800">{selectedStudent}</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedGrade} • {selectedSubject}</p>
                  </div>
                </div>
                <div className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border ${reportData.status === 'Needs Rest' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'}`}>
                  {reportData.status}
                </div>
              </div>

              {/* DATA CARDS GRID */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                {/* Neural Diagnostic Card */}
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4 text-[#6C4AB6]">
                    <Brain size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Neural Diagnostic</span>
                  </div>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                    "{reportData.details.ai_advice}"
                  </p>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-[#6C4AB6] transition-all">
                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Mastery Gain</span>
                    <span className="text-xl font-black text-[#6C4AB6]">{reportData.details.learning_efficiency}</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-[#6C4AB6] transition-all">
                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Focus Score</span>
                    <span className="text-xl font-black text-[#6C4AB6]">{reportData.details.focus}</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-[#6C4AB6] transition-all">
                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Consistency</span>
                    <span className="text-xl font-black text-[#6C4AB6]">{reportData.details.consistency_score}</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-[#6C4AB6] transition-all">
                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Retention</span>
                    <span className="text-xl font-black text-[#6C4AB6]">{reportData.details.memory_strength}</span>
                  </div>
                </div>
              </div>

              {/* STRENGTH/WEAKNESS TAGS */}
              <div className="flex gap-4">
                <div className="flex-1 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 flex items-center gap-4 transition-all hover:bg-emerald-50">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg"><Zap size={20} /></div>
                  <div>
                    <span className="text-[9px] font-black text-emerald-600 uppercase block">Student Strength</span>
                    <span className="text-sm font-black text-slate-800">{reportData.details.strong_area}</span>
                  </div>
                </div>
                <div className="flex-1 bg-red-50/50 p-5 rounded-2xl border border-red-100 flex items-center gap-4 transition-all hover:bg-red-50">
                  <div className="w-10 h-10 rounded-xl bg-red-400 text-white flex items-center justify-center shadow-lg"><Target size={20} /></div>
                  <div>
                    <span className="text-[9px] font-black text-red-500 uppercase block tracking-tighter">Needs Attention</span>
                    <span className="text-sm font-black text-slate-800">{reportData.details.weak_area}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Activity size={14} /> Analysis Powered by NeuroFlex DQN Model
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentProgressPage;