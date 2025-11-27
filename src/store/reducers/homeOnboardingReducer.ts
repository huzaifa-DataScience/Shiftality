// src/store/homeOnboardingReducer.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../rootReducer';

const makeMidnightISO = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

export interface HomeOnboardingState {
  firstName: string;
  timezone?: string;

  journeyStartDate: string; // ISO string
  northStar: string;
  shadowPath: string;

  checkInTime: string; // ISO string
  dndStart: string; // ISO string
  dndEnd: string; // ISO string

  allowNotifications: boolean;

  // 🔥 NEW: belief profile summary
  archetype?: string; // e.g. "Calm Builder"
  baselineIndex?: number; // 0–100 overall index
}

const initialState: HomeOnboardingState = {
  firstName: '',
  timezone: undefined,

  journeyStartDate: makeMidnightISO(),
  northStar: '',
  shadowPath: '',

  checkInTime: makeMidnightISO(),
  dndStart: makeMidnightISO(),
  dndEnd: makeMidnightISO(),

  allowNotifications: true,

  archetype: undefined,
  baselineIndex: undefined,
};

const homeOnboardingSlice = createSlice({
  name: 'homeOnboarding',
  initialState,
  reducers: {
    resetHomeOnboarding() {
      return initialState;
    },

    setFirstName(state, action: PayloadAction<string>) {
      state.firstName = action.payload;
    },

    setTimezone(state, action: PayloadAction<string | undefined>) {
      state.timezone = action.payload;
    },

    // 🔥 dates/times now expect ISO strings
    setJourneyStartDate(state, action: PayloadAction<string>) {
      state.journeyStartDate = action.payload;
    },
    setNorthStar(state, action: PayloadAction<string>) {
      state.northStar = action.payload;
    },
    setShadowPath(state, action: PayloadAction<string>) {
      state.shadowPath = action.payload;
    },
    setCheckInTime(state, action: PayloadAction<string>) {
      state.checkInTime = action.payload;
    },
    setDndStart(state, action: PayloadAction<string>) {
      state.dndStart = action.payload;
    },
    setDndEnd(state, action: PayloadAction<string>) {
      state.dndEnd = action.payload;
    },
    setAllowNotifications(state, action: PayloadAction<boolean>) {
      state.allowNotifications = action.payload;
    },

    // 🔥 NEW reducers for belief profile
    setArchetype(state, action: PayloadAction<string | undefined>) {
      state.archetype = action.payload;
    },
    setBaselineIndex(state, action: PayloadAction<number | undefined>) {
      state.baselineIndex = action.payload;
    },
  },
});

export const {
  resetHomeOnboarding,
  setFirstName,
  setTimezone,
  setJourneyStartDate,
  setNorthStar,
  setShadowPath,
  setCheckInTime,
  setDndStart,
  setDndEnd,
  setAllowNotifications,
  setArchetype,
  setBaselineIndex,
} = homeOnboardingSlice.actions;

export default homeOnboardingSlice.reducer;

export const selectHomeOnboarding = (state: RootState) => state.homeOnboarding;

export const selectFirstName = (state: RootState) =>
  state.homeOnboarding.firstName;

export const selectAllowNotifications = (state: RootState) =>
  state.homeOnboarding.allowNotifications;
