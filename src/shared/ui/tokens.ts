export const tokens = {
  colors: {
    light: {
      bg: {
        primary: '#ffffff',
        secondary: '#f8fafc',
        tertiary: '#f1f5f9',
        inverse: '#0f172a',
      },
      text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#94a3b8',
        inverse: '#f8fafc',
        link: '#6366f1',
      },
      border: {
        default: '#e2e8f0',
        strong: '#cbd5e1',
      },
      accent: {
        primary: '#6366f1',
        primaryHover: '#4f46e5',
        secondary: '#10b981',
        secondaryHover: '#059669',
        warning: '#f59e0b',
        danger: '#ef4444',
        dangerHover: '#dc2626',
        info: '#3b82f6',
      },
    },
    dark: {
      bg: {
        primary: '#0f172a',
        secondary: '#1e293b',
        tertiary: '#334155',
        inverse: '#f8fafc',
      },
      text: {
        primary: '#f1f5f9',
        secondary: '#94a3b8',
        tertiary: '#64748b',
        inverse: '#0f172a',
        link: '#818cf8',
      },
      border: {
        default: '#334155',
        strong: '#475569',
      },
      accent: {
        primary: '#818cf8',
        primaryHover: '#6366f1',
        secondary: '#34d399',
        secondaryHover: '#10b981',
        warning: '#fbbf24',
        danger: '#f87171',
        dangerHover: '#ef4444',
        info: '#60a5fa',
      },
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  radius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
} as const;

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
