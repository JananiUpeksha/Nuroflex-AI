import React from 'react';
import { ArrowLeft, Mail, Zap, ShieldCheck } from 'lucide-react';

const ForgotPasswordPage = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#F8FAFC] font-sans relative overflow-hidden">
      {/* Dynamic Background Gradients to match the Dashboard/Study Plan theme */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#6C4AB6]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] bg-[#9D84D8]/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-xl px-6 z-10">
        {/* Back Button */}
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-slate-400 hover:text-[#6C4AB6] font-bold text-sm transition-all mb-6 ml-2"
        >
          <ArrowLeft size={18} /> Back to Sign In
        </button>

        {/* Main Glass Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white relative overflow-hidden">
          
          {/* Header Section */}
          <div className="text-center mb-10">
            <div className="bg-gradient-to-br from-[#6C4AB6] to-[#9D84D8] w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-200">
              <ShieldCheck size={40} className="text-white" />
            </div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">Forgot Password?</h2>
            <p className="text-slate-400 font-bold mt-2 italic text-sm">No worries, we'll help you secure your neural path.</p>
          </div>

          {/* Form Section */}
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Registered Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#6C4AB6] transition-colors" size={20} />
                <input 
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-[#6C4AB6]/10 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold text-slate-700" 
                  type="email" 
                  placeholder="name@example.com" 
                  required 
                />
              </div>
            </div>

            <button 
              className="w-full bg-[#6C4AB6] text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-purple-200 hover:scale-[1.02] active:scale-95 transition-all text-lg flex items-center justify-center gap-3 uppercase tracking-wider"
              type="submit"
            >
              <Zap size={20} fill="currentColor" />
              Send Recovery Link
            </button>
          </form>

          {/* Decorative Corner Icon */}
          <div className="absolute -bottom-6 -right-6 opacity-[0.03] text-slate-900 pointer-events-none">
            <Zap size={150} fill="currentColor" />
          </div>
        </div>

        {/* Support Link */}
        <p className="text-center mt-8 text-sm font-bold text-slate-400 italic">
          Need more help? <span className="text-[#6C4AB6] cursor-pointer hover:underline">Contact Neural Support</span>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
