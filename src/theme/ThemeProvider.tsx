import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme, AppTheme, ThemeMode } from './theme';

type ThemeContextType = {
  theme: AppTheme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
};

const ThemeCtx = createContext<ThemeContextType>({
  theme: darkTheme,
  themeMode: 'dark',
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export const useAppTheme = () => {
  const context = useContext(ThemeCtx);
  return context.theme;
};

export const useThemeMode = () => {
  const context = useContext(ThemeCtx);
  return {
    themeMode: context.themeMode,
    toggleTheme: context.toggleTheme,
    setThemeMode: context.setThemeMode,
  };
};

const THEME_STORAGE_KEY = '@app_theme_mode';

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setThemeModeState(savedTheme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  // Save theme preference to storage
  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  };

  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  // Don't render until theme is loaded to avoid flash
  if (isLoading) {
    return null;
  }

  return (
    <ThemeCtx.Provider
      value={{
        theme,
        themeMode,
        toggleTheme,
        setThemeMode,
      }}
    >
      {children}
    </ThemeCtx.Provider>
  );
};
