// src/navigation/AppTabs.tsx
import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/search/SearchScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import CustomTabBar from './CustomTabBar';
import SettingScreen from '../screens/setting/SettingScreen';

export type TabParamList = {
  Home: undefined;
  Journal: undefined; // This will be a modal trigger, not a screen
  CenterProfile: undefined; // Profile moved to center hexagon
  Search: undefined;
  setting: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

// Dummy component for Journal tab (won't be rendered)
function JournalPlaceholder() {
  return null;
}

export default function AppTabs() {
  const [showJournalModal, setShowJournalModal] = useState(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={{ headerShown: false, tabBarShowLabel: false }}
        tabBar={props => (
          <CustomTabBar
            {...props}
            onJournalPress={() => setShowJournalModal(true)}
            showJournalModal={showJournalModal}
            onCloseJournal={() => setShowJournalModal(false)}
          />
        )}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Journal" component={JournalPlaceholder} />
        <Tab.Screen name="CenterProfile" component={ProfileScreen} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="setting" component={SettingScreen} />
      </Tab.Navigator>
    </>
  );
}
