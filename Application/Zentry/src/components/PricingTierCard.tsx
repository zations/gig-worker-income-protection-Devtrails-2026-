import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppAppearance } from '../context/AppearanceContext';
import { PolicyTier } from '../context/SystemStateContext';
import { elevation, shape, typography } from '../theme/tokens';

interface PricingTierCardProps {
  tier: PolicyTier;
  selected: boolean;
  onSelect: (tierId: string) => void;
}

export default function PricingTierCard({
  tier,
  selected,
  onSelect,
}: PricingTierCardProps) {
  const { appColors } = useAppAppearance();

  return (
    <Pressable
      onPress={() => onSelect(tier.id)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: selected
            ? appColors.secondaryContainer
            : appColors.surfaceContainerLow,
          borderColor: selected ? appColors.secondary : appColors.outlineVariant,
        },
        pressed ? styles.cardPressed : null,
      ]}
    >
      {/* WHY: Tier comparison exposes how AI risk interpretation maps directly to policy economics. */}
      <View style={styles.topRow}>
        <Text style={[styles.tierName, { color: appColors.textPrimary }]}>{tier.name}</Text>
        <Text style={[styles.priceText, { color: appColors.primary }]}>
          INR {tier.monthlyPrice}/mo
        </Text>
      </View>

      <Text style={[styles.summaryText, { color: appColors.textSecondary }]}>{tier.summary}</Text>

      <View style={styles.metaRow}>
        <Text style={[styles.metaLabel, { color: appColors.textMuted }]}>
          Deductible: INR {tier.deductible}
        </Text>
        <Text style={[styles.metaLabel, { color: appColors.textMuted }]}>Cap: INR {tier.payoutCap}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    ...elevation.level1,
    borderRadius: shape.md,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  cardPressed: {
    opacity: 0.9,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tierName: {
    fontFamily: typography.headingFont,
    fontSize: 17,
  },
  priceText: {
    fontFamily: typography.headingFont,
    fontSize: 15,
  },
  summaryText: {
    fontFamily: typography.bodyFont,
    fontSize: 13,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontFamily: typography.monoFont,
    fontSize: 12,
  },
});
