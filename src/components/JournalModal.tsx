// src/components/JournalModal.tsx
import React, { useCallback, useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { ms, s, scale, vs } from 'react-native-size-matters';
import { palette } from '../theme';
import GradientInput from './GradientInput';
import { useJournals } from '../contexts/JournalContext';

type JournalModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function JournalModal({ visible, onClose }: JournalModalProps) {
  const { journalEntries, addJournal, deleteJournal, selectedFilterDate } =
    useJournals();
  console.log('🚀 ~ JournalModal ~ journalEntries:', journalEntries);
  const [isAddingJournal, setIsAddingJournal] = useState(false);

  const [journalTitle, setJournalTitle] = useState('');
  const [journalDesc, setJournalDesc] = useState('');
  const [journalDate, setJournalDate] = useState<Date>(new Date());
  const [journalTime, setJournalTime] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [journalError, setJournalError] = useState<string | null>(null);

  // Prefill date when selectedFilterDate is provided and modal opens
  useEffect(() => {
    if (visible && selectedFilterDate && !isAddingJournal) {
      const filterDateObj = new Date(`${selectedFilterDate}T12:00:00`);
      if (!Number.isNaN(filterDateObj.getTime())) {
        setJournalDate(filterDateObj);
        setJournalTime(filterDateObj);
      }
    }
  }, [visible, selectedFilterDate, isAddingJournal]);

  const formatDate = (d: Date) =>
    d.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const formatTime = (d: Date) =>
    d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleStartAddJournal = () => {
    setJournalError(null);
    setJournalTitle('');
    setJournalDesc('');

    // If selectedFilterDate is provided, use it; otherwise use current date
    if (selectedFilterDate) {
      const filterDateObj = new Date(`${selectedFilterDate}T12:00:00`);
      if (!Number.isNaN(filterDateObj.getTime())) {
        setJournalDate(filterDateObj);
        setJournalTime(filterDateObj);
      } else {
        setJournalDate(new Date());
        setJournalTime(new Date());
      }
    } else {
      setJournalDate(new Date());
      setJournalTime(new Date());
    }

    setIsAddingJournal(true);
  };

  const handleSaveJournal = async () => {
    if (!journalTitle.trim()) {
      setJournalError('Title is required');
      return;
    }
    if (!journalDesc.trim()) {
      setJournalError('Description is required');
      return;
    }

    await addJournal({
      title: journalTitle.trim(),
      description: journalDesc.trim(),
      date: journalDate.toISOString().split('T')[0],
      time: `${journalTime.getHours().toString().padStart(2, '0')}:${journalTime
        .getMinutes()
        .toString()
        .padStart(2, '0')}`,
    });

    setIsAddingJournal(false);
    setJournalError(null);
  };

  const handleDeleteJournal = async (id: string) => {
    await deleteJournal(id);
  };

  const onChangeDate = (e: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) setJournalDate(date);
  };

  const onChangeTime = (e: DateTimePickerEvent, date?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (date) setJournalTime(date);
  };

  const closeModal = useCallback(() => {
    setIsAddingJournal(false);
    setShowDatePicker(false);
    setShowTimePicker(false);
    setJournalError(null);
    onClose();
  }, [onClose]);

  // Filter journals by date if selectedFilterDate is provided
  const visibleJournals = useMemo(() => {
    let filtered = [...journalEntries].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );

    if (selectedFilterDate) {
      filtered = filtered.filter(entry => entry.date === selectedFilterDate);
    }

    return filtered.slice(0, 100);
  }, [journalEntries, selectedFilterDate]);

  // Format filter date for display
  const formatFilterDate = useCallback((isoDate: string) => {
    const d = new Date(`${isoDate}T12:00:00`);
    if (Number.isNaN(d.getTime())) return isoDate;
    return formatDate(d);
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={closeModal}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <View style={styles.modalBackdropContainer}>
          {/* Backdrop */}
          <Pressable style={styles.modalBackdrop} onPress={closeModal} />

          {/* Bottom sheet */}
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {isAddingJournal ? 'Add Journal Entry' : 'Journal'}
            </Text>

            {/* Show filter info if date is filtered */}
            {!isAddingJournal && selectedFilterDate && (
              <View style={{ marginBottom: vs(6) }}>
                <Text style={styles.filterInfo}>
                  Showing entries for {formatFilterDate(selectedFilterDate)}
                </Text>
              </View>
            )}

            {!isAddingJournal && (
              <>
                {visibleJournals.length === 0 ? (
                  <Text style={styles.emptyText}>
                    {selectedFilterDate
                      ? 'No journal entries for this date yet.'
                      : 'No journal entries yet. Start by adding your first one.'}
                  </Text>
                ) : (
                  <ScrollView
                    style={styles.journalList}
                    contentContainerStyle={styles.journalListContent}
                    showsVerticalScrollIndicator
                    keyboardShouldPersistTaps="handled"
                  >
                    {visibleJournals.map(entry => (
                      <View key={entry.id} style={styles.journalItem}>
                        <View style={styles.journalHeaderRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.journalItemTitle}>
                              {entry.title}
                            </Text>
                            <Text style={styles.journalItemMeta}>
                              {entry.date} · {entry.time}
                            </Text>
                          </View>

                          <TouchableOpacity
                            style={styles.deleteBadge}
                            activeOpacity={0.8}
                            onPress={() => handleDeleteJournal(entry.id)}
                          >
                            <Text style={styles.deleteBadgeText}>Delete</Text>
                          </TouchableOpacity>
                        </View>

                        <Text style={styles.journalItemDesc} numberOfLines={3}>
                          {entry.description}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                )}

                <TouchableOpacity
                  style={styles.addJournalBtn}
                  activeOpacity={0.9}
                  onPress={handleStartAddJournal}
                >
                  <Text style={styles.addJournalBtnText}>
                    + Add New Journal
                  </Text>
                </TouchableOpacity>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#2b3950' }]}
                    onPress={closeModal}
                  >
                    <Text style={styles.modalButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {isAddingJournal && (
              <>
                <Text style={styles.modalLabel}>Title</Text>
                <GradientInput
                  value={journalTitle}
                  onChangeText={(t: string) => {
                    setJournalTitle(t);
                    if (journalError) setJournalError(null);
                  }}
                  placeholder="Give your journal a title"
                />

                <Text style={styles.modalLabel}>Description</Text>
                <GradientInput
                  value={journalDesc}
                  onChangeText={(t: string) => {
                    setJournalDesc(t);
                    if (journalError) setJournalError(null);
                  }}
                  placeholder="What happened today? How do you feel?"
                  multiline
                  inputStyle={{ minHeight: vs(80) }}
                />

                <View style={styles.rowBetween}>
                  <View style={{ flex: 1, marginRight: s(6) }}>
                    <Text style={styles.modalLabel}>Date</Text>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => setShowDatePicker(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.pickerButtonText}>
                        {formatDate(journalDate)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flex: 1, marginLeft: s(6) }}>
                    <Text style={styles.modalLabel}>Time</Text>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => setShowTimePicker(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.pickerButtonText}>
                        {formatTime(journalTime)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={journalDate}
                    mode="date"
                    themeVariant="dark"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChangeDate}
                  />
                )}

                {showTimePicker && (
                  <DateTimePicker
                    value={journalTime}
                    mode="time"
                    is24Hour={false}
                    themeVariant="dark"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChangeTime}
                  />
                )}

                {journalError ? (
                  <Text style={styles.errorText}>{journalError}</Text>
                ) : null}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#2b3950' }]}
                    onPress={() => {
                      setIsAddingJournal(false);
                      setJournalError(null);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#00BFFF' }]}
                    onPress={handleSaveJournal}
                  >
                    <Text style={styles.modalButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdropContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalCard: {
    backgroundColor: '#101725',
    paddingHorizontal: s(16),
    paddingTop: vs(14),
    paddingBottom: vs(24),
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
    maxHeight: vs(520),
  },
  modalTitle: {
    color: palette.white,
    fontSize: ms(18),
    fontWeight: '800',
    marginBottom: vs(10),
    fontFamily: 'SourceSansPro-Regular',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: ms(14),
    marginTop: vs(8),
    fontFamily: 'SourceSansPro-Regular',
  },
  filterInfo: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: ms(12),
    fontFamily: 'SourceSansPro-Regular',
  },
  journalList: {
    height: vs(220),
    marginTop: vs(4),
  },
  journalListContent: {
    paddingBottom: vs(8),
  },
  journalItem: {
    backgroundColor: '#141D2C',
    borderRadius: s(14),
    paddingVertical: vs(10),
    paddingHorizontal: s(12),
    marginBottom: vs(10),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  journalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  journalItemTitle: {
    color: palette.white,
    fontSize: ms(15),
    fontWeight: '700',
    fontFamily: 'SourceSansPro-Regular',
  },
  journalItemMeta: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: ms(12),
    marginTop: vs(4),
    fontFamily: 'SourceSansPro-Regular',
  },
  journalItemDesc: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: ms(13),
    marginTop: vs(6),
    lineHeight: ms(18),
    fontFamily: 'SourceSansPro-Regular',
  },
  deleteBadge: {
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    borderRadius: s(12),
    borderWidth: 1,
    borderColor: 'rgba(255,100,100,0.9)',
    alignSelf: 'flex-start',
    marginLeft: s(8),
  },
  deleteBadgeText: {
    color: '#FF6B6B',
    fontSize: ms(11.5),
    fontWeight: '700',
    fontFamily: 'SourceSansPro-Regular',
  },
  addJournalBtn: {
    marginTop: vs(14),
    paddingVertical: vs(10),
    borderRadius: s(20),
    borderWidth: 1,
    borderColor: '#00BFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addJournalBtnText: {
    color: '#00BFFF',
    fontSize: ms(14.5),
    fontWeight: '700',
    fontFamily: 'SourceSansPro-Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: vs(16),
  },
  modalButton: {
    paddingVertical: vs(8),
    paddingHorizontal: s(16),
    borderRadius: s(20),
    marginLeft: s(8),
  },
  modalButtonText: {
    color: palette.white,
    fontSize: ms(14),
    fontWeight: '700',
    fontFamily: 'SourceSansPro-Regular',
  },
  modalLabel: {
    color: palette.white,
    fontSize: ms(14),
    fontWeight: '700',
    marginTop: vs(10),
    marginBottom: vs(4),
    fontFamily: 'SourceSansPro-Regular',
  },
  rowBetween: {
    flexDirection: 'row',
    marginTop: vs(8),
  },
  pickerButton: {
    borderRadius: s(12),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingVertical: vs(10),
    paddingHorizontal: s(10),
  },
  pickerButtonText: {
    color: palette.white,
    fontSize: ms(14),
    fontFamily: 'SourceSansPro-Regular',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: ms(12),
    marginTop: vs(6),
    fontFamily: 'SourceSansPro-Regular',
  },
});
