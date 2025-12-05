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

const CHART_HEIGHT = vs(200); // Fixed height like web version

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

  const series: DensePoint[] = denseSeries ?? [];

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(Math.round(e.nativeEvent.layout.width));
  }, []);

  // Fixed header height and center Y position (baseline at Y=0)
  const headerHeight = vs(24);
  const paddingY = vs(20);
  const usableHeight = CHART_HEIGHT - headerHeight - paddingY * 2;
  const centerY = headerHeight + paddingY + usableHeight / 2;

  // Calculate max cumulative for Y-axis labels and scaling
  const maxCumulative = useMemo(() => {
    if (!series || series.length === 0) return 0;
    return Math.max(...series.map(item => Math.abs(item.cumulative)));
  }, [series]);

  // Scale factor: map cumulative values to pixel positions
  // If maxCumulative is 300, we need to fit ±300 in usableHeight/2
  const yScale = useMemo(() => {
    return maxCumulative > 0 ? usableHeight / 2 / maxCumulative : 1;
  }, [maxCumulative, usableHeight]);

  // --- Month labels (positioned at top, evenly distributed) ---
  const monthLabels = useMemo((): Array<{ label: string; x: number }> => {
    if (!series || series.length === 0) {
      // Return default month labels evenly spaced
      return MONTHS.map((month, idx) => ({
        label: month,
        x: (idx / 11) * 100,
      }));
    }

    const labels: Array<{ label: string; x: number }> = [];
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const dayIndex = Math.floor((monthIndex * series.length) / 12);
      if (dayIndex < series.length) {
        const item = series[dayIndex];
        const date = new Date(item.date);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        const xRatio = dayIndex / Math.max(1, series.length - 1);
        labels.push({ label: monthName, x: xRatio * 100 });
      }
    }
    return labels;
  }, [series]);

  // --- Dots positioned vertically based on cumulative score ---
  const dots = useMemo(() => {
    if (!series || series.length === 0 || width === 0) return [];

    const paddingX = s(24);
    const usableWidth = Math.max(10, width - paddingX * 2);

    const count = series.length;
    const denom = Math.max(1, count - 1);

    return series.map((item, index) => {
      // Horizontal position: day number spread across width (0-100%)
      const xRatio = index / denom;
      const cx = paddingX + xRatio * usableWidth;

      // Vertical position: center ± cumulative scaled by yScale
      // Positive cumulative goes up, negative goes down
      const y = centerY - item.cumulative * yScale;
      // Clamp to prevent dots going off-screen (with 3px margin)
      const cy = Math.max(
        headerHeight + paddingY + 3,
        Math.min(CHART_HEIGHT - paddingY - 3, y),
      );

      // Color logic (as per documentation)
      let color = '#94A3B8'; // No check-in (gray)
      if (item.hasCheckin) {
        if (item.cumulative > 0) color = '#22C55E'; // Above baseline (green)
        else if (item.cumulative < 0) color = '#EF4444'; // Below baseline (red)
        else color = '#EAB308'; // At baseline (yellow)
      }

      return { cx, cy, color, item };
    });
  }, [series, width, centerY, yScale, headerHeight, paddingY]);

  return (
    <GradientCardHome>
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
                {/* Baseline (Y=0) at center - dashed line */}
                <Line
                  x1={s(24)}
                  x2={width - s(24)}
                  y1={centerY}
                  y2={centerY}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth={1}
                  strokeDasharray="3,5"
                />

                {/* Dots positioned vertically based on cumulative score */}
                {dots.map((d, idx) => (
                  <Circle
                    key={idx}
                    cx={d.cx}
                    cy={d.cy}
                    r={s(3)}
                    fill={d.color}
                  />
                ))}
              </Svg>
            )}

            {/* Y-axis labels: +max, 0, -max */}
            <View
              style={[
                styles.yLabels,
                {
                  top: headerHeight + paddingY,
                  height: usableHeight,
                },
              ]}
            >
              {maxCumulative > 0 && (
                <Text style={styles.yLabelText}>
                  +{maxCumulative.toFixed(0)}
                </Text>
              )}
              <Text style={styles.yLabelText}>0</Text>
              {maxCumulative > 0 && (
                <Text style={styles.yLabelText}>
                  -{maxCumulative.toFixed(0)}
                </Text>
              )}
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

        {/* Month labels at top */}
        {width > 0 && (
          <View style={styles.monthsRow}>
            {monthLabels.map((month, idx) => {
              const leftPosition = (month.x / 100) * (width - s(48)) + s(24);
              return (
                <Text
                  key={`${month.label}-${idx}`}
                  style={[styles.monthLabel, { left: leftPosition }]}
                >
                  {month.label}
                </Text>
              );
            })}
          </View>
        )}

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
    height: CHART_HEIGHT + vs(110),
  },
  innerBox: {
    paddingVertical: vs(8),
    paddingHorizontal: s(10),
  },
  yLabels: {
    position: 'absolute',
    left: s(8),
    justifyContent: 'space-between',
  },
  yLabelText: {
    color: '#FFFFFF',
    fontSize: ms(10),
    fontFamily: 'SourceSansPro-Regular',
  },
  monthsRow: {
    position: 'absolute',
    top: vs(10),
    left: 0,
    right: 0,
    height: vs(20),
  },
  monthLabel: {
    position: 'absolute',
    color: '#FFFFFF',
    fontSize: ms(10),
    fontFamily: 'SourceSansPro-Regular',
    transform: [{ translateX: -s(15) }], // Center the label on its position
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
