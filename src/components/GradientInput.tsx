import React, { useCallback, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  LayoutChangeEvent,
  ImageSourcePropType,
  TouchableOpacity,
  Text,
  ViewStyle,
} from 'react-native';
// ❌ remove this line
// import FastImage from 'react-native-fast-image';
import AppImage from './AppImage';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import Svg, {
  Defs,
  LinearGradient as SvgGrad,
  Stop,
  Rect,
} from 'react-native-svg';
import { useAppTheme, useThemeMode } from '../theme/ThemeProvider';

type BaseProps = {
  radius?: number;
  stroke?: number;
  bgColor?: string;
  containerStyle?: ViewStyle;
  minHeight?: number;
  leftIconSource?: ImageSourcePropType;
  rightIconSource?: ImageSourcePropType;
  onRightIconPress?: () => void;
  pressable?: boolean;
  valueText?: string;
  onPress?: () => void;
  placeholderText?: string;
};

type Props = BaseProps & TextInputProps;

const GradientInput: React.FC<Props> = ({
  radius = s(12),
  stroke = 1,
  containerStyle,
  minHeight = vs(45),
  leftIconSource,
  rightIconSource,
  onRightIconPress,
  pressable,
  valueText,
  onPress,
  placeholderText = 'Select',
  style,
  ...textInputProps
}) => {
  const [w, setW] = useState(0);
  const [h, setH] = useState(minHeight);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const measured = Math.round(e.nativeEvent.layout.height);
      setW(Math.round(e.nativeEvent.layout.width));
      setH(Math.max(minHeight, measured || minHeight));
    },
    [minHeight],
  );

  const theme = useAppTheme();
  const { themeMode } = useThemeMode();
  const isDark = themeMode === 'dark';

  // Theme-aware border: gradient in dark mode, solid in light mode
  const borderStartColor = '#0AC4FF'; // Cyan
  const borderEndColor = isDark
    ? '#1a4258ff'
    : '#9CA3AF'; // Dark blue in dark mode, darker gray in light mode
  const useGradient = isDark; // Only use gradient in dark mode

  const contentPaddingLeft = leftIconSource ? s(12) : 0;
  const contentPaddingRight = rightIconSource ? s(40) : 0;

  return (
    <View style={[styles.wrap, containerStyle]} onLayout={onLayout}>
      {w > 0 && (
        <Svg
          style={StyleSheet.absoluteFill}
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
        >
          {useGradient ? (
            <>
              <Defs>
                <SvgGrad id="borderGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={borderStartColor} />
                  <Stop offset="0.52" stopColor={borderStartColor} />
                  <Stop offset="1" stopColor={borderEndColor} />
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
                stroke="url(#borderGrad)"
                strokeWidth={stroke}
              />
            </>
          ) : (
            <Rect
              x={stroke / 2}
              y={stroke / 2}
              width={w - stroke}
              height={h - stroke}
              rx={radius}
              ry={radius}
              fill="transparent"
              stroke={borderEndColor}
              strokeWidth={stroke}
            />
          )}
        </Svg>
      )}

      {leftIconSource && (
        <AppImage
          source={leftIconSource}
          style={styles.leftIcon}
          resizeMode="contain"
        />
      )}

      {pressable ? (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPress}
          style={[
            styles.pressable,
            {
              minHeight: h,
              borderRadius: radius,
              paddingLeft: s(16) + contentPaddingLeft,
              paddingRight: s(16) + contentPaddingRight,
            },
          ]}
        >
          <Text
            numberOfLines={1}
            style={{
              color: valueText
                ? theme.colors.text
                : theme.colors.textMuted,
              fontSize: ms(15),
            }}
          >
            {valueText || placeholderText}
          </Text>
        </TouchableOpacity>
      ) : (
        <TextInput
          placeholderTextColor={theme.colors.textMuted}
          style={[
            styles.input,
            {
              borderRadius: radius,
              minHeight: h,
              paddingVertical: vs(8),
              paddingLeft: s(16) + contentPaddingLeft,
              paddingRight: s(16) + contentPaddingRight,
              color: theme.colors.text,
            },
            style,
          ]}
          {...textInputProps}
        />
      )}

      {rightIconSource && (
        <TouchableOpacity
          onPress={onRightIconPress}
          activeOpacity={onRightIconPress ? 0.8 : 1}
          style={styles.rightIconBtn}
        >
          <View style={styles.rightIconBg}>
            <AppImage
              source={rightIconSource}
              style={styles.rightIcon}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { width: '100%', position: 'relative' },
  input: {
    fontSize: ms(16),
    fontWeight: '500',
    backgroundColor: 'transparent',
    fontFamily: 'SourceSansPro-Regular',
    // color is set dynamically
  },
  pressable: { justifyContent: 'center', backgroundColor: 'transparent' },
  leftIcon: {
    position: 'absolute',
    left: s(12),
    top: '50%',
    width: s(18),
    height: s(18),
    transform: [{ translateY: -s(9) }],
    opacity: 0.9,
  },
  rightIconBtn: {
    position: 'absolute',
    right: s(8),
    top: '50%',
    transform: [{ translateY: -s(14) }],
  },
  rightIconBg: {
    width: s(28),
    height: s(28),
    borderRadius: s(14),
    backgroundColor: 'rgba(66,149,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightIcon: { width: s(20), height: s(20), tintColor: '#8EDAFF' },
});

export default GradientInput;
