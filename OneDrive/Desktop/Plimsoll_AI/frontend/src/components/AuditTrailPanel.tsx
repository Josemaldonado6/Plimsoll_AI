import { useState } from 'react';
import { ShieldCheck, Info, Calculator, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface AuditStep {
    step: string;
    formula: string;
    inputs: Record<string, any>;
    outputs: Record<string, any>;
}

interface AuditTrailPanelProps {
    trail: AuditStep[];
    visible: boolean;
    theme?: 'light' | 'dark';
}

export default function AuditTrailPanel({ trail, visible, theme = 'dark' }: AuditTrailPanelProps) {
    const [selectedStep, setSelectedStep] = useState<number | null>(null);

    if (!visible || !trail || trail.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "w-full border rounded-2xl overflow-hidden mt-6",
                theme === 'dark' ? "bg-[#020617] border-white/10" : "bg-white border-slate-200 shadow-xl"
            )}
        >
            {/* Header: Legal Certification Style */}
            <div className={cn(
                "p-6 border-b flex items-center justify-between",
                theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
            )}>
                <div className="flex items-center gap-3">
                    <ShieldCheck className={theme === 'dark' ? "text-[#fde047]" : "text-slate-900"} size={24} />
                    <div>
                        <h3 className={cn("font-bold uppercase tracking-widest text-sm", theme === 'dark' ? "text-white" : "text-slate-900")}>UN/ECE Calculation Audit Trail</h3>
                        <p className="text-[#475569] text-[10px] font-mono uppercase">Standard Metric Compliance v2.1 // Nemoto Algorithm</p>
                    </div>
                </div>
                <div className={cn(
                    "px-3 py-1 rounded-full border",
                    theme === 'dark' ? "bg-[#fde047]/10 border-[#fde047]/20" : "bg-slate-900 border-slate-900"
                )}>
                    <span className={cn("text-[10px] font-bold", theme === 'dark' ? "text-[#fde047]" : "text-white")}>CERTIFIED</span>
                </div>
            </div>

            {/* Step Grid */}
            <div className={cn(
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-y",
                theme === 'dark' ? "divide-white/5" : "divide-slate-100"
            )}>
                {trail.map((step, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "p-6 transition-colors cursor-pointer group relative",
                            theme === 'dark' ? "hover:bg-white/5" : "hover:bg-slate-50"
                        )}
                        onClick={() => setSelectedStep(idx)}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[#475569] font-mono text-xs">STEP_{idx + 1}</span>
                            <Calculator size={14} className={cn("transition-colors", theme === 'dark' ? "text-[#94a3b8] group-hover:text-[#fde047]" : "text-slate-400 group-hover:text-slate-900")} />
                        </div>

                        <h4 className={cn("font-bold text-xs mb-2 uppercase tracking-wide", theme === 'dark' ? "text-white" : "text-slate-900")}>{step.step.replace(/_/g, ' ')}</h4>

                        <div className="space-y-1">
                            {Object.entries(step.outputs).map(([key, val]) => (
                                <div key={key} className={cn(
                                    "flex justify-between items-center p-2 rounded",
                                    theme === 'dark' ? "bg-black/40" : "bg-slate-100"
                                )}>
                                    <span className="text-[#475569] text-[10px] font-mono uppercase">{key}</span>
                                    <span className={cn("font-mono font-bold text-xs", theme === 'dark' ? "text-[#fde047]" : "text-slate-900")}>
                                        {typeof val === 'number' ? val.toFixed(4) : val}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Expand Indicator */}
                        <div className="mt-4 flex items-center gap-2 text-[#475569] group-hover:text-slate-400 transition-colors">
                            <Info size={10} />
                            <span className="text-[10px] font-bold uppercase">View Formula</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Formula Detail Modal (Overlay) */}
            <AnimatePresence>
                {selectedStep !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
                        onClick={() => setSelectedStep(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className={cn(
                                "p-8 rounded-3xl max-w-lg w-full shadow-2xl border",
                                theme === 'dark' ? "bg-[#0f172a] border-[#fde047]/30" : "bg-white border-slate-200"
                            )}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <FileText className={theme === 'dark' ? "text-[#fde047]" : "text-slate-900"} />
                                <h3 className={cn("font-bold uppercase tracking-widest", theme === 'dark' ? "text-white" : "text-slate-900")}>{trail[selectedStep].step.replace(/_/g, ' ')}</h3>
                            </div>

                            <div className={cn(
                                "p-6 rounded-2xl mb-6 border",
                                theme === 'dark' ? "bg-black/50 border-white/5" : "bg-slate-50 border-slate-100"
                            )}>
                                <p className="text-[#475569] text-[10px] font-mono mb-2 uppercase">Naval Formula</p>
                                <p className={cn("font-mono text-lg font-bold leading-relaxed", theme === 'dark' ? "text-[#fde047]" : "text-slate-900")}>
                                    {trail[selectedStep].formula}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-[#475569] text-[10px] font-bold uppercase tracking-widest">Inputs</p>
                                    {Object.entries(trail[selectedStep].inputs).map(([k, v]) => (
                                        <div key={k} className="flex justify-between text-xs">
                                            <span className="text-[#475569] font-mono italic">{k}</span>
                                            <span className={cn("font-mono font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{v}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[#475569] text-[10px] font-bold uppercase tracking-widest">Result</p>
                                    {Object.entries(trail[selectedStep].outputs).map(([k, v]) => (
                                        <div key={k} className="flex justify-between text-xs">
                                            <span className="text-[#475569] font-mono italic">{k}</span>
                                            <span className="text-green-600 font-mono font-bold">{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedStep(null)}
                                className={cn(
                                    "w-full mt-8 font-bold py-3 rounded-xl transition-colors uppercase tracking-widest text-xs",
                                    theme === 'dark' ? "bg-white/5 hover:bg-white/10 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                                )}
                            >
                                Close Audit Step
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
