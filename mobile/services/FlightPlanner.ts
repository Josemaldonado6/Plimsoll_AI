import axios from 'axios';
import { Config } from '../constants/Config';

export interface Waypoint {
    id: string;
    x: number;
    y: number;
    alt: number;
    action: string;
}

export interface MissionPlan {
    vessel_length: number;
    safe_distance: number;
    waypoints: Waypoint[];
    count: number;
}

class FlightPlanner {
    private apiUrl = Config.API_URL;

    async generateHullOrbitPlan(vesselLength: number, safeDistance: number = 8.0): Promise<MissionPlan> {
        try {
            const response = await axios.get<MissionPlan>(`${this.apiUrl}/drone/mission/waypoints`, {
                params: {
                    vessel_length: vesselLength,
                    safe_distance: safeDistance
                }
            });
            return response.data;
        } catch (error) {
            console.error("Failed to generate flight plan:", error);
            throw error;
        }
    }

    async startMission(): Promise<boolean> {
        try {
            const response = await axios.post(`${this.apiUrl}/drone/mission/auto-survey`);
            return response.data.status === "success";
        } catch (error) {
            console.error("Failed to start mission:", error);
            return false;
        }
    }

    async takeoff(): Promise<boolean> {
        try {
            const response = await axios.post(`${this.apiUrl}/drone/takeoff`);
            return response.data.status === "success";
        } catch (error) {
            console.error("Takeoff failed:", error);
            return false;
        }
    }

    async land(): Promise<boolean> {
        try {
            const response = await axios.post(`${this.apiUrl}/drone/land`);
            return response.data.status === "success";
        } catch (error) {
            console.error("Landing failed:", error);
            return false;
        }
    }
}

export const flightPlanner = new FlightPlanner();
