import React, { useState, useEffect } from 'react';
import { Zap, ShieldAlert, CheckCircle2, Droplets, HardDrive } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { getApiUrl } from '../store/useStore';

interface Tank {
    id: string;
    level: number; // 0 to 100%
    capacity: number; // m3
}

export const BallastMonitor: React.FC = () => {
    const { t } = useTranslation();
    const [tanks, setTanks] = useState<Tank[]>([
        { id: 'FP_TANK', level: 45, capacity: 500 },
        { id: 'DB_1_P', level: 82, capacity: 1200 },
        { id: 'DB_1_S', level: 81, capacity: 1200 },
        { id: 'AP_TANK', level: 12, capacity: 450 },
    ]);
    const [oedDraft, setOedDraft] = useState(9.5);
    const [currentDraft, setCurrentDraft] = useState(10.2);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const fetchOED = async () => {
            try {
                const res = await axios.get(getApiUrl('/api/ballast/oed'), {
                    params: { draft: 10.2, speed: 14.5, sea_state: 3 }
                });
                setOedDraft(res.data.optimal_draft);
                setCurrentDraft(res.data.current_draft);
            } catch (err) {
                console.error("PLC OED Sync Failed", err);
            }
        };

        const fetchTanks = async () => {
            try {
                const res = await axios.get(getApiUrl('/api/ballast/tanks'));
                if (res.data.tanks) setTanks(res.data.tanks);
            } catch (err) {
                console.error("PLC Tank Sync Failed", err);
            }
        };

        fetchOED();
        const interval = setInterval(fetchTanks, 5000);
        return () => clearInterval(interval);
    }, []);

    const fuelSaving = (Math.abs(currentDraft - oedDraft) * 1.5).toFixed(1);

    return (
        <div className="bg-[#020617] border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row gap-12">

                {/* Visual Tank Grid */}
                <div className="flex-1 space-y-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                                {t('dashboard.ballast_title')} <span className="text-blue-400">{t('dashboard.ballast_telemetry')}</span>
                            </h3>
                            <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-1">
                                {t('dashboard.ballast_subtitle')}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                            <Droplets size={12} />
                            {t('dashboard.ballast_sync')}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {tanks.map((tank) => (
                            <div key={tank.id} className="relative aspect-[3/4] bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden group">
                                {/* Water Level */}
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-1000"
                                    style={{ height: `${tank.level}%` }}
                                >
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 animate-pulse" />
                                </div>

                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10 bg-slate-950/20 group-hover:bg-transparent transition-colors">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{tank.id}</span>
                                    <span className="text-xl font-black text-white">{tank.level}%</span>
                                    <span className="text-[8px] font-mono text-slate-500 mt-2">{tank.capacity} m³</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Optimization Column */}
                <div className="w-full lg:w-80 space-y-6">
                    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                        <div className="flex items-center gap-3 text-yellow-400">
                            <Zap size={20} />
                            <span className="text-sm font-black uppercase tracking-widest">{t('dashboard.ballast_oed_solver')}</span>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-bold">{t('dashboard.ballast_current_draft')}</span>
                                <span className="text-white font-black">{currentDraft}m</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-yellow-400/70 font-bold uppercase">{t('dashboard.ballast_optimal_draft')}</span>
                                <span className="text-yellow-400 font-black">{oedDraft}m</span>
                            </div>

                            <div className="h-px bg-slate-800" />

                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500 font-bold">{t('dashboard.ballast_projected_saving')}</span>
                                <span className="text-emerald-400 font-black text-xl">-{fuelSaving}%</span>
                            </div>
                        </div>
                    </div>

                    <div className={`p-6 rounded-2xl border transition-all ${isAuthorized ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/5 border-red-500/20'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            {isAuthorized ? <CheckCircle2 className="text-emerald-400" size={20} /> : <ShieldAlert className="text-red-400" size={20} />}
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isAuthorized ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isAuthorized ? t('dashboard.ballast_authorized') : t('dashboard.ballast_interlock')}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed mb-6 font-medium">
                            {isAuthorized
                                ? t('dashboard.ballast_authorized_desc')
                                : t('dashboard.ballast_interlock_desc')}
                        </p>

                        <button
                            onClick={() => setIsAuthorized(!isAuthorized)}
                            className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isAuthorized
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95'
                                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:bg-slate-700'
                                }`}
                        >
                            {isAuthorized ? t('dashboard.ballast_commit') : t('dashboard.ballast_authorize')}
                        </button>
                    </div>

                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800">
                        <HardDrive size={16} className="text-slate-500" />
                        <span className="text-[10px] font-mono text-slate-600 tracking-tighter">PROTO: MODBUS/TCP-502</span>
                    </div>
                </div>

            </div>
        </div>
    );
};
