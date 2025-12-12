import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { useThemeMode, useAppTheme } from '../theme/ThemeProvider';
import { ms, scale, vs } from 'react-native-size-matters';

export default function ThemeToggleButton() {
  const { themeMode, toggleTheme } = useThemeMode();
  const theme = useAppTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={toggleTheme}
      activeOpacity={0.7}
      accessibilityLabel={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
      accessibilityRole="button"
    >
      <View style={styles.iconContainer}>
        <Text style={[styles.icon, { color: theme.colors.text }]}>
          {themeMode === 'dark' ? '☀️' : '🌙'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: vs(50),
    right: scale(20),
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: ms(24),
  },
});

