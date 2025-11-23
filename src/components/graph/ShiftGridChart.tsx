// src/components/graph/ShiftGridChart.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, {
  Defs,
  Line,
  Rect,
  Stop,
  LinearGradient as SvgGrad,
  Circle,
} from 'react-native-svg';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
  scale,
} from 'react-native-size-matters';
import GradientCardHome from '../GradientCardHome';
import { palette } from '../../theme';
import type { DensePoint } from '../../lib/dataClient';

type Props = {
  denseSeries: DensePoint[];
};

const CHART_HEIGHT = 200;

// 🔹 toggle this to enable/disable mock data
const USE_MOCK_DATA = false;

// 🔹 static dense series for testing
const MOCK_SERIES: DensePoint[] = [
  // Below baseline (red)
  {
    date: '2025-11-01',
    dayNumber: 1,
    score: -2,
    cumulative: -2,
    hasCheckin: true,
  },
  // At baseline (yellow)
  {
    date: '2025-11-02',
    dayNumber: 2,
    score: +2,
    cumulative: 0,
    hasCheckin: true,
  },
  // Above baseline (green)
  {
    date: '2025-11-03',
    dayNumber: 3,
    score: +3,
    cumulative: 3,
    hasCheckin: true,
  },
  // No check-in (gray)
  {
    date: '2025-11-04',
    dayNumber: 4,
    score: 0,
    cumulative: 0,
    hasCheckin: false,
  },
  // More green
  {
    date: '2025-11-05',
    dayNumber: 5,
    score: +4,
    cumulative: 7,
    hasCheckin: true,
  },
  // More red
  {
    date: '2025-11-06',
    dayNumber: 6,
    score: -5,
    cumulative: 2,
    hasCheckin: true,
  },
];

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export default function ShiftGridChart({ denseSeries }: Props) {
  const [width, setWidth] = useState(0);

  // 👉 choose which series to use
  const series: DensePoint[] = USE_MOCK_DATA ? MOCK_SERIES : denseSeries ?? [];

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(Math.round(e.nativeEvent.layout.width));
  }, []);

  // --- Month labels (start from first series month, wrap around 12) ---
  const monthLabels = useMemo(() => {
    if (!series || series.length === 0) {
      // fallback: just show calendar year
      return MONTHS;
    }

    const firstDate = series[0].date; // "YYYY-MM-DD"
    const monthStr = firstDate.slice(5, 7); // "01".."12"
    const startIdx = Math.max(0, Math.min(11, Number(monthStr) - 1));

    const labels: string[] = [];
    for (let i = 0; i < 12; i++) {
      labels.push(MONTHS[(startIdx + i) % 12]);
    }
    return labels;
  }, [series]);

  // --- Dots along the baseline ---
  const dots = useMemo(() => {
    if (!series || series.length === 0 || width === 0) return [];

    const paddingX = 24;
    const paddingY = 40; // a bit more so months can sit at the bottom

    const usableWidth = Math.max(10, width - paddingX * 2);
    const usableHeight = Math.max(10, CHART_HEIGHT - paddingY * 2);

    const baselineY = paddingY + usableHeight; // 0-line at bottom of grid

    // scale Y by max abs cumulative so things fit nicely (if you ever move dots vertically)
    const maxAbs = Math.max(1, ...series.map(d => Math.abs(d.cumulative)));
    const marginFromEdge = 6;
    const maxAmplitude = usableHeight - marginFromEdge;
    const scaleY = maxAmplitude / maxAbs;

    const count = series.length;
    const denom = Math.max(1, count - 1);

    return series.map((item, index) => {
      const xRatio = index / denom;
      const cx = paddingX + xRatio * usableWidth;
      const cy = baselineY - item.cumulative * scaleY;

      let color = '#94A3B8'; // No check-in (gray)
      if (item.hasCheckin) {
        if (item.cumulative > 0) color = '#22C55E'; // Above baseline (green)
        else if (item.cumulative < 0) color = '#EF4444'; // Below baseline (red)
        else color = '#EAB308'; // At baseline (yellow)
      }

      return { cx, cy, color };
    });
  }, [series, width]);

  return (
    <GradientCardHome style={{ height: scale(320) }}>
      <Text style={styles.title}>Shift Grid (365 dots)</Text>

      <View style={styles.outlineWrap} onLayout={onLayout}>
        {/* Gradient outline */}
        {width > 0 && (
          <Svg
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
            width={width}
            height={CHART_HEIGHT}
            viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
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
              width={width - 2}
              height={CHART_HEIGHT - 2}
              rx={s(12)}
              ry={s(12)}
              fill="transparent"
              stroke="url(#borderGrad)"
              strokeWidth={1}
            />
          </Svg>
        )}

        <View style={styles.innerBox}>
          <View style={{ position: 'relative', height: CHART_HEIGHT }}>
            {width > 0 && (
              <Svg width={width} height={CHART_HEIGHT}>
                {/* +1 dashed line */}
                <Line
                  x1={24}
                  x2={width - 24}
                  y1={CHART_HEIGHT / 2.8}
                  y2={CHART_HEIGHT / 2.8}
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth={1}
                  strokeDasharray="4,4"
                />

                {/* 0 baseline bar */}
                <Line
                  x1={24}
                  x2={width - 24}
                  y1={CHART_HEIGHT - 48}
                  y2={CHART_HEIGHT - 48}
                  stroke="#CBD5F5"
                  strokeWidth={6}
                  strokeLinecap="round"
                />

                {/* dots on top of baseline */}
                {dots.map((d, idx) => (
                  <Circle
                    key={idx}
                    cx={d.cx}
                    cy={CHART_HEIGHT - 48}
                    r={3}
                    fill={d.color}
                  />
                ))}
              </Svg>
            )}

            {/* Y labels (+1 / 0) */}
            <View style={styles.yLabels}>
              <Text style={styles.yLabelText}>+1</Text>
              <Text style={styles.yLabelText}>0</Text>
            </View>

            {/* No-data message */}
            {(!series || series.length === 0) && (
              <View style={styles.noDataWrapper}>
                <Text style={styles.noDataText}>
                  Lock your first Shift to start seeing dots here.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Month labels */}
        <View style={styles.monthsRow}>
          {monthLabels.map(label => (
            <Text key={label} style={styles.monthLabel}>
              {label}
            </Text>
          ))}
        </View>

        {/* Legends */}
        <View style={styles.legendRowOne}>
          <Legend color="#22C55E" label="Above Baseline" />
          <Legend color="#EF4444" label="Below Baseline" />
        </View>
        <View style={styles.legendRowOne}>
          <Legend color="#EAB308" label="At Baseline" />
          <View style={{ marginLeft: scale(22) }}>
            <Legend color="#94A3B8" label="No Check-in" />
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
    fontFamily: 'SourceSansPro-Regular',
  },
  outlineWrap: {
    width: '100%',
    borderRadius: s(12),
    position: 'relative',
    overflow: 'hidden',
    height: CHART_HEIGHT + 110,
  },
  innerBox: {
    paddingVertical: vs(8),
    paddingHorizontal: s(10),
  },
  yLabels: {
    position: 'absolute',
    left: s(18),
    top: vs(26),
    bottom: vs(40),
    justifyContent: 'space-between',
  },
  yLabelText: {
    color: '#FFFFFF',
    fontSize: ms(10),
    fontFamily: 'SourceSansPro-Regular',
  },
  monthsRow: {
    position: 'absolute',
    top: scale(10),
    left: s(30),
    right: s(24),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthLabel: {
    color: '#FFFFFF',
    fontSize: ms(10),
    fontFamily: 'SourceSansPro-Regular',
  },
  legendRowOne: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: vs(8),
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
    fontFamily: 'SourceSansPro-Regular',
  },
  noDataWrapper: {
    position: 'absolute',
    top: '40%',
    left: '8%',
    right: '8%',
    alignItems: 'center',
  },
  noDataText: {
    color: '#CBD5F5',
    fontSize: ms(12.5),
    textAlign: 'center',
    fontFamily: 'SourceSansPro-Regular',
  },
});
