import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import GeoReportScreen from '../screens/GeoReportScreen';
import HomeScreen from '../screens/HomeScreen';
import PolicyScreen from '../screens/PolicyScreen';
import UserDetailsScreen from '../screens/UserDetailsScreen';
import { useAppAppearance } from '../context/AppearanceContext';
import { typography } from '../theme/tokens';

export type RootStackParamList = {
  Home: undefined;
  Policy: undefined;
  GeoReport: undefined;
  UserDetails: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { navigationTheme } = useAppAppearance();

  return (
    <RootStack.Navigator
      initialRouteName="Home"
      screenOptions={{
        contentStyle: {
          backgroundColor: navigationTheme.colors.background,
        },
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: navigationTheme.colors.card,
        },
        headerTintColor: navigationTheme.colors.text,
        headerTitleStyle: {
          color: navigationTheme.colors.text,
          fontFamily: typography.headingFont,
          fontSize: 20,
        },
      }}
    >
      {/* WHY: Traditional stack navigation gives each flow a clear back path and dedicated page context. */}
      <RootStack.Screen
        component={HomeScreen}
        name="Home"
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        component={PolicyScreen}
        name="Policy"
        options={{ title: 'Policy Config' }}
      />
      <RootStack.Screen
        component={GeoReportScreen}
        name="GeoReport"
        options={{ title: 'Geo Report' }}
      />
      <RootStack.Screen
        component={UserDetailsScreen}
        name="UserDetails"
        options={{ title: 'User Details' }}
      />
    </RootStack.Navigator>
  );
}
