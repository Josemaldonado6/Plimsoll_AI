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
import { Plane, Navigation, Battery, Activity, Compass, Play, ShieldAlert, Map as MapIcon, Wifi, Plus, Trash2, Send } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs))
};

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

const droneTranslations: any = {
    en: {
        status: "Drone Status",
        link_active: "Link Active",
        no_signal: "No Signal",
        altitude: "Altitude",
        battery: "Battery",
        mode: "Mode",
        pitch: "Pitch",
        takeoff: "Takeoff",
        auto_survey: "Start Mission",
        land: "Return Home",
        nav_logs: "Navigation Logs",
        live: "LIVE 4K 60FPS",
        dynamic_map: "Tactical Mission Planner",
        satellite_view: "Tap to add waypoints",
        clear: "Clear Path"
    },
    es: {
        status: "Estado del Dron",
        link_active: "Enlace Activo",
        no_signal: "Sin Señal",
        altitude: "Altitud",
        battery: "Batería",
        mode: "Modo",
        pitch: "Inclinación",
        takeoff: "Despegar",
        auto_survey: "Iniciar Misión",
        land: "Retorno a Casa",
        nav_logs: "Registros de Navegación",
        live: "EN VIVO 4K 60FPS",
        dynamic_map: "Planificador Táctico",
        satellite_view: "Toca para agregar puntos",
        clear: "Borrar Ruta"
    }
}

interface DronePilotProps {
    lang: 'en' | 'es';
    theme: 'light' | 'dark';
}

