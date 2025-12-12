import { useMemo } from 'react';
import { TextStyle } from 'react-native';
import { useFontSize } from './FontSizeProvider';
import { moderateScale } from 'react-native-size-matters';

/**
 * Hook to create dynamic text styles that respect font size preferences.
 * Use this when you need to create styles that react to font size changes.
 * 
 * @param baseFontSize - The base font size to scale
 * @returns A TextStyle object with scaled fontSize
 * 
 * @example
 * const styles = useScaledStyles({ baseFontSize: 16 });
 * <Text style={styles}>Hello</Text>
 */
export const useScaledTextStyle = (baseFontSize: number): TextStyle => {
  const { scaledFontSize } = useFontSize();
  
  return useMemo(
    () => ({
      fontSize: scaledFontSize(baseFontSize),
    }),
    [baseFontSize, scaledFontSize],
  );
};

/**
 * Hook to get a function that scales font sizes dynamically.
 * Useful for creating multiple scaled font sizes in a component.
 * 
 * @returns A function that takes a base font size and returns the scaled size
 * 
 * @example
 * const scale = useScaledFontSize();
 * const titleStyle = { fontSize: scale(24) };
 * const bodyStyle = { fontSize: scale(14) };
 */
export const useScaledFontSize = () => {
  const { scaledFontSize } = useFontSize();
  return scaledFontSize;
};

/**
 * Helper to create scaled styles object for multiple font sizes.
 * Useful when you have multiple text elements with different base sizes.
 * 
 * @param sizes - Object with base font sizes
 * @returns Object with scaled font sizes
 * 
 * @example
 * const fontSizes = useScaledFontSizes({
 *   title: 24,
 *   subtitle: 18,
 *   body: 14,
 * });
 * // fontSizes = { title: 24, subtitle: 18, body: 14 } (scaled)
 */
export const useScaledFontSizes = <T extends Record<string, number>>(
  sizes: T,
): Record<keyof T, number> => {
  const { scaledFontSize } = useFontSize();
  
  return useMemo(() => {
    const scaled: Record<string, number> = {};
    Object.entries(sizes).forEach(([key, value]) => {
      scaled[key] = scaledFontSize(value);
    });
    return scaled as Record<keyof T, number>;
  }, [sizes, scaledFontSize]);
};

