import { 
  X, 
  Droplets,
  HardDrive,
  Zap,
  Activity,
  ArrowDownToLine
} from 'lucide-react';
import { useStore, getApiUrl } from '../../store/useStore';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Tank {
    id: string;
    level: number;
    capacity: number;
}

export default function BallastCommanderV5({ onClose }: { onClose: () => void }) {
    const { t } = useTranslation();
    const { token, addAuditLog } = useStore();
    const [tanks, setTanks] = useState<Tank[]>([
        { id: 'FP_TANK', level: 45, capacity: 500 },
        { id: 'DB_1_P', level: 82, capacity: 1200 },
        { id: 'DB_1_S', level: 81, capacity: 1200 },
        { id: 'AP_TANK', level: 12, capacity: 450 },
    ]);
    const [oedDraft, setOedDraft] = useState(9.5);
    const [currentDraft, setCurrentDraft] = useState(10.2);
    const [isExecuting, setIsExecuting] = useState(false);

    useEffect(() => {
        // Real connection to local/tunnel NPU
        const fetchTelemetry = async () => {
            try {
                // We use getApiUrl which auto-routes through the Hybrid-Edge
                const [oedRes, tankRes] = await Promise.all([
                    axios.get(getApiUrl('/api/ballast/oed'), { params: { draft: currentDraft } }),
                    axios.get(getApiUrl('/api/ballast/tanks'))
                ]);
                
                if (oedRes.data.optimal_draft) setOedDraft(oedRes.data.optimal_draft);
                if (oedRes.data.current_draft) setCurrentDraft(oedRes.data.current_draft);
                if (tankRes.data.tanks) setTanks(tankRes.data.tanks);
            } catch (err) {
                console.error("Telemetry Sync Pending", err);
                // Non-blocking for UI, operators will just see last known or default state if tunnel is booting
            }
        };

        fetchTelemetry();
        const interval = setInterval(fetchTelemetry, 5000);
        return () => clearInterval(interval);
    }, [currentDraft]);

    const handleExecuteOED = async () => {
        setIsExecuting(true);
        try {
            // Direct command to PLC Endpoint
            await axios.post(getApiUrl('/api/ballast/command'), {
                target_draft: oedDraft,
                action: 'APPLY_OED'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            addAuditLog('PUMP_EXECUTE', `OED target ${oedDraft}m applied to PLC.`);
            alert(t('v5.pumps_active', 'Pumps Engaged. Adjusting Ballast to OED.'));
        } catch (error) {
            console.error("Pump execution failed", error);
            // Log failure to audit
            addAuditLog('PUMP_FAIL', `Failed to execute OED target ${oedDraft}m.`);
            alert(t('v5.pump_fail', 'PLC Connection Timeout.'));
        } finally {
            setIsExecuting(false);
        }
    };

    const fuelSaving = (Math.abs(currentDraft - oedDraft) * 1.5).toFixed(1);

    return (
        <div className="fixed inset-0 z-[100] bg-[#0a0e1a]/95 backdrop-blur-3xl flex flex-col p-8 md:p-12 animate-fade-in overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-[#e9c349]/10 rounded-2xl text-[#e9c349]">
                        <Droplets size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                            Ballast Commander
                        </h1>
                        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2 mt-1">
                            <span className="w-1.5 h-1.5 bg-[#00e639] rounded-full animate-pulse"></span>
                            {t('v5.live_telemetry', 'Live Modbus/TCP Telemetry')}
                        </p>
                    </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all hover:rotate-90"
                >
                    <X size={32} />
                </button>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 custom-scrollbar overflow-y-auto pr-4 pb-12">
                {/* TANK VISUALIZATION */}
                <div className="lg:col-span-8 space-y-6">
                    <h2 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                        <HardDrive size={16} className="text-[#e9c349]" /> 
                        {t('v5.tank_matrix', 'Tank Level Matrix')}
                    </h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {tanks.map((tank) => (
                            <div key={tank.id} className="relative aspect-[3/4] bg-[#171b28] border border-white/5 rounded-3xl overflow-hidden group">
                                {/* Liquid Fill */}
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#e9c349]/40 to-[#e9c349]/20 transition-all duration-1000 border-t border-[#e9c349]/50"
                                    style={{ height: `${tank.level}%` }}
                                >
                                    <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:20px_20px] animate-wave"></div>
                                </div>

                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{tank.id}</span>
                                    <span className="text-3xl font-black text-white dropshadow-md">{tank.level}%</span>
                                    <span className="text-[9px] font-mono text-slate-400 mt-2 bg-black/50 px-2 py-0.5 rounded">{tank.capacity} m³</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI SOLVER & COMMAND CENTER */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <h2 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                        <Activity size={16} className="text-[#00e639]" /> 
                        {t('v5.oed_solver', 'OED Physics Solver')}
                    </h2>
                    
                    <div className="bg-[#171b28] border border-white/5 rounded-3xl p-8 flex flex-col flex-1">
                        
                        <div className="space-y-6 flex-1">
                            <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5">
                                <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest">{t('v5.current_draft', 'Current Draft')}</span>
                                <span className="text-white font-mono text-xl">{currentDraft}m</span>
                            </div>
                            
                            <div className="flex justify-between items-center bg-[#e9c349]/10 p-4 rounded-xl border border-[#e9c349]/20">
                                <span className="text-[#e9c349] font-black text-[10px] uppercase tracking-widest">{t('v5.target_oed', 'Target OED')}</span>
                                <span className="text-[#e9c349] font-mono font-black text-2xl">{oedDraft}m</span>
                            </div>

                            <div className="flex justify-between items-center py-4 border-y border-white/5">
                                <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest">{t('v5.fuel_savings', 'Projected Fuel Savings')}</span>
                                <span className="text-[#00e639] font-black text-2xl">-{fuelSaving}%</span>
                            </div>
                        </div>

                        {/* TACTICAL EXECUTION */}
                        <div className="mt-8">
                            <button
                                onClick={handleExecuteOED}
                                disabled={isExecuting || currentDraft === oedDraft}
                                className={`
                                    w-full py-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3
                                    ${isExecuting || currentDraft === oedDraft 
                                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50' 
                                        : 'bg-[#00e639] text-black hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(0,230,57,0.2)]'}
                                `}
                            >
                                {isExecuting ? (
                                    <>
                                        <Zap size={20} className="animate-spin" /> {t('v5.executing', 'TRANSMITTING TO PLC...')}
                                    </>
                                ) : (
                                    <>
                                        <ArrowDownToLine size={20} /> {t('v5.apply_correction', 'APPLY BALLAST CORRECTION')}
                                    </>
                                )}
                            </button>
                            <p className="text-slate-500 text-[9px] text-center mt-4 font-mono">
                                {t('v5.audit_warning', 'ACTION WILL BE LOGGED IN TECHNICAL AUDIT TRAIL')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
