import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppAppearance } from '../context/AppearanceContext';
import { elevation, shape, typography } from '../theme/tokens';
import { logger } from '../utils/logger';

export interface LoginPayload {
  fullName: string;
  phone: string;
}

interface LoginScreenProps {
  onLoginSuccess: (payload: LoginPayload) => Promise<void> | void;
}

function sanitizePhone(value: string) {
  return value.replace(/[^0-9]/g, '').slice(0, 10);
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { appColors, resolvedTheme } = useAppAppearance();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    if (fullName.trim().length < 2) {
      Alert.alert('Name Required', 'Please enter your full name to continue.');
      return;
    }

    if (phone.length < 10) {
      Alert.alert('Phone Required', 'Please enter a valid 10-digit phone number.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onLoginSuccess({
        fullName: fullName.trim(),
        phone,
      });
    } catch (error) {
      logger.warn('Login setup failed.', error);
      Alert.alert('Unable To Continue', 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseDemoProfile = async () => {
    setFullName('Arun Kumar');
    setPhone('9840011223');

    setIsSubmitting(true);

    try {
      await onLoginSuccess({
        fullName: 'Arun Kumar',
        phone: '9840011223',
      });
    } catch (error) {
      logger.warn('Demo profile setup failed.', error);
      Alert.alert('Unable To Continue', 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const heroIconWrapStyle = useMemo(
    () => [
      styles.heroIconWrap,
      {
        backgroundColor:
          resolvedTheme === 'dark' ? appColors.primary : '#6EE8E8',
      },
    ],
    [appColors.primary, resolvedTheme],
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: appColors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.heroCard, { backgroundColor: appColors.primaryContainer }]}>
          <View style={heroIconWrapStyle}>
            <Ionicons color={appColors.onPrimaryContainer} name="shield-checkmark" size={28} />
          </View>
          <Text style={[styles.heroTitle, { color: appColors.onPrimaryContainer }]}>Welcome to Zentry</Text>
          <Text style={[styles.heroSubtitle, { color: appColors.onPrimaryContainer }]}>
            Set your worker profile once and continue into the payout dashboard.
          </Text>
        </View>

        <View style={[styles.formCard, { backgroundColor: appColors.surfaceContainerLow }]}>
          {/* WHY: This one-time identity setup mirrors KYC bootstrap behavior before policy actions are allowed. */}
          <Text style={[styles.formTitle, { color: appColors.onSurface }]}>One-Time Login</Text>
          <Text style={[styles.formCaption, { color: appColors.onSurfaceVariant }]}>Shown only on first app launch</Text>

          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: appColors.onSurfaceVariant }]}>Full Name</Text>
            <TextInput
              autoCapitalize="words"
              editable={!isSubmitting}
              onChangeText={setFullName}
              placeholder="Enter your name"
              placeholderTextColor={appColors.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: appColors.surface,
                  borderColor: appColors.outlineVariant,
                  color: appColors.onSurface,
                },
              ]}
              value={fullName}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: appColors.onSurfaceVariant }]}>Phone Number</Text>
            <TextInput
              editable={!isSubmitting}
              keyboardType="phone-pad"
              onChangeText={value => setPhone(sanitizePhone(value))}
              placeholder="10-digit mobile"
              placeholderTextColor={appColors.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: appColors.surface,
                  borderColor: appColors.outlineVariant,
                  color: appColors.onSurface,
                },
              ]}
              value={phone}
            />
          </View>

          <Pressable
            disabled={isSubmitting}
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.continueButton,
              { backgroundColor: appColors.primary },
              pressed && !isSubmitting ? styles.buttonPressed : null,
            ]}
          >
            <Text style={[styles.continueButtonText, { color: appColors.onPrimary }]}>
              {isSubmitting ? 'Starting Session...' : 'Continue'}
            </Text>
          </Pressable>

          <Pressable
            disabled={isSubmitting}
            onPress={handleUseDemoProfile}
            style={({ pressed }) => [
              styles.demoButton,
              { backgroundColor: appColors.secondaryContainer },
              pressed && !isSubmitting ? styles.buttonPressed : null,
            ]}
          >
            <Text style={[styles.demoButtonText, { color: appColors.onSecondaryContainer }]}>
              Use Demo Worker Profile
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: 16,
    padding: 18,
    paddingTop: 34,
  },
  heroCard: {
    ...elevation.level1,
    alignItems: 'center',
    borderRadius: shape.lg,
    gap: 8,
    padding: 20,
  },
  heroIconWrap: {
    alignItems: 'center',
    backgroundColor: '#6EE8E8',
    borderRadius: shape.pill,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  heroTitle: {
    fontFamily: typography.headingFont,
    fontSize: 28,
  },
  heroSubtitle: {
    fontFamily: typography.bodyFont,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  formCard: {
    ...elevation.level1,
    borderRadius: shape.md,
    gap: 12,
    padding: 16,
  },
  formTitle: {
    fontFamily: typography.headingFont,
    fontSize: 22,
  },
  formCaption: {
    fontFamily: typography.bodyFont,
    fontSize: 13,
  },
  fieldBlock: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: typography.bodyFont,
    fontSize: 12,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: shape.sm,
    borderWidth: 1,
    fontFamily: typography.bodyFont,
    fontSize: 15,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  continueButton: {
    alignItems: 'center',
    borderRadius: shape.pill,
    justifyContent: 'center',
    minHeight: 48,
    marginTop: 4,
    paddingHorizontal: 16,
  },
  continueButtonText: {
    fontFamily: typography.headingFont,
    fontSize: 15,
    letterSpacing: 0.2,
  },
  demoButton: {
    alignItems: 'center',
    borderRadius: shape.pill,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 16,
  },
  demoButtonText: {
    fontFamily: typography.bodyFont,
    fontSize: 14,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.86,
  },
});
