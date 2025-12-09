// src/screens/SearchScreen.tsx
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
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
import JournalModal from '../../components/JournalModal';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { selectHomeOnboarding } from '../../store/reducers/homeOnboardingReducer';
import { useSelector } from 'react-redux';
import { getCheckins, getProfile } from '../../lib/authService';
import {
  upsertCheckins,
  buildDenseSeries,
  Checkin,
  DensePoint,
} from '../../lib/dataClient';
import { useJournals } from '../../contexts/JournalContext';

export default function SearchScreen() {
  const navigation = useNavigation();
  const onboarding = useSelector(selectHomeOnboarding);
  const [selected, setSelected] = useState<'map' | 'grid'>('grid');
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [denseSeries, setDenseSeries] = useState<DensePoint[]>([]);
  console.log('denseSeries ==> ', denseSeries);
  const [firstName, setFirstName] = useState('');
  const [highestText, setHighestText] = useState('');
  const [lowestText, setLowestText] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [checkinsApi, setCheckinsApi] = useState<DensePoint[]>([]);

  // 🆕 Fetch checkins from API and build denseSeries
  useEffect(() => {
    const fetchCheckinsData = async () => {
      try {
        setIsLoading(true);
        // Get all checkins from API
        const checkinsData = await getCheckins();

        console.log(
          `✅ [ShiftMapChart] Received ${checkinsData.length} checkins from API`,
        );
        const userProfile = await getProfile();
        const start_date = userProfile?.profile?.journey_start_date;
        // Build denseSeries from fetched checkins
        const builtSeries = buildDenseSeries(start_date, checkinsData);
        setCheckinsApi(builtSeries);
        console.log(
          `📊 [ShiftMapChart] Built denseSeries with ${builtSeries.length} days`,
        );
        setIsLoading(false);
      } catch (error: any) {
        console.error(
          '❌ [ShiftMapChart] Error fetching checkins:',
          error.message,
        );
        // Fallback to prop denseSeries if API fails
        // setCheckins([]);
      } finally {
      }
    };

    fetchCheckinsData();
  }, []);

  // ───────── Journal state ─────────
  const { journalEntries, setSelectedFilterDate, selectedFilterDate } =
    useJournals();
  const [journalModalVisible, setJournalModalVisible] = useState(false);

  // ───────── Load profile first name ─────────
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userProfile = await getProfile();
        console.log('userProfile in search ==> ', userProfile);
        if (userProfile?.profile?.first_name) {
          setFirstName(userProfile?.profile?.first_name);
        }
        if (userProfile?.profile?.highest_text) {
          setHighestText(userProfile?.profile?.highest_text);
        }
        if (userProfile?.profile?.lowest_text) {
          setLowestText(userProfile?.profile?.lowest_text);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    loadProfile();
  }, []);

  // ───────── Load checkins + dense series ─────────
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const stored = await getCheckins();
        console.log('🚀 ~ load ~ stored:', stored);
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

  const handleCheckinUpdate = async (checkin: Checkin) => {
    await upsertCheckins([checkin]);
    const updated = await getCheckins();
    setCheckins(updated);

    const userProfile = await getProfile();

    if (userProfile?.profile?.journey_start_date) {
      const series = buildDenseSeries(
        userProfile?.profile?.journey_start_date,
        updated,
      );
      setDenseSeries(series);
    }
  };

  const { shiftPct, avgScore, statusLabel } = useMemo(() => {
    if (!checkinsApi || checkinsApi.length === 0) {
      return {
        shiftPct: 0,
        avgScore: 0,
        statusLabel: 'No data yet – lock your first Shift.',
      };
    }

    const windowSize = 30;
    const todayStr = new Date().toISOString().slice(0, 10);

    let endIndex = checkinsApi.findIndex(d => d.date === todayStr);

    if (endIndex === -1) {
      let lastBeforeOrEqual = -1;
      checkinsApi.forEach((d, idx) => {
        if (d.date <= todayStr) {
          lastBeforeOrEqual = idx;
        }
      });

      if (lastBeforeOrEqual !== -1) {
        endIndex = lastBeforeOrEqual;
      } else {
        endIndex = checkinsApi.length - 1;
      }
    }

    const startIndex = Math.max(0, endIndex - windowSize + 1);
    const lastWindow = checkinsApi.slice(startIndex, endIndex + 1);

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
  }, [checkinsApi]);
  console.log('shiftPct', shiftPct);
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
  const openJournalSheet = () => {
    setJournalModalVisible(true);
  };

  const closeJournalSheet = () => {
    setJournalModalVisible(false);
    // Note: Don't clear filter date here - it should persist until cleared from ShiftMapChart
  };

  // Calculate filtered journal count based on selectedFilterDate
  const filteredJournalCount = useMemo(() => {
    if (selectedFilterDate) {
      return journalEntries.filter(entry => entry.date === selectedFilterDate)
        .length;
    }
    return journalEntries.length;
  }, [journalEntries, selectedFilterDate]);

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
      value: filteredJournalCount,
      label: 'Journal',
    },
  ];

  // ───────── Map point → open journal modal ─────────
  const handleMapPointPress = (isoDate: string) => {
    setSelectedFilterDate(isoDate);
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
          <Text style={styles.title}>
            Hey {firstName || 'there'}, ready to shift?
          </Text>
          <Text style={styles.subTitle}>
            Your daily reality shift journey continues
          </Text>
          <View style={{ height: scale(10) }} />
          <TodaysShiftView onCheckinUpdate={handleCheckinUpdate} />
        </GradientCardHome>

        <View style={{ height: scale(20) }} />

        <GradientHintBox
          title="Highest Vibration (North Star)"
          text={highestText}
          style={{ width: scale(330) }}
        />
        <View style={{ height: scale(20) }} />
        <GradientHintBox
          title="Shadow Path"
          text={lowestText}
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
            Based on your last 30 days. Avg score {avgScore.toFixed(1) / 10}
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
              isLoading={isLoading}
              checkinsApi={checkinsApi}
              onPointPress={handleMapPointPress}
            />
          ) : (
            <ShiftGridChart isLoading={isLoading} checkinsApi={checkinsApi} />
          )}
        </View>
      </ScrollView>

      {/* ───────── Journal Modal ───────── */}
      <JournalModal visible={journalModalVisible} onClose={closeJournalSheet} />
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
});
