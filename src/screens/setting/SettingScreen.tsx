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
import { useAppTheme, useThemeMode } from '../../theme/ThemeProvider';
import { useFontSize } from '../../theme/FontSizeProvider';
import GradientCardHome from '../../components/GradientCardHome';
import { ms, s, scale, vs } from 'react-native-size-matters';
import GradientHintBox from '../../components/GradientHintBox';
import GradientHintBoxVibe from '../../components/GradientHintBoxVibe';
import PrimaryButton from '../../components/PrimaryButton';
import GradientSelect from '../../components/GradientSelect';
import LinearGradient from 'react-native-linear-gradient';
import GradientBackground from '../../components/GradientBackground';
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
import { getProfile } from '../../lib/authService';

import Toast from 'react-native-toast-message';
import { logout } from '../../lib/authService';
import { clearProfile } from '../../store/reducers/profileReducer';

const themeOptions = ['System', 'Light', 'Dark'];
const fontSizeOptions = ['Small', 'Normal', 'Large'];

export default function SettingScreen() {
  const theme = useAppTheme();
  const { themeMode, setThemeMode } = useThemeMode();
  const { fontSize, setFontSize, scaledFontSize } = useFontSize();
  const isDark = themeMode === 'dark';
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const onboarding = useSelector(selectHomeOnboarding);
  const beliefProfile = useSelector(selectBeliefProfile);

  const [reflectionEnabled, setReflectionEnabled] = useState(true);

  // Profile data from API
  const [firstName, setFirstName] = useState('');
  const [northStar, setNorthStar] = useState('');
  const [shadowPath, setShadowPath] = useState('');
  const [archetype, setArchetype] = useState('');
  const [baselineIndex, setBaselineIndex] = useState<number | null>(null);

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userProfile = await getProfile();
        console.log('userProfile in setting ==> ', userProfile);

        if (userProfile?.profile?.first_name) {
          setFirstName(userProfile?.profile?.first_name);
        }
        if (userProfile?.profile?.highest_text) {
          setNorthStar(userProfile.profile.highest_text);
        }
        if (userProfile?.profile?.lowest_text) {
          setShadowPath(userProfile.profile.lowest_text);
        }
        if (userProfile?.profile?.archetype) {
          setArchetype(userProfile.profile.archetype);
        }
        if (userProfile?.profile?.baseline_index) {
          setBaselineIndex(userProfile.profile.baseline_index);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    loadProfile();
  }, []);

  // Sync themeVal with current theme mode
  const [themeVal, setThemeVal] = useState<string>(
    themeMode === 'dark' ? 'Dark' : 'Light',
  );
  const [colorBlind, setColorBlind] = useState<boolean>(true);
  const [reminder, setReminder] = useState<boolean>(true);

  // Update themeVal when themeMode changes
  useEffect(() => {
    setThemeVal(themeMode === 'dark' ? 'Dark' : 'Light');
  }, [themeMode]);

  // Handle theme change
  const handleThemeChange = (value: string) => {
    setThemeVal(value);
    if (value === 'Light') {
      setThemeMode('light');
    } else if (value === 'Dark') {
      setThemeMode('dark');
    } else if (value === 'System') {
      // For System, default to dark (or you can implement system detection)
      setThemeMode('dark');
    }
  };

  // Handle font size change
  const handleFontSizeChange = (value: string) => {
    if (value === 'Small' || value === 'Normal' || value === 'Large') {
      setFontSize(value);
    }
  };

  // Format baseline index for display
  const baselineIndexStr =
    baselineIndex != null ? `${Math.round(baselineIndex)}/100` : '—';
  const archeypeDisplay = archetype || 'Balanced Explorer';

  return (
    <GradientBackground>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          alignItems: 'center',
          paddingTop: scale(20),
          paddingBottom: scale(20),
        }}
        showsVerticalScrollIndicator={false}
      >
        <GradientCardHome style={{ width: scale(330) }}>
          <Text
            style={[
              styles.title,
              { color: theme.colors.text, fontSize: scaledFontSize(18) },
            ]}
          >
            Settings
          </Text>
          <Text
            style={[
              styles.subTitle,
              { color: theme.colors.textMuted, fontSize: scaledFontSize(16) },
            ]}
          >
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
            text={`Based on your 30-item Shiftality Scan.\nYour archetype: ${archeypeDisplay}`}
            secondaryText={baselineIndexStr}
            footerActionLabel="Retake Shiftality Scan"
            footerIcon={require('../../assets/clear_choices.png')}
            onPressFooterAction={() => {
              (navigation as any).navigate('Main', { screen: 'Search' });
            }}
          />
        </GradientCardHome>

        <View style={{ height: scale(20) }} />

        {/* Daily Belief Set intro card */}
        <GradientCardHome style={{ width: scale(330) }}>
          <Text
            style={[
              styles.title,
              { color: theme.colors.text, fontSize: scaledFontSize(18) },
            ]}
          >
            Daily Belief Set
          </Text>
          <Text
            style={[
              styles.subTitle,
              { color: theme.colors.textMuted, fontSize: scaledFontSize(16) },
            ]}
          >
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
          switchTrackOn={isDark ? '#50B9FF' : theme.colors.primary}
          switchTrackOff={isDark ? '#2E3A49' : '#E5E7EB'}
          switchThumb="#FFFFFF"
        />
        <View style={{ height: scale(20) }} />

        <GradientCardHome style={{ width: scale(330) }}>
          <Text
            style={[
              styles.title,
              { color: theme.colors.text, fontSize: scaledFontSize(18) },
            ]}
          >
            Appearance
          </Text>
          <Text
            style={[
              styles.subTitle,
              { color: theme.colors.textMuted, fontSize: scaledFontSize(16) },
            ]}
          >
            Customize the look and feel of your app
          </Text>

          {/* Theme */}
          <Text
            style={[
              styles.label,
              { color: theme.colors.text, fontSize: scaledFontSize(14) },
            ]}
          >
            Theme
          </Text>
          <GradientSelect
            value={themeVal}
            options={themeOptions}
            onChange={handleThemeChange}
            sheetTitle="Select Theme"
            containerStyle={{ marginTop: s(8) }}
          />

          {/* Font size */}
          <Text
            style={[
              styles.label,
              {
                marginTop: s(18),
                color: theme.colors.text,
                fontSize: scaledFontSize(14),
              },
            ]}
          >
            Font size
          </Text>
          <GradientSelect
            value={fontSize}
            options={fontSizeOptions}
            onChange={handleFontSizeChange}
            sheetTitle="Select Font Size"
            containerStyle={{ marginTop: s(8) }}
          />

          {/* Color-blind Mode */}
          {/* <View
            style={{
              marginTop: s(20),
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={[styles.sectionHeading, { color: theme.colors.text, fontSize: scaledFontSize(16) }]}>
              Color-blind Mode
            </Text>
            <View style={styles.switchRow}>
              <Switch
                value={colorBlind}
                onValueChange={setColorBlind}
                trackColor={{
                  false: isDark ? '#243447' : '#E5E7EB',
                  true: isDark ? '#62C1FF' : theme.colors.primary,
                }}
                thumbColor={
                  colorBlind ? '#FFFFFF' : isDark ? '#B0C6DB' : '#9CA3AF'
                }
                ios_backgroundColor={isDark ? '#243447' : '#E5E7EB'}
              />
            </View>
          </View>
          <Text style={[styles.helper, { color: theme.colors.textMuted, fontSize: scaledFontSize(16) }]}>
            Use blue/orange instead of green/red colors
          </Text> */}
        </GradientCardHome>

        <View style={{ height: scale(20) }} />

        <GradientCardHome style={{ width: scale(330) }}>
          <Text
            style={[
              styles.title,
              { color: theme.colors.text, fontSize: scaledFontSize(18) },
            ]}
          >
            Export All Data
          </Text>
          <Text
            style={[
              styles.subTitle,
              { color: theme.colors.textMuted, fontSize: scaledFontSize(16) },
            ]}
          >
            Downloads a JSON file with your profile, Shiftality Scan results,
            check-ins, and reflections
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => console.log('Export Data')}
            style={{ marginTop: vs(12) }}
          >
            <LinearGradient
              colors={theme.colors.cardGradient}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.cta}
            >
              <Text
                style={[
                  styles.ctaText,
                  { color: theme.colors.text, fontSize: scaledFontSize(18) },
                ]}
              >
                Export Data
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </GradientCardHome>
        <View style={{ height: scale(20) }} />
        <GradientCardHome style={{ width: scale(330) }}>
          <Text
            style={[
              styles.title,
              { color: theme.colors.text, fontSize: scaledFontSize(18) },
            ]}
          >
            Reminders
          </Text>
          <Text
            style={[
              styles.subTitle,
              { color: theme.colors.textMuted, fontSize: scaledFontSize(16) },
            ]}
          >
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
            <Text
              style={[
                styles.title,
                { color: theme.colors.text, fontSize: scaledFontSize(18) },
              ]}
            >
              Enable Reminders
            </Text>
            <Switch
              value={reminder}
              onValueChange={setReminder}
              trackColor={{
                false: isDark ? '#243447' : '#E5E7EB',
                true: isDark ? '#62C1FF' : theme.colors.primary,
              }}
              thumbColor={reminder ? '#FFFFFF' : isDark ? '#B0C6DB' : '#9CA3AF'}
              ios_backgroundColor={isDark ? '#243447' : '#E5E7EB'}
            />
          </View>
          <Text
            style={[
              styles.subTitle,
              { color: theme.colors.textMuted, fontSize: scaledFontSize(16) },
            ]}
          >
            Get notified if you haven't completed your daily check-in
          </Text>
        </GradientCardHome>

        <View style={{ height: scale(20) }} />

        {/* Shared Reminder Test component (same as DemoScreen) */}
        <ReminderTestSection cardStyle={{ width: scale(330) }} />
        <View style={{ height: scale(20) }} />
        <PrimaryButton
          style={{
            width: '50%',
            height: 'auto',
            // marginTop: scale(20),
            alignSelf: 'center',
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
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
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
  label: {
    fontSize: s(14),
    fontWeight: '800',
    fontFamily: 'SourceSansPro-Regular',
  },
  sectionHeading: {
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
    fontSize: ms(18),
    fontWeight: '700',
    opacity: 0.9,
    fontFamily: 'SourceSansPro-Regular',
  },
  rightIcon: { width: s(25), height: s(25), marginBottom: scale(20) },
});
