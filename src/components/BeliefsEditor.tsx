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

import { useAppTheme } from '../theme/ThemeProvider';
import GradientCardHome from './GradientCardHome';
import GradientHintBox from './GradientHintBox';
import {
  getBeliefs,
  createBeliefQuestion,
  updateBeliefQuestion,
  deleteBeliefQuestion,
  type ApiBeliefQuestion,
} from '../lib/authService';

type BeliefsEditorProps = {
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

  if (
    lower.startsWith('today, i believed') ||
    lower.startsWith('today i believed') ||
    lower.startsWith('i believe') ||
    lower.startsWith('today i believe')
  ) {
    return trimmed;
  }

  return `Today, I believed ${trimmed}`;
};

const BeliefsEditor: React.FC<BeliefsEditorProps> = ({
  cardStyle,
  empoweringTitle = 'Empowering Beliefs (YES = +1)',
  shadowTitle = 'Shadow Beliefs (YES = -1)',
  empoweringAddLabel = '+ Add Empowering Belief',
  shadowAddLabel = '+ Add Shadow Belief',
}) => {
  const theme = useAppTheme();
  const [beliefs, setBeliefs] = useState<ApiBeliefQuestion[]>([]);
  const [shadowBeliefs, setShadowBeliefs] = useState<ApiBeliefQuestion[]>([]);

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

  // ------- LOAD FROM API ONCE -------
  useEffect(() => {
    (async () => {
      try {
        const [empoweringFromApi, shadowFromApi] = await Promise.all([
          getBeliefs('empowering'),
          getBeliefs('shadow'),
        ]);

        setBeliefs(Array.isArray(empoweringFromApi) ? empoweringFromApi : []);
        setShadowBeliefs(Array.isArray(shadowFromApi) ? shadowFromApi : []);
      } catch (e) {
        console.log('[BeliefsEditor] Error fetching beliefs from API:', e);
        setBeliefs([]);
        setShadowBeliefs([]);
      }
    })();
  }, []);

  // ------- EMPOWERING BELIEFS HANDLERS -------
  const handleAddBelief = () => {
    const temp: ApiBeliefQuestion = {
      id: `temp-${Date.now()}`,
      type: 'empowering',
      text: '',
    };
    const next = [...beliefs, temp];
    setBeliefs(next);

    const newIndex = next.length - 1;
    setEditingIndex(newIndex);
    setDraftText('Today, I believed ');
    setIsAddingNewBelief(true);
  };

  const handleEditBelief = (index: number) => {
    setEditingIndex(index);
    setDraftText(beliefs[index]?.text ?? '');
    setIsAddingNewBelief(false);
  };

  const handleSaveBelief = async () => {
    if (editingIndex === null) return;

    const current = beliefs[editingIndex];
    const trimmed = draftText.trim();

    if (!trimmed) {
      if (isAddingNewBelief) {
        const next = [...beliefs];
        next.splice(editingIndex, 1);
        setBeliefs(next);
      }
    } else {
      const finalText = isAddingNewBelief
        ? ensureStartsWithIBelieve(trimmed)
        : trimmed;

      // Optimistic local update
      const updatedItem: ApiBeliefQuestion = {
        ...current,
        type: 'empowering',
        text: finalText,
      };
      const updatedList = [...beliefs];
      updatedList[editingIndex] = updatedItem;
      setBeliefs(updatedList);

      try {
        if (isAddingNewBelief) {
          // 🔹 new user-created belief → explicitly mark as not recommended
          await createBeliefQuestion({
            type: 'empowering',
            text: finalText,
            order: updatedList.length,
            is_active: true,
            isRecommended: false,
          });
        } else if (current?.id && !current.id.startsWith('temp-')) {
          await updateBeliefQuestion(current.id, {
            type: 'empowering',
            text: finalText,
            order: current.order_index ?? editingIndex + 1,
            is_active: current.is_active ?? true,
            // keep whatever backend already has for isRecommended
            isRecommended: current.isRecommended ?? false,
          });
        }

        const fresh = await getBeliefs('empowering');
        setBeliefs(fresh);
      } catch (err) {
        console.log('[BeliefsEditor] Error saving empowering belief:', err);
      }
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

  const handleDeleteBelief = async (index: number) => {
    const belief = beliefs[index];

    // Optimistic local remove
    const next = beliefs.filter((_, i) => i !== index);
    setBeliefs(next);

    if (editingIndex === index) {
      setEditingIndex(null);
      setDraftText('');
      setIsAddingNewBelief(false);
    }

    if (belief?.id && !belief.id.startsWith('temp-')) {
      try {
        await deleteBeliefQuestion(belief.id);
        const fresh = await getBeliefs('empowering');
        setBeliefs(fresh);
      } catch (err) {
        console.log('[BeliefsEditor] Error deleting empowering belief:', err);
      }
    }
  };

  // ------- SHADOW BELIEFS HANDLERS -------
  const handleAddShadowBelief = () => {
    const temp: ApiBeliefQuestion = {
      id: `temp-${Date.now()}`,
      type: 'shadow',
      text: '',
    };
    const next = [...shadowBeliefs, temp];
    setShadowBeliefs(next);

    const newIndex = next.length - 1;
    setShadowEditingIndex(newIndex);
    setShadowDraftText('Today, I believed ');
    setIsAddingNewShadowBelief(true);
  };

  const handleEditShadowBelief = (index: number) => {
    setShadowEditingIndex(index);
    setShadowDraftText(shadowBeliefs[index]?.text ?? '');
    setIsAddingNewShadowBelief(false);
  };

  const handleSaveShadowBelief = async () => {
    if (shadowEditingIndex === null) return;

    const current = shadowBeliefs[shadowEditingIndex];
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

      const updatedItem: ApiBeliefQuestion = {
        ...current,
        type: 'shadow',
        text: finalText,
      };
      const updatedList = [...shadowBeliefs];
      updatedList[shadowEditingIndex] = updatedItem;
      setShadowBeliefs(updatedList);

      try {
        if (isAddingNewShadowBelief) {
          // 🔹 user-created shadow → not recommended
          await createBeliefQuestion({
            type: 'shadow',
            text: finalText,
            order: updatedList.length,
            is_active: true,
            isRecommended: false,
          });
        } else if (current?.id && !current.id.startsWith('temp-')) {
          await updateBeliefQuestion(current.id, {
            type: 'shadow',
            text: finalText,
            order: current.order_index ?? shadowEditingIndex + 1,
            is_active: current.is_active ?? true,
            isRecommended: current.isRecommended ?? false,
          });
        }

        const fresh = await getBeliefs('shadow');
        setShadowBeliefs(fresh);
      } catch (err) {
        console.log('[BeliefsEditor] Error saving shadow belief:', err);
      }
    }

    setShadowEditingIndex(null);
    setShadowDraftText('');
    setIsAddingNewShadowBelief(false);
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

  const handleDeleteShadowBelief = async (index: number) => {
    const belief = shadowBeliefs[index];

    const next = shadowBeliefs.filter((_, i) => i !== index);
    setShadowBeliefs(next);

    if (shadowEditingIndex === index) {
      setShadowEditingIndex(null);
      setShadowDraftText('');
      setIsAddingNewShadowBelief(false);
    }

    if (belief?.id && !belief.id.startsWith('temp-')) {
      try {
        await deleteBeliefQuestion(belief.id);
        const fresh = await getBeliefs('shadow');
        setShadowBeliefs(fresh);
      } catch (err) {
        console.log('[BeliefsEditor] Error deleting shadow belief:', err);
      }
    }
  };

  return (
    <>
      {/* Empowering beliefs */}
      <GradientCardHome
        style={[{ width: scale(330), marginVertical: scale(20) }, cardStyle]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {empoweringTitle}
        </Text>
        <View style={{ height: scale(10) }} />

        {beliefs.map((belief, idx) => {
          const isEditing = editingIndex === idx;
          const showRecommended = belief.isRecommended && !isEditing; // 🔹 only when isRecommended = true

          return (
            <React.Fragment key={belief.id ?? idx}>
              <GradientHintBox
                text={!isEditing ? belief.text : undefined}
                showRecommendedChip={showRecommended}
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
            colors={theme.colors.cardGradient}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.addButton}
          >
            <Text style={[styles.addButtonText, { color: theme.colors.text }]}>
              {empoweringAddLabel}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </GradientCardHome>

      {/* Shadow beliefs */}
      <GradientCardHome
        style={[{ width: scale(330), marginVertical: scale(20) }, cardStyle]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {shadowTitle}
        </Text>
        <View style={{ height: scale(10) }} />

        {shadowBeliefs.map((belief, idx) => {
          const isEditing = shadowEditingIndex === idx;
          const showRecommended = belief.isRecommended && !isEditing; // 🔹 same logic

          return (
            <React.Fragment key={belief.id ?? idx}>
              <GradientHintBox
                text={!isEditing ? belief.text : undefined}
                showRecommendedChip={showRecommended}
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
            colors={theme.colors.cardGradient}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.addButton}
          >
            <Text style={[styles.addButtonText, { color: theme.colors.text }]}>
              {shadowAddLabel}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </GradientCardHome>
    </>
  );
};

export default BeliefsEditor;

const styles = StyleSheet.create({
  sectionTitle: {
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
    fontSize: ms(16),
    fontWeight: '700',
    fontFamily: 'SourceSansPro-Regular',
  },
});
