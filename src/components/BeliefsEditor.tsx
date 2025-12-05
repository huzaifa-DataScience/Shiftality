// src/components/BeliefsEditor.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ms, s, scale, vs } from 'react-native-size-matters';

import { palette } from '../theme';
import GradientCardHome from './GradientCardHome';
import GradientHintBox from './GradientHintBox';

const DEFAULT_EMPOWERING_STORAGE_KEY = 'profile_empowering_beliefs_v1';
const DEFAULT_SHADOW_STORAGE_KEY = 'profile_shadow_beliefs_v1';

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

type BeliefsEditorProps = {
  /**
   * Optional override for AsyncStorage key for empowering beliefs.
   * Defaults to "profile_empowering_beliefs_v1"
   */
  empoweringStorageKey?: string;
  /**
   * Optional override for AsyncStorage key for shadow beliefs.
   * Defaults to "profile_shadow_beliefs_v1"
   */
  shadowStorageKey?: string;

  /**
   * Optional defaults if you want different initial sets in some screen.
   */
  defaultEmpoweringBeliefs?: string[];
  defaultShadowBeliefs?: string[];

  /**
   * Card-level style override (applied to both cards).
   */
  cardStyle?: StyleProp<ViewStyle>;

  /**
   * Section titles / labels
   */
  empoweringTitle?: string;
  shadowTitle?: string;
  empoweringAddLabel?: string;
  shadowAddLabel?: string;
};

// Ensures a belief sentence starts with "Today, I believed ..."
const ensureStartsWithIBelieve = (raw: string): string => {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase();

  // if user already wrote "Today, I believed ..." or variations, don't touch it
  if (
    lower.startsWith('today, i believed') ||
    lower.startsWith('today i believed') ||
    lower.startsWith('i believe') ||
    lower.startsWith('today i believe')
  ) {
    return trimmed;
  }

  // otherwise prefix it with "Today, I believed"
  return `Today, I believed ${trimmed}`;
};

