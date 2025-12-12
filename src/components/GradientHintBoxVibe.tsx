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
import { useAppTheme, useThemeMode } from '../theme/ThemeProvider';

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
  const theme = useAppTheme();
  const { themeMode } = useThemeMode();
  const isDark = themeMode === 'dark';
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
            {isDark ? (
              <SvgGrad id="outerGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#0AC4FF" />
                <Stop offset="0.52" stopColor="#0AC4FF" />
                <Stop offset="1" stopColor="#1a4258ff" />
              </SvgGrad>
            ) : (
              <SvgGrad id="outerGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={theme.colors.border} />
                <Stop offset="1" stopColor={theme.colors.border} />
              </SvgGrad>
            )}
          </Defs>
          <Rect
            x={1}
            y={1}
            width={w - 2}
            height={h - 2}
            rx={s(12)}
            ry={s(12)}
            fill={isDark ? "transparent" : "rgba(255, 255, 255, 0.6)"}
            stroke={isDark ? "url(#outerGrad)" : theme.colors.border}
            strokeWidth={1}
          />
        </Svg>
      )}

      <View style={styles.inner}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        {!!description && <Text style={[styles.desc, { color: theme.colors.textMuted }]}>{description}</Text>}

        {fields.map((f, idx) => (
          <FieldBlock key={idx} {...f} theme={theme} isDark={isDark} />
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
  theme,
  isDark,
}: Field & { theme: any; isDark: boolean }) {
  const count = useMemo(() => value?.length ?? 0, [value]);

  return (
    <View style={{ marginTop: vs(12) }}>
      <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>{label}</Text>

      <GradientTextarea
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        maxLength={maxLength}
        theme={theme}
        isDark={isDark}
      />

      {!!helper && (
        <Text style={[styles.helper, { color: theme.colors.textMuted }]}>
          {helper} {count}/{maxLength}
        </Text>
      )}
    </View>
  );
}

/** Textarea with rounded gradient outline (matches the card's style) */
function GradientTextarea({
  value,
  onChangeText,
  placeholder,
  maxLength,
  theme,
  isDark,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  maxLength?: number;
  theme: any;
  isDark: boolean;
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
            {isDark ? (
              <SvgGrad id="inputGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#0AC4FF" />
                <Stop offset="0.52" stopColor="#0AC4FF" />
                <Stop offset="1" stopColor="#1a4258ff" />
              </SvgGrad>
            ) : (
              <SvgGrad id="inputGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={theme.colors.border} />
                <Stop offset="1" stopColor={theme.colors.border} />
              </SvgGrad>
            )}
          </Defs>
          <Rect
            x={1}
            y={1}
            width={w - 2}
            height={h - 2}
            rx={R}
            ry={R}
            fill={isDark ? "transparent" : "rgba(255, 255, 255, 0.6)"}
            stroke={isDark ? "url(#inputGrad)" : theme.colors.border}
            strokeWidth={1}
          />
        </Svg>
      )}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        multiline
        maxLength={maxLength}
        textAlignVertical="top"
        style={[styles.textarea, { color: theme.colors.text }]}
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
    fontSize: ms(18),
    fontWeight: '800',
    marginBottom: vs(6),
    fontFamily: 'SourceSansPro-Regular',
  },
  desc: {
    fontSize: ms(14),
    lineHeight: ms(20),
    fontFamily: 'SourceSansPro-Regular',
  },

  fieldLabel: {
    fontSize: ms(16),
    fontWeight: '800',
    marginBottom: vs(8),
    fontFamily: 'SourceSansPro-Regular',
  },

  textareaWrap: {
    borderRadius: s(12),
    minHeight: vs(95),
    padding: s(10),
  },
  textarea: {
    minHeight: vs(95),
    borderRadius: s(10),
    fontSize: ms(14.5),
    lineHeight: ms(21),
    paddingHorizontal: s(8),
    paddingVertical: vs(8),
    fontFamily: 'SourceSansPro-Regular',
  },

  helper: {
    marginTop: vs(8),
    fontSize: ms(12),
    fontWeight: '500',
    fontFamily: 'SourceSansPro-Regular',
  },
});
