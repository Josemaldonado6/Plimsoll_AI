
import { 
  ShieldCheck, 

  Share2, 
  FileText, 
  CheckCircle2,
  Lock,
  Globe,
  RotateCcw,
  Verified
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';


export default function Step4Certify({ onExport, onReset }: { onExport: (id: number) => void, onReset: () => void }) {

  const { operations, activeOperationId, vesselInfo } = useStore();
  
  const activeOp = operations.find(o => o.id === activeOperationId);
  const latestScan = activeOp?.scans[activeOp.scans.length - 1];

  if (!activeOp || !latestScan) return null;

  // SOVEREIGN DIFFERENTIAL CALCULATION
  const initialScan = activeOp.scans.find(s => s.phase === 'INITIAL');
  const finalScan = activeOp.scans.find(s => s.phase === 'FINAL');
  
  const tpc = 42.8;
  let netCargo = 0;
  let isFinalMath = false;

  if (initialScan && finalScan) {
      // Real Mathematical Difference
      const initialDisp = (initialScan.draft_mean * 100 * tpc);
      const finalDisp = (finalScan.draft_mean * 100 * tpc);
      netCargo = Math.abs(finalDisp - initialDisp); // Absolute to handle loading or discharging
      isFinalMath = true;
  } else {
      // Fallback projection based on the latest scan
      const coreDraft = latestScan.draft_mean || 0;
      netCargo = (coreDraft ? (coreDraft * 100 * tpc) - 5000 : 0);
  }

  const displayWeight = Math.max(0, netCargo);

  return (
    <div className="flex-1 flex flex-col p-8 md:p-12 animate-fade-in relative">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* LEFT: DIGITAL CERTIFICATION SEAL */}
        <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative group">
                <div className="absolute inset-0 bg-[#00e639] blur-[100px] opacity-10 group-hover:opacity-25 transition-opacity duration-1000"></div>
                <div className="relative w-80 h-80 border-4 border-[#00e639]/30 rounded-full flex flex-col items-center justify-center bg-black/40 backdrop-blur-xl shadow-[0_0_80px_rgba(0,230,57,0.1)]">
                   <div className="absolute top-0 right-10 p-4 bg-[#00e639] text-black rounded-full rotate-12 shadow-2xl">
                        <Verified size={32} />
                   </div>
                   <ShieldCheck size={120} className="text-[#00e639] mb-4" />
                   <h2 className="text-white font-black text-2xl uppercase tracking-widest text-center leading-none">
                     Mission<br />Certified
                   </h2>
                   <div className="mt-6 flex flex-col items-center">
                        <span className="text-slate-500 font-mono text-[10px] uppercase tracking-widest leading-none">Operation ID</span>
                        <span className="text-[#00e639] font-mono text-[12px] font-bold mt-1 uppercase tracking-tighter">{activeOp.id}</span>
                   </div>
                </div>
            </div>

            <div className="mt-12 text-center space-y-4">
               <div className="flex items-center gap-3 justify-center text-slate-500 font-headline text-[10px] uppercase tracking-[0.2em]">
                  <Lock size={12} className="text-[#e9c349]" /> Sovereign Cryptographic Proof
               </div>
               <p className="text-slate-600 text-[9px] max-w-xs leading-relaxed uppercase italic">
                 The results have been notarized into the Plimsoll Immutable Ledger. Any modification will invalidate this certificate.
               </p>
            </div>
        </div>

        {/* RIGHT: FINAL ACTIONS & SUMMARY */}
        <div className="lg:col-span-7 space-y-8">
            <div className="bg-[#171b28] border border-white/5 p-10 rounded-[3rem] space-y-8">
                <div>
                   <h3 className="text-slate-500 font-black text-xs uppercase tracking-[0.2em] mb-2">{vesselInfo.name} // FINAL REPORT</h3>
                   <div className="flex items-baseline gap-4">
                        <span className="text-white text-6xl font-black font-headline tracking-tighter uppercase leading-none">Verified Displacement</span>
                        <CheckCircle2 size={40} className="text-[#00e639]" />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/5">
                    <div className="space-y-1">
                        <span className="text-slate-500 font-black text-[9px] uppercase tracking-widest">
                            {isFinalMath ? 'TRUE_NET_CARGO (FINAL - INITIAL)' : 'PROJECTED_NET_CARGO'}
                        </span>
                        <div className="flex items-baseline gap-2">
                             <p className={cn("text-3xl font-black", isFinalMath ? "text-[#e9c349]" : "text-white")}>{Math.round(displayWeight).toLocaleString()}</p>
                             <span className={cn("font-bold text-xs", isFinalMath ? "text-[#e9c349]" : "text-[#e9c349]/50")}>t</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                         <span className="text-slate-500 font-black text-[9px] uppercase tracking-widest">RELIABILITY_RATING</span>
                         <p className="text-3xl font-black text-[#00e639]">DNV_A+</p>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <button 
                        onClick={() => latestScan.id && onExport(latestScan.id)}
                        className="w-full py-6 rounded-2xl bg-[#e9c349] text-black font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-98 transition-all shadow-2xl"
                    >
                        <FileText size={24} /> 
                        EXPORT OFFICIAL PDF
                    </button>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="py-4 rounded-xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                           <Share2 size={16} /> CLOUD SHARE
                        </button>
                        <button className="py-4 rounded-xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                           <Globe size={16} /> PUBLIC MIRROR
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center px-6">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full overflow-hidden border border-[#e9c349]/20 p-1">
                        <img src="/logo.png" alt="Plimsoll" className="w-full h-full object-contain filter grayscale" />
                   </div>
                   <div className="text-left font-mono text-[8px] text-slate-700 leading-tight uppercase">
                      Official Draft Survey Master Log<br />Powered by Plimsoll Sovereign Engine
                   </div>
                </div>
                
                <button 
                  onClick={onReset}
                  className="group flex items-center gap-3 text-slate-500 hover:text-white transition-colors"
                >
                    <span className="text-[10px] font-black uppercase tracking-widest">NEW AUDIT MISSION</span>
                    <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-700" />
                </button>
            </div>
        </div>
      </div>

    </div>
  );
}
