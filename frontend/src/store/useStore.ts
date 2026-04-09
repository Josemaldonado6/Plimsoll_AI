import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval'

// Custom storage for IndexedDB using idb-keyval
const indexedDBStorage = {
    getItem: async (name: string): Promise<string | null> => {
        return (await get(name)) || null
    },
    setItem: async (name: string, value: string): Promise<void> => {
        await set(name, value)
    },
    removeItem: async (name: string): Promise<void> => {
        await del(name)
    },
}

export type SurveyPhase = 'INITIAL' | 'INTERIM' | 'FINAL';

export interface ScanResult {
    id: number;
    phase: SurveyPhase;
    filename: string;
    draft_mean: number;
    data_reliability: number; // Replaced confidence
    sea_state: string;
    timestamp: string;
    is_synced?: number;
}

export interface Operation {
    id: string;
    vessel_name: string;
    imo: string;
    status: 'ACTIVE' | 'COMPLETED';
    created_at: string;
    scans: ScanResult[];
}

interface User {
    email: string
    full_name: string
    tier: 'Explorer' | 'Commander' | 'Sovereign'
}

interface PlimsollState {
    showLanding: boolean
    activeTab: 'Identity' | 'Capture' | 'Analysis' | 'Certify'
    history: ScanResult[] // V3 legacy compliance (optional cleanup later)
    operations: Operation[];
    activeOperationId: string | null;
    theme: 'midnight' | 'daylight'
    isOnline: boolean
    currentResult: any | null
    isAnalyzing: boolean
    user: User | null
    token: string | null
    edgeUrl: string
    vesselInfo: {
        name: string
        imo: string
        lbp?: number
        beam?: number
        hydrostatics_data?: string
    }

    // Actions
    setShowLanding: (show: boolean) => void
    setActiveTab: (tab: 'Identity' | 'Capture' | 'Analysis' | 'Certify') => void
    createOperation: (vessel_name: string, imo: string) => string
    setActiveOperation: (id: string) => void
    addScanToOperation: (opId: string, scan: ScanResult) => void
    completeOperation: (opId: string) => void
    setTheme: (theme: 'midnight') => void
    setIsOnline: (status: boolean) => void
    setCurrentResult: (result: any | null) => void
    setIsAnalyzing: (status: boolean) => void
    login: (user: User, token: string) => void
    logout: () => void
    setEdgeUrl: (url: string) => void
    setVesselInfo: (info: any) => void
    syncDrafts: () => Promise<void>
    resetState: () => void

}

export const useStore = create<PlimsollState>()(
    persist(
        (set) => ({
            showLanding: true,
            activeTab: "Identity",
            history: [],
            operations: [],
            activeOperationId: null,
            theme: 'midnight', // Defaulting to midnight for high-contrast field ops
            isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
            currentResult: null,
            isAnalyzing: false,
            user: null,
            token: null,
            edgeUrl: "https://plimsoll-official-hub.loca.lt",
            vesselInfo: { name: 'MV PACIFIC LEGACY', imo: '9823471' },


            setShowLanding: (show) => set({ showLanding: show }),
            setActiveTab: (tab) => set({ activeTab: tab }),
            
            // Sovereignty Core Operations
            createOperation: (vessel_name, imo) => {
                const opId = `OP_${Date.now()}`;
                set((state) => ({
                    operations: [{
                        id: opId,
                        vessel_name,
                        imo,
                        status: 'ACTIVE',
                        created_at: new Date().toISOString(),
                        scans: []
                    }, ...state.operations]
                }));
                return opId;
            },
            setActiveOperation: (id) => set({ activeOperationId: id }),
            addScanToOperation: (opId, scan) => set((state) => ({
                operations: state.operations.map(op => 
                    op.id === opId 
                        ? { ...op, scans: [...op.scans, scan] } 
                        : op
                )
            })),
            completeOperation: (opId) => set((state) => ({
                operations: state.operations.map(op => 
                    op.id === opId ? { ...op, status: 'COMPLETED' } : op
                )
            })),
            setTheme: (theme) => set({ theme }),
            setIsOnline: (status) => set({ isOnline: status }),
            setCurrentResult: (currentResult) => set({ currentResult }),
            setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

            login: (user, token) => set({ user, token }),
            logout: () => set({ user: null, token: null, showLanding: true }),
            setEdgeUrl: (edgeUrl: string) => set({ edgeUrl }),
            setVesselInfo: (vesselInfo: any) => set({ vesselInfo }),



            syncDrafts: async () => {
                const { history, isOnline, edgeUrl } = useStore.getState();
                if (!isOnline) return;

                const unsynced = history.filter(s => !s.is_synced);
                if (unsynced.length === 0) return;

                console.log(`[SYNC] Initiating handshake for ${unsynced.length} reports...`);

                // Utilizar la URL del Hub (Edge) para la sincronización, sin importar el entorno
                const getApiUrl = (path: string) => {
                    const base = edgeUrl || "https://plimsoll-official-hub.loca.lt";
                    return `${base.replace(/\/$/, '')}${path}`;
                };

                for (const survey of unsynced) {
                    try {
                        const response = await fetch(getApiUrl('/api/sync/handshake'), {
                            method: 'POST',
                            mode: 'cors',
                            headers: { 
                                'Content-Type': 'application/json',
                                'Bypass-Tunnel-Reminder': 'true',
                                'ngrok-skip-browser-warning': 'true'
                            },
                            body: JSON.stringify(survey)
                        });

                        if (response.ok) {
                            set((state) => ({
                                history: state.history.map(s => s.id === survey.id ? { ...s, is_synced: 1 } : s)
                            }));
                            console.log(`[SYNC] Handshake complete for Survey ID ${survey.id}`);
                        } else {
                            console.error(`[SYNC] Handshake failed for ID ${survey.id} with status: ${response.status}`);
                        }
                    } catch (e) {
                        console.error(`[SYNC] Handshake failed for ID ${survey.id}`, e);
                    }
                }
            },
            resetState: () => set({
                showLanding: true,
                activeTab: "Identity",
                history: [],
                activeOperationId: null,
                theme: 'midnight'
            })
        }),
        {
            name: 'plimsoll-storage', // unique name
            storage: createJSONStorage(() => indexedDBStorage),
        }
    )
)

/**
 * [HYBRID_GATEWAY] Centralized API Routing Manager
 * Routes to local uvicorn in dev, or local relative path in production for Vercel Reverse Proxy.
 */
export const getApiUrl = (path: string) => {
    const isDev = typeof window !== 'undefined' && (window.location.port === "5173" || window.location.hostname === "localhost");
    
    // Ensure path starts with / for URL construction
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    // Si estamos en Vercel (Producción), usamos rutas relativas para pasar por el Proxy Reverso
    const base = isDev ? 'http://localhost:8000' : '';
    
    return `${base}${normalizedPath}`;
}
