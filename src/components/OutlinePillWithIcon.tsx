import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  LayoutChangeEvent,
  ViewStyle,
  TextStyle,
  ImageSourcePropType,
} from 'react-native';
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
import { palette } from '../theme';

const PILL_H = vs(44);
const PILL_R = s(24);

type OutlinePillWithIconProps = {
  width: number;
  label: string;
  icon: ImageSourcePropType;
  onPress?: () => void;
  stroke?: number;
  iconSize?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function OutlinePillWithIcon({
  width,
  label,
  icon,
  onPress,
  stroke = 1,
  iconSize = s(16),
  style,
  textStyle,
}: OutlinePillWithIconProps) {
  const [h, setH] = useState(PILL_H);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setH(Math.max(PILL_H, Math.round(e.nativeEvent.layout.height)));
  }, []);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onLayout={onLayout}
      style={[
        {
          width,
          height: PILL_H,
          borderRadius: PILL_R,
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {/* Gradient Outline */}
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

      {/* Inner Content */}
      <View style={styles.inner}>
        <Image
          source={icon}
          style={{
            width: iconSize,
            height: iconSize,
            tintColor: palette.white,
            marginRight: s(8),
          }}
          resizeMode="contain"
        />
        <Text style={[styles.label, textStyle]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  inner: {
    height: PILL_H,
    borderRadius: PILL_R,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  label: {
    color: palette.white,
    fontSize: ms(14),
    fontWeight: '700',
    fontFamily: 'SourceSansPro-Regular',
  },
});
