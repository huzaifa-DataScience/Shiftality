// src/components/GradientInput.tsx
import React, { useCallback, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  LayoutChangeEvent,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  Text,
  ViewStyle,
} from 'react-native';
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

// src/components/GradientInput.tsx
type BaseProps = {
  radius?: number;
  stroke?: number;
  bgColor?: string;
  containerStyle?: ViewStyle;

  /** Min visual height (border + content). Default is compact 48 */
  minHeight?: number;

  // icons...
  leftIconSource?: ImageSourcePropType;
  rightIconSource?: ImageSourcePropType;
  onRightIconPress?: () => void;

  // pressable mode...
  pressable?: boolean;
  valueText?: string;
  onPress?: () => void;
  placeholderText?: string;
};

const GradientInput: React.FC<Props> = ({
  radius = s(12),
  stroke = 1,
  // bgColor = '#0D131C',
  containerStyle,
  minHeight = vs(45), // ⬅️ smaller default

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
      // never go below the minHeight you want
      setW(Math.round(e.nativeEvent.layout.width));
      setH(Math.max(minHeight, measured || minHeight));
    },
    [minHeight],
  );

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
            fill={'transparent'}
            stroke="url(#borderGrad)"
            strokeWidth={stroke}
          />
        </Svg>
      )}

      {leftIconSource && (
        <Image
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
            style={{ color: valueText ? '#FFF' : '#8EA0B6', fontSize: ms(15) }}
          >
            {valueText || placeholderText}
          </Text>
        </TouchableOpacity>
      ) : (
        <TextInput
          placeholderTextColor="#8EA0B6"
          style={[
            styles.input,
            {
              borderRadius: radius,
              minHeight: h,
              paddingVertical: vs(8), // ⬅️ tighter vertical padding
              paddingLeft: s(16) + contentPaddingLeft,
              paddingRight: s(16) + contentPaddingRight,
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
            <Image
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
    color: '#FFF',
    fontSize: ms(16),
    fontWeight: '500',
    backgroundColor: 'transparent',
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
  rightIcon: { width: s(16), height: s(16), tintColor: '#8EDAFF' },
});
export default GradientInput;
