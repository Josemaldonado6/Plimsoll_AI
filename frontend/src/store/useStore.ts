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

export interface Survey {
    id: number
    filename: string
    draft_mean: number
    confidence: number
    sea_state: string
    timestamp: string
    is_synced?: number
}

interface User {
    email: string
    full_name: string
    tier: 'Explorer' | 'Commander' | 'Sovereign'
}

interface PlimsollState {
    showLanding: boolean
    activeTab: 'Identity' | 'Capture' | 'Analysis' | 'Certify'
    history: Survey[]
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
    setHistory: (history: Survey[]) => void
    addSurvey: (survey: Survey) => void
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
            setHistory: (history) => set({ history }),
            addSurvey: (survey) => set((state) => ({
                history: [survey, ...state.history].slice(0, 50) // Keep last 50 for performance
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
                            headers: { 'Content-Type': 'application/json' },
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
 * Routes to local uvicorn in dev, or the remote Edge Hub (localtunnel / cloud) in production.
 */
export const getApiUrl = (path: string) => {
    const { edgeUrl } = useStore.getState();
    const isDev = typeof window !== 'undefined' && (window.location.port === "5173" || window.location.hostname === "localhost");
    
    // Ensure path starts with / for URL construction
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    // Si estamos en Vercel (Producción), usar SIEMPRE el edgeUrl porque no hay Python backend en Vercel.
    const base = isDev ? 'http://localhost:8000' : (edgeUrl || "https://plimsoll-official-hub.loca.lt");
    
    return `${base.replace(/\/$/, '')}${normalizedPath}`;
}
