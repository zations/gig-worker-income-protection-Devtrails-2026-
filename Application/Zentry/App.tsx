import React, { useCallback, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppErrorBoundary from './src/components/AppErrorBoundary';
import {
  AppAppearanceProvider,
  useAppAppearance,
} from './src/context/AppearanceContext';
import { SystemStateProvider } from './src/context/SystemStateContext';
import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen, { LoginPayload } from './src/screens/LoginScreen';
import WorkProfileScreen from './src/screens/WorkProfileScreen';
import { getLoginCompletedFlag, persistLoginSession } from './src/services/appStorage';
import { UserProvider, useUserContext } from './src/context/UserContext';
import { logger } from './src/utils/logger';

function AppRoot() {
  const {
    isAppearanceBootstrapping,
    navigationTheme,
    statusBarBackground,
    statusBarStyle,
  } = useAppAppearance();
  const { isUserBootstrapping, workProfile } = useUserContext();
  const [isCheckingLogin, setIsCheckingLogin] = useState(true);
  const [hasCompletedLogin, setHasCompletedLogin] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const restoreLoginState = async () => {
      try {
        const hasCompleted = await getLoginCompletedFlag();

        if (isMounted) {
          setHasCompletedLogin(hasCompleted);
        }
      } catch (error) {
        logger.warn('Unable to restore login state.', error);
      } finally {
        if (isMounted) {
          setIsCheckingLogin(false);
        }
      }
    };

    restoreLoginState().catch(error => {
      logger.warn('Unexpected login bootstrap failure.', error);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLoginSuccess = useCallback(async (payload: LoginPayload) => {
    const workerId = `GW-CHN-${payload.phone.slice(-4).padStart(4, '0')}`;

    const storedProfile = {
      fullName: payload.fullName,
      phone: payload.phone,
      workerId,
      loginAt: new Date().toISOString(),
    };

    try {
      await persistLoginSession(storedProfile);
    } catch (error) {
      // WHY: Even if persistence fails, demo flow should continue and avoid blocking UI exploration.
      logger.warn('Unable to persist login state.', error);
    }

    setHasCompletedLogin(true);
  }, []);

  if (isCheckingLogin || isAppearanceBootstrapping || isUserBootstrapping) {
    return (
      <View
        style={[
          styles.loadingShell,
          { backgroundColor: navigationTheme.colors.background },
        ]}
      >
        <ActivityIndicator color={navigationTheme.colors.primary} size="large" />
        <Text style={[styles.loadingText, { color: navigationTheme.colors.text }]}>
          Preparing Zentry workspace...
        </Text>
      </View>
    );
  }

  return (
    <AppErrorBoundary>
      {/* WHY: Shared providers emulate production wiring where global adjudication state powers every screen. */}
      <SystemStateProvider>
        <NavigationContainer theme={navigationTheme}>
          <StatusBar backgroundColor={statusBarBackground} barStyle={statusBarStyle} />
          {!hasCompletedLogin ? (
            <LoginScreen onLoginSuccess={handleLoginSuccess} />
          ) : workProfile ? (
            <AppNavigator />
          ) : (
            <WorkProfileScreen />
          )}
        </NavigationContainer>
      </SystemStateProvider>
    </AppErrorBoundary>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <AppAppearanceProvider>
        <UserProvider>
          <AppRoot />
        </UserProvider>
      </AppAppearanceProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingShell: {
    alignItems: 'center',
    flex: 1,
    gap: 10,
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
});

export default App;
