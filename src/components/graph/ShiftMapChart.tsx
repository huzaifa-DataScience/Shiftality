import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  LayoutChangeEvent,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
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
  console.log('denseSeries', denseSeries);
  const [w, setW] = useState(0);
  const [h, setH] = useState(vs(110));
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [monthDaysData, setMonthDaysData] = useState<DensePoint[]>([]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setW(Math.round(width));
    setH(Math.max(vs(80), Math.round(height) || vs(80)));
  }, []);

  // ✅ Month-level data (12 months) - DYNAMIC based on actual data
  const monthData = useMemo(() => {
    if (!denseSeries || denseSeries.length === 0) return [];

    type MonthAgg = {
      label: string;
      value: number;
      hasCheckin: boolean;
      dateForClick: string;
      lastDate: string;
      monthKey: string;
    };

    const byMonth = new Map<string, MonthAgg>();

    denseSeries.forEach(point => {
      const d = new Date(point.date);
      if (Number.isNaN(d.getTime())) return;

      const year = d.getFullYear();
      const monthIdx = d.getMonth();
      const key = `${year}-${monthIdx}`;
      const label = MONTHS[monthIdx]; // Get actual month name

      const existing = byMonth.get(key);

      if (!existing) {
        byMonth.set(key, {
          label,
          value: point.cumulative,
          hasCheckin: !!point.hasCheckin,
          dateForClick: point.date,
          lastDate: point.date,
          monthKey: key,
        });
      } else {
        existing.value = point.cumulative;
        existing.hasCheckin = existing.hasCheckin || !!point.hasCheckin;
        existing.lastDate = point.date;
        if (point.hasCheckin) {
          existing.dateForClick = point.date;
        }
      }
    });

    // Sort by lastDate (chronologically)
    const sortedMonths = Array.from(byMonth.values()).sort((a, b) =>
      a.lastDate < b.lastDate ? -1 : a.lastDate > b.lastDate ? 1 : 0,
    );

    // Keep ALL months that have data (don't slice to 12, show what we have)
    // This ensures December data shows in December position, not January
    const allMonthsWithData = sortedMonths;

    return allMonthsWithData.map((m, index) => {
      const clamped = Math.max(Y_MIN, Math.min(Y_MAX, m.value));

      return {
        value: clamped,
        label: m.label, // Use actual month label from the data
        hideDataPoint: !m.hasCheckin,
        monthKey: m.monthKey,
        onPress: () => {
          if (m.hasCheckin) {
            // Get all days in this month
            const monthDays = denseSeries.filter(p => {
              const pd = new Date(p.date);
              return `${pd.getFullYear()}-${pd.getMonth()}` === m.monthKey;
            });
            setMonthDaysData(monthDays);
            setExpandedMonth(m.monthKey);
          }
        },
      };
    });
  }, [denseSeries]);

  // ✅ Day-level data (for expanded month)
  const dayData = useMemo(() => {
    if (monthDaysData.length === 0) return [];

    return monthDaysData.map((point, idx) => {
      const clamped = Math.max(Y_MIN, Math.min(Y_MAX, point.cumulative));
      const d = new Date(point.date);
      const dayOfMonth = d.getDate();

      // Show label only on certain days to avoid crowding
      // Show day 1, every 5th day, and last day
      let label = '';
      if (dayOfMonth === 1 || dayOfMonth || idx === monthDaysData.length - 1) {
        label = dayOfMonth.toString();
      }

      return {
        value: clamped,
        label: label, // Dynamic day label with smart spacing
        hideDataPoint: !point.hasCheckin,
        date: point.date,
        hasCheckin: point.hasCheckin,
        onPress: () => {
          if (point.hasCheckin && onPointPress) {
            onPointPress(point.date);
          }
        },
      };
    });
  }, [monthDaysData, onPointPress]);

  // ✅ Choose which data to display
  const data = expandedMonth ? dayData : monthData;

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
    return 25;
  }, [pointCount]);

  const initialSpacing = 25;
  const endSpacing = useMemo(() => (pointCount <= 12 ? 25 : 10), [pointCount]);

  return (
    <GradientCardHome>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Shift Map</Text>
        {expandedMonth && (
          <TouchableOpacity onPress={() => setExpandedMonth(null)}>
            <Text style={styles.backButton}>← Back to Months</Text>
          </TouchableOpacity>
        )}
      </View>

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
              color="#00BFFF"
              noOfSections={Y_AXIS_LABELS.length - 1}
              maxValue={Y_MAX}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  title: {
    fontSize: ms(17),
    fontWeight: '700',
    color: palette.white,
    fontFamily: 'SourceSansPro-Regular',
  },
  backButton: {
    fontSize: ms(13),
    fontWeight: '600',
    color: '#00BFFF',
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
