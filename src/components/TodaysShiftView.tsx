// src/screens/TodaysShiftView.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  LayoutChangeEvent,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  scale as s,
  scale,
  verticalScale as vs,
} from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {
  Defs,
  Rect,
  Stop,
  LinearGradient as SvgGrad,
} from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import GradientBoxWithButton from '../components/GradientBoxWithButton';
import GradientHintBoxWithLikert from '../components/GradientHintBoxWithLikert';
import { useAppTheme, useThemeMode } from '../theme/ThemeProvider';
import { Checkin } from '../lib/dataClient';
import {
  createCheckin,
  getBeliefs,
  type ApiBeliefQuestion,
} from '../lib/authService';

// Extended type with answer field
type BeliefWithAnswer = ApiBeliefQuestion & {
  answer?: 'yes' | 'no' | null;
};

type Props = {
  onCheckinUpdate: (checkin: Checkin) => void;
  anchorDay: string;
  checkins: Checkin[];
};

export default function TodaysShiftView({
  checkins,
  anchorDay,
  onCheckinUpdate,
}: Props) {
  const theme = useAppTheme();
  const { themeMode } = useThemeMode();
  const isDark = themeMode === 'dark';
  console.log('🚀 ~ anchorDay:', anchorDay);
  const [showDetails, setShowDetails] = useState(true); // Default to true (show detailed view)

  // beliefs loaded from API - now storing complete objects with answers
  const [empoweringBeliefs, setEmpoweringBeliefs] = useState<
    BeliefWithAnswer[]
  >([]);
  console.log('🚀 ~ empoweringBeliefs:', empoweringBeliefs);
  const [shadowBeliefs, setShadowBeliefs] = useState<BeliefWithAnswer[]>([]);

  // ───────────────── LOAD BELIEFS FROM API ─────────────────
  const loadBeliefsFromApi = useCallback(async () => {
    try {
      const [emp, shadow] = await Promise.all([
        getBeliefs('empowering'),
        getBeliefs('shadow'),
      ]);

      // Store complete belief objects with answer field initialized to null
      const empBeliefs: BeliefWithAnswer[] = Array.isArray(emp)
        ? emp
            .filter((b: any) => b?.text && b.text.trim().length > 0)
            .map((b: ApiBeliefQuestion) => ({
              ...b,
              answer: null as 'yes' | 'no' | null,
            }))
        : [];

      const shadowBeliefsData: BeliefWithAnswer[] = Array.isArray(shadow)
        ? shadow
            .filter((b: any) => b?.text && b.text.trim().length > 0)
            .map((b: ApiBeliefQuestion) => ({
              ...b,
              answer: null as 'yes' | 'no' | null,
            }))
        : [];

      setEmpoweringBeliefs(empBeliefs);
      setShadowBeliefs(shadowBeliefsData);

      console.log(
        '[TodaysShiftView] Loaded beliefs from API',
        empBeliefs.length,
        shadowBeliefsData.length,
      );
    } catch (e) {
      console.log('[TodaysShiftView] Error loading beliefs from API', e);
      // Fallback: if API fails, show nothing (or you could keep last state)
      setEmpoweringBeliefs([]);
      setShadowBeliefs([]);
    }
  }, []);

  // Check if today's shift is locked
  const checkTodaysShift = useCallback(() => {
    try {
      const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
      console.log('🚀 ~ checkTodaysShift ~ today:', today);
      const todaysCheckin = checkins.find(c => c.date === today);
      console.log('🚀 ~ checkTodaysShift ~ todaysCheckin:', todaysCheckin);

      // If there's a checkin for today, hide detailed view (show completed view)
      // If no checkin, show detailed view
      if (anchorDay) {
        setShowDetails(true);
      } else {
        setShowDetails(!todaysCheckin);
      }
    } catch (e) {
      console.log("Error checking today's shift", e);
      // On error, default to showing detailed view
      setShowDetails(true);
    }
  }, [checkins, anchorDay]);

  // Initial mount
  useEffect(() => {
    loadBeliefsFromApi();
    checkTodaysShift();
  }, [loadBeliefsFromApi, checkTodaysShift, checkins]);

  // Reload whenever the screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadBeliefsFromApi();
      checkTodaysShift();
    }, [loadBeliefsFromApi, checkTodaysShift]),
  );

  // Count yes answers from belief objects
  const countYes = (beliefs: BeliefWithAnswer[]) =>
    beliefs.reduce((n, belief) => n + (belief.answer === 'yes' ? 1 : 0), 0);

  // mark all in a section to 'yes' or 'no'
  const markAll = (
    beliefs: BeliefWithAnswer[],
    value: 'yes' | 'no',
    setter: React.Dispatch<React.SetStateAction<BeliefWithAnswer[]>>,
  ) => {
    setter(prev =>
      prev.map(belief => ({
        ...belief,
        answer: value,
      })),
    );
  };

  const hasAnySelection = [...empoweringBeliefs, ...shadowBeliefs].some(
    belief => belief.answer !== null && belief.answer !== undefined,
  );

  const handleClear = () => {
    setEmpoweringBeliefs(prev =>
      prev.map(belief => ({ ...belief, answer: null })),
    );
    setShadowBeliefs(prev => prev.map(belief => ({ ...belief, answer: null })));
  };

  const handleSelect = (
    beliefId: string,
    value: 'yes' | 'no' | null,
    isEmpowering: boolean,
  ) => {
    const setter = isEmpowering ? setEmpoweringBeliefs : setShadowBeliefs;
    setter(prev =>
      prev.map((belief, idx) => {
        // Match by ID if available, otherwise match by generated key
        const matchKey =
          belief.id || (isEmpowering ? `emp-${idx}` : `shadow-${idx}`);
        return matchKey === beliefId ? { ...belief, answer: value } : belief;
      }),
    );
  };

  const handleLock = async () => {
    // Calculate counts using answers stored in belief objects
    const empoweringYes = countYes(empoweringBeliefs);
    const shadowYes = countYes(shadowBeliefs);

    let dailyScore = empoweringYes - shadowYes; // YES on shadow = -1
    if (dailyScore > 10) dailyScore = 10;
    if (dailyScore < -10) dailyScore = -10;

    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

    const checkin: Checkin = {
      id: `${today}-${Date.now()}`,
      date: anchorDay ? anchorDay : today,
      pos_yes: empoweringYes,
      neg_yes: shadowYes,
      daily_score: dailyScore,
      source: 'user',
      created_at: new Date().toISOString(),
      questions: {
        empoweringBeliefs: empoweringBeliefs,
        shadowBeliefs: shadowBeliefs,
      },
    };

    try {
      console.log('🔒 [handleLock] Locking today shift with checkin:', checkin);

      // Call API to create checkin on backend
      await createCheckin(checkin);
      console.log('✅ [handleLock] Checkin saved to backend successfully');

      // Inform parent
      await onCheckinUpdate(checkin);

      // Hide detailed view and show completed view immediately after locking
      setShowDetails(false);

      // Show success toast
      Toast.show({
        type: 'success',
        text1: "Today's Shift Locked",
        text2: `Score: ${dailyScore}`,
      });
    } catch (error: any) {
      console.error('❌ [handleLock] Error locking shift:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Lock Shift',
        text2: error.message || 'Please try again',
      });
    }
  };

  const [w, setW] = useState(0);
  const [h, setH] = useState(vs(90));

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setW(Math.round(width));
    setH(Math.max(vs(90), Math.round(height) || vs(90)));
  }, []);

  if (!showDetails) {
    return (
      <GradientBoxWithButton
        title="Today's Shift"
        text="Check what felt true today. Empowering Beliefs raise your score; Shadow Beliefs lower it. Max ±10 per day."
        tickIcon={require('../assets/tick.png')}
        onPressDetails={() => setShowDetails(true)}
      />
    );
  }

  // ✅ use correct counts for UI as well
  const empoweringYesCount = countYes(empoweringBeliefs);
  const shadowYesCount = countYes(shadowBeliefs);
  const rawScore = empoweringYesCount - shadowYesCount;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.panel,
          !isDark && {
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
        ]}
        onLayout={onLayout}
      >
        {w > 0 && (
          <Svg
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
            width={w}
            height={h}
            viewBox={`0 0 ${w} ${h}`}
          >
            <Defs>
              {isDark ? (
                <SvgGrad id="borderGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor="#0AC4FF" />
                  <Stop offset="0.52" stopColor="#0AC4FF" />
                  <Stop offset="1" stopColor="#1a4258ff" />
                </SvgGrad>
              ) : (
                <SvgGrad id="borderGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={theme.colors.border} />
                  <Stop offset="1" stopColor={theme.colors.border} />
                </SvgGrad>
              )}
            </Defs>
            <Rect
              x={0.5}
              y={0.5}
              width={w - 1}
              height={h - 1}
              rx={s(12)}
              ry={s(12)}
              fill="transparent"
              stroke={isDark ? 'url(#borderGrad)' : theme.colors.border}
              strokeWidth={1}
            />
          </Svg>
        )}

        {/* Header */}
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Today's Shift
        </Text>
        <Text style={[styles.desc, { color: theme.colors.textMuted }]}>
          Check what felt true today. Empowering Beliefs raise your score;
          Shadow Beliefs lower it. Max ±10 per day.
        </Text>

        {/* Empowering Beliefs */}
        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
          Empowering Beliefs (YES = +1)
        </Text>
        <View style={styles.sectionToolbar}>
          <Text style={[styles.sectionCounter, { color: theme.colors.text }]}>
            {empoweringYesCount}/{empoweringBeliefs.length}
          </Text>
          <View style={styles.sectionActions}>
            <TouchableOpacity
              onPress={() =>
                markAll(empoweringBeliefs, 'yes', setEmpoweringBeliefs)
              }
            >
              <Text
                style={[styles.actionText, { color: theme.colors.textMuted }]}
              >
                Mark all YES
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                markAll(empoweringBeliefs, 'no', setEmpoweringBeliefs)
              }
            >
              <Text
                style={[styles.actionText, { color: theme.colors.textMuted }]}
              >
                Mark all NO
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {empoweringBeliefs.map((belief, idx) => (
          <GradientHintBoxWithLikert
            key={belief.id || `emp-${idx}`}
            text={belief.text || ''}
            selected={belief.answer ?? null}
            onSelect={val => handleSelect(belief.id || `emp-${idx}`, val, true)}
          />
        ))}

        {/* Shadow Beliefs */}
        <Text
          style={[
            styles.sectionTitle,
            { marginTop: vs(16), color: theme.colors.primary },
          ]}
        >
          Shadow Beliefs (YES = -1)
        </Text>
        <View style={styles.sectionToolbar}>
          <Text style={[styles.sectionCounter, { color: theme.colors.text }]}>
            {shadowYesCount}/{shadowBeliefs.length}
          </Text>
          <View style={styles.sectionActions}>
            <TouchableOpacity
              onPress={() => markAll(shadowBeliefs, 'yes', setShadowBeliefs)}
            >
              <Text
                style={[styles.actionText, { color: theme.colors.textMuted }]}
              >
                Mark all YES
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => markAll(shadowBeliefs, 'no', setShadowBeliefs)}
            >
              <Text
                style={[styles.actionText, { color: theme.colors.textMuted }]}
              >
                Mark all NO
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {shadowBeliefs.map((belief, idx) => (
          <GradientHintBoxWithLikert
            key={belief.id || `shadow-${idx}`}
            text={belief.text || ''}
            selected={belief.answer ?? null}
            onSelect={val =>
              handleSelect(belief.id || `shadow-${idx}`, val, false)
            }
          />
        ))}

        {/* ✅ Correct Score Display */}
        <Text style={[styles.scoreText, { color: theme.colors.text }]}>
          Today's score: (+{empoweringYesCount}) + (-{shadowYesCount}) ={' '}
          {rawScore}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={hasAnySelection ? handleClear : undefined}
          style={[styles.clearRow, !hasAnySelection && { opacity: 0.45 }]}
        >
          <Image
            source={require('../assets/clear_choices.png')}
            style={[styles.clearIcon, { tintColor: theme.colors.primary }]}
            resizeMode="contain"
          />
          <Text style={[styles.clearText, { color: theme.colors.textMuted }]}>
            Clear choices
          </Text>
        </TouchableOpacity>

        {/* Lock Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLock}
          style={{ marginTop: vs(14) }}
        >
          <LinearGradient
            colors={theme.colors.cardGradient}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.lockButton}
          >
            <Text style={[styles.lockText, { color: theme.colors.text }]}>
              Lock Today's Shift
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: s(16),
    paddingTop: vs(12),
  },
  scrollContent: {
    padding: s(16),
    paddingBottom: vs(40),
    alignItems: 'center',
  },
  panel: {
    width: scale(280),
    borderRadius: s(18),
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    padding: scale(10),
  },
  title: {
    fontSize: s(20),
    fontWeight: '700',
    marginBottom: vs(6),
    fontFamily: 'SourceSansPro-Regular',
  },
  desc: {
    fontSize: s(14),
    lineHeight: s(19),
    marginBottom: vs(14),
    fontFamily: 'SourceSansPro-Regular',
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: s(14),
    marginVertical: vs(6),
    fontFamily: 'SourceSansPro-Regular',
  },
  scoreText: {
    fontSize: s(15),
    fontWeight: '600',
    marginTop: vs(14),
    fontFamily: 'SourceSansPro-Regular',
  },
  lockButton: {
    width: '100%',
    height: vs(40),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: s(30),
  },
  lockText: {
    fontSize: s(14.5),
    fontWeight: '700',
    fontFamily: 'SourceSansPro-Regular',
  },
  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(10),
    marginBottom: vs(6),
  },
  clearIcon: {
    width: s(18),
    height: s(18),
    marginRight: s(10),
  },
  clearText: {
    fontSize: s(15),
    fontWeight: '600',
    fontFamily: 'SourceSansPro-Regular',
  },
  sectionToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginVertical: vs(6),
  },
  sectionCounter: {
    fontSize: s(13),
    fontWeight: '700',
    fontFamily: 'SourceSansPro-Regular',
  },
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: s(14),
  },
  actionText: {
    fontSize: s(12.5),
    fontWeight: '700',
    fontFamily: 'SourceSansPro-Regular',
  },
});
