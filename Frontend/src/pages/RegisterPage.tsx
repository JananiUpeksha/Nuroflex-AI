import React from 'react';
import { User, Mail, Lock, ArrowLeft } from 'lucide-react';

const RegisterPage = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(at 0% 0%, #9D84D8 0px, transparent 50%)' }}></div>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#6C4AB6 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] border-2 border-slate-200 shadow-2xl z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-[#6C4AB6] mb-8 font-bold text-sm transition-colors">
          <ArrowLeft size={18} /> Return to login
        </button>
        <h2 className="text-3xl font-black text-slate-800 mb-6 tracking-tight">Create Account</h2>
        <form className="space-y-4">
          <input type="text" placeholder="Full Name" className="w-full px-5 py-4 bg-[#F5F5F7]/50 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-[#6C4AB6] outline-none" />
          <input type="email" placeholder="Email" className="w-full px-5 py-4 bg-[#F5F5F7]/50 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-[#6C4AB6] outline-none" />
          <input type="password" placeholder="Password" className="w-full px-5 py-4 bg-[#F5F5F7]/50 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-[#6C4AB6] outline-none" />
          <button className="w-full bg-[#6C4AB6] text-white font-extrabold py-4 rounded-2xl mt-4 hover:bg-[#9D84D8] shadow-lg">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
