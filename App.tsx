import React from 'react';
import {ThemeProvider, useAppTheme} from './src/theme/ThemeProvider';
import RootNavigator from './src/navigation/RootNavigator';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {StyleSheet, useColorScheme} from 'react-native';

function NavigationWithTheme() {
  const scheme = useColorScheme();
  return (
    <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationWithTheme />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

