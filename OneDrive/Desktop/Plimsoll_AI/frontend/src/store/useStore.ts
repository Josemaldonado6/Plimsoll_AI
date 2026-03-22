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
    activeTab: string
    history: Survey[]
    theme: 'light' | 'dark' | 'midnight'
    isOnline: boolean
    currentResult: any | null
    isAnalyzing: boolean
    user: User | null
    token: string | null

    // Actions
    setShowLanding: (show: boolean) => void
    setActiveTab: (tab: string) => void
    setHistory: (history: Survey[]) => void
    addSurvey: (survey: Survey) => void
    setTheme: (theme: 'light' | 'dark' | 'midnight') => void
    setIsOnline: (status: boolean) => void
    setCurrentResult: (result: any | null) => void
    setIsAnalyzing: (status: boolean) => void
    login: (user: User, token: string) => void
    logout: () => void
    syncDrafts: () => Promise<void>
    resetState: () => void
}

export const useStore = create<PlimsollState>()(
    persist(
        (set) => ({
            showLanding: true,
            activeTab: "Radar Survey",
            history: [],
            theme: 'midnight', // Defaulting to midnight for high-contrast field ops
            isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
            currentResult: null,
            isAnalyzing: false,
            user: null,
            token: null,

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

            syncDrafts: async () => {
                const { history, isOnline } = useStore.getState();
                if (!isOnline) return;

                const unsynced = history.filter(s => !s.is_synced);
                if (unsynced.length === 0) return;

                console.log(`[SYNC] Initiating handshake for ${unsynced.length} reports...`);

                const isDev = typeof window !== 'undefined' && (window.location.port === "5173" || window.location.hostname === "localhost");
                const getApiUrl = (path: string) => isDev ? `http://localhost:8000${path}` : path;

                for (const survey of unsynced) {
                    try {
                        const response = await fetch(getApiUrl('/api/sync/handshake'), {
                            method: 'POST',
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
                activeTab: "Radar Survey",
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
