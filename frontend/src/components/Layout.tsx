import React, { useState } from 'react';
import { Ship, Activity, History, Settings, Cloud, Plane, Zap, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import VesselCommander from './VesselCommander';
import { EnterpriseOnboarding } from './Commercial/EnterpriseOnboarding';

function NavItem({ icon, label, active = false, onClick, theme }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void, theme: 'light' | 'dark' | 'midnight' }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-4 p-3 rounded-xl transition-all group",
                active
                    ? (theme === 'midnight' ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/10" : (theme === 'dark' ? "bg-yellow-400/10 text-yellow-400" : "bg-slate-900 text-white"))
                    : "text-slate-500 hover:text-yellow-400 hover:bg-white/5"
            )}>
            <div className={cn("transition-transform group-hover:scale-110", active && "scale-110")}>{icon}</div>
            <span className="hidden lg:block font-bold uppercase tracking-tighter text-sm">{label}</span>
            {active && <div className={cn("ml-auto w-1 h-1 rounded-full hidden lg:block", (theme === 'dark' || theme === 'midnight') ? "bg-yellow-400" : "bg-white")} />}
        </button>
    )
}

export default function Layout({ children }: { children: React.ReactNode }) {
    const { t, i18n } = useTranslation();
    const { 
        theme, setTheme, user, logout, isOnline, 
        activeTab, setActiveTab, setShowLanding,
        vesselInfo, setVesselInfo
    } = useStore();

    const [isEnterpriseModalOpen, setIsEnterpriseModalOpen] = useState(false);


    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className={cn(
            "min-h-screen text-slate-200 selection:bg-yellow-400/30 overflow-x-hidden flex transition-colors duration-500",
            theme === 'midnight' ? "bg-black" : (theme === 'dark' ? "bg-[#020617]" : "bg-slate-50 text-slate-900")
        )}>
            <VesselCommander
                vesselInfo={vesselInfo}
                onUpdateVessel={setVesselInfo}
            />

            <aside className={cn(
                "w-20 lg:w-64 border-r flex flex-col items-center lg:items-start py-8 transition-colors duration-300 z-10",
                theme === 'midnight' ? "bg-black border-yellow-400/10" : (theme === 'dark' ? "bg-[#020617] border-white/5" : "bg-white border-slate-200")
            )}>
                <div
                    onClick={() => setShowLanding(true)}
                    className="px-4 mb-12 flex justify-center w-full relative cursor-pointer group/logo active:scale-95 transition-transform"
                >
                    <div className="absolute inset-0 bg-yellow-400/5 blur-2xl rounded-full group-hover/logo:bg-yellow-400/10 transition-colors"></div>
                    <img
                        src="/logo.png"
                        alt="Plimsoll Logo"
                        className="w-full h-auto object-contain transition-all duration-500 scale-110 relative z-10 drop-shadow-[0_0_15px_rgba(253,224,47,0.2)] group-hover/logo:drop-shadow-[0_0_20px_rgba(253,224,47,0.4)]"
                        style={theme === 'dark' ? { filter: 'brightness(0) invert(1)' } : {}}
                    />
                </div>

                <nav className="flex-1 w-full space-y-4 px-3">
                    <NavItem
                        icon={<Activity size={20} />}
                        label={t('nav.radar_survey')}
                        active={activeTab === "Radar Survey"}
                        onClick={() => setActiveTab("Radar Survey")}
                        theme={theme}
                    />
                    <NavItem
                        icon={<History size={20} />}
                        label={t('nav.history_log')}
                        active={activeTab === "History Log"}
                        onClick={() => setActiveTab("History Log")}
                        theme={theme}
                    />
                    {(user?.tier === 'Commander' || user?.tier === 'Sovereign') && (
                        <NavItem
                            icon={<Plane size={20} />}
                            label={t('nav.drone_pilot')}
                            active={activeTab === "Drone Pilot"}
                            onClick={() => setActiveTab("Drone Pilot")}
                            theme={theme}
                        />
                    )}
                    {user?.tier === 'Sovereign' && (
                        <NavItem
                            icon={<Settings size={20} />}
                            label={t('nav.sys_config')}
                            active={activeTab === "System Config"}
                            onClick={() => setActiveTab("System Config")}
                            theme={theme}
                        />
                    )}
                </nav>

                {user && (
                    <div className="w-full border-t border-white/5 py-4 flex flex-col items-center lg:items-start lg:px-6">
                        <div className="hidden lg:flex flex-col mb-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 truncate max-w-full">{user.full_name}</span>
                            <span className={cn(
                                "text-[8px] font-black uppercase tracking-[0.3em] w-fit px-2 py-0.5 rounded mt-1",
                                user.tier === 'Sovereign' && "bg-yellow-400/20 text-yellow-400",
                                user.tier === 'Commander' && "bg-blue-400/20 text-blue-400",
                                user.tier === 'Explorer' && "bg-slate-400/20 text-slate-400"
                            )}>
                                {user.tier}
                            </span>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center justify-center lg:justify-start gap-2 text-red-500 hover:text-red-400 transition-colors group p-2 lg:p-0"
                            title="Sign Out"
                        >
                            <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] hidden lg:inline">Logout</span>
                        </button>
                    </div>
                )}

                <div className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 hidden lg:block opacity-30">
                    V2.2-STABLE // PLIMSOLL AI
                </div>

                <div className="mt-auto p-4 w-full">
                    {user?.tier !== 'Sovereign' && (
                        <button
                            onClick={() => setIsEnterpriseModalOpen(true)}
                            className="w-full py-4 rounded-xl bg-yellow-400 group relative overflow-hidden flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" />
                            <Zap size={14} className="text-black group-hover:animate-bounce" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-black">{t('onboarding.go_enterprise')}</span>
                        </button>
                    )}
                </div>
            </aside>

            <main className="flex-1 flex flex-col p-8 overflow-y-auto">
                <div className="flex justify-end gap-3 mb-6">
                    <div className={cn(
                        "flex rounded-lg p-1 border",
                        theme === 'dark' ? "bg-[#0f172a] border-white/5" : "bg-white border-slate-200 shadow-sm"
                    )}>
                        {['en', 'es', 'pt', 'zh'].map((lang) => (
                            <button
                                key={lang}
                                onClick={() => changeLanguage(lang)}
                                className={cn("px-3 py-1 rounded-md text-xs font-black transition-all", (i18n.language || 'en').startsWith(lang) ? "bg-yellow-400 text-black shadow-lg" : "text-slate-500 uppercase")}>
                                {lang.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => {
                            if (theme === 'light') setTheme('dark');
                            else if (theme === 'dark') setTheme('midnight');
                            else setTheme('light');
                        }}
                        className={cn(
                            "p-2 rounded-lg border flex items-center justify-center transition-all",
                            theme === 'midnight' ? "bg-black border-yellow-400/30 text-yellow-400 shadow-[0_0_15px_rgba(253,224,71,0.2)]" :
                                (theme === 'dark' ? "bg-[#0f172a] border-white/5 text-yellow-400" : "bg-white border-slate-200 text-slate-900 shadow-sm")
                        )}>
                        {theme === 'midnight' ? <Zap size={18} className="animate-pulse" /> : (theme === 'dark' ? <Ship size={18} /> : <Cloud size={18} />)}
                    </button>

                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all",
                        isOnline ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-500 animate-pulse"
                    )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", isOnline ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" : "bg-red-500")} />
                        {isOnline ? "Cloud Online" : "Offline Mode"}
                    </div>
                </div>

                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className={cn("text-3xl font-bold tracking-tight", theme === 'light' && "text-gray-900")}>
                            {activeTab === "Radar Survey" ? t('nav.radar_survey') : (activeTab === "History Log" ? t('nav.history_log') : (activeTab === "Drone Pilot" ? t('nav.drone_pilot') : t('nav.sys_config')))}
                        </h1>
                        <p className="text-[#8892b0] mt-1">{t('app.subtitle')}</p>
                    </div>
                </header>

                {children}

            </main>
            
            <EnterpriseOnboarding
                isOpen={isEnterpriseModalOpen}
                onClose={() => setIsEnterpriseModalOpen(false)}
            />
        </div>
    );
}
