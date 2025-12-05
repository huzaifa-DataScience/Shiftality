// src/navigation/RootNavigator.tsx
import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppTabs, { TabParamList } from './AppTabs';
import AuthStack from './AuthStack';
import FinanceSurveyScreen from '../screens/survey/FinanceSurveyScreen';
import { NavigatorScreenParams } from '@react-navigation/native';
import DemoScreen from '../screens/search/DemoScreen';
import { JournalProvider } from '../contexts/JournalContext';
import { useDispatch, useSelector } from 'react-redux';
import {
  setUserProfile,
  selectIsAuthenticated,
} from '../store/reducers/profileReducer';
import {
  getAuthToken,
  getRefreshToken,
  getUserProfile,
} from '../lib/authStorage';

export type RootStackParamList = {
  Auth: undefined; // auth flow (stack)
  Main: NavigatorScreenParams<TabParamList>; // tabs
  FinanceSurvey: undefined; // push-over screen
  DemoScreen: undefined; // push-over screen
};

const Root = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [isInitialized, setIsInitialized] = useState(false);

  // Restore auth state from storage on app start
  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const [accessToken, refreshToken, userProfile] = await Promise.all([
          getAuthToken(),
          getRefreshToken(),
          getUserProfile(),
        ]);

        if (accessToken && refreshToken && userProfile) {
          // Restore user profile to Redux
          dispatch(
            setUserProfile({
              user: userProfile,
              accessToken,
              refreshToken,
              expiresAt: 0, // We don't store expires_at, but it's okay for now
            }),
          );
        }
      } catch (error) {
        console.error('RootNavigator: Error restoring auth state', error);
      } finally {
        setIsInitialized(true);
      }
    };

    restoreAuth();
  }, [dispatch]);

  // Show loading state while checking auth
  if (!isInitialized) {
    return null; // Or show a loading screen
  }

  return (
    <JournalProvider>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Root.Screen name="Auth">
            {() => <AuthStack onSignedIn={() => {}} />}
          </Root.Screen>
        ) : (
          <>
            <Root.Screen name="Main" component={AppTabs} />
            <Root.Screen name="FinanceSurvey" component={FinanceSurveyScreen} />
            <Root.Screen name="DemoScreen" component={DemoScreen} />
          </>
        )}
      </Root.Navigator>
    </JournalProvider>
  );
}
