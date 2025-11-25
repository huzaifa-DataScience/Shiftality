import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { ms, s, scale, vs } from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { palette } from '../../theme';
import GradientCardHome from '../../components/GradientCardHome';
import GradientHintBox from '../../components/GradientHintBox';
import GradientInput from '../../components/GradientInput';
import GradientSelect from '../../components/GradientSelect';
import PrimaryButton from '../../components/PrimaryButton';
import ReminderPills from '../../components/ReminderPills';
import DebugInfoCard from '../../components/DebugInfoCard';
import AppImage from '../../components/AppImage';

import {
  getCheckins,
  upsertCheckins,
  Checkin,
  clearCheckins,
  clearDemoCheckins,
  clearAllCheckins,
} from '../../lib/dataClient';
import { selectHomeOnboarding } from '../../store/reducers/homeOnboardingReducer';

// ⚡ same keys as ProfileScreen / TodaysShiftView
const EMPOWERING_STORAGE_KEY = 'profile_empowering_beliefs_v1';
const SHADOW_STORAGE_KEY = 'profile_shadow_beliefs_v1';

// ⚡ same defaults as ProfileScreen / TodaysShiftView
const DEFAULT_EMPOWERING_BELIEFS: string[] = [
  'Today, I believed Opportunities show up when I show up.',
  'Today, I believed Small choices can shift my energy.',
  'Today, I believed A low moment doesn’t define the day.',
  'Today, I believed Reaching out first is safe for me.',
  'Today, I believed I keep promises to future me.',
  'Today, I believed I am enough as I grow.',
  'Today, I believed Challenges are feedback, not failure.',
  'Today, I believed I bounce back when things go wrong.',
];

const DEFAULT_SHADOW_BELIEFS: string[] = [
  'Today, I believed Money is scarce and hard for me to get.',
  'Today, I believed I’ll be misunderstood or rejected.',
  'Today, I believed Change isn’t really available to me.',
  'Today, I believed Stress is who I am.',
];

// small helper to clamp 1–30
function clampDays(raw: string): number {
  const n = Number(raw) || 0;
  return Math.max(1, Math.min(30, n));
}

