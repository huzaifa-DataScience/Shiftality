// src/screens/survey/FinanceSurveyScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ActivityIndicator,
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
// import { SECTIONS } from './sections'; // ⬅️ no longer needed if you want pure API
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
import { getAuthToken } from '../../lib/authStorage';
import { api } from '../../lib/apiClient';

// ----------------- TYPES -----------------

type AnswersForStep = Record<number, LikertValue>;

type Section = {
  title: string;
  subtitle: string;
  questions: string[];
};

// ----------------- CONFIG (replace with env) -----------------

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

  // 🔹 NEW: local sections from API
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(true);
  const [sectionsError, setSectionsError] = useState<string | null>(null);

  const [step, setStep] = useState(0);
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

  // ----------------- FETCH SECTIONS FROM API -----------------

  useEffect(() => {
    const fetchQuestionnaires = async () => {
      try {
        const authToken = await getAuthToken();
        const SUPABASE_ANON_KEY =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcnl0d296ZHdsc3F3a3JjcGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMDc3NDIsImV4cCI6MjA3NDY4Mzc0Mn0.ce2Nwjgm2cQNmF8_oO8TqoRv8DvyCKfqaREHdgQ3dMI';
        const GET_QUESTIONNAIRES_URL = `functions/v1/get-questionnaires`;

        setIsLoadingSections(true);
        setSectionsError(null);

        const { data: raw } = await api.get(GET_QUESTIONNAIRES_URL, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            apikey: SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
        });

        console.log('questionnaires raw => ', JSON.stringify(raw, null, 2));

        // If your edge function returns plain array (like in the screenshot)
        let apiSections: Section[] = [];

        if (Array.isArray(raw)) {
          apiSections = raw as Section[];
        } else if (Array.isArray(raw?.data)) {
          // just in case you later wrap it like { data: [...] }
          apiSections = raw.data as Section[];
        }

        if (!apiSections.length) {
          throw new Error('No questionnaires found');
        }

        setSections(apiSections);
        setStep(0);
      } catch (err: any) {
        console.error('Error fetching questionnaires:', err);
        setSectionsError(
          err?.message || 'Failed to load questionnaires. Please try again.',
        );
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2:
            err?.message || 'Failed to load questionnaires. Please try again.',
        });
      } finally {
        setIsLoadingSections(false);
      }
    };

    fetchQuestionnaires();
  }, []);

  const totalSteps = sections.length;

  const setAnswer = (qIdx: number, v: LikertValue) => {
    if (!sections[step]) return;

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

  const current = sections[step];
  const answersForStep = current ? allAnswers[step] || {} : {};
  const isStepComplete = current
    ? current.questions.every((_, i) => !!answersForStep[i])
    : false;

  // ----------------- FORMAT ANSWERS FOR API -----------------

  const formatAnswersForAPI = () => {
    if (!sections.length) return [];

    const sectionAnswers: Array<{
      category: string;
      answers: Array<{
        question_text: string;
        question_index: number;
        answer: string;
      }>;
    }> = [];

    sections.forEach((section, sectionIndex) => {
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

  // ----------------- SUBMIT HANDLER -----------------

  const handleCompleteScan = async () => {
    if (!user?.id) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'Please log in to submit your answers',
      });
      return;
    }

    if (!sections.length) {
      Toast.show({
        type: 'error',
        text1: 'No Questionnaire',
        text2: 'Unable to submit. No questionnaire loaded.',
      });
      return;
    }

    // Check if all questions are answered
    const allAnswered = sections.every((section, sectionIndex) =>
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

      setTimeout(() => {
        navigation.navigate('Main', { screen: 'CenterProfile' });
      }, 500);
    } catch (error: any) {
      console.error('Questionnaire submission error:', error);
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2:
          error?.message || 'Failed to submit questionnaire. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------- NAVIGATION -----------------

  const goNext = () => {
    if (!sections.length) return;

    if (step < totalSteps - 1 && isStepComplete) {
      setStep(s => s + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else if (step === totalSteps - 1) {
      handleCompleteScan();
    }
  };

  const goBack = () => {
    if (step > 0) {
      setStep(s => s - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  // ----------------- RENDER -----------------

  if (isLoadingSections) {
    return (
      <GradientBackground>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={{
              marginTop: 8,
              color: theme.colors.text,
              fontSize: scaledFontSize(16),
            }}
          >
            Loading questionnaire...
          </Text>
        </View>
      </GradientBackground>
    );
  }

  if (!sections.length || !current) {
    return (
      <GradientBackground>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
          }}
        >
          <Text
            style={{
              color: theme.colors.text,
              fontSize: scaledFontSize(18),
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            {sectionsError || 'No questionnaire available.'}
          </Text>
        </View>
      </GradientBackground>
    );
  }

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
