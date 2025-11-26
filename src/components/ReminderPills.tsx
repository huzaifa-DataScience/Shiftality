// src/components/ReminderPills.tsx
import React, { useMemo, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { scale as s, verticalScale as vs } from 'react-native-size-matters';
import LikertPill from './survey/LikertPill';

type Props = {
  /** Labels for each reminder button */
  labels?: string[];

  /** Pills that already have reminders configured – should show active */
  activeIndices?: number[];

  /** Called when user taps a pill */
  onPressPill?: (index: number) => void;
};

export default function ReminderPills({
  labels = [
    'Reminder 1',
    'Reminder 2',
    'Reminder 3',
    'Reminder 4',
    'Reminder 5',
  ],
  activeIndices = [],
  onPressPill,
}: Props) {
  const [measuredW, setMeasuredW] = useState(0);

  const widths = useMemo(() => {
    if (measuredW <= 0) return { half: s(140), full: s(300) };
    const gap = s(12);
    const half = Math.floor((measuredW - gap) / 2);
    return { half, full: measuredW };
  }, [measuredW]);

  const isSelected = (i: number) => activeIndices.includes(i);

  return (
    <View
      style={styles.wrap}
      onLayout={(e: LayoutChangeEvent) =>
        setMeasuredW(Math.round(e.nativeEvent.layout.width))
      }
    >
      {/* Row 1 */}
      <View style={styles.row}>
        <LikertPill
          label={labels[0]}
          selected={isSelected(0)}
          width={widths.half}
          onPress={() => onPressPill?.(0)}
        />
        <View style={{ width: s(12) }} />
        <LikertPill
          label={labels[1]}
          selected={isSelected(1)}
          width={widths.half}
          onPress={() => onPressPill?.(1)}
        />
      </View>

      {/* Row 2 */}
      <View style={[styles.row, { marginTop: vs(10) }]}>
        <LikertPill
          label={labels[2]}
          selected={isSelected(2)}
          width={widths.half}
          onPress={() => onPressPill?.(2)}
        />
        <View style={{ width: s(12) }} />
        <LikertPill
          label={labels[3]}
          selected={isSelected(3)}
          width={widths.half}
          onPress={() => onPressPill?.(3)}
        />
      </View>

      {/* Row 3 */}
      <View style={{ marginTop: vs(10) }}>
        <LikertPill
          label={labels[4]}
          selected={isSelected(4)}
          width={widths.full}
          onPress={() => onPressPill?.(4)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center' },
});