// local copy of addDays logic (same behaviour as dataClient)
function addDaysStr(dateStr: string, days: number): string {
  const baseStr = dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00.000Z`;

  const d = new Date(baseStr);
  if (isNaN(d.getTime())) {
    console.warn('addDaysStr: invalid dateStr', dateStr);
    return dateStr;
  }

  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export default function DemoScreen() {
  const navigation = useNavigation();
  const onboarding = useSelector(selectHomeOnboarding);

  const clear_choices = require('../../assets/clear_choices.png');
  const notificationOutline = require('../../assets/notificationOutlineRed.png');

  const [days, setDays] = useState('7');
  const [mode, setMode] = useState<'All' | 'Empowering' | 'Shadow'>('All');
  const [which, setWhich] = useState<number | null>(0);

  // current belief sets (from storage)
  const [empoweringBeliefs, setEmpoweringBeliefs] = useState<string[]>(
    DEFAULT_EMPOWERING_BELIEFS,
  );
  const [shadowBeliefs, setShadowBeliefs] = useState<string[]>(
    DEFAULT_SHADOW_BELIEFS,
  );

  // all stored checkins
  const [checkins, setCheckins] = useState<Checkin[]>([]);

  // ───────────────── LOAD BELIEFS + CHECKINS ─────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const storedEmp = await AsyncStorage.getItem(EMPOWERING_STORAGE_KEY);
        if (storedEmp) {
          const parsed = JSON.parse(storedEmp);
          if (Array.isArray(parsed)) setEmpoweringBeliefs(parsed);
        }

        const storedShadow = await AsyncStorage.getItem(SHADOW_STORAGE_KEY);
        if (storedShadow) {
          const parsed = JSON.parse(storedShadow);
          if (Array.isArray(parsed)) setShadowBeliefs(parsed);
        }
      } catch (e) {
        console.log('DemoScreen: error loading beliefs', e);
      }

      try {
        const existing = await getCheckins();
        setCheckins(existing);
      } catch (e) {
        console.log('DemoScreen: error loading checkins', e);
      }
    };

    load();
  }, []);

  // ───────────────── DERIVED VALUES ─────────────────
  const effectiveDays = useMemo(() => clampDays(days), [days]);
  const todayStr = new Date().toISOString().slice(0, 10);

  const anchorDate = useMemo(() => {
    if (!checkins.length) return todayStr;

    // latest by date
    const latest = checkins.reduce(
      (max, c) => (c.date > max ? c.date : max),
      checkins[0].date,
    );
    return addDaysStr(latest, 1);
  }, [checkins, todayStr]);

  // For the line: “YYYY-MM-DD Will generate N days starting from …”
  const anchorLine = useMemo(() => {
    return `${anchorDate} Will generate ${effectiveDays} days starting from ${anchorDate} (forward-only rule)`;
  }, [anchorDate, effectiveDays]);

  const generationModes = ['All', 'Empowering', 'Shadow'];

  // aggregated stats from checkins (for DebugInfoCard)
  const totalCheckins = checkins.length;

  const latestCheckinDate =
    totalCheckins > 0 ? checkins[totalCheckins - 1].date : '—';

  const positiveTotal = checkins.reduce((sum, c) => sum + (c.pos_yes || 0), 0);

  const shadowTotal = checkins.reduce((sum, c) => sum + (c.neg_yes || 0), 0);

  const last10Dates = checkins.slice(-10).map(c => c.date);

  // ───────────────── ACTIONS ─────────────────
  const onGenerate = async () => {
    const n = effectiveDays;
    if (n <= 0) return;

    const posPerDay =
      mode === 'All' || mode === 'Empowering' ? empoweringBeliefs.length : 0;
    const negPerDay =
      mode === 'All' || mode === 'Shadow' ? shadowBeliefs.length : 0;

    let currentDate = anchorDate;
    const nowIso = new Date().toISOString();
    const generated: Checkin[] = [];

    for (let i = 0; i < n; i++) {
      let dailyScore = posPerDay - negPerDay;
      if (dailyScore > 10) dailyScore = 10;
      if (dailyScore < -10) dailyScore = -10;

      generated.push({
        id: `${currentDate}-${Date.now()}-${i}`,
        date: currentDate,
        pos_yes: posPerDay,
        neg_yes: negPerDay,
        daily_score: dailyScore,
        source: 'demo', // 👈 IMPORTANT
        created_at: nowIso,
      });

      currentDate = addDaysStr(currentDate, 1);
    }

    await upsertCheckins(generated);
    const updated = await getCheckins();
    setCheckins(updated);

    navigation.navigate('Main', { screen: 'Search' });
  };

  const onTriggerDaily = () => {
    // hook your "triggerDailyShift" logic here if needed
    console.log('Trigger Daily Shift (demo)');
  };

  const onReset = async () => {
    // 🔹 remove ONLY demo-generated checkins
    await clearDemoCheckins();
    const updated = await getCheckins();
    setCheckins(updated);
  };

  const onFreshStart = async () => {
    // 🔹 full wipe: remove all checkins (user + demo)
    await clearAllCheckins();
    const updated = await getCheckins();
    setCheckins(updated);
  };

  const timezone = onboarding?.timezone || 'UTC';
  const journeyStart = onboarding?.journeyStartDate?.slice(0, 10) || '—';

  return (
    <View style={styles.root}>
      <ScrollView
        style={{ backgroundColor: palette.darkBlue, marginVertical: scale(50) }}
        showsVerticalScrollIndicator={false}
      >
        {/* ───────── Generate Demo Data ───────── */}
        <GradientCardHome
          style={{
            width: scale(330),
          }}
        >
          <Text style={styles.h1}>Demo (for testing)</Text>
          <Text style={styles.sub}>
            Generate test data and debug your belief tracking journey
          </Text>

          <View style={{ height: vs(14) }} />

          <GradientHintBox
            title="Generate Demo Data"
            text={
              'Generate forward days (never backwards)\nwith specific belief modes to test your Shift Likelihood meter'
            }
            style={{ width: '100%' }}
          />

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Days to Generate (1–30)</Text>
            <GradientInput
              keyboardType="number-pad"
              value={days}
              onChangeText={setDays}
              placeholder="7"
            />

            <View style={{ height: vs(14) }} />

            <Text style={styles.label}>Generation Mode</Text>
            <GradientSelect
              value={mode}
              options={generationModes}
              onChange={v => setMode(v as any)}
              placeholder="All"
            />

            <View style={{ height: vs(14) }} />

            <GradientHintBox
              title="Next anchor date:"
              text=""
              secondaryText={anchorLine}
              style={{ width: '100%' }}
            />
          </View>

          <View style={{ height: vs(20) }} />

          <PrimaryButton
            textColor={palette.white}
            style={{
              width: '95%',
              height: 'auto',
              alignSelf: 'center',
              textAlign: 'center',
              color: palette.white,
              fontSize: ms(14.5),
              fontFamily: 'SourceSansPro-Regular',
              fontWeight: '700',
              opacity: 0.9,
            }}
            title={`Generate ${effectiveDays} Days`}
            onPress={onGenerate}
          />

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onTriggerDaily}
            style={{ marginTop: vs(10) }}
          >
            <LinearGradient
              colors={['#143f65ff', '#1C2A3A']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.cta, { opacity: 0.95 }]}
            >
              <Text style={[styles.ctaText, { color: palette.txtBlue }]}>
                Trigger Daily Shift
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Footer actions */}
          <View style={{ height: vs(20) }} />
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.85}
            onPress={onReset}
          >
            <AppImage source={clear_choices} style={styles.refresh} />
            <Text style={styles.rowTxt}>Reset demo data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, { marginTop: vs(8) }]}
            activeOpacity={0.85}
            onPress={onFreshStart}
          >
            <AppImage source={clear_choices} style={styles.refresh} />
            <Text style={styles.rowTxt}>Complete Fresh Start</Text>
          </TouchableOpacity>
        </GradientCardHome>

        <View style={{ height: scale(20) }} />

        {/* ───────── Test Reminders ───────── */}
        <GradientCardHome style={{ width: scale(330) }}>
          <Text style={styles.title}>Test Reminders</Text>
          <Text style={styles.subTitle}>
            Test the missed check-in reminder system and notifications
          </Text>
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
            />
          </View>
          <View style={{ height: scale(15) }} />
          <GradientHintBox
            text="Enable notifications to test the reminder
system properly."
          />
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              console.log('Test Notification');
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
          <ReminderPills value={which} onChange={setWhich} />
          <View style={{ height: scale(20) }} />
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
            onPress={() => {
              console.log('start Test');
            }}
          />
          <View style={{ height: scale(20) }} />
          <GradientHintBox
            title="Note:"
            text='Make sure to allow notifications when
prompted by your browser. Demo reminders
will show "(Demo)" in the title to distinguish
them from real reminders.'
          />
        </GradientCardHome>

        <View style={{ height: scale(20) }} />

        {/* ───────── Debug Info (live from dataClient) ───────── */}
        <DebugInfoCard
          timezone={timezone}
          journeyStart={journeyStart}
          today={todayStr}
          totalCheckins={totalCheckins}
          latestCheckin={latestCheckinDate}
          nextAnchor={anchorDate}
          archetype="Balanced Explorer"
          baselineIndex="53/100"
          empowering={positiveTotal}
          shadow={shadowTotal}
          last10Dates={last10Dates}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: palette.darkBlue,
  },
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
  h1: {
    color: palette.white,
    fontSize: s(18),
    fontWeight: '800',
    fontFamily: 'SourceSansPro-Regular',
  },
  sub: {
    color: palette.white,
    fontSize: s(16),
    lineHeight: s(22),
    marginTop: vs(6),
    fontFamily: 'SourceSansPro-Regular',
  },
  fieldBlock: {
    marginTop: vs(10),
  },
  label: {
    color: palette.white,
    fontWeight: '800',
    fontSize: ms(14),
    marginBottom: vs(8),
    marginTop: vs(6),
    fontFamily: 'SourceSansPro-Regular',
  },
  cta: {
    height: vs(39),
    width: scale(285),
    marginLeft: scale(8),
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTxt: {
    color: palette.white,
    fontSize: ms(15),
    fontWeight: '700',
    fontFamily: 'SourceSansPro-Regular',
  },
  refresh: {
    width: s(18),
    height: s(18),
    marginRight: s(10),
  },
  outilineNotification: {
    width: s(30),
    height: s(30),
    marginRight: s(10),
  },
});
