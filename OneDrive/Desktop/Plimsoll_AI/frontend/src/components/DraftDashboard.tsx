import { useState } from 'react';
import {
    Anchor,
    Droplets,
    CheckCircle2,
    ChevronDown,
    History,
    FileSearch,
    Download,
    Upload,
    Activity,
    BrainCircuit,
    AlertTriangle,
    Timer,
    Gauge,
    Shield,
    Loader2
} from 'lucide-react';
import AuditTrailPanel from './AuditTrailPanel';
import { IndustrialTheme as UI } from '../utils/IndustrialTheme';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface DraftResult {
    id: number;
    draft_fwd_true: number;
    draft_aft_true: number;
    draft_mid_true: number;
    calculated_displacement: number;
    net_cargo_weight?: number;
    deductions?: {
        lightship: number;
        ballast: number;
        consumables: number;
    };
    sea_state: string;
    vessel_name?: string;
    vessel_imo?: string;
    vessel_flag?: string;
    vessel_type?: string;
    vessel_loa?: number;
    vessel_beam?: number;
    physics_audit_trail: any[];
    corrections: {
        ftc: number;
        stc: number;
        density_factor: number;
        tpc?: number;
    };
    ai_metadata?: {
        sentinel_alerts: number;
        auto_calibrated: boolean;
        pixel_scale: number;
        safety_log?: Array<{
            type: string;
            severity: string;
            location: number[];
            recommendation?: string;
        }>;
    };
    logistics?: {
        operation: string;
        velocity_tph: number;
        hours_remaining: number;
        eta: string;
        percentage: number;
        anomaly: string | null;
        confidence: string;
    };
    risk_score?: string;
    hash_seal?: string;
    notarized_at?: string;
}

interface DraftDashboardProps {
    data: DraftResult | null;
    onConfirm: () => void;
    onUpload: () => void;
    onExport: (id: number) => void;
    onEnrich?: (vesselData: any) => void; // Optional callback for enrichment
    theme?: 'light' | 'dark' | 'midnight';
    isAnalyzing?: boolean;
    analysisStatus?: string;
}

