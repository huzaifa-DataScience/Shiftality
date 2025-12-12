import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAppTheme, useThemeMode } from '../theme/ThemeProvider';

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Optional: override gradient colors for light mode */
  lightModeColors?: string[];
  /** Optional: override gradient start point */
  gradientStart?: { x: number; y: number };
  /** Optional: override gradient end point */
  gradientEnd?: { x: number; y: number };
};

export default function GradientBackground({
  children,
  style,

  lightModeColors = ['#FFFFFF', '#D6EBFF', '#D6EBFF', '#E8E0FF', '#E8E0FF'],
  gradientStart = { x: 1, y: 0 },
  gradientEnd = { x: 0, y: 1 },
}: Props) {
  const theme = useAppTheme();
  const { themeMode } = useThemeMode();
  const isDark = themeMode === 'dark';

  if (isDark) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={lightModeColors}
      start={gradientStart}
      end={gradientEnd}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
