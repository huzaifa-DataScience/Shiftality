import React from 'react';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeProvider';
import RootNavigator from './src/navigation/RootNavigator';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import store from './src/store/store';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/lib/toastConfig.tsx';
import { navigationRef } from './src/lib/navigationRef';
import ThemeToggleButton from './src/components/ThemeToggleButton';

function NavigationWithTheme() {
  const theme = useAppTheme();
  
  // Create navigation theme based on app theme
  const navigationTheme = {
    dark: theme.colors.background === '#0B0E14', // dark theme background
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.primary,
    },
    fonts: {
      regular: {
        fontFamily: 'SourceSansPro-Regular',
        fontWeight: '400' as const,
      },
      medium: {
        fontFamily: 'SourceSansPro-Regular',
        fontWeight: '500' as const,
      },
      bold: {
        fontFamily: 'SourceSansPro-Regular',
        fontWeight: '700' as const,
      },
      heavy: {
        fontFamily: 'SourceSansPro-Regular',
        fontWeight: '800' as const,
      },
    },
  };

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

function AppContent() {
  const theme = useAppTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <NavigationWithTheme />
      <ThemeToggleButton />
      <Toast config={toastConfig} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
