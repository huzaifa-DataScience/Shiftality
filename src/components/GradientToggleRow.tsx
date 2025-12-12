import React from 'react';
import { View, Text, StyleSheet, Switch, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
  scale,
} from 'react-native-size-matters';
import { useAppTheme, useThemeMode } from '../theme/ThemeProvider';

type Props = {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  style?: ViewStyle;
};

export default function GradientToggleRow({
  label,
  value,
  onValueChange,
  style,
}: Props) {
  const theme = useAppTheme();
  const { themeMode } = useThemeMode();
  const isDark = themeMode === 'dark';

  if (isDark) {
    return (
      <LinearGradient
        colors={['#181C2B', '#1B3D58', '#1E6AA0']} // dark → blue sweep like your cards
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.box, style]}
      >
        <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>

        <View pointerEvents="box-none">
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: 'rgba(255,255,255,0.18)', true: '#61C3FF' }}
            thumbColor={'#FFFFFF'}
            ios_backgroundColor="rgba(255,255,255,0.18)"
            style={styles.switch}
          />
        </View>
      </LinearGradient>
    );
  }

  // Light mode: glassmorphism effect
  return (
    <View
      style={[
        styles.box,
        {
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.3)',
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 4 },
          elevation: 5,
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>

      <View pointerEvents="box-none">
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: 'rgba(0,0,0,0.1)', true: theme.colors.primary }}
          thumbColor={'#FFFFFF'}
          ios_backgroundColor="rgba(0,0,0,0.1)"
          style={styles.switch}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: '100%',
    minHeight: vs(64),
    borderRadius: s(18),
    paddingHorizontal: s(18),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: ms(18),
    fontWeight: '700',
    fontFamily: 'SourceSansPro-Regular',
  },
  // make the switch a bit chunkier like the design
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
    marginRight: scale(30),
  },
});
