import React, { useState } from 'react';
import { Waves, Cpu, ShieldCheck, ArrowRight, Zap, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const ProtocolExplainer: React.FC = () => {
    const { t } = useTranslation();
    const [activeLayer, setActiveLayer] = useState<'wca' | 'nhnf' | 'iso'>('nhnf');

    const layers = {
        wca: {
            title: t('landing.term_wca_title'),
            desc: t('landing.term_wca_desc'),
            icon: <Waves className="text-blue-400" />,
            stats: ["-98% Noise", "60fps Sync"]
        },
        nhnf: {
            title: t('landing.term_neural_title'),
            desc: t('landing.term_neural_desc'),
            icon: <Cpu className="text-yellow-400" />,
            stats: ["Volumetric Accuracy", "Depth Agnostic"]
        },
        iso: {
            title: t('landing.term_iso_title'),
            desc: t('landing.term_iso_desc'),
            icon: <ShieldCheck className="text-emerald-400" />,
            stats: ["Notarized Hash", "Standard v2.1"]
        }
    };

    return (
        <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid lg:grid-cols-2">
                {/* Visual Simulation Column */}
                <div className="relative h-[400px] lg:h-auto bg-slate-900 overflow-hidden flex items-center justify-center p-12">
                    {/* Grid Background */}
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(#fde047 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                    {/* Simulated Hull Wireframe */}
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                        <div className="w-64 h-32 bg-slate-800 border-2 border-yellow-400/30 rounded-t-full relative animate-pulse">
                            {/* Waterline Line */}
                            <div className="absolute bottom-1/3 left-[-20%] right-[-20%] h-0.5 bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.5)] flex items-center justify-between px-4">
                                <span className="text-[8px] font-mono text-blue-400 -mt-4 uppercase tracking-tighter">True Mean Waterline</span>
                                <div className="h-4 w-4 bg-yellow-400 rounded-full flex items-center justify-center animate-ping opacity-20" />
                            </div>

                            {/* Neural Points */}
                            <div className="absolute inset-0 flex items-center justify-center gap-4 flex-wrap p-4">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className={`w-1 h-1 rounded-full ${activeLayer === 'nhnf' ? 'bg-yellow-400' : 'bg-slate-600'} transition-colors duration-700`} />
                                ))}
                            </div>
                        </div>

                        {/* Scanner Beam */}
                        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent animate-[scan_3s_ease-in-out_infinite]" />
                    </div>

                    {/* HUD Overlay */}
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                        <div className="flex items-center gap-2 bg-black/50 backdrop-blur px-3 py-1.5 rounded-md border border-white/10">
                            <Target size={12} className="text-yellow-400" />
                            <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">{t('landing.term_inference')}: 4.2ms</span>
                        </div>
                        <div className="flex items-center gap-2 bg-black/50 backdrop-blur px-3 py-1.5 rounded-md border border-white/10">
                            <Zap size={12} className="text-blue-400" />
                            <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">{t('landing.term_confidence')}: 99.98%</span>
                        </div>
                    </div>
                </div>

                {/* Content Column */}
                <div className="p-8 lg:p-12 space-y-10">
                    <div className="space-y-4">
                        <h3 className="text-4xl font-black tracking-tighter text-white uppercase">
                            {t('landing.term_neural_std_1')} <span className="text-yellow-400">{t('landing.term_neural_std_2')}</span>
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                            {t('landing.term_neural_reconstruct')}
                        </p>
                    </div>

                    {/* Layers Switcher */}
                    <div className="grid gap-4">
                        {(Object.keys(layers) as Array<keyof typeof layers>).map((key) => (
                            <button
                                key={key}
                                onClick={() => setActiveLayer(key)}
                                className={`flex items-start gap-4 p-5 rounded-2xl border transition-all text-left ${activeLayer === key
                                    ? 'bg-yellow-400/5 border-yellow-400/30 ring-1 ring-yellow-400/20'
                                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                                    }`}
                            >
                                <div className={`p-3 rounded-xl bg-slate-900 border border-slate-700 ${activeLayer === key ? 'text-yellow-400' : 'text-slate-500'}`}>
                                    {layers[key].icon}
                                </div>
                                <div className="space-y-1">
                                    <h4 className={`text-sm font-black uppercase tracking-widest ${activeLayer === key ? 'text-white' : 'text-slate-400'}`}>
                                        {layers[key].title}
                                    </h4>
                                    <p className="text-xs text-slate-500 font-medium line-clamp-2">
                                        {layers[key].desc}
                                    </p>
                                    {activeLayer === key && (
                                        <div className="flex gap-4 pt-2 animate-in fade-in slide-in-from-left-2 transition-all">
                                            {layers[key].stats.map((stat, i) => (
                                                <span key={i} className="text-[10px] font-mono font-bold text-yellow-400/80 px-2 py-0.5 rounded bg-yellow-400/10 border border-yellow-400/20">
                                                    {stat}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400 hover:text-yellow-300 transition-colors group">
                        View Compliance Framework
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes scan {
                    0%, 100% { top: 10%; opacity: 0; }
                    50% { top: 90%; opacity: 1; }
                }
            `}</style>
        </div>
    );
};
