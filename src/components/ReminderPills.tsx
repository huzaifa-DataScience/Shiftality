import React, { useMemo, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { scale as s, verticalScale as vs } from 'react-native-size-matters';
import LikertPill from './survey/LikertPill';

type Props = {
  /** Labels for each reminder button */
  labels?: string[];
  /** If you want to control selection from parent — index of active pill or null */
  value?: number | null;
  /** Called with index (0-based) when a pill is tapped; tapping the same pill again clears (null) */
  onChange?: (index: number | null) => void;
};

export default function ReminderPills({
  labels = [
    'Reminder 1',
    'Reminder 2',
    'Reminder 3',
    'Reminder 4',
    'Reminder 5',
  ],
  value,
  onChange,
}: Props) {
  const [measuredW, setMeasuredW] = useState(0);
  const [internal, setInternal] = useState<number | null>(0); // default select first
  const controlled = value !== undefined;
  const active = controlled ? value! : internal;

  const onPick = (i: number) => {
    const next = active === i ? null : i;
    if (!controlled) setInternal(next);
    onChange?.(next);
  };

  const widths = useMemo(() => {
    if (measuredW <= 0) return { half: s(140), full: s(300) }; // fallback
    const gap = s(12);
    const half = Math.floor((measuredW - gap) / 2); // 2 per row with gap
    return { half, full: measuredW };
  }, [measuredW]);

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
          selected={active === 0}
          width={widths.half}
          onPress={() => onPick(0)}
        />
        <View style={{ width: s(12) }} />
        <LikertPill
          label={labels[1]}
          selected={active === 1}
          width={widths.half}
          onPress={() => onPick(1)}
        />
      </View>

      {/* Row 2 */}
      <View style={[styles.row, { marginTop: vs(10) }]}>
        <LikertPill
          label={labels[2]}
          selected={active === 2}
          width={widths.half}
          onPress={() => onPick(2)}
        />
        <View style={{ width: s(12) }} />
        <LikertPill
          label={labels[3]}
          selected={active === 3}
          width={widths.half}
          onPress={() => onPick(3)}
        />
      </View>

      {/* Row 3 (single full-width) */}
      <View style={{ marginTop: vs(10) }}>
        <LikertPill
          label={labels[4]}
          selected={active === 4}
          width={widths.full}
          onPress={() => onPick(4)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center' },
});
