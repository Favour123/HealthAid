import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { FeedScreen } from '../screens/FeedScreen';
import { AddIncidentScreen } from '../screens/AddIncidentScreen';
import { MyReportsScreen } from '../screens/MyReportsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { MainTabParamList } from './types';
import { colors } from '../theme/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Feed: 'newspaper',
  Add: 'add-circle',
  MyReports: 'document-text',
  Profile: 'person-circle',
};

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopColor: colors.border, height: 60, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} options={{ title: 'Feed' }} />
      <Tab.Screen name="Add" component={AddIncidentScreen} options={{ title: 'Report' }} />
      <Tab.Screen name="MyReports" component={MyReportsScreen} options={{ title: 'My Reports' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
