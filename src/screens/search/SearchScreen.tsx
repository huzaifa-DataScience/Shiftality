// src/screens/SearchScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Pressable,
} from 'react-native';
import { palette } from '../../theme';
import { ms, s, scale, vs } from 'react-native-size-matters';
import GradientCardHome from '../../components/GradientCardHome';
import GradientHintBox from '../../components/GradientHintBox';
import OutlinePillWithIcon from '../../components/OutlinePillWithIcon';
import StatsOverviewBox, { StatItem } from '../../components/StatsOverviewBox';
import TripleRingGauge from '../../components/TripleRingGauge';
import LikertPill from '../../components/survey/LikertPill';
import ShiftGridChart from '../../components/graph/ShiftGridChart';
import ShiftMapChart from '../../components/graph/ShiftMapChart';
import TodaysShiftView from '../../components/TodaysShiftView';
import GradientInput from '../../components/GradientInput';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { selectHomeOnboarding } from '../../store/reducers/homeOnboardingReducer';
import { useSelector } from 'react-redux';
import {
  getCheckins,
  upsertCheckins,
  buildDenseSeries,
  Checkin,
  DensePoint,
} from '../../lib/dataClient';

const JOURNAL_STORAGE_KEY = 'shift_journal_entries_v1';

type JournalEntry = {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  createdAt: string; // ISO
};

