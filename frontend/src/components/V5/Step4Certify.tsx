
import { 
  ShieldCheck, 

  Share2, 
  FileText, 
  CheckCircle2,
  QrCode,
  Verified
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTranslation } from 'react-i18next';


export default function Step4Certify({ onExport, onReset }: { onExport: (id: number, netCargo?: number) => void, onReset: () => void }) {

  const { operations, activeOperationId, vesselInfo } = useStore();
  const { t } = useTranslation();
  
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


  return (
    <div className="flex-1 flex flex-col p-8 md:p-12 animate-fade-in relative">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* LEFT: DIGITAL CERTIFICATION SEAL */}
        <div className="lg:col-span-5 flex flex-col gap-8 items-center">
            <div className="relative group w-full flex justify-center">
                <div className="relative w-80 h-80 border-4 border-[#00e639]/30 rounded-full flex flex-col items-center justify-center bg-[#0a0e1a]/40 backdrop-blur-xl shadow-[0_0_100px_rgba(0,230,57,0.15)] group-hover:shadow-[0_0_120px_rgba(0,230,57,0.25)] transition-all duration-700">
                   <div className="absolute top-0 right-10 p-4 bg-[#00e639] text-black rounded-full rotate-12 shadow-[0_0_20px_#00e639] animate-pulse">
                        <Verified size={32} />
                   </div>
                   <ShieldCheck size={120} className="text-[#00e639] mb-4 drop-shadow-[0_0_15px_#00e639]" />
                   <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-4 text-center">
                    <CheckCircle2 size={24} className="text-[#00e639]" />
                    {t('v5.mission_certified', 'Mission Certified')}
                   </h2>
                   <div className="flex flex-col gap-1 mt-4 text-center">
                       <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('v5.operation_id', 'Operation ID')}</h3>
                       <p className="font-mono text-[#e9c349] text-xs font-bold">OP_{activeOperationId?.toUpperCase()}</p>
                   </div>
                </div>
            </div>

            <div className="bg-[#1b1f2c]/50 backdrop-blur-md border border-white/5 rounded-3xl p-8 relative overflow-hidden w-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00e639]/10 rounded-bl-full pointer-events-none" />
                <h3 className="text-[#00e639] font-black text-[10px] uppercase tracking-widest flex items-center gap-2 mb-6">
                    <ShieldCheck size={14} /> {t('v5.sovereign_proof', 'Sovereign Cryptographic Proof')}
                </h3>
                <p className="text-slate-300 text-[10px] leading-relaxed mb-6 font-medium">
                    {t('v5.notarized_ledger', 'The results have been notarized into the Plimsoll Immutable Ledger. Any modification will invalidate this certificate.')}
                </p>
            </div>
        </div>

        {/* RIGHT: FINAL ACTIONS & SUMMARY */}
        <div className="lg:col-span-7 space-y-8">
            <div className="bg-[#171b28] border border-white/5 p-10 rounded-[3rem] space-y-8 shadow-inner">
                <div>
                   <h3 className="text-slate-500 font-black text-xs uppercase tracking-[0.2em] mb-2">{vesselInfo.name} // {t('v5.final_report', 'FINAL REPORT')}</h3>
                   <div className="bg-black/40 rounded-2xl p-6 border border-white/5">
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest border-b border-white/10 pb-2 mb-4">
                        {t('v5.verified_displacement', 'Verified Displacement')}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8 mb-6">
                        <div>
                            <span className="text-[10px] text-[#e9c349] font-black uppercase tracking-widest">{t('v5.true_net_cargo', 'TRUE_NET_CARGO (FINAL - INITIAL)')}</span>
                            <div className="text-3xl font-black text-white mt-1">
                                {isFinalMath ? (
                                    <span className="text-white">{netCargo.toLocaleString()} MT</span>
                                ) : (
                                    <span className="text-slate-500 text-lg">{t('v5.projected_net_cargo', 'PROJECTED_NET_CARGO')}</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t('v5.reliability_rating', 'RELIABILITY_RATING')}</span>
                            <div className="text-3xl font-black text-[#00e639] mt-1">{Math.floor((latestScan.data_reliability || 0) * 100)}%</div>
                        </div>
                    </div>
                </div>
                </div>

                <div className="flex flex-col gap-4">
                    <button 
                        onClick={() => latestScan.id && onExport(latestScan.id, isFinalMath ? netCargo : undefined)}
                        className="w-full py-6 rounded-2xl bg-[#e9c349] text-black font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-98 transition-all shadow-2xl"
                    >
                        <FileText size={24} /> 
                        {t('v5.export_official_pdf', 'EXPORT OFFICIAL PDF')}
                    </button>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="py-4 rounded-xl border border-white/10 text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                            <Share2 size={16} />
                            {t('v5.cloud_share', 'CLOUD SHARE')}
                        </button>
                        <button className="py-4 rounded-xl border border-white/10 text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                            <QrCode size={16} />
                            {t('v5.public_mirror', 'PUBLIC MIRROR')}
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
                      {t('v5.official_audit', 'Official Draft Survey Master Log')}<br />{t('v5.powered_by', 'Powered by Plimsoll Sovereign Engine')}
                   </div>
                </div>
                
                <div className="text-center pt-8">
                    <button 
                      onClick={onReset}
                      className="text-slate-500 hover:text-white font-bold text-xs tracking-widest uppercase transition-colors"
                    >
                      <span className="border-b border-transparent hover:border-white pb-1">{t('v5.new_audit_mission', 'NEW AUDIT MISSION')}</span>
                    </button>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
}
