import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, {
  Defs,
  Line,
  Rect,
  Stop,
  LinearGradient as SvgGrad,
} from 'react-native-svg';
import { LineChart } from 'react-native-gifted-charts';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
  scale,
} from 'react-native-size-matters';
import GradientCardHome from '../GradientCardHome';
import { palette } from '../../theme';

export default function ShiftGridChart() {
  const data = [
    { value: 5, label: 'Jan' },
    { value: 20, label: 'Feb' },
    { value: 10, label: 'Mar' },
    { value: 15, label: 'Apr' },
    { value: 25, label: 'May' },
    { value: 12, label: 'June' },
    { value: 30, label: 'July' },
  ];

  const [w, setW] = useState(0);
  const [h, setH] = useState(vs(110));

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setW(Math.round(width));
    setH(Math.max(vs(80), Math.round(height) || vs(80)));
  }, []);

  return (
    <GradientCardHome>
      <Text style={styles.title}>Shift Grid (365 dots)</Text>

      <View style={styles.outlineWrap} onLayout={onLayout}>
        {/* Gradient outline */}
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

        <View style={styles.innerBox}>
          <View style={{ position: 'relative', height: 220 }}>
            {/* Line Chart */}
            <LineChart
              data={data}
              //   curved
              thickness={3}
              hideDataPoints={false}
              dataPointsColor="#00BFFF"
              dataPointsRadius={5}
              hideRules={false}
              rulesColor="rgba(255,255,255,0.1)"
              rulesType="dotted"
              yAxisTextStyle={styles.yAxisText}
              xAxisLabelTextStyle={styles.xAxisLabel}
              yAxisSide="left"
              color="#00BFFF"
              noOfSections={6}
              maxValue={36.5}
              minValue={0}
              backgroundColor="transparent"
              showFractionalValues={false}
              yAxisThickness={0}
              xAxisThickness={0}
              initialSpacing={25}
              spacing={40}
              endSpacing={25}
              showVerticalLines={false} // hide built-in ones
            />

            {/* Custom dotted verticals */}
            <Svg
              height="100%"
              width="100%"
              style={{ position: 'absolute', top: 0, left: 0 }}
            >
              {data.map((_, index) => (
                <Line
                  key={index}
                  x1={25 + index * 40}
                  y1="0"
                  x2={25 + index * 40}
                  y2="100%"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                  strokeDasharray="3,5" // dotted style
                />
              ))}
            </Svg>
          </View>
        </View>
        <View style={styles.legendRowOne}>
          <Legend color="#22C55E" label="Above Baseline" />
          <Legend color="#EF4444" label="Below Baseline" />
        </View>
        <View style={styles.legendRowOne}>
          <Legend color="#FBBF24" label="At Baseline" />
          <View style={{ marginLeft: scale(22) }}>
            <Legend color="#FFFFFF" label="No Data" />
          </View>
        </View>
      </View>
    </GradientCardHome>
  );
}

const Legend = ({ color, label }: { color: string; label: string }) => (
  <View style={styles.legendItem}>
    <View style={[styles.colorBox, { backgroundColor: color }]} />
    <Text style={styles.legendLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  title: {
    fontSize: ms(17),
    fontWeight: '700',
    color: palette.white,
    marginBottom: vs(12),
  },
  outlineWrap: {
    width: '100%',
    borderRadius: s(12),
    position: 'relative',
    overflow: 'hidden',
    height: scale(270),
  },
  innerBox: {
    paddingVertical: vs(8),
    paddingHorizontal: s(10),
  },
  yAxisText: {
    color: '#FFFFFF',
    fontSize: ms(10),
  },
  xAxisLabel: {
    color: '#FFFFFF',
    fontSize: ms(10),
  },
  legendRowOne: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: vs(12),
    gap: s(16),
    marginLeft: scale(20),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorBox: {
    width: s(14),
    height: s(14),
    borderRadius: s(2),
    marginRight: s(6),
  },
  legendLabel: {
    color: palette.white,
    fontSize: ms(12.5),
  },
});
