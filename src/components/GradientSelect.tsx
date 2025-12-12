import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
  ViewStyle,
} from 'react-native';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import GradientInput from './GradientInput';
import { useAppTheme, useThemeMode } from '../theme/ThemeProvider';

const caretPng = require('../assets/caret-down.png');

type Props = {
  value?: string;
  placeholder?: string;
  options: string[];
  onChange: (val: string) => void;
  sheetTitle?: string;
  minHeight?: number;
  containerStyle?: ViewStyle;
};

const GradientSelect: React.FC<Props> = ({
  value,
  placeholder = 'Select',
  options,
  onChange,
  sheetTitle = 'Select an option',
  minHeight = vs(48),
  containerStyle,
}) => {
  const theme = useAppTheme();
  const { themeMode } = useThemeMode();
  const isDark = themeMode === 'dark';
  const [open, setOpen] = useState(false);

  return (
    <View style={containerStyle}>
      <GradientInput
        pressable
        minHeight={minHeight}
        valueText={value || placeholder}
        onPress={() => setOpen(true)}
        rightIconSource={caretPng}
        placeholderText={placeholder}
      />

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>
              {sheetTitle}
            </Text>

            <FlatList
              data={options}
              keyExtractor={item => item}
              ItemSeparatorComponent={() => (
                <View
                  style={[styles.sep, { backgroundColor: theme.colors.border }]}
                />
              )}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.optionRow,
                    pressed && {
                      backgroundColor: isDark
                        ? 'rgba(255,255,255,0.06)'
                        : 'rgba(0,0,0,0.05)',
                    },
                  ]}
                >
                  <Text
                    style={[styles.optionText, { color: theme.colors.text }]}
                  >
                    {item}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    maxHeight: '60%',
    paddingBottom: vs(12),
    borderTopLeftRadius: s(18),
    borderTopRightRadius: s(18),
  },
  sheetTitle: {
    fontSize: ms(16),
    fontWeight: '700',
    paddingHorizontal: s(16),
    paddingVertical: vs(12),
    fontFamily: 'SourceSansPro-Regular',
  },
  optionRow: {
    paddingVertical: vs(12),
    paddingHorizontal: s(16),
  },
  optionText: {
    fontSize: ms(14),
    fontFamily: 'SourceSansPro-Regular',
  },
  sep: {
    height: StyleSheet.hairlineWidth,
    marginLeft: s(16),
  },
});

export default GradientSelect;
