import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { palette } from '../../theme';
import GradientCardHome from '../../components/GradientCardHome';
import { ms, s, scale, vs } from 'react-native-size-matters';
import GradientHintBox from '../../components/GradientHintBox';
import GradientInput from '../../components/GradientInput';
import GradientSelect from '../../components/GradientSelect';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import PrimaryButton from '../../components/PrimaryButton';
import ReminderPills from '../../components/ReminderPills';
import DebugInfoCard from '../../components/DebugInfoCard';
import AppImage from '../../components/AppImage';

export default function DemoScreen() {
  const navigation = useNavigation();
  const clear_choices = require('../../assets/clear_choices.png');
  const notificationOutline = require('../../assets/notificationOutlineRed.png');

  const [days, setDays] = useState('7');
  const [mode, setMode] = useState<'All' | 'Empowering' | 'Shadow'>('All');
  const [which, setWhich] = useState<number | null>(0);

  // For the line: “2025-10-31 Will generate 7 days starting from …”
  const anchorLine = useMemo(() => {
    const d = new Date(); // replace with your server “next anchor date”
    const iso = d.toISOString().slice(0, 10);
    const n = Math.max(1, Math.min(30, Number(days) || 0));
    return `${iso} Will generate ${n} days starting from ${iso} (forward-only rule)`;
  }, [days]);

  const generationModes = ['All', 'Empowering', 'Shadow'];

  const onGenerate = () => {
    // hook your action here
    // generateDemo({ days: Number(days), mode })
  };

  const onTriggerDaily = () => {
    // triggerDailyShift()
  };

  const onReset = () => {
    /* ... */
  };
  const onFreshStart = () => {
    /* ... */
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={{ backgroundColor: palette.darkBlue, marginVertical: scale(50) }}
        showsVerticalScrollIndicator={false}
      >
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

          {/* Bordered inner box */}
          <GradientHintBox
            title="Generate Demo Data"
            text={
              'Generate forward days (never backwards)\nwith specific belief modes to test your Shift Likelihood meter'
            }
            style={{ width: '100%' }}
          >
            {/* children aren’t supported in your GHBox, so we place the inputs just below */}
          </GradientHintBox>

          {/* Inputs inside the same visual group */}
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

            {/* anchor notice looking like a small bordered block (use GHBox secondaryText) */}
            <GradientHintBox
              title="Next anchor date:"
              text=""
              secondaryText={anchorLine}
              style={{ width: '100%' }}
            />
          </View>
          <View style={{ height: vs(20) }} />

          {/* Buttons */}
          <PrimaryButton
            textColor={palette.white}
            style={{
              width: '95%',
              height: 'auto',
              alignSelf: 'center',
              textAlign: 'center',
              color: palette.white,
              fontSize: ms(14.5),
              fontWeight: '700',
              opacity: 0.9,
            }}
            title={`Generate ${Math.max(
              1,
              Math.min(30, Number(days) || 0),
            )} Days`}
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
          />{' '}
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
              fontWeight: '700',
              opacity: 0.9,
            }}
            title={`Test Full Sequence (5s intervals)`}
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
        <DebugInfoCard
          timezone="Europe/London"
          journeyStart="2025-10-24"
          today="2025-10-24"
          totalCheckins={19}
          latestCheckin="2025-11-11"
          nextAnchor="2025-11-12"
          archetype="Balanced Explorer"
          baselineIndex="53/100"
          empowering={10}
          shadow={4}
          last10Dates={[
            '2025-11-02',
            '2025-11-02',
            '2025-11-02',
            '2025-11-02',
            '2025-11-02',
            '2025-11-02',
            '2025-11-02',
            '2025-11-02',
            '2025-11-02',
            '2025-11-02',
          ]}
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
  },
  subTitle: {
    fontSize: scale(16),
    fontWeight: '500',
    color: palette.white,
    lineHeight: scale(20),
  },
  h1: { color: palette.white, fontSize: s(18), fontWeight: '800' },
  sub: {
    color: palette.white,
    fontSize: s(16),
    lineHeight: s(22),
    marginTop: vs(6),
  },
  fieldBlock: { marginTop: vs(10) },
  label: {
    color: palette.white,
    fontWeight: '800',
    fontSize: ms(14),
    marginBottom: vs(8),
    marginTop: vs(6),
  },
  cta: {
    height: vs(39),
    width: scale(285),
    marginLeft: scale(8),
    borderRadius: s(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#0E2440', fontSize: ms(15), fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowTxt: { color: palette.white, fontSize: ms(15), fontWeight: '700' },
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
