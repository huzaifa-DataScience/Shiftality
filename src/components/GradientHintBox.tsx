import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  LayoutChangeEvent,
} from 'react-native';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
  scale,
} from 'react-native-size-matters';
import Svg, {
  Defs,
  LinearGradient as SvgGrad,
  Stop,
  Rect,
} from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { palette } from '../theme';

type Props = {
  /** Main body text */
  text: string;

  /** Optional heading shown above the text (left aligned) */
  title?: string;

  /** ---- Optional header adornments (design-specific) ---- */
  /** Show the "Recommended" gradient chip (left side) */
  showRecommendedChip?: boolean;
  /** Override chip text (default: "Recommended") */
  recommendedText?: string;

  /** Show the edit button (right side) */
  showEditButton?: boolean;
  /** PNG/SVG source for the edit icon */
  editIcon?: ImageSourcePropType;
  /** Called when edit is pressed */
  onPressEdit?: () => void;

  /** Sizes/colors/spacing */
  radius?: number;
  stroke?: number;
  bgColor?: string;
  minHeight?: number;

  /** Style overrides */
  style?: ViewStyle;
  titleStyle?: TextStyle;
  textStyle?: TextStyle;
};

export default function GradientHintBox({
  text,
  title,

  showRecommendedChip,
  recommendedText = 'Recommended',

  showEditButton,
  editIcon,
  onPressEdit,

  radius = s(12),
  stroke = 1,
  bgColor = 'transparent',
  minHeight = vs(45),

  style,
  titleStyle,
  textStyle,
}: Props) {
  const [w, setW] = useState(0);
  const [h, setH] = useState(minHeight);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      setW(Math.round(width));
      setH(Math.max(minHeight, Math.round(height) || minHeight));
    },
    [minHeight],
  );

  const showHeaderRow = !!title || showRecommendedChip || showEditButton;

  return (
    <View
      style={[styles.wrap, { minHeight, borderRadius: radius }, style]}
      onLayout={onLayout}
    >
      {/* gradient border */}
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
            x={stroke / 2}
            y={stroke / 2}
            width={w - stroke}
            height={h - stroke}
            rx={radius}
            ry={radius}
            fill={bgColor}
            stroke="url(#borderGrad)"
            strokeWidth={stroke}
          />
        </Svg>
      )}

      <View style={[styles.inner, { borderRadius: radius }]}>
        {showHeaderRow && (
          <View style={styles.headerRow}>
            {/* Left side: optional title (on top of chip) */}
            <View style={{ flex: 1 }}>
              {!!title && (
                <Text
                  style={[styles.title, { color: palette.white }, titleStyle]}
                  numberOfLines={2}
                >
                  {title}
                </Text>
              )}

              {showRecommendedChip && (
                <LinearGradient
                  colors={['#01093aff', '#96aedcff']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.recoChip}
                >
                  <Text style={styles.recoText}>{recommendedText}</Text>
                </LinearGradient>
              )}
            </View>

            {/* Right side: optional edit button */}
            {showEditButton && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onPressEdit}
                style={styles.editBtnHit}
              >
                {/* gradient ring */}
                <View style={styles.editInner}>
                  {editIcon ? (
                    <Image
                      source={editIcon}
                      resizeMode="contain"
                      style={styles.editIcon}
                    />
                  ) : null}
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}

        <Text style={[styles.copy, { color: palette.white }, textStyle]}>
          {text}
        </Text>
      </View>
    </View>
  );
}

const CHIP_H = vs(28);
const BTN = s(30);
const BTN_R = s(10);

const styles = StyleSheet.create({
  wrap: { width: '100%', position: 'relative' },
  inner: { paddingHorizontal: s(16), paddingVertical: vs(12) },

  /* header row contains (title + chip) on the left, edit on the right */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: vs(8),
    gap: s(10),
  },

  title: {
    fontSize: ms(16),
    fontWeight: '700',
    marginBottom: vs(6),
  },

  // "Recommended" gradient pill
  recoChip: {
    alignSelf: 'flex-start',
    height: CHIP_H,
    width: scale(100),
    borderRadius: CHIP_H,
    justifyContent: 'center',
  },
  recoText: {
    color: palette.white,
    fontSize: ms(12.5),
    fontWeight: '700',
    textAlign: 'center',
  },

  // Edit button (rounded square with gradient border and dark center)
  editBtnHit: {
    marginLeft: s(8),
    paddingTop: vs(2),
  },
  editInner: {
    flex: 1,
    borderRadius: BTN_R - 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: { width: s(20), height: s(20), tintColor: '#4ec7efff' },

  copy: {
    fontSize: ms(14),
    lineHeight: ms(20),
    fontWeight: '600',
  },
});
