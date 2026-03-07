import React, { useState } from 'react';
import { GraduationCap, Presentation, Mail, Lock, CheckCircle2 } from 'lucide-react';

interface LoginProps {
  onLogin: (name: string) => void;
  onRegister: () => void;
  onForgot: () => void;
  role: 'student' | 'instructor';
  setRole: (role: 'student' | 'instructor') => void;
}

const LoginPage = ({ onLogin, onRegister, onForgot, role, setRole }: LoginProps) => {
  // Logic fix: Capture the name input
  const [nameInput, setNameInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(nameInput); // Pass the name back to App.tsx
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col font-sans text-slate-700 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-40" 
           style={{ backgroundImage: 'radial-gradient(at 0% 0%, #9D84D8 0px, transparent 50%), radial-gradient(at 100% 100%, #FFD166 0px, transparent 40%)' }}>
      </div>
      <div className="absolute inset-0 z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#6C4AB6 1px, transparent 0)', backgroundSize: '24px 24px' }}>
      </div>

      <header className="w-full bg-white/70 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#6C4AB6] p-2 rounded-xl text-white shadow-lg shadow-purple-200">
              <GraduationCap size={20} />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800">NeuroFlex AI</h2>
          </div>
          <button onClick={onRegister} className="bg-[#6C4AB6] text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-[#5a3da0] shadow-md shadow-purple-100 transition-all">
            Sign Up
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-2xl bg-white/90 backdrop-blur-sm rounded-[2.5rem] shadow-2xl shadow-purple-900/10 border-2 border-slate-200/50 overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-black mb-3 text-slate-800 tracking-tight">Welcome</h1>
              <p className="text-slate-500 font-medium italic">Empowering your neural learning journey</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <button 
                onClick={() => setRole('student')}
                className={`group relative flex flex-col items-center p-8 rounded-2xl border-2 transition-all duration-300 active:scale-95 ${role === 'student' ? 'border-[#6C4AB6] bg-[#9D84D8]/10 shadow-inner' : 'border-slate-100 bg-white hover:border-purple-200'}`}
              >
                <div className={`size-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${role === 'student' ? 'bg-[#6C4AB6] text-white shadow-xl shadow-purple-200' : 'bg-slate-50 text-slate-300'}`}>
                  <GraduationCap size={32} />
                </div>
                <span className="text-lg font-bold text-slate-800">Student</span>
                {role === 'student' && <CheckCircle2 className="absolute top-4 right-4 text-[#6C4AB6]" size={20} />}
              </button>

              <button 
                onClick={() => setRole('instructor')}
                className={`group relative flex flex-col items-center p-8 rounded-2xl border-2 transition-all duration-300 active:scale-95 ${role === 'instructor' ? 'border-[#6C4AB6] bg-[#9D84D8]/10 shadow-inner' : 'border-slate-100 bg-white hover:border-purple-200'}`}
              >
                <div className={`size-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${role === 'instructor' ? 'bg-[#6C4AB6] text-white shadow-xl shadow-purple-200' : 'bg-slate-50 text-slate-300'}`}>
                  <Presentation size={32} />
                </div>
                <span className="text-lg font-bold text-slate-800">Instructor</span>
                {role === 'instructor' && <CheckCircle2 className="absolute top-4 right-4 text-[#6C4AB6]" size={20} />}
              </button>
            </div>

            <form className="space-y-5 max-w-md mx-auto" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <input 
                  className="w-full px-5 py-4 bg-[#F5F5F7]/50 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-[#6C4AB6] outline-none transition-all placeholder:text-slate-400 text-slate-800" 
                  placeholder="Enter your name" 
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  required 
                />
                <input className="w-full px-5 py-4 bg-[#F5F5F7]/50 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-[#6C4AB6] outline-none transition-all placeholder:text-slate-400 text-slate-800" placeholder="Password" type="password" />
              </div>

              <div className="flex justify-end">
                <button type="button" onClick={onForgot} className="text-sm font-bold text-[#6C4AB6] hover:text-[#9D84D8]">Forgot Password?</button>
              </div>

              <button className="w-full bg-[#6C4AB6] text-white font-extrabold py-4 rounded-2xl hover:bg-[#9D84D8] transition-all shadow-xl shadow-purple-200 mt-2" type="submit">
                Continue to Dashboard
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
