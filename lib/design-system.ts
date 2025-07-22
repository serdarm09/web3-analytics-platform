// Design System Constants for Web3 Analytics Platform

export const colors = {
  // Base colors
  black: {
    primary: '#000000',
    secondary: '#0a0a0a',
    tertiary: '#1a1a1a',
    quaternary: '#2a2a2a',
  },
  white: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#e2e8f0',
  },
  gray: {
    primary: '#1f1f1f',
    secondary: '#2a2a2a',
    border: '#333333',
    text: '#9ca3af',
    textLight: '#d1d5db',
  },
  // Accent colors
  accent: {
    gray: '#6b7280',
    silver: '#9ca3af',
    slate: '#475569',
    green: '#10b981',
    orange: '#f59e0b',
    red: '#ef4444',
  },
} as const;

export const spacing = {
  xs: '0.5rem',     // 8px
  sm: '0.75rem',    // 12px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.25rem',
  DEFAULT: '0.5rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
} as const;

export const fontSize = {
  xs: ['0.75rem', { lineHeight: '1rem' }],
  sm: ['0.875rem', { lineHeight: '1.25rem' }],
  base: ['1rem', { lineHeight: '1.5rem' }],
  lg: ['1.125rem', { lineHeight: '1.75rem' }],
  xl: ['1.25rem', { lineHeight: '1.75rem' }],
  '2xl': ['1.5rem', { lineHeight: '2rem' }],
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  '5xl': ['3rem', { lineHeight: '1' }],
  '6xl': ['3.75rem', { lineHeight: '1' }],
} as const;

export const animation = {
  transition: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    DEFAULT: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  duration: {
    fast: '150ms',
    DEFAULT: '300ms',
    slow: '500ms',
    verySlow: '1000ms',
  },
} as const;

export const effects = {
  glassmorphism: {
    light: {
      backdropFilter: 'blur(20px)',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
    },
    DEFAULT: {
      backdropFilter: 'blur(20px)',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
    },
    dark: {
      backdropFilter: 'blur(20px)',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
  },
  glow: {
    gray: '0 0 40px -10px rgba(107, 114, 128, 0.6)',
    silver: '0 0 40px -10px rgba(156, 163, 175, 0.6)',
    slate: '0 0 40px -10px rgba(71, 85, 105, 0.6)',
    primary: `
      0 0 20px rgba(107, 114, 128, 0.4),
      0 0 40px rgba(156, 163, 175, 0.2),
      0 0 80px rgba(71, 85, 105, 0.1)
    `,
  },
  gradient: {
    primary: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
    secondary: 'linear-gradient(135deg, #475569 0%, #6b7280 100%)',
    tertiary: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
  },
} as const;

// Typography classes
export const typography = {
  h1: 'text-4xl md:text-5xl lg:text-6xl font-bold',
  h2: 'text-3xl md:text-4xl lg:text-5xl font-bold',
  h3: 'text-2xl md:text-3xl lg:text-4xl font-semibold',
  h4: 'text-xl md:text-2xl lg:text-3xl font-semibold',
  h5: 'text-lg md:text-xl lg:text-2xl font-medium',
  h6: 'text-base md:text-lg lg:text-xl font-medium',
  body: 'text-base',
  bodyLarge: 'text-lg',
  bodySmall: 'text-sm',
  caption: 'text-xs',
} as const;

// Component sizes
export const componentSizes = {
  button: {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-7 py-3.5 text-lg',
  },
  input: {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  },
} as const;

// Utility functions
export function getTextColorForBackground(background: 'dark' | 'light' = 'dark') {
  return background === 'dark' ? colors.white.primary : colors.black.primary;
}

export function getGrayTextColor(variant: 'primary' | 'secondary' = 'primary') {
  return variant === 'primary' ? colors.gray.text : colors.gray.textLight;
}