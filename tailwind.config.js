/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                brand: {
                    gold: '#E5B842',   // Vivid gold accent
                    'gold-lt': '#F2CD6A',
                    'gold-dk': '#A88427',
                    red: 'var(--color-red)', // New deep vibrant red
                    bg: 'var(--color-bg)',   // Dynamic background (pure black)
                    surface: 'var(--color-surface)', // Dynamic card background
                    panel: 'var(--color-panel)',   // Dynamic elevated panel
                    border: 'var(--color-border)',  // Dynamic subtle border
                    'border-gold': '#E5B84233',
                    'border-red': 'color-mix(in srgb, var(--color-red) 30%, transparent)',
                },
                white: 'var(--color-white)', // Dynamic white
                black: 'var(--color-black)', // Dynamic black
                up: '#15B06D',   // green from the chart
                down: 'var(--color-red)',   // red from the chart updated to brand red
                muted: 'var(--color-muted)',  // Dynamic muted text
                dim: 'var(--color-dim)',      // Dynamic dim text
            },
            fontFamily: {
                display: ['"Inter"', 'sans-serif'],
                body: ['"DM Sans"', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            backgroundImage: {
                'gold-gradient': 'linear-gradient(90deg, #E5B842, #E8CD83)',
                'red-gradient': 'linear-gradient(90deg, var(--color-red), #FF4D4D)',
                'surface-gradient': 'var(--surface-gradient)',
                'glow-gold': 'radial-gradient(ellipse at center, #E5B84215 0%, transparent 70%)',
                'glow-red': 'radial-gradient(ellipse at center, color-mix(in srgb, var(--color-red) 15%, transparent) 0%, transparent 70%)',
            },
            boxShadow: {
                'gold-sm': '0 0 12px #E5B84225',
                'gold-md': '0 0 24px #E5B84240',
                'red-sm': '0 0 12px color-mix(in srgb, var(--color-red) 25%, transparent)',
                'red-md': '0 0 24px color-mix(in srgb, var(--color-red) 40%, transparent)',
                'panel': '0 4px 24px #000000AA',
            },
            keyframes: {
                'flash-up': { '0%,100%': { background: 'transparent' }, '50%': { background: '#15B06D15' } },
                'flash-down': { '0%,100%': { background: 'transparent' }, '50%': { background: 'color-mix(in srgb, var(--color-red) 15%, transparent)' } },
                'pulse-gold': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
                'pulse-red': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
                'slide-in': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
                'fade-up': { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
            },
            animation: {
                'flash-up': 'flash-up 0.5s ease',
                'flash-down': 'flash-down 0.5s ease',
                'pulse-gold': 'pulse-gold 2s ease infinite',
                'pulse-red': 'pulse-red 2s ease infinite',
                'slide-in': 'slide-in 0.3s ease',
                'fade-up': 'fade-up 0.4s ease',
            },
        },
    },
    plugins: [],
}
