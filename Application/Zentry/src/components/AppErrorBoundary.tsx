import React, { ErrorInfo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppAppearanceContext } from '../context/AppearanceContext';
import { shape, typography } from '../theme/tokens';
import { logger } from '../utils/logger';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export default class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  static contextType = AppAppearanceContext;

  context!: React.ContextType<typeof AppAppearanceContext>;

  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Unhandled app runtime error.', error, {
      componentStack: errorInfo.componentStack,
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      const appColors = this.context?.appColors;

      return (
        <View
          style={[
            styles.shell,
            { backgroundColor: appColors?.background ?? '#F4FBFA' },
          ]}
        >
          <View
            style={[
              styles.card,
              {
                backgroundColor: appColors?.surfaceContainerLow ?? '#F2F5F5',
                borderColor: appColors?.outlineVariant ?? '#BEC9C8',
              },
            ]}
          >
            <Text style={[styles.title, { color: appColors?.textPrimary ?? '#161D1D' }]}>
              Something went wrong
            </Text>
            <Text style={[styles.subtitle, { color: appColors?.textSecondary ?? '#3F4948' }]}>
              Zentry recovered into safe mode. Try reopening the latest screen.
            </Text>
            <Pressable
              onPress={this.handleRetry}
              style={[
                styles.button,
                { backgroundColor: appColors?.primary ?? '#006A6B' },
              ]}
            >
              <Text style={[styles.buttonText, { color: appColors?.onPrimary ?? '#FFFFFF' }]}>
                Try Again
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  shell: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: shape.md,
    borderWidth: 1,
    gap: 10,
    padding: 16,
    width: '100%',
  },
  title: {
    fontFamily: typography.headingFont,
    fontSize: 20,
  },
  subtitle: {
    fontFamily: typography.bodyFont,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    alignItems: 'center',
    borderRadius: shape.pill,
    marginTop: 8,
    paddingVertical: 12,
  },
  buttonText: {
    fontFamily: typography.headingFont,
    fontSize: 14,
  },
});
