// src/screens/ProfileScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import { ms, s, scale, vs } from 'react-native-size-matters';

import { palette } from '../../theme';
import GradientCardHome from '../../components/GradientCardHome';
import GradientHintBox from '../../components/GradientHintBox';
import TripleRingGauge from '../../components/TripleRingGauge';
import PrimaryButton from '../../components/PrimaryButton';
import {
  selectSectionPoints,
  selectTotalSurveyPoints,
} from '../../store/reducers/surveyReducer';
import { selectHomeOnboarding } from '../../store/reducers/homeOnboardingReducer';
import BeliefsEditor from '../../components/BeliefsEditor';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const total = useSelector(selectTotalSurveyPoints);
  const finance = useSelector(selectSectionPoints('Finance'));
  const health = useSelector(selectSectionPoints('Health & Energy'));
  const focus = useSelector(selectSectionPoints('Focus & Growth'));
  const relationships = useSelector(
    selectSectionPoints('Relationships & Belonging'),
  );
  const identity = useSelector(selectSectionPoints('Identity & Self-worth'));
  const calm = useSelector(selectSectionPoints('Calm & Resilience'));

  const onboarding = useSelector(selectHomeOnboarding);
  console.log('homeOnboarding state =>', onboarding);

  const northStarText =
    onboarding.northStar ||
    'Paint the picture of where you will be in one year—your highest potential reality…';

  const shadowPathText =
    onboarding.shadowPath ||
    "Describe the patterns, habits, or reality you're leaving behind—what your life looks like in one year if nothing shifts…";

  const displayName = onboarding.firstName?.trim() || 'Your';

  // ------- HELPERS / COMPUTATIONS -------
  const computePct = (pointsArr: number[]) => {
    console.log('pointsArr', pointsArr);
    if (!pointsArr || pointsArr.length === 0) return 0;

    const domainScore =
      pointsArr.reduce((sum, v) => sum + v, 0) / pointsArr.length;

    const percentage = Math.max(
      0,
      Math.min(100, ((domainScore + 2) / 4) * 100),
    );

    return Math.round(percentage);
  };

  const STRENGTHS = [
    { label: 'Finance', pct: computePct(finance) },
    { label: 'Health & Energy', pct: computePct(health) },
    { label: 'Focus & Growth', pct: computePct(focus) },
    { label: 'Relationship\n& Belonging', pct: computePct(relationships) },
    { label: 'Identity &\nSelf-Worth', pct: computePct(identity) },
    { label: 'Calm &\nResilience', pct: computePct(calm) },
  ];

  const sortedDomains = [...STRENGTHS]
    .filter(d => d.pct > 0)
    .sort((a, b) => b.pct - a.pct);

  let shiftPatternText =
    "As you complete more scans, we'll surface patterns about which domains drive your momentum and which ones pull you off track.";

  let bestLeverText =
    'Pick one tiny daily action in Health & Energy you\ncan complete in under two minutes.';

  if (sortedDomains.length >= 2) {
    const topA = sortedDomains[0].label;
    const topB = sortedDomains[1].label;
    const watch = sortedDomains[2]?.label;

    shiftPatternText =
      `You're strongest in ${topA} and ${topB}—you build momentum ` +
      `when you show up consistently.` +
      (watch ? ` Watch for ${watch} stories that pull you off track.` : '') +
      ` A small daily action in ${topA} is your quickest lever.`;

    bestLeverText = `Pick one tiny daily action in ${topA} you\ncan complete in under two minutes.`;
  }

  // ------- RENDER -------
  return (
    <ScrollView style={{ backgroundColor: palette.darkBlue }}>
      <View style={styles.root}>
        {/* Profile intro card */}
        <GradientCardHome
          style={{
            marginVertical: vs(20),
            marginTop: scale(50),
            width: scale(330),
          }}
        >
          <View style={{ marginBottom: s(10) }}>
            <Text style={styles.firstSectitle}>
              {`${displayName}'s Shiftality Profile`}
            </Text>
            <Text style={styles.subSectitle}>
              {
                "Based on your scan results, here's your\npersonalized reality shift blueprint"
              }
            </Text>
          </View>

          <GradientHintBox
            title="Your 1-Year North Star"
            text={northStarText}
          />
          <View style={{ height: scale(20) }} />
          <GradientHintBox
            title="Your 1-Year Shadow Star"
            text={shadowPathText}
          />
        </GradientCardHome>

        {/* Domain strengths */}
        <GradientCardHome style={{ width: scale(330) }}>
          <View style={{ marginBottom: s(10) }}>
            <Text style={styles.Sectitle}>{'Domain Strengths'}</Text>
            <Text style={styles.subSectitle}>
              {
                'Your ability to create positive shifts in\nthese specific areas'
              }
            </Text>

            <View style={{ rowGap: vs(22) }}>
              {[0, 1].map(row => (
                <View
                  key={row}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  {STRENGTHS.slice(row * 3, row * 3 + 3).map((it, idx) => {
                    const idBase = `ds-${row}-${idx}`;

                    return (
                      <View
                        key={idBase}
                        style={{ width: s(100), alignItems: 'center' }}
                      >
                        <TripleRingGauge
                          idBase={idBase}
                          valuePct={it.pct}
                          size={s(90)}
                        />
                        <Text
                          style={{
                            color: palette.white,
                            textAlign: 'center',
                            marginTop: vs(8),
                            opacity: 0.92,
                          }}
                        >
                          {it.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </GradientCardHome>

        {/* Shift insights */}
        <GradientCardHome style={{ marginVertical: vs(20), width: scale(330) }}>
          <View style={{ marginBottom: s(10) }}>
            <Text style={styles.Sectitle}>{'Your Shiftily Insights '}</Text>
            <Text style={styles.subSectitle}>
              {
                'Personalized patterns from your\nscan to help you create meaningful\nshifts'
              }
            </Text>
          </View>

          <GradientHintBox title="Your Shift Pattern" text={shiftPatternText} />
        </GradientCardHome>

        {/* What might slow your shift */}
        <GradientCardHome
          style={{
            width: scale(330),
            marginBottom: vs(20),
          }}
        >
          <View style={{ marginBottom: s(10) }}>
            <Text style={styles.Sectitle}>{'What might slow your shift'}</Text>
          </View>

          <GradientHintBox
            title="Perfection loop"
            text={
              "When things aren't perfect, you may delay or avoid starting."
            }
          />
          <View style={{ height: scale(20) }} />
          <GradientHintBox
            title="Scarcity lens"
            text={'You might see opportunities as rare or out of reach.'}
          />
          <View style={{ marginTop: scale(20) }}>
            <Text style={styles.Sectitle}>{'Your best lever right now:'}</Text>
            <Text style={styles.sublensSectitle}>{bestLeverText}</Text>
          </View>
        </GradientCardHome>

        {/* CTA: Start shift */}
        <GradientCardHome
          style={{
            width: scale(330),
          }}
        >
          <View style={{ marginBottom: s(10) }}>
            <Text style={styles.Sectitle}>{'Start Your Reality Shift'}</Text>
            <Text style={styles.sublensSectitle}>
              {
                "Daily check-ins are the foundation of your reality shift. By consist tly tracking your beliefs, you create awareness of your thought patterns and can consciously choose empowering beliefs over limiting ones. This simple practice compounds over time, gradually shifting your reality toward your highest potential.\n\nThese daily checks keep your shift measurable. YES on Empowering adds +1; YES on Shadow subtracts-1; totals cap at ±10. Over time your Shift Map stows ii' you're trending toward your Highest Vibration or drifting toward your Shadow Path."
              }
            </Text>

            <View style={{ height: scale(10) }} />

            <PrimaryButton
              textColor={palette.white}
              style={{
                width: '100%',
                height: 'auto',
                color: palette.white,
                fontSize: ms(14.5),
                fontWeight: '700',
                fontFamily: 'SourceSansPro-Regular',
              }}
              title={'Start Your Reality Shift'}
              onPress={() => navigation.navigate('Search' as never)}
            />

            <View style={{ height: scale(10) }} />

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.ctaWrap}
              onPress={() => console.log('Edit Belief Set')}
            >
              <LinearGradient
                colors={['#143f65ff', '#1C2A3A']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.cta}
              >
                <Text style={styles.ctaTextMuted}>Edit Belief Set</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </GradientCardHome>

        {/* Empowering & Shadow beliefs (reusable block) */}
        <BeliefsEditor />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: scale(30),
  },
  firstSectitle: {
    color: palette.white,
    fontSize: ms(22),
    fontWeight: '600',
    marginVertical: vs(4),
    textAlign: 'left',
    fontFamily: 'SourceSansPro-Regular',
  },
  Sectitle: {
    color: palette.white,
    fontSize: ms(22),
    fontWeight: '600',
    marginVertical: vs(4),
    textAlign: 'left',
    fontFamily: 'SourceSansPro-Regular',
  },
  subSectitle: {
    color: palette.white,
    fontSize: ms(16),
    fontWeight: '500',
    marginVertical: vs(8),
    textAlign: 'left',
    fontFamily: 'SourceSansPro-Regular',
  },
  sublensSectitle: {
    color: palette.white,
    fontSize: ms(15),
    fontWeight: '500',
    marginVertical: vs(8),
    textAlign: 'left',
    fontFamily: 'SourceSansPro-Regular',
  },
  grid: {
    marginTop: vs(8),
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: vs(18),
  },
  cell: {
    width: (scale(330) - s(16) * 2 - s(12) * 2) / 3,
    alignItems: 'center',
  },
  gaugeWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(8),
  },
  gaugePct: {
    position: 'absolute',
    color: palette.white,
    fontWeight: '800',
    fontSize: ms(13),
    fontFamily: 'SourceSansPro-Regular',
  },
  cellLabel: {
    color: palette.white,
    textAlign: 'center',
    fontSize: ms(12),
    lineHeight: ms(16),
    fontFamily: 'SourceSansPro-Regular',
  },
  ctaWrap: {
    width: scale(50),
  },
  cta: {
    width: scale(300),
    height: vs(40),
    borderRadius: s(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTextMuted: {
    color: palette.txtBlue,
    fontSize: ms(14.5),
    fontWeight: '700',
    opacity: 0.9,
    fontFamily: 'SourceSansPro-Regular',
  },
});
