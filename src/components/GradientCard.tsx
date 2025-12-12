import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAppTheme, useThemeMode } from '../theme/ThemeProvider';

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

const RADIUS = 22;

const GradientCard: React.FC<Props> = ({ children, style, contentStyle }) => {
  const theme = useAppTheme();
  const { themeMode } = useThemeMode();
  const isDark = themeMode === 'dark';

  // Theme-aware colors
  const borderColors = isDark
    ? ['#0AC4FF', '#0AC4FF', '#1a4258ff'] // Dark mode: cyan to dark blue
    : ['#0AC4FF', '#0AC4FF', '#B0D4E8']; // Light mode: cyan to light blue

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
        'rgba(200, 220, 240, 0.4)', // soft mid-light depth
        'rgba(88, 165, 220, 0.25)', // subtle glow highlight
      ];

  const bloomColors = isDark
    ? [
        'rgba(46,123,255,0.22)', // bottom bright
        'rgba(54, 119, 231, 0.1)',
        'rgba(46,123,255,0.00)', // fades out upward
      ]
    : [
        'rgba(46,123,255,0.12)', // lighter for light mode
        'rgba(54, 119, 231, 0.06)',
        'rgba(46,123,255,0.00)',
      ];

  const bloomHColors = isDark
    ? [
        'rgba(46,123,255,0.00)', // left transparent
        'rgba(46,123,255,0.16)', // center brighter
        'rgba(46,123,255,0.00)', // right transparent
      ]
    : [
        'rgba(46,123,255,0.00)',
        'rgba(46,123,255,0.10)', // lighter for light mode
        'rgba(46,123,255,0.00)',
      ];

  const cardBackground = isDark ? '#1A1E2A' : 'rgba(255, 255, 255, 0.6)'; // More transparent for glass effect

  // In light mode, use glassmorphism effect with transparency
  if (!isDark) {
    return (
      <View style={style}>
        <View
          style={[
            styles.simpleCard,
            styles.glassCard,
            {
              backgroundColor: cardBackground,
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
          ]}
        >
          <View style={[styles.inner, contentStyle]}>{children}</View>
        </View>
      </View>
    );
  }

  // Dark mode: full gradient effects
  return (
    <View style={style}>
      {/* Gradient border wrapper - creates the visible border effect */}
      {/* Cyan at top-left, transitioning to dark blue at bottom-right */}
      <LinearGradient
        colors={borderColors}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.borderGradient}
      >
        <View style={[styles.stack, { backgroundColor: cardBackground }]}>
          {/* Top-right cyan spotlight */}
          <LinearGradient
            pointerEvents="none"
            colors={glowColors}
            locations={[0.0, 0.35, 0.65, 1.0]}
            start={{ x: 0.0, y: 1.0 }} // top-left corner
            end={{ x: 1.0, y: 0.0 }} // bottom-right glow
            style={styles.glow}
          />

          {/* Bottom-center subtle bloom */}
          <LinearGradient
            colors={bloomColors}
            locations={[0, 0.45, 1]}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
            style={styles.bloomBottomV}
            pointerEvents="none"
          />

          {/* Horizontal centering mask (edges vanish, center lifted) */}
          <LinearGradient
            colors={bloomHColors}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 1 }}
            style={styles.bloomBottomH}
            pointerEvents="none"
          />
          <View style={[styles.inner, contentStyle]}>{children}</View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  simpleCard: {
    borderRadius: RADIUS,
    borderWidth: 1,
    overflow: 'hidden',
  },
  glassCard: {
    // Glassmorphism effect - transparent with subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  borderGradient: {
    borderRadius: RADIUS,
    // padding: 1, // Creates 1px border width
    overflow: 'hidden',
  },
  stack: {
    position: 'relative',
    borderRadius: RADIUS - 1, // Slightly smaller to account for border
    overflow: 'hidden',
    // backgroundColor is now set dynamically in component
  },
  inner: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
  },

  // ---- Glows ----
  glowTopRight: {
    position: 'absolute',
    top: -12,
    right: -12,
    width: '85%',
    height: '32%',
    borderBottomLeftRadius: RADIUS * 1.6,
  },

  glowBottomCenter: {
    position: 'absolute',
    bottom: -20,
    // left: '20%',
    width: '100%', // centered band under the CTA area
    height: 70,
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS,
    borderBottomLeftRadius: RADIUS,
    borderBottomRightRadius: RADIUS,
  },
  bloomBottomV: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0, // Align with card bottom
    height: 30, // vertical reach
    borderBottomLeftRadius: RADIUS - 1,
    borderBottomRightRadius: RADIUS - 1,
  },
  bloomBottomH: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0, // Align with card bottom
    height: 70,
    borderBottomLeftRadius: RADIUS - 1,
    borderBottomRightRadius: RADIUS - 1,
  },
  glow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: RADIUS - 1,
  },
});

export default GradientCard;
