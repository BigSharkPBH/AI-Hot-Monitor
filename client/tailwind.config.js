/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── 底色系统 ──────────────────────
        ink:      '#080808',   // 深黑底色
        'ink-1':  '#0f0f0f',
        'ink-2':  '#161616',
        'ink-3':  '#1e1e1e',
        // ── 信号色 ────────────────────────
        signal:   '#e8ff47',   // 主信号黄绿（新！用于 CTA）
        flux:     '#22d3ee',   // 电蓝青（数据高亮）
        fire:     '#f97316',   // 热榜橙
        alert:    '#ef4444',   // 警报红
        'alert-2':'#ff6b6b',
        emerald:  '#10b981',   // 在线绿
        // ── 文字层级 ──────────────────────
        'text-1': '#f5f5f5',
        'text-2': '#a3a3a3',
        'text-3': '#5a5a5a',
        // ── 旧兼容 ────────────────────────
        'cyan-neon':    '#22d3ee',
        'purple-neon':  '#a855f7',
        'red-alert':    '#ef4444',
        'orange-hot':   '#f97316',
        'green-signal': '#10b981',
        'gray-dim':     '#a3a3a3',
      },
      fontFamily: {
        display: ['"Inter"', 'sans-serif'],
        body:    ['"Inter"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        'glow-signal': '0 0 24px rgba(232,255,71,0.25)',
        'glow-flux':   '0 0 24px rgba(34,211,238,0.25)',
        'glow-fire':   '0 0 24px rgba(249,115,22,0.3)',
        'glow-alert':  '0 0 24px rgba(239,68,68,0.35)',
        'card':        '0 1px 3px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
        'card-hover':  '0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
      },
      animation: {
        'spotlight':        'spotlight 1.8s ease-out forwards',
        'beam-slide':       'beamSlide 3s linear infinite',
        'border-spin':      'borderSpin 4s linear infinite',
        'fade-up':          'fadeUp 0.4s ease-out forwards',
        'shimmer':          'shimmer 1.5s infinite',
        'pulse-dot':        'pulseDot 2s ease-in-out infinite',
        'number-tick':      'numberTick 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'slide-in-left':    'slideInLeft 0.3s ease-out forwards',
      },
      keyframes: {
        spotlight: {
          '0%':   { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        beamSlide: {
          '0%':   { transform: 'translateX(-100%) skewX(-15deg)' },
          '100%': { transform: 'translateX(400%) skewX(-15deg)' },
        },
        borderSpin: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%':      { transform: 'scale(1.5)', opacity: '0.6' },
        },
        numberTick: {
          '0%':   { opacity: '0', transform: 'translateY(-12px) scale(0.9)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      backgroundSize: {
        '300%': '300%',
        '200%': '200%',
      },
    },
  },
  plugins: [],
}