export default function DronePilot({ lang, theme }: DronePilotProps) {
    const [drone, setDrone] = useState<DroneState>({
        status: "READY",
        altitude: 0,
        battery: 98,
        gps: { lat: 1.2834, lng: 103.8607 },
        gimbal_pitch: -90,
        mission: "IDLE"
    });
    const [connected, setConnected] = useState(true);
    const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [streamSource, setStreamSource] = useState<'SIMULATION' | 'LIVE'>('SIMULATION');
    const [rtspUrl, setRtspUrl] = useState("http://192.168.1.XX:8080/video");
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dronePosRef = useRef({ x: 50, y: 50 }); // Local canvas coords for drone
    const dt = droneTranslations[lang];

    // Mock WebSocket Connection & Live Telemetry Polling
    useEffect(() => {
        const interval = setInterval(() => {
            if (isSimulating) {
                // Idle drift simulation
                setDrone(prev => ({ ...prev, battery: Math.max(0, prev.battery - 0.01) }));
            } else if (streamSource === 'LIVE') {
                // Poll Backend for AI Telemetry
                axios.get('http://localhost:8000/api/stream/telemetry')
                    .then(res => {
                        const data = res.data;
                        if (data.status === "TRACKING") {
                            // Update Drone HUD with real data
                            setDrone(prev => ({
                                ...prev,
                                status: "AI_LOCKED",
                                mission: "SURVEYING"
                            }));
                            // Convert waterline Y to Altitude metric (mock conversion)
                            const mockAlt = (720 - data.waterline_y) * 0.02;
                            if (!isNaN(mockAlt)) {
                                setDrone(prev => ({ ...prev, altitude: mockAlt }));
                            }
                        }
                    })
                    .catch(() => { });
            } else {
                // Idle drift
                setDrone(prev => ({ ...prev, battery: Math.max(0, prev.battery - 0.01) }));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [isSimulating, streamSource]);

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
                    theme === 'dark' ? "bg-[#112240] border-[#8892b0]/10" : "bg-white border-gray-200 shadow-sm"
                )}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className={cn("font-bold flex items-center gap-2", theme === 'dark' ? "text-[#e6f1ff]" : "text-gray-900")}>
                            <Plane className="text-[#64ffda]" /> {dt.status}
                        </h3>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${connected ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {connected ? dt.link_active : dt.no_signal}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <TelemetryStat icon={<Navigation size={18} />} label={dt.altitude} value={`${drone.altitude.toFixed(1)}m`} theme={theme} />
                        <TelemetryStat icon={<Battery size={18} />} label={dt.battery} value={`${Math.floor(drone.battery)}%`} theme={theme} />
                        <TelemetryStat
                            icon={<Activity size={18} />}
                            label={dt.mode}
                            value={drone.status}
                            color={drone.status === "AI_LOCKED" ? "text-[#64ffda]" : "text-yellow-400"}
                            theme={theme}
                        />
                        <TelemetryStat icon={<Compass size={18} />} label={dt.pitch} value={`${drone.gimbal_pitch}°`} theme={theme} />
                    </div>

                    <div className="mt-8 space-y-3">
                        {/* Large Touch Targets for Tablet */}
                        <DroneBtn onClick={startMission} active={!isSimulating && waypoints.length > 0} label={dt.auto_survey} icon={<Play size={20} />} color="bg-[#64ffda]/10 text-[#64ffda] hover:bg-[#64ffda]/20 border border-[#64ffda]/30" />
                        <div className="grid grid-cols-2 gap-3">
                            <DroneBtn onClick={() => setDrone(prev => ({ ...prev, status: "FLYING" }))} active={drone.status === "READY"} label={dt.takeoff} icon={<Navigation size={18} />} color="bg-green-500/20 text-green-400 hover:bg-green-500/30" />
                            <DroneBtn onClick={() => setDrone(prev => ({ ...prev, status: "Returning" }))} active={true} label={dt.land} icon={<ShieldAlert size={18} />} color="bg-red-500/20 text-red-400 hover:bg-red-500/30" />
                        </div>
                    </div>
                </div>

                <div className={cn(
                    "flex-1 rounded-2xl p-6 border transition-colors duration-300 flex flex-col",
                    theme === 'dark' ? "bg-[#112240] border-[#8892b0]/10" : "bg-white border-gray-200 shadow-sm"
                )}>
                    <h4 className="text-xs text-[#8892b0] uppercase mb-4 tracking-widest">{dt.nav_logs}</h4>
                    <div className="flex-1 overflow-y-auto text-[10px] font-mono space-y-2">
                        <div className="text-blue-400">[SYSTEM] DJI SDK V5.2.1 Initialized...</div>
                        <div className="text-green-400">[GPS] Satellites Locked (12)</div>
                        {nightVision && <div className="text-green-500">[OPTICS] NIGHT VISION ENABLED (CLAHE)</div>}
                        {waypoints.map((wp, i) => (
                            <div key={wp.id} className="text-[#64ffda]">&gt; Added Waypoint {i + 1} at grid {wp.x.toFixed(0)}, {wp.y.toFixed(0)}</div>
                        ))}
                        {isSimulating && <div className="text-yellow-400 animate-pulse">[MISSION] EXECUTING FLIGHT PLAN...</div>}
                    </div>
                </div>
            </div>

            {/* Right: Connect Map Logic */}
            <div className="lg:col-span-2 flex flex-col h-full rounded-2xl overflow-hidden relative shadow-2xl border border-[#64ffda]/20 bg-black">
                {/* Map Header Overlay */}
                <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-start pointer-events-none">
                    <div>
                        <h2 className="text-white font-bold text-lg">{dt.dynamic_map}</h2>
                        <p className="text-[#64ffda] text-xs font-mono">{dt.satellite_view}</p>
                    </div>
                    <div className="flex gap-2 pointer-events-auto">
                        <button
                            onClick={() => setNightVision(!nightVision)}
                            className={`p-2 rounded-lg backdrop-blur border transition-all ${nightVision ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}
                        >
                            <Activity size={18} className={nightVision ? "animate-pulse" : ""} />
                            <span className="ml-2 text-xs font-bold hidden md:inline">NVG MODE</span>
                        </button>
                        <button onClick={clearWaypoints} className="p-2 bg-red-500/20 text-red-400 rounded-lg backdrop-blur hover:bg-red-500/30">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Interactive Canvas */}
                <div className="relative flex-1 bg-[#0a192f] cursor-crosshair group overflow-hidden">
                    {/* Background Map Image */}
                    <div
                        className={cn(
                            "absolute inset-0 opacity-30 pointer-events-none bg-cover bg-center transition-all duration-700",
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
                            <div className="bg-black/50 backdrop-blur-sm px-6 py-4 rounded-full border border-[#64ffda]/30 text-[#64ffda] flex items-center gap-3 animate-pulse">
                                <Plus size={20} />
                                <span className="font-bold tracking-widest text-sm">TAP TO ADD WAYPOINT</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Live Stream PIP (Picture in Picture) */}
                <div className={cn(
                    "absolute bottom-4 right-4 w-64 h-48 bg-black rounded-lg border shadow-2xl overflow-hidden z-20 transition-all duration-500 flex flex-col",
                    nightVision ? "border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]" : "border-white/20"
                )}>
                    {/* Header */}
                    <div className="bg-black/80 px-2 py-1 flex items-center justify-between z-30 border-b border-white/10">
                        <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${streamSource === 'LIVE' ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}></div>
                            <span className="text-[8px] font-bold text-white tracking-wider">
                                {streamSource === 'LIVE' ? 'IP_WEBCAM_LIVE' : 'SIMULATION_FEED'}
                            </span>
                        </div>
                        <button
                            onClick={() => setStreamSource(prev => prev === 'SIMULATION' ? 'LIVE' : 'SIMULATION')}
                            className="text-[8px] px-2 py-0.5 bg-white/10 rounded hover:bg-white/20 text-white"
                        >
                            SWITCH SOURCE
                        </button>
                    </div>

                    {/* Content */}
                    <div className="relative flex-1 bg-black">
                        {streamSource === 'SIMULATION' ? (
                            <img
                                src="https://images.unsplash.com/photo-1581093583449-edb5adbea543?q=80&w=600&auto=format&fit=crop"
                                className={cn(
                                    "w-full h-full object-cover transition-all duration-700",
                                    nightVision ? "grayscale contrast-125 brightness-150 sepia hue-rotate-50 saturate-200" : "opacity-80"
                                )}
                            />
                        ) : (
                            <div className="w-full h-full relative group">
                                <img
                                    src={rtspUrl}
                                    className={cn(
                                        "w-full h-full object-cover",
                                        nightVision ? "grayscale contrast-125 brightness-150 sepia hue-rotate-50 saturate-200" : ""
                                    )}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x200/000000/ffffff?text=NO+SIGNAL";
                                    }}
                                />
                                {/* URL Input Overlay (Hidden unless hovering) */}
                                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                    <input
                                        type="text"
                                        value={rtspUrl}
                                        onChange={(e) => setRtspUrl(e.target.value)}
                                        className="bg-black border border-[#64ffda] text-[#64ffda] text-[10px] p-2 w-[90%] font-mono"
                                        placeholder="http://IP:8080/video"
                                    />
                                    <button
                                        onClick={() => {
                                            axios.post('http://localhost:8000/api/stream/connect', { url: rtspUrl })
                                                .then(() => alert("AI VISION CORE: CONNECTED"))
                                                .catch(err => alert("CONNECTION FAILED: " + err.message));
                                        }}
                                        className="bg-[#64ffda]/20 text-[#64ffda] text-[9px] font-bold px-3 py-1 rounded border border-[#64ffda]/50 hover:bg-[#64ffda]/40 hover:scale-105 transition-all"
                                    >
                                        CONNECT TO AI CORE
                                    </button>
                                </div>
                            </div>
                        )}
                        {nightVision && <div className="absolute inset-0 bg-green-500/10 pointer-events-none mix-blend-overlay"></div>}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TelemetryStat({ icon, label, value, color = "text-[#e6f1ff]", theme }: { icon: React.ReactNode, label: string, value: string, color?: string, theme: 'light' | 'dark' }) {
    return (
        <div className={cn(
            "p-4 rounded-xl border transition-colors duration-300",
            theme === 'dark' ? "bg-[#0a192f] border-[#8892b0]/5" : "bg-gray-50 border-gray-100"
        )}>
            <div className="text-[#8892b0] flex items-center gap-2 mb-1">
                {icon}
                <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
            </div>
            <div className={cn("text-lg font-mono font-bold", theme === 'light' && color === "text-[#e6f1ff]" ? "text-gray-900" : color)}>{value}</div>
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
                "w-full flex items-center justify-between px-6 py-4 rounded-xl transition-all font-bold text-xs uppercase tracking-widest",
                active ? color : 'bg-[#1a2c4e] text-[#4a5a7a] cursor-not-allowed'
            )}
        >
            <span className="flex items-center gap-3">{icon} {label}</span>
            <Wifi size={14} className={active ? 'animate-pulse' : 'opacity-20'} />
        </button>
    )
}
