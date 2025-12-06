import { palette, rgba } from './colors';
import { lightPalette } from './lightColors';

export type AppTheme = {
  colors: {
    background: string; // screen bg
    text: string; // primary text
    textMuted: string; // secondary text / placeholders
    primary: string; // legacy solid primary (not used for gradient btn)
    onPrimary: string; // text on primary
    card: string; // panel / input bg
    border: string; // outlines & dividers

    // Additional colors for compatibility
    darkBlue: string; // app dark background (welcome/overall)
    white: string; // white text/backgrounds
    black: string; // black text/backgrounds
    lightBlue: string; // light blue accent
    txtBlue: string; // text blue accent
    cardBackground: string; // card background color (for GradientCardHome, etc.)

    // NEW (optional): gradient helpers
    primaryGradient: [string, string];
    cardGradient: [string, string];
  };
};

// Dark theme
export const darkTheme: AppTheme = {
  colors: {
    background: palette.bg,
    text: palette.text,
    textMuted: palette.textMuted,

    // Kept for compatibility; your gradient button ignores this and uses the gradient stops.
    primary: palette.lightBlue,
    onPrimary: palette.white,

    // Inputs/panels default bg; your GradientCard uses its own gradient.
    card: rgba('#FFFFFF', 0.04),
    border: palette.stroke,

    // Additional colors
    darkBlue: palette.darkBlue,
    white: palette.white,
    black: palette.black,
    lightBlue: palette.lightBlue,
    txtBlue: palette.txtBlue,
    cardBackground: '#1A1E2A', // card background for GradientCardHome

    // Helpful pre-bundled gradients
    primaryGradient: [palette.primaryStart, palette.primaryEnd],
    cardGradient: [palette.cardStart, palette.cardEnd],
  },
};

// Light theme
export const lightTheme: AppTheme = {
  colors: {
    background: lightPalette.bg,
    text: lightPalette.text,
    textMuted: lightPalette.textMuted,

    primary: lightPalette.lightBlue,
    onPrimary: lightPalette.white,

    card: rgba('#000000', 0.04),
    border: lightPalette.stroke,

    // Additional colors
    darkBlue: lightPalette.darkBlue,
    white: lightPalette.white,
    black: lightPalette.black,
    lightBlue: lightPalette.lightBlue,
    txtBlue: lightPalette.txtBlue,
    cardBackground: '#FFFFFF', // card background for GradientCardHome in light mode

    primaryGradient: [lightPalette.primaryStart, lightPalette.primaryEnd],
    cardGradient: [lightPalette.cardStart, lightPalette.cardEnd],
  },
};

// Default theme (dark for backward compatibility)
export const appTheme = darkTheme;
