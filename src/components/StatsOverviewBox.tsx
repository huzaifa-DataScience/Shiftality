import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  LayoutChangeEvent,
  ViewStyle,
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

type StatItem = {
  icon: ImageSourcePropType;
  value: string | number;
  label: string;
};

type Props = {
  data: StatItem[];
  style?: ViewStyle;
};

const StatsOverviewBox = ({ data, style }: Props) => {
  const [w, setW] = useState(0);
  const [h, setH] = useState(vs(80));

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setW(Math.round(width));
    setH(Math.max(vs(80), Math.round(height) || vs(80)));
  }, []);

  return (
    <View onLayout={onLayout} style={[styles.wrap, style]}>
      {/* Gradient Outline */}
      {w > 0 && (
        <Svg
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
        >
          <Defs>
            <SvgGrad id="borderGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#0AC4FF" />
              <Stop offset="0.52" stopColor="#0AC4FF" />
              <Stop offset="1" stopColor="#1a4258ff" />
            </SvgGrad>
          </Defs>
          <Rect
            x={1}
            y={1}
            width={w - 2}
            height={h - 2}
            rx={s(12)}
            ry={s(12)}
            fill="transparent"
            stroke="url(#borderGrad)"
            strokeWidth={1}
          />
        </Svg>
      )}

      {/* Inner content */}
      <View style={styles.inner}>
        {data.map((item, index) => (
          <View key={index} style={styles.item}>
            <Image
              source={item.icon}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.value}>{item.value}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default StatsOverviewBox;

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderRadius: s(12),
    position: 'relative',
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vs(12),
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  icon: {
    width: s(22),
    height: s(22),
    marginBottom: vs(6),
    tintColor: palette.white,
  },
  value: {
    color: '#00BFFF',
    fontSize: ms(16),
    fontWeight: '700',
    fontFamily: 'SourceSansPro-Regular',
  },
  label: {
    color: palette.white,
    fontSize: ms(13),
    fontWeight: '600',
    marginTop: vs(2),
    fontFamily: 'SourceSansPro-Regular',
  },
});
