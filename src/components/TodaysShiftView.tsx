// src/screens/TodaysShiftView.tsx
import React, { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  LayoutChangeEvent,
  Image,
} from 'react-native';
import {
  scale as s,
  scale,
  verticalScale as vs,
} from 'react-native-size-matters';
import GradientBoxWithButton from '../components/GradientBoxWithButton';
import GradientHintBoxWithLikert from '../components/GradientHintBoxWithLikert';
import LinearGradient from 'react-native-linear-gradient';
import { TouchableOpacity } from 'react-native';
import { palette } from '../theme';
import Svg, {
  Defs,
  Rect,
  Stop,
  LinearGradient as SvgGrad,
} from 'react-native-svg';

export default function TodaysShiftView() {
  const [showDetails, setShowDetails] = useState(false);

  // Example beliefs data
  const empoweringBeliefs = [
    'Opportunities show up when I show up.',
    'Small choices can shift my energy.',
    'A low moment doesn’t define the day.',
    'Reaching out first is safe for me.',
    'I keep promises to future me.',
    'I am enough as I grow.',
    'Challenges are feedback, not failure.',
    'I bounce back when things go wrong.',
  ];

  const shadowBeliefs = [
    'Money is scarce and hard for me to get.',
    'I’ll be misunderstood or rejected.',
    'Change isn’t really available to me.',
    'Stress is who I am.',
  ];

  // State to track selections (yes/no/null)
  const [responses, setResponses] = useState<
    Record<string, 'yes' | 'no' | null>
  >({});

  const countYes = (list: string[]) =>
    list.reduce((n, key) => n + (responses[key] === 'yes' ? 1 : 0), 0);

  // mark all in a section to 'yes' or 'no'
  const markAll = (list: string[], value: 'yes' | 'no') => {
    const patch: Record<string, 'yes' | 'no'> = {};
    list.forEach(k => (patch[k] = value));
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
    console.log('Final Responses:', responses);
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
            {countYes(empoweringBeliefs)}/{empoweringBeliefs.length}
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
            key={idx}
            text={`Today, I believed ${belief}`}
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
            {countYes(shadowBeliefs)}/{shadowBeliefs.length}
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
            key={idx}
            text={`Today, I believed ${belief}`}
            selected={responses[belief] ?? null}
            onSelect={val => handleSelect(belief, val)}
          />
        ))}

        {/* Score Display */}
        <Text style={styles.scoreText}>
          Today's score: (+
          {Object.values(responses).filter(v => v === 'yes').length}) + (-
          {Object.values(responses).filter(v => v === 'no').length}) ={' '}
          {Object.values(responses).filter(v => v === 'yes').length -
            Object.values(responses).filter(v => v === 'no').length}
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
    color: '#f9fbfbff', // link-like cyan
    fontSize: s(12.5),
    fontWeight: '700',
    fontFamily: 'SourceSansPro-Regular',
  },
});
