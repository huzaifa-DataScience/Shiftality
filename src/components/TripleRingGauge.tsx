import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLG,
  Stop,
  Circle,
  G,
  Text as SvgText,
} from 'react-native-svg';
import { scale as s } from 'react-native-size-matters';
import { useAppTheme, useThemeMode } from '../theme/ThemeProvider';

// Gradient colors - will be set dynamically based on theme

type Props = {
  /** e.g. 0.4 for 40% */
  valuePct: number;
  /** overall square size */
  size?: number;
  /** unique id base (important if many on one screen) */
  idBase: string;
};

export default function TripleRingGauge({
  valuePct,
  size = s(108),
  idBase,
}: Props) {
  const theme = useAppTheme();
  const { themeMode } = useThemeMode();
  const isDark = themeMode === 'dark';

  // geometry
  const cx = size / 2;
  const cy = size / 2;

  // ring thickness & spacing
  const track = 6; // track stroke width
  const prog = 7.5; // progress stroke width (a bit thicker than track)
  const gap = 4; // spacing between rings

  // radii (outer → inner)
  const rOuter = size / 2 - prog / 2; // keep inside the viewBox
  const rMid = rOuter - (prog + gap);
  const rInner = rMid - (prog + gap);

  const rings = [
    { r: rOuter, gradId: `${idBase}-g1` },
    { r: rMid, gradId: `${idBase}-g2` },
    { r: rInner, gradId: `${idBase}-g3` },
  ];

  // All rings use same percentage; tweak here if you want different values per ring
  const pct = Math.max(0, Math.min(100, valuePct)) / 100;
  const startAngle = -90; // start at top

  const arcLen = (r: number) => 2 * Math.PI * r;
  const dashFor = (r: number) => {
    const c = arcLen(r);
    const filled = c * pct;
    const empty = c - filled;
    return `${filled} ${empty}`; // simple dash for a single arc
  };

  // Gradient colors based on theme
  const gradColors = isDark
    ? [
        { offset: '0%', color: '#0390bbff' },
        { offset: '100%', color: '#059cd8ff' },
      ]
    : [
        { offset: '0%', color: '#4CC3FF' },
        { offset: '100%', color: '#61C3FF' },
      ];

  // Track color based on theme
  const trackColor = isDark
    ? 'rgba(238, 217, 217, 0.08)'
    : 'rgba(0, 0, 0, 0.08)';

  // Text color based on theme
  const textColor = isDark ? '#FFFFFF' : theme.colors.text;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          {rings.map((ring, idx) => (
            <SvgLG
              key={ring.gradId}
              id={ring.gradId}
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              {gradColors.map(g => (
                <Stop
                  key={`${ring.gradId}-${g.offset}`}
                  offset={g.offset}
                  stopColor={g.color}
                />
              ))}
            </SvgLG>
          ))}
        </Defs>

        <G rotation={startAngle} origin={`${cx}, ${cy}`}>
          {/* tracks (subtle) */}
          {rings.map(ring => (
            <Circle
              key={`t-${ring.gradId}`}
              cx={cx}
              cy={cy}
              r={ring.r}
              stroke={trackColor}
              strokeWidth={track}
              fill="none"
            />
          ))}

          {/* progress rings */}
          {rings.map(ring => (
            <Circle
              key={`p-${ring.gradId}`}
              cx={cx}
              cy={cy}
              r={ring.r}
              stroke={`url(#${ring.gradId})`}
              strokeWidth={prog}
              strokeLinecap="round"
              strokeDasharray={dashFor(ring.r)}
              fill="none"
            />
          ))}
        </G>

        {/* center % label */}
        <SvgText
          x={cx - 5}
          y={cy + 4} // slight visual centering
          fill={textColor}
          fontWeight="800"
          fontSize={size * 0.12}
          textAnchor="middle"
        >
          {Math.round(valuePct)}%
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({});
