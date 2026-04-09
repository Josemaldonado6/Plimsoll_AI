import React from 'react';
import { 
  ShieldCheck, 
  Terminal, 
  Settings, 
  User, 
  Fingerprint, 
  Radar, 
  Activity, 
  Verified, 
  Cpu,
  Monitor
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';

export default function LayoutV5({ children }: { children: React.ReactNode }) {
  const { 
    activeTab, 
    setActiveTab, 
    user, 
    isOnline,
    vesselInfo 
  } = useStore();

  const missionTabs: { id: 'Identity' | 'Capture' | 'Analysis' | 'Certify', icon: any, label: string }[] = [
    { id: 'Identity', icon: Fingerprint, label: 'Identity' },
    { id: 'Capture', icon: Radar, label: 'Capture' },
    { id: 'Analysis', icon: Activity, label: 'Analysis' },
    { id: 'Certify', icon: Verified, label: 'Certify' },
  ];

  return (
    <div className="bg-[#0a0e1a] text-[#dfe2f3] h-screen flex flex-col font-body selection:bg-[#e9c349] selection:text-[#3c2f00] overflow-hidden">
      
      {/* TOP APP BAR - ESTATUS GLOBAL */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#0a0e1a] border-b border-[#e9c349]/5">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-black text-[#e9c349] tracking-tighter font-headline flex items-center gap-2">
            PLIMSOLL AI <span className="text-[10px] bg-[#e9c349]/20 px-1.5 py-0.5 rounded tracking-widest">V5</span>
          </h1>
          <nav className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-500 font-headline text-[10px] uppercase tracking-[0.1rem]">
              <ShieldCheck size={12} className="text-[#00e639]" />
              DNV_CERTIFIED
            </div>
            <div className="text-[#e9c349]/60 font-headline text-[10px] uppercase tracking-[0.1rem] border-l border-white/10 pl-6">
              MISSION_{new Date().getUTCHours()}:{new Date().getUTCMinutes()}_UTC
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button title="System Components" className="p-2 text-slate-500 hover:bg-[#e9c349]/10 hover:text-[#e9c349] transition-all rounded">
            <Settings size={20} />
          </button>
          <button title="Terminal Logic" className="p-2 text-slate-500 hover:bg-[#e9c349]/10 hover:text-[#e9c349] transition-all rounded">
            <Terminal size={20} />
          </button>
          <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
          <button className="flex items-center gap-3 text-slate-500 hover:text-[#e9c349] group">
            <div className="text-right">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">
                {user?.full_name?.split(' ')[0]}_01
              </div>
              <div className="text-[8px] font-bold text-[#e9c349]/50 uppercase tracking-tighter">
                {user?.tier}
              </div>
            </div>
            <User size={24} className="border border-white/5 p-0.5 rounded-full" />
          </button>
        </div>
      </header>

      {/* MAIN MISSION CANVAS */}
      <main className="flex-1 mt-16 mb-20 relative flex overflow-hidden">
        <div className="flex-1 relative flex flex-col overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </main>

      {/* BOTTOM MISSION NAV - MISSION FLOW */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-center items-stretch h-20 bg-[#0a0e1a]/95 backdrop-blur-3xl border-t border-[#e9c349]/5">
        <div className="flex-1 flex justify-center items-stretch">
          {missionTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center px-10 py-2 transition-all relative min-w-[120px]",
                  isActive 
                    ? "bg-[#e9c349] text-[#0a0e1a] shadow-[0_0_20px_rgba(233,195,73,0.3)]" 
                    : "text-slate-500 hover:bg-[#e9c349]/5 hover:text-[#e9c349]"
                )}
              >
                <Icon size={24} className={cn(isActive && "fill-[#0a0e1a]")} />
                <span className="font-headline font-bold text-[10px] uppercase mt-1 tracking-widest">
                  {tab.label}
                </span>
                {isActive && (
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-white/30" />
                )}
              </button>
            );
          })}
        </div>

        {/* TELEMETRY READOUT (RIGHT SIDE) */}
        <div className="hidden lg:flex border-l border-white/5 px-8 items-center gap-8 bg-[#0a0e1a]">
          <div className="flex gap-6">
            <div className="flex flex-col items-center opacity-40">
              <Cpu size={14} />
              <span className="text-[8px] font-bold mt-1 tracking-widest">CORTEX</span>
            </div>
            <div className="flex flex-col items-center opacity-40">
              <Monitor size={14} />
              <span className="text-[8px] font-bold mt-1 tracking-widest">HUB</span>
            </div>
          </div>
          <div className="h-10 w-[1px] bg-white/5"></div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isOnline ? "bg-[#00e639] shadow-[0_0_10px_#00e639]" : "bg-red-500")} />
              <span className="text-[#e9c349] font-black text-[10px] tracking-widest">PULSE: STABLE</span>
            </div>
            <div className="text-[8px] text-slate-500 uppercase font-bold mt-0.5 truncate max-w-[150px]">
              {vesselInfo?.name || 'NO_TARGET_ACQUIRED'}
            </div>
          </div>
        </div>
      </nav>

      {/* OVERRAYS DECORATIVOS HUD */}
      <div className="fixed inset-0 pointer-events-none hud-scanline opacity-30"></div>
      <div className="fixed top-20 right-8 pointer-events-none opacity-20">
        <div className="font-mono text-[8px] text-[#e9c349] leading-none space-y-1 bg-black/40 p-2 border-r border-[#e9c349]/40">
          <div>RECV_BUF: 0x442A</div>
          <div>STATUS: LOCKED</div>
          <div>AUTH: DNV_GL_SECURE</div>
          <div>PHASE: PRE_SURVEY_01</div>
        </div>
      </div>
    </div>
  );
}
