import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';
import typography from '@tailwindcss/typography';

const config: Config = {
  darkMode: ['class'],
  content: ['src/app/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}', 'src/lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        foreground: '#f4f4f5',
        muted: '#71717a',
        card: '#0f0f13',
        border: '#27272a',
        safe: '#10b981',
        risk: '#f43f5e',
        warn: '#f59e0b',
        info: '#0ea5e9'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', ...defaultTheme.fontFamily.sans],
        mono: ['SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', ...defaultTheme.fontFamily.mono]
      },
      boxShadow: {
        glowSafe: '0 0 20px -5px rgba(16, 185, 129, 0.4)',
        glowRisk: '0 0 20px -5px rgba(244, 63, 94, 0.4)'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-100% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        toastIn: {
          '0%': { opacity: '0', transform: 'translateY(0.5rem) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
        }
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        toastIn: 'toastIn 180ms ease-out'
      }
    }
  },
  plugins: [typography]
};

export default config;
