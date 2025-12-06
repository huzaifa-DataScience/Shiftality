import React, { useMemo, useState } from 'react';
import { useAppTheme } from '../theme/ThemeProvider';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import GradientInput from './GradientInput';
import { useAppTheme } from '../theme/ThemeProvider';

// PNG icon (adjust path if yours differs)
const caretPng = require('../assets/caret-down.png');

type Props = {
  value?: string;
  placeholder?: string;
  onChange: (tz: string) => void;
  minHeight?: number;
};

const GradientTimezoneSelect: React.FC<Props> = ({
  value,
  placeholder = 'Select Time Zone',
  onChange,
  minHeight = vs(48),
}) => {
  const { theme } = useAppTheme();
  const { theme } = useAppTheme();
  const [open, setOpen] = useState(false);

  const timezones = useMemo(() => {
    // @ts-ignore optional API on some RN targets
    if (global.Intl?.supportedValuesOf) {
      try {
        // @ts-ignore
        return Intl.supportedValuesOf('timeZone') as string[];
      } catch {}
    }
    return [
      'UTC',
      'Europe/London',
      'Europe/Paris',
      'Africa/Cairo',
      'Asia/Karachi',
      'Asia/Dubai',
      'Asia/Kolkata',
      'Asia/Singapore',
      'Asia/Tokyo',
      'Australia/Sydney',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
    ];
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        modalBackdrop: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          justifyContent: 'flex-end',
        },
        modalSheet: {
          maxHeight: '60%',
          backgroundColor: theme.colors.card,
          paddingBottom: vs(12),
          borderTopLeftRadius: s(18),
          borderTopRightRadius: s(18),
        },
        sheetTitle: {
          color: theme.colors.text,
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
          color: theme.colors.text,
          fontSize: ms(14),
          fontFamily: 'SourceSansPro-Regular',
        },
      }),
    [theme],
  );

  return (
    <>
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
          <View style={styles.modalSheet}>
            <Text style={styles.sheetTitle}>Select Time Zone</Text>
            <FlatList
              data={timezones}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.optionRow,
                    pressed && { backgroundColor: 'rgba(255,255,255,0.06)' },
                  ]}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default GradientTimezoneSelect;
