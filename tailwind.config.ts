import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Agent tier palette
        clay:   '#c4956a',
        bronze: '#cd7f32',
        silver: '#c0c0c0',
        gold:   '#ffd700',
        jade:   '#00a86b',
        // Palace UI
        ink:        '#1a1209',
        parchment:  '#f5e9c8',
        silk:       '#e8d5b0',
        vermilion:  '#cc2b00',
        imperial:   '#7b1313',
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans:  ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
