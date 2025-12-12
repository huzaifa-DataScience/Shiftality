import { palette, rgba } from './colors';

export type AppTheme = {
  colors: {
    background: string; // screen bg
    text: string; // primary text
    textMuted: string; // secondary text / placeholders
    primary: string; // legacy solid primary (not used for gradient btn)
    onPrimary: string; // text on primary
    card: string; // panel / input bg
    border: string; // outlines & dividers

    // NEW (optional): gradient helpers
    primaryGradient: [string, string];
    cardGradient: [string, string];
  };
};

export type ThemeMode = 'light' | 'dark';

// DARK theme
export const darkTheme: AppTheme = {
  colors: {
    background: palette.bg,
    text: palette.text,
    textMuted: palette.textMuted,

    // Kept for compatibility; your gradient button ignores this and uses the gradient stops.
    primary: '#00C2FF',
    onPrimary: palette.white,

    // Inputs/panels default bg; your GradientCard uses its own gradient.
    card: rgba('#FFFFFF', 0.04),
    border: palette.stroke,

    // Helpful pre-bundled gradients
    primaryGradient: [palette.primaryStart, palette.primaryEnd],
    cardGradient: ['#143f65ff', '#1C2A3A'],
  },
};

// LIGHT theme
export const lightTheme: AppTheme = {
  colors: {
    background: '#F5F7FA', // light gray background
    text: '#1A1F2E', // dark text
    textMuted: '#6B7280', // muted gray text

    primary: '#203A86',
    onPrimary: palette.white,

    card: rgba('#FFFFFF', 0.8), // white card with slight transparency
    border: '#B8DCFF', // light blue border to match design

    // Lighter gradients for light mode
    primaryGradient: ['#4CC3FF', '#61C3FF'],
    cardGradient: ['#FFFFFF', '#F9FAFB'],
  },
};

// Default export for backward compatibility
export const appTheme = darkTheme;
