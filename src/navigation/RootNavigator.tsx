// src/navigation/RootNavigator.tsx
import React, { useState, useEffect } from 'react';
import AppTabs from './AppTabs';
import AuthStack from './AuthStack';

export default function RootNavigator() {
  const [loading, setLoading] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    // TODO: check token/session and set isSignedIn
  }, []);

  if (loading) return null;

  return isSignedIn ? <AppTabs /> : <AuthStack />;
}
