import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DarkTheme,
  DefaultTheme,
  Theme as NavigationTheme,
} from '@react-navigation/native';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { logger } from '../utils/logger';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export interface AppThemeColors {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  errorContainer: string;
  onErrorContainer: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  onSurfaceVariant: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  outline: string;
  outlineVariant: string;
  success: string;
  warning: string;
  info: string;
  surfaceMuted: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  brand: string;
  brandSoft: string;
  accent: string;
  accentSoft: string;
  danger: string;
}

function getAppThemeColors(mode: ResolvedTheme): AppThemeColors {
  if (mode === 'dark') {
    return {
      primary: '#82F0EF',
      onPrimary: '#003738',
      primaryContainer: '#114B4C',
      onPrimaryContainer: '#BFF8F8',
      secondary: '#88AEAE',
      onSecondary: '#102827',
      secondaryContainer: '#243A3A',
      onSecondaryContainer: '#CFE5E4',
      tertiaryContainer: '#35385E',
      onTertiaryContainer: '#E1E0FF',
      error: '#FFB4AB',
      errorContainer: '#5A1A1A',
      onErrorContainer: '#FFDAD6',
      background: '#0E1415',
      onBackground: '#DDE4E3',
      surface: '#151C1C',
      onSurface: '#DDE4E3',
      onSurfaceVariant: '#B4C0BF',
      surfaceContainerLowest: '#101616',
      surfaceContainerLow: '#151C1C',
      surfaceContainer: '#1A2323',
      surfaceContainerHigh: '#202A2A',
      surfaceContainerHighest: '#273232',
      outline: '#8A9594',
      outlineVariant: '#3C4746',
      success: '#4AC989',
      warning: '#E8B651',
      info: '#78A8FF',
      surfaceMuted: '#273232',
      textPrimary: '#DDE4E3',
      textSecondary: '#C5CECD',
      textMuted: '#A0ABAA',
      border: '#3C4746',
      brand: '#82F0EF',
      brandSoft: '#1F3A3A',
      accent: '#88AEAE',
      accentSoft: '#243A3A',
      danger: '#FFB4AB',
    };
  }

  return {
    primary: '#006A6B',
    onPrimary: '#FFFFFF',
    primaryContainer: '#9DF2F2',
    onPrimaryContainer: '#002021',
    secondary: '#4A6363',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#CCE8E8',
    onSecondaryContainer: '#051F1F',
    tertiaryContainer: '#E2E0FF',
    onTertiaryContainer: '#161A48',
    error: '#BA1A1A',
    errorContainer: '#FFDAD6',
    onErrorContainer: '#410002',
    background: '#F4FBFA',
    onBackground: '#161D1D',
    surface: '#F8FFFE',
    onSurface: '#161D1D',
    onSurfaceVariant: '#3F4948',
    surfaceContainerLowest: '#FFFFFF',
    surfaceContainerLow: '#F2F5F5',
    surfaceContainer: '#ECF2F1',
    surfaceContainerHigh: '#E6ECEC',
    surfaceContainerHighest: '#E1E7E7',
    outline: '#6F7978',
    outlineVariant: '#BEC9C8',
    success: '#1C7C4A',
    warning: '#9A6700',
    info: '#325CA8',
    surfaceMuted: '#E6ECEC',
    textPrimary: '#161D1D',
    textSecondary: '#3F4948',
    textMuted: '#6F7978',
    border: '#BEC9C8',
    brand: '#006A6B',
    brandSoft: '#9DF2F2',
    accent: '#4A6363',
    accentSoft: '#CCE8E8',
    danger: '#BA1A1A',
  };
}

const lightTheme: NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F4FBFA',
    border: '#BEC9C8',
    notification: '#BA1A1A',
    card: '#F8FFFE',
    primary: '#006A6B',
    text: '#161D1D',
  },
};

const darkTheme: NavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0E1415',
    border: '#3C4746',
    notification: '#FFDAD6',
    card: '#151C1C',
    primary: '#82F0EF',
    text: '#DDE4E3',
  },
};

interface AppearanceContextValue {
  themePreference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setThemePreference: (nextPreference: ThemePreference) => void;
  navigationTheme: NavigationTheme;
  appColors: AppThemeColors;
  statusBarStyle: 'dark-content' | 'light-content';
  statusBarBackground: string;
  isAppearanceBootstrapping: boolean;
}

export const AppAppearanceContext = createContext<AppearanceContextValue | undefined>(
  undefined,
);

interface AppearanceProviderProps {
  children: React.ReactNode;
}

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function AppAppearanceProvider({ children }: AppearanceProviderProps) {
  const osScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>('system');
  const [isAppearanceBootstrapping, setIsAppearanceBootstrapping] =
    useState(true);

  useEffect(() => {
    let isMounted = true;

    const restoreThemePreference = async () => {
      try {
        const rawPreference = await AsyncStorage.getItem(
          STORAGE_KEYS.themePreference,
        );

        if (!isMounted) {
          return;
        }

        if (isThemePreference(rawPreference)) {
          setThemePreferenceState(rawPreference);
        }
      } catch (error) {
        logger.warn('Unable to restore theme preference.', error);
      } finally {
        if (isMounted) {
          setIsAppearanceBootstrapping(false);
        }
      }
    };

    restoreThemePreference().catch(error => {
      logger.warn('Unexpected theme bootstrap failure.', error);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const setThemePreference = useCallback((nextPreference: ThemePreference) => {
    setThemePreferenceState(nextPreference);

    AsyncStorage.setItem(STORAGE_KEYS.themePreference, nextPreference).catch(
      error => {
        logger.warn('Unable to persist theme preference.', error, {
          nextPreference,
        });
      },
    );
  }, []);

  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (themePreference === 'system') {
      return osScheme === 'dark' ? 'dark' : 'light';
    }

    return themePreference;
  }, [osScheme, themePreference]);

  const value = useMemo<AppearanceContextValue>(() => {
    const navigationTheme =
      resolvedTheme === 'dark' ? darkTheme : lightTheme;
    const appColors = getAppThemeColors(resolvedTheme);

    return {
      themePreference,
      resolvedTheme,
      setThemePreference,
      navigationTheme,
      appColors,
      statusBarStyle:
        resolvedTheme === 'dark' ? 'light-content' : 'dark-content',
      statusBarBackground: navigationTheme.colors.card,
      isAppearanceBootstrapping,
    };
  }, [isAppearanceBootstrapping, resolvedTheme, setThemePreference, themePreference]);

  return (
    <AppAppearanceContext.Provider value={value}>
      {children}
    </AppAppearanceContext.Provider>
  );
}

export function useAppAppearance() {
  const context = useContext(AppAppearanceContext);

  if (!context) {
    throw new Error('useAppAppearance must be used within AppAppearanceProvider.');
  }

  return context;
}