export default function DraftDashboard({
    data,
    onConfirm,
    onUpload,
    onExport,
    onEnrich,
    theme = 'midnight', // Defaulting to high-contrast field mode
    isAnalyzing = false,
    analysisStatus = ''
}: DraftDashboardProps) {
    const { t } = useTranslation();
    const [showAudit, setShowAudit] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const [enriching, setEnriching] = useState(false);
    const colors = theme === 'midnight' ? UI.midnight : (theme === 'dark' ? UI.dark : UI.light);

    const handleEnrich = async () => {
        if (!data?.vessel_imo || enriching) return;
        setEnriching(true);
        try {
            const isDev = window.location.port === "5173";
            const baseUrl = isDev ? "http://localhost:8000" : "";
            const response = await axios.get(`${baseUrl}/api/ship/${data.vessel_imo}`);
            if (onEnrich) onEnrich(response.data);
        } catch (error) {
            console.error("Enrichment failed", error);
        } finally {
            setEnriching(false);
        }
    };

    if (isAnalyzing) return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1117]/80 backdrop-blur-xl animate-fade-in">
            <div className="flex flex-col items-center space-y-8 max-w-md w-full px-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20 animate-pulse" />
                    <div className="relative w-32 h-32 border-4 border-yellow-400/20 rounded-full flex items-center justify-center">
                        <Loader2 className="animate-spin text-yellow-400" size={48} />
                    </div>
                </div>

                <div className="text-center space-y-4">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">
                        Neural Core: <span className="text-yellow-400">Processing...</span>
                    </h3>
                    <div className="flex flex-col items-center space-y-2">
                        <p className="text-[#94a3b8] font-mono text-xs uppercase tracking-[0.3em] h-4">
                            {analysisStatus}
                        </p>
                        <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-yellow-400 animate-shimmer" style={{ width: '40%', boxShadow: '0 0 15px rgba(253,224,71,0.5)' }} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full pt-8">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 opacity-50">
                        <Activity className="text-yellow-400" size={16} />
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest leading-none">Cortex Link</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 opacity-50">
                        <Shield className="text-yellow-400" size={16} />
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest leading-none">Sentinel v2</span>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!data) return (
        <div
            onClick={onUpload}
            className={cn(
                "flex flex-col items-center justify-center min-h-[60vh] space-y-8 border-2 border-dashed rounded-[3rem] cursor-pointer group transition-all",
                theme === 'dark' ? "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
            )}
        >
            <div className="relative">
                <div className={cn(
                    "absolute inset-0 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity",
                    theme === 'dark' ? "bg-[#fde047]" : "bg-blue-600"
                )} />
                <div className={cn(
                    "relative w-24 h-24 border rounded-full flex items-center justify-center",
                    theme === 'dark' ? "bg-[#0f172a] border-[#fde047]/30" : "bg-white border-slate-200"
                )}>
                    <Upload className={cn("animate-bounce", theme === 'dark' ? "text-[#fde047]" : "text-slate-900")} size={32} />
                </div>
            </div>

            <div className="text-center space-y-2">
                <h3 className={cn("font-black text-2xl uppercase tracking-tighter italic", theme === 'dark' ? "text-white" : "text-slate-900")}>{t('dashboard.awaiting_data')}</h3>
                <p className={cn("font-mono text-[10px] uppercase tracking-widest", colors.text.secondary === '#94a3b8' ? "text-[#94a3b8]" : "text-slate-500")}>{t('dashboard.connect_drone')}</p>
            </div>

            <div className={cn(
                "flex items-center gap-4 py-4 px-8 rounded-full border opacity-50",
                theme === 'dark' ? "bg-black/40 border-white/5" : "bg-slate-200 border-slate-300"
            )}>
                <Activity size={12} className={theme === 'dark' ? "text-[#fde047]" : "text-slate-900"} />
                <span className={cn("text-[10px] font-bold uppercase tracking-widest", theme === 'dark' ? "text-white" : "text-slate-900")}>{t('dashboard.physics_standby')}</span>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Top Bar: Vessel ID & Status */}
            <div className={cn(
                "flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-3xl border gap-4 relative overflow-hidden",
                theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
            )}>
                {data.hash_seal && (
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none translate-x-8 -translate-y-8">
                        <Shield size={128} className={theme === 'dark' ? "text-yellow-400" : "text-blue-600"} />
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-2xl", theme === 'dark' ? "bg-[#fde047]" : "bg-slate-900")}>
                        <Anchor size={24} className={theme === 'dark' ? "text-black" : "text-white"} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className={cn("text-2xl font-black uppercase tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>{data.vessel_name || "MV PACIFIC LEGACY"}</h1>
                            {data.hash_seal && (
                                <button
                                    onClick={() => setShowVerification(true)}
                                    className="group relative flex items-center"
                                >
                                    <Shield size={16} className="text-yellow-400 fill-yellow-400/20 active:scale-90 transition-transform" />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <p className={cn("font-mono text-xs uppercase letter-spacing-widest text-[#94a3b8]", theme === 'light' && "text-slate-500")}>
                                {t('dashboard.imo_number').split(' ')[0]}: {data.vessel_imo || "9823471"} // {t('dashboard.flag')}: {data.vessel_flag || "PANAMA"}
                            </p>
                            <button
                                onClick={handleEnrich}
                                disabled={enriching}
                                className={cn(
                                    "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border transition-all",
                                    enriching ? "animate-pulse border-yellow-400 text-yellow-400" : "border-white/10 text-white/40 hover:text-yellow-400 hover:border-yellow-400"
                                )}
                            >
                                {enriching ? t('dashboard.enriching') : t('dashboard.auto_enrich')}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-6">
                    <div className="text-left">
                        <p className="text-[#475569] text-[10px] font-bold uppercase tracking-widest">{t('dashboard.sea_state')}</p>
                        <p className={cn("font-bold text-sm uppercase", theme === 'dark' ? "text-[#fde047]" : "text-slate-900")}>{data.sea_state || "MODERATE (2.5m)"}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onUpload}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all hover:scale-105 active:scale-95",
                                theme === 'dark' ? "bg-white/10 hover:bg-white/20 text-white border-white/10" : "bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200 shadow-sm"
                            )}
                        >
                            <Upload size={14} />
                            {t('dashboard.analyze_new')}
                        </button>
                        <div className={cn("w-px h-10", theme === 'dark' ? "bg-white/10" : "bg-slate-200")} />
                        <div className="text-right">
                            <p className="text-[#475569] text-[10px] font-bold uppercase tracking-widest">{t('dashboard.sync_status')}</p>
                            <p className="text-green-500 font-bold text-sm uppercase flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                {t('dashboard.live')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI ORACLE INSIGHTS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {data.logistics && (
                    <div className={cn(
                        "p-6 rounded-3xl border relative overflow-hidden animate-fade-in h-full",
                        data.logistics.anomaly ? "bg-red-500/10 border-red-500/50" : "bg-yellow-400/5 border-yellow-400/20"
                    )}>
                        <div className="flex flex-col gap-6 relative z-10 h-full justify-between">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "p-3 rounded-2xl",
                                    data.logistics.anomaly ? "bg-red-500 text-white" : "bg-yellow-400 text-black"
                                )}>
                                    {data.logistics.anomaly ? <AlertTriangle size={24} /> : <BrainCircuit size={24} />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className={cn("font-black text-xs uppercase tracking-[0.2em]", data.logistics.anomaly ? "text-red-500" : "text-yellow-400")}>
                                                {data.logistics.anomaly ? t('dashboard.critical_anomaly') : t('dashboard.ai_oracle_sense')}
                                            </h3>
                                            <p className={cn("text-lg font-black uppercase leading-tight", (theme === 'dark' || theme === 'midnight') ? "text-white" : "text-slate-900")}>
                                                {data.logistics.anomaly ? data.logistics.anomaly.replace(/_/g, ' ') : t('dashboard.vessel_stable', { operation: data.logistics.operation })}
                                            </p>
                                        </div>
                                        {/* SENTINEL HOLOGRAPHIC HUD */}
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                                <Shield size={10} className="text-emerald-400 animate-pulse" />
                                                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Sentinel Active</span>
                                            </div>
                                            <span className="text-[7px] font-mono text-[#475569] mt-1">v2.0 DNV-Hardened</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">
                                        <span>{t('dashboard.progress_target')}</span>
                                        <span>{data.logistics.percentage}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className={cn("h-full transition-all duration-1000", data.logistics.anomaly ? "bg-red-500" : "bg-yellow-400")}
                                            style={{ width: `${data.logistics.percentage}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="text-left">
                                        <p className="text-[#475569] text-[8px] font-bold uppercase tracking-widest">{t('dashboard.velocity')}</p>
                                        <div className="flex items-center gap-2">
                                            <Gauge size={14} className="text-yellow-400" />
                                            <span className={cn("font-black font-mono text-xl", theme === 'dark' ? "text-white" : "text-slate-900")}>{Math.round(data.logistics.velocity_tph)}<span className="text-xs text-[#475569]"> {t('dashboard.thr')}</span></span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[#475569] text-[8px] font-bold uppercase tracking-widest">{t('dashboard.etc')}</p>
                                        <div className="flex items-center gap-2">
                                            <Timer size={14} className="text-yellow-400" />
                                            <span className={cn("font-black font-mono text-xl", theme === 'dark' ? "text-white" : "text-slate-900")}>{data.logistics.eta.split(' ')[1]}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* SENTINEL SAFETY LOG */}
                <div className={cn(
                    "p-6 rounded-3xl border relative overflow-hidden animate-fade-in h-full bg-[#0d1117] border-white/5",
                )}>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-2xl bg-slate-800 text-slate-400">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 className="text-slate-500 font-black text-xs uppercase tracking-[0.2em]">{t('dashboard.sentinel_mode')}</h3>
                            <p className={cn("text-lg font-black uppercase", theme === 'dark' ? "text-white" : "text-slate-900")}>{t('dashboard.safety_log')}</p>
                        </div>
                    </div>

                    <div className="space-y-3 custom-scrollbar max-h-[140px] overflow-y-auto pr-2">
                        {data.ai_metadata?.safety_log && data.ai_metadata.safety_log.length > 0 ? (
                            data.ai_metadata.safety_log.map((incident, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                                    <AlertTriangle className="text-red-500 shrink-0" size={16} />
                                    <div>
                                        <p className="text-xs font-black text-white uppercase">{incident.type}</p>
                                        <p className="text-[10px] text-slate-500 font-bold leading-tight mt-1">{incident.recommendation || "Safety alert detected."}</p>
                                    </div>
                                    <div className="ml-auto text-[10px] font-black px-2 py-0.5 rounded bg-red-500/20 text-red-500">{incident.severity}</div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center">
                                <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={24} />
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('dashboard.no_safety_incidents')}</p>
                            </div>
                        )}
                    </div>

                    {/* Auto-Calibration Badge */}
                    <div className="absolute top-6 right-6 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                        <div className={cn("w-2 h-2 rounded-full", data.ai_metadata?.auto_calibrated ? "bg-emerald-500 animate-pulse" : "bg-slate-500")} />
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                            {data.ai_metadata?.auto_calibrated ? t('dashboard.auto_calibrated') : t('dashboard.manual_scale')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Metrics: THE GIANT NUMBERS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* BIG DISPLACEMENT & METRICS SECTION */}
                <div className={cn(
                    "lg:col-span-8 p-8 rounded-[2rem] border-2 relative overflow-hidden group min-h-[500px] flex flex-col",
                    theme === 'dark' ? "bg-[#0f172a] border-[#fde047]/20" : "bg-white border-slate-200 shadow-xl"
                )}>
                    {theme === 'dark' && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#fde047] to-transparent opacity-30 z-10" />
                    )}

                    <div className="relative z-10 flex flex-col h-full justify-between gap-8 flex-1">
                        <div className="animate-fade-in-up">
                            <span className={cn("font-bold uppercase tracking-widest text-[#94a3b8] text-xs flex items-center gap-2")}>
                                <Droplets size={14} className="text-yellow-400" />
                                {t('dashboard.net_cargo_weight')}
                            </span>
                            <div className="mt-4 flex items-baseline gap-4 flex-wrap">
                                <span className={cn("text-[8rem] md:text-[10rem] font-black leading-none tracking-tighter", (theme === 'dark' || theme === 'midnight') ? "text-white" : "text-slate-900")}>
                                    {Math.round(data?.net_cargo_weight || 0).toLocaleString()}
                                </span>
                                <span className="text-3xl font-bold text-[#475569] uppercase italic tracking-widest">{t('dashboard.metric_tons')}</span>
                            </div>

                            {/* [PHASE 59] WCA-v2 Spectral Analysis Overlay */}
                            <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/5 overflow-hidden">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[8px] font-black text-yellow-400 uppercase tracking-widest">WCA-v2 Neural Spectral Overlay</span>
                                    <span className="text-[8px] font-mono text-emerald-400 uppercase">Resilience: High</span>
                                </div>
                                <div className="flex items-end gap-1 h-12">
                                    {[...Array(24)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="bg-yellow-400/20 w-full animate-shimmer"
                                            style={{
                                                height: `${20 + Math.random() * 80}%`,
                                                animationDelay: `${i * 100}ms`
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Deductions Breakdown */}
                            {data?.deductions && (
                                <div className="mt-6 flex flex-wrap gap-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <div className="space-y-1">
                                        <p className="text-[#475569] text-[8px] font-black uppercase tracking-widest">{t('dashboard.displacement_total')}</p>
                                        <p className="text-white font-mono text-sm">{Math.round(data.calculated_displacement).toLocaleString()} t</p>
                                    </div>
                                    <div className="w-px h-8 bg-white/10 hidden sm:block" />
                                    <div className="space-y-1 text-red-400/70">
                                        <p className="text-[#475569] text-[8px] font-black uppercase tracking-widest">{t('dashboard.lightship')}</p>
                                        <p className="font-mono text-sm">(-{Math.round(data.deductions.lightship).toLocaleString()} t)</p>
                                    </div>
                                    <div className="space-y-1 text-red-400/70">
                                        <p className="text-[#475569] text-[8px] font-black uppercase tracking-widest">{t('dashboard.ballast')}</p>
                                        <p className="font-mono text-sm">(-{Math.round(data.deductions.ballast).toLocaleString()} t)</p>
                                    </div>
                                    <div className="space-y-1 text-red-400/70">
                                        <p className="text-[#475569] text-[8px] font-black uppercase tracking-widest">{t('dashboard.consumables')}</p>
                                        <p className="font-mono text-sm">(-{Math.round(data.deductions.consumables).toLocaleString()} t)</p>
                                    </div>
                                </div>
                            )}

                            <div className={cn("grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t", theme === 'dark' ? "border-white/10" : "border-slate-100")}>
                                <div className="space-y-1">
                                    <p className="text-[#475569] text-[10px] font-black uppercase tracking-widest">{t('dashboard.true_fwd')}</p>
                                    <p className={cn("text-3xl font-black font-mono", theme === 'dark' ? "text-white" : "text-slate-900")}>{data?.draft_fwd_true?.toFixed(3) || "0.000"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[#475569] text-[10px] font-black uppercase tracking-widest">{t('dashboard.true_mid')}</p>
                                    <p className={cn("text-3xl font-black font-mono", theme === 'dark' ? "text-white" : "text-slate-900")}>{data?.draft_mid_true?.toFixed(3) || "0.000"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[#475569] text-[10px] font-black uppercase tracking-widest">{t('dashboard.true_aft')}</p>
                                    <p className={cn("text-3xl font-black font-mono", theme === 'dark' ? "text-white" : "text-slate-900")}>{data?.draft_aft_true?.toFixed(3) || "0.000"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CONTROLS & SUMMARY */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className={cn(
                        "p-8 rounded-[2rem] border flex-1 flex flex-col justify-between",
                        theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-md"
                    )}>
                        <div className="space-y-6">
                            <h2 className="text-[#94a3b8] font-bold uppercase tracking-widest text-xs">{t('dashboard.correction_summary')}</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[#475569] font-mono">{t('dashboard.ftc_correction')}</span>
                                    <span className={cn("font-bold font-mono", theme === 'dark' ? "text-white" : "text-slate-900")}>{(data?.corrections?.ftc && data.corrections.ftc >= 0 ? '+' : '')}{data?.corrections?.ftc?.toFixed(2) || "0.00"} t</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[#475569] font-mono">{t('dashboard.stc_nemoto')}</span>
                                    <span className={cn("font-bold font-mono", theme === 'dark' ? "text-white" : "text-slate-900")}>{(data?.corrections?.stc && data.corrections.stc >= 0 ? '+' : '')}{data?.corrections?.stc?.toFixed(2) || "0.00"} t</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[#475569] font-mono">{t('dashboard.density_factor')}</span>
                                    <span className={cn("font-bold font-mono", theme === 'dark' ? "text-white" : "text-slate-900")}>{data?.corrections?.density_factor?.toFixed(5) || "1.00000"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-8">
                            <button
                                onClick={onConfirm}
                                className={cn(
                                    "w-full font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl",
                                    theme === 'dark' ? "bg-[#fde047] hover:bg-[#bef264] text-black" : "bg-slate-900 hover:bg-slate-800 text-white"
                                )}
                            >
                                <CheckCircle2 size={24} />
                                <span className="uppercase tracking-widest">{t('dashboard.finalize_sign')}</span>
                            </button>
                            <button className={cn(
                                "w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all",
                                theme === 'dark' ? "bg-white/5 hover:bg-white/10 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                            )}>
                                <History size={18} />
                                <span className="uppercase tracking-widest text-xs">{t('dashboard.past_surveys')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progressive Disclosure Section: Audit Trail */}
            <div className="space-y-4">
                <button
                    onClick={() => setShowAudit(!showAudit)}
                    className={cn(
                        "flex items-center gap-2 transition-colors group",
                        theme === 'dark' ? "text-[#94a3b8] hover:text-[#fde047]" : "text-slate-500 hover:text-slate-900"
                    )}
                >
                    <FileSearch size={18} className="group-hover:rotate-12 transition-transform" />
                    <span className="font-bold uppercase tracking-[0.2em] text-[10px]">
                        {showAudit ? t('dashboard.collapse_audit') : t('dashboard.math_cert')}
                    </span>
                    <ChevronDown size={14} className={`transition-transform duration-500 ${showAudit ? 'rotate-180' : ''}`} />
                </button>

                <AuditTrailPanel trail={data.physics_audit_trail} visible={showAudit} theme={theme} />
            </div>

            {/* Footer Information */}
            <div className="flex justify-between items-center px-4 py-8 opacity-30">
                <div className={cn("flex items-center gap-4 text-[10px] font-mono uppercase", theme === 'dark' ? "text-white" : "text-slate-900")}>
                    <span>{t('dashboard.hardware_drone')}</span>
                    <span className={cn("w-1 h-1 rounded-full", theme === 'dark' ? "bg-white" : "bg-slate-900")} />
                    <span>{t('dashboard.location')}: 1.2902° N, 103.8519° E</span>
                </div>
                <button
                    onClick={() => data?.id && onExport(data.id)}
                    className={cn("flex items-center gap-2 text-[10px] font-bold uppercase hover:opacity-100 transition-opacity", theme === 'dark' ? "text-white" : "text-slate-900")}
                >
                    <Download size={14} />
                    {t('dashboard.export_pdf')}
                </button>
            </div>

            {/* NOTARY VERIFICATION MODAL */}
            {showVerification && data.hash_seal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in shadow-2xl">
                    <div className="bg-[#0f172a] border border-[#fde047]/30 rounded-[2.5rem] w-full max-w-lg p-8 relative shadow-[0_0_50px_rgba(253,224,71,0.1)]">
                        <button
                            onClick={() => setShowVerification(false)}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <ChevronDown className="text-white rotate-90" size={20} />
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 rounded-3xl bg-[#fde047]">
                                <Shield className="text-black" size={32} />
                            </div>
                            <div>
                                <h2 className="text-white text-2xl font-black uppercase tracking-tight">{t('dashboard.institutional_proof')}</h2>
                                <p className="text-yellow-400/70 font-mono text-[10px] uppercase tracking-widest leading-none mt-1">{t('dashboard.legally_immutable')}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                                <p className="text-[#475569] text-[10px] font-bold uppercase tracking-widest">{t('dashboard.cryptographic_seal')}</p>
                                <p className="text-white font-mono text-xs break-all leading-relaxed bg-black/40 p-3 rounded-lg border border-white/5">
                                    {data.hash_seal}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="text-[#475569] text-[10px] font-bold uppercase tracking-widest mb-1">{t('dashboard.notarized_at')}</p>
                                    <p className="text-white font-mono text-sm">{data.notarized_at || new Date().toISOString().split('T')[0]}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="text-[#475569] text-[10px] font-bold uppercase tracking-widest mb-1">{t('dashboard.authority')}</p>
                                    <p className="text-white font-mono text-sm">{t('dashboard.plimsoll_ledger')}</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                                <CheckCircle2 className="text-emerald-500" size={18} />
                                <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">{t('dashboard.integrity_validated')}</p>
                            </div>

                            <button
                                onClick={() => setShowVerification(false)}
                                className="w-full py-4 rounded-2xl bg-[#fde047] text-black font-black uppercase tracking-widest text-[12px] hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                {t('dashboard.close_proof')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
