// src/components/graph/ShiftMapChart.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  LayoutChangeEvent,
  TouchableOpacity,
  Platform,
  Image,
  Modal,
  Pressable,
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
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import GradientCardHome from '../GradientCardHome';
import { palette } from '../../theme';
import { DensePoint } from '../../lib/dataClient';
import { useJournals } from '../../contexts/JournalContext';

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
// Offset to shift negative values into visible range
const Y_OFFSET = Math.abs(Y_MIN); // 36.5

// Generate Y-axis labels with 2 decimal places
const generateYAxisLabels = (): string[] => {
  const labels: string[] = [];
  const step = (Y_MAX - Y_MIN) / 6; // 7 labels total (including both ends)
  for (let i = 0; i <= 6; i++) {
    const value = Y_MIN + i * step;
    // Format to 2 decimal places and add + sign for positive values
    const formatted = value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
    labels.push(formatted);
  }
  return labels;
};
const Y_AXIS_LABELS = generateYAxisLabels();

export default function ShiftMapChart({ denseSeries, onPointPress }: Props) {
  const { setSelectedFilterDate, clearSelectedFilterDate, selectedFilterDate } =
    useJournals();
  const [w, setW] = useState(0);
  const [h, setH] = useState(vs(110));
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [monthDaysData, setMonthDaysData] = useState<DensePoint[]>([]);
  const [chartX, setChartX] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  // Sync local selectedDate with context's selectedFilterDate
  useEffect(() => {
    if (selectedFilterDate) {
      const date = new Date(selectedFilterDate);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);

        // Also set expandedMonth and monthDaysData to match the selected date
        const year = date.getFullYear();
        const monthIdx = date.getMonth();
        const monthKey = `${year}-${monthIdx}`;

        // Filter days for the selected month
        const monthDays = denseSeries.filter(p => {
          const pd = new Date(p.date);
          return `${pd.getFullYear()}-${pd.getMonth()}` === monthKey;
        });

        if (monthDays.length > 0) {
          setMonthDaysData(monthDays);
          setExpandedMonth(monthKey);
        }
      }
    } else {
      setSelectedDate(null);
      setExpandedMonth(null);
      setMonthDaysData([]);
    }
  }, [selectedFilterDate, denseSeries]);

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
      // Transform value: shift by Y_OFFSET to make negatives visible
      // -36.5 becomes 0, 0 becomes 36.5, 36.5 becomes 73
      const transformedValue = m.value + Y_OFFSET;

      return {
        value: transformedValue,
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
      // Transform value: shift by Y_OFFSET to make negatives visible
      const transformedValue = point.cumulative + Y_OFFSET;
      const d = new Date(point.date);
      const dayOfMonth = d.getDate();

      let label = '';
      if (dayOfMonth === 1 || dayOfMonth || idx === monthDaysData.length - 1) {
        label = dayOfMonth.toString();
      }

      return {
        value: transformedValue,
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

  // Ensure data values are within the chart range (0 to Y_MAX + Y_OFFSET)
  // After transformation, values should be between 0 (was -36.5) and 73 (was 36.5)
  const normalizedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const maxChartValue = Y_MAX + Y_OFFSET; // 73
    return data.map(d => {
      // Clamp the transformed value to ensure it's visible
      const clampedValue = Math.max(0, Math.min(maxChartValue, d.value));
      return {
        ...d,
        value: clampedValue,
      };
    });
  }, [data]);

  const rawPosition =
    denseSeries && denseSeries.length
      ? denseSeries[denseSeries.length - 1].cumulative
      : 0;
  const currentPosition = rawPosition; // Keep original value for display

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

  // Handle date picker change
  const onDatePickerChange = useCallback(
    (e: DateTimePickerEvent, date?: Date) => {
      if (Platform.OS === 'android') {
        setShowPicker(false);
        if (e.type === 'set' && date) {
          setSelectedDate(date);
          const isoDate = date.toISOString().split('T')[0];
          setSelectedFilterDate(isoDate);

          const year = date.getFullYear();
          const monthIdx = date.getMonth();
          const monthKey = `${year}-${monthIdx}`;

          // Filter days for the selected month
          const monthDays = denseSeries.filter(p => {
            const pd = new Date(p.date);
            return `${pd.getFullYear()}-${pd.getMonth()}` === monthKey;
          });

          if (monthDays.length > 0) {
            setMonthDaysData(monthDays);
            setExpandedMonth(monthKey);
          }
        }
      } else {
        // iOS - auto-select on change
        if (date) {
          setShowPicker(false);
          setSelectedDate(date);
          const isoDate = date.toISOString().split('T')[0];
          setSelectedFilterDate(isoDate);

          const year = date.getFullYear();
          const monthIdx = date.getMonth();
          const monthKey = `${year}-${monthIdx}`;

          // Filter days for the selected month
          const monthDays = denseSeries.filter(p => {
            const pd = new Date(p.date);
            return `${pd.getFullYear()}-${pd.getMonth()}` === monthKey;
          });

          if (monthDays.length > 0) {
            setMonthDaysData(monthDays);
            setExpandedMonth(monthKey);
          }
        }
      }
    },
    [denseSeries, setSelectedFilterDate],
  );

  // Handle clear date
  const handleClearDate = useCallback(() => {
    setSelectedDate(null);
    setExpandedMonth(null);
    setMonthDaysData([]);
    clearSelectedFilterDate();
  }, [clearSelectedFilterDate]);

  // Open date picker
  const openDatePicker = useCallback(() => {
    setShowPicker(true);
    setTempDate(selectedDate || new Date());
  }, [selectedDate]);

  // Format date for display
  const formatDate = useCallback((date: Date) => {
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(
      date.getDate(),
    ).padStart(2, '0')}/${date.getFullYear()}`;
  }, []);

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
      </View>

      {selectedDate ? (
        <View style={styles.selectedDateContainer}>
          <View style={styles.selectedDateBox}>
            <Text style={styles.selectedDateText}>
              {formatDate(selectedDate)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleClearDate}
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={openDatePicker}
          style={styles.selectDateButton}
        >
          <Text style={styles.selectDateText}>
            Please select date to filter
          </Text>
        </TouchableOpacity>
      )}

      {/* Date Picker for Android */}
      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="calendar"
          onChange={onDatePickerChange}
        />
      )}

      {/* Date Picker for iOS */}
      {showPicker && Platform.OS === 'ios' && (
        <Modal
          transparent
          animationType="fade"
          onRequestClose={() => setShowPicker(false)}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowPicker(false)}
          >
            <Pressable style={styles.iosSheet}>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="inline"
                onChange={onDatePickerChange}
                style={{ backgroundColor: palette.white }}
                themeVariant="light"
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}

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
              {normalizedData.map((_, index) => (
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
                data={normalizedData}
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
                maxValue={Y_MAX + Y_OFFSET}
                yAxisLabelTexts={Y_AXIS_LABELS}
                backgroundColor="transparent"
                showFractionalValues={true}
                yAxisThickness={0}
                xAxisThickness={0}
                initialSpacing={initialSpacing}
                spacing={spacing}
                endSpacing={endSpacing}
                showVerticalLines={false}
                adjustToWidth={true}
                isAnimated={false}
              />
            </View>
          </View>
        </View>

        <View style={styles.footerBox}>
          <Text style={styles.footerText}>
            Current Position: {currentPosition.toFixed(2)}
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
  iconButton: {
    padding: s(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: s(24),
    height: s(24),
    tintColor: '#00BFFF',
  },
  blueBox: {
    width: s(40),
    height: s(40),
    backgroundColor: '#00BFFF',
    borderRadius: s(8),
  },
  selectDateButton: {
    paddingHorizontal: s(16),
    paddingVertical: vs(12),
    borderRadius: s(12),
    borderWidth: 1,
    borderColor: 'rgba(10, 196, 255, 0.5)',
    backgroundColor: 'rgba(10, 196, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(12),
  },
  selectDateText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: ms(14),
    fontWeight: '600',
    fontFamily: 'SourceSansPro-Regular',
  },
  selectedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    marginBottom: vs(12),
  },
  selectedDateBox: {
    flex: 1,
    paddingHorizontal: s(16),
    paddingVertical: vs(12),
    borderRadius: s(12),
    borderWidth: 1,
    borderColor: 'rgba(10, 196, 255, 0.5)',
    backgroundColor: 'rgba(10, 196, 255, 0.1)',
  },
  selectedDateText: {
    color: '#00BFFF',
    fontSize: ms(15),
    fontWeight: '600',
    fontFamily: 'SourceSansPro-Regular',
  },
  clearButton: {
    paddingHorizontal: s(16),
    paddingVertical: vs(12),
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderRadius: s(8),
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.5)',
  },
  clearText: {
    color: '#FF3B30',
    fontSize: ms(14),
    fontWeight: '600',
    fontFamily: 'SourceSansPro-Regular',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  iosSheet: {
    marginTop: 'auto',
    backgroundColor: 'transparent',
    borderTopLeftRadius: s(18),
    borderTopRightRadius: s(18),
    marginBottom: scale(200),
    justifyContent: 'center',
    alignItems: 'center',
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
