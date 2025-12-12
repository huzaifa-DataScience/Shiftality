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
import { useAppTheme, useThemeMode } from '../../theme/ThemeProvider';
import { useFontSize } from '../../theme/FontSizeProvider';
import GradientCardHome from '../../components/GradientCardHome';
import GradientBackground from '../../components/GradientBackground';
import Stepper from '../../components/survey/Stepper';
import LikertCard from '../../components/survey/LikertCard';
import { SECTIONS } from './sections';
import type { LikertValue } from '../../store/reducers/surveyReducer';
import PrimaryButton from '../../components/PrimaryButton';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useDispatch, useSelector } from 'react-redux';
import { saveSurveyAnswer } from '../../store/reducers/surveyReducer';
import { selectUser } from '../../store/reducers/profileReducer';
import { submitQuestionnaire } from '../../lib/authService';
import Toast from 'react-native-toast-message';

type AnswersForStep = Record<number, LikertValue>;

export default function FinanceSurveyScreen() {
  type RootNav = NativeStackNavigationProp<RootStackParamList>;

  const theme = useAppTheme();
  const { themeMode } = useThemeMode();
  const { scaledFontSize } = useFontSize();
  const isDark = themeMode === 'dark';
  const navigation = useNavigation<RootNav>();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const surveyAnswers = useSelector(
    (state: any) => state.survey.answers as Record<string, number>,
  );

  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState(0);
  const totalSteps = SECTIONS.length;
  const [allAnswers, setAllAnswers] = useState<Record<number, AnswersForStep>>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map points back to LikertValue for API submission
  const POINT_TO_VALUE: Record<number, LikertValue> = {
    2: 's_agree',
    1: 'agree',
    0: 'unsure',
    [-1]: 'disagree',
    [-2]: 's_disagree',
  };

  const setAnswer = (qIdx: number, v: LikertValue) => {
    // UI local state
    setAllAnswers(prev => ({
      ...prev,
      [step]: { ...(prev[step] || {}), [qIdx]: v },
    }));

    // Save globally
    dispatch(
      saveSurveyAnswer({
        sectionIndex: step,
        questionIndex: qIdx,
        value: v,
      }) as any,
    );
  };

  const current = SECTIONS[step];
  const answersForStep = allAnswers[step] || {};
  const isStepComplete = current.questions.every((_, i) => !!answersForStep[i]);

  // Format all answers with questions for API submission
  // Groups answers by section/category
  const formatAnswersForAPI = () => {
    const sectionAnswers: Array<{
      category: string;
      answers: Array<{
        question_text: string;
        question_index: number;
        answer: string;
      }>;
    }> = [];

    SECTIONS.forEach((section, sectionIndex) => {
      const sectionAnswersList: Array<{
        question_text: string;
        question_index: number;
        answer: string;
      }> = [];

      section.questions.forEach((questionText, questionIndex) => {
        const key = `${sectionIndex}_${questionIndex}`;
        const points = surveyAnswers[key];

        // Convert points back to LikertValue
        let answer: LikertValue = 'unsure'; // default
        if (points !== undefined && points !== null) {
          answer = POINT_TO_VALUE[points] || 'unsure';
        }

        sectionAnswersList.push({
          question_text: questionText,
          question_index: questionIndex,
          answer: answer,
        });
      });

      sectionAnswers.push({
        category: section.title,
        answers: sectionAnswersList,
      });
    });

    return sectionAnswers;
  };

  const handleCompleteScan = async () => {
    if (!user?.id) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'Please log in to submit your answers',
      });
      return;
    }

    // Check if all questions are answered
    const allAnswered = SECTIONS.every((section, sectionIndex) =>
      section.questions.every((_, questionIndex) => {
        const key = `${sectionIndex}_${questionIndex}`;
        return surveyAnswers[key] !== undefined && surveyAnswers[key] !== null;
      }),
    );

    if (!allAnswered) {
      Toast.show({
        type: 'error',
        text1: 'Incomplete Survey',
        text2: 'Please answer all questions before completing the scan',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const answers = formatAnswersForAPI();
      await submitQuestionnaire(user.id, {
        answers,
      });

      Toast.show({
        type: 'success',
        text1: 'Survey Completed',
        text2: 'Your answers have been submitted successfully',
      });

      // Navigate after a short delay
      setTimeout(() => {
        navigation.navigate('Main', { screen: 'CenterProfile' });
      }, 500);
    } catch (error: any) {
      console.error('Questionnaire submission error:', error);
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2:
          error.message || 'Failed to submit questionnaire. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goNext = () => {
    if (step < totalSteps - 1 && isStepComplete) {
      setStep(s => s + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      // On last step, call handleCompleteScan
      handleCompleteScan();

      // navigation.navigate('Main', { screen: 'CenterProfile' });
    }
  };
  const goBack = () => {
    if (step > 0) {
      setStep(s => s - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  return (
    <GradientBackground>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
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
              <Text
                style={[
                  styles.headerTitle,
                  { color: theme.colors.text, fontSize: scaledFontSize(28) },
                ]}
              >
                {current.title}
              </Text>
              <Text
                style={[
                  styles.headerSub,
                  {
                    color: theme.colors.textMuted,
                    fontSize: scaledFontSize(18),
                  },
                ]}
              >
                {current.subtitle}
              </Text>
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
              colors={theme.colors.cardGradient}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.cta, step === 0 && { opacity: 0.6 }]}
            >
              <Text
                style={[
                  styles.ctaTextMuted,
                  { color: theme.colors.text, fontSize: scaledFontSize(14.5) },
                ]}
              >
                Back
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <View style={{ height: scale(10) }} />

          <PrimaryButton
            style={{
              width: '95%',
              alignSelf: 'center',
            }}
            title={
              step === totalSteps - 1
                ? isSubmitting
                  ? 'Submitting...'
                  : 'Complete Scan'
                : 'Next Section'
            }
            onPress={goNext}
            disabled={!isStepComplete || isSubmitting}
            loading={isSubmitting && step === totalSteps - 1}
          />
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: ms(28),
    fontWeight: '800',
    marginTop: vs(6),
    fontFamily: 'SourceSansPro-Regular',
  },
  headerSub: {
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
    fontSize: ms(14.5),
    fontWeight: '800',
    fontFamily: 'SourceSansPro-Regular',
  },
  ctaTextMuted: {
    fontSize: ms(14.5),
    fontFamily: 'SourceSansPro-Regular',
    fontWeight: '700',
    opacity: 0.9,
  },
});
