import React, { useState } from 'react';
import { Modal, Pressable, Platform, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { scale as s, verticalScale as vs } from 'react-native-size-matters';
import GradientInput from './GradientInput';
import { palette } from '../theme';

const calendarPng = require('../assets/calendar.png');

type Props = {
  value: Date;
  onChange: (d: Date) => void;
  minimumDate?: Date;
  minHeight?: number;
  placeholder?: string; // not shown (we always have a date), but kept for parity
};

const GradientDatePicker: React.FC<Props> = ({
  value,
  onChange,
  minimumDate,
  minHeight = vs(48),
}) => {
  const [show, setShow] = useState(false);

  const fmt = (d: Date) =>
    `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(
      2,
      '0',
    )}/${d.getFullYear()}`;

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

  return (
    <>
      <GradientInput
        pressable
        minHeight={minHeight}
        valueText={fmt(value)}
        onPress={() => setShow(true)}
        rightIconSource={calendarPng}
      />

      {show && Platform.OS === 'android' && (
        <DateTimePicker
          value={value}
          mode="date"
          display="calendar"
          onChange={onChangeNative}
          minimumDate={minimumDate}
        />
      )}

      {show && Platform.OS === 'ios' && (
        <Modal transparent animationType="fade" onRequestClose={() => setShow(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShow(false)}>
            <Pressable style={styles.iosSheet}>
              <DateTimePicker
                value={value}
                mode="date"
                display="inline"
                onChange={onChangeNative}
                minimumDate={minimumDate}
                style={{ backgroundColor: palette.white }}
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
    backgroundColor: '#0E1520',
    borderTopLeftRadius: s(18),
    borderTopRightRadius: s(18),
    paddingBottom: vs(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GradientDatePicker;
