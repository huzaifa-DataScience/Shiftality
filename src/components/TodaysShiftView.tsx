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
import { palette } from '../theme';
import { Checkin } from '../lib/dataClient';
import { createCheckin, getBeliefs } from '../lib/authService';

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
  console.log('🚀 ~ anchorDay:', anchorDay);
  const [showDetails, setShowDetails] = useState(true); // Default to true (show detailed view)

  // beliefs loaded from API
  const [empoweringBeliefs, setEmpoweringBeliefs] = useState<string[]>([]);
  const [shadowBeliefs, setShadowBeliefs] = useState<string[]>([]);

  // State to track selections (yes/no/null)
  const [responses, setResponses] = useState<
    Record<string, 'yes' | 'no' | null>
  >({});

  // ───────────────── LOAD BELIEFS FROM API ─────────────────
  const loadBeliefsFromApi = useCallback(async () => {
    try {
      const [emp, shadow] = await Promise.all([
        getBeliefs('empowering'),
        getBeliefs('shadow'),
      ]);

      const empTexts = Array.isArray(emp)
        ? emp
            .map((b: any) => b?.text || '')
            .filter((t: string) => t && t.trim().length > 0)
        : [];

      const shadowTexts = Array.isArray(shadow)
        ? shadow
            .map((b: any) => b?.text || '')
            .filter((t: string) => t && t.trim().length > 0)
        : [];

      setEmpoweringBeliefs(empTexts);
      setShadowBeliefs(shadowTexts);

      console.log(
        '[TodaysShiftView] Loaded beliefs from API',
        empTexts.length,
        shadowTexts.length,
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

  const countYes = (list: string[]) =>
    list.reduce((n, key) => n + (responses[key] === 'yes' ? 1 : 0), 0);

  // mark all in a section to 'yes' or 'no'
  const markAll = (list: string[], value: 'yes' | 'no') => {
    const patch: Record<string, 'yes' | 'no'> = {};
    list.forEach(k => {
      patch[k] = value;
    });
    setResponses(prev => ({ ...prev, ...patch }));
  };

  const hasAnySelection = Object.values(responses).some(
    v => v !== null && v !== undefined,
  );

  const handleClear = () => setResponses({});

  const handleSelect = (text: string, value: 'yes' | 'no' | null) => {
    setResponses(prev => ({ ...prev, [text]: value }));
  };

  const handleLock = async () => {
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
      <View style={styles.panel} onLayout={onLayout}>
        {w > 0 && (
          <Svg
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
            width={w}
            height={h}
            viewBox={`0 0 ${w} ${h}`}
          >
            <Defs>
              <SvgGrad id="borderGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#0AC4FF" />
                <Stop offset="0.52" stopColor="#0AC4FF" />
                <Stop offset="1" stopColor="#1a4258ff" />
              </SvgGrad>
            </Defs>
            <Rect
              x={0.5}
              y={0.5}
              width={w - 1}
              height={h - 1}
              rx={s(12)}
              ry={s(12)}
              fill="transparent"
              stroke="url(#borderGrad)"
              strokeWidth={1}
            />
          </Svg>
        )}

        {/* Header */}
        <Text style={styles.title}>Today's Shift</Text>
        <Text style={styles.desc}>
          Check what felt true today. Empowering Beliefs raise your score;
          Shadow Beliefs lower it. Max ±10 per day.
        </Text>

        {/* Empowering Beliefs */}
        <Text style={styles.sectionTitle}>Empowering Beliefs (YES = +1)</Text>
        <View style={styles.sectionToolbar}>
          <Text style={styles.sectionCounter}>
            {empoweringYesCount}/{empoweringBeliefs.length}
          </Text>
          <View style={styles.sectionActions}>
            <TouchableOpacity onPress={() => markAll(empoweringBeliefs, 'yes')}>
              <Text style={styles.actionText}>Mark all YES</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => markAll(empoweringBeliefs, 'no')}>
              <Text style={styles.actionText}>Mark all NO</Text>
            </TouchableOpacity>
          </View>
        </View>

        {empoweringBeliefs.map((belief, idx) => (
          <GradientHintBoxWithLikert
            key={`${belief}-${idx}`}
            text={belief}
            selected={responses[belief] ?? null}
            onSelect={val => handleSelect(belief, val)}
          />
        ))}

        {/* Shadow Beliefs */}
        <Text style={[styles.sectionTitle, { marginTop: vs(16) }]}>
          Shadow Beliefs (YES = -1)
        </Text>
        <View style={styles.sectionToolbar}>
          <Text style={styles.sectionCounter}>
            {shadowYesCount}/{shadowBeliefs.length}
          </Text>
          <View style={styles.sectionActions}>
            <TouchableOpacity onPress={() => markAll(shadowBeliefs, 'yes')}>
              <Text style={styles.actionText}>Mark all YES</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => markAll(shadowBeliefs, 'no')}>
              <Text style={styles.actionText}>Mark all NO</Text>
            </TouchableOpacity>
          </View>
        </View>

        {shadowBeliefs.map((belief, idx) => (
          <GradientHintBoxWithLikert
            key={`${belief}-${idx}`}
            text={belief}
            selected={responses[belief] ?? null}
            onSelect={val => handleSelect(belief, val)}
          />
        ))}

        {/* ✅ Correct Score Display */}
        <Text style={styles.scoreText}>
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
            style={styles.clearIcon}
            resizeMode="contain"
          />
          <Text style={styles.clearText}>Clear choices</Text>
        </TouchableOpacity>

        {/* Lock Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLock}
          style={{ marginTop: vs(14) }}
        >
          <LinearGradient
            colors={['#143f65ff', '#1C2A3A']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.lockButton}
          >
            <Text style={styles.lockText}>Lock Today's Shift</Text>
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
    color: palette.white,
    fontSize: s(20),
    fontWeight: '700',
    marginBottom: vs(6),
    fontFamily: 'SourceSansPro-Regular',
  },
  desc: {
    color: palette.white,
    fontSize: s(14),
    lineHeight: s(19),
    marginBottom: vs(14),
    fontFamily: 'SourceSansPro-Regular',
  },
  sectionTitle: {
    color: '#9AD9FF',
    fontWeight: '700',
    fontSize: s(14),
    marginVertical: vs(6),
    fontFamily: 'SourceSansPro-Regular',
  },
  scoreText: {
    color: palette.white,
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
    color: palette.txtBlue,
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
    tintColor: '#9AD9FF',
    marginRight: s(10),
  },
  clearText: {
    color: '#EAF4FF',
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
    color: '#f4f5f6ff',
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
    color: '#f9fbfbff',
    fontSize: s(12.5),
    fontWeight: '700',
    fontFamily: 'SourceSansPro-Regular',
  },
});
