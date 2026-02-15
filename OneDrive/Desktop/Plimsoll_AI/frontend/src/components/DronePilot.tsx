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
import React, { useState, useEffect } from 'react';
import { Plane, Navigation, Battery, Activity, Compass, Play, ShieldAlert, Map as MapIcon, Wifi } from 'lucide-react';
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
        auto_survey: "Start Auto-Survey",
        land: "Emergency Landing",
        nav_logs: "Navigation Logs",
        live: "LIVE 4K 60FPS",
        dynamic_map: "Dynamic Map Interface",
        satellite_view: "Satellite View - Port of Singapore Area"
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
        auto_survey: "Iniciar Escaneo Automático",
        land: "Aterrizaje de Emergencia",
        nav_logs: "Registros de Navegación",
        live: "EN VIVO 4K 60FPS",
        dynamic_map: "Interfaz de Mapa Dinámico",
        satellite_view: "Vista Satelital - Área Puerto de Singapur"
    }
}

interface DronePilotProps {
    lang: 'en' | 'es';
    theme: 'light' | 'dark';
}

export default function DronePilot({ lang, theme }: DronePilotProps) {
    const [drone, setDrone] = useState<DroneState>({
        status: "DISCONNECTED",
        altitude: 0,
        battery: 100,
        gps: { lat: 1.2834, lng: 103.8607 },
        gimbal_pitch: -90,
        mission: "IDLE"
    });
    const [connected, setConnected] = useState(false);
    const dt = droneTranslations[lang];

    useEffect(() => {
        // Connect to Drone WebSocket
        const wsUrl = `ws://${window.location.hostname}:8000/api/v1/ws/drone`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => setConnected(true);
        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === "TELEMETRY") {
                setDrone(msg.data);
            }
        };
        ws.onclose = () => setConnected(false);

        return () => ws.close();
    }, []);

    const handleAction = async (action: string) => {
        try {
            await axios.post(`http://${window.location.hostname}:8000/api/v1/drone/${action}`);
        } catch (error) {
            console.error("Action failed", error);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full p-2">
            {/* Left: Telemetry & Controls */}
            <div className="md:col-span-1 space-y-6">
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
                        <TelemetryStat icon={<Activity size={18} />} label={dt.mode} value={drone.status} color="text-yellow-400" theme={theme} />
                        <TelemetryStat icon={<Compass size={18} />} label={dt.pitch} value={`${drone.gimbal_pitch}°`} theme={theme} />
                    </div>

                    <div className="mt-8 space-y-3">
                        <DroneBtn onClick={() => handleAction('takeoff')} active={drone.status === "DISCONNECTED"} label={dt.takeoff} icon={<Play size={18} />} color="bg-green-500/20 text-green-400 hover:bg-green-500/30" />
                        <DroneBtn onClick={() => handleAction('mission/auto-survey')} active={drone.status === "FLYING"} label={dt.auto_survey} icon={<Navigation size={18} />} color="bg-[#64ffda]/10 text-[#64ffda] hover:bg-[#64ffda]/20 border border-[#64ffda]/30" />
                        <DroneBtn onClick={() => handleAction('land')} active={drone.status === "FLYING"} label={dt.land} icon={<ShieldAlert size={18} />} color="bg-red-500/20 text-red-400 hover:bg-red-500/30" />
                    </div>
                </div>

                <div className={cn(
                    "rounded-2xl p-6 border transition-colors duration-300",
                    theme === 'dark' ? "bg-[#112240] border-[#8892b0]/10" : "bg-white border-gray-200 shadow-sm"
                )}>
                    <h4 className="text-xs text-[#8892b0] uppercase mb-4 tracking-widest">{dt.nav_logs}</h4>
                    <div className="space-y-2 h-40 overflow-y-auto text-[10px] font-mono">
                        <div className="text-blue-400">[SYSTEM] DJI SDK Initialized...</div>
                        <div className="text-green-400">[SIGNAL] Uplink established (120ms)</div>
                        {drone.status === "FLYING" && <div className="text-yellow-400">[WARNNING] {lang === 'es' ? "Estabilizando para Estado de Mar 2" : "Stabilizing for Sea State 2"}</div>}
                    </div>
                </div>
            </div>

            {/* Right: Live Stream & Map Simulation */}
            <div className="md:col-span-2 space-y-6">
                <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border-4 border-[#112240] shadow-2xl">
                    {/* Simulated Live Stream Overlay */}
                    <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay"></div>
                    <div className="absolute top-6 left-6 flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                        <span className="text-white text-xs font-bold tracking-widest">{dt.live}</span>
                    </div>

                    {/* HUD */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-80 h-80 border-2 border-white/20 rounded-full flex items-center justify-center">
                            <div className="w-1 h-20 bg-white/40 mb-20"></div>
                            <div className="w-20 h-1 bg-white/40 ml-[-40px]"></div>
                        </div>
                    </div>

                    <img
                        src="https://images.unsplash.com/photo-1590644365607-1c5a519a9a37?q=80&w=1200&auto=format&fit=crop"
                        alt="Drone View"
                        className="w-full h-full object-cover opacity-60 grayscale-[30%]"
                    />

                    <div className="absolute bottom-6 right-6 text-white text-right space-y-1 bg-black/40 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                        <p className="text-[10px] opacity-70">LAT/LNG</p>
                        <p className="text-xs font-mono">{drone.gps.lat.toFixed(4)}, {drone.gps.lng.toFixed(4)}</p>
                    </div>
                </div>

                <div className={cn(
                    "h-64 rounded-2xl border relative overflow-hidden transition-colors duration-300",
                    theme === 'dark' ? "bg-[#112240] border-[#8892b0]/10" : "bg-white border-gray-200"
                )}>
                    <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/0,0,1,0,0/400x400?access_token=pk.xxx')] bg-cover"></div>
                    <div className="absolute inset-0 flex items-center justify-center flex-col text-[#8892b0]">
                        <MapIcon size={40} className="mb-2 opacity-50" />
                        <span className="text-xs uppercase tracking-widest font-bold">{dt.dynamic_map}</span>
                        <span className="text-[10px] opacity-50 mt-1">{dt.satellite_view}</span>
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
            className={`w-full flex items-center justify-between px-6 py-4 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${active ? color : 'bg-[#1a2c4e] text-[#4a5a7a] cursor-not-allowed'}`}
        >
            <span className="flex items-center gap-3">{icon} {label}</span>
            <Wifi size={14} className={active ? 'animate-pulse' : 'opacity-20'} />
        </button>
    )
}
