// src/screens/SearchScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { palette } from '../../theme';
import GradientCardHome from '../../components/GradientCardHome';
import { ms, s, scale, vs } from 'react-native-size-matters';
import GradientHintBox from '../../components/GradientHintBox';
import GradientHintBoxVibe from '../../components/GradientHintBoxVibe';
import PrimaryButton from '../../components/PrimaryButton';
import GradientSelect from '../../components/GradientSelect';
import LinearGradient from 'react-native-linear-gradient';
import {
  selectHomeOnboarding,
  setArchetype,
  setBaselineIndex,
} from '../../store/reducers/homeOnboardingReducer';
import { useDispatch, useSelector } from 'react-redux';
import BeliefsEditor from '../../components/BeliefsEditor';
import ReminderTestSection from '../../components/ReminderTestSection';
import { selectBeliefProfile } from '../../store/reducers/surveyReducer';
import { useNavigation } from '@react-navigation/native';

import Toast from 'react-native-toast-message';
import { logout } from '../../lib/authService';
import { clearProfile } from '../../store/reducers/profileReducer';

const themeOptions = ['System', 'Light', 'Dark'];
const fontSizeOptions = ['Small', 'Normal', 'Large'];

export default function SettingScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const onboarding = useSelector(selectHomeOnboarding);
  const beliefProfile = useSelector(selectBeliefProfile);

  console.log('onboarding ==> ', onboarding);

  const [reflectionEnabled, setReflectionEnabled] = useState(true);

  const [firstName, setFirstName] = useState(onboarding.firstName ?? '');

  const [northStar, setNorthStar] = useState(
    onboarding.northStar || 'Describe your highest vibe...',
  );

  const [shadowPath, setShadowPath] = useState(
    onboarding.shadowPath || 'Describe the patterns you want to transform...',
  );

  const [themeVal, setThemeVal] = useState<string>('System');
  const [fontVal, setFontVal] = useState<string>('Normal');
  const [colorBlind, setColorBlind] = useState<boolean>(true);
  const [reminder, setReminder] = useState<boolean>(true);

  useEffect(() => {
    // Only update if we have a meaningful index
    if (beliefProfile.overallIndex > 0) {
      dispatch(setBaselineIndex(beliefProfile.overallIndex));
      dispatch(setArchetype(beliefProfile.archetype));
    }
  }, [beliefProfile.overallIndex, beliefProfile.archetype, dispatch]);

  console.log('baselineIndex', onboarding?.baselineIndex);
  console.log('archetype', onboarding?.archetype);

  const archetype = onboarding?.archetype || 'Balanced Explorer';
  const baselineIndexStr =
    onboarding?.baselineIndex != null
      ? `${Math.round(onboarding.baselineIndex)}/100`
      : '—';

  return (
    <View style={styles.root}>
      <ScrollView
        style={{ backgroundColor: palette.darkBlue, marginVertical: scale(50) }}
        showsVerticalScrollIndicator={false}
      >
        <GradientCardHome style={{ width: scale(330) }}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subTitle}>
            Customize your shiftality experience
          </Text>
          <View style={{ height: scale(10) }} />
          <GradientHintBox
            inputProps={{
              multiline: true,
              textAlignVertical: 'top',
              style: { minHeight: scale(50) },
            }}
            title="Profile Information"
            text="Update your personal information."
            showInput
            inputLabel="First Name"
            inputPlaceholder="Enter Your Name"
            inputValue={firstName}
            onChangeInputText={setFirstName}
          />
          <View style={{ height: scale(20) }} />
          <GradientHintBoxVibe
            title="Your Vibration text"
            description="Edit your highest Vibe (North Star) and show path any time."
            fields={[
              {
                label: 'Highest Vibe ( North Star )',
                value: northStar,
                onChangeText: setNorthStar,
                placeholder: 'Describe your highest vibe...',
                maxLength: 500,
                helper: 'What does your best self look like?',
              },
              {
                label: 'Shadow Path',
                value: shadowPath,
                onChangeText: setShadowPath,
                placeholder: 'Describe the patterns you want to transform...',
                maxLength: 500,
                helper: 'What patterns do you want to transform?',
              },
            ]}
          />
          <View style={{ height: scale(20) }} />
          <GradientHintBox
            title="Your Belief Profile"
            text={
              'Based on your 30-item Shiftality Scan.\nYour archetype: Balanced Explorer'
            }
            secondaryText={baselineIndexStr}
            footerActionLabel="Retake Shiftality Scan"
            footerIcon={require('../../assets/clear_choices.png')}
            onPressFooterAction={() => {
              navigation.navigate('Main', { screen: 'Search' });
            }}
          />
        </GradientCardHome>

        <View style={{ height: scale(20) }} />

        {/* Daily Belief Set intro card */}
        <GradientCardHome style={{ width: scale(330) }}>
          <Text style={styles.title}>Daily Belief Set</Text>
          <Text style={styles.subTitle}>
            {'Manage your empowering and shadow\nbeliefs for daily tracking'}
          </Text>
        </GradientCardHome>

        {/* Shared beliefs editor (same as ProfileScreen) */}
        <BeliefsEditor cardStyle={{ width: scale(330) }} />

        <View style={{ height: scale(20) }} />

        <GradientHintBox
          title="Reflection"
          text={'Add mood, energy, and notes to your daily\ncheck-ins'}
        />
        <View style={{ height: scale(20) }} />

        <GradientHintBox
          style={{ width: scale(330) }}
          title="Reflection (optional)"
          text={
            "When enabled, you'll see Mood (1-5), Energy (1-5),and Note fields on Today's Shift\n\nWhen enabled, you'll see Mood (1-5), Energy (1-5), and Note fields on Today's Shift"
          }
          showSwitch
          switchValue={reflectionEnabled}
          onToggleSwitch={setReflectionEnabled}
          switchTrackOn="#50B9FF"
          switchTrackOff="#2E3A49"
          switchThumb="#FFFFFF"
        />
        <View style={{ height: scale(20) }} />

        <GradientCardHome style={{ width: scale(330) }}>
          <Text style={styles.title}>Appearance</Text>
          <Text style={styles.subTitle}>
            Customize the look and feel of your app
          </Text>

          {/* Theme */}
          <Text style={styles.label}>Theme</Text>
          <GradientSelect
            value={themeVal}
            options={themeOptions}
            onChange={setThemeVal}
            sheetTitle="Select Theme"
            containerStyle={{ marginTop: s(8) }}
          />

          {/* Font size */}
          <Text style={[styles.label, { marginTop: s(18) }]}>Font size</Text>
          <GradientSelect
            value={fontVal}
            options={fontSizeOptions}
            onChange={setFontVal}
            sheetTitle="Select Font Size"
            containerStyle={{ marginTop: s(8) }}
          />

          {/* Color-blind Mode */}
          <View
            style={{
              marginTop: s(20),
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={styles.sectionHeading}>Color-blind Mode</Text>
            <View style={styles.switchRow}>
              <Switch
                value={colorBlind}
                onValueChange={setColorBlind}
                trackColor={{ false: '#243447', true: '#62C1FF' }}
                thumbColor={colorBlind ? '#FFFFFF' : '#B0C6DB'}
                ios_backgroundColor="#243447"
              />
            </View>
          </View>
          <Text style={styles.helper}>
            Use blue/orange instead of green/red colors
          </Text>
        </GradientCardHome>

        <View style={{ height: scale(20) }} />

        <GradientCardHome style={{ width: scale(330) }}>
          <Text style={styles.title}>Export All Data</Text>
          <Text style={styles.subTitle}>
            Downloads a JSON file with your profile, Shiftality Scan results,
            check-ins, and reflections
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => console.log('Export Data')}
            style={{ marginTop: vs(12) }}
          >
            <LinearGradient
              colors={['#143f65ff', '#1C2A3A']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.cta}
            >
              <Text style={styles.ctaText}>Export Data</Text>
            </LinearGradient>
          </TouchableOpacity>
        </GradientCardHome>
        <View style={{ height: scale(20) }} />
        <GradientCardHome style={{ width: scale(330) }}>
          <Text style={styles.title}>Reminders</Text>
          <Text style={styles.subTitle}>
            Test reminder notifications and system functionality
          </Text>
          <View
            style={{
              flexDirection: 'row',
              marginTop: scale(30),
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={styles.title}>Enable Reminders</Text>
            <Switch
              value={reminder}
              onValueChange={setReminder}
              trackColor={{ false: '#243447', true: '#62C1FF' }}
              thumbColor={colorBlind ? '#FFFFFF' : '#B0C6DB'}
              ios_backgroundColor="#243447"
            />
          </View>
          <Text style={styles.subTitle}>
            Get notified if you haven't completed your daily check-in
          </Text>
        </GradientCardHome>

        <View style={{ height: scale(20) }} />

        {/* Shared Reminder Test component (same as DemoScreen) */}
        <ReminderTestSection cardStyle={{ width: scale(330) }} />
        <PrimaryButton
          textColor={palette.white}
          style={{
            width: '50%',
            height: 'auto',
            alignSelf: 'center',
            textAlign: 'center',
            color: palette.white,
            fontSize: ms(14.5),
            fontFamily: 'SourceSansPro-Regular',
            fontWeight: '700',
            opacity: 0.9,
          }}
          title="Logout"
          onPress={async () => {
            try {
              // Clear auth data from AsyncStorage
              await logout();

              // Clear profile from Redux
              dispatch(clearProfile());

              // Show success message
              Toast.show({
                type: 'success',
                text1: 'Logged out',
                text2: 'You have been successfully logged out',
              });

              // Navigate to auth screen
              // The RootNavigator will automatically show Auth stack when isAuthenticated is false
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Logout failed',
                text2: error.message || 'An error occurred while logging out',
              });
            }
          }}
        />
        <View style={{ height: scale(40) }} />
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
  label: {
    color: palette.white,
    fontSize: s(14),
    fontWeight: '800',
    fontFamily: 'SourceSansPro-Regular',
  },
  sectionHeading: {
    color: palette.white,
    fontSize: s(16),
    fontWeight: '800',
    marginBottom: s(10),
    fontFamily: 'SourceSansPro-Regular',
  },
  switchRow: {
    alignItems: 'flex-end',
    marginBottom: s(8),
  },
  helper: {
    color: palette.white,
    opacity: 0.9,
    fontSize: s(16),
    lineHeight: s(24),
    fontFamily: 'SourceSansPro-Regular',
  },
  cta: {
    width: '100%',
    height: vs(38),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: s(30),
  },
  ctaText: {
    color: palette.txtBlue,
    fontSize: ms(18),
    fontWeight: '700',
    opacity: 0.9,
    fontFamily: 'SourceSansPro-Regular',
  },
  rightIcon: { width: s(25), height: s(25), marginBottom: scale(20) },
});
