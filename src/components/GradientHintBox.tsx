// src/components/GradientHintBox.tsx
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ViewStyle, LayoutChangeEvent } from 'react-native';
import { scale as s, verticalScale as vs, moderateScale as ms } from 'react-native-size-matters';
import Svg, { Defs, LinearGradient as SvgGrad, Stop, Rect } from 'react-native-svg';
import { palette } from '../theme';

type Props = {
  text: string;
  radius?: number;
  stroke?: number;
  bgColor?: string;
  minHeight?: number;
  style?: ViewStyle;
};

export default function GradientHintBox({
  text,
  radius = s(12),         // match GradientInput
  stroke = 1,              // match
  bgColor = '#0D131C',     // match
  minHeight = vs(45),      // match
  style,
}: Props) {
  const [w, setW] = useState(0);
  const [h, setH] = useState(minHeight);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setW(Math.round(width));
    setH(Math.max(minHeight, Math.round(height) || minHeight));
  }, [minHeight]);

  return (
    <View style={[styles.wrap, { minHeight, borderRadius: radius }, style]} onLayout={onLayout}>
      {w > 0 && (
        <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          <Defs>
            {/* identical gradient to GradientInput */}
            <SvgGrad id="borderGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0"    stopColor="#0AC4FF" />
              <Stop offset="0.52" stopColor="#0AC4FF" />
              <Stop offset="1"    stopColor="#1a4258ff" />
            </SvgGrad>
          </Defs>
          <Rect
            x={stroke / 2}
            y={stroke / 2}
            width={w - stroke}
            height={h - stroke}
            rx={radius}
            ry={radius}
            fill={bgColor}
            stroke="url(#borderGrad)"
            strokeWidth={stroke}
          />
        </Svg>
      )}

      <View style={[styles.inner, { borderRadius: radius }]}>
        <Text style={[styles.copy,{color:palette.white}]}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', position: 'relative' },
  inner: { paddingHorizontal: s(16), paddingVertical: vs(12) },
  copy: { fontSize: ms(14), lineHeight: ms(20) ,fontWeight:"600"},
});
