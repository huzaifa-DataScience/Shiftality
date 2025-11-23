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

// 🔥 Save answer thunk
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

// 🔥 1. Total Points Selector
export const selectTotalSurveyPoints = (state: RootState) =>
  state.survey.totalPoints;

// 🔥 2. Section Points Selector (by section title)
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

// 🔥 3. One Question Selector (optional)
export const selectQuestionPoints =
  (sectionTitle: string, questionIndex: number) => (state: RootState) => {
    const sectionIndex = SECTIONS.findIndex(s => s.title === sectionTitle);
    if (sectionIndex === -1) return 0;
    const key = `${sectionIndex}_${questionIndex}`;
    return state.survey.answers[key] ?? 0;
  };

export const { resetSurvey } = surveySlice.actions;
export default surveySlice.reducer;