const BeliefsEditor: React.FC<BeliefsEditorProps> = ({
  empoweringStorageKey = DEFAULT_EMPOWERING_STORAGE_KEY,
  shadowStorageKey = DEFAULT_SHADOW_STORAGE_KEY,
  defaultEmpoweringBeliefs = DEFAULT_BELIEFS,
  defaultShadowBeliefs = DEFAULT_SHADOW_BELIEFS,
  cardStyle,
  empoweringTitle = 'Empowering Beliefs (YES = +1)',
  shadowTitle = 'Shadow Beliefs (YES = -1)',
  empoweringAddLabel = '+ Add Empowering Belief',
  shadowAddLabel = '+ Add Shadow Belief',
}) => {
  const [beliefs, setBeliefs] = useState<string[]>(defaultEmpoweringBeliefs);
  const [shadowBeliefs, setShadowBeliefs] =
    useState<string[]>(defaultShadowBeliefs);

  const [isHydrated, setIsHydrated] = useState(false);

  // Empowering editing
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftText, setDraftText] = useState('');
  const [isAddingNewBelief, setIsAddingNewBelief] = useState(false);

  // Shadow editing
  const [shadowEditingIndex, setShadowEditingIndex] = useState<number | null>(
    null,
  );
  const [shadowDraftText, setShadowDraftText] = useState('');
  const [isAddingNewShadowBelief, setIsAddingNewShadowBelief] = useState(false);

  // ------- LOAD FROM LOCAL STORAGE ONCE -------
  useEffect(() => {
    (async () => {
      try {
        const storedEmpowering = await AsyncStorage.getItem(
          empoweringStorageKey,
        );
        const storedShadow = await AsyncStorage.getItem(shadowStorageKey);

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
  }, [empoweringStorageKey, shadowStorageKey]);

  // ------- SAVE EMPOWERING TO STORAGE WHEN CHANGED -------
  useEffect(() => {
    if (!isHydrated) return;

    (async () => {
      try {
        await AsyncStorage.setItem(
          empoweringStorageKey,
          JSON.stringify(beliefs),
        );
      } catch (e) {
        console.log('Error saving empowering beliefs', e);
      }
    })();
  }, [beliefs, isHydrated, empoweringStorageKey]);

  // ------- SAVE SHADOW TO STORAGE WHEN CHANGED -------
  useEffect(() => {
    if (!isHydrated) return;

    (async () => {
      try {
        await AsyncStorage.setItem(
          shadowStorageKey,
          JSON.stringify(shadowBeliefs),
        );
      } catch (e) {
        console.log('Error saving shadow beliefs', e);
      }
    })();
  }, [shadowBeliefs, isHydrated, shadowStorageKey]);

  // ------- EMPOWERING BELIEFS HANDLERS -------
  const handleAddBelief = () => {
    const next = [...beliefs, ''];
    setBeliefs(next);

    const newIndex = next.length - 1;
    setEditingIndex(newIndex);
    setDraftText('Today, I believed '); // Pre-fill with prefix
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
      // ⬇️ enforce "I believe ..." only for newly added beliefs
      const finalText = isAddingNewBelief
        ? ensureStartsWithIBelieve(trimmed)
        : trimmed;

      const updated = [...beliefs];
      updated[editingIndex] = finalText;
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
      // ⬇️ enforce "I believe ..." only for newly added shadow beliefs
      const finalText = isAddingNewShadowBelief
        ? ensureStartsWithIBelieve(trimmed)
        : trimmed;

      const updated = [...shadowBeliefs];
      updated[shadowEditingIndex] = finalText;
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
    setShadowDraftText('Today, I believed '); // Pre-fill with prefix
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
  const handleDeleteBelief = (index: number) => {
    const next = beliefs.filter((_, i) => i !== index);
    setBeliefs(next);

    // reset editing state if we just deleted the one being edited
    if (editingIndex === index) {
      setEditingIndex(null);
      setDraftText('');
      setIsAddingNewBelief(false);
    }
  };
  const handleDeleteShadowBelief = (index: number) => {
    const next = shadowBeliefs.filter((_, i) => i !== index);
    setShadowBeliefs(next);

    if (shadowEditingIndex === index) {
      setShadowEditingIndex(null);
      setShadowDraftText('');
      setIsAddingNewShadowBelief(false);
    }
  };

  return (
    <>
      {/* Empowering beliefs */}
      <GradientCardHome
        style={[
          {
            width: scale(330),
            marginVertical: scale(20),
          },
          cardStyle,
        ]}
      >
        <Text style={styles.sectionTitle}>{empoweringTitle}</Text>
        <View style={{ height: scale(10) }} />

        {beliefs.map((belief, idx) => {
          const isEditing = editingIndex === idx;
          const isRecommended = DEFAULT_BELIEFS.includes(belief);

          return (
            <React.Fragment key={idx}>
              <GradientHintBox
                text={!isEditing ? belief : undefined}
                showRecommendedChip={isRecommended && !isEditing}
                showEditButton={!isEditing}
                editIcon={require('../assets/edit.png')}
                onPressEdit={() => handleEditBelief(idx)}
                showDeleteButton={!isEditing}
                deleteIcon={require('../assets/delete.png')}
                onPressDelete={() => handleDeleteBelief(idx)}
                showInput={isEditing}
                inputValue={draftText}
                onChangeInputText={setDraftText}
                inputPlaceholder="Type your empowering belief..."
                inputProps={{
                  maxLength: 200,
                  onBlur: () => handleBlurBelief(idx),
                  autoFocus: isAddingNewBelief && isEditing,
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
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>{empoweringAddLabel}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </GradientCardHome>

      {/* Shadow beliefs */}
      <GradientCardHome
        style={[
          {
            width: scale(330),
            marginVertical: scale(20),
          },
          cardStyle,
        ]}
      >
        <Text style={styles.sectionTitle}>{shadowTitle}</Text>
        <View style={{ height: scale(10) }} />

        {shadowBeliefs.map((belief, idx) => {
          const isEditing = shadowEditingIndex === idx;
          const isRecommended = DEFAULT_SHADOW_BELIEFS.includes(belief); // 👈 only defaults

          return (
            <React.Fragment key={idx}>
              <GradientHintBox
                text={!isEditing ? belief : undefined}
                showRecommendedChip={isRecommended && !isEditing} // 👈 changed
                showEditButton={!isEditing}
                editIcon={require('../assets/edit.png')}
                onPressEdit={() => handleEditShadowBelief(idx)}
                showDeleteButton={!isEditing}
                deleteIcon={require('../assets/delete.png')}
                onPressDelete={() => handleDeleteShadowBelief(idx)}
                showInput={isEditing}
                inputValue={shadowDraftText}
                onChangeInputText={setShadowDraftText}
                inputPlaceholder="Type your shadow belief..."
                inputProps={{
                  maxLength: 200,
                  onBlur: () => handleBlurShadowBelief(idx),
                  autoFocus: isAddingNewShadowBelief && isEditing,
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
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>{shadowAddLabel}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </GradientCardHome>
    </>
  );
};

export default BeliefsEditor;

const styles = StyleSheet.create({
  sectionTitle: {
    color: palette.white,
    fontSize: ms(22),
    fontWeight: '600',
    marginVertical: vs(4),
    textAlign: 'left',
    fontFamily: 'SourceSansPro-Regular',
  },
  addButton: {
    height: vs(32),
    borderRadius: s(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: palette.txtBlue,
    fontSize: ms(16),
    fontWeight: '700',
    fontFamily: 'SourceSansPro-Regular',
  },
});
