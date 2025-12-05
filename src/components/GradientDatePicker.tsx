import React, { useState } from 'react';
import { Modal, Pressable, Platform, StyleSheet } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {
  scale as s,
  scale,
  verticalScale as vs,
} from 'react-native-size-matters';
import GradientInput from './GradientInput';
import { palette } from '../theme';

const calendarPng = require('../assets/calendar.png');

type Props = {
  value: Date;
  onChange: (d: Date) => void;
  minimumDate?: Date;
  minHeight?: number;
  placeholder?: string;
  mode?: 'date' | 'time'; // 👈 NEW
  hideIcon?: boolean; // 👈 NEW - hide the calendar icon
};

const GradientDatePicker: React.FC<Props> = ({
  value,
  onChange,
  minimumDate,
  minHeight = vs(48),
  mode = 'date', // 👈 default is date
  hideIcon = false, // 👈 default is false (show icon)
}) => {
  const [show, setShow] = useState(false);

  const fmt = (d: Date) => {
    if (mode === 'time') {
      let hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      if (hours === 0) hours = 12;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
        2,
        '0',
      )} ${ampm}`;
    }

    // date format mm/dd/yyyy
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(
      d.getDate(),
    ).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const onChangeNative = (e: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      if (e.type === 'set' && selected) onChange(selected);
      setShow(false);
      return;
    }
    if (selected) {
      onChange(selected);
      setShow(false);
    }
  };

  const effectiveMinDate = mode === 'date' ? minimumDate : undefined;

  return (
    <>
      <GradientInput
        pressable
        minHeight={minHeight}
        valueText={fmt(value)}
        onPress={() => setShow(true)}
        rightIconSource={hideIcon ? undefined : calendarPng} // you can swap to a clock icon later if you want
      />

      {show && Platform.OS === 'android' && (
        <DateTimePicker
          value={value}
          mode={mode}
          display={mode === 'time' ? 'spinner' : 'calendar'}
          onChange={onChangeNative}
          minimumDate={effectiveMinDate}
        />
      )}

      {show && Platform.OS === 'ios' && (
        <Modal
          transparent
          animationType="fade"
          onRequestClose={() => setShow(false)}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShow(false)}
          >
            <Pressable style={styles.iosSheet}>
              <DateTimePicker
                value={value}
                mode={mode}
                display={mode === 'time' ? 'spinner' : 'inline'}
                onChange={onChangeNative}
                minimumDate={effectiveMinDate}
                style={{ backgroundColor: palette.white }}
                themeVariant="light"
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  iosSheet: {
    marginTop: 'auto',
    backgroundColor: 'transparent',
    borderTopLeftRadius: s(18),
    borderTopRightRadius: s(18),
    marginBottom: scale(200),
    // paddingBottom: vs(10),
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 20,
  },
});

export default GradientDatePicker;
