// src/components/GradientHintBoxWithLikert.tsx
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgGrad,
  Stop,
  Rect,
} from 'react-native-svg';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';

import { palette } from '../theme';
import LikertPill from './survey/LikertPill';

type Choice = 'yes' | 'no' | null;

interface Props {
  text: string;
  onSelect?: (value: Choice) => void;
  /** Controlled selected value. Pass null for unselected. Omit to use internal state. */
  selected?: Choice;
  defaultSelected?: Choice;
}

export default function GradientHintBoxWithLikert({
  text,
  onSelect,
  selected, // <- controlled when defined (including null)
  defaultSelected = null, // <- for uncontrolled mode only
}: Props) {
  const isControlled = selected !== undefined;
  const [internal, setInternal] = useState<Choice>(defaultSelected);

  const current: Choice = isControlled ? selected! : internal;

  const [w, setW] = useState(0);
  const [h, setH] = useState(vs(90));
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setW(Math.round(width));
    setH(Math.max(vs(90), Math.round(height) || vs(90)));
  }, []);

  const handlePress = (val: Exclude<Choice, null>) => {
    // toggle behaviour: tap again to clear
    const next: Choice = current === val ? null : val;
    if (!isControlled) setInternal(next);
    onSelect?.(next);
  };

  return (
    <View
      style={[styles.wrap, { minHeight: vs(90), borderRadius: s(12) }]}
      onLayout={onLayout}
    >
      {w > 0 && (
        <Svg
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
          width={w}
          height={h}
        >
          <Defs>
            <SvgGrad id="borderGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#0AC4FF" />
              <Stop offset="0.52" stopColor="#0AC4FF" />
              <Stop offset="1" stopColor="#1a4258ff" />
            </SvgGrad>
          </Defs>
          <Rect
            x={0.5}
            y={0.5}
            width={w - 1}
            height={h - 1}
            rx={s(12)}
            ry={s(12)}
            fill="transparent"
            stroke="url(#borderGrad)"
            strokeWidth={1}
          />
        </Svg>
      )}

      <View style={styles.inner}>
        <Text style={styles.text}>{text}</Text>

        <View style={styles.likertRow}>
          <LikertPill
            label="Yes"
            selected={current === 'yes'}
            width={s(100)}
            onPress={() => handlePress('yes')}
          />
          <LikertPill
            label="No"
            selected={current === 'no'}
            width={s(100)}
            onPress={() => handlePress('no')}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', position: 'relative', marginVertical: vs(10) },
  inner: {
    paddingHorizontal: s(16),
    paddingVertical: vs(16),
    alignItems: 'center',
  },
  text: {
    color: palette.white,
    fontSize: ms(15),
    lineHeight: ms(21),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: vs(14),
  },
  likertRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    columnGap: s(20),
  },
});
