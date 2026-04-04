import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppAppearance } from '../context/AppearanceContext';
import { elevation, shape, typography } from '../theme/tokens';

interface RiskLineItem {
  label: string;
  value: string;
}

const RISK_LINES: RiskLineItem[] = [
  { label: 'Recent Rainfall', value: '88%' },
  { label: 'Local Infrastructure Grade', value: 'C-' },
  { label: 'Claim Frequency in Zone', value: 'High' },
];

export default function RiskBreakdown() {
  const { appColors } = useAppAppearance();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: appColors.surfaceContainerLow,
          borderColor: appColors.outlineVariant,
        },
      ]}
    >
      <Text style={[styles.title, { color: appColors.textPrimary }]}>Risk Breakdown</Text>

      {RISK_LINES.map(item => (
        <View
          key={item.label}
          style={[styles.row, { borderBottomColor: appColors.outlineVariant }]}
        >
          <Text style={[styles.label, { color: appColors.textMuted }]}>{item.label}</Text>
          <Text style={[styles.value, { color: appColors.textPrimary }]}>{item.value}</Text>
        </View>
      ))}
    </View>
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
  title: {
    fontFamily: typography.headingFont,
    fontSize: 16,
  },
  row: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  label: {
    fontFamily: typography.bodyFont,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  value: {
    fontFamily: typography.headingFont,
    fontSize: 13,
  },
});
