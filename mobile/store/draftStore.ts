import { create } from 'zustand';

interface DraftState {
    vesselName: string;
    imo: string;
    density: number;

    drafts: {
        fwd_port: number;
        fwd_stbd: number;
        mid_port: number;
        mid_stbd: number;
        aft_port: number;
        aft_stbd: number;
    };

    setVessel: (name: string, imo: string) => void;
    setDensity: (density: number) => void;
    updateDraft: (key: keyof DraftState['drafts'], value: number) => void;
    reset: () => void;
}

export const useDraftStore = create<DraftState>((set) => ({
    vesselName: '',
    imo: '',
    density: 1.025,

    drafts: {
        fwd_port: 0,
        fwd_stbd: 0,
        mid_port: 0,
        mid_stbd: 0,
        aft_port: 0,
        aft_stbd: 0,
    },

    setVessel: (name, imo) => set({ vesselName: name, imo }),
    setDensity: (density) => set({ density }),
    updateDraft: (key, value) =>
        set((state) => ({ drafts: { ...state.drafts, [key]: value } })),
    reset: () => set({
        vesselName: '',
        imo: '',
        density: 1.025,
        drafts: { fwd_port: 0, fwd_stbd: 0, mid_port: 0, mid_stbd: 0, aft_port: 0, aft_stbd: 0 }
    }),
}));
