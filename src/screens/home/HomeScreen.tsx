// HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAppTheme } from '../../theme/ThemeProvider';
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
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { getProfile, updateProfile } from '../../lib/authService';
import { selectUser } from '../../store/reducers/profileReducer';
import GradientBackground from '../../components/GradientBackground';

export default function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useSelector(selectUser);
  const theme = useAppTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // Local state for form fields (from getProfile data)
  const [firstName, setFirstName] = useState('');
  const [timezone, setTimezone] = useState('');
  const [journeyStartDate, setJourneyStartDate] = useState(
    new Date().toISOString(),
  );
  const [northStar, setNorthStar] = useState('');
  const [shadowPath, setShadowPath] = useState('');
  const [checkInTime, setCheckInTime] = useState(new Date().toISOString());
  const [dndStart, setDndStart] = useState(new Date().toISOString());
  const [dndEnd, setDndEnd] = useState(new Date().toISOString());
  const [allowNotifications, setAllowNotifications] = useState(true);

  // Load profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userProfile = await getProfile();
        console.log('userProfile ==> ', userProfile);

        // Populate form fields from profile data
        if (userProfile?.profile?.first_name) {
          setFirstName(userProfile?.profile?.first_name);
        }
        if (userProfile?.profile?.timezone) {
          setTimezone(userProfile?.profile?.timezone);
        }
        if (userProfile?.profile?.journey_start_date) {
          setJourneyStartDate(
            new Date(userProfile?.profile?.journey_start_date).toISOString(),
          );
        }
        if (userProfile?.profile?.north_star) {
          setNorthStar(userProfile?.profile?.north_star);
        }
        if (userProfile?.profile?.shadow_path) {
          setShadowPath(userProfile?.profile?.shadow_path);
        }
        if (userProfile?.profile?.preferred_checkin_time) {
          // Convert HH:mm:ss format to ISO time string
          const today = new Date().toISOString().split('T')[0];
          setCheckInTime(
            new Date(
              `${today}T${userProfile?.profile?.preferred_checkin_time}`,
            ).toISOString(),
          );
        }
        if (userProfile?.profile?.settings?.dnd_start) {
          const today = new Date().toISOString().split('T')[0];
          setDndStart(
            new Date(
              `${today}T${userProfile?.profile?.settings?.dnd_start}`,
            ).toISOString(),
          );
        }
        if (userProfile?.profile?.settings?.dnd_end) {
          const today = new Date().toISOString().split('T')[0];
          // setDndEnd(
          //   new Date(
          //     `${today}T${userProfile?.profile?.settings?.dnd_end}`,
          //   ).toISOString(),
          // );
        }
        if (userProfile?.allow_notifications !== undefined) {
          setAllowNotifications(userProfile?.profile?.allow_notifications);
        }
      } catch (error: any) {
        console.error('Error loading profile:', error);
        Toast.show({
          type: 'error',
          text1: 'Load Failed',
          text2: error.message || 'Failed to load profile data',
        });
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadProfile();
  }, []);

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

  // Enhanced validation with error messages
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!isNameValid) {
      errors.firstName =
        trimmedName.length < 2
          ? 'First name must be at least 2 characters'
          : 'First name must be 20 characters or less';
    }

    if (!isTimezoneValid) {
      errors.timezone = 'Please select a timezone';
    }

    if (!isJourneyDateValid) {
      errors.journeyStartDate = 'Please select a journey start date';
    }
    //  else {
    //   // Check if date is in the past
    //   const journeyDate = new Date(journeyStartDate);
    //   const today = new Date();
    //   today.setHours(0, 0, 0, 0);
    //   if (journeyDate < today) {
    //     errors.journeyStartDate = 'Journey start date cannot be in the past';
    //   }
    // }

    if (!isNorthStarValid) {
      errors.northStar = 'Please describe your North Star goal';
    }

    if (!isShadowPathValid) {
      errors.shadowPath = 'Please describe your Shadow Path';
    }

    if (!isCheckInValid) {
      errors.checkInTime = 'Please select a check-in time';
    }

    if (!isDndStartValid) {
      errors.dndStart = 'Please select a Do Not Disturb start time';
    }

    if (!isDndEndValid) {
      errors.dndEnd = 'Please select a Do Not Disturb end time';
    }

    // Validate DND times make sense
    if (isDndStartValid && isDndEndValid) {
      const dndStartTime = new Date(dndStart);
      const dndEndTime = new Date(dndEnd);

      // Compare only time portion (hours and minutes)
      const startMinutes =
        dndStartTime.getHours() * 60 + dndStartTime.getMinutes();
      const endMinutes = dndEndTime.getHours() * 60 + dndEndTime.getMinutes();

      if (startMinutes >= endMinutes) {
        errors.dndTimes = 'Do Not Disturb end time must be after start time';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const canContinue =
    isNameValid &&
    isTimezoneValid &&
    isJourneyDateValid &&
    isNorthStarValid &&
    isShadowPathValid &&
    isCheckInValid &&
    isDndStartValid &&
    isDndEndValid;

  // Handle profile update
  const handleContinue = async () => {
    if (!canContinue || isLoading) return;

    // Clear previous validation errors
    setValidationErrors({});

    // Validate form
    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fix all errors before continuing',
      });
      return;
    }

    if (!user?.id) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'Please log in to continue',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Format dates/times for API
      const journeyDate = new Date(journeyStartDate);
      const checkIn = new Date(checkInTime);
      const dndStartTime = new Date(dndStart);
      const dndEndTime = new Date(dndEnd);

      // Extract time strings (HH:mm format)
      const formatTime = (date: Date): string => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      };

      // Prepare payload
      const payload = {
        first_name: trimmedName,
        timezone: timezone!,
        journey_start_date: journeyDate.toISOString().split('T')[0], // YYYY-MM-DD
        north_star: northStar.trim(),
        shadow_path: shadowPath.trim(),
        check_in_time: formatTime(checkIn),
        dnd_start: formatTime(dndStartTime),
        dnd_end: formatTime(dndEndTime),
        allow_notifications: allowNotifications,
      };

      await updateProfile(payload);

      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile has been updated successfully',
      });

      // Navigate to next screen after successful update
      setTimeout(() => {
        navigation.navigate('FinanceSurvey');
      }, 500);
    } catch (error: any) {
      console.error('Profile update error:', error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error.message || 'Failed to update profile. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GradientBackground>
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.root}>
          <GradientCardHome style={{ marginTop: vs(50), width: scale(330) }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Welcome to Shiftality
              </Text>
              <Text
                style={[styles.subtitle, { color: theme.colors.textMuted }]}
              >
                {"Let's set up your personalized reality\nshift journey"}
              </Text>
            </View>

            {/* Name */}
            <Text style={[styles.label, { color: theme.colors.text }]}>
              First Name
            </Text>
            <GradientInput
              minHeight={vs(45)}
              placeholder="Enter Your Name"
              value={firstName}
              onChangeText={(t: string) => setFirstName(t)}
            />
            {validationErrors.firstName && (
              <Text style={styles.errorText}>{validationErrors.firstName}</Text>
            )}
            <Text style={[styles.helper, { color: theme.colors.textMuted }]}>
              2–20 Characters
            </Text>

            {/* Time Zone */}
            <Text
              style={[
                styles.label,
                { marginTop: vs(18), color: theme.colors.text },
              ]}
            >
              Time Zone
            </Text>
            <GradientTimezoneSelect
              value={timezone}
              onChange={tz => setTimezone(tz)}
            />
            {validationErrors.timezone && (
              <Text style={styles.errorText}>{validationErrors.timezone}</Text>
            )}

            {/* Journey Start Date */}
            <Text
              style={[
                styles.label,
                { marginTop: vs(18), color: theme.colors.text },
              ]}
            >
              Journey Start Date *
            </Text>
            <GradientDatePicker
              value={new Date(journeyStartDate)} // string -> Date
              onChange={d => setJourneyStartDate(d.toISOString())} // Date -> string
              minimumDate={new Date()}
            />
            <Text style={[styles.helper, { color: theme.colors.textMuted }]}>
              Cannot be in the past
            </Text>
            {validationErrors.journeyStartDate && (
              <Text style={styles.errorText}>
                {validationErrors.journeyStartDate}
              </Text>
            )}
          </GradientCardHome>

          {/* CARD 2: North Star + Shadow Path */}
          <GradientCardHome
            style={{ marginVertical: vs(20), width: scale(330) }}
          >
            <View style={{ alignItems: 'center', marginBottom: s(10) }}>
              <Text style={[styles.Sectitle, { color: theme.colors.text }]}>
                {'Your 1-Year North Star (Highest\nVibration Goal) *'}
              </Text>
            </View>

            <GradientHintBox
              text={northStarPlaceholder}
              showInput
              inputValue={northStar}
              onChangeInputText={t => setNorthStar(t)}
              inputProps={{
                multiline: true,
                textAlignVertical: 'top',
                style: { minHeight: scale(50) },
              }}
            />
            {validationErrors.northStar && (
              <Text style={[styles.errorText, { marginTop: vs(8) }]}>
                {validationErrors.northStar}
              </Text>
            )}

            <View style={{ alignItems: 'center', marginVertical: s(15) }}>
              <Text style={[styles.Sectitle, { color: theme.colors.text }]}>
                {"Your 1-Year Shadow Path (What\nYou're Shifting Away From) *"}
              </Text>
            </View>

            <GradientHintBox
              text={shadowPathPlaceholder}
              showInput
              inputValue={shadowPath}
              onChangeInputText={t => setShadowPath(t)}
              inputProps={{
                multiline: true,
                textAlignVertical: 'top',
                style: { minHeight: scale(50) },
              }}
            />
            {validationErrors.shadowPath && (
              <Text style={[styles.errorText, { marginTop: vs(8) }]}>
                {validationErrors.shadowPath}
              </Text>
            )}
          </GradientCardHome>

          {/* CARD 3: Preferred Check-in Time */}
          <GradientCardHome style={{ marginBottom: vs(20), width: scale(330) }}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Preferred Check-in Time *
            </Text>

            <Text style={[styles.cardSub, { color: theme.colors.textMuted }]}>
              Choose a time when your day is winding down and you can
              self-reflect without distractions. This is your moment to honestly
              assess your beliefs and track your reality shift progress.
            </Text>

            {/* Preferred Check-in */}
            <GradientDatePicker
              mode="time"
              value={new Date(checkInTime)}
              onChange={d => setCheckInTime(d.toISOString())}
            />
            {validationErrors.checkInTime && (
              <Text style={styles.errorText}>
                {validationErrors.checkInTime}
              </Text>
            )}

            {/* DND row */}
            <View style={styles.row2}>
              <View style={styles.col}>
                <Text style={[styles.smallLabel, { color: theme.colors.text }]}>
                  Do Not Disturb Start
                </Text>
                <GradientDatePicker
                  mode="time"
                  value={new Date(dndStart)}
                  onChange={d => setDndStart(d.toISOString())}
                />
              </View>

              <View style={styles.col}>
                <Text style={[styles.smallLabel, { color: theme.colors.text }]}>
                  Do Not Disturb End
                </Text>
                <GradientDatePicker
                  mode="time"
                  value={new Date(dndEnd)}
                  onChange={d => setDndEnd(d.toISOString())}
                />
              </View>
            </View>
            {validationErrors.dndTimes && (
              <Text style={[styles.errorText, { marginTop: vs(8) }]}>
                {validationErrors.dndTimes}
              </Text>
            )}

            <Text style={[styles.footNote, { color: theme.colors.textMuted }]}>
              Reminders will be sent every 30 minutes for 2 hours starting at
              your preferred check-in time. No reminders will be sent during Do
              Not Disturb hours.
            </Text>
          </GradientCardHome>

          <GradientToggleRow
            style={{ width: scale(370), marginBottom: vs(20) }}
            label="Allow Notifications"
            value={allowNotifications}
            onValueChange={v => setAllowNotifications(v)}
          />

          <PrimaryButton
            disabled={!canContinue || isLoading}
            loading={isLoading}
            style={{ width: '95%', alignSelf: 'center' }}
            title="Continue to Shiftality Scan"
            onPress={handleContinue}
          />
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: scale(30),
  },
  title: {
    fontSize: ms(26),
    fontWeight: '800',
    textAlign: 'center',
    marginTop: vs(4),
    fontFamily: 'SourceSansPro-Regular',
  },
  Sectitle: {
    fontSize: ms(22),
    fontWeight: '600',
    marginVertical: vs(4),
    fontFamily: 'SourceSansPro-Regular',
  },
  subtitle: {
    fontSize: ms(14),
    textAlign: 'center',
    width: '80%',
    marginTop: vs(6),
    lineHeight: ms(20),
    fontFamily: 'SourceSansPro-Regular',
  },
  label: {
    fontSize: ms(14),
    marginTop: vs(16),
    marginBottom: vs(6),
    fontWeight: '700',
    fontFamily: 'SourceSansPro-Regular',
  },
  helper: {
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
  errorText: {
    color: '#EF4444',
    fontSize: ms(12),
    marginTop: vs(4),
    fontFamily: 'SourceSansPro-Regular',
  },
});
