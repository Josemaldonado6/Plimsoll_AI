import { create } from 'zustand';

interface TelemetryState {
    connected: boolean;
    data: {
        status: string;
        altitude: number;
        battery: number;
        gps: { lat: number, lng: number };
        x: number;
        y: number;
        mission: string;
        mission_progress: number;
        current_waypoint_id: string | null;
        waterline_y?: number;
    } | null;
    connect: () => void;
    disconnect: () => void;
}

import { Config } from '../constants/Config';

// WebSocket URL Helper
const getWsUrl = () => {
    return Config.WS_URL;
};

export const useTelemetry = create<TelemetryState>((set, get) => ({
    connected: false,
    data: null,
    socket: null,

    connect: () => {
        if (get().connected) return;

        const url = getWsUrl();
        console.log(`Connecting to Telemetry Stream: ${url}`);
        const ws = new WebSocket(url);

        ws.onopen = () => {
            console.log(`Telemetry Connected to ${url}`);
            set({ connected: true });
        };

        ws.onmessage = (e) => {
            try {
                const msg = JSON.parse(e.data);
                if (msg.type === "TELEMETRY") {
                    set({ data: msg.data });
                } else if (msg.status) {
                    // Direct state object
                    set({ data: msg });
                }
            } catch (err) {
                console.error("Telemetry Parse Error", err);
            }
        };

        ws.onclose = () => {
            console.log("Telemetry Disconnected");
            set({ connected: false });
            // Auto-reconnect after 2s
            setTimeout(() => get().connect(), 2000);
        };

        ws.onerror = (e) => {
            console.error("WebSocket Error:", e);
            if (__DEV__) {
                console.warn(`[TELEMETRY] Failed to connect to ${url}. Is port 8000 open in PC Firewall? Run AUTHORIZE_LAN_ACCESS.bat as admin.`);
            }
        };
    },

    disconnect: () => {
        // Implement cleanup if needed
    }
}));
