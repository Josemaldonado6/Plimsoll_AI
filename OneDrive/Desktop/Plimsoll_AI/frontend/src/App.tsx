/*
 * -----------------------------------------------------------------------------
 * PROYECTO: PLIMSOLL AI - MARITIME AUDIT SYSTEM
 * ARCHIVO: App.tsx
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
import { useState, useRef, useEffect } from 'react'
import { Ship, Activity, History, Settings, Download, Cloud, Plane, Shield, Zap, RotateCcw, LogOut } from 'lucide-react'
import axios from 'axios'
import { cn } from './lib/utils';
import DronePilot from './components/DronePilot'
import LandingPage from './components/LandingPage'
import { useTranslation } from 'react-i18next'
import DraftDashboard from './components/DraftDashboard';
import { EnterpriseOnboarding } from './components/Commercial/EnterpriseOnboarding';
import { useStore } from './store/useStore';
import VesselCommander from './components/VesselCommander';
import { Login } from './components/Login';


// Utility for API URL - Module Scope
const getApiUrl = (path: string) => {
    const isDev = window.location.port === "5173"
    return isDev ? `http://127.0.0.1:8000${path}` : path
}

export default function App() {
    const { t, i18n } = useTranslation();
    const {
        showLanding, setShowLanding,
        activeTab, setActiveTab,
        history, setHistory, addSurvey,
        theme, setTheme,
        isOnline, setIsOnline,
        currentResult, setCurrentResult,
        isAnalyzing, setIsAnalyzing,
        user, token, logout,
        syncDrafts
    } = useStore();

    const [vesselInfo, setVesselInfo] = useState({ name: 'MV PACIFIC LEGACY', imo: '9823471' })
    const [file, setFile] = useState<File | null>(null)
    const [isEnterpriseModalOpen, setIsEnterpriseModalOpen] = useState(false)
    const [analysisStatus, setAnalysisStatus] = useState<string>('')
    const inputRef = useRef<HTMLInputElement>(null)


    const fetchHistory = async () => {
        if (!token) return;
        try {
            const response = await axios.get(getApiUrl("/api/history"), {
                headers: { Authorization: `Bearer ${token}` }
            })
            setHistory(response.data)
        } catch (error) {
            console.error("Failed to fetch history", error)
        }
    }

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            syncDrafts();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [setIsOnline, syncDrafts]);

    useEffect(() => {
        if (activeTab === "History Log" && user) {
            fetchHistory()
        }
    }, [activeTab, user])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            handleAnalyze(selectedFile); // Trigger auto-analysis
        }
    }

    const handleAnalyze = async (fileToAnalyze?: File) => {
        const fileToUse = fileToAnalyze || file;
        if (!fileToUse || !token) return;

        setIsAnalyzing(true);
        setAnalysisStatus("Initializing Neural Pipeline...");
        setCurrentResult(null); // Clear previous results
        const formData = new FormData();
        formData.append("video", fileToUse);

        try {
            setAnalysisStatus("Neural Networks Warming Up...");
            // Simultaneous wait for upload and small delay for UI effect
            const response = await axios.post(getApiUrl("/api/analyze"), formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    if (percentCompleted < 100) {
                        setAnalysisStatus(`Uploading Video Payload: ${percentCompleted}%`);
                    } else {
                        setAnalysisStatus("Cortex Engine: Processing Frames...");
                    }
                }
            })

            setAnalysisStatus("Running YOLOv8 + SAM Segmentation...");
            await new Promise(r => setTimeout(r, 800)); // Visual feedback for user

            setAnalysisStatus("Detecting Waterline & Draft Marks...");
            const vesselResponse = await axios.get(getApiUrl(`/api/ship/9406087`), {
                headers: { Authorization: `Bearer ${token}` }
            });

            setAnalysisStatus("Physics Engine: Calculating Displacement...");
            const finalResult = {
                ...response.data,
                ...vesselResponse.data,
                vessel_name: vesselResponse.data.name,
                vessel_imo: vesselResponse.data.imo || "9406087",
                vessel_flag: vesselResponse.data.flag,
                vessel_type: vesselResponse.data.type,
                vessel_loa: vesselResponse.data.loa,
                vessel_beam: vesselResponse.data.beam,
                logistics: vesselResponse.data.logistics,
                risk_score: vesselResponse.data.risk_score
            };

            setCurrentResult(finalResult);

            // Add to persistent history
            addSurvey({
                id: Date.now(),
                filename: fileToUse.name,
                draft_mean: finalResult.draft_mean,
                confidence: finalResult.confidence,
                sea_state: finalResult.sea_state,
                timestamp: new Date().toISOString(),
                is_synced: isOnline ? 0 : 0 // Mark for sync
            });

            if (isOnline) syncDrafts(); // Trigger immediate sync if online
            setAnalysisStatus("Analysis Complete.");

        } catch (error: any) {
            console.error("Analysis failed", error)
            const errorMsg = error.response?.status === 422
                ? `Analysis Rejected: ${error.response.data.detail || "Invalid video quality or no frames found."}`
                : "Analysis failed. Ensure backend is running.";
            alert(errorMsg);
        } finally {
            setIsAnalyzing(false);
            setAnalysisStatus("");
        }
    }



    const handleDownload = async (id: number) => {
        if (!token) return;
        try {
            // Extract primary language code (e.g., 'en-US' -> 'en')
            const currentLang = i18n.language.split('-')[0];
            const response = await axios.get(getApiUrl(`/api/surveys/${id}/pdf?lang=${currentLang}`), {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/pdf',
                    Authorization: `Bearer ${token}`
                }
            })

            // Validate it's actually a PDF
            if (response.data.type !== 'application/pdf') {
                console.error("Wrong content type:", response.data.type);
                alert("The server returned an invalid file format. Please try again.");
                return;
            }

            const url = window.URL.createObjectURL(response.data)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `PLIMSOLL_Report_ID${id}.pdf`)
            document.body.appendChild(link)
            link.click()

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
            }, 100)
        } catch (error) {
            console.error("Download failed", error)
            alert("Failed to download report. The analysis might still be processing.")
        }
    }

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    }

    if (showLanding) {
        return <LandingPage onEnterApp={() => setShowLanding(false)} />
    }

    if (!user) {
        return <Login />
    }

    return (
        <div className={cn(
            "min-h-screen text-slate-200 selection:bg-yellow-400/30 overflow-x-hidden flex transition-colors duration-500",
            theme === 'midnight' ? "bg-black" : (theme === 'dark' ? "bg-[#020617]" : "bg-slate-50 text-slate-900")
        )}>
            {/* Phase 31: Tactical Command */}
            <VesselCommander
                vesselInfo={vesselInfo}
                onUpdateVessel={setVesselInfo}
            />

            {/* Background Holographic Atmosphere */}
            {/* Sidebar */}
            <aside className={cn(
                "w-20 lg:w-64 border-r flex flex-col items-center lg:items-start py-8 transition-colors duration-300",
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
                    <div className="tour-history-tab">
                        <NavItem
                            icon={<History size={20} />}
                            label={t('nav.history_log')}
                            active={activeTab === "History Log"}
                            onClick={() => setActiveTab("History Log")}
                            theme={theme}
                        />
                    </div>
                    {/* Tier-Gated: Commander+ */}
                    {(user?.tier === 'Commander' || user?.tier === 'Sovereign') && (
                        <NavItem
                            icon={<Plane size={20} />}
                            label={t('nav.drone_pilot')}
                            active={activeTab === "Drone Pilot"}
                            onClick={() => setActiveTab("Drone Pilot")}
                            theme={theme}
                        />
                    )}
                    {/* Tier-Gated: Sovereign Only */}
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

            {/* Main Content */}
            <main className="flex-1 flex flex-col p-8 overflow-y-auto">
                {/* Top Toolbar */}
                <div className="flex justify-end gap-3 mb-6">
                    <div className={cn(
                        "flex rounded-lg p-1 border",
                        theme === 'dark' ? "bg-[#0f172a] border-white/5" : "bg-white border-slate-200 shadow-sm"
                    )}>
                        <button
                            onClick={() => changeLanguage('en')}
                            className={cn("px-3 py-1 rounded-md text-xs font-black transition-all", (i18n.language || 'en').startsWith('en') ? "bg-yellow-400 text-black shadow-lg" : "text-slate-500")}>
                            EN
                        </button>
                        <button
                            onClick={() => changeLanguage('es')}
                            className={cn("px-3 py-1 rounded-md text-xs font-black transition-all", (i18n.language || 'en').startsWith('es') ? "bg-yellow-400 text-black shadow-lg" : "text-slate-500")}>
                            ES
                        </button>
                        <button
                            onClick={() => changeLanguage('pt')}
                            className={cn("px-3 py-1 rounded-md text-xs font-black transition-all", (i18n.language || 'en').startsWith('pt') ? "bg-yellow-400 text-black shadow-lg" : "text-slate-500")}>
                            PT
                        </button>
                        <button
                            onClick={() => changeLanguage('zh')}
                            className={cn("px-3 py-1 rounded-md text-xs font-black transition-all", (i18n.language || 'en').startsWith('zh') ? "bg-yellow-400 text-black shadow-lg" : "text-slate-500")}>
                            ZH
                        </button>
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



                {activeTab === "Radar Survey" && (
                    <div className="flex-1">
                        <input
                            ref={inputRef}
                            type="file"
                            className="hidden"
                            accept="video/*"
                            onChange={handleChange}
                        />
                        <DraftDashboard
                            data={currentResult}
                            onConfirm={() => console.log("Confirmed")}
                            onUpload={() => inputRef.current?.click()}
                            onExport={handleDownload}
                            onEnrich={(enrichedData) => {
                                setCurrentResult({
                                    ...currentResult,
                                    ...enrichedData,
                                    vessel_name: enrichedData.name,
                                    vessel_imo: enrichedData.imo,
                                    vessel_flag: enrichedData.flag,
                                    vessel_type: enrichedData.type,
                                    vessel_loa: enrichedData.loa,
                                    vessel_beam: enrichedData.beam,
                                    logistics: enrichedData.logistics,
                                    risk_score: enrichedData.risk_score
                                });
                            }}
                            theme={theme}
                            isAnalyzing={isAnalyzing}
                            analysisStatus={analysisStatus}
                        />
                    </div>
                )}

                {activeTab === "Drone Pilot" && (
                    <div className="w-full h-full">
                        <DronePilot theme={theme} />
                    </div>
                )}

                {activeTab === "History Log" && (
                    <div className="w-full h-full overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {history.length === 0 ? (
                                <div className="text-center text-[#8892b0] py-20">{t('dashboard.no_history')}</div>
                            ) : (
                                history.map((survey) => (
                                    <div key={survey.id} className={cn(
                                        "p-6 rounded-xl border transition-all flex items-center justify-between group",
                                        theme === 'dark' ? "bg-[#112240] border-[#8892b0]/10 hover:border-[#64ffda]/30" : "bg-white border-gray-200 hover:border-blue-400 shadow-sm"
                                    )}>
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-full bg-[#64ffda]/10 flex items-center justify-center text-[#64ffda] font-mono font-bold">
                                                {survey.draft_mean.toFixed(2)}
                                            </div>
                                            <div>
                                                <h3 className={cn("font-semibold", theme === 'light' && "text-gray-900")}>{new Date(survey.timestamp).toLocaleString(i18n.language)}</h3>
                                                <p className="text-sm text-[#8892b0] font-mono mt-1">{survey.filename.substring(0, 8)}...mp4</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleDownload(survey.id)}
                                            className={cn(
                                                "p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all",
                                                theme === 'dark' ? "hover:bg-[#64ffda]/20 text-[#64ffda]" : "hover:bg-blue-100 text-blue-600"
                                            )}
                                            title="Download PDF"
                                        >
                                            <Download size={20} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "System Config" && (
                    <div className={cn(
                        "rounded-[2.5rem] p-8 md:p-12 border h-full overflow-y-auto",
                        theme === 'dark' ? "bg-white/5 border-white/5 shadow-2xl" : "bg-white border-slate-200"
                    )}>
                        <h2 className={cn("text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2", theme === 'dark' ? "text-white" : "text-slate-900")}>
                            <Settings className="text-yellow-400" size={24} />
                            {t('config.physics_engine')}
                        </h2>

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

                                {/* [PHASE 2.5] Environment Parameters */}
                                <div className="pt-4 border-t border-white/5">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">{t('config.env_trim')}</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">{t('config.water_density')}</label>
                                            <input
                                                id="env-density"
                                                type="number"
                                                defaultValue={1.025}
                                                step="0.001"
                                                className="w-full bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-3 text-sm font-mono text-yellow-400 focus:border-yellow-400 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">{t('config.calc_trim')}</label>
                                            <div id="calc-trim" className="w-full bg-black/60 border border-white/5 rounded-lg p-3 text-sm font-mono text-slate-600">
                                                --
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">{t('config.draft_fwd')}</label>
                                            <input id="env-fwd" type="number" placeholder="Optional" className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm font-mono text-white focus:border-yellow-400/50 outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">{t('config.draft_aft')}</label>
                                            <input id="env-aft" type="number" placeholder="Optional" className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm font-mono text-white focus:border-yellow-400/50 outline-none transition-all" />
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
                                onClick={async () => {
                                    if (window.confirm("CRITICAL: This will wipe all local history and reset the application. Proceed?")) {
                                        // Clear storage completely to ensure it sticks
                                        useStore.persist.clearStorage();
                                        // Also reset the in-memory state just in case
                                        useStore.getState().resetState();

                                        // Small delay to allow IDB to breathe before reload
                                        setTimeout(() => {
                                            window.location.reload();
                                        }, 100);
                                    }
                                }}
                                className="text-[10px] font-black uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-colors flex items-center gap-2"
                            >
                                <RotateCcw size={12} />
                                Reset Application State
                            </button>

                            <button
                                onClick={async () => {
                                    // Quick MVP implementation: Grab values by ID
                                    const density = parseFloat((document.getElementById('env-density') as HTMLInputElement).value);
                                    const fwd = parseFloat((document.getElementById('env-fwd') as HTMLInputElement).value) || 0;
                                    const aft = parseFloat((document.getElementById('env-aft') as HTMLInputElement).value) || 0;

                                    try {
                                        const res = await axios.post(getApiUrl('/api/environment'), {
                                            density,
                                            draft_fwd: fwd || null,
                                            draft_aft: aft || null
                                        });
                                        alert(`Physics Kernel Updated!\nTrim: ${res.data.physics_state.trim.toFixed(3)} m`);
                                        const trimDisp = document.getElementById('calc-trim');
                                        if (trimDisp) trimDisp.innerText = res.data.physics_state.trim.toFixed(3) + " m";
                                    } catch (e) {
                                        alert("Update Failed");
                                        console.error(e);
                                    }
                                }}
                                className="bg-yellow-400 text-black font-black uppercase tracking-widest px-8 py-4 rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-xl"
                            >
                                <Shield size={18} strokeWidth={3} />
                                {t('config.update_kernel')}
                            </button>
                        </div>
                    </div>
                )}
            </main>
            <EnterpriseOnboarding
                isOpen={isEnterpriseModalOpen}
                onClose={() => setIsEnterpriseModalOpen(false)}
            />
        </div>
    )
}

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
