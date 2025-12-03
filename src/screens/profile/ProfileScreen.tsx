// src/screens/ProfileScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
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
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { ms, s, scale, vs } from 'react-native-size-matters';

import { palette } from '../../theme';
import GradientCardHome from '../../components/GradientCardHome';
import GradientHintBox from '../../components/GradientHintBox';
import TripleRingGauge from '../../components/TripleRingGauge';
import PrimaryButton from '../../components/PrimaryButton';
import {
  selectSectionPoints,
  selectTotalSurveyPoints,
} from '../../store/reducers/surveyReducer';
import { selectHomeOnboarding } from '../../store/reducers/homeOnboardingReducer';
import BeliefsEditor from '../../components/BeliefsEditor';
import GradientInput from '../../components/GradientInput';

const JOURNAL_STORAGE_KEY = 'shift_journal_entries_v1';

type JournalEntry = {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  createdAt: string; // ISO
};

export default function ProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();

  const total = useSelector(selectTotalSurveyPoints);
  const finance = useSelector(selectSectionPoints('Finance'));
  const health = useSelector(selectSectionPoints('Health & Energy'));
  const focus = useSelector(selectSectionPoints('Focus & Growth'));
  const relationships = useSelector(
    selectSectionPoints('Relationships & Belonging'),
  );
  const identity = useSelector(selectSectionPoints('Identity & Self-worth'));
  const calm = useSelector(selectSectionPoints('Calm & Resilience'));

  const onboarding = useSelector(selectHomeOnboarding);
  console.log('homeOnboarding state =>', onboarding);

  const northStarText =
    onboarding.northStar ||
    'Paint the picture of where you will be in one year—your highest potential reality…';

  const shadowPathText =
    onboarding.shadowPath ||
    "Describe the patterns, habits, or reality you're leaving behind—what your life looks like in one year if nothing shifts…";

  const displayName = onboarding.firstName?.trim() || 'Your';

  // ------- JOURNAL STATE -------
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

  // load journals once
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
        console.log('ProfileScreen: error loading journals', e);
      }
    })();
  }, []);

  const saveJournals = async (next: JournalEntry[]) => {
    setJournalEntries(next);
    try {
      await AsyncStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.log('ProfileScreen: error saving journals', e);
    }
  };

  // ------- JOURNAL HELPERS -------
  const formatDate = (d: Date) =>
    d.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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

  const openJournalSheet = useCallback(() => {
    setJournalError(null);
    setJournalTitle('');
    setJournalDesc('');
    setIsAddingJournal(false);
    setShowDatePicker(false);
    setShowTimePicker(false);
    setJournalModalVisible(true);
  }, []);

  const closeJournalSheet = useCallback(() => {
    setJournalModalVisible(false);
    setIsAddingJournal(false);
    setShowDatePicker(false);
    setShowTimePicker(false);
    setJournalError(null);
  }, []);

  // When Profile gets focus with openJournalToken param → open journal sheet
  useFocusEffect(
    useCallback(() => {
      if (route.params?.openJournalToken) {
        openJournalSheet();
      }
    }, [route.params?.openJournalToken, openJournalSheet]),
  );

  const handleStartAddJournal = () => {
    setJournalError(null);
    setJournalTitle('');
    setJournalDesc('');
    const now = new Date();
    setJournalDate(now);
    setJournalTime(now);
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

    // go back to list view
    setIsAddingJournal(false);
    setJournalTitle('');
    setJournalDesc('');
  };

  const handleDeleteJournal = async (id: string) => {
    const next = journalEntries.filter(entry => entry.id !== id);
    await saveJournals(next);
  };

  const visibleJournals = [...journalEntries].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  // ------- HELPERS / COMPUTATIONS -------
  const computePct = (pointsArr: number[]) => {
    console.log('pointsArr', pointsArr);
    if (!pointsArr || pointsArr.length === 0) return 0;

    const domainScore =
      pointsArr.reduce((sum, v) => sum + v, 0) / pointsArr.length;

    const percentage = Math.max(
      0,
      Math.min(100, ((domainScore + 2) / 4) * 100),
    );

    return Math.round(percentage);
  };

  const STRENGTHS = [
    { label: 'Finance', pct: computePct(finance) },
    { label: 'Health & Energy', pct: computePct(health) },
    { label: 'Focus & Growth', pct: computePct(focus) },
    { label: 'Relationship\n& Belonging', pct: computePct(relationships) },
    { label: 'Identity &\nSelf-Worth', pct: computePct(identity) },
    { label: 'Calm &\nResilience', pct: computePct(calm) },
  ];

  const sortedDomains = [...STRENGTHS]
    .filter(d => d.pct > 0)
    .sort((a, b) => b.pct - a.pct);

  let shiftPatternText =
    "As you complete more scans, we'll surface patterns about which domains drive your momentum and which ones pull you off track.";

  let bestLeverText =
    'Pick one tiny daily action in Health & Energy you\ncan complete in under two minutes.';

  if (sortedDomains.length >= 2) {
    const topA = sortedDomains[0].label;
    const topB = sortedDomains[1].label;
    const watch = sortedDomains[2]?.label;

    shiftPatternText =
      `You're strongest in ${topA} and ${topB}—you build momentum ` +
      `when you show up consistently.` +
      (watch ? ` Watch for ${watch} stories that pull you off track.` : '') +
      ` A small daily action in ${topA} is your quickest lever.`;

    bestLeverText = `Pick one tiny daily action in ${topA} you\ncan complete in under two minutes.`;
  }

  // ------- RENDER -------
  return (
    <>
      <ScrollView style={{ backgroundColor: palette.darkBlue }}>
        <View style={styles.root}>
          {/* Profile intro card */}
          <GradientCardHome
            style={{
              marginVertical: vs(20),
              marginTop: scale(50),
              width: scale(330),
            }}
          >
            <View style={{ marginBottom: s(10) }}>
              <Text style={styles.firstSectitle}>
                {`${displayName}'s Shiftality Profile`}
              </Text>
              <Text style={styles.subSectitle}>
                {
                  "Based on your scan results, here's your\npersonalized reality shift blueprint"
                }
              </Text>
            </View>

            <GradientHintBox
              title="Your 1-Year North Star"
              text={northStarText}
            />
            <View style={{ height: scale(20) }} />
            <GradientHintBox
              title="Your 1-Year Shadow Star"
              text={shadowPathText}
            />
          </GradientCardHome>

          {/* Domain strengths */}
          <GradientCardHome style={{ width: scale(330) }}>
            <View style={{ marginBottom: s(10) }}>
              <Text style={styles.Sectitle}>{'Domain Strengths'}</Text>
              <Text style={styles.subSectitle}>
                {
                  'Your ability to create positive shifts in\nthese specific areas'
                }
              </Text>

              <View style={{ rowGap: vs(22) }}>
                {[0, 1].map(row => (
                  <View
                    key={row}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    {STRENGTHS.slice(row * 3, row * 3 + 3).map((it, idx) => {
                      const idBase = `ds-${row}-${idx}`;

                      return (
                        <View
                          key={idBase}
                          style={{ width: s(100), alignItems: 'center' }}
                        >
                          <TripleRingGauge
                            idBase={idBase}
                            valuePct={it.pct}
                            size={s(90)}
                          />
                          <Text
                            style={{
                              color: palette.white,
                              textAlign: 'center',
                              marginTop: vs(8),
                              opacity: 0.92,
                            }}
                          >
                            {it.label}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          </GradientCardHome>

          {/* Shift insights */}
          <GradientCardHome
            style={{ marginVertical: vs(20), width: scale(330) }}
          >
            <View style={{ marginBottom: s(10) }}>
              <Text style={styles.Sectitle}>{'Your Shiftily Insights '}</Text>
              <Text style={styles.subSectitle}>
                {
                  'Personalized patterns from your\nscan to help you create meaningful\nshifts'
                }
              </Text>
            </View>

            <GradientHintBox
              title="Your Shift Pattern"
              text={shiftPatternText}
            />
          </GradientCardHome>

          {/* What might slow your shift */}
          <GradientCardHome
            style={{
              width: scale(330),
              marginBottom: vs(20),
            }}
          >
            <View style={{ marginBottom: s(10) }}>
              <Text style={styles.Sectitle}>
                {'What might slow your shift'}
              </Text>
            </View>

            <GradientHintBox
              title="Perfection loop"
              text={
                "When things aren't perfect, you may delay or avoid starting."
              }
            />
            <View style={{ height: scale(20) }} />
            <GradientHintBox
              title="Scarcity lens"
              text={'You might see opportunities as rare or out of reach.'}
            />
            <View style={{ marginTop: scale(20) }}>
              <Text style={styles.Sectitle}>
                {'Your best lever right now:'}
              </Text>
              <Text style={styles.sublensSectitle}>{bestLeverText}</Text>
            </View>
          </GradientCardHome>

          {/* CTA: Start shift */}
          <GradientCardHome
            style={{
              width: scale(330),
            }}
          >
            <View style={{ marginBottom: s(10) }}>
              <Text style={styles.Sectitle}>{'Start Your Reality Shift'}</Text>
              <Text style={styles.sublensSectitle}>
                {
                  "Daily check-ins are the foundation of your reality shift. By consist tly tracking your beliefs, you create awareness of your thought patterns and can consciously choose empowering beliefs over limiting ones. This simple practice compounds over time, gradually shifting your reality toward your highest potential.\n\nThese daily checks keep your shift measurable. YES on Empowering adds +1; YES on Shadow subtracts-1; totals cap at ±10. Over time your Shift Map stows ii' you're trending toward your Highest Vibration or drifting toward your Shadow Path."
                }
              </Text>

              <View style={{ height: scale(10) }} />

              <PrimaryButton
                textColor={palette.white}
                style={{
                  width: '100%',
                  height: 'auto',
                  color: palette.white,
                  fontSize: ms(14.5),
                  fontWeight: '700',
                  fontFamily: 'SourceSansPro-Regular',
                }}
                title={'Start Your Reality Shift'}
                onPress={() => navigation.navigate('Search' as never)}
              />

              <View style={{ height: scale(10) }} />

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.ctaWrap}
                onPress={() => console.log('Edit Belief Set')}
              >
                <LinearGradient
                  colors={['#143f65ff', '#1C2A3A']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.cta}
                >
                  <Text style={styles.ctaTextMuted}>Edit Belief Set</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </GradientCardHome>

          {/* Empowering & Shadow beliefs (reusable block) */}
          <BeliefsEditor />
        </View>
      </ScrollView>

      {/* ───────── Journal Bottom Sheet (Profile) ───────── */}
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
            {/* Backdrop */}
            <Pressable
              style={styles.modalBackdrop}
              onPress={closeJournalSheet}
            />

            {/* Bottom sheet */}
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {isAddingJournal ? 'Add Journal Entry' : 'Journal'}
              </Text>

              {!isAddingJournal && (
                <>
                  {visibleJournals.length === 0 ? (
                    <Text style={styles.emptyText}>
                      No journal entries yet. Start by adding your first one.
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
                  <Text style={styles.modalLabel}>Title</Text>
                  <GradientInput
                    value={journalTitle}
                    onChangeText={t => {
                      setJournalTitle(t);
                      if (journalError) setJournalError(null);
                    }}
                    placeholder="Give your journal a title"
                  />

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
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: scale(30),
  },
  firstSectitle: {
    color: palette.white,
    fontSize: ms(22),
    fontWeight: '600',
    marginVertical: vs(4),
    textAlign: 'left',
    fontFamily: 'SourceSansPro-Regular',
  },
  Sectitle: {
    color: palette.white,
    fontSize: ms(22),
    fontWeight: '600',
    marginVertical: vs(4),
    textAlign: 'left',
    fontFamily: 'SourceSansPro-Regular',
  },
  subSectitle: {
    color: palette.white,
    fontSize: ms(16),
    fontWeight: '500',
    marginVertical: vs(8),
    textAlign: 'left',
    fontFamily: 'SourceSansPro-Regular',
  },
  sublensSectitle: {
    color: palette.white,
    fontSize: ms(15),
    fontWeight: '500',
    marginVertical: vs(8),
    textAlign: 'left',
    fontFamily: 'SourceSansPro-Regular',
  },
  grid: {
    marginTop: vs(8),
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: vs(18),
  },
  cell: {
    width: (scale(330) - s(16) * 2 - s(12) * 2) / 3,
    alignItems: 'center',
  },
  gaugeWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(8),
  },
  gaugePct: {
    position: 'absolute',
    color: palette.white,
    fontWeight: '800',
    fontSize: ms(13),
    fontFamily: 'SourceSansPro-Regular',
  },
  cellLabel: {
    color: palette.white,
    textAlign: 'center',
    fontSize: ms(12),
    lineHeight: ms(16),
    fontFamily: 'SourceSansPro-Regular',
  },
  ctaWrap: {
    width: scale(50),
  },
  cta: {
    width: scale(300),
    height: vs(40),
    borderRadius: s(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTextMuted: {
    color: palette.txtBlue,
    fontSize: ms(14.5),
    fontWeight: '700',
    opacity: 0.9,
    fontFamily: 'SourceSansPro-Regular',
  },

  // Journal modal styles
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
