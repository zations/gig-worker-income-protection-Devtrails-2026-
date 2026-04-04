import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import PricingTierCard from '../components/PricingTierCard';
import RiskBreakdown from '../components/RiskBreakdown';
import { useAppAppearance } from '../context/AppearanceContext';
import { useSystemState } from '../context/SystemStateContext';
import { VehicleType, useUserContext } from '../context/UserContext';
import { elevation, shape, typography } from '../theme/tokens';
import { logger } from '../utils/logger';

const VEHICLE_PRICING_MULTIPLIER: Record<VehicleType, number> = {
  Bike: 1.18,
  Scooter: 1.12,
  Auto: 1.06,
  Car: 0.94,
};

const VEHICLE_RISK_OFFSET: Record<VehicleType, number> = {
  Bike: 0.1,
  Scooter: 0.07,
  Auto: 0.04,
  Car: -0.03,
};

export default function PolicyScreen() {
  const { appColors } = useAppAppearance();
  const { workProfile } = useUserContext();
  const {
    dynamicRiskScore,
    policyTiers,
    isBootstrapping,
    isMutating,
    activatePolicy,
  } = useSystemState();

  const [selectedTierId, setSelectedTierId] = useState('standard');
  const [isActivating, setIsActivating] = useState(false);

  const vehicleType = workProfile?.vehicleType ?? 'Bike';
  const pricingMultiplier = VEHICLE_PRICING_MULTIPLIER[vehicleType];
  const adjustedRiskScore = Math.max(
    0.05,
    Math.min(0.99, Number((dynamicRiskScore + VEHICLE_RISK_OFFSET[vehicleType]).toFixed(2))),
  );

  const adjustedPolicyTiers = useMemo(
    () =>
      policyTiers.map(tier => ({
        ...tier,
        monthlyPrice: Math.round(tier.monthlyPrice * pricingMultiplier),
      })),
    [policyTiers, pricingMultiplier],
  );

  useEffect(() => {
    if (policyTiers.length === 0) {
      return;
    }

    const hasValidSelection = policyTiers.some(tier => tier.id === selectedTierId);

    if (!hasValidSelection) {
      const fallbackTier = policyTiers[1] ?? policyTiers[0];
      setSelectedTierId(fallbackTier.id);
    }
  }, [policyTiers, selectedTierId]);

  const selectedTier = useMemo(
    () => adjustedPolicyTiers.find(tier => tier.id === selectedTierId),
    [adjustedPolicyTiers, selectedTierId],
  );

  const handleActivate = async () => {
    if (!selectedTier) {
      return;
    }

    setIsActivating(true);

    try {
      const confirmationMessage = await activatePolicy(selectedTier.id);

      Alert.alert('Policy Activated', confirmationMessage);
    } catch (error) {
      logger.warn('Policy activation failed.', error);
      Alert.alert('Activation Failed', 'Unable to activate the selected policy tier.');
    } finally {
      setIsActivating(false);
    }
  };

  if (isBootstrapping) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: appColors.background }]}>
        <ActivityIndicator color={appColors.brand} size="large" />
        <Text style={[styles.loadingText, { color: appColors.textSecondary }]}>
          Fetching risk model and pricing tiers...
        </Text>
      </View>
    );
  }

  const riskPercentage = Math.round(adjustedRiskScore * 100);

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: appColors.background }]}>
      <View
        style={[
          styles.scoreCard,
          {
            backgroundColor: appColors.primaryContainer,
            borderColor: appColors.outlineVariant,
          },
        ]}
      >
        {/* WHY: Dynamic score communicates that pricing is computed from live zone-level hazard intelligence. */}
        <Text style={[styles.scoreLabel, { color: appColors.onPrimaryContainer }]}>Dynamic Risk Score</Text>
        <Text style={[styles.scoreValue, { color: appColors.onPrimaryContainer }]}>
          {adjustedRiskScore.toFixed(2)}
        </Text>
        <View style={[styles.scoreTrack, { backgroundColor: appColors.surfaceContainerHighest }]}>
          <View
            style={[
              styles.scoreFill,
              { width: `${riskPercentage}%`, backgroundColor: appColors.primary },
            ]}
          />
        </View>
        <Text style={[styles.scoreHint, { color: appColors.onPrimaryContainer }]}>
          Zone risk percentile: {riskPercentage}% | Vehicle factor ({vehicleType}) x{pricingMultiplier.toFixed(2)}.
        </Text>
      </View>

      <RiskBreakdown />

      <View style={styles.pricingBlock}>
        {/* WHY: Multi-tier pricing proves that model confidence can map to different coverage products. */}
        <Text style={[styles.pricingTitle, { color: appColors.onSurface }]}>Choose Your Plan</Text>
        <View style={styles.tierList}>
          {adjustedPolicyTiers.map(tier => (
            <PricingTierCard
              key={tier.id}
              onSelect={setSelectedTierId}
              selected={tier.id === selectedTierId}
              tier={tier}
            />
          ))}
        </View>
      </View>

      <Pressable
        disabled={!selectedTier || isActivating || isMutating}
        onPress={handleActivate}
        style={({ pressed }) => [
          styles.activateButton,
          { backgroundColor: appColors.primary },
          pressed && !(isActivating || isMutating) ? styles.activatePressed : null,
        ]}
      >
        {/* WHY: Simulated purchase validates activation flow while payments backend is still mocked. */}
        <Text style={[styles.activateButtonText, { color: appColors.onPrimary }]}>
          {isActivating ? 'Activating Policy...' : `Activate ${selectedTier?.name ?? ''}`}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    padding: 16,
    paddingBottom: 36,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    gap: 10,
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: typography.bodyFont,
    fontSize: 14,
  },
  scoreCard: {
    ...elevation.level1,
    borderRadius: shape.lg,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  scoreLabel: {
    fontFamily: typography.bodyFont,
    fontSize: 13,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontFamily: typography.headingFont,
    fontSize: 44,
  },
  scoreTrack: {
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
  },
  scoreFill: {
    borderRadius: 999,
    height: '100%',
  },
  scoreHint: {
    fontFamily: typography.bodyFont,
    fontSize: 12,
    lineHeight: 18,
  },
  pricingBlock: {
    gap: 10,
  },
  pricingTitle: {
    fontFamily: typography.headingFont,
    fontSize: 18,
  },
  tierList: {
    gap: 10,
  },
  activateButton: {
    alignItems: 'center',
    borderRadius: shape.pill,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  activatePressed: {
    opacity: 0.87,
  },
  activateButtonText: {
    fontFamily: typography.headingFont,
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
