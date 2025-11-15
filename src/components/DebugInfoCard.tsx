import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
  scale,
} from 'react-native-size-matters';
import GradientCardHome from './GradientCardHome';
import { palette } from '../theme';
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
}: {
  label: string;
  value: string | number;
}) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{String(value)}</Text>
  </View>
);

/** Small reusable inner bordered section (title + children) */
const InnerBorder: React.FC<{
  title: string;
  radius?: number;
  stroke?: number;
  children: React.ReactNode;
}> = ({ title, children, radius = s(12), stroke = 1 }) => {
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
            <SvgGrad id={gradId} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#0AC4FF" />
              <Stop offset="0.52" stopColor="#0AC4FF" />
              <Stop offset="1" stopColor="#1a4258ff" />
            </SvgGrad>
          </Defs>
          <Rect
            x={stroke / 2}
            y={stroke / 2}
            width={w - stroke}
            height={h - stroke}
            rx={radius}
            ry={radius}
            fill="transparent"
            stroke={`url(#${gradId})`}
            strokeWidth={stroke}
          />
        </Svg>
      )}

      <Text style={styles.title}>{title}</Text>
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
      }}
    >
      <Text style={styles.title}>Debug Information</Text>
      <Text style={styles.sub}>
        System information and belief profile validation
      </Text>

      <View style={styles.sectionGap} />

      <LabeledRow label="Timezone:" value={timezone} />
      <LabeledRow label="Journey Start:" value={journeyStart} />
      <LabeledRow label="Today:" value={today} />
      <LabeledRow label="Total Check-ins:" value={totalCheckins} />
      <LabeledRow label="Latest Check-in:" value={latestCheckin} />
      <LabeledRow label="Next Anchor:" value={nextAnchor} />

      <View style={styles.blockGap} />
      <Text style={styles.h2}>Belief Profile</Text>
      <LabeledRow label="Archetype:" value={archetype} />
      <View style={styles.row}>
        <Text style={styles.label} />
        <Text style={[styles.value, { marginTop: vs(2) }]}>
          {baselineIndex}
        </Text>
      </View>
      <LabeledRow label="Empowering:" value={empowering} />
      <LabeledRow label="Shadow:" value={shadow} />

      <View style={styles.blockGap} />

      <InnerBorder title="Last 10 Check-in Dates:">
        <View style={styles.gridRow}>
          {cols.map((c, i) => (
            <View key={i} style={styles.gridCol}>
              {c.map((d, j) => (
                <Text key={`${i}-${j}`} style={styles.gridText}>
                  {d}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </InnerBorder>

      <View style={styles.blockGap} />

      <InnerBorder title="Forward-only rule:">
        <Text style={styles.ruleText}>
          Demo never writes backward dates. Anchor = latest saved day +1; if
          none, use journey_start_date; else today.
        </Text>
      </InnerBorder>
    </GradientCardHome>
  );
}

const styles = StyleSheet.create({
  title: {
    color: palette.white,
    fontSize: s(18),
    fontWeight: '800',
    fontFamily: 'SourceSansPro-Regular',
  },
  sub: {
    color: palette.white,
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
  label: { color: '#C9D9F6', fontWeight: '800', fontSize: ms(14) },
  value: {
    color: '#EAF2FF',
    fontSize: ms(14.5),
    fontWeight: '600',
    fontFamily: 'SourceSansPro-Regular',
  },

  h2: {
    color: palette.white,
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
    color: '#EAF2FF',
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
    color: '#EAF2FF',
    fontSize: ms(14),
    lineHeight: ms(18),
    fontFamily: 'SourceSansPro-Regular',
  },

  ruleText: {
    color: '#EAF2FF',
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
