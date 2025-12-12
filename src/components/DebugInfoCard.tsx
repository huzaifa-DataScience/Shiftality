import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
  scale,
} from 'react-native-size-matters';
import GradientCardHome from './GradientCardHome';
import { useAppTheme, useThemeMode } from '../theme/ThemeProvider';
import { useFontSize } from '../theme/FontSizeProvider';
import Svg, {
  Defs,
  LinearGradient as SvgGrad,
  Stop,
  Rect,
} from 'react-native-svg';

type Props = {
  timezone: string;
  journeyStart: string; // YYYY-MM-DD
  today: string;
  totalCheckins: number;
  latestCheckin: string;
  nextAnchor: string;

  archetype: string;
  baselineIndex: string; // "53/100"
  empowering: number;
  shadow: number;

  last10Dates: string[]; // array of 10 dates
};

const LabeledRow = ({
  label,
  value,
  theme,
  isDark,
  scaledFontSize,
}: {
  label: string;
  value: string | number;
  theme: any;
  isDark: boolean;
  scaledFontSize: (size: number) => number;
}) => (
  <View style={styles.row}>
    <Text
      style={[
        styles.label,
        { color: theme.colors.textMuted, fontSize: scaledFontSize(14) },
      ]}
    >
      {label}
    </Text>
    <Text
      style={[
        styles.value,
        { color: theme.colors.text, fontSize: scaledFontSize(14.5) },
      ]}
    >
      {String(value)}
    </Text>
  </View>
);

/** Small reusable inner bordered section (title + children) */
const InnerBorder: React.FC<{
  title: string;
  radius?: number;
  stroke?: number;
  children: React.ReactNode;
  theme: any;
  isDark: boolean;
  scaledFontSize: (size: number) => number;
}> = ({
  title,
  children,
  radius = s(12),
  stroke = 1,
  theme,
  isDark,
  scaledFontSize,
}) => {
  const [w, setW] = useState(0);
  const [h, setH] = useState(vs(40));
  const gradId = useMemo(() => `ib_${Math.random().toString(36).slice(2)}`, []);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setW(Math.round(width));
    setH(Math.max(vs(40), Math.round(height) || vs(40)));
  }, []);

  return (
    <View style={[styles.wrap, { borderRadius: radius }]} onLayout={onLayout}>
      {w > 0 && (
        <Svg
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
          width={w}
          height={h}
        >
          <Defs>
            {isDark ? (
              <SvgGrad id={gradId} x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#0AC4FF" />
                <Stop offset="0.52" stopColor="#0AC4FF" />
                <Stop offset="1" stopColor="#1a4258ff" />
              </SvgGrad>
            ) : (
              <SvgGrad id={gradId} x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={theme.colors.border} />
                <Stop offset="1" stopColor={theme.colors.border} />
              </SvgGrad>
            )}
          </Defs>
          <Rect
            x={stroke / 2}
            y={stroke / 2}
            width={w - stroke}
            height={h - stroke}
            rx={radius}
            ry={radius}
            fill="transparent"
            stroke={isDark ? `url(#${gradId})` : theme.colors.border}
            strokeWidth={stroke}
          />
        </Svg>
      )}

      <Text
        style={[
          styles.innerTitle,
          { color: theme.colors.text, fontSize: scaledFontSize(14.5) },
        ]}
      >
        {title}
      </Text>
      <View style={{ marginTop: vs(8) }}>{children}</View>
    </View>
  );
};

