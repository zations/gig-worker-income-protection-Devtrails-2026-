import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppAppearance } from '../context/AppearanceContext';
import { PayoutActivity } from '../context/SystemStateContext';
import { elevation, shape, typography } from '../theme/tokens';

interface RecentActivityFeedProps {
  history: PayoutActivity[];
}

function formatTimeLabel(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function RecentActivityFeed({ history }: RecentActivityFeedProps) {
  const { appColors } = useAppAppearance();
  const visibleRows = history.slice(0, 5);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: appColors.surfaceContainerLow,
          borderColor: appColors.outlineVariant,
        },
      ]}
    >
      {/* WHY: Showing payout chronology helps judges verify that triggers produce deterministic settlements. */}
      <Text style={[styles.title, { color: appColors.textPrimary }]}>Recent Activity</Text>

      {visibleRows.length === 0 ? (
        <Text style={[styles.emptyText, { color: appColors.textMuted }]}>
          No payouts yet. Run a debug event to seed activity.
        </Text>
      ) : (
        visibleRows.map(item => (
          <View
            key={item.id}
            style={[styles.row, { borderBottomColor: appColors.outlineVariant }]}
          >
            <View style={styles.rowLeft}>
              <Text style={[styles.reasonText, { color: appColors.textPrimary }]}>
                {item.reason}
              </Text>
              <View
                style={[
                  styles.reasoningTag,
                  {
                    backgroundColor: appColors.surfaceContainer,
                    borderColor: appColors.outlineVariant,
                  },
                ]}
              >
                <Text style={[styles.reasoningTagText, { color: appColors.textSecondary }]}>
                  {item.reasoningTag}
                </Text>
              </View>
              <Text style={[styles.metaText, { color: appColors.textMuted }]}>
                {item.source} | {formatTimeLabel(item.timestamp)}
              </Text>
            </View>
            <Text style={[styles.amountText, { color: appColors.brand }]}>INR {item.amount}</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...elevation.level1,
    borderRadius: shape.md,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  title: {
    fontFamily: typography.headingFont,
    fontSize: 17,
  },
  emptyText: {
    fontFamily: typography.bodyFont,
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  rowLeft: {
    flex: 1,
    gap: 4,
    paddingRight: 10,
  },
  reasonText: {
    fontFamily: typography.bodyFont,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  metaText: {
    fontFamily: typography.monoFont,
    fontSize: 12,
  },
  reasoningTag: {
    alignSelf: 'flex-start',
    borderRadius: shape.pill,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  reasoningTagText: {
    fontFamily: typography.bodyFont,
    fontSize: 11,
    fontWeight: '700',
  },
  amountText: {
    fontFamily: typography.headingFont,
    fontSize: 14,
    fontWeight: '700',
  },
});
