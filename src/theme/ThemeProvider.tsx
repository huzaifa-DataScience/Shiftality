import React, { createContext, useContext } from 'react';
import { appTheme, AppTheme } from './theme';

const ThemeCtx = createContext<AppTheme>(appTheme);
export const useAppTheme = () => useContext(ThemeCtx);

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  // LATER: swap appTheme with light/dark by using useColorScheme()
  // const scheme = useColorScheme();
  // const theme = scheme === 'dark' ? darkTheme : lightTheme;
  return <ThemeCtx.Provider value={appTheme}>{children}</ThemeCtx.Provider>;
};
