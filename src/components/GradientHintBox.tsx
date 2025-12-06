import React, { useCallback, useState, useMemo } from 'react';
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
  Switch,
  TextInput,
  TextInputProps,
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
import { useAppTheme } from '../theme/ThemeProvider';

type Props = {
  text?: string; // now optional (used for static copy OR placeholder)
  title?: string;
  showRecommendedChip?: boolean;
  recommendedText?: string;
  showEditButton?: boolean;
  editIcon?: ImageSourcePropType;
  onPressEdit?: () => void;
  radius?: number;
  stroke?: number;
  bgColor?: string;
  minHeight?: number;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  textStyle?: TextStyle;

  // +++ OPTIONAL INPUT SECTION
  showInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputValue?: string;
  onChangeInputText?: (t: string) => void;
  inputProps?: TextInputProps;
  secondaryText?: string;
  footerActionLabel?: string;
  footerIcon?: ImageSourcePropType;
  onPressFooterAction?: () => void;
  showSwitch?: boolean;
  switchValue?: boolean;
  onToggleSwitch?: (v: boolean) => void;
  /** Customize colors if you want */
  switchTrackOn?: string;
  switchTrackOff?: string;
  switchThumb?: string;

  showDeleteButton?: boolean;
  deleteIcon?: ImageSourcePropType;
  onPressDelete?: () => void;
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

  // +++ INPUT PROPS
  showInput = false,
  inputLabel = '',
  inputPlaceholder = '',
  inputValue,
  onChangeInputText,
  inputProps,
  secondaryText,
  footerActionLabel,
  footerIcon,
  onPressFooterAction,

  showSwitch = false,
  switchValue,
  onToggleSwitch,
  switchTrackOn = '#4CC3FF',
  switchTrackOff = '#334152',
  switchThumb = '#FFFFFF',
  showDeleteButton,
  onPressDelete,
  deleteIcon,
}: Props) {
  const { theme } = useAppTheme();
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

  const showHeaderRow =
    !!title || showRecommendedChip || showEditButton || showDeleteButton;

  // only show static copy when not in input mode
  const showCopy = !!text && !showInput;

  // if no explicit placeholder provided, fall back to the text
  const effectivePlaceholder = inputPlaceholder || text || '';

  // allow overriding TextInput style from inputProps.style
  const { style: inputStyleOverride, ...restInputProps } = inputProps || {};

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { width: '100%', position: 'relative' },
        inner: { paddingHorizontal: s(16), paddingVertical: vs(12) },

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
          fontFamily: 'SourceSansPro-Regular',
          color: theme.colors.text,
        },

        recoChip: {
          alignSelf: 'flex-start',
          height: CHIP_H,
          borderRadius: CHIP_H,
          justifyContent: 'center',
        },
        recoText: {
          fontSize: ms(16),
          fontWeight: '700',
          textAlign: 'center',
          fontFamily: 'SourceSansPro-Regular',
          color: theme.colors.text,
        },

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
        editIcon: {
          width: s(20),
          height: s(20),
          tintColor: theme.colors.txtBlue,
        },

        copy: {
          fontSize: ms(14),
          lineHeight: ms(20),
          fontWeight: '600',
          fontFamily: 'SourceSansPro-Regular',
          color: theme.colors.text,
        },

        // +++ INPUT styles
        inputBlock: {
          marginTop: vs(14),
        },
        inputLabel: {
          fontWeight: '800',
          fontSize: ms(15),
          marginBottom: vs(8),
          color: theme.colors.text,
        },
        textArea: {
          minHeight: vs(90),
          paddingHorizontal: s(12),
          fontSize: ms(14),
          lineHeight: ms(20),
          fontFamily: 'SourceSansPro-Regular',
          color: theme.colors.text,
        },

        secondary: {
          opacity: 0.9,
          marginTop: vs(10),
          fontSize: ms(14.5),
          fontWeight: '700',
          fontFamily: 'SourceSansPro-Regular',
          color: theme.colors.text,
        },

        footerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: vs(10),
        },
        footerIcon: {
          width: s(18),
          height: s(18),
          tintColor: theme.colors.txtBlue,
          marginRight: s(10),
        },
        footerText: {
          fontSize: ms(15),
          fontWeight: '700',
          fontFamily: 'SourceSansPro-Regular',
          color: theme.colors.text,
        },
        switchHit: {
          paddingLeft: s(6),
        },
        actionsRow: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        deleteBtnHit: {
          marginLeft: s(12),
          paddingTop: vs(2),
        },
        deleteInner: {
          flex: 1,
          borderRadius: BTN_R - 2,
          alignItems: 'center',
          justifyContent: 'center',
        },
        deleteIcon: {
          width: s(18),
          height: s(18),
        },
      }),
    [theme],
  );

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
            <View style={{ flex: 1 }}>
              {!!title && (
                <Text style={[styles.title, titleStyle]} numberOfLines={2}>
                  {title}
                </Text>
              )}

              {showRecommendedChip && (
                // <LinearGradient
                //   colors={['#01093aff', '#0f1010ff']}
                //   start={{ x: 0.5, y: 0 }}
                //   end={{ x: 0.5, y: 1 }}
                //   style={styles.recoChip}
                // >
                <View style={styles.recoChip}>
                  <Text style={styles.recoText}>{recommendedText}</Text>
                </View>
                // {/* </LinearGradient> */}
              )}
            </View>

            {showSwitch ? (
              <View
                style={[styles.switchHit, { transform: [{ scale: 0.95 }] }]}
              >
                <Switch
                  value={!!switchValue}
                  onValueChange={onToggleSwitch}
                  trackColor={{ false: switchTrackOff, true: switchTrackOn }}
                  thumbColor={switchThumb}
                  ios_backgroundColor={switchTrackOff}
                />
              </View>
            ) : showEditButton || showDeleteButton ? (
              <View style={styles.actionsRow}>
                {showEditButton && (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={onPressEdit}
                    style={styles.editBtnHit}
                  >
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

                {showDeleteButton && (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={onPressDelete}
                    style={styles.deleteBtnHit}
                  >
                    <View style={styles.deleteInner}>
                      {deleteIcon ? (
                        <Image
                          source={deleteIcon}
                          resizeMode="contain"
                          style={styles.deleteIcon}
                        />
                      ) : null}
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}
          </View>
        )}

        {showCopy && <Text style={[styles.copy, textStyle]}>{text}</Text>}

        {showInput && (
          <View
            style={[
              styles.inputBlock,
              !showCopy && { marginTop: 0 }, // tighter when there is no copy
            ]}
          >
            {!!inputLabel && (
              <Text style={styles.inputLabel}>{inputLabel}</Text>
            )}

            <TextInput
              value={inputValue}
              onChangeText={onChangeInputText}
              placeholder={effectivePlaceholder}
              placeholderTextColor={theme.colors.textMuted}
              multiline
              textAlignVertical="top"
              style={[styles.textArea, inputStyleOverride]}
              {...restInputProps}
            />
          </View>
        )}

        {!!secondaryText && (
          <Text style={styles.secondary}>{secondaryText}</Text>
        )}

        {!!footerActionLabel && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPressFooterAction}
            style={styles.footerRow}
          >
            {footerIcon ? (
              <Image
                source={footerIcon}
                resizeMode="contain"
                style={styles.footerIcon}
              />
            ) : null}
            <Text style={styles.footerText}>{footerActionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const CHIP_H = vs(28);
const BTN = s(30);
const BTN_R = s(10);
