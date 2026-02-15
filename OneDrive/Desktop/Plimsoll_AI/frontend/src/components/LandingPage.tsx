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
import { ChevronRight, Play, Zap, Anchor, Globe, FileCheck, ArrowRight, Check, Plane } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { useTranslation } from 'react-i18next';
import PricingCalculator from './PricingCalculator';
import GlobalParticles from './GlobalParticles';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface LandingPageProps {
    onEnterApp: () => void;
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    }

    return (
        <div className="min-h-screen bg-[#0a192f] text-[#e6f1ff] font-sans selection:bg-[#64ffda] selection:text-[#0a192f] relative overflow-x-hidden">
            <GlobalParticles />
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-[#64ffda]/10 bg-[#0a192f]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8">
                            <div className="absolute inset-0 bg-[#64ffda] blur-md opacity-20 rounded-full"></div>
                            <img src="/logo.png" alt="Plimsoll Logo" className="w-full h-full object-contain relative z-10 filter brightness-0 invert" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-[#e6f1ff]">PLIMSOLL AI</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#8892b0]">
                        <a href="#features" className="hover:text-[#64ffda] transition-colors">{t('nav.features')}</a>
                        <a href="#how-it-works" className="hover:text-[#64ffda] transition-colors">{t('nav.methodology')}</a>
                        <a href="#pricing" className="hover:text-[#64ffda] transition-colors">{t('nav.pricing')}</a>
                        <div className="flex items-center gap-2 border-l border-[#64ffda]/10 pl-6">
                            <button
                                onClick={() => changeLanguage('en')}
                                className={cn("text-xs font-bold transition-colors", i18n.language?.startsWith('en') ? "text-[#64ffda]" : "text-[#8892b0] hover:text-white")}
                            >
                                EN
                            </button>
                            <span className="text-[#8892b0]/30">/</span>
                            <button
                                onClick={() => changeLanguage('es')}
                                className={cn("text-xs font-bold transition-colors", i18n.language?.startsWith('es') ? "text-[#64ffda]" : "text-[#8892b0] hover:text-white")}
                            >
                                ES
                            </button>
                            <span className="text-[#8892b0]/30">/</span>
                            <button
                                onClick={() => changeLanguage('pt')}
                                className={cn("text-xs font-bold transition-colors", i18n.language.startsWith('pt') ? "text-[#64ffda]" : "text-[#8892b0] hover:text-white")}
                            >
                                PT
                            </button>
                            <span className="text-[#8892b0]/30">/</span>
                            <button
                                onClick={() => changeLanguage('zh')}
                                className={cn("text-xs font-bold transition-colors", i18n.language.startsWith('zh') ? "text-[#64ffda]" : "text-[#8892b0] hover:text-white")}
                            >
                                ZH
                            </button>
                        </div>
                        <button
                            onClick={onEnterApp}
                            className="text-[#e6f1ff] hover:text-[#64ffda] transition-colors"
                        >
                            {t('nav.login')}
                        </button>
                        <button
                            onClick={onEnterApp}
                            className="bg-[#64ffda] text-[#0a192f] px-4 py-2 rounded-sm font-bold hover:bg-[#64ffda]/90 transition-colors shadow-[0_0_15px_rgba(100,255,218,0.3)]"
                        >
                            {t('nav.dashboard')}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a192f]/0 via-[#0a192f]/80 to-[#0a192f]" />
                    {/* Placeholder for video/image background - would be replaced by the actual asset */}
                    <div className="absolute inset-0 bg-[url('/plimsoll_hero_scan.png')] bg-cover bg-center mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-[#0a192f]/90"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#64ffda]/20 bg-[#112240]/50 text-xs font-mono text-[#64ffda] mb-8 animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#64ffda] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#64ffda]"></span>
                        </span>
                        {t('landing.hero_badge')}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-[#e6f1ff] max-w-4xl mx-auto leading-tight">
                        {t('landing.hero_title_1')} <br /> <span className="text-[#64ffda]">{t('landing.hero_title_2')}</span>
                    </h1>

                    <p className="text-xl text-[#8892b0] max-w-2xl mx-auto mb-10 leading-relaxed">
                        {t('landing.hero_subtitle')}
                        <br />
                        {t('landing.hero_sub_2')}
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <button
                            onClick={onEnterApp}
                            className="h-12 px-8 rounded-sm bg-[#64ffda] text-[#0a192f] font-bold hover:bg-[#64ffda]/90 transition-all flex items-center gap-2 group shadow-[0_0_20px_rgba(100,255,218,0.4)]"
                        >
                            {t('landing.cta_trial')}
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="h-12 px-8 rounded-sm border border-[#64ffda]/20 text-[#64ffda] hover:bg-[#64ffda]/10 transition-all flex items-center gap-2 font-mono text-sm">
                            <Play className="w-4 h-4" /> {t('landing.cta_demo')}
                        </button>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-12 border-y border-[#64ffda]/5 bg-[#112240]/30">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-xs text-[#8892b0] mb-8 uppercase tracking-widest font-mono">{t('landing.social_proof')}</p>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Semantic representation of logos */}
                        <span className="text-xl font-bold font-serif text-[#e6f1ff]">IMO</span>
                        <span className="text-xl font-bold font-sans text-[#e6f1ff]">ISO 9001</span>
                        <span className="text-xl font-bold font-mono text-[#e6f1ff]">BIMCO</span>
                        <span className="text-xl font-bold font-serif italic text-[#e6f1ff]">Lloyd's Register</span>
                        <span className="text-xl font-bold text-[#e6f1ff]">DNV</span>
                    </div>
                </div>
            </section>

            {/* Problem vs Solution */}
            <section className="py-24 md:py-32" id="features">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#e6f1ff]">{t('landing.feat_title_1')} <br /><span className="text-red-400 line-through decoration-red-500/50">{t('landing.feat_title_2')}</span></h2>
                            <p className="text-[#8892b0] text-lg mb-8">
                                {t('landing.feat_desc')}
                            </p>

                            <div className="space-y-6">
                                <div className="p-6 rounded-lg bg-[#112240] border border-[#f87171]/20 hover:border-[#f87171]/50 transition-colors group">
                                    <div className="flex items-baseline justify-between mb-2">
                                        <h3 className="text-xl font-semibold text-[#8892b0] group-hover:text-red-400 transition-colors">{t('landing.feat_old')}</h3>
                                        <span className="text-xs text-[#f87171] border border-[#f87171]/20 px-2 py-1 rounded">{t('landing.feat_risk')}</span>
                                    </div>
                                    <ul className="space-y-2 text-[#8892b0] text-sm font-mono">
                                        <li className="flex items-center gap-2"><span className="text-[#f87171]">×</span> {t('landing.feat_old_1')}</li>
                                        <li className="flex items-center gap-2"><span className="text-[#f87171]">×</span> {t('landing.feat_old_2')}</li>
                                        <li className="flex items-center gap-2"><span className="text-[#f87171]">×</span> {t('landing.feat_old_3')}</li>
                                        <li className="flex items-center gap-2"><span className="text-[#f87171]">×</span> {t('landing.feat_old_4')}</li>
                                    </ul>
                                </div>

                                <div className="p-6 rounded-lg bg-[#112240] border border-[#64ffda]/20 relative overflow-hidden group shadow-[0_0_30px_rgba(100,255,218,0.05)]">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Anchor className="w-24 h-24 text-[#64ffda]" />
                                    </div>
                                    <div className="flex items-baseline justify-between mb-2">
                                        <h3 className="text-xl font-semibold text-[#e6f1ff] group-hover:text-[#64ffda] transition-colors">{t('landing.feat_new')}</h3>
                                        <span className="text-xs text-[#64ffda] border border-[#64ffda]/20 px-2 py-1 rounded bg-[#64ffda]/10">{t('landing.feat_audit')}</span>
                                    </div>
                                    <ul className="space-y-2 text-[#e6f1ff] text-sm font-mono">
                                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#64ffda]" /> {t('landing.feat_new_1')}</li>
                                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#64ffda]" /> {t('landing.feat_new_2')}</li>
                                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#64ffda]" /> {t('landing.feat_new_3')}</li>
                                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#64ffda]" /> {t('landing.feat_new_4')}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-[#64ffda] to-blue-600 rounded-2xl opacity-10 blur-2xl animate-pulse"></div>
                            <div className="relative bg-[#020c1b] border border-[#64ffda]/20 rounded-xl p-6 aspect-square flex items-center justify-center shadow-2xl">
                                {/* Abstract Visualization of AI Processing */}
                                <div className="text-center">
                                    <div className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-[#64ffda]/30 border-t-[#64ffda] animate-spin"></div>
                                    <div className="font-mono text-[#64ffda] text-lg tracking-widest">{t('landing.process_hull')}</div>
                                    <div className="text-[#8892b0] text-sm mt-2 font-mono">{t('landing.process_inf')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 bg-[#112240]/20" id="how-it-works">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-16 text-[#e6f1ff]">{t('landing.how_title')}</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="relative p-8 group hover:bg-[#112240] rounded-xl transition-colors border border-transparent hover:border-[#64ffda]/10">
                            <div className="w-16 h-16 mx-auto bg-[#112240] rounded-lg flex items-center justify-center mb-6 border border-[#64ffda]/10 group-hover:border-[#64ffda]/50 group-hover:scale-110 transition-all shadow-lg">
                                <Plane className="w-8 h-8 text-[#64ffda]" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-[#e6f1ff]">{t('landing.step_1_title')}</h3>
                            <p className="text-[#8892b0] text-sm">{t('landing.step_1_desc')}</p>
                            <ArrowRight className="hidden md:block absolute top-12 -right-4 text-[#64ffda]/20 w-8 h-8" />
                        </div>

                        <div className="p-8 group hover:bg-[#112240] rounded-xl transition-colors border border-transparent hover:border-[#64ffda]/10">
                            <div className="w-16 h-16 mx-auto bg-[#112240] rounded-lg flex items-center justify-center mb-6 border border-[#64ffda]/10 group-hover:border-[#64ffda]/50 group-hover:scale-110 transition-all shadow-lg">
                                <Zap className="w-8 h-8 text-[#64ffda]" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-[#e6f1ff]">{t('landing.step_2_title')}</h3>
                            <p className="text-[#8892b0] text-sm">{t('landing.step_2_desc')}</p>
                            <ArrowRight className="hidden md:block absolute top-12 -right-4 text-[#64ffda]/20 w-8 h-8" />
                        </div>

                        <div className="p-8 group hover:bg-[#112240] rounded-xl transition-colors border border-transparent hover:border-[#64ffda]/10">
                            <div className="w-16 h-16 mx-auto bg-[#112240] rounded-lg flex items-center justify-center mb-6 border border-[#64ffda]/10 group-hover:border-[#64ffda]/50 group-hover:scale-110 transition-all shadow-lg">
                                <FileCheck className="w-8 h-8 text-[#64ffda]" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-[#e6f1ff]">{t('landing.step_3_title')}</h3>
                            <p className="text-[#8892b0] text-sm">{t('landing.step_3_desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-24" id="pricing">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4 text-[#e6f1ff]">{t('landing.pricing_title')}</h2>
                        <p className="text-[#8892b0]">{t('landing.pricing_desc')}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="p-8 rounded-2xl bg-[#112240] border border-[#64ffda]/5 flex flex-col hover:border-[#64ffda]/20 transition-all">
                            <div className="mb-4">
                                <span className="text-sm font-bold text-[#8892b0] uppercase tracking-wider font-mono">{t('landing.price_pay')}</span>
                            </div>
                            <div className="text-4xl font-bold mb-2 text-[#e6f1ff]">$50<span className="text-xl font-normal text-[#8892b0]">{t('landing.price_rep')}</span></div>
                            <p className="text-[#8892b0] text-sm mb-8">{t('landing.price_pay_desc')}</p>

                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex gap-3 text-sm text-[#e6f1ff]"><Check className="w-5 h-5 text-[#64ffda]" /> {t('landing.price_pay_1')}</li>
                                <li className="flex gap-3 text-sm text-[#e6f1ff]"><Check className="w-5 h-5 text-[#64ffda]" /> {t('landing.price_pay_2')}</li>
                                <li className="flex gap-3 text-sm text-[#e6f1ff]"><Check className="w-5 h-5 text-[#64ffda]" /> {t('landing.price_pay_3')}</li>
                            </ul>

                            <button className="w-full py-4 rounded-sm border border-[#64ffda] text-[#64ffda] hover:bg-[#64ffda]/10 transition-colors font-bold font-mono">
                                {t('landing.btn_survey')}
                            </button>
                        </div>

                        {/* Dynamic Calculator */}
                        <PricingCalculator />
                    </div>
                </div>
            </section>

            {/* Hero CTA */}
            <section className="py-20 text-center border-t border-[#64ffda]/5">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-4xl font-bold mb-8 text-[#e6f1ff]">{t('landing.cta_final')}</h2>
                    <button
                        onClick={onEnterApp}
                        className="h-14 px-10 rounded-sm bg-[#64ffda] text-[#0a192f] font-bold text-lg hover:bg-[#64ffda]/90 transition-all shadow-[0_0_20px_rgba(100,255,218,0.4)]"
                    >
                        {t('landing.cta_final_btn')}
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#020c1b] pt-16 pb-8 text-sm">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 bg-[#64ffda] rounded-sm flex items-center justify-center text-[#0a192f]">
                                <Anchor className="w-4 h-4" />
                            </div>
                            <span className="font-bold tracking-tight text-[#e6f1ff]">PLIMSOLL AI</span>
                        </div>
                        <p className="text-[#8892b0] max-w-xs">
                            {t('landing.footer_desc')}
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 text-[#e6f1ff]">{t('landing.footer_prod')}</h4>
                        <ul className="space-y-2 text-[#8892b0]">
                            <li><a href="#" className="hover:text-[#64ffda]">{t('nav.features')}</a></li>
                            <li><a href="#" className="hover:text-[#64ffda]">{t('nav.methodology')}</a></li>
                            <li><a href="#" className="hover:text-[#64ffda]">API</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 text-[#e6f1ff]">{t('landing.footer_comp')}</h4>
                        <ul className="space-y-2 text-[#8892b0]">
                            <li><a href="#" className="hover:text-[#64ffda]">{t('landing.footer_comp')}</a></li>
                            <li><a href="#" className="hover:text-[#64ffda]">Whitepaper</a></li>
                            <li><a href="#" className="hover:text-[#64ffda]">{t('landing.footer_legal')}</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-[#112240] text-[#8892b0] flex flex-col md:flex-row justify-between items-center bg-[#020c1b]">
                    <p>{t('landing.footer_rights')}</p>
                    <div className="flex gap-6 mt-4 md:mt-0 font-mono text-xs">
                        <div className="flex items-center gap-2">
                            <Globe className="w-3 h-3 text-[#64ffda]" />
                            <a href="#" onClick={(e) => { e.preventDefault(); changeLanguage('en'); }} className={i18n.language.startsWith('en') ? "text-[#64ffda]" : "hover:text-white"}>English</a>
                            <span className="opacity-30">|</span>
                            <a href="#" onClick={(e) => { e.preventDefault(); changeLanguage('es'); }} className={i18n.language.startsWith('es') ? "text-[#64ffda]" : "hover:text-white"}>Español</a>
                            <span className="opacity-30">|</span>
                            <a href="#" onClick={(e) => { e.preventDefault(); changeLanguage('pt'); }} className={i18n.language.startsWith('pt') ? "text-[#64ffda]" : "hover:text-white"}>Português</a>
                            <span className="opacity-30">|</span>
                            <a href="#" onClick={(e) => { e.preventDefault(); changeLanguage('zh'); }} className={i18n.language.startsWith('zh') ? "text-[#64ffda]" : "hover:text-white"}>中文</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
