
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';

import AuthStack from './AuthStack';
import AppTabs from './AppTabs';

export default function RootNavigator() {
  const [loading, setLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Fake bootstrap: replace with real token check (SecureStore/AsyncStorage)
  useEffect(() => {
    const bootstrap = async () => {
      // const token = await AsyncStorage.getItem('token');
      // setIsSignedIn(!!token);
      setLoading(false);
    };
    bootstrap();
  }, []);

  if (loading) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isSignedIn ? (
        <AppTabs />
      ) : (
        <AuthStack onSignedIn={() => setIsSignedIn(true)} />
      )}
    </NavigationContainer>
  );
}
