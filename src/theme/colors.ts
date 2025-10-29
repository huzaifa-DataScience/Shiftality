// Only the 4 colors from your design.
// If the hex for lightBlue/black differ, just update here.
export const palette = {
  darkBlue:  '#0A1C4A', // welcome bg
  lightBlue: '#203A86', // buttons / accents
  black:     '#0E1117',
  white:     '#FFFFFF',
} as const;

// tiny helper for borders/shadows while staying within the palette
export const rgba = (hex: string, a: number) => {
  const h = hex.replace('#','');
  const n = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
};
