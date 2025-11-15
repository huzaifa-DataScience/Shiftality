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

const DEFAULT_H = vs(44);

type OutlineProps = {
  width: number;
  onPress?: () => void;
  children: React.ReactNode;
  stroke?: number;
  borderRadius?: number;
};

const OutlinePill = ({
  width,
  onPress,
  children,
  stroke = 1,
  borderRadius = s(24),
}: OutlineProps) => {
  const [h, setH] = useState(DEFAULT_H);
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setH(Math.max(DEFAULT_H, Math.round(e.nativeEvent.layout.height)));
  }, []);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onLayout={onLayout}
      style={{
        width,
        height: DEFAULT_H,
        borderRadius,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
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
          rx={borderRadius}
          ry={borderRadius}
          fill="transparent"
          stroke="url(#pillBorderGrad)"
          strokeWidth={stroke}
        />
      </Svg>
      <View
        style={[
          styles.pillInnerBase,
          { borderRadius, backgroundColor: 'rgba(3, 149, 193, 0.1)' },
        ]}
      >
        {children}
      </View>
    </TouchableOpacity>
  );
};

type FilledProps = {
  width: number;
  onPress?: () => void;
  children: React.ReactNode;
  borderRadius?: number;
};
const FilledPill = ({
  width,
  onPress,
  children,
  borderRadius = s(24),
}: FilledProps) => (
  <TouchableOpacity
    activeOpacity={0.92}
    onPress={onPress}
    style={{ width, borderRadius, overflow: 'hidden' }}
  >
    <LinearGradient
      // light TL  →  deep BR, with a mid-blue stop
      colors={['#2a84b9ff', '#0890dfff', '#0e5ea4ff']}
      locations={[0, 0.52, 1]}
      start={{ x: 0.08, y: 0.05 }}
      end={{ x: 0.92, y: 0.98 }}
      style={{
        width,
        height: DEFAULT_H,
        borderRadius,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </LinearGradient>
  </TouchableOpacity>
);

type PillProps = {
  label: string;
  selected?: boolean;
  width: number;
  onPress?: () => void;
  borderRadius?: number;
};

export default function LikertPill({
  label,
  selected,
  width,
  onPress,
  borderRadius = s(24),
}: PillProps) {
  return selected ? (
    <FilledPill width={width} onPress={onPress} borderRadius={borderRadius}>
      <Text style={styles.textSelected}>{label}</Text>
    </FilledPill>
  ) : (
    <OutlinePill width={width} onPress={onPress} borderRadius={borderRadius}>
      <Text style={styles.textIdle}>{label}</Text>
    </OutlinePill>
  );
}

const styles = StyleSheet.create({
  pillInnerBase: {
    height: DEFAULT_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textIdle: { color: palette.white, fontSize: ms(14), fontWeight: '700' },
  textSelected: { color: palette.white, fontSize: ms(14), fontWeight: '800' },
});
