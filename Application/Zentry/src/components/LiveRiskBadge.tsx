import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppAppearance } from '../context/AppearanceContext';
import { typography } from '../theme/tokens';

interface LiveRiskBadgeProps {
  riskText: string;
}

function deriveRiskVisuals(
  riskText: string,
  appColors: ReturnType<typeof useAppAppearance>['appColors'],
) {
  if (/severe|high/i.test(riskText)) {
    return {
      icon: 'warning-outline',
      textColor: appColors.onErrorContainer,
      backgroundColor: appColors.errorContainer,
    };
  }

  if (/medium|moderate/i.test(riskText)) {
    return {
      icon: 'alert-circle-outline',
      textColor: appColors.warning,
      backgroundColor: appColors.secondaryContainer,
    };
  }

  return {
    icon: 'checkmark-circle-outline',
    textColor: appColors.success,
    backgroundColor: appColors.primaryContainer,
  };
}

export default function LiveRiskBadge({ riskText }: LiveRiskBadgeProps) {
  const { appColors } = useAppAppearance();
  const visuals = deriveRiskVisuals(riskText, appColors);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: visuals.backgroundColor,
          borderColor: appColors.outlineVariant,
        },
      ]}
    >
      {/* WHY: A persistent risk signal demonstrates that payouts are linked to dynamic environmental context. */}
      <Ionicons color={visuals.textColor} name={visuals.icon} size={20} />
      <Text style={[styles.badgeText, { color: visuals.textColor }]}>{riskText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  badgeText: {
    fontFamily: typography.headingFont,
    fontSize: 14,
    letterSpacing: 0.2,
  },
});
