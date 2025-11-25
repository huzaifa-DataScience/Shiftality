// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';

import { palette } from '../../theme';
import GradientCardHome from '../../components/GradientCardHome';
import GradientHintBox from '../../components/GradientHintBox';
import RingGauge from '../../components/TripleRingGauge';
import TripleRingGauge from '../../components/TripleRingGauge';
import PrimaryButton from '../../components/PrimaryButton';
import {
  selectSectionPoints,
  selectTotalSurveyPoints,
} from '../../store/reducers/surveyReducer';
import { selectHomeOnboarding } from '../../store/reducers/homeOnboardingReducer';

const EMPOWERING_STORAGE_KEY = 'profile_empowering_beliefs_v1';
const SHADOW_STORAGE_KEY = 'profile_shadow_beliefs_v1';

const DEFAULT_BELIEFS: string[] = [
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

  const [beliefs, setBeliefs] = useState<string[]>(DEFAULT_BELIEFS);
  const [shadowBeliefs, setShadowBeliefs] = useState<string[]>(
    DEFAULT_SHADOW_BELIEFS,
  );

  // which index is currently being edited (or null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftText, setDraftText] = useState('');
  const [isAddingNewBelief, setIsAddingNewBelief] = useState(false);
  const [isAddingNewShadowBelief, setIsAddingNewShadowBelief] = useState(false);

  const [shadowEditingIndex, setShadowEditingIndex] = useState<number | null>(
    null,
  );
  const [shadowDraftText, setShadowDraftText] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  const displayName = onboarding.firstName?.trim() || 'Your';

  // ------- LOAD FROM LOCAL STORAGE ONCE -------
  useEffect(() => {
    (async () => {
      try {
        const storedEmpowering = await AsyncStorage.getItem(
          EMPOWERING_STORAGE_KEY,
        );
        const storedShadow = await AsyncStorage.getItem(SHADOW_STORAGE_KEY);

        if (storedEmpowering) {
          const parsed = JSON.parse(storedEmpowering);
          if (Array.isArray(parsed)) {
            setBeliefs(parsed);
          }
        }

        if (storedShadow) {
          const parsed = JSON.parse(storedShadow);
          if (Array.isArray(parsed)) {
            setShadowBeliefs(parsed);
          }
        }
      } catch (e) {
        console.log('Error loading beliefs from storage', e);
      } finally {
        setIsHydrated(true);
      }
    })();
  }, []);

  // ------- SAVE TO LOCAL STORAGE WHEN CHANGED -------
  useEffect(() => {
    if (!isHydrated) return; // avoid overwriting stored values before initial load

    (async () => {
      try {
        await AsyncStorage.setItem(
          EMPOWERING_STORAGE_KEY,
          JSON.stringify(beliefs),
        );
      } catch (e) {
        console.log('Error saving empowering beliefs', e);
      }
    })();
  }, [beliefs, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;

    (async () => {
      try {
        await AsyncStorage.setItem(
          SHADOW_STORAGE_KEY,
          JSON.stringify(shadowBeliefs),
        );
      } catch (e) {
        console.log('Error saving shadow beliefs', e);
      }
    })();
  }, [shadowBeliefs, isHydrated]);

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

  // ------- EMPOWERING BELIEFS HANDLERS -------
  const handleAddBelief = () => {
    const next = [...beliefs, ''];
    setBeliefs(next);

    const newIndex = next.length - 1;
    setEditingIndex(newIndex);
    setDraftText('');
    setIsAddingNewBelief(true);
  };

  const handleEditBelief = (index: number) => {
    setEditingIndex(index);
    setDraftText(beliefs[index] ?? '');
    setIsAddingNewBelief(false);
  };

  const handleSaveBelief = () => {
    if (editingIndex === null) return;

    const trimmed = draftText.trim();
    if (!trimmed) {
      if (isAddingNewBelief) {
        const next = [...beliefs];
        next.splice(editingIndex, 1);
        setBeliefs(next);
      }
    } else {
      const updated = [...beliefs];
      updated[editingIndex] = trimmed;
      setBeliefs(updated);
    }

    setEditingIndex(null);
    setDraftText('');
    setIsAddingNewBelief(false);
  };

  const handleBlurBelief = (index: number) => {
    if (editingIndex !== index) return;

    if (!draftText.trim()) {
      if (isAddingNewBelief) {
        const next = [...beliefs];
        next.splice(index, 1);
        setBeliefs(next);
      }
      setEditingIndex(null);
      setDraftText('');
      setIsAddingNewBelief(false);
    }
  };

  // ------- SHADOW BELIEFS HANDLERS -------
  const handleEditShadowBelief = (index: number) => {
    setShadowEditingIndex(index);
    setShadowDraftText(shadowBeliefs[index] ?? '');
    setIsAddingNewShadowBelief(false);
  };

  const handleSaveShadowBelief = () => {
    if (shadowEditingIndex === null) return;

    const trimmed = shadowDraftText.trim();
    if (!trimmed) {
      if (isAddingNewShadowBelief) {
        const next = [...shadowBeliefs];
        next.splice(shadowEditingIndex, 1);
        setShadowBeliefs(next);
      }
    } else {
      const updated = [...shadowBeliefs];
      updated[shadowEditingIndex] = trimmed;
      setShadowBeliefs(updated);
    }

    setShadowEditingIndex(null);
    setShadowDraftText('');
    setIsAddingNewShadowBelief(false);
  };

  const handleAddShadowBelief = () => {
    const next = [...shadowBeliefs, ''];
    setShadowBeliefs(next);

    const newIndex = next.length - 1;
    setShadowEditingIndex(newIndex);
    setShadowDraftText('');
    setIsAddingNewShadowBelief(true);
  };

  const handleBlurShadowBelief = (index: number) => {
    if (shadowEditingIndex !== index) return;

    if (!shadowDraftText.trim()) {
      if (isAddingNewShadowBelief) {
        const next = [...shadowBeliefs];
        next.splice(index, 1);
        setShadowBeliefs(next);
      }
      setShadowEditingIndex(null);
      setShadowDraftText('');
      setIsAddingNewShadowBelief(false);
    }
  };

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
              onPress={() => navigation.navigate('Search')}
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

        {/* Empowering beliefs */}
        <GradientCardHome
          style={{
            width: scale(330),
            marginVertical: scale(20),
          }}
        >
          <Text style={styles.Sectitle}>{'Empowering Beliefs (YES = +1)'}</Text>
          <View style={{ height: scale(10) }} />

          {beliefs.map((belief, idx) => {
            const isEditing = editingIndex === idx;

            return (
              <React.Fragment key={idx}>
                <GradientHintBox
                  text={!isEditing ? belief : undefined}
                  showRecommendedChip
                  showEditButton={!isEditing}
                  editIcon={require('../../assets/edit.png')}
                  onPressEdit={() => handleEditBelief(idx)}
                  showInput={isEditing}
                  inputValue={draftText}
                  onChangeInputText={setDraftText}
                  inputPlaceholder="Type your empowering belief..."
                  inputProps={{
                    maxLength: 200,
                    onBlur: () => handleBlurBelief(idx),
                  }}
                  footerActionLabel={isEditing ? 'Save' : undefined}
                  onPressFooterAction={isEditing ? handleSaveBelief : undefined}
                />

                <View style={{ height: scale(10) }} />
              </React.Fragment>
            );
          })}

          <TouchableOpacity
            activeOpacity={0.9}
            style={{ alignSelf: 'flex-start', marginTop: vs(4), width: '100%' }}
            onPress={handleAddBelief}
          >
            <LinearGradient
              colors={['#143f65ff', '#1C2A3A']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{
                height: vs(32),
                borderRadius: s(20),
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: palette.txtBlue,
                  fontSize: ms(16),
                  fontWeight: '700',
                  fontFamily: 'SourceSansPro-Regular',
                }}
              >
                + Add Empowering Belief
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </GradientCardHome>

        {/* Shadow beliefs */}
        <GradientCardHome
          style={{
            width: scale(330),
            marginVertical: scale(20),
          }}
        >
          <Text style={styles.Sectitle}>{'Shadow Beliefs (YES = -1)'}</Text>
          <View style={{ height: scale(10) }} />

          {shadowBeliefs.map((belief, idx) => {
            const isEditing = shadowEditingIndex === idx;

            return (
              <React.Fragment key={idx}>
                <GradientHintBox
                  text={!isEditing ? belief : undefined}
                  showRecommendedChip
                  showEditButton={!isEditing}
                  editIcon={require('../../assets/edit.png')}
                  onPressEdit={() => handleEditShadowBelief(idx)}
                  showInput={isEditing}
                  inputValue={shadowDraftText}
                  onChangeInputText={setShadowDraftText}
                  inputPlaceholder="Type your shadow belief..."
                  inputProps={{
                    maxLength: 200,
                    onBlur: () => handleBlurShadowBelief(idx),
                  }}
                  footerActionLabel={isEditing ? 'Save' : undefined}
                  onPressFooterAction={
                    isEditing ? handleSaveShadowBelief : undefined
                  }
                />

                <View style={{ height: scale(10) }} />
              </React.Fragment>
            );
          })}

          <TouchableOpacity
            activeOpacity={0.9}
            style={{ alignSelf: 'flex-start', marginTop: vs(4), width: '100%' }}
            onPress={handleAddShadowBelief}
          >
            <LinearGradient
              colors={['#143f65ff', '#1C2A3A']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{
                height: vs(32),
                borderRadius: s(20),
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: palette.txtBlue,
                  fontSize: ms(16),
                  fontWeight: '700',
                  fontFamily: 'SourceSansPro-Regular',
                }}
              >
                + Add Shadow Belief
              </Text>
            </LinearGradient>
          </TouchableOpacity>
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
