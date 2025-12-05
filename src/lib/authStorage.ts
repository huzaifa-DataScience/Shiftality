// src/lib/authStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_ID_KEY = 'user_id';
const USER_PROFILE_KEY = 'user_profile';

export async function saveAuthTokens(
  accessToken: string,
  refreshToken: string,
  userId: string,
): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(AUTH_TOKEN_KEY, accessToken),
    AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken),
    AsyncStorage.setItem(USER_ID_KEY, userId),
  ]);
}

export async function getAuthToken(): Promise<string | null> {
  return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function getUserId(): Promise<string | null> {
  return await AsyncStorage.getItem(USER_ID_KEY);
}

export async function saveUserProfile(profile: any): Promise<void> {
  await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
}

export async function getUserProfile(): Promise<any | null> {
  const profile = await AsyncStorage.getItem(USER_PROFILE_KEY);
  if (!profile) return null;
  try {
    return JSON.parse(profile);
  } catch {
    return null;
  }
}

export async function clearAuthData(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(AUTH_TOKEN_KEY),
    AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
    AsyncStorage.removeItem(USER_ID_KEY),
    AsyncStorage.removeItem(USER_PROFILE_KEY),
  ]);
}

