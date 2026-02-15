import { useState, useEffect } from 'react';
import { Activity, Cpu, Zap, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import SoundFX from '../utils/SoundFX';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface TelemetryData {
    draft_mean?: number;
    displacement?: number;
    confidence?: number;
    physics?: {
        trim: number;
        list: number;
        density: number;
    };
    telemetry?: {
        variance: number;
    };
    blockchain_proof?: {
        tx_id: string;
        content_hash: string;
        status: string;
    };
}

export default function TelemetryPanel({ visible = true, data }: { visible?: boolean; data?: TelemetryData | null }) {
    const [expanded, setExpanded] = useState(true);
    const [metrics, setMetrics] = useState({
        frameId: 0,
        luminance: 450,
        wavePeak: 12,
        waveTrough: -11,
        damping: 0.98,
        mean: 9.501,
        roll: 0.4,
        pitch: 0.1,
        confidence: 99.9,
        displacement: 0,
        density: 1.025,
        txId: "",
        isVerified: false
    });

    // Effect: Handle Data Updates vs Simulation
    useEffect(() => {
        if (!visible) return;

        // If we have Real Completed Data, show it static (or gently breathing)
        if (data) {
            setMetrics(prev => ({
                frameId: 999999, // Finalized
                luminance: 450, // Standard
                wavePeak: 0, // Calm
                waveTrough: 0,
                damping: 1.0,
                mean: data.draft_mean || 0,
                roll: data.physics?.list || 0,
                pitch: data.physics?.trim || 0,
                confidence: (data.confidence || 0.95) * 100,
                displacement: data.displacement || 0,
                density: data.physics?.density || 1.025,
                txId: data.blockchain_proof?.tx_id || "",
                isVerified: !!data.blockchain_proof
            }));
            return;
        }

        // ... (Simulation logic remains same) ...
        const interval = setInterval(() => {
            setMetrics(prev => ({
                frameId: prev.frameId + 1,
                luminance: 440 + Math.random() * 20,
                wavePeak: 10 + Math.random() * 5,
                waveTrough: -10 - Math.random() * 5,
                damping: 0.95 + Math.random() * 0.04,
                mean: 9.5 + (Math.random() - 0.5) * 0.02,
                roll: 0.4 + (Math.random() - 0.5) * 0.1,
                pitch: 0.1 + (Math.random() - 0.5) * 0.05,
                confidence: 99.0 + Math.random(),
                displacement: 45000 + Math.random() * 100,
                density: 1.025,
                txId: "",
                isVerified: false
            }));
        }, 16); // ~60fps

        return () => clearInterval(interval);
    }, [visible, data]);

    // Setup initial sound
    useEffect(() => {
        if (visible) {
            // SoundFX.playSuccess(); // Maybe too intrusive on load
        }
    }, [visible]);

    const handleToggle = () => {
        SoundFX.playClick();
        setExpanded(!expanded);
    };

    if (!visible) return null;

    return (
        <div className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ease-out font-mono text-xs shadow-[0_0_50px_rgba(100,255,218,0.1)]",
            expanded ? "w-[90%] max-w-4xl" : "w-auto"
        )}
            onMouseEnter={() => SoundFX.playHover()}
        >
            {/* Main Bar Container */}
            <div className={`bg-[#0a192f]/95 border ${metrics.isVerified ? 'border-green-500/50' : 'border-[#64ffda]/30'} rounded-xl backdrop-blur-xl overflow-hidden flex flex-col md:flex-row transition-colors duration-500 relative`}>

                {/* Holographic Scanline Overlay */}
                <div className="absolute inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-10"></div>

                {/* Header / Toggle */}
                <div
                    className="bg-[#112240]/80 border-b md:border-b-0 md:border-r border-[#64ffda]/30 p-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#112240] transition-colors min-w-[180px] relative z-10"
                    onClick={handleToggle}
                >
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className={`w-2 h-2 rounded-full ${metrics.isVerified ? 'bg-green-400' : 'bg-[#64ffda]'} animate-pulse`}></div>
                            <div className={`absolute inset-0 w-2 h-2 rounded-full ${metrics.isVerified ? 'bg-green-400' : 'bg-[#64ffda]'} animate-ping opacity-75`}></div>
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className={`${metrics.isVerified ? 'text-green-400' : 'text-[#64ffda]'} font-bold tracking-widest text-[10px]`}>
                                {metrics.isVerified ? 'VERIFIED' : 'AI_VISION'}
                            </span>
                            <span className="text-[#8892b0] text-[8px] tracking-tighter">CORE v2.1.0</span>
                        </div>
                    </div>
                    {expanded ? <ChevronDown size={14} className="text-[#64ffda] md:-rotate-90" /> : <ChevronUp size={14} className="text-[#64ffda] md:rotate-90" />}
                </div>

                {/* Expanded Content (Horizontal Grid) */}
                {expanded && (
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#64ffda]/20 relative z-10">
                        {/* Section 1: Optical */}
                        <div className="p-3 space-y-2 relative group">
                            <div className="absolute inset-0 bg-[#64ffda]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                            <div className="flex items-center gap-2 text-[#64ffda]/70 mb-1">
                                <Zap size={10} />
                                <span className="font-bold text-[9px]">OPTICAL_SENSOR</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-[9px] text-[#8892b0]">FRAME_ID</div>
                                    <div className="text-white font-bold">{metrics.frameId.toString().padStart(6, '0')}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[9px] text-[#8892b0]">LUMINANCE</div>
                                    <div className="text-[#64ffda] font-bold">{metrics.luminance.toFixed(0)} lx</div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Wave Physics */}
                        <div className="p-3 space-y-2 relative group">
                            <div className="absolute inset-0 bg-[#64ffda]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                            <div className="flex items-center gap-2 text-[#64ffda]/70 mb-1">
                                <Activity size={10} />
                                <span className="font-bold text-[9px]">WAVE_CALC_ENGINE</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <div className="text-[9px] text-[#8892b0]">AMPLITUDE</div>
                                    <div className="text-white">±{(metrics.wavePeak - metrics.waveTrough).toFixed(1)}cm</div>
                                </div>
                                <div>
                                    <div className="text-[9px] text-[#8892b0]">STATE</div>
                                    <div className="text-yellow-400 animate-pulse font-bold">MODERATE</div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Stability */}
                        <div className="p-3 space-y-2 relative group">
                            <div className="absolute inset-0 bg-[#64ffda]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                            <div className="flex items-center gap-2 text-[#64ffda]/70 mb-1">
                                <Cpu size={10} />
                                <span className="font-bold text-[9px]">GYRO_STABILIZATION</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex justify-between text-[9px] text-[#8892b0] mb-1">
                                        <span>ROLL</span>
                                        <span>{metrics.roll.toFixed(1)}°</span>
                                    </div>
                                    <div className="h-1 bg-[#112240] rounded-full overflow-hidden">
                                        <div className="h-full bg-[#64ffda]" style={{ width: `${50 + (metrics.roll * 10)}%` }}></div>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between text-[9px] text-[#8892b0] mb-1">
                                        <span>PITCH</span>
                                        <span>{metrics.pitch.toFixed(1)}°</span>
                                    </div>
                                    <div className="h-1 bg-[#112240] rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-400" style={{ width: `${50 + (metrics.pitch * 10)}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Minimized Info */}
                {!expanded && (
                    <div className="flex items-center gap-4 px-4 py-2 relative z-10">
                        <div className="flex flex-col">
                            <span className="text-[9px] text-[#8892b0]">STATUS</span>
                            <span className="text-[#64ffda] animate-pulse">PROCESSING</span>
                        </div>
                    </div>
                )}

                {/* Blockchain Security Footer */}
                {expanded && (
                    <div className="bg-[#020c1b] py-1 px-4 flex justify-between items-center text-[8px] text-[#8892b0] relative z-20">
                        <div className="flex items-center gap-2">
                            {metrics.isVerified ? (
                                <>
                                    <Lock size={8} className="text-green-400" />
                                    <span className="text-green-400 font-bold">BLOCKCHAIN NOTARIZED // TX: {metrics.txId.substring(0, 16)}...</span>
                                </>
                            ) : (
                                <>
                                    <Lock size={8} className="text-[#64ffda]" />
                                    <span>ENCRYPTED_TLS_1.3 // 256-BIT AES</span>
                                </>
                            )}
                        </div>
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className={`w-0.5 h-2 ${metrics.isVerified ? 'bg-green-400' : 'bg-[#64ffda]'}`} style={{ opacity: 0.2 + (i * 0.15), animation: `pulse 1s infinite ${i * 100}ms` }}></div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
