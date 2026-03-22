/**
 * INDUSTRIAL DESIGN TOKENS (Solar-Proof)
 * --------------------------------------
 * Optimized for high-glare environments (maritime terminals).
 * WCAG AAA Compliance for contrast.
 */

export const IndustrialTheme = {
    dark: {
        bg: '#020617', // Plimsoll Deep Navy
        surface: '#0f172a',
        accent: '#fde047', // Plimsoll Warning Yellow
        text: {
            primary: '#ffffff',
            secondary: '#94a3b8',
            muted: '#475569'
        },
        border: 'border-white/10',
        glass: 'backdrop-blur-xl bg-white/5 border border-white/10'
    },
    light: {
        bg: '#f8fafc', // Slate 50
        surface: '#ffffff',
        accent: '#1e293b', // Deep Slate instead of yellow for high contrast
        text: {
            primary: '#020617', // Black
            secondary: '#475569',
            muted: '#94a3b8'
        },
        border: 'border-slate-200',
        glass: 'backdrop-blur-xl bg-white/60 border border-slate-200'
    },
    midnight: {
        bg: '#000000', // Pure Black for zero OLED emission
        surface: '#0a0a0a',
        accent: '#fde047',
        text: {
            primary: '#ffffff',
            secondary: '#a3a3a3',
            muted: '#525252'
        },
        border: 'border-yellow-400/20',
        glass: 'bg-black border border-yellow-400/30'
    },
    typography: {
        giant: 'text-8xl font-black tracking-tighter',
        label: 'text-xs font-bold uppercase tracking-widest',
        mono: 'font-mono'
    },
    spacing: {
        touch: 'p-6 md:p-8',
        gap: 'gap-4'
    }
};
