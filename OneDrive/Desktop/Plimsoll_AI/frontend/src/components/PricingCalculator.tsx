import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, TrendingDown, Check, Ship } from 'lucide-react';

export default function PricingCalculator() {
    const [dwt, setDwt] = useState(50000); // Deadweight Tonnage
    const [tier, setTier] = useState<'standard' | 'enterprise'>('standard');
    const [quote, setQuote] = useState({
        perSurvey: 0,
        annual: 0,
        savings: 0
    });

    useEffect(() => {
        // Mock Calculation Logic (mirroring backend for instant UI feedback)
        const base = 500;
        const premium = (dwt / 10000) * 50;
        let price = base + premium;

        if (tier === 'enterprise') price *= 1.5;
        if (price > 3000) price = 3000;

        const manualCost = 1200 + 500 + 1000; // Survey + Launch + Delay
        const savingsPerSurvey = manualCost - price;

        setQuote({
            perSurvey: Math.round(price),
            annual: Math.round(price * 10), // 12 for 10
            savings: Math.round(savingsPerSurvey * 12)
        });
    }, [dwt, tier]);

    return (
        <div className="bg-[#112240] rounded-2xl p-8 border border-[#64ffda]/10 shadow-2xl relative overflow-hidden group">
            {/* Gloss Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#64ffda]/5 to-transparent pointer-events-none"></div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Input Section */}
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center gap-3 text-[#64ffda] mb-2">
                            <Calculator size={24} />
                            <h3 className="font-bold text-xl">Smart Quote Engine</h3>
                        </div>
                        <p className="text-[#8892b0] text-sm">
                            Calculate your autonomous survey savings instantly.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-300 flex justify-between">
                            <span>Vessel Deadweight (DWT)</span>
                            <span className="text-[#64ffda] font-mono">{dwt.toLocaleString()} MT</span>
                        </label>
                        <input
                            type="range"
                            min="10000"
                            max="200000"
                            step="5000"
                            value={dwt}
                            onChange={(e) => setDwt(parseInt(e.target.value))}
                            className="w-full h-2 bg-[#0a192f] rounded-lg appearance-none cursor-pointer accent-[#64ffda]"
                        />
                        <div className="flex justify-between text-[10px] text-[#8892b0] font-mono">
                            <span>Handysize (10k)</span>
                            <span>Capesize (200k+)</span>
                        </div>
                    </div>

                    <div className="flex gap-4 p-1 bg-[#0a192f] rounded-lg">
                        <button
                            onClick={() => setTier('standard')}
                            className={`flex-1 py-2 text-xs font-bold rounded transition-all ${tier === 'standard' ? 'bg-[#64ffda] text-[#0a192f]' : 'text-[#8892b0] hover:text-white'}`}
                        >
                            STANDARD
                        </button>
                        <button
                            onClick={() => setTier('enterprise')}
                            className={`flex-1 py-2 text-xs font-bold rounded transition-all ${tier === 'enterprise' ? 'bg-[#64ffda] text-[#0a192f]' : 'text-[#8892b0] hover:text-white'}`}
                        >
                            ENTERPRISE
                        </button>
                    </div>
                </div>

                {/* Output Section */}
                <div className="bg-[#0a192f] rounded-xl p-6 border border-[#64ffda]/20 flex flex-col justify-between relative">
                    <div className="absolute top-4 right-4 text-[#64ffda] opacity-20">
                        <Ship size={64} />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-[#8892b0] uppercase tracking-widest">Per Survey</p>
                            <p className="text-3xl font-mono font-bold text-white">${quote.perSurvey.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[#8892b0] uppercase tracking-widest">Annual Subscription</p>
                            <p className="text-xl font-mono text-[#64ffda]">${quote.annual.toLocaleString()}/yr</p>
                            <p className="text-[10px] text-[#8892b0]">Unlimted users, 12 surveys included</p>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-[#64ffda]/10">
                        <div className="flex items-center gap-3 text-green-400">
                            <div className="p-2 bg-green-500/10 rounded-full">
                                <TrendingDown size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">Estimated Annual Savings</p>
                                <p className="text-2xl font-bold">${quote.savings.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <button className="mt-6 w-full py-3 bg-[#64ffda] text-[#0a192f] font-bold text-sm tracking-widest rounded hover:bg-[#64ffda]/90 transition-colors uppercase">
                        Book Demo & Lock Price
                    </button>
                </div>
            </div>
        </div>
    );
}
