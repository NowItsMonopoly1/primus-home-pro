
import React from 'react';
import { Monitor, Smartphone, Zap, ShieldCheck, User, Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: 'technician' | 'office';
  onViewChange: (view: 'technician' | 'office') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange }) => {
  return (
    <div className="h-screen flex flex-col bg-slate-900 text-slate-100">
      {/* Precision Command Header */}
      <header className="h-16 border-b border-slate-700/50 px-4 md:px-8 flex items-center justify-between shrink-0 bg-slate-800">
        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-[#007AFF] fill-current" />
            <h1 className="font-black text-xs md:text-sm uppercase tracking-[0.2em]">ForgeExec</h1>
          </div>
          <div className="hidden sm:block h-6 w-px bg-white/10"></div>
          <div className="hidden lg:flex items-center gap-3">
            <span className="text-[10px] font-mono text-white/30 uppercase">SYSTEM_STATE:</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase">ONLINE</span>
            </div>
          </div>
        </div>

        {/* View Switcher: Industrial Grade */}
        <div className="flex bg-white/5 border border-white/10 p-1">
          <button
            onClick={() => onViewChange('technician')}
            className={`flex items-center gap-2 px-4 md:px-6 py-1.5 text-[10px] md:text-[11px] font-black uppercase tracking-widest ${
              activeView === 'technician' 
                ? 'bg-white text-black' 
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <Smartphone size={14} className="hidden xs:block" />
            Field
          </button>
          <button
            onClick={() => onViewChange('office')}
            className={`flex items-center gap-2 px-4 md:px-6 py-1.5 text-[10px] md:text-[11px] font-black uppercase tracking-widest ${
              activeView === 'office' 
                ? 'bg-white text-black' 
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <Monitor size={14} className="hidden xs:block" />
            Office
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center gap-2 text-white/60 hover:text-white uppercase font-black text-[10px] tracking-widest">
            <User size={16} />
            <span className="hidden md:inline">OP_S.MILLER</span>
          </button>
          <button className="sm:hidden p-2 text-white/40 hover:text-white">
            <Menu size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  );
};
