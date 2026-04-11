import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        grape: {
          100: '#f8eef6',
          200: '#efdbea',
          300: '#deb8d8',
          400: '#c483b3',
          500: '#9c528b',   // Grape Soda
          600: '#7e4170',
          700: '#623057',
          800: '#4a2342',
          900: '#341830',
        },
        blueslate: {
          100: '#f0f2f3',
          200: '#dce0e3',
          300: '#bcc3c8',
          400: '#9ba5ab',
          500: '#7a8790',
          600: '#59656f',   // Blue Slate
          700: '#47515a',
          800: '#363e45',
          900: '#252c32',
        },
        dust: {
          50:  '#fdfcfc',
          100: '#f8f6f5',   // page canvas
          200: '#f0edec',
          300: '#e5e0de',
          400: '#d7cdcc',   // Dust Grey
          500: '#c4b8b6',
          600: '#a89da0',
        },
        shadow: '#1d1e2c',  // Shadow Grey — primary text
        success: {
          100: '#e8f5f0',
          200: '#c3e8da',
          300: '#7ec4ac',
          400: '#4a9e80',
          500: '#2d7d5e',
          600: '#1f5f47',
          700: '#164535',
        },
        danger: {
          100: '#f8e8ee',
          200: '#edbed0',
          300: '#d48a9e',
          400: '#b85070',
          500: '#9b3050',
          600: '#7a2540',
          700: '#561a2d',
        },
        base: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(29,30,44,0.08), 0 1px 2px rgba(29,30,44,0.04)',
        'card-lg': '0 4px 12px rgba(29,30,44,0.12), 0 2px 4px rgba(29,30,44,0.06)',
        'glow-grape': '0 0 16px rgba(156,82,139,0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
