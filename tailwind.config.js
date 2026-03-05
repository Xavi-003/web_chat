/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-primary': 'hsl(222, 84%, 3%)',
                'bg-secondary': 'hsl(222, 40%, 7%)',
                'bg-panel': 'hsl(222, 40%, 10%)',
                'bg-hover': 'hsl(222, 40%, 13%)',
                'bg-selected': 'hsl(222, 40%, 16%)',
                'bg-bubble-out': 'hsl(210, 70%, 20%)',
                'bg-bubble-in': 'hsl(222, 40%, 12%)',
                'accent': 'hsl(176, 80%, 50%)',
                'accent-dim': 'hsl(176, 60%, 35%)',
                'accent-glow': 'hsl(176, 100%, 60%)',
                'border-subtle': 'hsl(222, 40%, 16%)',
                'text-primary': 'hsl(210, 20%, 92%)',
                'text-secondary': 'hsl(210, 15%, 60%)',
                'text-muted': 'hsl(210, 10%, 40%)',
                'danger': 'hsl(0, 80%, 55%)',
                'success': 'hsl(145, 65%, 45%)',
                'warning': 'hsl(38, 90%, 55%)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'glow-accent': '0 0 20px hsl(176, 80%, 50% / 0.3)',
                'glow-accent-sm': '0 0 8px hsl(176, 80%, 50% / 0.4)',
                'panel': '0 4px 32px hsl(222, 84%, 3% / 0.8)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                'fade-in': 'fadeIn 0.2s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
