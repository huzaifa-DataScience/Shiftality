// src/screens/ProfileScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { palette } from '../../theme';
import { ms, s, scale, vs } from 'react-native-size-matters';
import GradientCardHome from '../../components/GradientCardHome';
import GradientHintBox from '../../components/GradientHintBox';
import RingGauge from '../../components/TripleRingGauge';
import TripleRingGauge from '../../components/TripleRingGauge';
import PrimaryButton from '../../components/PrimaryButton';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import {
  selectSectionPoints,
  selectTotalSurveyPoints,
} from '../../store/surveyReducer';
export default function ProfileScreen() {
  const total = useSelector(selectTotalSurveyPoints);
  console.log('total ==> ', total);
  const finance = useSelector(selectSectionPoints('Finance'));
  console.log('total finance ==> ', finance);
  const health = useSelector(selectSectionPoints('Health & Energy'));
  console.log('total health ==> ', health);
  const focus = useSelector(selectSectionPoints('Focus & Growth'));
  console.log('total focus ==> ', focus);

  const relationships = useSelector(
    selectSectionPoints('Relationships & Belonging'),
  );
  console.log('total relationships ==> ', relationships);
  const identity = useSelector(selectSectionPoints('Identity & Self-worth'));
  console.log('total identity ==> ', identity);
  const calm = useSelector(selectSectionPoints('Calm & Resilience'));
  console.log('total calm ==> ', calm);

  const computePct = (pointsArr: number[]) => {
    if (!pointsArr || pointsArr.length === 0) return 0;

    const sum = pointsArr.reduce((a, b) => a + b, 0);
    const totalQuestions = pointsArr.length;

    return Math.round((sum / totalQuestions) * 100);
  };

  const STRENGTHS = [
    { label: 'Finance', pct: computePct(finance) },
    { label: 'Health & Energy', pct: computePct(health) },
    { label: 'Focus & Growth', pct: computePct(focus) },
    { label: 'Relationship\n& Belonging', pct: computePct(relationships) },
    { label: 'Identity &\nSelf-Worth', pct: computePct(identity) },
    { label: 'Calm &\nResilience', pct: computePct(calm) },
  ];

  return (
    <ScrollView style={{ backgroundColor: palette.darkBlue }}>
      <View style={styles.root}>
        <GradientCardHome
          style={{
            marginVertical: vs(20),
            marginTop: scale(50),
            width: scale(330),
          }}
        >
          <View style={{ marginBottom: s(10) }}>
            <Text style={styles.firstSectitle}>
              {"Huzaifa's Shiftality Profile"}
            </Text>
            <Text style={styles.subSectitle}>
              {
                "Based on your scan results, here's your\npersonalized reality shift blueprint"
              }
            </Text>
          </View>

          <GradientHintBox
            title="Your 1-Year North Star"
            text={
              'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
            }
          />
          <View style={{ height: scale(20) }} />
          <GradientHintBox
            title="Your 1-Year Shadow Star"
            text={
              'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
            }
          />
        </GradientCardHome>

        <GradientCardHome style={{ width: scale(330) }}>
          <View style={{ marginBottom: s(10) }}>
            <Text style={styles.Sectitle}>{'Domain Strengths'}</Text>
            <Text style={styles.subSectitle}>
              {
                'Your ability to create positive shifts in\nthese specific areas'
              }
            </Text>
            <View style={{ rowGap: vs(22) }}>
              {/* 2 rows × 3 cols */}
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

        <GradientCardHome style={{ marginVertical: vs(20), width: scale(330) }}>
          <View style={{ marginBottom: s(10) }}>
            <Text style={styles.Sectitle}>{'Your Shiftily Insights '}</Text>
            <Text style={styles.subSectitle}>
              {
                'Personalized patterns from your\nscan to help you create meaningful\nshifts'
              }
            </Text>
          </View>

          <GradientHintBox
            title="Your Shift Pattern"
            text={
              "You're strongest in Health & Energy and\nIdentity & Selt-Worth-you build momentum\nwhen you show up consistently. Watch for\nFinance stories that pull you off track. A\nSmall daily action in Health & Energy is your\nquickest lever."
            }
          />
        </GradientCardHome>

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
            title="Scarcity lens"
            text={'You might see opportunities as rare or out of\nreach.'}
          />
          <View style={{ height: scale(20) }} />
          <GradientHintBox
            title="Scarcity lens"
            text={'You might see opportunities as rare or out of\nreach.'}
          />
          <View style={{ marginTop: scale(20) }}>
            <Text style={styles.Sectitle}>{'Your best lever right now:'}</Text>
            <Text style={styles.sublensSectitle}>
              {
                'Pick one tiny daily action in Health & Energy you\ncan complete in under two minutes.'
              }
            </Text>
          </View>
        </GradientCardHome>

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
              onPress={() => console.log('Start')}
            />
            <View style={{ height: scale(10) }} />

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.ctaWrap}
              onPress={() => console.log('Back')}
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

        <GradientCardHome
          style={{
            width: scale(330),
            marginVertical: scale(20),
          }}
        >
          <Text style={styles.Sectitle}>{'Empowering Beliefs (YES = +1)'}</Text>
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
        </GradientCardHome>
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
  ctaWrap: { width: scale(50) },
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
