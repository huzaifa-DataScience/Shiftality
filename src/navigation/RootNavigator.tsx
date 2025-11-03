// src/navigation/RootNavigator.tsx
import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppTabs from './AppTabs';
import AuthStack from './AuthStack';
import FinanceSurveyScreen from '../screens/survey/FinanceSurveyScreen';

export type RootStackParamList = {
  Auth: undefined;                  // auth flow (stack)
  Main: undefined;                  // tabs
  FinanceSurvey: undefined;         // push-over screen
};

const Root = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  return (
    <Root.Navigator screenOptions={{ headerShown: false }}>
      {!isSignedIn ? (
        <Root.Screen name="Auth">
          {() => <AuthStack onSignedIn={() => setIsSignedIn(true)} />}
        </Root.Screen>
      ) : (
        <>
          <Root.Screen name="Main" component={AppTabs} />
          <Root.Screen name="FinanceSurvey" component={FinanceSurveyScreen} />
        </>
      )}
    </Root.Navigator>
  );
}
