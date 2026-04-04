import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppAppearance } from '../context/AppearanceContext';
import { elevation, shape, typography } from '../theme/tokens';

interface ProtectionCardProps {
  active: boolean;
  busy: boolean;
  onToggle: (nextActive: boolean) => void;
}

export default function ProtectionCard({
  active,
  busy,
  onToggle,
}: ProtectionCardProps) {
  const { appColors } = useAppAppearance();
  const statusLabel = active ? 'Active' : 'Inactive';

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: appColors.outlineVariant,
          backgroundColor: active
            ? appColors.primaryContainer
            : appColors.surfaceContainerLow,
        },
      ]}
    >
      {/* WHY: This panel makes policy enforceability explicit so the judge state is readable at a glance. */}
      <View style={styles.row}>
        <View style={styles.leftContent}>
          <Ionicons
            color={active ? appColors.success : appColors.textMuted}
            name={active ? 'shield-checkmark' : 'shield-outline'}
            size={24}
          />
          <View>
            <Text style={[styles.label, { color: appColors.textSecondary }]}>Protection Status</Text>
            <Text
              style={[
                styles.statusValue,
                { color: active ? appColors.onPrimaryContainer : appColors.onSurfaceVariant },
              ]}
            >
              {statusLabel}
            </Text>
          </View>
        </View>
        <Switch
          disabled={busy}
          onValueChange={onToggle}
          thumbColor={appColors.surface}
          trackColor={{ false: appColors.border, true: appColors.brand }}
          value={active}
        />
      </View>

      <Pressable
        disabled={busy}
        onPress={() => onToggle(!active)}
        style={({ pressed }) => [
          styles.actionButton,
          {
            backgroundColor: appColors.secondaryContainer,
            borderColor: appColors.outlineVariant,
          },
          pressed && !busy ? styles.actionButtonPressed : null,
        ]}
      >
        <Text style={[styles.actionButtonText, { color: appColors.onSecondaryContainer }]}>
          {busy ? 'Updating...' : active ? 'Disable Protection' : 'Enable Protection'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...elevation.level1,
    borderRadius: shape.md,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  label: {
    fontFamily: typography.bodyFont,
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  statusValue: {
    fontFamily: typography.headingFont,
    fontSize: 20,
  },
  actionButton: {
    borderRadius: shape.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionButtonPressed: {
    opacity: 0.8,
  },
  actionButtonText: {
    fontFamily: typography.bodyFont,
    fontSize: 14,
    fontWeight: '600',
  },
});
