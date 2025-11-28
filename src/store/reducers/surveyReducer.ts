// src/store/reducers/surveySlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { SECTIONS } from '../../screens/survey/sections';
import { RootState } from '../rootReducer';

export type LikertValue =
  | 's_agree'
  | 'agree'
  | 'unsure'
  | 'disagree'
  | 's_disagree';

const POINT_MAP: Record<LikertValue, number> = {
  s_agree: 2,
  agree: 1,
  unsure: 0,
  disagree: -1,
  s_disagree: -2,
};

export interface SurveyState {
  answers: Record<string, number>; // section-question → points
  totalPoints: number;
}

const initialState: SurveyState = {
  answers: {},
  totalPoints: 0,
};

export const saveSurveyAnswer = createAsyncThunk(
  'survey/saveSurveyAnswer',
  async (payload: {
    sectionIndex: number; // 0-5
    questionIndex: number; // 0-4
    value: LikertValue;
  }) => payload,
);

const surveySlice = createSlice({
  name: 'survey',
  initialState,
  reducers: {
    resetSurvey(state) {
      state.answers = {};
      state.totalPoints = 0;
    },
  },
  extraReducers: builder => {
    builder.addCase(saveSurveyAnswer.fulfilled, (state, action) => {
      const { sectionIndex, questionIndex, value } = action.payload;

      const key = `${sectionIndex}_${questionIndex}`;
      const points = POINT_MAP[value];

      state.answers[key] = points;

      state.totalPoints = Object.values(state.answers).reduce(
        (sum, v) => sum + v,
        0,
      );
    });
  },
});

export const { resetSurvey } = surveySlice.actions;
export default surveySlice.reducer;

// ───────────────── SELECTORS ─────────────────

// 1. Total Points
export const selectTotalSurveyPoints = (state: RootState) =>
  state.survey.totalPoints;

// 2. Section Points (already had – leaving as is)
export const selectSectionPoints =
  (sectionTitle: string) => (state: RootState) => {
    const sectionIndex = SECTIONS.findIndex(s => s.title === sectionTitle);

    if (sectionIndex === -1) return []; // section not found

    const pointsArray: number[] = [];

    for (let q = 0; q < SECTIONS[sectionIndex].questions.length; q++) {
      const key = `${sectionIndex}_${q}`;
      pointsArray.push(state.survey.answers[key] ?? 0);
    }

    return pointsArray;
  };

export const selectQuestionPoints =
  (sectionTitle: string, questionIndex: number) => (state: RootState) => {
    const sectionIndex = SECTIONS.findIndex(s => s.title === sectionTitle);
    if (sectionIndex === -1) return 0;
    const key = `${sectionIndex}_${questionIndex}`;
    return state.survey.answers[key] ?? 0;
  };

// ───────────────── BELIEF PROFILE (INDEX + ARCHETYPE) ─────────────────

const TOTAL_QUESTIONS = SECTIONS.reduce(
  (sum, section) => sum + section.questions.length,
  0,
);

// Map archetypes to their top 2 domains (section titles)
const ARCHETYPE_MAP: Record<
  string,
  {
    domains: [string, string];
    description: string;
  }
> = {
  'Calm Builder': {
    domains: ['Calm & Resilience', 'Identity & Self-Worth'],
    description: 'Steady inner state, self-trust rising...',
  },
  'Focused Maker': {
    domains: ['Focus & Growth', 'Identity & Self-Worth'],
    description: 'Clarity + follow-through...',
  },
  'Optimistic Steward': {
    domains: ['Finance', 'Focus & Growth'],
    description: 'Resourceful, pragmatic, expects opportunity',
  },
  'Resilient Alchemist': {
    domains: ['Calm & Resilience', 'Focus & Growth'],
    description: 'Turns setbacks into signal',
  },
  'Connected Nurturer': {
    domains: ['Relationships & Belonging', 'Calm & Resilience'],
    description: 'Belonging fuels you',
  },
  'Grounded Creator': {
    domains: ['Identity & Self-Worth', 'Finance'],
    description: 'Worth + stewardship',
  },
  'Vital Navigator': {
    domains: ['Health & Energy', 'Calm & Resilience'],
    description: 'Energy management as a craft',
  },
  'Rising Communicator': {
    domains: ['Relationships & Belonging', 'Identity & Self-Worth'],
    description: 'Voice + self-regard syncing',
  },
};

// Helper: convert avg (-2..+2) → index 0..100
const avgToIndex = (avg: number): number => {
  const raw = ((avg + 2) / 4) * 100;
  if (Number.isNaN(raw)) return 0;
  return Math.max(0, Math.min(100, raw));
};

export const selectBeliefProfile = (state: RootState) => {
  const { answers, totalPoints } = state.survey;

  // 1) Overall index
  const overallAvg = TOTAL_QUESTIONS > 0 ? totalPoints / TOTAL_QUESTIONS : 0;
  const overallIndex = Math.round(avgToIndex(overallAvg));

  // 2) Domain (section) indices
  const domainIndices: Record<string, number> = {};

  SECTIONS.forEach((section, sectionIndex) => {
    const { title, questions } = section;
    if (!questions.length) {
      domainIndices[title] = 0;
      return;
    }

    let sum = 0;
    questions.forEach((_, qIndex) => {
      const key = `${sectionIndex}_${qIndex}`;
      sum += answers[key] ?? 0;
    });

    const avg = sum / questions.length; // -2..+2
    domainIndices[title] = Math.round(avgToIndex(avg));
  });

  // 3) Archetype from top 2 domains
  const sortedDomains = Object.entries(domainIndices).sort(
    ([, a], [, b]) => b - a,
  );
  const topTwoNames = sortedDomains.slice(0, 2).map(([name]) => name);

  let archetype = 'Balanced Explorer'; // default

  if (topTwoNames.length === 2) {
    const topSet = new Set(topTwoNames);
    for (const [name, data] of Object.entries(ARCHETYPE_MAP)) {
      const [d1, d2] = data.domains;
      if (topSet.has(d1) && topSet.has(d2)) {
        archetype = name;
        break;
      }
    }
  }

  return {
    overallIndex, // 0–100
    domainIndices, // per-domain 0–100
    archetype,
  };
};
