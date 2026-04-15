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
                    bg: '#050505',   // Deep black background
                    surface: '#0A0A0A', // Dark gray card background
                    panel: '#111111',   // slightly elevated panel
                    border: '#222222',  // subtle border
                    'border-gold': '#E5B84233',
                },
                up: '#15B06D',   // green from the chart
                down: '#FF4159',   // red from the chart
                muted: '#8A8A8A',  // general muted text
                dim: '#474747',
            },
            fontFamily: {
                display: ['"Inter"', 'sans-serif'],
                body: ['"DM Sans"', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            backgroundImage: {
                'gold-gradient': 'linear-gradient(90deg, #E5B842, #E8CD83)',
                'surface-gradient': 'linear-gradient(180deg, #111111 0%, #050505 100%)',
                'glow-gold': 'radial-gradient(ellipse at center, #E5B84215 0%, transparent 70%)',
            },
            boxShadow: {
                'gold-sm': '0 0 12px #E5B84225',
                'gold-md': '0 0 24px #E5B84240',
                'panel': '0 4px 24px #000000AA',
            },
            keyframes: {
                'flash-up': { '0%,100%': { background: 'transparent' }, '50%': { background: '#15B06D15' } },
                'flash-down': { '0%,100%': { background: 'transparent' }, '50%': { background: '#FF415915' } },
                'pulse-gold': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
                'slide-in': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
                'fade-up': { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
            },
            animation: {
                'flash-up': 'flash-up 0.5s ease',
                'flash-down': 'flash-down 0.5s ease',
                'pulse-gold': 'pulse-gold 2s ease infinite',
                'slide-in': 'slide-in 0.3s ease',
                'fade-up': 'fade-up 0.4s ease',
            },
        },
    },
    plugins: [],
}
