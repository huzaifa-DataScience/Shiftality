// src/components/GradientCardLockshift.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { scale } from 'react-native-size-matters';
import { useAppTheme, useThemeMode } from '../theme/ThemeProvider';

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

const RADIUS = 18;

const GradientCardLockshift: React.FC<Props> = ({
  children,
  style,
  contentStyle,
}) => {
  const theme = useAppTheme();
  const { themeMode } = useThemeMode();
  const isDark = themeMode === 'dark';

  if (isDark) {
    return (
      <View style={[styles.stack, { backgroundColor: theme.colors.cardBackground }, style]}>
        {/* Soft diagonal gradient: bright bottom-right, darker mid, subtle fade to top-left */}
        <LinearGradient
          pointerEvents="none"
          colors={[
            'rgba(0, 0, 0, 0)', // top-left fade
            'rgba(16, 20, 25, 0.2)', // cool mid tone
            'rgba(42, 60, 75, 0.45)', // soft mid-dark depth
            'rgba(88, 165, 220, 0.60)', // glow highlight near bottom-right
          ]}
          locations={[0.0, 0.35, 0.65, 1.0]}
          start={{ x: 0.0, y: 1.0 }} // top-left corner
          end={{ x: 1.0, y: 0.0 }} // bottom-right glow
          style={styles.glow}
        />

        <View style={[styles.inner, contentStyle]}>{children}</View>
      </View>
    );
  }

  // Light mode: glassmorphism effect
  return (
    <View
      style={[
        styles.stack,
        styles.simpleCard,
        {
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          borderColor: 'rgba(255, 255, 255, 0.3)',
        },
        style,
      ]}
    >
      <View style={[styles.inner, contentStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  stack: {
    position: 'relative',
    borderRadius: RADIUS,
    overflow: 'hidden',
  },
  simpleCard: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  inner: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
  },
  glow: {
    position: 'absolute',
    width: scale(370),
    height: scale(350),
    borderRadius: RADIUS,
  },
});

export default GradientCardLockshift;
