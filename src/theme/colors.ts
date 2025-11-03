// Minimal palette for the hard-coded dark UI.
// (Kept your original keys for compatibility)
export const palette = {
  // original
  darkBlue: '#221E2E', // app dark background (welcome/overall)
  lightBlue: '#203A86',
  black: '#0E1117',
  white: '#FFFFFF',

  // dark mode base
  bg: '#0B0E14', // main screen background
  bgAlt: '#0E121A', // subtle alternate background

  // text
  text: '#E8EEF7',
  textMuted: '#9AA5B4',

  // strokes / outlines
  stroke: '#2A3446',

  // primary button gradient (left ➜ right)
  primaryStart: '#0390bbff',
  primaryEnd: '#059cd8ff',

  // auth card gradient (top-left ➜ bottom-right)
  cardStart: '#121826',
  cardEnd: '#0D1423',
} as const;

// tiny helper while staying within palette
export const rgba = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  const n = parseInt(
    h.length === 3
      ? h
          .split('')
          .map(c => c + c)
          .join('')
      : h,
    16,
  );
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
};
