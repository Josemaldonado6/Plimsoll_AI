/*
 * -----------------------------------------------------------------------------
 * PROYECTO: PLIMSOLL AI - MARITIME AUDIT SYSTEM
 * ARCHIVO: DronePilot.tsx
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
import React, { useState, useEffect, useRef } from 'react';
import { Plane, Navigation, Battery, Activity, Compass, Play, ShieldAlert, Wifi, Plus, Trash2, HardDrive } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs))
};

// Utility for API URL
const getApiUrl = (path: string) => {
    const isDev = window.location.port === "5173"
    return isDev ? `http://localhost:8000${path}` : path
}

interface DroneState {
    status: string;
    altitude: number;
    battery: number;
    gps: { lat: number; lng: number };
    gimbal_pitch: number;
    mission: string;
}

interface Waypoint {
    id: number;
    x: number;
    y: number;
}


interface DronePilotProps {
    theme: 'light' | 'dark' | 'midnight';
}

export default function DronePilot({ theme }: DronePilotProps) {
    const { t } = useTranslation();
    const [drone, setDrone] = useState<DroneState>({
        status: "READY",
        altitude: 0,
        battery: 98,
        gps: { lat: 1.2834, lng: 103.8607 },
        gimbal_pitch: -90,
        mission: "IDLE"
    });
    const [connected] = useState(true);
    const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [sdReady, setSdReady] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dronePosRef = useRef({ x: 50, y: 50 });

    // Battery idle drain
    useEffect(() => {
        const interval = setInterval(() => {
            setDrone(prev => ({ ...prev, battery: Math.max(0, prev.battery - 0.01) }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Draw Map & Waypoints
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Background (Grid)
            ctx.strokeStyle = theme === 'dark' ? '#1d2d50' : '#e5e7eb';
            ctx.lineWidth = 1;
            for (let i = 0; i < canvas.width; i += 40) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
            }
            for (let i = 0; i < canvas.height; i += 40) {
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
            }

            // Draw Path
            if (waypoints.length > 0) {
                ctx.beginPath();
                ctx.strokeStyle = '#64ffda';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                // Start from drone position
                ctx.moveTo(dronePosRef.current.x, dronePosRef.current.y);
                waypoints.forEach(wp => ctx.lineTo(wp.x, wp.y));
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // Draw Waypoints
            waypoints.forEach((wp, index) => {
                ctx.beginPath();
                ctx.fillStyle = '#64ffda';
                ctx.arc(wp.x, wp.y, 6, 0, Math.PI * 2);
                ctx.fill();

                // Text
                ctx.fillStyle = theme === 'dark' ? '#fff' : '#000';
                ctx.font = '10px monospace';
                ctx.fillText(`WP${index + 1}`, wp.x + 10, wp.y);
            });

            // Draw Drone
            ctx.save();
            ctx.translate(dronePosRef.current.x, dronePosRef.current.y);
            ctx.fillStyle = '#ef4444'; // Red drone
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(8, 10);
            ctx.lineTo(0, 6);
            ctx.lineTo(-8, 10);
            ctx.closePath();
            ctx.fill();

            // Drone Ripple
            if (isSimulating) {
                ctx.strokeStyle = `rgba(239, 68, 68, ${Math.abs(Math.sin(Date.now() / 200))})`;
                ctx.beginPath();
                ctx.arc(0, 0, 15 + Math.sin(Date.now() / 200) * 5, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();

            requestAnimationFrame(draw);
        };

        const animId = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animId);
    }, [waypoints, theme, isSimulating]);

    const handleMapClick = (e: React.MouseEvent) => {
        if (isSimulating) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setWaypoints(prev => [...prev, { id: Date.now(), x, y }]);
    };

    const clearWaypoints = () => setWaypoints([]);

    const startMission = async () => {
        if (waypoints.length === 0) return;
        setIsSimulating(true);
        setDrone(prev => ({ ...prev, status: "FLYING", mission: "AUTO_SURVEY" }));

        // Simple Animation Logic
        let currentWpIndex = 0;

        const flyToNext = () => {
            if (currentWpIndex >= waypoints.length) {
                setIsSimulating(false);
                setDrone(prev => ({ ...prev, status: "HOVERING", mission: "COMPLETED" }));
                return;
            }

            const target = waypoints[currentWpIndex];
            const dx = target.x - dronePosRef.current.x;
            const dy = target.y - dronePosRef.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 2) {
                currentWpIndex++;
                requestAnimationFrame(flyToNext);
            } else {
                dronePosRef.current.x += (dx / dist) * 2; // Speed
                dronePosRef.current.y += (dy / dist) * 2;
                setDrone(prev => ({
                    ...prev,
                    altitude: 15 + Math.random(),
                    gps: { lat: prev.gps.lat + 0.0001, lng: prev.gps.lng + 0.0001 }
                }));
                requestAnimationFrame(flyToNext);
            }
        };

        flyToNext();
    };

    const [nightVision, setNightVision] = useState(false);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full p-2">
            {/* Left: Telemetry & Controls */}
            <div className="lg:col-span-1 space-y-6 flex flex-col">
                <div className={cn(
                    "rounded-2xl p-6 border transition-colors duration-300",
                    theme === 'midnight' ? "bg-black border-yellow-400/20" : (theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-gray-200 shadow-sm")
                )}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className={cn("font-bold flex items-center gap-2", theme === 'dark' ? "text-white" : "text-gray-900")}>
                            <Plane className="text-yellow-400" /> {t('pilot.drone_status')}
                        </h3>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${connected ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {connected ? t('pilot.link_active') : t('pilot.no_signal')}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <TelemetryStat icon={<Navigation size={18} />} label={t('pilot.altitude')} value={`${drone.altitude.toFixed(1)}m`} theme={theme} />
                        <TelemetryStat icon={<Battery size={18} />} label={t('pilot.battery')} value={`${Math.floor(drone.battery)}%`} theme={theme} />
                        <TelemetryStat
                            icon={<Activity size={18} />}
                            label={t('pilot.mode')}
                            value={drone.status}
                            color={drone.status === "AI_LOCKED" ? "text-yellow-400" : "text-orange-400"}
                            theme={theme}
                        />
                        <TelemetryStat icon={<Compass size={18} />} label={t('pilot.pitch')} value={`${drone.gimbal_pitch}°`} theme={theme} />
                    </div>

                    <div className="mt-8 space-y-3">
                        {/* Large Touch Targets for Tablet */}
                        <DroneBtn onClick={startMission} active={!isSimulating && waypoints.length > 0} label={t('pilot.auto_survey')} icon={<Play size={20} />} color="bg-yellow-400 text-black hover:bg-yellow-300 shadow-xl" />
                        <div className="grid grid-cols-2 gap-3">
                            <DroneBtn onClick={() => setDrone(prev => ({ ...prev, status: "FLYING" }))} active={drone.status === "READY"} label={t('pilot.takeoff')} icon={<Navigation size={18} />} color="bg-white/10 text-white hover:bg-white/20 border border-white/10" />
                            <DroneBtn onClick={() => setDrone(prev => ({ ...prev, status: "Returning" }))} active={true} label={t('pilot.land')} icon={<ShieldAlert size={18} />} color="bg-red-500/20 text-red-400 hover:bg-red-500/30" />
                        </div>
                    </div>
                </div>

                <div className={cn(
                    "flex-1 rounded-2xl p-6 border transition-colors duration-300 flex flex-col",
                    theme === 'midnight' ? "bg-black border-yellow-400/10" : (theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-gray-200 shadow-sm")
                )}>
                    <h4 className="text-xs text-slate-500 uppercase mb-4 tracking-widest font-bold">{t('pilot.nav_logs')}</h4>
                    <div className="flex-1 overflow-y-auto text-[10px] font-mono space-y-2 custom-scrollbar">
                        <div className="text-blue-400 font-bold">{t('pilot.system_stable')}</div>
                        <div className="text-green-400 font-bold">{t('pilot.gps_link')}</div>
                        {nightVision && <div className="text-green-500 font-bold uppercase">{t('pilot.night_vision_active')}</div>}
                        {waypoints.map((wp, i) => (
                            <div key={wp.id} className="text-yellow-400">&gt; WP_ADD: {i + 1} // GRID: {wp.x.toFixed(0)}, {wp.y.toFixed(0)}</div>
                        ))}
                        {isSimulating && <div className="text-yellow-400 animate-pulse font-bold">{t('pilot.executing_flight')}</div>}
                    </div>
                </div>
            </div>

            {/* Right: Connect Map Logic */}
            <div className="lg:col-span-2 flex flex-col h-full rounded-[2rem] overflow-hidden relative shadow-2xl border border-white/10 bg-[#020617]">
                {/* Map Header Overlay */}
                <div className="absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-start pointer-events-none">
                    <div>
                        <h2 className="text-white font-black text-xl uppercase tracking-tighter italic">{t('pilot.mission_planner')}</h2>
                        <p className="text-yellow-400 text-[10px] font-mono uppercase tracking-widest">{t('pilot.tap_waypoints')}</p>
                    </div>
                    <div className="flex gap-2 pointer-events-auto">
                        <button
                            onClick={() => setNightVision(!nightVision)}
                            className={`p-3 rounded-xl backdrop-blur transition-all flex items-center gap-2 border ${nightVision ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
                        >
                            <Activity size={18} className={nightVision ? "animate-pulse" : ""} />
                            <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">{t('pilot.nvg_filter')}</span>
                        </button>
                        <button onClick={clearWaypoints} className="p-3 bg-red-500/10 text-red-500 rounded-xl backdrop-blur hover:bg-red-500/20 border border-red-500/20">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Interactive Canvas */}
                <div className="relative flex-1 bg-[#020617] cursor-crosshair group overflow-hidden">
                    {/* Background Map Image */}
                    <div
                        className={cn(
                            "absolute inset-0 opacity-20 pointer-events-none bg-cover bg-center transition-all duration-700",
                            nightVision ? "grayscale contrast-125 brightness-150 sepia hue-rotate-50 saturate-200" : ""
                        )}
                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1590644365607-1c5a519a9a37?q=80&w=1200&auto=format&fit=crop')" }}
                    ></div>

                    {/* NVG Scanlines Overlay */}
                    {nightVision && (
                        <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20"></div>
                    )}

                    <canvas
                        ref={canvasRef}
                        width={800}
                        height={600}
                        onClick={handleMapClick}
                        className={cn("w-full h-full relative z-0 transition-opacity", nightVision ? "opacity-80" : "opacity-100")}
                    />

                    {/* Tutorial Overlay */}
                    {waypoints.length === 0 && !isSimulating && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-black/60 backdrop-blur-xl px-10 py-6 rounded-full border border-yellow-400/20 text-yellow-400 flex items-center gap-4 animate-pulse shadow-2xl">
                                <Plus size={24} strokeWidth={3} />
                                <span className="font-black tracking-[0.2em] text-sm uppercase italic">{t('pilot.inject_waypoint')}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* SD Card Mode Panel */}
                <div className={cn(
                    "absolute bottom-6 right-6 w-72 bg-[#020617]/90 rounded-2xl border shadow-2xl overflow-hidden z-20 backdrop-blur-xl",
                    "border-yellow-400/20"
                )}>
                    <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <HardDrive size={12} className="text-yellow-400" />
                            <span className="text-[8px] font-black text-yellow-400 tracking-[0.2em] uppercase">SD Card Mode</span>
                        </div>
                        <div className={`w-1.5 h-1.5 rounded-full ${sdReady ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
                    </div>
                    <div className="p-5 flex flex-col items-center gap-4">
                        <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all",
                            sdReady ? "border-green-400/50 bg-green-500/10" : "border-yellow-400/20 bg-yellow-400/5"
                        )}>
                            <HardDrive size={28} className={sdReady ? "text-green-400" : "text-yellow-400/60"} />
                        </div>
                        <div className="text-center">
                            <p className={cn(
                                "text-[10px] font-black uppercase tracking-[0.15em]",
                                sdReady ? "text-green-400" : "text-yellow-400/80"
                            )}>
                                {sdReady ? "SD_CARD_DETECTED" : "AWAITING_SD_CARD"}
                            </p>
                            <p className="text-[9px] text-slate-600 font-mono mt-1 uppercase tracking-widest">
                                {sdReady ? "DJI Air 3S / DCIM ready" : "Insert SD card to begin"}
                            </p>
                        </div>
                        <button
                            onClick={() => setSdReady(prev => !prev)}
                            className={cn(
                                "w-full text-[9px] font-black px-4 py-2.5 rounded-xl uppercase tracking-widest transition-all border",
                                sdReady
                                    ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                                    : "bg-yellow-400/10 text-yellow-400 border-yellow-400/20 hover:bg-yellow-400/20"
                            )}
                        >
                            {sdReady ? "Eject_Card" : "Simulate_Insert"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TelemetryStat({ icon, label, value, color = "text-white", theme }: { icon: React.ReactNode, label: string, value: string, color?: string, theme: 'light' | 'dark' | 'midnight' }) {
    return (
        <div className={cn(
            "p-5 rounded-2xl border transition-colors duration-300",
            theme === 'midnight' ? "bg-black border-white/5" : (theme === 'dark' ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")
        )}>
            <div className="text-slate-500 flex items-center gap-2 mb-2">
                {icon}
                <span className="text-[9px] uppercase font-black tracking-[0.15em]">{label}</span>
            </div>
            <div className={cn("text-xl font-mono font-black tracking-tight", theme === 'light' && color === "text-white" ? "text-gray-900" : color)}>{value}</div>
        </div>
    )
}

interface DroneBtnProps {
    onClick: () => void;
    active: boolean;
    label: string;
    icon: React.ReactNode;
    color: string;
}

function DroneBtn({ onClick, active, label, icon, color }: DroneBtnProps) {
    return (
        <button
            onClick={onClick}
            disabled={!active}
            className={cn(
                "w-full flex items-center justify-between px-8 py-5 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.2em] italic",
                active ? color : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5 opacity-50'
            )}
        >
            <span className="flex items-center gap-4">{icon} {label}</span>
            <Wifi size={14} className={active ? 'animate-pulse' : 'opacity-20'} />
        </button>
    )
}
