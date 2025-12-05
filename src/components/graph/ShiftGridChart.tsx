// src/components/graph/ShiftGridChart.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  LayoutChangeEvent,
  TouchableOpacity,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
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
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import GradientCardHome from '../GradientCardHome';
import { palette } from '../../theme';
import type { DensePoint } from '../../lib/dataClient';
import { useJournals } from '../../contexts/JournalContext';

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
  const { setSelectedFilterDate, clearSelectedFilterDate, selectedFilterDate } =
    useJournals();
  const [width, setWidth] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  // Sync local selectedDate with context's selectedFilterDate
  useEffect(() => {
    if (selectedFilterDate) {
      const date = new Date(selectedFilterDate);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
      }
    } else {
      setSelectedDate(null);
    }
  }, [selectedFilterDate]);

  // Filter series based on selected date's month
  const series: DensePoint[] = useMemo(() => {
    const allSeries = denseSeries ?? [];

    // If no date is selected, show all data
    if (!selectedFilterDate || !selectedDate) {
      return allSeries;
    }

    // Filter to show only the selected month
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();

    return allSeries.filter(item => {
      const itemDate = new Date(item.date);
      if (isNaN(itemDate.getTime())) return false;
      return (
        itemDate.getFullYear() === selectedYear &&
        itemDate.getMonth() === selectedMonth
      );
    });
  }, [denseSeries, selectedFilterDate, selectedDate]);

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

    // If a date is selected, show only that month's label
    if (selectedDate) {
      const monthName = selectedDate.toLocaleDateString('en-US', {
        month: 'short',
      });
      return [{ label: monthName, x: 50 }]; // Center the label
    }

    // Otherwise, show all months evenly distributed
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
  }, [series, selectedDate]);

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

  // Handle date picker change
  const onDatePickerChange = useCallback(
    (e: DateTimePickerEvent, date?: Date) => {
      if (Platform.OS === 'android') {
        setShowPicker(false);
        if (e.type === 'set' && date) {
          setSelectedDate(date);
          const isoDate = date.toISOString().split('T')[0];
          setSelectedFilterDate(isoDate);
        }
      } else {
        // iOS - auto-select on change
        if (date) {
          setShowPicker(false);
          setSelectedDate(date);
          const isoDate = date.toISOString().split('T')[0];
          setSelectedFilterDate(isoDate);
        }
      }
    },
    [setSelectedFilterDate],
  );

  // Handle clear date
  const handleClearDate = useCallback(() => {
    setSelectedDate(null);
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

  // Get title with month if date is selected
  const chartTitle = useMemo(() => {
    if (selectedDate) {
      const monthName = selectedDate.toLocaleDateString('en-US', {
        month: 'long',
      });
      const year = selectedDate.getFullYear();
      return `Shift Grid - ${monthName} ${year}`;
    }
    return 'Shift Grid (365 dots)';
  }, [selectedDate]);

  return (
    <GradientCardHome>
      <Text style={styles.title}>{chartTitle}</Text>

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
});
