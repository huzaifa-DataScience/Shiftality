import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  Pressable,
  ViewStyle,
} from 'react-native';
import {useAppTheme} from '../theme/ThemeProvider';
import {palette, rgba} from '../theme/colors';

type Props = {
  label?: string;
  containerStyle?: ViewStyle;
  error?: string;
  secureToggle?: boolean; // show a Show/Hide toggle on the right
} & TextInputProps;

export default function TextField({
  label,
  containerStyle,
  error,
  secureTextEntry,
  secureToggle = false,
  ...rest
}: Props) {
  const {colors} = useAppTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);

  return (
    <View style={containerStyle}>
      {label ? (
        <Text style={[styles.label, {color: colors.text}]}>{label}</Text>
      ) : null}

      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: rgba(palette.lightBlue, 0.06), // light bluish fill
            borderColor: focused ? palette.lightBlue : colors.border,
          },
        ]}>
        <TextInput
          {...rest}
          secureTextEntry={hidden}
          placeholderTextColor={rgba(colors.text, 0.45)}
          style={[styles.input, {color: colors.text}]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {secureToggle ? (
          <Pressable onPress={() => setHidden(v => !v)} hitSlop={10}>
            <Text style={{color: rgba(colors.text, 0.6)}}>
              {hidden ? 'Show' : 'Hide'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  error: {
    marginTop: 6,
    color: '#D12F2F',
    fontSize: 12,
  },
});
