import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { moderateScale } from 'react-native-size-matters';

export type FontSize = 'Small' | 'Normal' | 'Large';

type FontSizeContextType = {
  fontSize: FontSize;
  fontSizeMultiplier: number;
  setFontSize: (size: FontSize) => void;
  scaledFontSize: (size: number) => number; // Helper function to scale font sizes
};

const FontSizeCtx = createContext<FontSizeContextType>({
  fontSize: 'Normal',
  fontSizeMultiplier: 1,
  setFontSize: () => {},
  scaledFontSize: (size: number) => moderateScale(size),
});

export const useFontSize = () => {
  const context = useContext(FontSizeCtx);
  return {
    fontSize: context.fontSize,
    fontSizeMultiplier: context.fontSizeMultiplier,
    setFontSize: context.setFontSize,
    scaledFontSize: context.scaledFontSize,
  };
};

const FONT_SIZE_STORAGE_KEY = '@app_font_size';

// Font size multipliers
const FONT_SIZE_MULTIPLIERS: Record<FontSize, number> = {
  Small: 0.85,
  Normal: 1,
  Large: 1.15,
};

export const FontSizeProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [fontSize, setFontSizeState] = useState<FontSize>('Normal');
  const [isLoading, setIsLoading] = useState(true);

  // Load font size preference from storage on mount
  useEffect(() => {
    const loadFontSize = async () => {
      try {
        const savedFontSize = await AsyncStorage.getItem(FONT_SIZE_STORAGE_KEY);
        if (
          savedFontSize === 'Small' ||
          savedFontSize === 'Normal' ||
          savedFontSize === 'Large'
        ) {
          setFontSizeState(savedFontSize);
        }
      } catch (error) {
        console.error('Error loading font size:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadFontSize();
  }, []);

  // Save font size preference to storage
  const setFontSize = async (size: FontSize) => {
    try {
      await AsyncStorage.setItem(FONT_SIZE_STORAGE_KEY, size);
      setFontSizeState(size);
    } catch (error) {
      console.error('Error saving font size:', error);
    }
  };

  const fontSizeMultiplier = FONT_SIZE_MULTIPLIERS[fontSize];

  // Helper function to scale font sizes
  const scaledFontSize = (size: number) => {
    return moderateScale(size * fontSizeMultiplier);
  };

  // Don't render until font size is loaded to avoid flash
  if (isLoading) {
    return null;
  }

  return (
    <FontSizeCtx.Provider
      value={{
        fontSize,
        fontSizeMultiplier,
        setFontSize,
        scaledFontSize,
      }}
    >
      {children}
    </FontSizeCtx.Provider>
  );
};

