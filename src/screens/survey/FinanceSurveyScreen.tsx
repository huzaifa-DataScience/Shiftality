// src/screens/survey/FinanceSurveyScreen.tsx
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
  scale,
} from 'react-native-size-matters';
import { palette } from '../../theme';
import GradientCardHome from '../../components/GradientCardHome';
import Stepper from '../../components/survey/Stepper';
import LikertCard from '../../components/survey/LikertCard';
import { SECTIONS } from './sections';
import type { LikertValue } from '../../components/survey/LikertPill';
import PrimaryButton from '../../components/PrimaryButton';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';

type AnswersForStep = Record<number, LikertValue>;

export default function FinanceSurveyScreen() {
  type RootNav = NativeStackNavigationProp<RootStackParamList>;

  const navigation = useNavigation<RootNav>();

  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState(0);
  const totalSteps = SECTIONS.length;
  const [allAnswers, setAllAnswers] = useState<Record<number, AnswersForStep>>(
    {},
  );

  const setAnswer = (qIdx: number, v: LikertValue) => {
    setAllAnswers(prev => ({
      ...prev,
      [step]: { ...(prev[step] || {}), [qIdx]: v },
    }));
  };

  const current = SECTIONS[step];
  const answersForStep = allAnswers[step] || {};
  const isStepComplete = current.questions.every((_, i) => !!answersForStep[i]);

  const goNext = () => {
    if (step < totalSteps - 1 && isStepComplete) {
      setStep(s => s + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      navigation.navigate('Main', { screen: 'Profile' });
    }
  };
  const goBack = () => {
    if (step > 0) {
      setStep(s => s - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1, backgroundColor: palette.darkBlue }}
      contentContainerStyle={{ paddingVertical: vs(46) }}
      onScrollBeginDrag={(e: NativeSyntheticEvent<NativeScrollEvent>) => {}}
      scrollEventThrottle={16}
    >
      {/* Header */}
      <View style={{ alignItems: 'center', marginBottom: vs(12) }}>
        <GradientCardHome
          style={{ width: scale(330), paddingVertical: vs(12) }}
        >
          <View style={{ alignItems: 'center' }}>
            <Stepper total={totalSteps} current={step + 1} />
            <Text style={styles.headerTitle}>{current.title}</Text>
            <Text style={styles.headerSub}>{current.subtitle}</Text>
          </View>
        </GradientCardHome>
      </View>

      {/* Questions */}
      <View style={{ alignItems: 'center' }}>
        {current.questions.map((q, i) => (
          <LikertCard
            key={i}
            question={q}
            value={answersForStep[i] ?? null}
            onChange={v => setAnswer(i, v)}
          />
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.ctaWrap}
          disabled={step === 0}
          onPress={goBack}
        >
          <LinearGradient
            colors={['#143f65ff', '#1C2A3A']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.cta, step === 0 && { opacity: 0.6 }]}
          >
            <Text style={styles.ctaTextMuted}>Back</Text>
          </LinearGradient>
        </TouchableOpacity>
        <View style={{ height: scale(10) }} />

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
          title={step === totalSteps - 1 ? 'Complete Scan' : 'Next Section'}
          onPress={goNext}
          disabled={!isStepComplete}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    color: palette.white,
    fontSize: ms(28),
    fontWeight: '800',
    marginTop: vs(6),
    fontFamily: 'SourceSansPro-Regular',
  },
  headerSub: {
    color: palette.white,
    fontSize: ms(18),
    fontFamily: 'SourceSansPro-Regular',
    marginTop: vs(2),
    textAlign: 'center',
  },
  footer: { alignItems: 'center', paddingVertical: vs(16) },
  ctaWrap: { width: scale(330) },
  cta: {
    width: scale(330),
    height: vs(40),
    borderRadius: s(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: palette.white,
    fontSize: ms(14.5),
    fontWeight: '800',
    fontFamily: 'SourceSansPro-Regular',
  },
  ctaTextMuted: {
    color: palette.white,
    fontSize: ms(14.5),
    fontFamily: 'SourceSansPro-Regular',
    fontWeight: '700',
    opacity: 0.9,
  },
});
