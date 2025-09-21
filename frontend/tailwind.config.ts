import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  darkMode: 'class',
  content: ['./index.html','./src/**/*.{ts,html}'],
  theme: {
    container: { center: true, padding: '1rem', screens: { '2xl': '1320px' } },
    extend: {
      colors: {
        brand: {
          50:'#f1f6ff',100:'#e3edff',200:'#c2d7ff',300:'#9cbcff',
          400:'#74a0ff',500:'#4b83ff',600:'#2b66f0',700:'#1f4fcc',
          800:'#1b42a3',900:'#18397f'
        }
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        display: ['Playfair Display', ...defaultTheme.fontFamily.serif],
      },
      borderRadius: { xl: '1rem', '2xl':'1.25rem' },
      boxShadow: { soft: '0 10px 30px -12px rgb(0 0 0 / 0.25)' },
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
  ],
} satisfies Config
