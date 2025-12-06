// src/theme/lightColors.ts
// Light mode color palette
export const lightPalette = {
  // base colors
  darkBlue: '#F5F7FA', // light background for welcome/overall
  lightBlue: '#203A86',
  txtBlue: '#51cce5ff',
  black: '#1A1A1A',
  white: '#FFFFFF',

  // light mode base
  bg: '#F8F9FA', // main screen background
  bgAlt: '#FFFFFF', // alternate background

  // text
  text: '#1A1A1A',
  textMuted: '#6B7280',

  // strokes / outlines
  stroke: '#E5E7EB',

  // primary button gradient (left ➜ right)
  primaryStart: '#0390bbff',
  primaryEnd: '#059cd8ff',

  // auth card gradient (top-left ➜ bottom-right)
  cardStart: '#FFFFFF',
  cardEnd: '#F3F4F6',
} as const;
