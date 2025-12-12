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

import { useAppTheme, useThemeMode } from '../../theme/ThemeProvider';
import GradientCardHome from '../../components/GradientCardHome';
import GradientBackground from '../../components/GradientBackground';
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
import { useJournals } from '../../contexts/JournalContext';

type ProfileScreenProps = {
  openJournalToken?: number;
  onClose?: () => void;
};

export default function ProfileScreen({
  openJournalToken: propOpenJournalToken,
  onClose,
}: ProfileScreenProps = {}) {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const theme = useAppTheme();
  const { themeMode } = useThemeMode();

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
  const { journalEntries, addJournal, deleteJournal } = useJournals();
  const [journalModalVisible, setJournalModalVisible] = useState(false);
  const [isAddingJournal, setIsAddingJournal] = useState(false);

  const [journalTitle, setJournalTitle] = useState('');
  const [journalDesc, setJournalDesc] = useState('');
  const [journalDate, setJournalDate] = useState<Date>(new Date());
  const [journalTime, setJournalTime] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [journalError, setJournalError] = useState<string | null>(null);

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

  // Open journal when prop changes (for modal usage)
  useEffect(() => {
    if (propOpenJournalToken) {
      openJournalSheet();
    }
  }, [propOpenJournalToken, openJournalSheet]);

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

    await addJournal({
      title,
      description: desc,
      date: dateStr,
      time: timeStr,
    });

    // go back to list view
    setIsAddingJournal(false);
    setJournalTitle('');
    setJournalDesc('');
  };

  const handleDeleteJournal = async (id: string) => {
    await deleteJournal(id);
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
      <GradientBackground>
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.root}>
            {/* Close button for modal mode */}
            {onClose && (
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={onClose}
              >
                <Text style={styles.modalCloseText}>✕ Close</Text>
              </TouchableOpacity>
            )}

            {/* Profile intro card */}
            <GradientCardHome
              style={{
                marginVertical: vs(20),
                marginTop: onClose ? scale(20) : scale(50),
                width: scale(330),
              }}
            >
              <View style={{ marginBottom: s(10) }}>
                <Text
                  style={[styles.firstSectitle, { color: theme.colors.text }]}
                >
                  {`${displayName}'s Shiftality Profile`}
                </Text>
                <Text
                  style={[
                    styles.subSectitle,
                    { color: theme.colors.textMuted },
                  ]}
                >
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
                <Text style={[styles.Sectitle, { color: theme.colors.text }]}>
                  {'Domain Strengths'}
                </Text>
                <Text
                  style={[
                    styles.subSectitle,
                    { color: theme.colors.textMuted },
                  ]}
                >
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
                                color: theme.colors.text,
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
                <Text style={[styles.Sectitle, { color: theme.colors.text }]}>
                  {'Your Shiftily Insights '}
                </Text>
                <Text
                  style={[
                    styles.subSectitle,
                    { color: theme.colors.textMuted },
                  ]}
                >
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
                <Text style={[styles.Sectitle, { color: theme.colors.text }]}>
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
                <Text style={[styles.Sectitle, { color: theme.colors.text }]}>
                  {'Your best lever right now:'}
                </Text>
                <Text
                  style={[
                    styles.sublensSectitle,
                    { color: theme.colors.textMuted },
                  ]}
                >
                  {bestLeverText}
                </Text>
              </View>
            </GradientCardHome>

            {/* CTA: Start shift */}
            <GradientCardHome
              style={{
                width: scale(330),
              }}
            >
              <View style={{ marginBottom: s(10) }}>
                <Text style={[styles.Sectitle, { color: theme.colors.text }]}>
                  {'Start Your Reality Shift'}
                </Text>
                <Text
                  style={[
                    styles.sublensSectitle,
                    { color: theme.colors.textMuted },
                  ]}
                >
                  {
                    "Daily check-ins are the foundation of your reality shift. By consist tly tracking your beliefs, you create awareness of your thought patterns and can consciously choose empowering beliefs over limiting ones. This simple practice compounds over time, gradually shifting your reality toward your highest potential.\n\nThese daily checks keep your shift measurable. YES on Empowering adds +1; YES on Shadow subtracts-1; totals cap at ±10. Over time your Shift Map stows ii' you're trending toward your Highest Vibration or drifting toward your Shadow Path."
                  }
                </Text>

                <View style={{ height: scale(10) }} />

                <PrimaryButton
                  style={{
                    width: '100%',
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
                    colors={theme.colors.cardGradient}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.cta}
                  >
                    <Text
                      style={[
                        styles.ctaTextMuted,
                        { color: theme.colors.text },
                      ]}
                    >
                      Edit Belief Set
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </GradientCardHome>

            {/* Empowering & Shadow beliefs (reusable block) */}
            <BeliefsEditor />
          </View>
        </ScrollView>
      </GradientBackground>

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
            <View
              style={[styles.modalCard, { backgroundColor: theme.colors.card }]}
            >
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {isAddingJournal ? 'Add Journal Entry' : 'Journal'}
              </Text>

              {!isAddingJournal && (
                <>
                  {visibleJournals.length === 0 ? (
                    <Text
                      style={[
                        styles.emptyText,
                        { color: theme.colors.textMuted },
                      ]}
                    >
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
                        <View
                          key={entry.id}
                          style={[
                            styles.journalItem,
                            { backgroundColor: theme.colors.card },
                          ]}
                        >
                          <View style={styles.journalHeaderRow}>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={[
                                  styles.journalItemTitle,
                                  { color: theme.colors.text },
                                ]}
                              >
                                {entry.title}
                              </Text>
                              <Text
                                style={[
                                  styles.journalItemMeta,
                                  { color: theme.colors.textMuted },
                                ]}
                              >
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
                            style={[
                              styles.journalItemDesc,
                              { color: theme.colors.textMuted },
                            ]}
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
                        { backgroundColor: theme.colors.card },
                      ]}
                      onPress={closeJournalSheet}
                    >
                      <Text
                        style={[
                          styles.modalButtonText,
                          { color: theme.colors.text },
                        ]}
                      >
                        Close
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {isAddingJournal && (
                <>
                  <Text
                    style={[styles.modalLabel, { color: theme.colors.text }]}
                  >
                    Title
                  </Text>
                  <GradientInput
                    value={journalTitle}
                    onChangeText={(t: string) => {
                      setJournalTitle(t);
                      if (journalError) setJournalError(null);
                    }}
                    placeholder="Give your journal a title"
                  />

                  <Text
                    style={[styles.modalLabel, { color: theme.colors.text }]}
                  >
                    Description
                  </Text>
                  <GradientInput
                    value={journalDesc}
                    onChangeText={(t: string) => {
                      setJournalDesc(t);
                      if (journalError) setJournalError(null);
                    }}
                    placeholder="What happened today? How do you feel?"
                    multiline
                    style={{ minHeight: vs(80) }}
                  />

                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1, marginRight: s(6) }}>
                      <Text
                        style={[
                          styles.modalLabel,
                          { color: theme.colors.text },
                        ]}
                      >
                        Date
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.pickerButton,
                          { borderColor: theme.colors.border },
                        ]}
                        onPress={() => setShowDatePicker(true)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.pickerButtonText,
                            { color: theme.colors.text },
                          ]}
                        >
                          {formatDate(journalDate)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, marginLeft: s(6) }}>
                      <Text
                        style={[
                          styles.modalLabel,
                          { color: theme.colors.text },
                        ]}
                      >
                        Time
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.pickerButton,
                          { borderColor: theme.colors.border },
                        ]}
                        onPress={() => setShowTimePicker(true)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.pickerButtonText,
                            { color: theme.colors.text },
                          ]}
                        >
                          {formatTime(journalTime)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {showDatePicker && (
                    <DateTimePicker
                      value={journalDate}
                      mode="date"
                      themeVariant={themeMode === 'dark' ? 'dark' : 'light'}
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onChangeDate}
                    />
                  )}

                  {showTimePicker && (
                    <DateTimePicker
                      value={journalTime}
                      mode="time"
                      is24Hour={false}
                      themeVariant={themeMode === 'dark' ? 'dark' : 'light'}
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
                        { backgroundColor: theme.colors.card },
                      ]}
                      onPress={() => {
                        setIsAddingJournal(false);
                        setJournalError(null);
                      }}
                    >
                      <Text
                        style={[
                          styles.modalButtonText,
                          { color: theme.colors.text },
                        ]}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.modalButton,
                        { backgroundColor: theme.colors.primary },
                      ]}
                      onPress={handleSaveJournal}
                    >
                      <Text
                        style={[
                          styles.modalButtonText,
                          { color: theme.colors.onPrimary },
                        ]}
                      >
                        Save
                      </Text>
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
  modalCloseButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: s(20),
    paddingVertical: vs(15),
    marginTop: vs(10),
  },
  modalCloseText: {
    color: '#00BFFF',
    fontSize: ms(16),
    fontWeight: '600',
    fontFamily: 'SourceSansPro-Regular',
  },
  firstSectitle: {
    fontSize: ms(22),
    fontWeight: '600',
    marginVertical: vs(4),
    textAlign: 'left',
    fontFamily: 'SourceSansPro-Regular',
  },
  Sectitle: {
    fontSize: ms(22),
    fontWeight: '600',
    marginVertical: vs(4),
    textAlign: 'left',
    fontFamily: 'SourceSansPro-Regular',
  },
  subSectitle: {
    fontSize: ms(16),
    fontWeight: '500',
    marginVertical: vs(8),
    textAlign: 'left',
    fontFamily: 'SourceSansPro-Regular',
  },
  sublensSectitle: {
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
    fontWeight: '800',
    fontSize: ms(13),
    fontFamily: 'SourceSansPro-Regular',
  },
  cellLabel: {
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
    fontSize: ms(18),
    fontWeight: '800',
    marginBottom: vs(10),
    fontFamily: 'SourceSansPro-Regular',
  },
  modalLabel: {
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
    paddingVertical: vs(10),
    paddingHorizontal: s(10),
  },
  pickerButtonText: {
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
    borderRadius: s(14),
    paddingVertical: vs(10),
    paddingHorizontal: s(12),
    marginBottom: vs(10),
    borderWidth: 1,
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
