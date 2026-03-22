/*
 * -----------------------------------------------------------------------------
 * PROYECTO: PLIMSOLL AI - MARITIME AUDIT SYSTEM
 * ARCHIVO: LandingPage.tsx
 *
 * DERECHOS DE AUTOR / COPYRIGHT:
 * (c) 2026 José de Jesús Maldonado Ordaz. Todos los derechos reservados.
 *
 * PROPIEDAD INTELECTUAL:
 * Este código fuente, algoritmos, lógica de negocio y diseño de interfaz
 * son propiedad exclusiva de su autor. Queda prohibida su reproducción,
 * distribución o uso sin una licencia otorgada por escrito.
 *
 * REGISTRO:
 * Protegido bajo la Ley Federal del Derecho de Autor (México) y
 * Tratados Internacionales de la OMPI.
 *
 * CONFIDENCIALIDAD:
 * Este archivo contiene SECRETOS INDUSTRIALES. Su acceso no autorizado
 * constituye un delito federal.
 * -----------------------------------------------------------------------------
 */
import { useState } from 'react';
import { ChevronRight, Play, Zap, Globe, ArrowRight, Check, Ship, ShieldCheck, BarChart3, Lock, Star, Waves, Cpu, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { useTranslation } from 'react-i18next';
import PricingCalculator from './PricingCalculator';
import GlobalParticles from './GlobalParticles';
import { ProtocolExplainer } from './ProtocolExplainer';
import { ComplianceFramework } from './ComplianceFramework';
import { BallastMonitor } from './BallastMonitor';
import { ENTERPRISE_PLANS } from '../services/StripeCommercial';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface LandingPageProps {
    onEnterApp: () => void;
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
    const { t, i18n } = useTranslation();
    const [showVideoModal, setShowVideoModal] = useState(false);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    }

    const videoSources: Record<string, string> = {
        'en': '/videos/promo_en.mp4',
        'es': '/videos/promo_es.mp4',
        'pt': '/videos/promo_pt.mp4',
        'zh': '/videos/promo_zh.mp4',
    };

    // Fallback to English if the exact language isn't found
    const currentLang = i18n.language.split('-')[0];
    const promoSrc = videoSources[currentLang] || videoSources['en'];

    return (
        <div className={`min-h-screen bg-[#020617] text-white font-sans selection:bg-yellow-400 selection:text-black relative overflow-x-hidden`}>
            <GlobalParticles />

            {/* STAKEHOLDER HEADER */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-yellow-400 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                            <img src="/logo.png" alt="Plimsoll Logo" className="w-10 h-10 object-contain relative z-10 filter brightness-200" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-xl tracking-tighter text-white">PLIMSOLL <span className="text-yellow-400">AI</span></span>
                            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500">{t('nav.tagline')}</span>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <a href="#simulator" className="hover:text-yellow-400 transition-colors">{t('nav.pricing')}</a>
                        <a href="#protocol" className="hover:text-yellow-400 transition-colors">{t('nav.methodology')}</a>
                        <a href="#compliance" className="hover:text-yellow-400 transition-colors">{t('nav.sys_config')}</a>

                        <div className="h-4 w-px bg-white/10" />

                        <div className="flex items-center gap-3">
                            <button onClick={() => changeLanguage('en')} className={cn("transition-colors", i18n.language.startsWith('en') ? "text-yellow-400" : "hover:text-white")}>EN</button>
                            <button onClick={() => changeLanguage('es')} className={cn("transition-colors", i18n.language.startsWith('es') ? "text-yellow-400" : "hover:text-white")}>ES</button>
                            <button onClick={() => changeLanguage('pt')} className={cn("transition-colors", i18n.language.startsWith('pt') ? "text-yellow-400" : "hover:text-white")}>PT</button>
                            <button onClick={() => changeLanguage('zh')} className={cn("transition-colors", i18n.language.startsWith('zh') ? "text-yellow-400" : "hover:text-white")}>ZH</button>
                        </div>

                        <button
                            onClick={onEnterApp}
                            className="bg-yellow-400 text-black px-6 py-2.5 rounded-sm font-black hover:bg-yellow-300 transition-all shadow-[0_0_30px_rgba(253,224,47,0.2)] active:scale-95"
                        >
                            {t('nav.dashboard')}
                        </button>
                    </div>
                </div>
            </nav>

            {/* HERO: THE TRUTH OF THE WATERLINE */}
            <section className="relative pt-40 pb-32 md:pt-64 md:pb-48 min-h-[90vh] flex items-center">
                <div className="absolute inset-0 z-0 overflow-hidden">
                    {/* Background Video */}
                    <div className="absolute inset-0 z-0">
                        <video
                            src={promoSrc}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover opacity-40 scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 via-[#020617]/40 to-[#020617]" />
                        <div className="absolute inset-0 bg-yellow-400/5 mix-blend-overlay" />
                    </div>

                    <div className="absolute inset-0 bg-[url('/plimsoll_hero_scan.png')] bg-cover bg-center opacity-10 mix-blend-luminosity"></div>

                    {/* Industrial Grid Overlay */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400 mb-10">
                            <Lock size={12} strokeWidth={3} />
                            {t('landing.hero_badge')}
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
                            {t('landing.stakeholder_hero_title_1')} <span className="text-yellow-400">{t('landing.stakeholder_hero_title_2').split(' ')[0]}</span> {t('landing.stakeholder_hero_title_2').split(' ').slice(1).join(' ')}
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mb-6 font-medium leading-relaxed">
                            {t('landing.stakeholder_hero_subtitle')}
                        </p>

                        <div className="flex items-center gap-4 mb-12 p-4 bg-yellow-400/5 border border-yellow-400/20 rounded-xl w-fit">
                            <div className="bg-yellow-400 p-2 rounded-lg">
                                <Zap size={20} className="text-black fill-black" />
                            </div>
                            <p className="text-yellow-400 font-black text-sm uppercase tracking-widest animate-pulse">
                                {t('landing.hero_sub_2')}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6 mb-24">
                            <button
                                onClick={onEnterApp}
                                className="h-16 px-10 rounded-sm bg-yellow-400 text-black font-black text-sm uppercase tracking-[0.2em] transform hover:scale-105 transition-all shadow-2xl flex items-center gap-3 w-full sm:w-auto justify-center"
                            >
                                {t('nav.radar_survey')}
                                <ChevronRight size={18} strokeWidth={3} />
                            </button>
                            <button
                                onClick={() => setShowVideoModal(true)}
                                className="h-16 px-10 rounded-sm border-2 border-white/10 text-white font-black text-sm uppercase tracking-[0.2em] hover:bg-white/5 transition-all flex items-center gap-3 w-full sm:w-auto justify-center"
                            >
                                <Play size={16} fill="white" />
                                {t('landing.cta_demo')}
                            </button>
                        </div>

                        {/* STRATEGIC ADVANTAGES GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-32">
                            {[
                                {
                                    icon: <Zap className="w-6 h-6 text-yellow-400" />,
                                    title: t('landing.advantage_90s_title'),
                                    desc: t('landing.advantage_90s_desc')
                                },
                                {
                                    icon: <Waves className="w-6 h-6 text-yellow-400" />,
                                    title: t('landing.advantage_anchorage_title'),
                                    desc: t('landing.advantage_anchorage_desc')
                                },
                                {
                                    icon: <Cpu className="w-6 h-6 text-yellow-400" />,
                                    title: t('landing.advantage_plc_title'),
                                    desc: t('landing.advantage_plc_desc')
                                }
                            ].map((adv, idx) => (
                                <div key={idx} className="group p-8 bg-slate-900/40 border border-white/5 rounded-2xl hover:border-yellow-400/30 transition-all duration-500">
                                    <div className="mb-6 bg-yellow-400/10 w-fit p-4 rounded-xl group-hover:scale-110 group-hover:bg-yellow-400/20 transition-all duration-500">
                                        {adv.icon}
                                    </div>
                                    <h3 className="text-xl font-black mb-4 uppercase tracking-tighter italic text-white group-hover:text-yellow-400 transition-colors">
                                        {adv.title}
                                    </h3>
                                    <p className="text-slate-400 font-medium leading-relaxed text-sm">
                                        {adv.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* TRUST: PORT AUTHORITY ACCREDITATION */}
            <div className="border-y border-white/5 bg-slate-900/40 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 max-w-[150px] leading-tight mb-8 md:mb-0">{t('landing.trust_accreditation')}</p>
                        <div className="flex flex-wrap justify-center gap-16 md:gap-24">
                            <span className="text-2xl font-black tracking-tighter cursor-help transition-all hover:text-yellow-400" title={t('landing.cert_iso')}>ISO 17020</span>
                            <span className="text-2xl font-black tracking-tighter cursor-help transition-all hover:text-yellow-400" title={t('landing.cert_bimco')}>BIMCO</span>
                            <span className="text-2xl font-black tracking-tighter cursor-help transition-all hover:text-yellow-400" title={t('landing.cert_imo')}>IMO v2.1</span>
                            <span className="text-2xl font-black tracking-tighter cursor-help transition-all hover:text-yellow-400" title={t('landing.cert_hse')}>HSE-SAFE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* VALUE PROP: THE CFO MODULE */}
            <section className="py-32 bg-gradient-to-b from-[#020617] to-slate-950" id="protocol">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <div className="space-y-12">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 uppercase">
                                    {t('landing.cfo_title').split(' ').slice(0, -1).join(' ')} <span className="text-red-500">{t('landing.cfo_title').split(' ').slice(-1)}</span>
                                </h1>
                                <p className="text-lg text-slate-400 font-medium">
                                    {t('landing.cfo_desc')}
                                </p>
                            </div>

                            <div className="grid gap-4">
                                <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-yellow-400/30 transition-all group">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-3 bg-red-500/10 rounded-xl text-red-500 group-hover:bg-red-500/20 transition-all">
                                            <Zap size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-sm uppercase tracking-widest">{t('landing.legacy_title')}</h3>
                                            <p className="text-xs text-slate-500">{t('landing.legacy_subtitle')}</p>
                                        </div>
                                    </div>
                                    <ul className="space-y-3 text-sm font-bold text-slate-400">
                                        <li className="flex items-center gap-3">× {t('landing.legacy_1')}</li>
                                        <li className="flex items-center gap-3">× {t('landing.legacy_2')}</li>
                                        <li className="flex items-center gap-3 text-red-400">× {t('landing.legacy_3')}</li>
                                    </ul>
                                </div>

                                <div className="p-8 rounded-2xl bg-yellow-400 text-black border border-white/5 transform hover:-translate-y-1 transition-all shadow-2xl">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-3 bg-black/10 rounded-xl">
                                            <ShieldCheck size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-sm uppercase tracking-widest">{t('landing.protocol_title')}</h3>
                                            <p className="text-xs opacity-60">{t('landing.protocol_subtitle')}</p>
                                        </div>
                                    </div>
                                    <ul className="space-y-3 text-sm font-black">
                                        <li className="flex items-center gap-3"><Check size={16} strokeWidth={3} /> {t('landing.protocol_1')}</li>
                                        <li className="flex items-center gap-3"><Check size={16} strokeWidth={3} /> {t('landing.protocol_2')}</li>
                                        <li className="flex items-center gap-3 underline decoration-black/30">✓ {t('landing.protocol_3')}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Visual Asset Section */}
                        <div className="relative group">
                            <div className="absolute -inset-10 bg-yellow-400/10 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative aspect-square rounded-3xl border border-white/10 bg-slate-900 overflow-hidden shadow-2xl">
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                                    <div className="w-48 h-48 mb-8 relative">
                                        <div className="absolute inset-0 border-4 border-yellow-400/20 rounded-full animate-ping" />
                                        <div className="absolute inset-4 border-4 border-yellow-400/40 rounded-full animate-pulse" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <BarChart3 size={64} className="text-yellow-400" />
                                        </div>
                                    </div>
                                    <h4 className="text-2xl font-black mb-4 uppercase tracking-tighter">{t('landing.tech_recon_title')}</h4>
                                    <p className="text-slate-500 text-sm font-medium">{t('landing.tech_recon_desc')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SIMULATOR: ROI FOR STAKEHOLDERS */}
            <section className="py-32 border-t border-white/5" id="simulator">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="mb-24">
                        <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-6">{t('landing.simulator_title_1')} <span className="text-yellow-400 text-stroke-white text-transparent">{t('landing.simulator_title_2')}</span></h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                            {t('landing.simulator_desc')}
                        </p>
                    </div>

                    <PricingCalculator />
                </div>
            </section>

            {/* SUBSCRIPTION TIERS: LATAM STRATEGY */}
            <section className="py-32 bg-slate-950/30 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-4">
                            <Star size={12} fill="currentColor" />
                            {t('enterprise.enterprise_grade', 'Enterprise Grade')}
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4">
                            {t('enterprise.upgrade_title')}
                        </h2>
                        <p className="text-slate-500 font-medium max-w-2xl mx-auto">
                            {t('enterprise.upgrade_desc')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {ENTERPRISE_PLANS.map((plan) => (
                            <div
                                key={plan.id}
                                className={cn(
                                    "relative rounded-[2.5rem] p-8 md:p-10 border transition-all duration-500 overflow-hidden group",
                                    plan.highlight
                                        ? "bg-yellow-400 border-yellow-400 text-black scale-105 shadow-[0_0_50px_rgba(253,224,47,0.15)] z-10"
                                        : "bg-white/5 border-white/10 text-white hover:border-yellow-400/30"
                                )}
                            >
                                {plan.highlight && (
                                    <div className="absolute top-6 right-8 bg-black text-yellow-400 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                        {t('enterprise.most_popular')}
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-2 opacity-60">
                                        {plan.name}
                                    </h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black tracking-tighter">
                                            ${plan.price}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase opacity-60">
                                            /{plan.interval === 'month' ? 'mo' : 'yr'}
                                        </span>
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-10">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className={cn("mt-1 p-0.5 rounded-full", plan.highlight ? "bg-black/10" : "bg-yellow-400/20")}>
                                                <Check size={10} strokeWidth={4} className={plan.highlight ? "text-black" : "text-yellow-400"} />
                                            </div>
                                            <span className="text-xs font-bold leading-tight uppercase tracking-tight">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={onEnterApp}
                                    className={cn(
                                        "w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2",
                                        plan.highlight
                                            ? "bg-black text-yellow-400 hover:bg-slate-900"
                                            : "bg-yellow-400 text-black hover:bg-yellow-300 shadow-xl shadow-yellow-400/10"
                                    )}
                                >
                                    {t('enterprise.deploy_solution')}
                                    <ArrowRight size={14} strokeWidth={3} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
                            Confidential LATAM Regional Pricing // Industrial Grade Compliance
                        </p>
                    </div>
                </div>
            </section>

            {/* ECO-DOMINATION: SMART BALLAST CONTROL */}
            <section className="py-32 bg-slate-950/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-end justify-between mb-20 gap-8">
                        <div className="max-w-2xl text-left">
                            <div className="inline-flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-[0.4em] mb-4">
                                <Zap size={14} /> {t('landing.eco_domination')}
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase">
                                {t('landing.hydrostatic_opt')}
                            </h2>
                        </div>
                        <p className="text-slate-500 font-medium max-w-sm lg:text-right leading-relaxed">
                            {t('landing.ballast_desc', 'Reduce fuel consumption by up to 12% through real-time PLC ballast adjustments based on neural hydrodynamic feedback.')}
                        </p>
                    </div>

                    <BallastMonitor />
                </div>
            </section>

            {/* TECHNICAL AUTHORITY: THE GLOSSARY */}
            <section className="py-32 bg-[#020617] relative" id="compliance">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">{t('landing.tech_glossary_title')}</h2>
                        <p className="text-slate-500 font-medium">{t('landing.tech_glossary_subtitle')}</p>
                    </div>

                    <div className="max-w-5xl mx-auto">
                        <ProtocolExplainer />
                    </div>
                </div>
            </section>

            <ComplianceFramework />

            {/* FINAL CLOSURE: BOOKING SLOTS */}
            <section className="py-40 border-t border-white/5 bg-slate-950 relative overflow-hidden text-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />

                <div className="max-w-4xl mx-auto px-6">
                    <div className="inline-flex items-center gap-2 text-yellow-500 font-bold text-[10px] uppercase tracking-[0.4em] mb-8">
                        <Ship size={14} /> {t('landing.final_cta_slots')}
                    </div>
                    <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-12 uppercase leading-[0.85]">
                        {t('landing.final_cta_title_1')} <br /> <span className="text-transparent" style={{ WebkitTextStroke: '2px rgba(253,224,47,0.4)' }}>{t('landing.final_cta_title_2')}</span>
                    </h2>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                        <button
                            onClick={onEnterApp}
                            className="h-20 px-12 rounded-sm bg-yellow-400 text-black font-black text-lg uppercase tracking-[0.2em] transform hover:scale-110 active:scale-95 transition-all shadow-2xl flex items-center gap-4"
                        >
                            {t('landing.cta_book_demo')}
                            <ArrowRight size={20} strokeWidth={3} />
                        </button>
                        <div className="text-left">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">{t('landing.direct_line')}</p>
                            <p className="text-xl font-black text-white px-1">SUPPORT@PLIMSOLL.AI</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER: INDUSTRIAL ARCHIVE */}
            <footer className="bg-slate-950 pt-32 pb-12 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-20 mb-20">
                    <div className="col-span-2 space-y-8">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="Logo" className="w-8 h-8 filter brightness-200" />
                            <span className="font-black text-2xl tracking-tighter text-white">PLIMSOLL <span className="text-yellow-400 text-stroke-white text-transparent">AI</span></span>
                        </div>
                        <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
                            {t('landing.footer_motto')}
                        </p>
                    </div>
                    <div>
                        <h4 className="font-black text-[10px] uppercase tracking-widest text-white mb-6">{t('landing.footer_tech_title')}</h4>
                        <ul className="space-y-4 text-xs font-bold text-slate-500">
                            <li><a href="#" className="hover:text-yellow-400 transition-colors">{t('landing.footer_tech_1')}</a></li>
                            <li><a href="#" className="hover:text-yellow-400 transition-colors">{t('landing.footer_tech_2')}</a></li>
                            <li><a href="#" className="hover:text-yellow-400 transition-colors">{t('landing.footer_tech_3')}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black text-[10px] uppercase tracking-widest text-white mb-6">{t('landing.footer_comp_title')}</h4>
                        <ul className="space-y-4 text-xs font-bold text-slate-500">
                            <li><a href="#" className="hover:text-yellow-400 transition-colors">{t('landing.footer_comp_1')}</a></li>
                            <li><a href="#" className="hover:text-yellow-400 transition-colors">{t('landing.footer_comp_2')}</a></li>
                            <li><a href="#" className="hover:text-yellow-400 transition-colors">{t('landing.footer_comp_3')}</a></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-700">
                    <p>{t('landing.footer_all_rights')}</p>
                    <div className="flex gap-8 mt-6 md:mt-0 items-center">
                        <Globe size={14} className="text-yellow-400/30" />
                        <span onClick={() => changeLanguage('en')} className={cn("cursor-pointer transition-colors font-mono", i18n.language.startsWith('en') ? "text-yellow-400" : "hover:text-white")}>EN</span>
                        <span onClick={() => changeLanguage('es')} className={cn("cursor-pointer transition-colors font-mono", i18n.language.startsWith('es') ? "text-yellow-400" : "hover:text-white")}>ES</span>
                        <span onClick={() => changeLanguage('pt')} className={cn("cursor-pointer transition-colors font-mono", i18n.language.startsWith('pt') ? "text-yellow-400" : "hover:text-white")}>PT</span>
                        <span onClick={() => changeLanguage('zh')} className={cn("cursor-pointer transition-colors font-mono", i18n.language.startsWith('zh') ? "text-yellow-400" : "hover:text-white")}>ZH</span>
                    </div>
                </div>
            </footer>

            {/* VIDEO MODAL: INDUSTRIAL THEATER */}
            {showVideoModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                    <div
                        className="absolute inset-0 bg-[#020617]/95 backdrop-blur-2xl"
                        onClick={() => setShowVideoModal(false)}
                    />

                    <div className="relative w-full max-w-6xl aspect-video rounded-3xl border border-white/10 bg-black overflow-hidden shadow-[0_0_100px_rgba(253,224,47,0.1)] group">
                        {/* Close button */}
                        <button
                            onClick={() => setShowVideoModal(false)}
                            className="absolute top-6 right-6 z-20 p-3 rounded-full bg-black/50 text-white hover:bg-yellow-400 hover:text-black transition-all border border-white/10"
                        >
                            <X size={24} />
                        </button>

                        {/* Video Metadata / Industry Tag */}
                        <div className="absolute top-6 left-6 z-20 flex items-center gap-3 px-4 py-2 rounded-lg bg-black/50 border border-white/10 backdrop-blur-md">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">
                                {t('nav.tagline')} // LIVE_DEMO // {i18n.language.toUpperCase()}
                            </span>
                        </div>

                        <video
                            src={promoSrc}
                            autoPlay
                            controls
                            className="w-full h-full object-cover"
                        >
                            Your browser does not support the video tag.
                        </video>

                        {/* Scanner Decoration Overlay */}
                        <div className="absolute inset-0 pointer-events-none border-[20px] border-black/5 opacity-50" />
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent animate-scan-slow" />
                    </div>
                </div>
            )}
        </div>
    );
}