export default function DebugInfoCard({
  timezone,
  journeyStart,
  today,
  totalCheckins,
  latestCheckin,
  nextAnchor,
  archetype,
  baselineIndex,
  empowering,
  shadow,
  last10Dates,
}: Props) {
  const theme = useAppTheme();
  const { themeMode } = useThemeMode();
  const { scaledFontSize } = useFontSize();
  const isDark = themeMode === 'dark';

  // split last10 into 3 columns
  const colSize = Math.ceil(last10Dates.length / 3);
  const cols = [
    last10Dates.slice(0, colSize),
    last10Dates.slice(colSize, colSize * 2),
    last10Dates.slice(colSize * 2),
  ];

  return (
    <GradientCardHome
      style={{
        width: scale(330),
        alignSelf: 'center',
      }}
    >
      <Text
        style={[
          styles.title,
          { color: theme.colors.text, fontSize: scaledFontSize(18) },
        ]}
      >
        Debug Information
      </Text>
      <Text
        style={[
          styles.sub,
          { color: theme.colors.textMuted, fontSize: scaledFontSize(16) },
        ]}
      >
        System information and belief profile validation
      </Text>

      <View style={styles.sectionGap} />

      <LabeledRow
        label="Timezone:"
        value={timezone}
        theme={theme}
        isDark={isDark}
        scaledFontSize={scaledFontSize}
      />
      <LabeledRow
        label="Journey Start:"
        value={journeyStart}
        theme={theme}
        isDark={isDark}
        scaledFontSize={scaledFontSize}
      />
      <LabeledRow
        label="Today:"
        value={today}
        theme={theme}
        isDark={isDark}
        scaledFontSize={scaledFontSize}
      />
      <LabeledRow
        label="Total Check-ins:"
        value={totalCheckins}
        theme={theme}
        isDark={isDark}
        scaledFontSize={scaledFontSize}
      />
      <LabeledRow
        label="Latest Check-in:"
        value={latestCheckin}
        theme={theme}
        isDark={isDark}
        scaledFontSize={scaledFontSize}
      />
      <LabeledRow
        label="Next Anchor:"
        value={nextAnchor}
        theme={theme}
        isDark={isDark}
        scaledFontSize={scaledFontSize}
      />

      <View style={styles.blockGap} />
      <Text
        style={[
          styles.h2,
          { color: theme.colors.text, fontSize: scaledFontSize(16) },
        ]}
      >
        Belief Profile
      </Text>
      <LabeledRow
        label="Archetype:"
        value={archetype}
        theme={theme}
        isDark={isDark}
        scaledFontSize={scaledFontSize}
      />
      <LabeledRow
        label="BaseLine:"
        value={baselineIndex}
        theme={theme}
        isDark={isDark}
        scaledFontSize={scaledFontSize}
      />
      <LabeledRow
        label="Empowering:"
        value={empowering}
        theme={theme}
        isDark={isDark}
        scaledFontSize={scaledFontSize}
      />
      <LabeledRow
        label="Shadow:"
        value={shadow}
        theme={theme}
        isDark={isDark}
        scaledFontSize={scaledFontSize}
      />

      <View style={styles.blockGap} />

      <InnerBorder
        title="Last 10 Check-in Dates:"
        theme={theme}
        isDark={isDark}
        scaledFontSize={scaledFontSize}
      >
        <View style={styles.gridRow}>
          {cols.map((c, i) => (
            <View key={i} style={styles.gridCol}>
              {c.map((d, j) => (
                <Text
                  key={`${i}-${j}`}
                  style={[
                    styles.gridText,
                    { color: theme.colors.text, fontSize: scaledFontSize(14) },
                  ]}
                >
                  {d}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </InnerBorder>

      <View style={styles.blockGap} />

      <InnerBorder
        title="Forward-only rule:"
        theme={theme}
        isDark={isDark}
        scaledFontSize={scaledFontSize}
      >
        <Text
          style={[
            styles.ruleText,
            { color: theme.colors.text, fontSize: scaledFontSize(14) },
          ]}
        >
          Demo never writes backward dates. Anchor = latest saved day +1; if
          none, use journey_start_date; else today.
        </Text>
      </InnerBorder>
    </GradientCardHome>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: s(18),
    fontWeight: '800',
    fontFamily: 'SourceSansPro-Regular',
  },
  sub: {
    fontSize: s(16),
    lineHeight: s(22),
    marginTop: vs(6),
    fontFamily: 'SourceSansPro-Regular',
  },

  sectionGap: { height: vs(14) },
  blockGap: { height: vs(14) },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: vs(6),
  },
  label: { fontWeight: '800', fontSize: ms(14) },
  value: {
    fontSize: ms(14.5),
    fontWeight: '600',
    fontFamily: 'SourceSansPro-Regular',
  },

  h2: {
    fontSize: ms(16),
    fontWeight: '800',
    marginBottom: vs(6),
  },

  /* inner bordered box */
  innerWrap: {
    position: 'relative',
    borderRadius: scale(8),
    paddingHorizontal: s(12),
  },
  innerTitle: {
    fontWeight: '800',
    fontSize: ms(14.5),
    fontFamily: 'SourceSansPro-Regular',
  },

  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: s(12),
  },
  gridCol: { flex: 1, rowGap: vs(6) },
  gridText: {
    fontSize: ms(14),
    lineHeight: ms(18),
    fontFamily: 'SourceSansPro-Regular',
  },

  ruleText: {
    fontSize: ms(14),
    lineHeight: ms(20),
    fontFamily: 'SourceSansPro-Regular',
  },
  wrap: {
    position: 'relative',
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
  },
});
