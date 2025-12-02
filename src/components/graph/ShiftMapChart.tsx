import React, { useState, useCallback, useMemo } from 'react';
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
import { DensePoint } from '../../lib/dataClient';

type Props = {
  denseSeries: DensePoint[];
  /**
   * Called when user taps a data point in the map.
   * We pass an ISO date string "YYYY-MM-DD" representing that point.
   * Parent (SearchScreen) can then open the journal modal for that date.
   */
  onPointPress?: (isoDate: string) => void;
};

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

// Y-axis like web: -36.5 .. +36.5
const Y_MAX = 36.5;
const Y_MIN = -36.5;
const Y_AXIS_LABELS = ['-36', '-24', '-12', '0', '+12', '+24', '+36'];

export default function ShiftMapChart({ denseSeries, onPointPress }: Props) {
  const [w, setW] = useState(0);
  const [h, setH] = useState(vs(110));

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setW(Math.round(width));
    setH(Math.max(vs(80), Math.round(height) || vs(80)));
  }, []);

  // ✅ Month-level data with a representative date for clicks
  const data = useMemo(() => {
    if (!denseSeries || denseSeries.length === 0) return [];

    type MonthAgg = {
      label: string; // "Jan", "Feb", …
      value: number; // cumulative (clamped)
      hasCheckin: boolean;
      dateForClick: string; // "YYYY-MM-DD" from denseSeries
      lastDate: string; // for chronological sort
    };

    const byMonth = new Map<string, MonthAgg>();

    denseSeries.forEach(point => {
      const d = new Date(point.date);
      if (Number.isNaN(d.getTime())) return;

      const year = d.getFullYear();
      const monthIdx = d.getMonth(); // 0–11
      const key = `${year}-${monthIdx}`;
      const label = MONTHS[monthIdx];

      const existing = byMonth.get(key);

      if (!existing) {
        byMonth.set(key, {
          label,
          value: point.cumulative,
          hasCheckin: !!point.hasCheckin,
          dateForClick: point.date, // first date we see in this month
          lastDate: point.date,
        });
      } else {
        // always use the *latest* cumulative in that month
        existing.value = point.cumulative;
        // month has a dot if ANY day had a checkin
        existing.hasCheckin = existing.hasCheckin || !!point.hasCheckin;
        // track last date for sorting
        existing.lastDate = point.date;

        // if this specific day has a checkin, prefer it for clicks
        if (point.hasCheckin) {
          existing.dateForClick = point.date;
        }
      }
    });

    // sort by lastDate (chronological)
    const sortedMonths = Array.from(byMonth.values()).sort((a, b) =>
      a.lastDate < b.lastDate ? -1 : a.lastDate > b.lastDate ? 1 : 0,
    );

    // only keep the last 12 months
    const lastTwelve = sortedMonths.slice(-12);

    return lastTwelve.map(m => {
      const clamped = Math.max(Y_MIN, Math.min(Y_MAX, m.value));

      return {
        value: clamped,
        label: m.label,
        hideDataPoint: !m.hasCheckin,
        // 👇 this fires when user taps the data point
        onPress: () => {
          if (m.hasCheckin && onPointPress) {
            onPointPress(m.dateForClick); // e.g. "2025-12-29"
          }
        },
      };
    });
  }, [denseSeries, onPointPress]);

  const rawPosition =
    denseSeries && denseSeries.length
      ? denseSeries[denseSeries.length - 1].cumulative
      : 0;

  const currentPosition = Math.max(Y_MIN, Math.min(Y_MAX, rawPosition));

  const pointCount = data.length;

  const spacing = useMemo(() => {
    if (pointCount <= 1) return 0;
    if (pointCount <= 6) return 40;
    if (pointCount <= 12) return 30;
    return 20;
  }, [pointCount]);

  const initialSpacing = 25;
  const endSpacing = useMemo(() => (pointCount <= 12 ? 25 : 10), [pointCount]);

  console.log('data', data);

  return (
    <GradientCardHome>
      <Text style={styles.title}>Shift Map</Text>

      <View style={styles.outlineWrap} onLayout={onLayout}>
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
            <LineChart
              data={data}
              curved
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
              noOfSections={Y_AXIS_LABELS.length - 1}
              maxValue={Y_MAX}
              minValue={Y_MIN}
              yAxisLabelTexts={Y_AXIS_LABELS}
              backgroundColor="transparent"
              showFractionalValues={false}
              yAxisThickness={0}
              xAxisThickness={0}
              initialSpacing={initialSpacing}
              spacing={spacing}
              endSpacing={endSpacing}
              showVerticalLines={false}
            />

            {/* vertical dotted lines for each month point – DO NOT block touches */}
            <Svg
              height="100%"
              width="100%"
              style={{ position: 'absolute', top: 0, left: 0 }}
              pointerEvents="none"
            >
              {data.map((_, index) => (
                <Line
                  key={index}
                  x1={initialSpacing + index * spacing}
                  y1="0"
                  x2={initialSpacing + index * spacing}
                  y2="100%"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                  strokeDasharray="3,5"
                />
              ))}
            </Svg>
          </View>
        </View>

        <View style={styles.footerBox}>
          <Text style={styles.footerText}>
            Current Position: {currentPosition}
          </Text>
        </View>
      </View>
    </GradientCardHome>
  );
}

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
    height: scale(270),
  },
  innerBox: {
    paddingVertical: vs(8),
    paddingHorizontal: s(10),
  },
  yAxisText: {
    color: '#FFFFFF',
    fontSize: ms(10),
    fontFamily: 'SourceSansPro-Regular',
  },
  xAxisLabel: {
    color: '#FFFFFF',
    fontSize: ms(10),
    fontFamily: 'SourceSansPro-Regular',
  },
  footerBox: {
    marginTop: vs(10),
    marginLeft: scale(20),
  },
  footerText: {
    color: palette.white,
    fontSize: ms(13),
    fontWeight: '600',
    fontFamily: 'SourceSansPro-Regular',
  },
});
