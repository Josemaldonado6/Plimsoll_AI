import React, { useState } from 'react';
import { Check, Shield, Zap, Globe, Package, ArrowRight, X } from 'lucide-react';
import { ENTERPRISE_PLANS, CommercialCortex } from '../../services/StripeCommercial';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface OnboardingProps {
    isOpen: boolean;
    onClose: () => void;
}

export const EnterpriseOnboarding: React.FC<OnboardingProps> = ({ isOpen, onClose }) => {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSelectPlan = async (planId: string) => {
        setLoadingPlan(planId);
        try {
            const result: any = await CommercialCortex.createCheckoutSession(planId);
            if (result.success) {
                // In a real app, window.location.href = result.url;
                alert(`Redirecting to Stripe Checkout for ${planId}...`);
            }
        } catch (error) {
            console.error("Checkout failed", error);
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="relative w-full max-w-6xl bg-[#0d1117] border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[800px]">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors z-20"
                >
                    <X size={24} />
                </button>

                {/* Left Side: Strategic Value */}
                <div className="md:w-1/3 bg-slate-900/50 p-12 flex flex-col justify-between border-r border-white/5">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-8">
                            <Zap size={12} />
                            Phase 5: The Singularity
                        </div>
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-6">
                            Upgrade to <span className="text-yellow-400">Mexican Port</span> Sovereign
                        </h2>
                        <p className="text-slate-400 font-medium leading-relaxed">
                            Deploy the SHA-256 "Seal of Truth" and Nemoto Trim Math across your custom agencies. Transition from local surveys to a global maritime intelligence protocol.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-blue-400">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h4 className="text-white text-xs font-bold uppercase tracking-widest">ISO 17020 Hardened</h4>
                                <p className="text-[10px] text-slate-500 font-medium">Compliance-grade audit logs.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-emerald-400">
                                <Globe size={20} />
                            </div>
                            <div>
                                <h4 className="text-white text-xs font-bold uppercase tracking-widest">Global Fleet Sync</h4>
                                <p className="text-[10px] text-slate-500 font-medium">Coordinate 1,000+ vessels live.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Plans */}
                <div className="md:w-2/3 p-12 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                        {ENTERPRISE_PLANS.map((plan) => (
                            <div
                                key={plan.id}
                                className={cn(
                                    "p-8 rounded-[2rem] border transition-all flex flex-col justify-between",
                                    plan.highlight
                                        ? "bg-yellow-400/5 border-yellow-400/30 ring-1 ring-yellow-400/20 shadow-xl shadow-yellow-400/5"
                                        : "bg-white/5 border-white/5 hover:border-white/10"
                                )}
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={cn(
                                            "p-3 rounded-2xl",
                                            plan.highlight ? "bg-yellow-400 text-black" : "bg-slate-800 text-slate-400"
                                        )}>
                                            <Package size={20} />
                                        </div>
                                        {plan.highlight && (
                                            <span className="text-[8px] font-black text-yellow-400 uppercase tracking-widest py-1 px-2 rounded-full border border-yellow-400/20 bg-yellow-400/5">
                                                Most Popular
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-white font-black text-lg uppercase tracking-tight mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-8">
                                        <span className="text-2xl font-black text-white">${plan.price}</span>
                                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">/ {plan.interval}</span>
                                    </div>

                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <div className="mt-1 p-0.5 rounded-full bg-emerald-500/20 text-emerald-500">
                                                    <Check size={10} />
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide leading-tight">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    onClick={() => handleSelectPlan(plan.id)}
                                    disabled={loadingPlan !== null}
                                    className={cn(
                                        "w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                                        plan.highlight
                                            ? "bg-yellow-400 text-black hover:bg-yellow-300 shadow-lg shadow-yellow-400/10"
                                            : "bg-white/5 text-white hover:bg-white/10 border border-white/10",
                                        loadingPlan === plan.id && "animate-pulse"
                                    )}
                                >
                                    {loadingPlan === plan.id ? 'Initializing...' : 'Deploy Solution'}
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
