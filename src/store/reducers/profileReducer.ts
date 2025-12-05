// src/store/reducers/profileReducer.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootState } from '../rootReducer';

export interface UserProfile {
  id: string;
  email: string;
  emailConfirmed: boolean;
  phone: string;
  createdAt: string;
  updatedAt: string;
  lastSignInAt: string;
  appMetadata?: {
    provider: string;
    providers: string[];
  };
  userMetadata?: {
    email: string;
    email_verified: boolean;
    phone_verified: boolean;
    sub: string;
  };
}

export interface ProfileState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
}

const initialState: ProfileState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  isAuthenticated: false,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setUserProfile(
      state,
      action: PayloadAction<{
        user: UserProfile;
        accessToken: string;
        refreshToken: string;
        expiresAt: number;
      }>,
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.expiresAt = action.payload.expiresAt;
      state.isAuthenticated = true;
    },
    updateUserProfile(state, action: PayloadAction<Partial<UserProfile>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearProfile(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.expiresAt = null;
      state.isAuthenticated = false;
    },
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
    },
  },
});

export const {
  setUserProfile,
  updateUserProfile,
  clearProfile,
  setAccessToken,
} = profileSlice.actions;

export default profileSlice.reducer;

// Selectors
export const selectUser = (state: RootState) => state.profile.user;
export const selectIsAuthenticated = (state: RootState) =>
  state.profile.isAuthenticated;
export const selectAccessToken = (state: RootState) =>
  state.profile.accessToken;
export const selectUserEmail = (state: RootState) =>
  state.profile.user?.email;

