import React, { useEffect, useState } from 'react';
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
import { AuthStackParamList } from '../../navigation/AuthStack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useSelector } from 'react-redux';
import { selectTotalSurveyPoints } from '../../store/surveyReducer';

export default function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [name, setName] = useState('');
  const [allowNotifs, setAllowNotifs] = useState(true);
  const [tz, setTz] = useState<string | undefined>();
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // --- add these 3 states near your other useStates ---
  const [checkInDate, setCheckInDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [dndStart, setDndStart] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [dndEnd, setDndEnd] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

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
            value={name}
            onChangeText={setName}
          />
          <Text style={styles.helper}>2–20 Characters</Text>

          {/* Time Zone */}
          <Text style={[styles.label, { marginTop: vs(18) }]}>Time Zone</Text>
          <GradientTimezoneSelect value={tz} onChange={setTz} />

          {/* Journey Start Date */}
          <Text style={[styles.label, { marginTop: vs(18) }]}>
            Journey Start Date *
          </Text>
          <GradientDatePicker
            value={date}
            onChange={setDate}
            minimumDate={new Date()}
          />
          <Text style={styles.helper}>Cannot be in the past</Text>
        </GradientCardHome>

        {/* <GradientCardHome style={{ marginVertical: vs(50), width: scale(330) }}>
          <View style={{ alignItems: 'center' ,marginBottom:scale(10)}}>
            <Text style={styles.Sectitle}>{"Your 1-Year North Star (Highest\nVibration Goal) *"}</Text>
          </View>
          <GradientInput
            height={scale(100)}
            placeholder={"Paint the picture of where you'll be in one\nyear-your highest potential reality, the version\nof yourself you're shifting toward ..."}
            disabled
          />
          <View style={{ alignItems: 'center',marginVertical:scale(15) }}>
            <Text style={styles.Sectitle}>{"Your 1-Year North Star (Highest\nVibration Goal) *"}</Text>
          </View>
          <GradientInput
            height={scale(100)}
            placeholder={"Paint the picture of where you'll be in one\nyear-your highest potential reality, the version\nof yourself you're shifting toward ..."}
            disabled
          />

        </GradientCardHome> */}
        <GradientCardHome style={{ marginVertical: vs(20), width: scale(330) }}>
          <View style={{ alignItems: 'center', marginBottom: s(10) }}>
            <Text style={styles.Sectitle}>
              {'Your 1-Year North Star (Highest\nVibration Goal) *'}
            </Text>
          </View>

          <GradientHintBox
            text={
              "Paint the picture of where you'll be in one year—your highest potential reality, the version of yourself you're shifting toward …"
            }
          />

          <View style={{ alignItems: 'center', marginVertical: s(15) }}>
            <Text style={styles.Sectitle}>
              {"Your 1-Year Shadow Path (What\nYou're Shifting Away From) *"}
            </Text>
          </View>

          <GradientHintBox
            text={
              "Describe the patterns, habits, or reality you're leaving behind—what your life looks like in one year if nothing shifts…"
            }
          />
        </GradientCardHome>

        {/* --------- CARD 3: Preferred Check-in Time --------- */}
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
            value={checkInDate}
            onChange={setCheckInDate}
            minimumDate={new Date()}
          />

          {/* DND row */}
          <View style={styles.row2}>
            <View style={styles.col}>
              <Text style={[styles.smallLabel, { color: palette.white }]}>
                Do Not Disturb Start
              </Text>
              <GradientDatePicker
                value={dndStart}
                onChange={setDndStart}
                minimumDate={new Date()}
              />
            </View>

            <View style={styles.col}>
              <Text style={[styles.smallLabel, { color: palette.white }]}>
                Do Not Disturb End
              </Text>
              <GradientDatePicker
                value={dndEnd}
                onChange={setDndEnd}
                minimumDate={new Date()}
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
          value={allowNotifs}
          onValueChange={setAllowNotifs}
        />
        <PrimaryButton
          backgroundColor={palette.white}
          textColor={palette.darkBlue}
          style={{ width: '95%', alignSelf: 'center' }}
          title="Continue to Shiftality Scan"
          onPress={() => {
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
