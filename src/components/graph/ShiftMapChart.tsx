// src/components/graph/ShiftMapChart.tsx
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  LayoutChangeEvent,
  TouchableOpacity,
  PanResponder,
  Platform,
  Modal,
  ScrollView,
  Image,
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

const Y_MAX = 36.5;
const Y_MIN = -36.5;
const Y_AXIS_LABELS = ['-36', '-24', '-12', '0', '+12', '+24', '+36'];

export default function ShiftMapChart({ denseSeries, onPointPress }: Props) {
  const [w, setW] = useState(0);
  const [h, setH] = useState(vs(110));
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [monthDaysData, setMonthDaysData] = useState<DensePoint[]>([]);
  const [chartX, setChartX] = useState(0);
  const [showMonthModal, setShowMonthModal] = useState(false);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height, x } = e.nativeEvent.layout;
    setW(Math.round(width));
    setH(Math.max(vs(80), Math.round(height) || vs(80)));
    setChartX(x);
  }, []);

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
      const label = MONTHS[monthIdx];

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

    const sortedMonths = Array.from(byMonth.values()).sort((a, b) =>
      a.lastDate < b.lastDate ? -1 : a.lastDate > b.lastDate ? 1 : 0,
    );

    return sortedMonths.map(m => {
      const clamped = Math.max(Y_MIN, Math.min(Y_MAX, m.value));

      return {
        value: clamped,
        label: m.label,
        hideDataPoint: !m.hasCheckin,
        monthKey: m.monthKey,
        onPress: () => {
          if (m.hasCheckin) {
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

  const dayData = useMemo(() => {
    if (monthDaysData.length === 0) return [];

    return monthDaysData.map((point, idx) => {
      const clamped = Math.max(Y_MIN, Math.min(Y_MAX, point.cumulative));
      const d = new Date(point.date);
      const dayOfMonth = d.getDate();

      let label = '';
      if (dayOfMonth === 1 || dayOfMonth || idx === monthDaysData.length - 1) {
        label = dayOfMonth.toString();
      }

      return {
        value: clamped,
        label,
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

  // ✅ Android touch handler - detect which month was tapped
  const handleAndroidChartPress = useCallback(
    (event: any) => {
      if (Platform.OS !== 'android') return;

      const { locationX } = event.nativeEvent;
      if (!locationX) return;

      // Calculate which data point was tapped based on spacing
      const tapPosition = locationX - initialSpacing;
      if (tapPosition < 0) return;

      const tapIndex = Math.round(tapPosition / spacing);
      if (tapIndex < 0 || tapIndex >= data.length) return;

      const tappedPoint = data[tapIndex];
      if (tappedPoint && tappedPoint.onPress) {
        tappedPoint.onPress();
      }
    },
    [data, spacing, initialSpacing],
  );

  // ✅ Handle month selection from modal
  const handleMonthFromModal = useCallback(
    (monthKey: string) => {
      const selectedMonth = monthData.find(m => m.monthKey === monthKey);
      if (selectedMonth && selectedMonth.onPress) {
        selectedMonth.onPress();
        setShowMonthModal(false);
      }
    },
    [monthData],
  );

  // Get the label of the expanded month
  const expandedMonthLabel = useMemo(() => {
    if (!expandedMonth) return null;
    const month = monthData.find(m => m.monthKey === expandedMonth);
    return month ? month.label : null;
  }, [expandedMonth, monthData]);

  return (
    <GradientCardHome>
      <View style={styles.headerRow}>
        <Text style={styles.title}>
          Shift Map {expandedMonthLabel ? `- ${expandedMonthLabel}` : ''}
        </Text>
        {!expandedMonth && (
          <TouchableOpacity
            onPress={() => setShowMonthModal(true)}
            style={styles.iconButton}
          >
            <Image
              source={require('../../assets/calendar.png')}
              style={styles.icon}
            />
          </TouchableOpacity>
        )}
        {expandedMonth && (
          <TouchableOpacity onPress={() => setExpandedMonth(null)}>
            <Text style={styles.backButton}>← Back to Months</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.outlineWrap} onLayout={onLayout}>
        {/* Outer gradient border */}
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
            {/* 🔽 Put the vertical guide SVG BEHIND the chart so it doesn’t block touches */}
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

            {/* Chart on TOP so data point onPress works on Android */}
            <View
              onTouchEnd={
                Platform.OS === 'android' ? handleAndroidChartPress : undefined
              }
              style={{ flex: 1 }}
            >
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
            </View>
          </View>
        </View>

        <View style={styles.footerBox}>
          <Text style={styles.footerText}>
            Current Position: {currentPosition}
          </Text>
        </View>
      </View>

      {/* ✅ Month Selection Modal */}
      <Modal
        visible={showMonthModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMonthModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Month</Text>
              <TouchableOpacity onPress={() => setShowMonthModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.monthGrid}>
              {monthData.map(month => (
                <TouchableOpacity
                  key={month.monthKey}
                  onPress={() => handleMonthFromModal(month.monthKey)}
                  disabled={month.hideDataPoint}
                  style={[
                    styles.monthButton,
                    month.hideDataPoint && styles.monthButtonDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.monthButtonText,
                      month.hideDataPoint && styles.monthButtonTextDisabled,
                    ]}
                  >
                    {month.label}
                  </Text>
                  {!month.hideDataPoint && (
                    <Text style={styles.monthValue}>
                      {month.value.toFixed(1)}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  iconButton: {
    padding: s(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: s(24),
    height: s(24),
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: s(16),
    width: '85%',
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: '#0AC4FF',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(16),
    paddingVertical: vs(16),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(10, 196, 255, 0.3)',
  },
  modalTitle: {
    fontSize: ms(16),
    fontWeight: '700',
    color: '#00BFFF',
    fontFamily: 'SourceSansPro-Regular',
  },
  modalClose: {
    fontSize: ms(24),
    color: '#00BFFF',
    fontWeight: '600',
  },
  monthGrid: {
    paddingHorizontal: s(12),
    paddingVertical: vs(12),
  },
  monthButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(16),
    paddingVertical: vs(12),
    marginVertical: vs(6),
    backgroundColor: 'rgba(10, 196, 255, 0.1)',
    borderRadius: s(10),
    borderLeftWidth: 3,
    borderLeftColor: '#00BFFF',
  },
  monthButtonDisabled: {
    backgroundColor: 'rgba(100, 100, 100, 0.1)',
    borderLeftColor: '#666',
    opacity: 0.5,
  },
  monthButtonText: {
    fontSize: ms(15),
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'SourceSansPro-Regular',
  },
  monthButtonTextDisabled: {
    color: '#999',
  },
  monthValue: {
    fontSize: ms(13),
    fontWeight: '700',
    color: '#00BFFF',
    fontFamily: 'SourceSansPro-Regular',
  },
});
