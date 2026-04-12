/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'space': '#05060f',
        'space-2': '#0a0c1a',
        'space-3': '#0f1128',
        'cyan-neon': '#00f0ff',
        'purple-neon': '#7b2dff',
        'red-alert': '#ff4240',
        'orange-hot': '#ff8c00',
        'green-signal': '#00ff88',
        'gray-dim': '#8892a4',
        'glass': 'rgba(255,255,255,0.04)',
        'glass-border': 'rgba(0,240,255,0.15)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0,240,255,0.3), 0 0 40px rgba(0,240,255,0.1)',
        'neon-purple': '0 0 20px rgba(123,45,255,0.3), 0 0 40px rgba(123,45,255,0.1)',
        'neon-red': '0 0 20px rgba(255,66,64,0.4), 0 0 40px rgba(255,66,64,0.15)',
        'neon-orange': '0 0 20px rgba(255,140,0,0.4)',
        'glass': '0 8px 32px rgba(0,0,0,0.4)',
      },
      animation: {
        'pulse-ring': 'pulseRing 2s ease-out infinite',
        'gradient-x': 'gradientX 4s ease infinite',
        'float': 'float 3s ease-in-out infinite',
        'number-tick': 'numberTick 0.3s ease-out',
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        numberTick: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundSize: {
        '300%': '300%',
      },
    },
  },
  plugins: [],
}
