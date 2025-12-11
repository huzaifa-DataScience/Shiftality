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
import { ms, s, scale, vs } from 'react-native-size-matters';

import { palette } from '../theme';
import GradientCardHome from './GradientCardHome';
import GradientHintBox from './GradientHintBox';
import { getBeliefs } from '../lib/authService';

const DEFAULT_EMPOWERING_STORAGE_KEY = 'profile_empowering_beliefs_v1';
const DEFAULT_SHADOW_STORAGE_KEY = 'profile_shadow_beliefs_v1';

// Keeping types for future flexibility, but we won't use static defaults now
type BeliefsEditorProps = {
  empoweringStorageKey?: string; // legacy, unused
  shadowStorageKey?: string; // legacy, unused

  defaultEmpoweringBeliefs?: string[]; // not used for now
  defaultShadowBeliefs?: string[]; // not used for now

  cardStyle?: StyleProp<ViewStyle>;

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
  empoweringStorageKey = DEFAULT_EMPOWERING_STORAGE_KEY, // unused, legacy
  shadowStorageKey = DEFAULT_SHADOW_STORAGE_KEY, // unused, legacy
  defaultEmpoweringBeliefs, // unused (for now)
  defaultShadowBeliefs, // unused (for now)
  cardStyle,
  empoweringTitle = 'Empowering Beliefs (YES = +1)',
  shadowTitle = 'Shadow Beliefs (YES = -1)',
  empoweringAddLabel = '+ Add Empowering Belief',
  shadowAddLabel = '+ Add Shadow Belief',
}) => {
  const [beliefs, setBeliefs] = useState<string[]>([]);
  const [shadowBeliefs, setShadowBeliefs] = useState<string[]>([]);

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

  // ------- LOAD FROM API ONCE (NO STATIC FALLBACK) -------
  useEffect(() => {
    (async () => {
      try {
        const [empoweringFromApi, shadowFromApi] = await Promise.all([
          getBeliefs('empowering'),
          getBeliefs('shadow'),
        ]);
        console.log('empoweringFromApi:', empoweringFromApi);
        console.log('shadowFromApi:', shadowFromApi);

        // If API returns nothing, we just show empty lists
        setBeliefs(Array.isArray(empoweringFromApi) ? empoweringFromApi : []);
        setShadowBeliefs(Array.isArray(shadowFromApi) ? shadowFromApi : []);
      } catch (e) {
        console.log('[BeliefsEditor] Error fetching beliefs from API:', e);
        // No static defaults: just show nothing if it fails
        setBeliefs([]);
        setShadowBeliefs([]);
      }
    })();
  }, []);

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
      // enforce "Today, I believed ..." only for newly added beliefs
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

  const handleDeleteBelief = (index: number) => {
    const next = beliefs.filter((_, i) => i !== index);
    setBeliefs(next);

    if (editingIndex === index) {
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
    setShadowDraftText('Today, I believed ');
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

          return (
            <React.Fragment key={idx}>
              <GradientHintBox
                text={!isEditing ? belief : undefined}
                // 🔹 Show "Recommended" on ALL beliefs when not editing
                showRecommendedChip={!isEditing}
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

          return (
            <React.Fragment key={idx}>
              <GradientHintBox
                text={!isEditing ? belief : undefined}
                // 🔹 Show "Recommended" on ALL beliefs when not editing
                showRecommendedChip={!isEditing}
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
