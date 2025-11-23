// HomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { palette } from '../../theme';
import GradientCardHome from '../../components/GradientCardHome';
import GradientInput from '../../components/GradientInput';
import GradientTimezoneSelect from '../../components/GradientTImeZoneSelect';
import GradientDatePicker from '../../components/GradientDatePicker';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
  scale,
} from 'react-native-size-matters';
import GradientHintBox from '../../components/GradientHintBox';
import GradientToggleRow from '../../components/GradientToggleRow';
import PrimaryButton from '../../components/PrimaryButton';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useSelector, useDispatch } from 'react-redux';

import {
  selectHomeOnboarding,
  setFirstName,
  setTimezone,
  setJourneyStartDate,
  setNorthStar,
  setShadowPath,
  setCheckInTime,
  setDndStart,
  setDndEnd,
  setAllowNotifications,
} from '../../store/reducers/homeOnboardingReducer';

export default function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();

  const {
    firstName,
    timezone,
    journeyStartDate, // ISO strings
    northStar,
    shadowPath,
    checkInTime,
    dndStart,
    dndEnd,
    allowNotifications,
  } = useSelector(selectHomeOnboarding);

  const northStarPlaceholder =
    "Paint the picture of where you'll be in one year—your highest potential reality, the version of yourself you're shifting toward …";

  const shadowPathPlaceholder =
    "Describe the patterns, habits, or reality you're leaving behind—what your life looks like in one year if nothing shifts…";

  // ---------- FORM VALIDATION ----------
  const trimmedName = firstName.trim();
  const isNameValid = trimmedName.length >= 2 && trimmedName.length <= 20;
  const isTimezoneValid = !!timezone;
  const isNorthStarValid = northStar.trim().length > 0;
  const isShadowPathValid = shadowPath.trim().length > 0;

  // dates/times are ISO strings – just make sure they exist
  const isJourneyDateValid = !!journeyStartDate;
  const isCheckInValid = !!checkInTime;
  const isDndStartValid = !!dndStart;
  const isDndEndValid = !!dndEnd;

  const canContinue =
    isNameValid &&
    isTimezoneValid &&
    isJourneyDateValid &&
    isNorthStarValid &&
    isShadowPathValid &&
    isCheckInValid &&
    isDndStartValid &&
    isDndEndValid;

  return (
    <ScrollView style={{ backgroundColor: palette.darkBlue }}>
      <View style={styles.root}>
        <GradientCardHome style={{ marginTop: vs(50), width: scale(330) }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.title}>Welcome to Shiftality</Text>
            <Text style={styles.subtitle}>
              {"Let's set up your personalized reality\nshift journey"}
            </Text>
          </View>

          {/* Name */}
          <Text style={styles.label}>First Name</Text>
          <GradientInput
            minHeight={vs(45)}
            placeholder="Enter Your Name"
            value={firstName}
            onChangeText={t => dispatch(setFirstName(t))}
          />
          <Text style={styles.helper}>2–20 Characters</Text>

          {/* Time Zone */}
          <Text style={[styles.label, { marginTop: vs(18) }]}>Time Zone</Text>
          <GradientTimezoneSelect
            value={timezone}
            onChange={tz => dispatch(setTimezone(tz))}
          />

          {/* Journey Start Date */}
          <Text style={[styles.label, { marginTop: vs(18) }]}>
            Journey Start Date *
          </Text>
          <GradientDatePicker
            value={new Date(journeyStartDate)} // string -> Date
            onChange={d => dispatch(setJourneyStartDate(d.toISOString()))} // Date -> string
            minimumDate={new Date()}
          />
          <Text style={styles.helper}>Cannot be in the past</Text>
        </GradientCardHome>

        {/* CARD 2: North Star + Shadow Path */}
        <GradientCardHome style={{ marginVertical: vs(20), width: scale(330) }}>
          <View style={{ alignItems: 'center', marginBottom: s(10) }}>
            <Text style={styles.Sectitle}>
              {'Your 1-Year North Star (Highest\nVibration Goal) *'}
            </Text>
          </View>

          <GradientHintBox
            text={northStarPlaceholder}
            showInput
            inputValue={northStar}
            onChangeInputText={t => dispatch(setNorthStar(t))}
            inputProps={{
              multiline: true,
              textAlignVertical: 'top',
              style: { minHeight: scale(50) },
            }}
          />

          <View style={{ alignItems: 'center', marginVertical: s(15) }}>
            <Text style={styles.Sectitle}>
              {"Your 1-Year Shadow Path (What\nYou're Shifting Away From) *"}
            </Text>
          </View>

          <GradientHintBox
            text={shadowPathPlaceholder}
            showInput
            inputValue={shadowPath}
            onChangeInputText={t => dispatch(setShadowPath(t))}
            inputProps={{
              multiline: true,
              textAlignVertical: 'top',
              style: { minHeight: scale(50) },
            }}
          />
        </GradientCardHome>

        {/* CARD 3: Preferred Check-in Time */}
        <GradientCardHome style={{ marginBottom: vs(20), width: scale(330) }}>
          <Text style={[styles.cardTitle, { color: palette.white }]}>
            Preferred Check-in Time *
          </Text>

          <Text style={[styles.cardSub, { color: palette.white }]}>
            Choose a time when your day is winding down and you can self-reflect
            without distractions. This is your moment to honestly assess your
            beliefs and track your reality shift progress.
          </Text>

          {/* Preferred Check-in */}
          <GradientDatePicker
            mode="time"
            value={new Date(checkInTime)}
            onChange={d => dispatch(setCheckInTime(d.toISOString()))}
          />

          {/* DND row */}
          <View style={styles.row2}>
            <View style={styles.col}>
              <Text style={[styles.smallLabel, { color: palette.white }]}>
                Do Not Disturb Start
              </Text>
              <GradientDatePicker
                mode="time"
                value={new Date(dndStart)}
                onChange={d => dispatch(setDndStart(d.toISOString()))}
              />
            </View>

            <View style={styles.col}>
              <Text style={[styles.smallLabel, { color: palette.white }]}>
                Do Not Disturb End
              </Text>
              <GradientDatePicker
                mode="time"
                value={new Date(dndEnd)}
                onChange={d => dispatch(setDndEnd(d.toISOString()))}
              />
            </View>
          </View>

          <Text style={[styles.footNote, { color: palette.white }]}>
            Reminders will be sent every 30 minutes for 2 hours starting at your
            preferred check-in time. No reminders will be sent during Do Not
            Disturb hours.
          </Text>
        </GradientCardHome>

        <GradientToggleRow
          style={{ width: scale(370), marginBottom: vs(20) }}
          label="Allow Notifications"
          value={allowNotifications}
          onValueChange={v => dispatch(setAllowNotifications(v))}
        />

        <PrimaryButton
          disabled={!canContinue}
          backgroundColor={
            canContinue ? palette.white : 'rgba(255,255,255,0.3)'
          }
          textColor={canContinue ? palette.darkBlue : 'rgba(14,21,32,0.6)'}
          style={{ width: '95%', alignSelf: 'center' }}
          title="Continue to Shiftality Scan"
          onPress={() => {
            if (!canContinue) return; // double safety
            navigation.navigate('FinanceSurvey');
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: scale(30),
  },
  title: {
    color: '#FFFFFF',
    fontSize: ms(26),
    fontWeight: '800',
    textAlign: 'center',
    marginTop: vs(4),
    fontFamily: 'SourceSansPro-Regular',
  },
  Sectitle: {
    color: '#FFFFFF',
    fontSize: ms(22),
    fontWeight: '600',
    marginVertical: vs(4),
    fontFamily: 'SourceSansPro-Regular',
  },
  subtitle: {
    color: '#B0B6C3',
    fontSize: ms(14),
    textAlign: 'center',
    width: '80%',
    marginTop: vs(6),
    lineHeight: ms(20),
    fontFamily: 'SourceSansPro-Regular',
  },
  label: {
    color: '#FFFFFF',
    fontSize: ms(14),
    marginTop: vs(16),
    marginBottom: vs(6),
    fontWeight: '700',
    fontFamily: 'SourceSansPro-Regular',
  },
  helper: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: ms(12),
    marginTop: vs(6),
    fontFamily: 'SourceSansPro-Regular',
  },
  cardTitle: {
    fontSize: ms(22),
    fontWeight: '700',
    marginBottom: vs(8),
    fontFamily: 'SourceSansPro-Regular',
  },
  cardSub: {
    fontSize: ms(14),
    lineHeight: ms(20),
    marginBottom: vs(14),
    fontFamily: 'SourceSansPro-Regular',
  },
  row2: {
    flexDirection: 'row',
    gap: s(12),
    marginTop: vs(12),
  },
  col: {
    flex: 1,
  },
  smallLabel: {
    fontSize: ms(14),
    fontWeight: '700',
    marginBottom: vs(6),
    fontFamily: 'SourceSansPro-Regular',
  },
  footNote: {
    fontSize: ms(14),
    lineHeight: ms(20),
    marginTop: vs(16),
    fontFamily: 'SourceSansPro-Regular',
  },
});
