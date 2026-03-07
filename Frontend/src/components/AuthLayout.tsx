import React, { useEffect, useRef } from 'react';
import { BrainCircuit, Zap } from 'lucide-react';
import { animate } from '@motionone/dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  const graphicRef = useRef(null);

  // Subtle breathing animation for the central graphic
  useEffect(() => {
    if (graphicRef.current) {
      animate(
        graphicRef.current,
        { transform: ['scale(1)', 'scale(1.03)', 'scale(1)'] },
        { duration: 4, easing: 'ease-in-out', repeat: Infinity }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row relative overflow-hidden selection:bg-cyan-500/30">
      {/* High-Tech Grid Background 
        Replaces static images with a modern, high-performance gradient pattern.
      */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage: `
            radial-gradient(at 10% 10%, rgba(34, 211, 238, 0.1) 0px, transparent 50%),
            radial-gradient(at 90% 90%, rgba(139, 92, 246, 0.1) 0px, transparent 50%),
            linear-gradient(rgba(15, 23, 42, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 100% 100%, 50px 50px, 50px 50px'
        }}
      />
      
      {/* LEFT COLUMN: Visual/AI Descriptive Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-12 lg:p-16 z-10 border-r border-slate-900 bg-slate-950/50">
        <div className="flex items-center gap-3 self-start mb-auto">
           <Zap className="w-8 h-8 text-cyan-400 p-1.5 bg-slate-900 rounded-xl" />
           <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-tighter">
              NeuroFlex AI
           </h1>
        </div>

        {/* Central Animated Graphic */}
        <div ref={graphicRef} className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center my-16">
          <BrainCircuit className="w-full h-full text-cyan-500/90 filter blur-[0.7px]" />
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-[80px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px]" />
        </div>

        {/* Bottom Tagline */}
        <div className="text-center mt-auto max-w-lg">
          <p className="text-slate-400 text-lg leading-relaxed">
            The next generation of Neural Education and Model Management. 
            Access your courses, training data, and AI assistants from one unified console.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Interaction Section */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 z-10">
        {/* Main Glassmorphism Form Card */}
        <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl border border-slate-800 p-10 rounded-3xl shadow-[0_0_60px_-15px_rgba(34,211,238,0.2)]">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-white mb-2.5 tracking-tight">{title}</h2>
            <p className="text-slate-400 text-base">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
