/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Effinity brand colors - Design System 2.0
        brand: {
          primary: '#2979FF',           // Royal Blue
          primaryHover: '#1D4ED8',      // Darker blue on hover
          primaryLight: '#60A5FA',      // Light blue accent
          darkBg: '#0E1A2B',            // Deep navy background
          mediumBg: '#1A2F4B',          // Medium navy (cards)
          lightBg: '#243A5E',           // Light navy (hover states)
        },
        // Semantic colors
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          dark: '#065F46',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#92400E',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          dark: '#991B1B',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#DBEAFE',
          dark: '#1E40AF',
        },
        // Extended primary palette
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2979FF',
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#0E1A2B',
        },
        // Extended secondary palette
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        hebrew: ['Assistant', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Design System Typography Scale
        'display-1': ['60px', { lineHeight: '1.1', fontWeight: '800' }],
        'display-2': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-1': ['36px', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-2': ['28px', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-3': ['24px', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-4': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-base': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      spacing: {
        // 8pt Grid System (base-8 multiples)
        '0': '0px',
        '1': '4px',    // 0.5 × 8
        '2': '8px',    // 1 × 8
        '3': '12px',   // 1.5 × 8
        '4': '16px',   // 2 × 8
        '5': '20px',   // 2.5 × 8
        '6': '24px',   // 3 × 8
        '8': '32px',   // 4 × 8
        '10': '40px',  // 5 × 8
        '12': '48px',  // 6 × 8
        '16': '64px',  // 8 × 8
        '18': '72px',  // 9 × 8
        '20': '80px',  // 10 × 8
        '24': '96px',  // 12 × 8
        '32': '128px', // 16 × 8
        '40': '160px', // 20 × 8
        '48': '192px', // 24 × 8
        '56': '224px', // 28 × 8
        '64': '256px', // 32 × 8
        '88': '352px', // 44 × 8
      },
      maxWidth: {
        '7xl': '80rem',
        '8xl': '88rem',
        '9xl': '96rem',
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'strong': '0 8px 32px rgba(0, 0, 0, 0.16)',
        'glow-primary': '0 0 24px rgba(41, 121, 255, 0.3)',
        'glow-success': '0 0 24px rgba(16, 185, 129, 0.3)',
        'glow-warning': '0 0 24px rgba(245, 158, 11, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #2979FF 0%, #1D4ED8 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0E1A2B 0%, #1A2F4B 100%)',
      },
    },
  },
  plugins: [],
}