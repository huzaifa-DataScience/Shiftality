import { moderateScale } from 'react-native-size-matters';
import { useFontSize } from './FontSizeProvider';

/**
 * Hook to get a font size scaling function that applies the user's font size preference
 * @returns A function that scales font sizes based on user preference
 * 
 * @example
 * const scaledFontSize = useScaledFontSize();
 * const fontSize = scaledFontSize(16); // Returns 16 * multiplier (e.g., 13.6 for Small, 16 for Normal, 18.4 for Large)
 */
export const useScaledFontSize = () => {
  const { fontSizeMultiplier } = useFontSize();
  
  return (size: number) => {
    return moderateScale(size * fontSizeMultiplier);
  };
};

/**
 * Direct function to get scaled font size (for use outside React components)
 * @param size Base font size
 * @param multiplier Font size multiplier (from useFontSize hook)
 * @returns Scaled font size
 */
export const getScaledFontSize = (size: number, multiplier: number) => {
  return moderateScale(size * multiplier);
};

