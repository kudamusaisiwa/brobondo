/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors - Teal
        primary: {
          50: '#e6f7f7',
          100: '#ccefef',
          200: '#99dfdf',
          300: '#66cfcf',
          400: '#33bfbf',
          500: '#046667', // Brand color
          600: '#035c5d',
          700: '#024445',
          800: '#022b2c',
          900: '#011516',
        },
        // Secondary Colors - Warm Gold
        secondary: {
          50: '#fff9eb',
          100: '#fef2d6',
          200: '#fde5ad',
          300: '#fcd884',
          400: '#fbcb5b',
          500: '#fabe32',
          600: '#e1ab2d',
          700: '#a98022',
          800: '#715617',
          900: '#382b0c',
        },
        // Surface Colors - Light Mode
        surface: {
          50: '#ffffff',
          100: '#fafafa', // Default background
          200: '#f4f4f5', // Subtle background
          300: '#e4e4e7', // Borders
          400: '#d1d1d6', // Disabled
          500: '#a0a0ab', // Placeholder
          600: '#71717a', // Secondary text
          700: '#52525b', // Primary text
          800: '#27272a', // Headings
          900: '#18181b', // High contrast
        },
        // Dark Mode Colors
        dark: {
          50: '#f9fafb',
          100: '#1c1c1e', // Modal background
          200: '#2c2c2e', // Card background
          300: '#3a3a3c', // Borders
          400: '#48484a', // Disabled
          500: '#636366', // Placeholder
          600: '#8e8e93', // Secondary text
          700: '#1a1a1a', // Background
          800: '#ebebf0', // Primary text
          900: '#ffffff', // High contrast
        },
        // System Status Colors
        success: {
          50: '#ecfdf3',
          100: '#d1fadf',
          200: '#a6f4c5',
          300: '#6ce9a6',
          400: '#32d583',
          500: '#12b76a',
          600: '#039855',
          700: '#027a48',
          800: '#05603a',
          900: '#054f31',
        },
        warning: {
          50: '#fffaeb',
          100: '#fef0c7',
          200: '#fedf89',
          300: '#fec84b',
          400: '#fdb022',
          500: '#f79009',
          600: '#dc6803',
          700: '#b54708',
          800: '#93370d',
          900: '#7a2e0e',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Accent Colors
        accent: {
          blue: '#0a84ff',
          indigo: '#5856d6',
          purple: '#af52de',
          pink: '#ff2d55',
          red: '#ff3b30',
          orange: '#ff9500',
          yellow: '#ffcc00',
          green: '#34c759',
          teal: '#5ac8fa',
          gray: '#8e8e93',
        },
      },
      boxShadow: {
        'soft-sm': '0 2px 4px 0 rgba(0,0,0,0.05)',
        'soft': '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
        'soft-md': '0 6px 10px -1px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.05)',
        'soft-lg': '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.05)',
        'modal': '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%)',
      },
      backgroundColor: {
        'blur-light': 'rgba(255, 255, 255, 0.72)',
        'blur-dark': 'rgba(26, 26, 26, 0.72)',
      },
    },
  },
  plugins: [],
};