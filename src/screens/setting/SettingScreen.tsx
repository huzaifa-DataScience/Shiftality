// src/screens/SearchScreen.tsx
import React, { useState } from 'react';
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
import FastImage from 'react-native-fast-image';
import ReminderPills from '../../components/ReminderPills';

const themeOptions = ['System', 'Light', 'Dark'];
const fontSizeOptions = ['Small', 'Normal', 'Large'];

export default function SettingScreen() {
  const [firstName, setFirstName] = useState('');
  const [reflectionEnabled, setReflectionEnabled] = useState(true);

  const [northStar, setNorthStar] = useState(
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
  );
  const [shadowPath, setShadowPath] = useState(
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
  );

  const [themeVal, setThemeVal] = useState<string>('System');
  const [fontVal, setFontVal] = useState<string>('Normal');
  const [colorBlind, setColorBlind] = useState<boolean>(true);
  const [reminder, setReminder] = useState<boolean>(true);
  const [which, setWhich] = useState<number | null>(0);

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
            secondaryText={`Baseline Shift Index 53 / 100`}
            footerActionLabel="Retake Shiftality Scan"
            footerIcon={require('../../assets/clear_choices.png')}
            onPressFooterAction={() => {
              // open retake flow
            }}
          />
        </GradientCardHome>
        <View style={{ height: scale(20) }} />
        <GradientCardHome style={{ width: scale(330) }}>
          <Text style={styles.title}>Daily Belief Set</Text>
          <Text style={styles.subTitle}>
            {'Manage your empowering and shadow\nbeliefs for daily tracking'}
          </Text>
          <View style={{ height: scale(20) }} />
          <Text style={styles.title}>Empowering Beliefs (YES = +1)</Text>
          <GradientHintBox
            text={
              'Today, I believed I deserve to be well-paid for the value I create'
            }
            showRecommendedChip
            showEditButton
            editIcon={require('../../assets/edit.png')}
            onPressEdit={() => {}}
          />
          <View style={{ height: scale(10) }} />
          <GradientHintBox
            text={
              'Today, I believed I deserve to be well-paid for the value I create'
            }
            showRecommendedChip
            showEditButton
            editIcon={require('../../assets/edit.png')}
            onPressEdit={() => {}}
          />
          <View style={{ height: scale(10) }} />
          <GradientHintBox
            text={
              'Today, I believed I deserve to be well-paid for the value I create'
            }
            showRecommendedChip
            showEditButton
            editIcon={require('../../assets/edit.png')}
            onPressEdit={() => {}}
          />
          <View style={{ height: scale(10) }} />
          <GradientHintBox
            text={
              'Today, I believed I deserve to be well-paid for the value I create'
            }
            showRecommendedChip
            showEditButton
            editIcon={require('../../assets/edit.png')}
            onPressEdit={() => {}}
          />
          <View style={{ height: scale(10) }} />
          <GradientHintBox
            text={
              'Today, I believed I deserve to be well-paid for the value I create'
            }
            showRecommendedChip
            showEditButton
            editIcon={require('../../assets/edit.png')}
            onPressEdit={() => {}}
          />
          <View style={{ height: scale(10) }} />
          <GradientHintBox
            text={
              'Today, I believed I deserve to be well-paid for the value I create'
            }
            showRecommendedChip
            showEditButton
            editIcon={require('../../assets/edit.png')}
            onPressEdit={() => {}}
          />
          <View style={{ height: scale(10) }} />
          <Text style={styles.title}>Shadow Beliefs (YES = -1)</Text>

          <GradientHintBox
            text={
              'Today, I believed I deserve to be well-paid for the value I create'
            }
            showRecommendedChip
            showEditButton
            editIcon={require('../../assets/edit.png')}
            onPressEdit={() => {}}
          />
          <View style={{ height: scale(10) }} />
          <GradientHintBox
            text={
              'Today, I believed I deserve to be well-paid for the value I create'
            }
            showRecommendedChip
            showEditButton
            editIcon={require('../../assets/edit.png')}
            onPressEdit={() => {}}
          />
          <View style={{ height: scale(10) }} />
          <GradientHintBox
            text={
              'Today, I believed I deserve to be well-paid for the value I create'
            }
            showRecommendedChip
            showEditButton
            editIcon={require('../../assets/edit.png')}
            onPressEdit={() => {}}
          />
          <View style={{ height: scale(15) }} />

          <PrimaryButton
            textColor={palette.white}
            style={{
              width: '100%',
              height: 'auto',
              fontSize: ms(14.5),
              fontWeight: '700',
            }}
            title={'Add Custom Shadow Beliefs '}
            onPress={() => console.log('Start')}
          />
        </GradientCardHome>
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
        <GradientCardHome style={{ width: scale(330) }}>
          <Text style={styles.title}>Reminders</Text>
          <Text style={styles.subTitle}>
            Test reminder notifications and system functionality
          </Text>
          <View style={{ height: scale(20) }} />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.title}>Test Notification Permission</Text>
            <FastImage
              source={require('../../assets/notification.png')}
              style={styles.rightIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.subTitle}>
            Check if browser notifications are working properly
          </Text>
          <View style={{ height: scale(20) }} />
          <Text style={styles.title}>Test Individual Reminders</Text>
          <Text style={styles.subTitle}>
            Test each of the 5 reminder messages individually
          </Text>
          <View style={{ height: vs(14) }} />

          <ReminderPills value={which} onChange={setWhich} />

          <View style={{ height: scale(20) }} />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.title}>Test Notification Permission</Text>
            <FastImage
              source={require('../../assets/notificationOutline.png')}
              style={styles.rightIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.subTitle}>
            Triggers all 5 reminders with 5-second intervals (instead of
            30minutes)
          </Text>
          <View style={{ height: scale(20) }} />

          <GradientHintBox
            title="Note:"
            text='Make sure to allow notifications when
prompted by your browser. Demo reminders will show "(Demo)" in the title to distinguishthem from real reminders.'
          />
        </GradientCardHome>
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
  label: {
    color: palette.white,
    fontSize: s(14),
    fontWeight: '800',
  },
  sectionHeading: {
    color: palette.white,
    fontSize: s(16),
    fontWeight: '800',
    marginBottom: s(10),
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
  },
  rightIcon: { width: s(25), height: s(25), marginBottom: scale(20) },
});
