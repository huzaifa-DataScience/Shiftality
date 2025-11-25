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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import GradientBoxWithButton from '../components/GradientBoxWithButton';
import GradientHintBoxWithLikert from '../components/GradientHintBoxWithLikert';
import { palette } from '../theme';
import { Checkin } from '../lib/dataClient';

// ⚡ same keys as ProfileScreen
const EMPOWERING_STORAGE_KEY = 'profile_empowering_beliefs_v1';
const SHADOW_STORAGE_KEY = 'profile_shadow_beliefs_v1';

// ⚡ same defaults as ProfileScreen (full sentences)
const DEFAULT_EMPOWERING_BELIEFS: string[] = [
  'Today, I believed Opportunities show up when I show up.',
  'Today, I believed Small choices can shift my energy.',
  'Today, I believed A low moment doesn’t define the day.',
  'Today, I believed Reaching out first is safe for me.',
  'Today, I believed I keep promises to future me.',
  'Today, I believed I am enough as I grow.',
  'Today, I believed Challenges are feedback, not failure.',
  'Today, I believed I bounce back when things go wrong.',
];

const DEFAULT_SHADOW_BELIEFS: string[] = [
  'Today, I believed Money is scarce and hard for me to get.',
  'Today, I believed I’ll be misunderstood or rejected.',
  'Today, I believed Change isn’t really available to me.',
  'Today, I believed Stress is who I am.',
];

type Props = {
  onCheckinUpdate: (checkin: Checkin) => void;
};

export default function TodaysShiftView({ onCheckinUpdate }: Props) {
  const [showDetails, setShowDetails] = useState(false);

  // beliefs loaded from storage
  const [empoweringBeliefs, setEmpoweringBeliefs] = useState<string[]>(
    DEFAULT_EMPOWERING_BELIEFS,
  );
  const [shadowBeliefs, setShadowBeliefs] = useState<string[]>(
    DEFAULT_SHADOW_BELIEFS,
  );
  const [hydrated, setHydrated] = useState(false);

  // State to track selections (yes/no/null)
  const [responses, setResponses] = useState<
    Record<string, 'yes' | 'no' | null>
  >({});

  // ───────────────── LOAD FROM STORAGE (reusable) ─────────────────
  const loadBeliefsFromStorage = useCallback(async () => {
    try {
      const storedEmp = await AsyncStorage.getItem(EMPOWERING_STORAGE_KEY);
      const storedShadow = await AsyncStorage.getItem(SHADOW_STORAGE_KEY);

      if (storedEmp) {
        const parsed = JSON.parse(storedEmp);
        if (Array.isArray(parsed)) {
          setEmpoweringBeliefs(parsed);
        }
      } else {
        setEmpoweringBeliefs(DEFAULT_EMPOWERING_BELIEFS);
      }

      if (storedShadow) {
        const parsed = JSON.parse(storedShadow);
        if (Array.isArray(parsed)) {
          setShadowBeliefs(parsed);
        }
      } else {
        setShadowBeliefs(DEFAULT_SHADOW_BELIEFS);
      }
    } catch (e) {
      console.log('Error loading shift beliefs from storage', e);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Initial mount
  useEffect(() => {
    loadBeliefsFromStorage();
  }, [loadBeliefsFromStorage]);

  // Reload whenever the screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadBeliefsFromStorage();
    }, [loadBeliefsFromStorage]),
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

  const handleLock = () => {
    const empoweringYes = countYes(empoweringBeliefs);
    const shadowYes = countYes(shadowBeliefs);

    let dailyScore = empoweringYes - shadowYes; // YES on shadow = -1
    if (dailyScore > 10) dailyScore = 10;
    if (dailyScore < -10) dailyScore = -10;

    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

    const checkin: Checkin = {
      id: `${today}-${Date.now()}`,
      date: today,
      pos_yes: empoweringYes,
      neg_yes: shadowYes,
      daily_score: dailyScore,
      source: 'user',
      created_at: new Date().toISOString(),
    };

    onCheckinUpdate(checkin);
    setShowDetails(false);
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
