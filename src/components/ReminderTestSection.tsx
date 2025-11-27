// src/components/ReminderTestSection.tsx
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { ms, s, scale, vs } from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import { palette } from '../theme';
import GradientCardHome from './GradientCardHome';
import GradientHintBox from './GradientHintBox';
import PrimaryButton from './PrimaryButton';
import ReminderPills from './ReminderPills';
import AppImage from './AppImage';

import { REMINDER_STORAGE_KEY } from '../lib/reminderStore';
import {
  requestReminderPermission,
  scheduleDemoSequence,
  scheduleReminderNotification,
} from '../lib/localNotifications';
import GradientInput from './GradientInput';

type StoredReminder = {
  id: string;
  pillIndex: number;
  title: string;
  description: string;
  time: string; // ISO
  enabled: boolean;
};

// keep only time component (fixes iOS timepicker issue)
function makeTimeOnly(base: Date): Date {
  return new Date(2000, 0, 1, base.getHours(), base.getMinutes(), 0, 0);
}

type ReminderTestSectionProps = {
  cardStyle?: StyleProp<ViewStyle>;
  title?: string;
  subtitle?: string;
  noteTitle?: string;
  noteText?: string;
};

const ReminderTestSection: React.FC<ReminderTestSectionProps> = ({
  cardStyle,
  title = 'Test Reminders',
  subtitle = 'Test the missed check-in reminder system and notifications',
  noteTitle = 'Note:',
  noteText = `Make sure to allow notifications when
prompted by your device. Demo reminders
will show "(Demo)" in the title to distinguish
them from real reminders.`,
}) => {
  const notificationOutline = require('../assets/notificationOutlineRed.png');

  // reminders & selection
  const [reminders, setReminders] = useState<StoredReminder[]>([]);
  const [selectedPillIndex, setSelectedPillIndex] = useState<number | null>(0);

  // modal state
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDesc, setReminderDesc] = useState('');
  const [reminderTime, setReminderTime] = useState<Date>(() =>
    makeTimeOnly(new Date()),
  );
  const [showTimePicker, setShowTimePicker] = useState(false);

  // validation errors
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descError, setDescError] = useState<string | null>(null);

  // ───────────────── LOAD REMINDERS ONCE ─────────────────
  useEffect(() => {
    AsyncStorage.getItem(REMINDER_STORAGE_KEY).then(raw => {
      if (!raw) return;
      try {
        const list: StoredReminder[] = JSON.parse(raw);
        if (Array.isArray(list)) {
          setReminders(list);
          const firstEnabled = list.find(r => r.enabled);
          if (firstEnabled) {
            setSelectedPillIndex(firstEnabled.pillIndex);
          }
        }
      } catch (e) {
        console.log('ReminderTestSection: error parsing reminders', e);
      }
    });
  }, []);

  // ───────────────── HELPERS ─────────────────
  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const findReminderByIndex = (pillIndex: number) =>
    reminders.find(r => r.pillIndex === pillIndex);

  const saveRemindersToStorage = async (next: StoredReminder[]) => {
    setReminders(next);
    await AsyncStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(next));
  };

  const openReminderEditor = (pillIndex: number) => {
    setEditingIndex(pillIndex);
    setSelectedPillIndex(pillIndex);
    setTitleError(null);
    setDescError(null);

    const existing = findReminderByIndex(pillIndex);
    if (existing) {
      setReminderTitle(existing.title);
      setReminderDesc(existing.description);
      setReminderTime(makeTimeOnly(new Date(existing.time)));
    } else {
      setReminderTitle(`Reminder ${pillIndex + 1}`);
      setReminderDesc('');
      setReminderTime(makeTimeOnly(new Date()));
    }

    setReminderModalVisible(true);
  };

  const onTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set' && date) {
        setReminderTime(makeTimeOnly(date));
      }
      setShowTimePicker(false);
    } else {
      if (date) {
        setReminderTime(makeTimeOnly(date));
      }
    }
  };

  const computeNextFireAt = (time: Date) => {
    const now = new Date();
    const fire = new Date(now);
    fire.setHours(time.getHours(), time.getMinutes(), 0, 0);
    if (fire <= now) {
      fire.setDate(fire.getDate() + 1);
    }
    return fire;
  };

  const onSaveReminder = async () => {
    if (editingIndex === null) {
      setReminderModalVisible(false);
      setShowTimePicker(false);
      return;
    }

    const pillIndex = editingIndex;
    const trimmedTitle = reminderTitle.trim();
    const trimmedDesc = reminderDesc.trim();

    let hasError = false;
    if (!trimmedTitle) {
      setTitleError('Title is required');
      hasError = true;
    }
    if (!trimmedDesc) {
      setDescError('Description is required');
      hasError = true;
    }
    if (hasError) return;

    const newItem: StoredReminder = {
      id: `reminder_${pillIndex}`,
      pillIndex,
      title: trimmedTitle,
      description: trimmedDesc,
      time: reminderTime.toISOString(),
      enabled: true,
    };

    const others = reminders.filter(r => r.pillIndex !== pillIndex);
    const next = [...others, newItem];

    try {
      await saveRemindersToStorage(next);

      await requestReminderPermission();
      const fireAt = computeNextFireAt(reminderTime);
      await scheduleReminderNotification({
        fireAt,
        pillIndex,
        label: trimmedTitle,
        isDemo: false,
      });
    } catch (e) {
      console.log('ReminderTestSection: error saving/scheduling', e);
    } finally {
      setReminderModalVisible(false);
      setShowTimePicker(false);
    }
  };

  const onDeleteReminder = () => {
    if (editingIndex === null) return;

    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const next = reminders.filter(r => r.pillIndex !== editingIndex);

            try {
              await saveRemindersToStorage(next);
            } catch (e) {
              console.log('ReminderTestSection: error deleting reminder', e);
            }

            if (selectedPillIndex === editingIndex) {
              setSelectedPillIndex(null);
            }

            setReminderModalVisible(false);
            setShowTimePicker(false);
          },
        },
      ],
    );
  };

  // ───────────────── RENDER ─────────────────
  return (
    <>
      <GradientCardHome style={[{ width: scale(330) }, cardStyle]}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subTitle}>{subtitle}</Text>
        <View style={{ height: scale(10) }} />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={[styles.title, { marginBottom: scale(0) }]}>
            Disabled
          </Text>
          <AppImage
            source={notificationOutline}
            style={styles.outilineNotification}
            resizeMode="contain"
          />
        </View>
        <View style={{ height: scale(15) }} />
        <GradientHintBox text="Enable notifications to test the reminder system properly." />

        {/* Test Notification Permission */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={async () => {
            try {
              await requestReminderPermission();
              await scheduleReminderNotification({
                fireAt: new Date(Date.now() + 2000),
                pillIndex: selectedPillIndex ?? 0,
                label: 'This is a test notification permission check (Demo)',
                isDemo: true,
              });
              console.log(
                'ReminderTestSection: permission requested + test scheduled',
              );
            } catch (e) {
              console.log('ReminderTestSection: error testing permission', e);
            }
          }}
          style={{ marginTop: vs(10) }}
        >
          <LinearGradient
            colors={['#143f65ff', '#1C2A3A']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.cta, { opacity: 0.95 }]}
          >
            <Text style={[styles.ctaText, { color: palette.txtBlue }]}>
              Test Notification Permission
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: scale(15) }} />

        {/* Pills */}
        <ReminderPills
          activeIndices={reminders.map(r => r.pillIndex)}
          onPressPill={index => openReminderEditor(index)}
        />

        <View style={{ height: scale(20) }} />

        {/* Full demo sequence */}
        <PrimaryButton
          textColor={palette.white}
          style={{
            width: '100%',
            height: 'auto',
            alignSelf: 'center',
            textAlign: 'center',
            color: palette.white,
            fontSize: ms(14.5),
            fontFamily: 'SourceSansPro-Regular',
            fontWeight: '700',
            opacity: 0.9,
          }}
          title="Test Full Sequence (5s intervals)"
          onPress={async () => {
            try {
              await requestReminderPermission();
              await scheduleDemoSequence(selectedPillIndex);
              console.log('ReminderTestSection: demo sequence scheduled');
            } catch (e) {
              console.log(
                'ReminderTestSection: error starting demo sequence',
                e,
              );
            }
          }}
        />

        <View style={{ height: scale(20) }} />

        <GradientHintBox title={noteTitle} text={noteText} />
      </GradientCardHome>

      {/* Modal */}
      <Modal
        visible={reminderModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setReminderModalVisible(false);
          setShowTimePicker(false);
        }}
      >
        {/* CLICK OUTSIDE TO CLOSE */}
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalBackdrop}
          onPress={() => {
            setReminderModalVisible(false);
            setShowTimePicker(false);
          }}
        >
          {/* Prevent tap-through so modal does not close when user taps card */}
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalCard}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingIndex !== null
                  ? `Set Reminder ${editingIndex + 1}`
                  : 'Set Reminder'}
              </Text>

              {editingIndex !== null && findReminderByIndex(editingIndex) ? (
                <TouchableOpacity onPress={onDeleteReminder}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Title */}
            <Text style={styles.label}>Title</Text>
            <GradientInput
              value={reminderTitle}
              onChangeText={text => {
                setReminderTitle(text);
                if (titleError) setTitleError(null);
              }}
              placeholder="Reminder title"
            />
            {titleError ? (
              <Text style={styles.errorText}>{titleError}</Text>
            ) : null}

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <GradientInput
              value={reminderDesc}
              onChangeText={text => {
                setReminderDesc(text);
                if (descError) setDescError(null);
              }}
              placeholder="What should we remind you about?"
              multiline
            />
            {descError ? (
              <Text style={styles.errorText}>{descError}</Text>
            ) : null}

            {/* Time */}
            <Text style={styles.label}>Time (every day)</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowTimePicker(true)}
              style={styles.timePickerButton}
            >
              <Text style={styles.timePickerText}>
                {formatTime(reminderTime)}
              </Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={reminderTime}
                mode="time"
                themeVariant="dark"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onTimeChange}
              />
            )}

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#2b3950' }]}
                onPress={() => {
                  setReminderModalVisible(false);
                  setShowTimePicker(false);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#00BFFF' }]}
                onPress={onSaveReminder}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default ReminderTestSection;

const styles = StyleSheet.create({
  title: {
    fontSize: scale(18),
    fontWeight: '800',
    color: palette.white,
    marginBottom: scale(10),
    fontFamily: 'SourceSansPro-Regular',
  },
  subTitle: {
    fontSize: scale(16),
    fontWeight: '500',
    color: palette.white,
    lineHeight: scale(20),
    fontFamily: 'SourceSansPro-Regular',
  },
  cta: {
    height: vs(39),
    width: '100%',
    borderRadius: s(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#0E2440',
    fontSize: ms(15),
    fontWeight: '800',
    fontFamily: 'SourceSansPro-Regular',
  },
  outilineNotification: {
    width: s(30),
    height: s(30),
    marginRight: s(10),
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: scale(320),
    borderRadius: s(18),
    paddingVertical: vs(16),
    paddingHorizontal: s(16),
    backgroundColor: '#101725',
  },
  modalTitle: {
    color: palette.white,
    fontSize: ms(16),
    fontWeight: '800',
    marginBottom: vs(12),
    fontFamily: 'SourceSansPro-Regular',
  },
  label: {
    color: palette.white,
    fontWeight: '800',
    fontSize: ms(14),
    marginBottom: vs(8),
    marginTop: vs(6),
    fontFamily: 'SourceSansPro-Regular',
  },
  timePickerButton: {
    borderRadius: s(12),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingVertical: vs(10),
    paddingHorizontal: s(12),
    marginTop: vs(4),
  },
  timePickerText: {
    color: palette.white,
    fontSize: ms(14),
    fontFamily: 'SourceSansPro-Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: vs(18),
  },
  modalButton: {
    paddingVertical: vs(8),
    paddingHorizontal: s(16),
    borderRadius: s(20),
    marginLeft: s(10),
  },
  modalButtonText: {
    color: palette.white,
    fontSize: ms(14),
    fontWeight: '700',
    fontFamily: 'SourceSansPro-Regular',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: ms(12),
    marginTop: vs(2),
    fontFamily: 'SourceSansPro-Regular',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  deleteText: {
    color: '#FF6B6B',
    fontSize: ms(13),
    fontWeight: '700',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
});
