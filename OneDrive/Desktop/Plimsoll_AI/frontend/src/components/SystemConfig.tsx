import { useState } from 'react';
import { Settings, Shield, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import axios from 'axios';
import { useStore, getApiUrl } from '../store/useStore';

export default function SystemConfig() {
    const { t } = useTranslation();
    const { theme, token, edgeUrl, setEdgeUrl } = useStore();

    // Standard React State instead of document.getElementById
    const [density, setDensity] = useState<number>(1.025);
    const [draftFwd, setDraftFwd] = useState<string>('');
    const [draftAft, setDraftAft] = useState<string>('');
    const [calculatedTrim, setCalculatedTrim] = useState<string>('--');

    const handleUpdateKernel = async () => {
        try {
            const fwd = parseFloat(draftFwd) || 0;
            const aft = parseFloat(draftAft) || 0;
            
            const res = await axios.post(getApiUrl('/api/environment'), {
                density: density,
                draft_fwd: fwd || null,
                draft_aft: aft || null
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            alert(`Physics Kernel Updated!\nTrim: ${res.data.physics_state.trim.toFixed(3)} m`);
            setCalculatedTrim(`${res.data.physics_state.trim.toFixed(3)} m`);
        } catch (e) {
            alert("Update Failed. Ensure backend is running.");
            console.error(e);
        }
    };

    const handleReset = () => {
        if (window.confirm("CRITICAL: This will wipe all local history and reset the application. Proceed?")) {
            useStore.persist.clearStorage();
            useStore.getState().resetState();
            setTimeout(() => {
                window.location.reload();
            }, 100);
        }
    };

    return (
        <div className={cn(
            "rounded-[2.5rem] p-8 md:p-12 border h-full overflow-y-auto",
            theme === 'dark' ? "bg-white/5 border-white/5 shadow-2xl" : "bg-white border-slate-200"
        )}>
            <h2 className={cn("text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2", theme === 'dark' ? "text-white" : "text-slate-900")}>
                <Settings className="text-yellow-400" size={24} />
                {t('config.physics_engine')}
            </h2>

            {/* [NEW] EDGE NODE HUB CONFIGURATION */}
            <div className="mb-8 p-6 bg-yellow-400/5 border border-yellow-400/20 rounded-2xl">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400 mb-4 flex items-center gap-2">
                    <Shield size={14} />
                    Edge Processor Network (Intel Ultra 9)
                </h3>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Edge Hub IP Address</label>
                        <input 
                            type="text" 
                            value={edgeUrl} 
                            onChange={(e) => setEdgeUrl(e.target.value)}
                            placeholder="http://192.168.1.160:8000"
                            className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm font-mono text-white focus:border-yellow-400 outline-none transition-all" 
                        />
                    </div>
                    <div className="flex items-end">
                        <div className={cn(
                            "px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                            edgeUrl.includes("localhost") ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                        )}>
                            <div className={cn("w-2 h-2 rounded-full", edgeUrl.includes("localhost") ? "bg-red-400" : "bg-green-400 animate-pulse")} />
                            {edgeUrl.includes("localhost") ? "LOCAL_ONLY" : "HYBRID_CLOUD_ACTIVE"}
                        </div>
                    </div>
                </div>
                <p className="mt-3 text-[9px] text-slate-500 leading-relaxed italic">
                    Conexión establecida para Inferencia IA de alta precisión. El procesado OpenVINO se ejecutará en esta dirección.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* General Parameters */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('config.vessel_particulars')}</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">{t('config.lbp')}</label>
                            <input type="number" defaultValue={229.0} className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm font-mono text-white focus:border-yellow-400/50 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">{t('config.beam')}</label>
                            <input type="number" defaultValue={32.26} className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm font-mono text-white focus:border-yellow-400/50 outline-none transition-all" />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">{t('config.env_trim')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">{t('config.water_density')}</label>
                                <input
                                    type="number"
                                    value={density}
                                    step="0.001"
                                    onChange={(e) => setDensity(parseFloat(e.target.value))}
                                    className="w-full bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-3 text-sm font-mono text-yellow-400 focus:border-yellow-400 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">{t('config.calc_trim')}</label>
                                <div className="w-full bg-black/60 border border-white/5 rounded-lg p-3 text-sm font-mono text-slate-600">
                                    {calculatedTrim}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">{t('config.draft_fwd')}</label>
                                <input 
                                    type="number" 
                                    placeholder="Optional" 
                                    value={draftFwd}
                                    onChange={(e) => setDraftFwd(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm font-mono text-white focus:border-yellow-400/50 outline-none transition-all" 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">{t('config.draft_aft')}</label>
                                <input 
                                    type="number" 
                                    placeholder="Optional" 
                                    value={draftAft}
                                    onChange={(e) => setDraftAft(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm font-mono text-white focus:border-yellow-400/50 outline-none transition-all" 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hydrostatic Table (TPC) */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('config.hydro_table')}</h3>
                    <div className="bg-black/40 rounded-xl p-6 border border-white/5">
                        <div className="grid grid-cols-2 gap-4 mb-4 text-[10px] font-black text-yellow-400 uppercase tracking-widest">
                            <div>DRAFT (m)</div>
                            <div>TPC (t/cm)</div>
                        </div>
                        {[
                            { d: 5.0, t: 48.5 },
                            { d: 8.0, t: 52.1 },
                            { d: 12.0, t: 55.4 },
                            { d: 15.0, t: 58.2 }
                        ].map((row, i) => (
                            <div key={i} className="grid grid-cols-2 gap-4 mb-2 text-sm font-mono border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                <input type="number" defaultValue={row.d} className="bg-transparent border-none text-slate-500 focus:text-white focus:ring-0 p-0 outline-none" />
                                <input type="number" defaultValue={row.t} className="bg-transparent border-none text-white focus:ring-0 p-0 outline-none" />
                            </div>
                        ))}
                        <button className="w-full mt-4 py-3 text-[10px] font-black uppercase tracking-widest text-yellow-400 border border-yellow-400/20 rounded-lg hover:bg-yellow-400 hover:text-black transition-all">
                            {t('config.add_row')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <button
                    onClick={handleReset}
                    className="text-[10px] font-black uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-colors flex items-center gap-2"
                >
                    <RotateCcw size={12} />
                    Reset Application State
                </button>

                <button
                    onClick={handleUpdateKernel}
                    className="bg-yellow-400 text-black font-black uppercase tracking-widest px-8 py-4 rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-xl"
                >
                    <Shield size={18} strokeWidth={3} />
                    {t('config.update_kernel')}
                </button>
            </div>
        </div>
    );
}
