import React from 'react';
import {View, Text, StyleSheet, Switch, ViewStyle} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {scale as s, verticalScale as vs, moderateScale as ms, scale} from 'react-native-size-matters';

type Props = {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  style?: ViewStyle;
};

export default function GradientToggleRow({label, value, onValueChange, style}: Props) {
  return (
    <LinearGradient
      colors={['#181C2B', '#1B3D58', '#1E6AA0']} // dark → blue sweep like your cards
      start={{x: 0, y: 0.5}}
      end={{x: 1, y: 0.5}}
      style={[styles.box, style]}
    >
      <Text style={styles.label}>{label}</Text>

      <View pointerEvents="box-none">
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{false: 'rgba(255,255,255,0.18)', true: '#61C3FF'}}
          thumbColor={'#FFFFFF'}
          ios_backgroundColor="rgba(255,255,255,0.18)"
          style={styles.switch}
        />
      </View>
    </LinearGradient>
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
    color: '#FFFFFF',
    fontSize: ms(18),
    fontWeight: '700',
  },
  // make the switch a bit chunkier like the design
  switch: {
    transform: [{scaleX: 1.1}, {scaleY: 1.1}],
    marginRight:scale(30)
  },
});
