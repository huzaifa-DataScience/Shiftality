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

// Hard-coded DARK theme (no light/dark switch yet)
export const appTheme: AppTheme = {
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

    // Helpful pre-bundled gradients
    primaryGradient: [palette.primaryStart, palette.primaryEnd],
    cardGradient: [palette.cardStart, palette.cardEnd],
  },
};
