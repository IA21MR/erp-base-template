/**
 * Design Tokens - Colores del sistema
 *
 * Paleta industrial SOTEK:
 * - Estilo brutalista/neo-brutalist
 * - Alto contraste
 * - Bordes marcados
 * - Sombras sólidas
 *
 * Los valores HSL se usan en CSS variables para flexibilidad
 */

export const colors = {
  // Light mode defaults
  light: {
    background: '0 0% 100%',
    foreground: '0 0% 0%',
    card: '0 0% 100%',
    cardForeground: '0 0% 0%',
    popover: '0 0% 100%',
    popoverForeground: '0 0% 0%',
    primary: '0 0% 0%',
    primaryForeground: '0 0% 100%',
    secondary: '0 0% 96%',
    secondaryForeground: '0 0% 0%',
    muted: '0 0% 96%',
    mutedForeground: '0 0% 45%',
    accent: '0 0% 90%',
    accentForeground: '0 0% 0%',
    destructive: '0 84% 60%',
    destructiveForeground: '0 0% 98%',
    border: '0 0% 0%',
    input: '0 0% 0%',
    ring: '0 0% 0%',
    // Sidebar
    sidebar: '0 0% 98%',
    sidebarForeground: '0 0% 0%',
    sidebarPrimary: '0 0% 0%',
    sidebarPrimaryForeground: '0 0% 100%',
    sidebarAccent: '0 0% 90%',
    sidebarAccentForeground: '0 0% 0%',
    sidebarBorder: '0 0% 0%',
    // Charts
    chart1: '12 76% 61%',
    chart2: '173 58% 39%',
    chart3: '197 37% 24%',
    chart4: '43 74% 66%',
    chart5: '27 87% 67%',
  },

  // Dark mode
  dark: {
    background: '0 0% 0%',
    foreground: '0 0% 100%',
    card: '0 0% 0%',
    cardForeground: '0 0% 100%',
    popover: '0 0% 0%',
    popoverForeground: '0 0% 100%',
    primary: '0 0% 100%',
    primaryForeground: '0 0% 0%',
    secondary: '0 0% 15%',
    secondaryForeground: '0 0% 100%',
    muted: '0 0% 15%',
    mutedForeground: '0 0% 65%',
    accent: '0 0% 15%',
    accentForeground: '0 0% 100%',
    destructive: '0 62% 30%',
    destructiveForeground: '0 0% 100%',
    border: '0 0% 100%',
    input: '0 0% 100%',
    ring: '0 0% 100%',
    // Sidebar
    sidebar: '240 5.9% 10%',
    sidebarForeground: '0 0% 100%',
    sidebarPrimary: '0 0% 100%',
    sidebarPrimaryForeground: '0 0% 0%',
    sidebarAccent: '0 0% 15%',
    sidebarAccentForeground: '0 0% 100%',
    sidebarBorder: '0 0% 100%',
    // Charts
    chart1: '220 70% 50%',
    chart2: '160 60% 45%',
    chart3: '30 80% 55%',
    chart4: '280 65% 60%',
    chart5: '340 75% 55%',
  },
} as const;

// Shadows (estilo brutalista)
export const shadows = {
  '2xs': '1px 1px 0px 0px',
  xs: '2px 2px 0px 0px',
  sm: '3px 3px 0px 0px',
  DEFAULT: '5px 5px 0px 0px',
  md: '8px 8px 0px 0px',
  lg: '12px 12px 0px 0px',
  xl: '16px 16px 0px 0px',
  '2xl': '24px 24px 0px 0px',
} as const;

// Typography
export const fontFamily = {
  sans: [
    'Space Grotesk',
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
  mono: [
    'Space Mono',
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Monaco',
    'Consolas',
    'monospace',
  ],
} as const;
