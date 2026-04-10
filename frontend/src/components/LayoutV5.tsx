import React from 'react';
import { 
  ShieldCheck, 
  Fingerprint, 
  Radar, 
  Activity, 
  Verified, 
  Cpu,
  Database,
  Archive,
  LogOut,
  SlidersHorizontal,
  Globe2
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import VaultV5 from './V5/VaultV5';
import SettingsV5 from './V5/SettingsV5';

export default function LayoutV5({ children }: { children: React.ReactNode }) {
  const { 
    activeTab, 
    setActiveTab, 
    user, 
    isOnline,
    vesselInfo,
    addAuditLog
  } = useStore();
  const { t, i18n } = useTranslation();
  
  const [vaultOpen, setVaultOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // LOG NAVIGATION
  useEffect(() => {
    addAuditLog('NAVIGATE', `System view switched to ${activeTab}`);
  }, [activeTab, addAuditLog]);

  const handleLangToggle = () => {
    const langs = ['en', 'es', 'pt', 'zh'];
    const current = i18n.language || 'en';
    const nextIdx = (langs.indexOf(current) + 1) % langs.length;
    i18n.changeLanguage(langs[nextIdx]);
  };

  const missionTabs: { id: 'Identity' | 'Capture' | 'Analysis' | 'Certify', icon: any, label: string }[] = [
    { id: 'Identity', icon: Fingerprint, label: t('v5.ops_hub', 'Ops Hub') },
    { id: 'Capture', icon: Radar, label: t('v5.scan', 'Scan') },
    { id: 'Analysis', icon: Activity, label: t('v5.matrix', 'Matrix') },
    { id: 'Certify', icon: Verified, label: t('v5.manifest', 'Manifest') },
  ];



  return (
    <div className="bg-[#0a0e1a] text-[#dfe2f3] h-screen flex flex-col font-body selection:bg-[#e9c349] selection:text-[#3c2f00] overflow-hidden">
      
      {/* TOP APP BAR - ESTATUS GLOBAL */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#0a0e1a] border-b border-[#e9c349]/5">
        <div className="flex items-center gap-8">
          <h1 
            className="text-2xl font-black text-[#e9c349] tracking-tighter font-headline flex items-center gap-2 select-none group"
          >
            {t('v5.mission_title', 'PLIMSOLL SYSTEM')} <span className="text-[10px] bg-[#e9c349]/20 px-1.5 py-0.5 rounded tracking-widest text-[#e9c349] group-hover:bg-[#e9c349] group-hover:text-[#0a0e1a] transition-all">V5</span>
          </h1>
          <nav className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-500 font-headline text-[10px] uppercase tracking-[0.1rem]">
              <ShieldCheck size={12} className="text-[#00e639]" />
              {t('v5.dnv_certified', 'DNV_CERTIFIED')}
            </div>
            <div className="text-[#e9c349]/60 font-headline text-[10px] uppercase tracking-[0.1rem] border-l border-white/10 pl-6">
              MISSION_{new Date().getUTCHours()}:{new Date().getUTCMinutes()}_UTC
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleLangToggle}
            title={`Language: ${i18n.language?.toUpperCase() || 'EN'}`} 
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-[#e9c349]/10 hover:text-[#e9c349] transition-all rounded uppercase border border-white/5"
          >
            <Globe2 size={14} /> {i18n.language?.substring(0, 2) || 'EN'}
          </button>
          <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
          <button 
             onClick={() => setSettingsOpen(true)}
             title={t('v5.system_components', 'Operator Preferences')} 
             className="p-2 text-slate-500 hover:bg-[#e9c349]/10 hover:text-[#e9c349] transition-all rounded transition-all active:scale-90"
          >
            <SlidersHorizontal size={20} />
          </button>
          <button 
             onClick={() => setVaultOpen(true)}
             title={t('v5.terminal_logic', 'Audit Vault (History)')} 
             className="p-2 text-slate-500 hover:bg-[#e9c349]/10 hover:text-[#e9c349] transition-all rounded transition-all active:scale-90"
          >
            <Archive size={20} />
          </button>
          <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
          <button 
            title={t('v5.end_shift', 'End Shift / Secure Logout')}
            onClick={() => useStore.getState().logout()}
            className="flex items-center gap-3 text-slate-500 hover:text-red-500 transition-colors group"
          >
            <div className="text-right">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-red-500 transition-colors">
                {user?.full_name?.split(' ')[0]}_01
              </div>
              <div className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">
                {t('v5.end_shift', 'END SHIFT')}
              </div>
            </div>
            <LogOut size={24} className="border border-white/5 p-1 rounded-full group-hover:border-red-500/50" />
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
                  "flex flex-col items-center justify-center px-10 py-2 transition-all relative min-w-[120px] group",
                  isActive 
                    ? "bg-[#e9c349] text-[#0a0e1a] shadow-[0_0_25px_rgba(233,195,73,0.4)]" 
                    : "text-slate-500 hover:bg-[#e9c349]/5 hover:text-[#e9c349]"
                )}
              >
                <div className={cn(
                  "transition-all duration-300",
                  !isActive && "group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_#e9c349]"
                )}>
                  <Icon size={24} className={cn(isActive && "fill-[#0a0e1a]")} />
                </div>
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
            <div className="flex flex-col items-center opacity-40 hover:opacity-100 transition-opacity cursor-help">
              <Cpu size={14} />
              <span className="text-[8px] font-bold mt-1 tracking-widest">{t('v5.data_rel_short', 'DATA_REL')}</span>
            </div>
            <div className="flex flex-col items-center opacity-40 hover:opacity-100 transition-opacity cursor-help">
              <Database size={14} />
              <span className="text-[8px] font-bold mt-1 tracking-widest">{t('v5.local_db_short', 'LOCAL_DB')}</span>
            </div>
          </div>
          <div className="h-10 w-[1px] bg-white/5"></div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isOnline ? "bg-[#00e639] shadow-[0_0_10px_#00e639]" : "bg-red-500")} />
              <span className="text-[#e9c349] font-black text-[10px] tracking-widest">{t('v5.pulse_stable', 'PULSE: STABLE')}</span>
            </div>
            <div className="text-[8px] text-slate-500 uppercase font-bold mt-0.5 truncate max-w-[150px]">
              {vesselInfo?.name || t('v5.no_target', 'NO_TARGET_ACQUIRED')}
            </div>
          </div>
        </div>
      </nav>

      {/* OVERRAYS DECORATIVOS HUD */}
      <div className="fixed inset-0 pointer-events-none hud-scanline opacity-30"></div>
      
      {/* SYSTEM OVERLAYS */}
      {vaultOpen && <VaultV5 onClose={() => setVaultOpen(false)} />}
      {settingsOpen && <SettingsV5 onClose={() => setSettingsOpen(false)} />}
      
      <div className="fixed top-20 right-8 pointer-events-none opacity-20">
        <div className="font-mono text-[8px] text-[#e9c349] leading-none space-y-1 bg-black/40 p-2 border-r border-[#e9c349]/40 backdrop-blur-sm">
          <div className="animate-pulse flex gap-2"><span>{t('v5.recv_buf', 'RECV_BUF: 0x442A')}</span></div>
          <div className="flex gap-2 text-white/50"><span>{t('v5.status_locked', 'STATUS: LOCKED')}</span></div>
          <div className="flex gap-2"><span>{t('v5.auth_dnv', 'AUTH: DNV_GL_SECURE')}</span></div>
          <div className="flex gap-2 text-[#00e639]"><span>{t('v5.phase_pre_survey', 'PHASE: PRE_SURVEY_01')}</span></div>
        </div>
      </div>
    </div>
  );
}
