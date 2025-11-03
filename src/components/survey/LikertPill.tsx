import React, { useCallback, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  LayoutChangeEvent,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {
  Defs,
  Rect,
  Stop,
  LinearGradient as SvgGrad,
} from 'react-native-svg';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import { palette } from '../../theme';

const PILL_H = vs(44);
const PILL_R = s(24);

type OutlineProps = {
  width: number;
  onPress?: () => void;
  children: React.ReactNode;
  stroke?: number;
};

const OutlinePill = ({
  width,
  onPress,
  children,
  stroke = 1,
}: OutlineProps) => {
  const [h, setH] = useState(PILL_H);
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setH(Math.max(PILL_H, Math.round(e.nativeEvent.layout.height)));
  }, []);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onLayout={onLayout}
      style={{
        width,
        height: PILL_H,
        borderRadius: PILL_R,
        justifyContent: 'center',
      }}
    >
      <Svg
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        width={width}
        height={h}
        viewBox={`0 0 ${width} ${h}`}
      >
        <Defs>
          <SvgGrad id="pillBorderGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#0AC4FF" />
            <Stop offset="0.52" stopColor="#0AC4FF" />
            <Stop offset="1" stopColor="#1a4258ff" />
          </SvgGrad>
        </Defs>
        <Rect
          x={stroke / 2}
          y={stroke / 2}
          width={width - stroke}
          height={h - stroke}
          rx={PILL_R}
          ry={PILL_R}
          fill="transparent"
          stroke="url(#pillBorderGrad)"
          strokeWidth={stroke}
        />
      </Svg>
      <View style={styles.pillInnerBase}>{children}</View>
    </TouchableOpacity>
  );
};

type FilledProps = {
  width: number;
  onPress?: () => void;
  children: React.ReactNode;
};
const FilledPill = ({ width, onPress, children }: FilledProps) => (
  <TouchableOpacity
    activeOpacity={0.92}
    onPress={onPress}
    style={{ width, borderRadius: PILL_R, overflow: 'hidden' }}
  >
    <LinearGradient
      colors={['#56adc7ff', '#03adf0ff']}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={{
        width,
        height: PILL_H,
        borderRadius: PILL_R,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </LinearGradient>
  </TouchableOpacity>
);

export type LikertValue =
  | 'agree'
  | 'unsure'
  | 'disagree'
  | 's_agree'
  | 's_disagree'
  | null;

type PillProps = {
  label: string;
  selected?: boolean;
  width: number;
  onPress?: () => void;
};

export default function LikertPill({
  label,
  selected,
  width,
  onPress,
}: PillProps) {
  return selected ? (
    <FilledPill width={width} onPress={onPress}>
      <Text style={styles.textSelected}>{label}</Text>
    </FilledPill>
  ) : (
    <OutlinePill width={width} onPress={onPress}>
      <Text style={styles.textIdle}>{label}</Text>
    </OutlinePill>
  );
}

const styles = StyleSheet.create({
  pillInnerBase: {
    height: PILL_H,
    borderRadius: PILL_R,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textIdle: { color: palette.white, fontSize: ms(14), fontWeight: '700' },
  textSelected: { color: palette.white, fontSize: ms(14), fontWeight: '800' },
});
