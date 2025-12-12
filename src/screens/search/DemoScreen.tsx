// src/screens/DemoScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { ms, s, scale, vs } from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

import { useAppTheme, useThemeMode } from '../../theme/ThemeProvider';
import { useFontSize } from '../../theme/FontSizeProvider';
import GradientCardHome from '../../components/GradientCardHome';
import GradientHintBox from '../../components/GradientHintBox';
import GradientInput from '../../components/GradientInput';
import GradientSelect from '../../components/GradientSelect';
import PrimaryButton from '../../components/PrimaryButton';
import DebugInfoCard from '../../components/DebugInfoCard';
import AppImage from '../../components/AppImage';
import ReminderTestSection from '../../components/ReminderTestSection';
import BlueHeader from '../../components/BlueHeader';
import GradientBackground from '../../components/GradientBackground';

import {
  getCheckins,
  upsertCheckins,
  clearDemoCheckins,
  clearAllCheckins,
  Checkin,
} from '../../lib/dataClient';
import {
  createCheckin,
  getProfile,
  resetCheckins,
} from '../../lib/authService';
import {
  selectHomeOnboarding,
  setArchetype,
  setBaselineIndex,
} from '../../store/reducers/homeOnboardingReducer';
import { selectBeliefProfile } from '../../store/reducers/surveyReducer';

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
  const dispatch = useDispatch();
  const onboarding = useSelector(selectHomeOnboarding);
  const beliefProfile = useSelector(selectBeliefProfile);
  const theme = useAppTheme();
  const { themeMode } = useThemeMode();
  const { scaledFontSize } = useFontSize();
  const isDark = themeMode === 'dark';

  const clear_choices = require('../../assets/clear_choices.png');

  const [days, setDays] = useState('7');
  const [mode, setMode] = useState<'All' | 'Empowering' | 'Shadow'>('All');
  const [isGenerating, setIsGenerating] = useState(false);

  // current belief sets (from storage)
  const [empoweringBeliefs, setEmpoweringBeliefs] = useState<string[]>(
    DEFAULT_EMPOWERING_BELIEFS,
  );
  const [shadowBeliefs, setShadowBeliefs] = useState<string[]>(
    DEFAULT_SHADOW_BELIEFS,
  );

  // all stored checkins
  const [checkins, setCheckins] = useState<Checkin[]>([]);

  // 🔹 Profile from backend (getProfile)
  const [profile, setProfile] = useState<any | null>(null);

  const handleDaysChange = (value: string) => {
    // strip non-digits
    const numeric = value.replace(/[^0-9]/g, '');

    // allow empty for typing
    if (!numeric) {
      setDays('');
      return;
    }

    // clamp to 1–30 and reflect it back into the input
    const clamped = clampDays(numeric);
    setDays(String(clamped));
  };

  // ───────────────── LOAD BELIEFS + CHECKINS + PROFILE ─────────────────
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

      // 🔹 Load profile from backend for DebugInfoCard
      try {
        const res: any = await getProfile();
        // handle shape: { success, profile } OR direct object
        const backendProfile = res?.profile ?? res;
        setProfile(backendProfile);
      } catch (e) {
        console.log('DemoScreen: error loading profile', e);
      }
    };

    load();
  }, []);

  useEffect(() => {
    // Only update if we have a meaningful index
    if (beliefProfile.overallIndex > 0) {
      dispatch(setBaselineIndex(beliefProfile.overallIndex));
      dispatch(setArchetype(beliefProfile.archetype));
    }
  }, [beliefProfile.overallIndex, beliefProfile.archetype, dispatch]);

  console.log('baselineIndex', onboarding?.baselineIndex);
  console.log('archetype', onboarding?.archetype);

  // ───────────────── PROFILE-DRIVEN VALUES (for DebugInfoCard) ─────────────────
  const profileTimezone =
    profile?.user_timezone || profile?.timezone || undefined;

  const profileJourneyStart =
    typeof profile?.journey_start_date === 'string'
      ? profile.journey_start_date.slice(0, 10)
      : undefined;

  const profileArchetype = profile?.archetype as string | undefined;

  const profileBaselineIndexStr =
    typeof profile?.baseline_index === 'number'
      ? `${Math.round(profile.baseline_index)}/100`
      : undefined;

  const timezone = profileTimezone || onboarding?.timezone || 'UTC';

  const journeyStart =
    profileJourneyStart ||
    (onboarding?.journeyStartDate
      ? onboarding.journeyStartDate.slice(0, 10)
      : '—');

  const archetype = profileArchetype || 'Balanced Explorer';

  const baselineIndexStr =
    profileBaselineIndexStr ||
    (onboarding?.baselineIndex != null
      ? `${Math.round(onboarding.baselineIndex)}/100`
      : '—');

  // ───────────────── DERIVED VALUES ─────────────────
  const effectiveDays = useMemo(() => clampDays(days), [days]);
  const todayStr = new Date().toISOString().slice(0, 10);

  const anchorDate =
    profile?.anchorDate ||
    useMemo(() => {
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
  const totalCheckins = profile?.totalCheckins || checkins.length;

  const latestCheckinDate =
    profile?.latest_checkin_date ||
    (totalCheckins > 0 ? checkins[totalCheckins - 1].date : '—');

  const positiveTotal =
    profile?.custom_empowering_beliefs ||
    checkins.reduce((sum, c) => sum + (c.pos_yes || 0), 0);

  const shadowTotal =
    profile?.custom_shadow_beliefs ||
    checkins.reduce((sum, c) => sum + (c.neg_yes || 0), 0);

  const last10Dates = checkins.slice(-10).map(c => c.date);

  // ───────────────── ACTIONS ─────────────────
  const onGenerate = async () => {
    const n = effectiveDays;
    if (n <= 0) return;

    setIsGenerating(true);

    // how many YES per day based on mode
    const posPerDay =
      mode === 'All' || mode === 'Empowering' ? empoweringBeliefs.length : 0;
    const negPerDay =
      mode === 'All' || mode === 'Shadow' ? shadowBeliefs.length : 0;

    let currentDate = anchorDate;
    const nowIso = new Date().toISOString();
    const generated: Checkin[] = [];

    try {
      for (let i = 0; i < n; i++) {
        let dailyScore = posPerDay - negPerDay;
        if (dailyScore > 10) dailyScore = 10;
        if (dailyScore < -10) dailyScore = -10;

        const checkin: Checkin = {
          id: `${currentDate}-${Date.now()}-${i}`,
          date: currentDate,
          pos_yes: posPerDay,
          neg_yes: negPerDay,
          daily_score: dailyScore,
          source: 'demo', // 👈 mark as demo data
          created_at: nowIso,
        };

        generated.push(checkin);

        // 🆕 Call API to create checkin on backend
        try {
          await createCheckin(checkin);
          console.log(`✅ Demo checkin ${i + 1}/${n} created on backend`);
        } catch (apiError) {
          console.warn(
            `⚠️ Failed to create demo checkin ${
              i + 1
            }/${n} on backend, continuing...`,
            apiError,
          );
          // Continue with next even if API fails
        }

        currentDate = addDaysStr(currentDate, 1);
      }

      // Save all to local storage as well
      await upsertCheckins(generated);
      const updated = await getCheckins();
      setCheckins(updated);

      Toast.show({
        type: 'success',
        text1: 'Demo Data Generated',
        text2: `Created ${n} test days (source: demo)`,
      });

      console.log(`🎉 Generated ${n} demo checkins`);
    } catch (error: any) {
      console.error('❌ Error generating demo data:', error);
      Toast.show({
        type: 'error',
        text1: 'Generation Failed',
        text2: error.message || 'Failed to generate demo data',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onTriggerDaily = async () => {
    // One-day version of onGenerate, using the next anchorDate
    // const posPerDay =
    //   mode === 'All' || mode === 'Empowering' ? empoweringBeliefs.length : 0;
    // const negPerDay =
    //   mode === 'All' || mode === 'Shadow' ? shadowBeliefs.length : 0;

    // let dailyScore = posPerDay - negPerDay;
    // if (dailyScore > 10) dailyScore = 10;
    // if (dailyScore < -10) dailyScore = -10;

    // const nowIso = new Date().toISOString();

    // const checkin: Checkin = {
    //   id: `${anchorDate}-${Date.now()}-trigger`,
    //   date: anchorDate,
    //   pos_yes: posPerDay,
    //   neg_yes: negPerDay,
    //   daily_score: dailyScore,
    //   source: 'demo',
    //   created_at: nowIso,
    // };

    // try {
    //   console.log('🔒 [onTriggerDaily] Creating demo checkin:', checkin);

    //   // 🆕 Call API to create checkin on backend
    //   await createCheckin(checkin);
    //   console.log('✅ [onTriggerDaily] Demo checkin created on backend');

    //   // Save to local storage as well
    //   await upsertCheckins([checkin]);
    //   const updated = await getCheckins();
    //   setCheckins(updated);

    //   Toast.show({
    //     type: 'success',
    //     text1: 'Daily Demo Shift Triggered',
    //     text2: `Score: ${dailyScore} (source: demo)`,
    //   });

    //   // Optionally bounce user back into main flow
    //   // @ts-ignore
    //   navigation.navigate('Main', { screen: 'Search' });
    // } catch (error: any) {
    //   console.error('❌ [onTriggerDaily] Error triggering daily shift:', error);
    //   Toast.show({
    //     type: 'error',
    //     text1: 'Trigger Failed',
    //     text2: error.message || 'Failed to trigger daily shift',
    //   });
    // }
    (navigation as any).navigate('Main', {
      screen: 'Search',
      params: { anchorDate: anchorDate },
    });
  };

  const onReset = async () => {
    try {
      // 1) Get profile so we have the user id
      const userProfile: any = await getProfile();
      const userId = userProfile?.profile?.id || userProfile?.id;
      // 2) Call backend reset-checkins WITH is_demo = true
      await resetCheckins(userId, true);

      // 3) Clear local demo checkins so local + backend stay in sync
      await clearDemoCheckins();

      const updated = await getCheckins();
      setCheckins(updated);

      Toast.show({
        type: 'success',
        text1: 'Demo data reset',
        text2: 'Your demo checkins have been cleared.',
      });

      // 5) Go back to main Search dashboard
      // @ts-ignore
      navigation.navigate('Main', { screen: 'Search' });
    } catch (error: any) {
      console.error('❌ [DemoScreen:onReset] Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Reset failed',
        text2: error.message || 'Could not reset demo data.',
      });
    }
  };

  const onFreshStart = async () => {
    try {
      // 1) Get profile so we have the user id
      const userProfile: any = await getProfile();
      const userId = userProfile?.profile?.id || userProfile?.id;
      // 2) Call backend reset-checkins WITHOUT is_demo
      await resetCheckins(userId);

      // 3) Clear ALL local checkins (demo + real) to stay in sync
      await clearAllCheckins();

      // 4) Reload local checkins view (should be empty)
      const updated = await getCheckins();
      setCheckins(updated);

      Toast.show({
        type: 'success',
        text1: 'Fresh start',
        text2: 'All checkins have been cleared. You have a clean slate.',
      });

      // 5) Go back to main Search dashboard
      // @ts-ignore
      navigation.navigate('Main', { screen: 'Search' });
    } catch (error: any) {
      console.error('❌ [DemoScreen:onFreshStart] Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Fresh start failed',
        text2: error.message || 'Could not clear all checkins.',
      });
    }
  };

  return (
    <GradientBackground>
      <ScrollView
        style={{
          flex: 1,
          marginVertical: scale(20),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ───────── Generate Demo Data ───────── */}
        <GradientCardHome
          style={{
            width: scale(330),
            alignSelf: 'center',
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              height: 44,
              justifyContent: 'center',
            }}
            hitSlop={12}
          >
            <Text
              style={{
                color: theme.colors.text,
                fontSize: scaledFontSize(14),
                lineHeight: 28,
                fontFamily: 'SourceSansPro-Regular',
              }}
            >
              {'< Back'}
            </Text>
          </TouchableOpacity>
          <Text
            style={[
              styles.h1,
              { color: theme.colors.text, fontSize: scaledFontSize(18) },
            ]}
          >
            Demo (for testing)
          </Text>
          <Text
            style={[
              styles.sub,
              { color: theme.colors.textMuted, fontSize: scaledFontSize(16) },
            ]}
          >
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
            <Text
              style={[
                styles.label,
                { color: theme.colors.text, fontSize: scaledFontSize(14) },
              ]}
            >
              Days to Generate (1–30)
            </Text>
            <GradientInput
              keyboardType="number-pad"
              value={days}
              onChangeText={handleDaysChange}
              placeholder="7"
            />

            <View style={{ height: vs(14) }} />

            <Text
              style={[
                styles.label,
                { color: theme.colors.text, fontSize: scaledFontSize(14) },
              ]}
            >
              Generation Mode
            </Text>
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

          {isGenerating ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text
                style={[
                  styles.loaderText,
                  { color: theme.colors.text, fontSize: scaledFontSize(14) },
                ]}
              >
                Generating demo data...
              </Text>
            </View>
          ) : (
            <>
              <PrimaryButton
                style={{
                  width: '95%',
                  height: 'auto',
                  alignSelf: 'center',
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
                  colors={theme.colors.cardGradient}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[styles.cta, { opacity: 0.95 }]}
                >
                  <Text
                    style={[
                      styles.ctaText,
                      {
                        color: theme.colors.text,
                        fontSize: scaledFontSize(15),
                      },
                    ]}
                  >
                    Trigger Daily Shift
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          {/* Footer actions */}
          <View style={{ height: vs(20) }} />
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.85}
            onPress={onReset}
          >
            <AppImage source={clear_choices} style={styles.refresh} />
            <Text
              style={[
                styles.rowTxt,
                { color: theme.colors.text, fontSize: scaledFontSize(15) },
              ]}
            >
              Reset demo data
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, { marginTop: vs(8) }]}
            activeOpacity={0.85}
            onPress={onFreshStart}
          >
            <AppImage source={clear_choices} style={styles.refresh} />
            <Text
              style={[
                styles.rowTxt,
                { color: theme.colors.text, fontSize: scaledFontSize(15) },
              ]}
            >
              Complete Fresh Start
            </Text>
          </TouchableOpacity>
        </GradientCardHome>

        <View style={{ height: scale(20) }} />

        {/* ───────── Test Reminders (reusable component) ───────── */}
        <ReminderTestSection
          cardStyle={{ width: scale(330), alignSelf: 'center' }}
        />

        <View style={{ height: scale(20) }} />

        {/* ───────── Debug Info (now using getProfile data) ───────── */}
        <DebugInfoCard
          timezone={timezone}
          journeyStart={journeyStart}
          today={todayStr}
          totalCheckins={totalCheckins}
          latestCheckin={latestCheckinDate}
          nextAnchor={anchorDate}
          archetype={archetype}
          baselineIndex={baselineIndexStr}
          empowering={positiveTotal}
          shadow={shadowTotal}
          last10Dates={last10Dates}
        />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: scale(18),
    fontWeight: '800',
    marginBottom: scale(10),
    fontFamily: 'SourceSansPro-Regular',
  },
  subTitle: {
    fontSize: scale(16),
    fontWeight: '500',
    lineHeight: scale(20),
    fontFamily: 'SourceSansPro-Regular',
  },
  h1: {
    fontSize: s(18),
    fontWeight: '800',
    fontFamily: 'SourceSansPro-Regular',
  },
  sub: {
    fontSize: s(16),
    lineHeight: s(22),
    marginTop: vs(6),
    fontFamily: 'SourceSansPro-Regular',
  },
  fieldBlock: {
    marginTop: vs(10),
  },
  label: {
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
    fontSize: ms(15),
    fontWeight: '800',
    fontFamily: 'SourceSansPro-Regular',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTxt: {
    fontSize: ms(15),
    fontWeight: '700',
    fontFamily: 'SourceSansPro-Regular',
  },
  refresh: {
    width: s(18),
    height: s(18),
    marginRight: s(10),
  },
  loaderContainer: {
    width: '95%',
    alignSelf: 'center',
    paddingVertical: vs(30),
    alignItems: 'center',
    justifyContent: 'center',
    gap: vs(12),
  },
  loaderText: {
    fontSize: ms(14),
    fontWeight: '600',
    fontFamily: 'SourceSansPro-Regular',
    marginTop: vs(8),
  },
});
