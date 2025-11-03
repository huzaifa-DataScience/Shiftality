import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

const RADIUS = 22;

const GradientCard: React.FC<Props> = ({ children, style, contentStyle }) => {
  return (
    <View style={[styles.stack, style]}>
      {/* Top-right cyan spotlight */}
      {/* Top-right cyan spotlight (light at the END) */}
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

      {/* Bottom-center subtle bloom */}
      <LinearGradient
        colors={[
          'rgba(46,123,255,0.22)', // bottom bright
          'rgba(54, 119, 231, 0.1)',
          'rgba(46,123,255,0.00)', // fades out upward
        ]}
        locations={[0, 0.45, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={styles.bloomBottomV}
        pointerEvents="none"
      />

      {/* Horizontal centering mask (edges vanish, center lifted) */}
      <LinearGradient
        colors={[
          'rgba(46,123,255,0.00)', // left transparent
          'rgba(46,123,255,0.16)', // center brighter
          'rgba(46,123,255,0.00)', // right transparent
        ]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 1 }}
        style={styles.bloomBottomH}
        pointerEvents="none"
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
    // keep the base surface dark like the design; adjust if you already set it outside
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
    left: '4%',
    right: '4%',
    bottom: -12, // slight spill below the card for softness
    height: 30, // vertical reach
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS,
  },
  bloomBottomH: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -12,
    height: 70,
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS,
  },
  glow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: RADIUS,
  },
});

export default GradientCard;
