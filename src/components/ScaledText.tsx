import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useFontSize } from '../theme/FontSizeProvider';

type ScaledTextProps = TextProps & {
  /** Base font size (will be scaled based on user preference) */
  baseFontSize?: number;
};

/**
 * A Text component that automatically applies font size scaling based on user preferences.
 * Use this instead of regular Text when you want font sizes to respect user settings.
 * 
 * @example
 * <ScaledText baseFontSize={16}>Hello World</ScaledText>
 * // In Normal mode: fontSize = 16
 * // In Small mode: fontSize = 13.6 (16 * 0.85)
 * // In Large mode: fontSize = 18.4 (16 * 1.15)
 */
export const ScaledText: React.FC<ScaledTextProps> = ({
  baseFontSize,
  style,
  ...props
}) => {
  const { scaledFontSize } = useFontSize();

  const dynamicStyle = baseFontSize
    ? { fontSize: scaledFontSize(baseFontSize) }
    : {};

  return <Text style={[dynamicStyle, style]} {...props} />;
};

export default ScaledText;

