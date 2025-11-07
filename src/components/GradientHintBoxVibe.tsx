// src/components/GradientHintBoxVibe.tsx
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  LayoutChangeEvent,
} from 'react-native';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import Svg, {
  Defs,
  LinearGradient as SvgGrad,
  Rect,
  Stop,
} from 'react-native-svg';
import { palette } from '../theme';

type Field = {
  /** Label above the textarea */
  label: string;
  /** Value (controlled) */
  value: string;
  /** Called on change */
  onChangeText: (t: string) => void;
  /** Placeholder inside textarea */
  placeholder?: string;
  /** Max length for counter (optional) */
  maxLength?: number;
  /** Helper prefix (e.g., "What does your best self look like?") */
  helper?: string;
};

type Props = {
  title: string;
  description?: string;
  /** Two (or more) fields to render vertically */
  fields: Field[];
};

export default function GradientHintBoxVibe({
  title,
  description,
  fields,
}: Props) {
  const [w, setW] = useState(0);
  const [h, setH] = useState(vs(80));

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setW(Math.round(width));
    setH(Math.max(vs(80), Math.round(height) || vs(80)));
  }, []);

  return (
    <View style={styles.wrap} onLayout={onLayout}>
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
            <SvgGrad id="outerGrad" x1="0" y1="0" x2="1" y2="0">
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
            stroke="url(#outerGrad)"
            strokeWidth={1}
          />
        </Svg>
      )}

      <View style={styles.inner}>
        <Text style={styles.title}>{title}</Text>
        {!!description && <Text style={styles.desc}>{description}</Text>}

        {fields.map((f, idx) => (
          <FieldBlock key={idx} {...f} />
        ))}
      </View>
    </View>
  );
}

/** Single labeled textarea with its own gradient outline + helper counter */
function FieldBlock({
  label,
  value,
  onChangeText,
  placeholder,
  maxLength = 500,
  helper,
}: Field) {
  const count = useMemo(() => value?.length ?? 0, [value]);

  return (
    <View style={{ marginTop: vs(12) }}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <GradientTextarea
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        maxLength={maxLength}
      />

      {!!helper && (
        <Text style={styles.helper}>
          {helper} {count}/{maxLength}
        </Text>
      )}
    </View>
  );
}

/** Textarea with rounded gradient outline (matches the card’s style) */
function GradientTextarea({
  value,
  onChangeText,
  placeholder,
  maxLength,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  const [w, setW] = useState(0);
  const [h, setH] = useState(vs(90));

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setW(Math.round(width));
    setH(Math.max(vs(90), Math.round(height) || vs(90)));
  }, []);

  const R = s(12);

  return (
    <View style={styles.textareaWrap} onLayout={onLayout}>
      {w > 0 && (
        <Svg
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
          width={w}
          height={h}
        >
          <Defs>
            <SvgGrad id="inputGrad" x1="0" y1="0" x2="1" y2="0">
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
            rx={R}
            ry={R}
            fill="transparent"
            stroke="url(#inputGrad)"
            strokeWidth={1}
          />
        </Svg>
      )}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.white}
        multiline
        maxLength={maxLength}
        textAlignVertical="top"
        style={styles.textarea}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    position: 'relative',
    borderRadius: s(12),
  },
  inner: {
    paddingHorizontal: s(16),
    paddingVertical: vs(14),
  },

  title: {
    color: palette.white,
    fontSize: ms(18),
    fontWeight: '800',
    marginBottom: vs(6),
  },
  desc: {
    color: palette.white,
    fontSize: ms(14),
    lineHeight: ms(20),
  },

  fieldLabel: {
    color: palette.white,
    fontSize: ms(16),
    fontWeight: '800',
    marginBottom: vs(8),
  },

  textareaWrap: {
    borderRadius: s(12),
    minHeight: vs(95),
    padding: s(10),
  },
  textarea: {
    minHeight: vs(95),
    borderRadius: s(10),
    color: palette.white,
    fontSize: ms(14.5),
    lineHeight: ms(21),
    paddingHorizontal: s(8),
    paddingVertical: vs(8),
  },

  helper: {
    marginTop: vs(8),
    color: palette.white,
    fontSize: ms(12),
    fontWeight: '500',
  },
});
