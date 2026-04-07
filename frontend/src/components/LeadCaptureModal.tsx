import React, { useState } from 'react';
import { X, Send, ShieldCheck } from 'lucide-react';
import { EfficiencyAuditReport } from './EfficiencyAuditReport';

interface LeadCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    simData: {
        dwt: number;
        savings: number;
    };
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({ isOpen, onClose, simData }) => {
    const [step, setStep] = useState<'form' | 'report'>('form');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        vessel: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate lead capture processing
        setStep('report');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-10"
                >
                    <X size={24} />
                </button>

                {step === 'form' ? (
                    <div className="p-8 md:p-12 text-center">
                        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-400/20 bg-yellow-400/5 text-yellow-400 text-[10px] font-black uppercase tracking-widest">
                            <ShieldCheck size={14} />
                            Strategic Insight Access
                        </div>

                        <h2 className="text-4xl font-black tracking-tighter text-white mb-4 uppercase">
                            Lock in your Efficiency Audit
                        </h2>
                        <p className="text-slate-400 max-w-md mx-auto mb-12">
                            Enter your details to generate a custom ISO 17020 alignment report for your fleet operations.
                        </p>

                        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6 text-left">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Vessel Name / IMO</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. MV PACIFIC LEGACY"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-yellow-400 transition-colors"
                                    value={formData.vessel}
                                    onChange={(e) => setFormData({ ...formData, vessel: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-yellow-400 transition-colors"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Corporate Email</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="john@company.com"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-yellow-400 transition-colors"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-yellow-400 text-black font-black py-5 rounded-xl uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-yellow-300 transition-colors"
                            >
                                GENERATE AUDIT
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="p-4 md:p-8 animate-in fade-in zoom-in duration-500">
                        <EfficiencyAuditReport data={{
                            vesselName: formData.vessel || "UNNAMED VESSEL",
                            dwt: simData.dwt,
                            currentEfficiency: 92,
                            projectedEfficiency: 99.9,
                            annualSaving: simData.savings
                        }} />
                    </div>
                )}
            </div>
        </div>
    );
};
