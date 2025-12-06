import React from 'react';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeProvider';
import RootNavigator from './src/navigation/RootNavigator';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { StyleSheet, useColorScheme, TouchableOpacity, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import store from './src/store/store';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/lib/toastConfig.tsx';

function NavigationWithTheme() {
  const scheme = useColorScheme();
  return (
    // <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

function ThemeToggleButton() {
  const { themeMode, setThemeMode, isDark, theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const cycleTheme = async () => {
    if (themeMode === 'system') {
      await setThemeMode('light');
    } else if (themeMode === 'light') {
      await setThemeMode('dark');
    } else {
      await setThemeMode('system');
    }
  };

  const getThemeLabel = () => {
    if (themeMode === 'system') return 'System';
    return isDark ? 'Dark' : 'Light';
  };

  return (
    <TouchableOpacity
      onPress={cycleTheme}
      style={[
        styles.themeToggle,
        {
          top: insets.top + 10,
          backgroundColor: isDark
            ? 'rgba(255, 255, 255, 0.15)'
            : 'rgba(0, 0, 0, 0.15)',
          borderColor: isDark
            ? 'rgba(255, 255, 255, 0.3)'
            : 'rgba(0, 0, 0, 0.3)',
        },
      ]}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.themeToggleText,
          { color: theme.colors.text },
        ]}
      >
        {getThemeLabel()}
      </Text>
    </TouchableOpacity>
  );
}

function AppContent() {
  return (
    <View style={styles.container}>
      <NavigationWithTheme />
      <ThemeToggleButton />
      <Toast config={toastConfig} />
    </View>
  );
}

function AppWithTheme() {
  const { theme } = useAppTheme();
  return (
    <SafeAreaProvider style={{ backgroundColor: theme.colors.darkBlue }}>
      <AppContent />
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppWithTheme />
      </ThemeProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  themeToggle: {
    position: 'absolute',
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 9999,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  themeToggleText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'SourceSansPro-Regular',
  },
});
