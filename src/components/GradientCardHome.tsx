// src/components/GradientCardHome.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAppTheme } from '../theme/ThemeProvider';

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

const RADIUS = 22;

const GradientCardHome: React.FC<Props> = ({
  children,
  style,
  contentStyle,
}) => {
  const { theme, isDark } = useAppTheme();

  // Theme-aware gradient colors
  const glowColors = isDark
    ? [
        'rgba(0, 0, 0, 0)', // top-left fade
        'rgba(16, 20, 25, 0.2)', // cool mid tone
        'rgba(42, 60, 75, 0.45)', // soft mid-dark depth
        'rgba(88, 165, 220, 0.60)', // glow highlight near bottom-right
      ]
    : [
        'rgba(255, 255, 255, 0)', // top-left fade
        'rgba(240, 245, 250, 0.3)', // light mid tone
        'rgba(200, 220, 240, 0.5)', // soft light depth
        'rgba(100, 150, 200, 0.4)', // subtle glow highlight
      ];

  return (
    <View
      style={[
        styles.stack,
        style,
        { backgroundColor: theme.colors.cardBackground },
      ]}
    >
      {/* Soft diagonal gradient: bright bottom-right, darker mid, subtle fade to top-left */}
      <LinearGradient
        pointerEvents="none"
        colors={glowColors}
        locations={[0.0, 0.35, 0.65, 1.0]}
        start={{ x: 0.0, y: 1.0 }} // top-left corner
        end={{ x: 1.0, y: 0.0 }} // bottom-right glow
        style={styles.glow}
      />

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
  inner: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
  },
  glow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: RADIUS,
  },
});

export default GradientCardHome;
