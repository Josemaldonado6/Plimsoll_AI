import React, { useState } from 'react';
import { 
  Search, 
  ChevronRight, 
  Anchor, 
  Table, 
  Info, 
  ShieldCheck,
  Zap,
  Ship,
  ArrowRight
} from 'lucide-react';
import { useStore, getApiUrl } from '../../store/useStore';
import { cn } from '../../lib/utils';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function Step1Identity() {
  const { t } = useTranslation();
  const { vesselInfo, setVesselInfo, setActiveTab } = useStore();
  const [imoSearch, setImoSearch] = useState(vesselInfo.imo || '');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAcquire = async () => {
    if (!imoSearch || isSearching) return;
    setIsSearching(true);
    setError(null);
    try {
      const response = await axios.get(getApiUrl(`/api/ship/${imoSearch}`));
      setVesselInfo(response.data);
    } catch (err) {
      console.error("Acquisition failed", err);
      setError("TARGET_NOT_FOUND: Ensure IMO is correct.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleNext = () => {
    if (vesselInfo.imo) {
      setActiveTab('Capture');
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 md:p-12 animate-fade-in relative">
      
      {/* BACKGROUND DECORATION - RADAR GRID */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none opacity-5">
        <div className="w-full h-full border border-[#e9c349] rounded-full animate-pulse flex items-center justify-center">
            <div className="w-2/3 h-2/3 border border-[#e9c349] rounded-full"></div>
            <div className="w-1/3 h-1/3 border border-[#e9c349] rounded-full"></div>
            <div className="absolute w-[2px] h-full bg-[#e9c349] rotate-45"></div>
            <div className="absolute w-[2px] h-full bg-[#e9c349] -rotate-45"></div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* LEFT PANEL: TARGET ACQUISITION */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase font-headline">
              Phase 01: <span className="text-[#e9c349]">Identity</span>
            </h2>
            <p className="text-slate-500 mt-2 font-headline text-xs uppercase tracking-[0.2rem] flex items-center gap-2">
              <Zap size={12} className="text-[#e9c349]" /> 
              Acquiring target vessel data from global maritime registry
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#e9c349]/20 to-transparent blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-[#171b28] border border-white/5 p-8 rounded-[2rem]">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500">
                    <Search size={24} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="ENTER IMO NUMBER (e.g. 9823471)"
                    value={imoSearch}
                    onChange={(e) => setImoSearch(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-6 pl-16 pr-6 font-mono text-xl text-white focus:outline-none focus:border-[#e9c349] transition-all placeholder:text-slate-700 uppercase"
                  />
                </div>
                <button 
                  onClick={handleAcquire}
                  disabled={isSearching}
                  className={cn(
                    "px-10 py-6 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3",
                    isSearching 
                      ? "bg-slate-800 text-slate-500 animate-pulse" 
                      : "bg-[#e9c349] text-black hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(233,195,73,0.2)]"
                  )}
                >
                  {isSearching ? 'SCROLLING...' : 'ACQUIRE TARGET'}
                  <ChevronRight size={20} />
                </button>
              </div>
              {error && (
                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-mono text-[10px] uppercase tracking-widest flex items-center gap-2">
                   <Info size={14} /> {error}
                </div>
              )}
            </div>
          </div>

          {/* VESSEL INSIGHT CARD */}
          {vesselInfo.imo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
              <div className="bg-[#1b1f2c] border border-white/5 p-6 rounded-3xl flex items-center gap-6">
                <div className="p-4 bg-white/5 rounded-2xl text-[#e9c349]">
                  <Ship size={32} />
                </div>
                <div>
                  <h3 className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Selected Vessel</h3>
                  <p className="text-xl font-black text-white uppercase tracking-tight">{vesselInfo.name}</p>
                </div>
              </div>
              <div className="bg-[#1b1f2c] border border-white/5 p-6 rounded-3xl grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-slate-500 font-black text-[8px] uppercase tracking-widest">LBP_CORR</h3>
                  <p className="text-lg font-mono font-bold text-[#00e639]">{vesselInfo.lbp || '---'} m</p>
                </div>
                <div>
                  <h3 className="text-slate-500 font-black text-[8px] uppercase tracking-widest">BEAM_MAX</h3>
                  <p className="text-lg font-mono font-bold text-[#00e639]">{vesselInfo.beam || '---'} m</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: HYDROSTATIC TABLE */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0a0e1a] border border-[#e9c349]/10 rounded-[2.5rem] p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Table size={120} className="text-[#e9c349]" />
            </div>
            
            <div className="relative z-10 space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-black text-lg uppercase tracking-tight flex items-center gap-2">
                    Hydrostatic Table
                    <ShieldCheck size={16} className="text-[#00e639]" />
                  </h3>
                  <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1">Manual structural override</p>
                </div>
                <div className="text-[10px] font-black text-[#e9c349] border border-[#e9c349]/20 px-2 py-1 rounded">
                  DNV_TYPE_APPROVED
                </div>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center text-xs p-4 rounded-xl bg-white/5 border border-white/5">
                   <span className="text-slate-400 font-bold">LBP (Length Between Perpendiculars)</span>
                   <span className="text-white font-mono font-bold">{vesselInfo.lbp || 'N/A'} m</span>
                 </div>
                 <div className="flex justify-between items-center text-xs p-4 rounded-xl bg-white/5 border border-white/5">
                   <span className="text-slate-400 font-bold">TPC (Tons Per Centimeter)</span>
                   <span className="text-white font-mono font-bold">42.8 t</span>
                 </div>
                 <div className="flex justify-between items-center text-xs p-4 rounded-xl bg-white/5 border border-white/5">
                   <span className="text-slate-400 font-bold">MTC (Moment to Change Trim)</span>
                   <span className="text-white font-mono font-bold">845.2 t/m</span>
                 </div>
              </div>

              <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-white hover:border-[#e9c349]/30 transition-all flex items-center justify-center gap-2">
                <Info size={14} /> Configure Full Data Set
              </button>
            </div>
          </div>

          <button 
            onClick={handleNext}
            disabled={!vesselInfo.imo}
            className={cn(
              "w-full py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-98",
              vesselInfo.imo 
                ? "bg-[#00e639] text-black shadow-[0_0_40px_rgba(0,230,57,0.15)]" 
                : "bg-slate-800 text-slate-600 opacity-50 grayscale cursor-not-allowed"
            )}
          >
            CONFIRM & INITIALIZE CAPTURE
            <ArrowRight size={24} />
          </button>
        </div>
      </div>

       {/* HUD SYSTEM LOG OVERLAY (DECORATIVE) */}
       <div className="absolute bottom-4 left-8 pointer-events-none hidden md:block">
         <div className="font-mono text-[8px] text-[#e9c349]/30 leading-tight">
            <div>SYS_LOAD_MODULE: STEP_01_IDENTITY</div>
            <div>STATUS: WAITING_FOR_USER_INPUT</div>
            <div>SESSION_TOKEN: 0xFD4422...</div>
         </div>
       </div>
    </div>
  );
}
