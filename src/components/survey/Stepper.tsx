import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
  scale,
} from 'react-native-size-matters';
import { palette } from '../../theme';

type Props = {
  total: number;
  current: number; // 1-based
  width?: number; // defaults to scale(300)
};

export default function Stepper({ total, current, width = scale(300) }: Props) {
  return (
    <View style={[styles.stepperWrap, { width }]}>
      <View style={styles.stepperRail} />
      {Array.from({ length: total }).map((_, i) => {
        const idx = i + 1;
        const active = idx <= current;
        const dotLeft = ((idx - 1) / (total - 1)) * (width - s(24));
        return (
          <View key={idx} style={[styles.stepDotWrap, { left: dotLeft }]}>
            <LinearGradient
              colors={active ? ['#7FD0FF', '#4AA9FF'] : ['#1F2A3B', '#1F2A3B']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.stepDot}
            >
              <Text
                style={[
                  styles.stepNum,
                  { color: active ? '#0B1626' : '#AAB5C5' },
                ]}
              >
                {idx}
              </Text>
            </LinearGradient>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stepperWrap: { height: vs(50), justifyContent: 'center' },
  stepperRail: {
    position: 'absolute',
    left: s(12),
    right: s(12),
    height: vs(4),
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: s(2),
  },
  stepDotWrap: { position: 'absolute', top: vs(12) },
  stepDot: {
    width: s(28),
    height: s(28),
    borderRadius: s(14),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  stepNum: { fontSize: ms(12), fontWeight: '700', color: palette.white },
});
