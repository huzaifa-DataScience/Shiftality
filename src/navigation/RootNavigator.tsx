// src/navigation/RootNavigator.tsx
import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppTabs, { TabParamList } from './AppTabs';
import AuthStack from './AuthStack';
import FinanceSurveyScreen from '../screens/survey/FinanceSurveyScreen';
import { NavigatorScreenParams } from '@react-navigation/native';
import DemoScreen from '../screens/search/DemoScreen';

export type RootStackParamList = {
  Auth: undefined; // auth flow (stack)
  Main: NavigatorScreenParams<TabParamList>; // tabs
  FinanceSurvey: undefined; // push-over screen
  DemoScreen: undefined; // push-over screen
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
          <Root.Screen name="DemoScreen" component={DemoScreen} />
        </>
      )}
    </Root.Navigator>
  );
}
