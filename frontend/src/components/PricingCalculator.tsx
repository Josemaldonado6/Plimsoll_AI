import { useState, useEffect } from 'react';
import { Calculator, TrendingDown, Ship, ShieldCheck, Clock, ArrowRight, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { IndustrialTheme } from '../utils/IndustrialTheme';
import { LeadCaptureModal } from './LeadCaptureModal';
import { calculateROI } from '../utils/ROICalculator';

const theme = IndustrialTheme.dark;

export default function PricingCalculator() {
    const { t } = useTranslation();
    const [dwt, setDwt] = useState(120000); // Deadweight Tonnage
    const [tier, setTier] = useState<'standard' | 'enterprise'>('enterprise');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [quote, setQuote] = useState({
        perSurvey: 0,
        annual: 0,
        savings: 0,
        timeSaved: 0
    });

    useEffect(() => {
        const result = calculateROI(dwt, tier);
        setQuote(result);
    }, [dwt, tier]);

    return (
        <div className={`relative overflow-hidden rounded-3xl border-2 ${theme.border} bg-slate-950/50 p-1 md:p-8 backdrop-blur-3xl lg:p-12 shadow-2xl`}>
            {/* Lead Capture Modal Integration */}
            <LeadCaptureModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                simData={{ dwt, savings: quote.savings }}
            />

            {/* Ambient Background Glow */}
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-yellow-500/10 blur-[120px]" />

            <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-16">
                {/* Tactical Input Column */}
                <div className="flex flex-col justify-between space-y-10">
                    <div>
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">
                            <ShieldCheck size={12} />
                            ROI SIMULATOR
                        </div>
                        <h3 className="text-3xl font-black tracking-tight text-white lg:text-4xl">
                            Simulate <span className="text-yellow-400">Efficiency</span>
                        </h3>
                        <p className="mt-4 text-sm font-medium leading-relaxed text-slate-400">
                            {t('landing.simulator_desc')}
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-8">
                        <Zap size={12} />
                        Efficiency Gains
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-end justify-between">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500">{t('landing.sim_fleet_dwt')}</label>
                            <span className="font-mono text-2xl font-black text-yellow-400">{dwt.toLocaleString()}<span className="ml-1 text-xs opacity-50">{t('landing.sim_mt')}</span></span>
                        </div>
                        <input
                            type="range"
                            min="20000"
                            max="350000"
                            step="10000"
                            value={dwt}
                            onChange={(e) => setDwt(parseInt(e.target.value))}
                            className="h-1.5 w-full appearance-none rounded-full bg-slate-800 accent-yellow-400 transition-all hover:bg-slate-700"
                        />
                        <div className="flex justify-between font-mono text-[10px] uppercase font-bold text-slate-600">
                            <span>{t('landing.sim_handymax')}</span>
                            <span>{t('landing.sim_vloc')}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-900/50 p-1.5 border border-white/5">
                        <button
                            onClick={() => setTier('standard')}
                            className={`flex flex-col items-center justify-center rounded-xl py-4 transition-all ${tier === 'standard' ? 'bg-yellow-400 text-slate-950 shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest">{t('landing.price_pay')}</span>
                            <span className="text-[12px] font-bold opacity-60 italic">{t('landing.price_pay_desc').split('.')[0]}</span>
                        </button>
                        <button
                            onClick={() => setTier('enterprise')}
                            className={`flex flex-col items-center justify-center rounded-xl py-4 transition-all ${tier === 'enterprise' ? 'bg-yellow-400 text-slate-950 shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest">{t('landing.price_ent')}</span>
                            <span className="text-[12px] font-bold opacity-60 italic">{t('landing.price_ent_desc').split('.')[0]}</span>
                        </button>
                    </div>
                </div>

                {/* Financial Output Column */}
                <div className="relative rounded-2xl border border-white/10 bg-white/5 p-8 lg:p-10">
                    <div className="absolute top-8 right-8 text-yellow-500/20">
                        <Ship size={120} strokeWidth={1} />
                    </div>

                    <div className="relative space-y-12">
                        <div className="grid gap-10">
                            <div>
                                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{t('landing.sim_unit_cost')}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black tracking-tighter text-white">${quote.perSurvey.toLocaleString()}</span>
                                    <span className="text-xs font-bold text-slate-500 uppercase">/ {t('landing.sim_deployment')}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 border-y border-white/10 py-8">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-yellow-400/80">
                                        <Clock size={12} />
                                        <p className="text-[10px] font-black uppercase tracking-widest">{t('landing.sim_port_speed')}</p>
                                    </div>
                                    <p className="text-xl font-black text-white">{quote.timeSaved}h <span className="text-[10px] opacity-40 italic">{t('landing.sim_saved_yr')}</span></p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-green-400/80">
                                        <Calculator size={12} />
                                        <p className="text-[10px] font-black uppercase tracking-widest">{t('landing.sim_acc_alpha')}</p>
                                    </div>
                                    <p className="text-xl font-black text-white">99.9% <span className="text-[10px] opacity-40 italic">{t('landing.sim_reliability')}</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-yellow-400 p-6 shadow-2xl shadow-yellow-500/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-slate-950/10 p-2">
                                        <TrendingDown className="text-slate-950" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-950/60">{t('landing.sim_opex_reduction')}</p>
                                        <p className="text-3xl font-black text-slate-950">${quote.savings.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="hidden h-12 w-px bg-slate-950/10 sm:block" />
                                <div className="hidden text-right sm:block">
                                    <p className="text-[10px] font-black uppercase text-slate-950/60 leading-tight">{t('landing.sim_proj_roi')}</p>
                                    <p className="text-xl font-black text-slate-950">12x</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="group flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/5 py-5 text-xs font-black uppercase tracking-[0.3em] text-white transition-all hover:bg-white/10 hover:border-yellow-400 hover:text-yellow-400"
                        >
                            Generate Technical Audit
                            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
