import { Platform, StyleSheet } from 'react-native';

const headingFont =
  Platform.select({
    ios: 'AvenirNext-DemiBold',
    android: 'sans-serif-medium',
    default: 'System',
  }) ?? 'System';

const bodyFont =
  Platform.select({
    ios: 'AvenirNext-Regular',
    android: 'sans-serif',
    default: 'System',
  }) ?? 'System';

const monoFont =
  Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }) ?? 'monospace';

export const colors = {
  primary: '#006A6B',
  onPrimary: '#FFFFFF',
  primaryContainer: '#9DF2F2',
  onPrimaryContainer: '#002021',
  secondary: '#4A6363',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#CCE8E8',
  onSecondaryContainer: '#051F1F',
  tertiary: '#5A5E8F',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#E2E0FF',
  onTertiaryContainer: '#161A48',
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',
  background: '#F4FBFA',
  onBackground: '#161D1D',
  surface: '#F8FFFE',
  onSurface: '#161D1D',
  surfaceVariant: '#DAE5E4',
  onSurfaceVariant: '#3F4948',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F2F5F5',
  surfaceContainer: '#ECF2F1',
  surfaceContainerHigh: '#E6ECEC',
  surfaceContainerHighest: '#E1E7E7',
  outline: '#6F7978',
  outlineVariant: '#BEC9C8',
  inverseSurface: '#2B3232',
  inverseOnSurface: '#ECF2F1',
  shadow: '#000000',
  scrim: '#000000',
  success: '#1C7C4A',
  warning: '#9A6700',
  info: '#325CA8',

  // Backward-compatible aliases used by existing screens.
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

export const typography = {
  headingFont,
  bodyFont,
  monoFont,
};

export const shape = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  pill: 999,
};

export const elevation = StyleSheet.create({
  level1: {
    ...Platform.select({
      android: {
        elevation: 1,
      },
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 2,
      },
      default: {},
    }),
  },
  level2: {
    ...Platform.select({
      android: {
        elevation: 3,
      },
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.14,
        shadowRadius: 5,
      },
      default: {},
    }),
  },
});
