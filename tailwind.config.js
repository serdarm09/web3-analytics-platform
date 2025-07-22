/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        black: {
          primary: '#000000',
          secondary: '#0a0a0a',
          tertiary: '#1a1a1a',
          quaternary: '#2a2a2a',
        },
        accent: {
          silver: '#E4E4E7',
          slate: '#64748b',
          teal: '#2BC8B7', 
          blue: '#3b82f6',
          green: '#10b981',
          orange: '#f59e0b',
          red: '#ef4444',
          purple: '#6366f1',
        },
        white: {
          primary: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#e2e8f0',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #64748b 0%, #2BC8B7 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #3b82f6 0%, #64748b 100%)',
        'gradient-silver': 'linear-gradient(135deg, #E4E4E7 0%, #9ca3af 100%)',
        'gradient-radial-primary': 'radial-gradient(circle at center, rgba(100, 116, 139, 0.15) 0%, transparent 70%)',
        'gradient-radial-teal': 'radial-gradient(circle at center, rgba(43, 200, 183, 0.15) 0%, transparent 70%)',
        'gradient-mesh': `
          radial-gradient(at 40% 20%, rgba(100, 116, 139, 0.3) 0px, transparent 50%),
          radial-gradient(at 80% 0%, rgba(43, 200, 183, 0.2) 0px, transparent 50%),
          radial-gradient(at 0% 50%, rgba(59, 130, 246, 0.2) 0px, transparent 50%),
          radial-gradient(at 80% 50%, rgba(228, 228, 231, 0.2) 0px, transparent 50%),
          radial-gradient(at 0% 100%, rgba(100, 116, 139, 0.2) 0px, transparent 50%),
          radial-gradient(at 80% 100%, rgba(16, 185, 129, 0.2) 0px, transparent 50%)
        `,
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-pulse': 'glow-pulse 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'blur-in': 'blur-in 0.6s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'spotlight': 'spotlight 2s ease .75s 1 forwards',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        'gradient-y': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'center top',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center bottom',
          },
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px -10px currentColor' },
          '100%': { boxShadow: '0 0 40px -10px currentColor' },
        },
        'glow-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(100, 116, 139, 0.4), 0 0 40px rgba(43, 200, 183, 0.2)' 
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(100, 116, 139, 0.6), 0 0 80px rgba(43, 200, 183, 0.4)' 
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'blur-in': {
          '0%': { filter: 'blur(10px)', opacity: '0' },
          '100%': { filter: 'blur(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        spotlight: {
          '0%': {
            opacity: 0,
            transform: 'translate(-72%, -62%) scale(0.5)',
          },
          '100%': {
            opacity: 1,
            transform: 'translate(-50%,-40%) scale(1)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}