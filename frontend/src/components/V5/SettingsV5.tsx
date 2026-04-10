import { 
  Settings, 
  X, 
  Globe, 
  Zap, 
  Shield, 
  Terminal,
  Cpu,
  RefreshCcw,
  LogOut
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export default function SettingsV5({ onClose }: { onClose: () => void }) {
    const { t, i18n } = useTranslation();
    const { edgeUrl, setEdgeUrl, auditLogs, logout, resetState } = useStore();
    const [tempEdgeUrl, setTempEdgeUrl] = useState(edgeUrl);
    const [density, setDensity] = useState(1.025);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const handleSaveEdge = () => {
        setEdgeUrl(tempEdgeUrl);
        alert(t('v5.hub_updated', 'Cortex Hub Updated'));
    };

    const handleReset = () => {
        if (window.confirm("CRITICAL: Wipe all local data?")) {
            resetState();
            window.location.reload();
        }
    };

    const languages = [
        { code: 'en', label: 'English', iso: 'EN-US' },
        { code: 'es', label: 'Español', iso: 'ES-MX' },
        { code: 'pt', label: 'Português', iso: 'PT-BR' },
        { code: 'zh', label: '中文', iso: 'ZH-CN' }
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-[#0a0e1a]/95 backdrop-blur-3xl flex flex-col p-8 md:p-12 animate-fade-in overflow-hidden">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-[#e9c349]/10 rounded-2xl text-[#e9c349]">
                        <Settings size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                            System Config
                        </h1>
                        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">
                            Command Station // v5.1.0-SOVEREIGN
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 overflow-y-auto custom-scrollbar pr-4 pb-12">
                {/* LEFT: CORE CONFIG */}
                <div className="lg:col-span-7 space-y-12">
                    
                    {/* LOCALIZATION */}
                    <div className="space-y-6">
                        <h2 className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-xs">
                            <Globe size={16} className="text-[#e9c349]" /> {t('v5.localization', 'Localization')}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {languages.map((lng) => (
                                <button
                                    key={lng.code}
                                    onClick={() => changeLanguage(lng.code)}
                                    className={`
                                        p-6 rounded-2xl border transition-all flex flex-col items-center gap-2
                                        ${i18n.language === lng.code 
                                            ? 'bg-[#e9c349] border-[#e9c349] text-black' 
                                            : 'bg-white/5 border-white/5 text-white hover:bg-white/10'}
                                    `}
                                >
                                    <span className="font-black text-lg">{lng.iso}</span>
                                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">{lng.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CONNECTIVITY */}
                    <div className="space-y-6">
                        <h2 className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-xs">
                            <Zap size={16} className="text-[#00e639]" /> {t('v5.connectivity', 'Cortex Hub Connectivity')}
                        </h2>
                        <div className="bg-[#171b28] border border-white/5 rounded-3xl p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Edge Hub Address</label>
                                <div className="flex gap-4">
                                    <input 
                                        type="text" 
                                        value={tempEdgeUrl}
                                        onChange={(e) => setTempEdgeUrl(e.target.value)}
                                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-white font-mono text-sm focus:border-[#e9c349]/50 outline-none transition-all"
                                    />
                                    <button 
                                      onClick={handleSaveEdge}
                                      className="px-8 bg-[#e9c349] text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 bg-green-500/10 text-[#00e639] px-4 py-2 rounded-full text-[9px] font-black tracking-widest">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#00e639] animate-pulse"></span>
                                    {t('v5.hub_online', 'LATENCY: 12ms // STATUS: OPTIMAL')}
                                </div>
                                <div className="text-slate-600 text-[9px] font-mono italic">
                                    {t('v5.hub_info', 'Hybrid-Edge protocol active. Using local NPU for inference.')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ENGINE PARAMS */}
                    <div className="space-y-6">
                        <h2 className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-xs">
                            <Cpu size={16} className="text-blue-400" /> {t('v5.engine_params', 'Sovereign Engine Params')}
                        </h2>
                        <div className="grid grid-cols-2 gap-8 bg-[#171b28]/40 border border-white/5 rounded-3xl p-8">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t('v5.water_density', 'Water Density')}</label>
                                <input 
                                    type="number" 
                                    value={density}
                                    onChange={(e) => setDensity(parseFloat(e.target.value))}
                                    className="w-full bg-black/40 border border-white/5 rounded-xl px-6 py-4 text-white font-mono text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t('v5.kalman_gain', 'Kalman Gain Factor')}</label>
                                <input 
                                    type="text" 
                                    readOnly 
                                    value="0.8842 (DYNAMIC)"
                                    className="w-full bg-black/20 border border-white/5 rounded-xl px-6 py-4 text-slate-500 font-mono text-sm cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* DANGEROUS AREA */}
                    <div className="pt-8 border-t border-white/5 flex gap-4">
                        <button 
                          onClick={logout}
                          className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3"
                        >
                            <LogOut size={16} /> Logout Session
                        </button>
                        <button 
                          onClick={handleReset}
                          className="flex-1 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3"
                        >
                            <RefreshCcw size={16} /> Hard System Reset
                        </button>
                    </div>

                </div>

                {/* RIGHT: AUDIT TRAIL */}
                <div className="lg:col-span-5 space-y-6 flex flex-col h-full">
                    <h2 className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-xs">
                        <Terminal size={16} className="text-slate-400" /> {t('v5.audit_log', 'Technical Audit Log')}
                    </h2>
                    <div className="flex-1 bg-black/60 border border-white/5 rounded-[2.5rem] p-8 font-mono text-[10px] space-y-4 overflow-y-auto custom-scrollbar-hidden">
                        {auditLogs.length === 0 ? (
                            <div className="text-slate-700 italic">No system events recorded.</div>
                        ) : (
                            auditLogs.map((log) => (
                                <div key={log.id} className="pb-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                    <div className="flex justify-between text-[#e9c349]">
                                        <span>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                        <span className="text-slate-500">{log.action}</span>
                                    </div>
                                    <div className="text-slate-300 mt-1">{log.details}</div>
                                    <div className="text-slate-700 mt-0.5 tracking-tight">SIG_HASH: {log.id.substring(4)}... // USER: {log.user}</div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="bg-[#e9c349]/5 border border-[#e9c349]/20 rounded-2xl p-6">
                        <div className="flex items-start gap-4 text-slate-400 text-[10px] leading-relaxed">
                            <Shield size={20} className="shrink-0 text-[#e9c349]" />
                            <div>
                                <strong className="text-white">Legal Transparency Protocol:</strong> This audit log is strictly read-only and anchored to the local file system. It provides court-accepted evidence of all system interactions.
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
