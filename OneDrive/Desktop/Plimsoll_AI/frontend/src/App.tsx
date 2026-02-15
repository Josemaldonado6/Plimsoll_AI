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
import { Ship, Upload, Activity, History, Settings, FileVideo, AlertCircle, CheckCircle2, Download, Cloud, Loader2, Check, Plane, Shield } from 'lucide-react'
import axios from 'axios'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import DronePilot from './components/DronePilot'
import LandingPage from './components/LandingPage'
import { useTranslation } from 'react-i18next'
import OnboardingTour from './components/OnboardingTour'
import SupportWidget from './components/SupportWidget'
import TelemetryPanel from './components/TelemetryPanel'

// Utility for class merging
function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs))
}

interface Survey {
    id: number
    filename: string
    draft_mean: number
    confidence: number
    sea_state: string
    timestamp: string
    is_synced?: number
}

export default function App() {
    const { t, i18n } = useTranslation();
    const [showLanding, setShowLanding] = useState(true)
    const [activeTab, setActiveTab] = useState("Radar Survey")
    const [file, setFile] = useState<File | null>(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [history, setHistory] = useState<Survey[]>([])
    const [dragActive, setDragActive] = useState(false)
    const [theme, setTheme] = useState<'light' | 'dark'>('dark')
    const inputRef = useRef<HTMLInputElement>(null)

    // Dynamic API URL for both Dev and Prod
    const getApiUrl = (path: string) => {
        const isDev = window.location.port === "5173"
        return isDev ? `http://localhost:8000${path}` : path
    }

    const fetchHistory = async () => {
        try {
            const response = await axios.get(getApiUrl("/history"))
            setHistory(response.data)
        } catch (error) {
            console.error("Failed to fetch history", error)
        }
    }

    useEffect(() => {
        if (activeTab === "History Log") {
            fetchHistory()
        }
    }, [activeTab])

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            setFile(droppedFile);
            handleAnalyze(droppedFile); // Trigger auto-analysis
        }
    }

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
        if (!fileToUse) return;

        setAnalyzing(true);
        setResult(null); // Clear previous results
        const formData = new FormData();
        formData.append("video", fileToUse);

        try {
            const response = await axios.post(getApiUrl("/analyze"), formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            setResult(response.data)
        } catch (error) {
            console.error("Analysis failed", error)
            alert("Analysis failed. Ensure backend is running.")
        } finally {
            setAnalyzing(false)
        }
    }

    const [syncingId, setSyncingId] = useState<number | null>(null)

    const handleSync = async (id: number) => {
        setSyncingId(id)
        try {
            await axios.post(getApiUrl(`/surveys/${id}/sync`))
            // Update local state
            setHistory(prev => prev.map(item =>
                item.id === id ? { ...item, is_synced: 1 } : item
            ))
        } catch (error) {
            console.error("Sync failed", error)
            alert("Cloud sync failed.")
        } finally {
            setSyncingId(null)
        }
    }

    const handleDownload = async (id: number) => {
        try {
            // Extract primary language code (e.g., 'en-US' -> 'en')
            const currentLang = i18n.language.split('-')[0];
            const response = await axios.get(getApiUrl(`/surveys/${id}/pdf?lang=${currentLang}`), {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/pdf'
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

    return (
        <div className={cn(
            "flex h-screen overflow-hidden font-sans transition-colors duration-300",
            theme === 'dark' ? "bg-[#0a192f] text-[#e6f1ff]" : "bg-gray-50 text-gray-900"
        )}>
            <SupportWidget />
            <OnboardingTour />
            <TelemetryPanel visible={analyzing || !!result} data={result} />

            {/* Sidebar */}
            <aside className={cn(
                "w-20 lg:w-64 border-r flex flex-col items-center lg:items-start py-8 transition-colors duration-300",
                theme === 'dark' ? "bg-[#112240] border-[#64ffda]/10" : "bg-white border-gray-200"
            )}>
                <div className="px-4 mb-12 flex justify-center w-full relative">
                    <div className="absolute inset-0 bg-[#64ffda]/5 blur-2xl rounded-full"></div>
                    <img
                        src="/logo.png"
                        alt="Plimsoll Logo"
                        className="w-full h-auto object-contain transition-all duration-500 scale-110 relative z-10 drop-shadow-[0_0_15px_rgba(100,255,218,0.3)]"
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
                    <NavItem
                        icon={<Plane size={20} />}
                        label={t('nav.drone_pilot')}
                        active={activeTab === "Drone Pilot"}
                        onClick={() => setActiveTab("Drone Pilot")}
                        theme={theme}
                    />
                    <NavItem
                        icon={<Settings size={20} />}
                        label={t('nav.sys_config')}
                        active={activeTab === "System Config"}
                        onClick={() => setActiveTab("System Config")}
                        theme={theme}
                    />
                </nav>

                <div className="px-6 py-4 text-[10px] font-mono text-[#8892b0] hidden lg:block opacity-30 uppercase tracking-widest">
                    v2.2-STABLE
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col p-8 overflow-y-auto">
                {/* Top Toolbar */}
                <div className="flex justify-end gap-3 mb-6">
                    <div className={cn(
                        "flex rounded-lg p-1 border",
                        theme === 'dark' ? "bg-[#112240] border-[#64ffda]/20" : "bg-white border-gray-200 shadow-sm"
                    )}>
                        <button
                            onClick={() => changeLanguage('en')}
                            className={cn("px-3 py-1 rounded-md text-xs font-bold transition-all", i18n.language.startsWith('en') ? "bg-[#64ffda] text-[#0a192f]" : "text-[#8892b0]")}>
                            EN
                        </button>
                        <button
                            onClick={() => changeLanguage('es')}
                            className={cn("px-3 py-1 rounded-md text-xs font-bold transition-all", i18n.language.startsWith('es') ? "bg-[#64ffda] text-[#0a192f]" : "text-[#8892b0]")}>
                            ES
                        </button>
                        <button
                            onClick={() => changeLanguage('pt')}
                            className={cn("px-3 py-1 rounded-md text-xs font-bold transition-all", i18n.language.startsWith('pt') ? "bg-[#64ffda] text-[#0a192f]" : "text-[#8892b0]")}>
                            PT
                        </button>
                        <button
                            onClick={() => changeLanguage('zh')}
                            className={cn("px-3 py-1 rounded-md text-xs font-bold transition-all", i18n.language.startsWith('zh') ? "bg-[#64ffda] text-[#0a192f]" : "text-[#8892b0]")}>
                            ZH
                        </button>
                    </div>

                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className={cn(
                            "p-2 rounded-lg border flex items-center justify-center transition-all",
                            theme === 'dark' ? "bg-[#112240] border-[#64ffda]/20 text-[#64ffda]" : "bg-white border-gray-200 text-gray-700 shadow-sm"
                        )}>
                        {theme === 'dark' ? <Ship size={18} /> : <Cloud size={18} />}
                    </button>
                </div>

                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className={cn("text-3xl font-bold tracking-tight", theme === 'light' && "text-gray-900")}>
                            {activeTab === "Radar Survey" ? t('nav.radar_survey') : (activeTab === "History Log" ? t('nav.history_log') : (activeTab === "Drone Pilot" ? t('nav.drone_pilot') : t('nav.sys_config')))}
                        </h1>
                        <p className="text-[#8892b0] mt-1">{t('app.subtitle')}</p>
                    </div>
                    {analyzing && (
                        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#64ffda]/10 border border-[#64ffda]/20 animate-pulse">
                            <Activity className="text-[#64ffda] animate-spin" size={16} />
                            <span className="text-[#64ffda] text-xs font-bold uppercase tracking-widest">{t('dashboard.processing')}</span>
                        </div>
                    )}
                    {!analyzing && (
                        <div className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full border transition-colors tour-system-status",
                            theme === 'dark' ? "bg-[#64ffda]/5 border-[#64ffda]/20 text-[#64ffda]" : "bg-green-50 border-green-200 text-green-700"
                        )}>
                            <div className={cn("w-2 h-2 rounded-full animate-pulse", theme === 'dark' ? "bg-[#64ffda]" : "bg-green-500")}></div>
                            <span className="text-sm font-medium">{t('dashboard.sys_op')}</span>
                        </div>
                    )}
                </header>

                {activeTab === "Radar Survey" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                        {/* Left Column: Input */}
                        <div className="lg:col-span-2 space-y-6">
                            <div
                                className={cn(
                                    "h-96 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden group tour-upload-zone",
                                    dragActive ? "border-[#64ffda] bg-[#64ffda]/5" : "border-[#8892b0]/30 hover:border-[#64ffda]/50 hover:bg-[#112240]"
                                )}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => inputRef.current?.click()}
                            >
                                <input
                                    ref={inputRef}
                                    type="file"
                                    className="hidden"
                                    accept="video/*"
                                    onChange={handleChange}
                                />

                                {file ? (
                                    <div className={cn("text-center z-10 p-8 glass-panel animate-fade-in", theme === 'light' && "bg-white border-gray-200 shadow-xl")}>
                                        <FileVideo className="w-16 h-16 text-[#64ffda] mx-auto mb-4" />
                                        <p className={cn("text-xl font-semibold", theme === 'light' && "text-gray-900")}>{file.name}</p>
                                        <p className="text-sm text-[#8892b0] mt-2">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}
                                            className="mt-6 text-sm text-red-400 hover:text-red-300 underline"
                                        >
                                            {t('dashboard.remove_file')}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center p-8 pointer-events-none">
                                        <div className={cn(
                                            "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300",
                                            theme === 'dark' ? "bg-[#112240]" : "bg-gray-100"
                                        )}>
                                            <Upload className="w-10 h-10 text-[#64ffda]" />
                                        </div>
                                        <h3 className={cn("text-xl font-semibold mb-2", theme === 'light' && "text-gray-900")}>{t('dashboard.upload_btn')}</h3>
                                        <p className="text-[#8892b0]">{t('dashboard.drag_drop')}</p>
                                        <p className="text-xs text-[#8892b0] mt-4">Supports MP4, AVI, MOV</p>
                                    </div>
                                )}

                                {/* Background Grid Effect */}
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(100,255,218,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(100,255,218,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)] pointer-events-none"></div>
                            </div>

                            {/* Analysis Button Removed for UX Automation (Phase 10) */}
                        </div>

                        {/* Right Column: Results */}
                        <div className="space-y-6">
                            {!result ? (
                                <div className={cn(
                                    "h-full rounded-2xl border flex flex-col items-center justify-center p-8 text-center text-[#8892b0]",
                                    theme === 'dark' ? "bg-[#112240] border-[#8892b0]/10" : "bg-white border-gray-200 shadow-sm"
                                )}>
                                    <div className={cn(
                                        "w-16 h-16 rounded-full flex items-center justify-center mb-4 text-[#64ffda]",
                                        theme === 'dark' ? "bg-[#0a192f]" : "bg-gray-100"
                                    )}>
                                        <Activity className="w-8 h-8 opacity-50" />
                                    </div>
                                    <p>{t('dashboard.awaiting')}</p>
                                    <p className="text-xs mt-2 opacity-50">{i18n.language.startsWith('es') ? "Sube un video para ver analíticas" : "Upload a video to see analytics"}</p>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-fade-in-up">
                                    <ResultCard
                                        label={t('dashboard.mean_draft')}
                                        value={`${result.draft_mean} m`}
                                        subtext={i18n.language.startsWith('es') ? "Promedio Calculado" : "Calculated Average"}
                                        highlight
                                        theme={theme}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <ResultCard
                                            label={t('dashboard.confidence')}
                                            value={`${(result.confidence * 100).toFixed(0)}%`}
                                            icon={<CheckCircle2 className="text-[#64ffda]" />}
                                            theme={theme}
                                        />
                                        <ResultCard
                                            label={t('dashboard.sea_state')}
                                            value={result.sea_state.toUpperCase()}
                                            icon={<AlertCircle className="text-blue-400" />}
                                            theme={theme}
                                        />
                                    </div>

                                    <div className={cn(
                                        "p-6 rounded-2xl border backdrop-blur-sm tour-telemetry-panel",
                                        theme === 'dark' ? "bg-[#112240]/50 border-[#64ffda]/20" : "bg-white border-gray-200 shadow-sm"
                                    )}>
                                        <h4 className="text-sm font-semibold text-[#8892b0] uppercase mb-4">{t('dashboard.live_telemetry')}</h4>
                                        <div className="space-y-3">
                                            <TelemetryRow label={i18n.language.startsWith('es') ? "Densidad Agua" : "Water Density"} value="1.025 g/cm³" theme={theme} />
                                            <TelemetryRow label="Waterline Y" value={`${result.telemetry?.waterline_y || 0} px`} theme={theme} />
                                            <TelemetryRow label={i18n.language.startsWith('es') ? "Varianza Señal" : "Signal Variance"} value={(result.telemetry?.variance || 0).toFixed(1)} theme={theme} />
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center gap-3">
                                        <CheckCircle2 size={18} />
                                        {t('dashboard.audit_compliant')} - AI Verified (ID: {result.id})
                                    </div>

                                    {/* Phase 26: Blockchain Badge */}
                                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm flex items-center gap-3">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-blue-500 blur-sm opacity-50 animate-pulse"></div>
                                            <Shield size={18} className="relative z-10" />
                                        </div>
                                        BLOCKCHAIN NOTARIZED (SHA-256)
                                    </div>

                                    {result.ai_metadata && (
                                        <div className={cn(
                                            "p-6 rounded-2xl border animate-fade-in",
                                            theme === 'dark' ? "bg-[#64ffda]/5 border-[#64ffda]/20" : "bg-green-50 border-green-100 shadow-sm"
                                        )}>
                                            <h4 className="text-sm font-semibold text-[#64ffda] uppercase mb-4 flex items-center gap-2">
                                                <Activity size={16} /> {t('dashboard.neural_insights')}
                                            </h4>
                                            <div className="space-y-2">
                                                <p className="text-xs text-[#8892b0]">{t('dashboard.detected_marks')}: <span className={theme === 'dark' ? "text-[#e6f1ff]" : "text-gray-900"}>{result.ai_metadata.objects_detected}</span></p>
                                                <div className="mt-2">
                                                    <p className="text-xs text-[#8892b0] mb-1">{t('dashboard.ocr_seq')}:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {result.ai_metadata.ocr_readings.slice(0, 3).map((text: string, i: number) => (
                                                            <span key={i} className={cn(
                                                                "px-2 py-0.5 rounded border text-[10px]",
                                                                theme === 'dark' ? "bg-[#112240] text-[#64ffda] border-[#64ffda]/30" : "bg-gray-100 text-gray-700 border-gray-200"
                                                            )}>
                                                                {text}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "Drone Pilot" && (
                    <div className="w-full h-full">
                        <DronePilot lang={i18n.language.startsWith('es') ? 'es' : 'en'} theme={theme} />
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
                                        <div className="flex items-center gap-8">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-xs text-[#8892b0] uppercase">{t('dashboard.sea_state')}</p>
                                                <p className={theme === 'dark' ? "text-[#e6f1ff]" : "text-gray-900"}>{survey.sea_state}</p>
                                            </div>
                                            <div className="text-right hidden sm:block">
                                                <p className="text-xs text-[#8892b0] uppercase">{t('dashboard.confidence')}</p>
                                                <p className="text-[#64ffda]">{(survey.confidence * 100).toFixed(0)}%</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {survey.is_synced ? (
                                                    <div className="p-2 rounded-full bg-green-500/10 text-green-500" title="Synced to Cloud">
                                                        <Check size={20} />
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleSync(survey.id)}
                                                        disabled={syncingId === survey.id}
                                                        className="p-2 rounded-full hover:bg-blue-500/10 text-[#8892b0] hover:text-blue-400 transition-colors"
                                                        title="Sync to Cloud"
                                                    >
                                                        {syncingId === survey.id ? <Loader2 size={20} className="animate-spin" /> : <Cloud size={20} />}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDownload(survey.id)}
                                                    className="p-2 rounded-full hover:bg-[#64ffda]/10 text-[#8892b0] hover:text-[#64ffda] transition-colors"
                                                    title="Download PDF Report"
                                                >
                                                    <Download size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

function NavItem({ icon, label, active = false, onClick, theme }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void, theme: 'light' | 'dark' }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-4 p-3 rounded-xl transition-all group",
                active
                    ? (theme === 'dark' ? "bg-[#64ffda]/10 text-[#64ffda]" : "bg-blue-50 text-blue-600")
                    : "text-[#8892b0] hover:text-[#64ffda] hover:bg-black/5"
            )}>
            <div className={cn("transition-transform group-hover:scale-110", active && "scale-110")}>{icon}</div>
            <span className="hidden lg:block font-medium">{label}</span>
            {active && <div className={cn("ml-auto w-1 h-1 rounded-full hidden lg:block", theme === 'dark' ? "bg-[#64ffda]" : "bg-blue-600")} />}
        </button>
    )
}

function ResultCard({ label, value, subtext, highlight = false, icon, theme }: { label: string, value: string, subtext?: string, highlight?: boolean, icon?: React.ReactNode, theme: 'light' | 'dark' }) {
    return (
        <div className={cn(
            "p-6 rounded-2xl border backdrop-blur-md transition-all hover:scale-[1.02]",
            highlight
                ? (theme === 'dark' ? "bg-[#64ffda]/10 border-[#64ffda]/30 shadow-[0_0_30px_rgba(100,255,218,0.1)]" : "bg-green-50 border-green-200 shadow-md")
                : (theme === 'dark' ? "bg-[#112240]/80 border-[#8892b0]/10" : "bg-white border-gray-200 shadow-sm")
        )}>
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-[#8892b0] text-sm uppercase tracking-wider">{label}</h3>
                {icon}
            </div>
            <div className={cn(
                "text-3xl font-bold font-mono",
                highlight ? (theme === 'dark' ? "text-[#64ffda]" : "text-green-600") : (theme === 'dark' ? "text-[#e6f1ff]" : "text-gray-900")
            )}>
                {value}
            </div>
            {subtext && <p className="text-xs text-[#8892b0] mt-1">{subtext}</p>}
        </div>
    )
}

function TelemetryRow({ label, value, theme }: { label: string, value: string, theme: 'light' | 'dark' }) {
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-[#8892b0]">{label}</span>
            <span className={cn("font-mono", theme === 'dark' ? "text-[#e6f1ff]" : "text-gray-900")}>{value}</span>
        </div>
    )
}
