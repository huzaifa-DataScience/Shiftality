import React from 'react';
import {ThemeProvider, useAppTheme} from './src/theme/ThemeProvider';
import RootNavigator from './src/navigation/RootNavigator';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {StyleSheet, useColorScheme} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { palette } from './src/theme';

function NavigationWithTheme() {
  const scheme = useColorScheme();
  return (
    // <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
    <NavigationContainer  >
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider style={{backgroundColor: palette.darkBlue}}>
    <ThemeProvider>
      <NavigationWithTheme />
    </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

