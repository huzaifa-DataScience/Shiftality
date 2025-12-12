import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
  scale,
} from 'react-native-size-matters';
import { useAppTheme, useThemeMode } from '../../theme/ThemeProvider';

type Props = {
  total: number;
  current: number; // 1-based
  width?: number; // defaults to scale(300)
};

export default function Stepper({ total, current, width = scale(300) }: Props) {
  const theme = useAppTheme();
  const { themeMode } = useThemeMode();
  const isDark = themeMode === 'dark';
  
  return (
    <View style={[styles.stepperWrap, { width }]}>
      <View style={[
        styles.stepperRail,
        { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }
      ]} />
      {Array.from({ length: total }).map((_, i) => {
        const idx = i + 1;
        const active = idx <= current;
        const dotLeft = ((idx - 1) / (total - 1)) * (width - s(24));
        return (
          <View key={idx} style={[styles.stepDotWrap, { left: dotLeft }]}>
            <LinearGradient
              colors={active 
                ? (isDark ? ['#7FD0FF', '#4AA9FF'] : theme.colors.primaryGradient)
                : (isDark ? ['#1F2A3B', '#1F2A3B'] : ['#E5E7EB', '#E5E7EB'])
              }
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.stepDot}
            >
              <Text
                style={[
                  styles.stepNum,
                  { 
                    color: active 
                      ? (isDark ? '#0B1626' : theme.colors.onPrimary)
                      : (isDark ? '#AAB5C5' : theme.colors.textMuted)
                  },
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
  stepNum: {
    fontSize: ms(12),
    fontWeight: '700',
    fontFamily: 'SourceSansPro-Regular',
  },
});
