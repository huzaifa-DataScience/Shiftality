import { palette, rgba } from './colors';

export type AppTheme = {
  colors: {
    background: string;  // default screen bg (Sign In / Sign Up)
    text: string;        // default text color
    textMuted: string;   // subtitles / placeholders
    primary: string;     // main CTA (Get started)
    onPrimary: string;   // text on primary
    card: string;        // inputs/cards
    border: string;      // input borders & dividers
  };
};

// DEFAULT (no light/dark yet). We’ll add scheme switching here later.
export const appTheme: AppTheme = {
  colors: {
    background: palette.white,
    text: palette.black,
    textMuted: rgba(palette.black, 0.6),
    primary: palette.lightBlue,     // matches your SignIn/SignUp button
    onPrimary: palette.white,
    card: palette.white,
    border: rgba(palette.black, 0.08),
  },
};
