/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f3',
          100: '#fde6e7',
          200: '#fbd0d5',
          300: '#f7aab2',
          400: '#f27a8a',
          500: '#e63950',
          600: '#d31f3c',
          700: '#b01530',
          800: '#94152d',
          900: '#7d152a',
        },
        secondary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#b9e6fe',
          300: '#7cd4fd',
          400: '#36bffa',
          500: '#0ba5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        accent: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        flame: {
          50: '#fff3ed',
          100: '#ffe4d0',
          200: '#ffc49e',
          300: '#ff9a68',
          400: '#ff6530',
          500: '#e83800',
          600: '#e63200',
          700: '#bf2400',
          800: '#991d00',
          900: '#7c1b00',
          950: '#430c00',
        },
        onyx: {
          50: '#f0f4f1',
          100: '#dde6df',
          200: '#bccec1',
          300: '#93aea0',
          400: '#6d9080',
          500: '#537569',
          600: '#415d53',
          700: '#354c43',
          800: '#2b3d37',
          900: '#1c2a24',
          950: '#0a100d',
        },
        powder: {
          50: '#fdfcfb',
          100: '#f9f6f5',
          200: '#f2ece9',
          300: '#dcccc6',
          400: '#c9b4ab',
          500: '#b49489',
          600: '#9a7166',
          700: '#7f574f',
          800: '#6a4544',
          900: '#593a39',
          950: '#311f1e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-slow': 'bounce 3s infinite',
        'shake': 'shake 0.45s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '15%, 45%, 75%': { transform: 'translateX(-5px)' },
          '30%, 60%, 90%': { transform: 'translateX(5px)' },
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          primary:           '#e83800', // flame-500
          'primary-content': '#ffffff',
          secondary:         '#0ba5e9', // secondary-500
          'secondary-content': '#ffffff',
          accent:            '#eab308', // accent-500
          'accent-content':  '#ffffff',
          neutral:           '#354c43', // onyx-700
          'neutral-content': '#f9f6f5', // powder-100
          'base-100':        '#fdfcfb', // powder-50
          'base-200':        '#f9f6f5', // powder-100
          'base-300':        '#f2ece9', // powder-200
          'base-content':    '#1c2a24', // onyx-900
          info:              '#0ba5e9',
          'info-content':    '#ffffff',
          success:           '#10b981',
          'success-content': '#ffffff',
          warning:           '#f59e0b',
          'warning-content': '#ffffff',
          error:             '#ef4444',
          'error-content':   '#ffffff',
        },
      },
      {
        dark: {
          primary:           '#e83800', // flame-500
          'primary-content': '#ffffff',
          secondary:         '#0369a1', // secondary-700
          'secondary-content': '#ffffff',
          accent:            '#ca8a04', // accent-600
          'accent-content':  '#ffffff',
          neutral:           '#1c2a24', // onyx-900
          'neutral-content': '#f9f6f5', // powder-100
          'base-100':        '#2b3d37', // onyx-800 — card/surface
          'base-200':        '#1c2a24', // onyx-900 — page bg
          'base-300':        '#354c43', // onyx-700 — borders
          'base-content':    '#f9f6f5', // powder-100
          info:              '#36bffa',
          'info-content':    '#0c4a6e',
          success:           '#10b981',
          'success-content': '#ffffff',
          warning:           '#f59e0b',
          'warning-content': '#000000',
          error:             '#f87171',
          'error-content':   '#ffffff',
        },
      },
    ],
    darkTheme: 'dark',
    base: true,
    styled: true,
    utils: true,
    logs: false,
  },
}
