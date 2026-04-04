import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  HOME_ZONES,
  VEHICLE_TYPES,
  WORK_PLATFORMS,
  HomeZone,
  VehicleType,
  WorkPlatform,
  useUserContext,
} from '../context/UserContext';
import { useAppAppearance } from '../context/AppearanceContext';
import { elevation, shape, typography } from '../theme/tokens';
import { logger } from '../utils/logger';

interface WorkProfileScreenProps {
  onCompleted?: () => void;
}

export default function WorkProfileScreen({ onCompleted }: WorkProfileScreenProps) {
  const { appColors } = useAppAppearance();
  const { saveWorkProfile } = useUserContext();

  const [primaryWorkPlatform, setPrimaryWorkPlatform] =
    useState<WorkPlatform | null>(null);
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [homeZone, setHomeZone] = useState<HomeZone | null>(null);
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const helperCopy = useMemo(
    () =>
      vehicleType === 'Bike' || vehicleType === 'Scooter'
        ? 'Two-wheelers are currently modeled with higher weather volatility risk.'
        : 'Vehicle profile selected. Pricing will rebalance after onboarding.',
    [vehicleType],
  );

  const handleComplete = async () => {
    if (!primaryWorkPlatform || !vehicleType || !homeZone) {
      Alert.alert(
        'Complete Work Profile',
        'Please select platform, vehicle type, and home zone to continue.',
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await saveWorkProfile({
        primaryWorkPlatform,
        vehicleType,
        homeZone,
      });

      onCompleted?.();
    } catch (error) {
      logger.warn('Failed to save work profile onboarding.', error);
      Alert.alert('Unable To Save Profile', 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        {
          backgroundColor: appColors.background,
        },
      ]}
    >
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: appColors.primaryContainer,
            borderColor: appColors.outlineVariant,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: appColors.onPrimaryContainer }]}>Work Profile Setup</Text>
        <Text style={[styles.headerBody, { color: appColors.onPrimaryContainer }]}>Zero-Touch onboarding captures your route context once, then the platform adapts in the background.</Text>
      </View>

      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: appColors.surfaceContainerLow,
            borderColor: appColors.outlineVariant,
          },
        ]}
      >
        <Text style={[styles.sectionLabel, { color: appColors.textMuted }]}>Primary Work Platform</Text>
        <Pressable
          onPress={() => setIsPlatformDropdownOpen(previous => !previous)}
          style={({ pressed }) => [
            styles.dropdownField,
            {
              backgroundColor: appColors.surface,
              borderColor: appColors.outlineVariant,
            },
            pressed ? styles.buttonPressed : null,
          ]}
        >
          <Text style={[styles.dropdownText, { color: appColors.onSurface }]}>
            {primaryWorkPlatform ?? 'Select platform'}
          </Text>
          <Ionicons
            color={appColors.onSurfaceVariant}
            name={isPlatformDropdownOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
          />
        </Pressable>

        {isPlatformDropdownOpen ? (
          <View
            style={[
              styles.dropdownList,
              {
                backgroundColor: appColors.surface,
                borderColor: appColors.outlineVariant,
              },
            ]}
          >
            {WORK_PLATFORMS.map(platform => (
              <Pressable
                key={platform}
                onPress={() => {
                  setPrimaryWorkPlatform(platform);
                  setIsPlatformDropdownOpen(false);
                }}
                style={({ pressed }) => [
                  styles.dropdownOption,
                  pressed ? styles.buttonPressed : null,
                ]}
              >
                <Text style={[styles.dropdownOptionText, { color: appColors.onSurface }]}>{platform}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Text style={[styles.sectionLabel, { color: appColors.textMuted }]}>Vehicle Type</Text>
        <View style={styles.optionRow}>
          {VEHICLE_TYPES.map(option => {
            const selected = vehicleType === option;

            return (
              <Pressable
                key={option}
                onPress={() => setVehicleType(option)}
                style={({ pressed }) => [
                  styles.optionChip,
                  {
                    backgroundColor: selected
                      ? appColors.secondaryContainer
                      : appColors.surface,
                    borderColor: selected
                      ? appColors.secondary
                      : appColors.outlineVariant,
                  },
                  pressed ? styles.buttonPressed : null,
                ]}
              >
                <Text style={[styles.optionChipText, { color: appColors.onSurface }]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: appColors.textMuted }]}>Home Zone</Text>
        <View style={styles.optionRow}>
          {HOME_ZONES.map(option => {
            const selected = homeZone === option;

            return (
              <Pressable
                key={option}
                onPress={() => setHomeZone(option)}
                style={({ pressed }) => [
                  styles.optionChip,
                  {
                    backgroundColor: selected
                      ? appColors.tertiaryContainer
                      : appColors.surface,
                    borderColor: appColors.outlineVariant,
                  },
                  pressed ? styles.buttonPressed : null,
                ]}
              >
                <Text style={[styles.optionChipText, { color: appColors.onSurface }]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View
          style={[
            styles.helperCard,
            {
              backgroundColor: appColors.surfaceContainer,
              borderColor: appColors.outlineVariant,
            },
          ]}
        >
          <Text style={[styles.helperText, { color: appColors.textSecondary }]}>{helperCopy}</Text>
        </View>
      </View>

      <Pressable
        disabled={isSubmitting}
        onPress={handleComplete}
        style={({ pressed }) => [
          styles.continueButton,
          { backgroundColor: appColors.primary },
          pressed && !isSubmitting ? styles.buttonPressed : null,
        ]}
      >
        <Text style={[styles.continueButtonText, { color: appColors.onPrimary }]}>
          {isSubmitting ? 'Saving Profile...' : 'Continue To Dashboard'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    padding: 16,
    paddingTop: 24,
  },
  headerCard: {
    ...elevation.level1,
    borderRadius: shape.lg,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  headerTitle: {
    fontFamily: typography.headingFont,
    fontSize: 24,
  },
  headerBody: {
    fontFamily: typography.bodyFont,
    fontSize: 13,
    lineHeight: 19,
  },
  sectionCard: {
    ...elevation.level1,
    borderRadius: shape.md,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  sectionLabel: {
    fontFamily: typography.bodyFont,
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  dropdownField: {
    alignItems: 'center',
    borderRadius: shape.sm,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  dropdownText: {
    fontFamily: typography.bodyFont,
    fontSize: 15,
  },
  dropdownList: {
    borderRadius: shape.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  dropdownOptionText: {
    fontFamily: typography.bodyFont,
    fontSize: 14,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    borderRadius: shape.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  optionChipText: {
    fontFamily: typography.bodyFont,
    fontSize: 13,
    fontWeight: '700',
  },
  helperCard: {
    borderRadius: shape.sm,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  helperText: {
    fontFamily: typography.bodyFont,
    fontSize: 12,
    lineHeight: 18,
  },
  continueButton: {
    alignItems: 'center',
    borderRadius: shape.pill,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  continueButtonText: {
    fontFamily: typography.headingFont,
    fontSize: 15,
  },
  buttonPressed: {
    opacity: 0.87,
  },
});
