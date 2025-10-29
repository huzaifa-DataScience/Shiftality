// src/components/PrimaryButton.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {useAppTheme} from '../theme/ThemeProvider';

type Props = {
  title: string;
  onPress: (e: GestureResponderEvent) => void;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  /** Optional color overrides */
  backgroundColor?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
};

const PrimaryButton: React.FC<Props> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  fullWidth = true,
  backgroundColor,
  textColor,
  style,
}) => {
  const {colors} = useAppTheme();
  const isDisabled = disabled || loading;

  const bg = backgroundColor ?? colors.primary;
  const fg = textColor ?? colors.onPrimary;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        { backgroundColor: bg, borderColor: colors.border },
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[styles.text, { color: fg }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  fullWidth: { alignSelf: 'stretch' },
  text: { fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.6 },
});

export default PrimaryButton;
