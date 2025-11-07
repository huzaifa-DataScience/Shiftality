// src/screens/SearchScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { palette } from '../../theme';
import GradientCardHome from '../../components/GradientCardHome';
import { ms, scale } from 'react-native-size-matters';
import GradientHintBox from '../../components/GradientHintBox';
import GradientHintBoxVibe from '../../components/GradientHintBoxVibe';
import PrimaryButton from '../../components/PrimaryButton';
export default function SettingScreen() {
  const [firstName, setFirstName] = useState('');
  const [reflectionEnabled, setReflectionEnabled] = useState(true);

  const [northStar, setNorthStar] = useState(
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
  );
  const [shadowPath, setShadowPath] = useState(
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
  );

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
          // optional custom colors to match your mock
          switchTrackOn="#50B9FF"
          switchTrackOff="#2E3A49"
          switchThumb="#FFFFFF"
        />
        <View style={{ height: scale(20) }} />

        <GradientCardHome>
          <Text style={styles.title}>Appearance</Text>
          <Text style={styles.subTitle}>
            Customize the look and feel of your app
          </Text>
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
});