export default function SearchScreen() {
  const navigation = useNavigation();
  const onboarding = useSelector(selectHomeOnboarding);
  const [selected, setSelected] = useState<'map' | 'grid'>('grid');
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [denseSeries, setDenseSeries] = useState<DensePoint[]>([]);

  // ───────── Journal state ─────────
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [journalModalVisible, setJournalModalVisible] = useState(false);
  const [isAddingJournal, setIsAddingJournal] = useState(false);

  const [journalTitle, setJournalTitle] = useState('');
  const [journalDesc, setJournalDesc] = useState('');
  const [journalDate, setJournalDate] = useState<Date>(new Date());
  const [journalTime, setJournalTime] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [journalError, setJournalError] = useState<string | null>(null);

  // 👇 NEW: which date we’re filtering by when opened from map
  const [journalFilterDate, setJournalFilterDate] = useState<string | null>(
    null,
  );

  // ───────── Load checkins + dense series ─────────
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const stored = await getCheckins();
        setCheckins(stored);

        if (onboarding?.journeyStartDate) {
          const series = buildDenseSeries(onboarding.journeyStartDate, stored);
          setDenseSeries(series);
        } else {
          console.warn('No journeyStartDate yet, skipping denseSeries');
          setDenseSeries([]);
        }
      };

      load();
    }, [onboarding?.journeyStartDate]),
  );

  // ───────── Load journals from storage ─────────
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(JOURNAL_STORAGE_KEY);
        if (!raw) return;
        const parsed: JournalEntry[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setJournalEntries(parsed);
        }
      } catch (e) {
        console.log('Error loading journals', e);
      }
    })();
  }, []);

  const saveJournals = async (next: JournalEntry[]) => {
    setJournalEntries(next);
    try {
      await AsyncStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.log('Error saving journals', e);
    }
  };

  const handleCheckinUpdate = async (checkin: Checkin) => {
    await upsertCheckins([checkin]);
    const updated = await getCheckins();
    setCheckins(updated);

    if (onboarding?.journeyStartDate) {
      const series = buildDenseSeries(onboarding.journeyStartDate, updated);
      setDenseSeries(series);
    }
  };

  const { shiftPct, avgScore, statusLabel } = useMemo(() => {
    if (!denseSeries || denseSeries.length === 0) {
      return {
        shiftPct: 0,
        avgScore: 0,
        statusLabel: 'No data yet – lock your first Shift.',
      };
    }

    const windowSize = 30;
    const todayStr = new Date().toISOString().slice(0, 10);

    let endIndex = denseSeries.findIndex(d => d.date === todayStr);

    if (endIndex === -1) {
      let lastBeforeOrEqual = -1;
      denseSeries.forEach((d, idx) => {
        if (d.date <= todayStr) {
          lastBeforeOrEqual = idx;
        }
      });

      if (lastBeforeOrEqual !== -1) {
        endIndex = lastBeforeOrEqual;
      } else {
        endIndex = denseSeries.length - 1;
      }
    }

    const startIndex = Math.max(0, endIndex - windowSize + 1);
    const lastWindow = denseSeries.slice(startIndex, endIndex + 1);

    if (lastWindow.length === 0) {
      return {
        shiftPct: 0,
        avgScore: 0,
        statusLabel: 'No data yet – lock your first Shift.',
      };
    }

    const total = lastWindow.reduce((sum, day) => sum + day.score, 0);
    const avg = total / lastWindow.length;

    let pct = ((avg + 10) / 20) * 100;
    pct = Math.max(0, Math.min(100, pct));

    let status = '';
    if (pct >= 75) {
      status = 'Very likely to shift - momentum is strong';
    } else if (pct >= 50) {
      status = 'Rising - keep going';
    } else if (pct >= 25) {
      status = 'Early momentum - keep showing up';
    } else {
      status = 'Shadow-heavy - start stacking small wins';
    }

    return {
      shiftPct: pct,
      avgScore: avg,
      statusLabel: status,
    };
  }, [denseSeries]);

  const checkinCount = checkins.length;

  const positiveTotal = useMemo(
    () => checkins.reduce((sum, c) => sum + (c.pos_yes || 0), 0),
    [checkins],
  );

  const cleanStreak = useMemo(() => {
    if (!denseSeries || denseSeries.length === 0) return 0;

    const todayStr = new Date().toISOString().slice(0, 10);

    let idx = denseSeries.findIndex(d => d.date === todayStr);
    if (idx === -1) {
      let lastBeforeOrEqual = -1;
      denseSeries.forEach((d, i) => {
        if (d.date <= todayStr) lastBeforeOrEqual = i;
      });
      if (lastBeforeOrEqual === -1) return 0;
      idx = lastBeforeOrEqual;
    }

    let streak = 0;
    for (let i = idx; i >= 0; i--) {
      const d = denseSeries[i];
      if (!d.hasCheckin || d.score < 0) break;
      streak++;
    }
    return streak;
  }, [denseSeries]);

  // ───────── Journal helpers ─────────
  const formatDate = (d: Date) =>
    d.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatIsoDatePretty = (isoDate: string) => {
    const d = new Date(`${isoDate}T12:00:00`);
    if (Number.isNaN(d.getTime())) return isoDate;
    return formatDate(d);
  };

  const onChangeDate = (_: DateTimePickerEvent, date?: Date) => {
    if (!date) {
      setShowDatePicker(false);
      return;
    }
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    setJournalDate(date);
  };

  const onChangeTime = (_: DateTimePickerEvent, date?: Date) => {
    if (!date) {
      setShowTimePicker(false);
      return;
    }
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    setJournalTime(date);
  };

  // Open from stats card → show ALL journals (no filter), list mode
  const openJournalSheet = () => {
    setJournalError(null);
    setJournalTitle('');
    setJournalDesc('');
    setJournalDate(new Date());
    setJournalTime(new Date());
    setIsAddingJournal(false);
    setJournalFilterDate(null); // 👈 clear filter
    setJournalModalVisible(true);
  };

  const closeJournalSheet = () => {
    setJournalModalVisible(false);
    setShowDatePicker(false);
    setShowTimePicker(false);
    setIsAddingJournal(false);
    setJournalFilterDate(null); // reset on close
  };

  const handleStartAddJournal = () => {
    setJournalError(null);
    setJournalTitle('');
    setJournalDesc('');

    // If we came from a specific date, prefill that
    if (journalFilterDate) {
      const d = new Date(`${journalFilterDate}T12:00:00`);
      setJournalDate(d);
      setJournalTime(d);
    } else {
      const now = new Date();
      setJournalDate(now);
      setJournalTime(now);
    }

    setIsAddingJournal(true);
  };

  const handleSaveJournal = async () => {
    const title = journalTitle.trim();
    const desc = journalDesc.trim();

    if (!title || !desc) {
      setJournalError('Title and description are required.');
      return;
    }

    const dateStr = journalDate.toISOString().slice(0, 10); // YYYY-MM-DD
    const timeStr = journalTime.toTimeString().slice(0, 5); // HH:mm

    const entry: JournalEntry = {
      id: `journal_${Date.now()}`,
      title,
      description: desc,
      date: dateStr,
      time: timeStr,
      createdAt: new Date().toISOString(),
    };

    const next = [...journalEntries, entry];
    await saveJournals(next);

    // after save, go back to list view (keep modal open)
    setIsAddingJournal(false);
    setJournalTitle('');
    setJournalDesc('');
  };

  const statsData: StatItem[] = [
    {
      icon: require('../../assets/checkin.png'),
      value: checkinCount,
      label: 'Check-in',
    },
    {
      icon: require('../../assets/positive.png'),
      value: positiveTotal,
      label: 'Positive',
    },
    {
      icon: require('../../assets/clean.png'),
      value: cleanStreak,
      label: 'Clean',
    },
    {
      icon: require('../../assets/journal.png'),
      value: journalEntries.length,
      label: 'Journal',
    },
  ];

  // sort journals latest-first, then apply optional date filter
  const visibleJournals = useMemo(() => {
    const base = [...journalEntries].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );

    if (!journalFilterDate) return base;
    return base.filter(entry => entry.date === journalFilterDate);
  }, [journalEntries, journalFilterDate]);

  const handleDeleteJournal = async (id: string) => {
    const next = journalEntries.filter(entry => entry.id !== id);
    await saveJournals(next);
  };

  // ───────── Map point → open journal modal in list mode, filtered by date ─────────
  const handleMapPointPress = (isoDate: string) => {
    // isoDate like "2025-12-29" from denseSeries
    setJournalError(null);
    setJournalTitle('');
    setJournalDesc('');
    setIsAddingJournal(false); // 👈 list mode, not add mode
    setJournalFilterDate(isoDate); // 👈 filter by this date
    setJournalModalVisible(true);
  };

  return (
    <View style={styles.root}>
      <View style={styles.titleWrapper}>
        <Text style={styles.title}>Your Reality Shift Dashboard</Text>
      </View>
      <ScrollView
        style={{ backgroundColor: palette.darkBlue, marginVertical: scale(30) }}
        showsVerticalScrollIndicator={false}
      >
        <GradientCardHome style={{ width: scale(330) }}>
          <View
            style={{
              flexDirection: 'row',
              gap: s(12),
              marginBottom: s(25),
              justifyContent: 'flex-end',
            }}
          >
            <OutlinePillWithIcon
              width={s(100)}
              label="Demo"
              icon={require('../../assets/play.png')}
              onPress={() => navigation.navigate('DemoScreen')}
            />
            <OutlinePillWithIcon
              width={s(100)}
              label="Setting"
              icon={require('../../assets/gear.png')}
              onPress={() => navigation.navigate('setting')}
            />
          </View>
          <Text style={styles.title}>Hey Huzaifa, ready to shift?</Text>
          <Text style={styles.subTitle}>
            Your daily reality shift journey continues
          </Text>
          <View style={{ height: scale(10) }} />
          <TodaysShiftView onCheckinUpdate={handleCheckinUpdate} />
        </GradientCardHome>

        <View style={{ height: scale(20) }} />

        <GradientHintBox
          title="Highest Vibration (North Star)"
          text={onboarding?.northStar}
          style={{ width: scale(330) }}
        />
        <View style={{ height: scale(20) }} />
        <GradientHintBox
          title="Shadow Path"
          text={onboarding?.shadowPath}
          style={{ width: scale(330) }}
        />
        <View style={{ height: scale(20) }} />

        <StatsOverviewBox
          data={statsData}
          style={{ width: scale(330) }}
          onItemPress={item => {
            if (item.label === 'Journal') {
              openJournalSheet();
            }
          }}
        />

        <View style={{ height: scale(20) }} />

        <GradientCardHome>
          <Text style={styles.title}>Shift Likelihood</Text>
          <Text style={styles.subTitle}>
            Based on your last 30 days. Avg score {avgScore.toFixed(1)}
          </Text>
          <View style={styles.gaugeContainer}>
            <TripleRingGauge
              valuePct={shiftPct}
              idBase="shiftGauge"
              size={s(110)}
            />
          </View>
          <Text style={styles.bottomText}>{statusLabel}</Text>
        </GradientCardHome>

        <View style={{ height: scale(20) }} />

        {/* Toggle Buttons */}
        <GradientCardHome>
          <View style={styles.toggleRow}>
            <LikertPill
              label="Shift Map"
              width={s(120)}
              borderRadius={s(12)}
              selected={selected === 'map'}
              onPress={() => setSelected('map')}
            />
            <LikertPill
              label="Shift Grid"
              width={s(120)}
              borderRadius={s(12)}
              selected={selected === 'grid'}
              onPress={() => setSelected('grid')}
            />
          </View>
        </GradientCardHome>

        {/* Graph Display */}
        <View style={styles.chartWrapper}>
          {selected === 'map' ? (
            <ShiftMapChart
              denseSeries={denseSeries}
              onPointPress={handleMapPointPress}
            />
          ) : (
            <ShiftGridChart denseSeries={denseSeries} />
          )}
        </View>
      </ScrollView>

      {/* ───────── Journal Bottom Sheet ───────── */}
      <Modal
        visible={journalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeJournalSheet}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
          <View style={styles.modalBackdropContainer}>
            {/* Backdrop: tap to close */}
            <Pressable
              style={styles.modalBackdrop}
              onPress={closeJournalSheet}
            />

            {/* Bottom sheet card */}
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {isAddingJournal ? 'Add Journal Entry' : 'Journal'}
              </Text>

              {/* If filtered by date, show a small helper text */}
              {!isAddingJournal && journalFilterDate && (
                <View style={{ marginBottom: vs(6) }}>
                  <Text style={styles.filterInfo}>
                    Showing entries for {formatIsoDatePretty(journalFilterDate)}
                  </Text>
                </View>
              )}

              {!isAddingJournal && (
                <>
                  {/* List of journals */}
                  {visibleJournals.length === 0 ? (
                    <Text style={styles.emptyText}>
                      {journalFilterDate
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

                          <Text
                            style={styles.journalItemDesc}
                            numberOfLines={3}
                          >
                            {entry.description}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                  )}

                  {/* Add new journal button */}
                  <TouchableOpacity
                    style={styles.addJournalBtn}
                    activeOpacity={0.9}
                    onPress={handleStartAddJournal}
                  >
                    <Text style={styles.addJournalBtnText}>
                      + Add New Journal
                    </Text>
                  </TouchableOpacity>

                  {/* Close button row */}
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[
                        styles.modalButton,
                        { backgroundColor: '#2b3950' },
                      ]}
                      onPress={closeJournalSheet}
                    >
                      <Text style={styles.modalButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {isAddingJournal && (
                <>
                  {/* Title */}
                  <Text style={styles.modalLabel}>Title</Text>
                  <GradientInput
                    value={journalTitle}
                    onChangeText={t => {
                      setJournalTitle(t);
                      if (journalError) setJournalError(null);
                    }}
                    placeholder="Give your journal a title"
                  />

                  {/* Description */}
                  <Text style={styles.modalLabel}>Description</Text>
                  <GradientInput
                    value={journalDesc}
                    onChangeText={t => {
                      setJournalDesc(t);
                      if (journalError) setJournalError(null);
                    }}
                    placeholder="What happened today? How do you feel?"
                    multiline
                    inputStyle={{ minHeight: vs(80) }}
                  />

                  {/* Date & Time */}
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

                  {/* Buttons */}
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[
                        styles.modalButton,
                        { backgroundColor: '#2b3950' },
                      ]}
                      onPress={() => {
                        setIsAddingJournal(false);
                        setJournalError(null);
                      }}
                    >
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.modalButton,
                        { backgroundColor: '#00BFFF' },
                      ]}
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: palette.darkBlue,
  },
  titleWrapper: {
    marginTop: scale(50),
  },
  title: {
    fontSize: scale(22),
    color: palette.white,
    fontWeight: '700',
    fontFamily: 'SourceSansPro-Regular',
  },
  subTitle: {
    fontSize: scale(16),
    color: palette.white,
    fontWeight: '400',
    lineHeight: scale(30),
    fontFamily: 'SourceSansPro-Regular',
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: vs(4),
  },
  bottomText: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: ms(13.5),
    marginTop: vs(12),
    fontFamily: 'SourceSansPro-Regular',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: s(12),
  },
  chartWrapper: {
    marginTop: vs(10),
    width: s(330),
    alignSelf: 'center',
  },
  // modal / bottom sheet
  // modalBackdrop: {
  //   flex: 1,
  //   backgroundColor: 'rgba(0,0,0,0.55)',
  //   justifyContent: 'flex-end',
  // },
  // modalCard: {
  //   backgroundColor: '#101725',
  //   paddingHorizontal: s(16),
  //   paddingTop: vs(14),
  //   paddingBottom: vs(24),
  //   borderTopLeftRadius: s(20),
  //   borderTopRightRadius: s(20),
  //   maxHeight: vs(520),
  // },
  modalTitle: {
    color: palette.white,
    fontSize: ms(18),
    fontWeight: '800',
    marginBottom: vs(10),
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
  filterInfo: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: ms(12),
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
  emptyText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: ms(14),
    marginTop: vs(8),
    fontFamily: 'SourceSansPro-Regular',
  },
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

  journalList: {
    height: vs(220), // fixed viewport inside sheet
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
  journalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
});
