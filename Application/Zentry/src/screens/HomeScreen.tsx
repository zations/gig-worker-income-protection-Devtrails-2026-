import React, { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ActivityIndicator,
  Animated,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LiveRiskBadge from '../components/LiveRiskBadge';
import ProtectionCard from '../components/ProtectionCard';
import RecentActivityFeed from '../components/RecentActivityFeed';
import { useAppAppearance } from '../context/AppearanceContext';
import { useSystemState } from '../context/SystemStateContext';
import { useUserContext } from '../context/UserContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { elevation, shape, typography } from '../theme/tokens';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { appColors } = useAppAppearance();
  const { passiveTrackingEnabled } = useUserContext();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const pulseOpacity = useRef(new Animated.Value(0.3)).current;
  const {
    location,
    protectionActive,
    liveRisk,
    payoutHistory,
    lastPayout,
    isBootstrapping,
    isMutating,
    toggleProtection,
  } = useSystemState();

  useEffect(() => {
    if (!passiveTrackingEnabled) {
      pulseOpacity.stopAnimation();
      pulseOpacity.setValue(0.3);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [passiveTrackingEnabled, pulseOpacity]);

  const handleProtectionToggle = (nextActive: boolean) => {
    toggleProtection(nextActive).catch(() => {
      Alert.alert(
        'Status Update Failed',
        'The protection switch could not be updated. Please retry.',
      );
    });
  };

  if (isBootstrapping) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: appColors.background }]}>
        <ActivityIndicator color={appColors.brand} size="large" />
        <Text style={[styles.loadingText, { color: appColors.textSecondary }]}>
          Bootstrapping mock system state...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { backgroundColor: appColors.background },
        {
          paddingTop: insets.top + 6,
        },
      ]}
    >
      <View style={[styles.appBar, { backgroundColor: appColors.surfaceContainer }]}>
        {/* WHY: A dedicated app bar keeps key navigation actions discoverable in a traditional page flow. */}
        <View style={styles.appBarTextWrap}>
          <Text style={[styles.appTitle, { color: appColors.onSurface }]}>Zentry</Text>
          <Text style={[styles.appSubtitle, { color: appColors.onSurfaceVariant }]}>
            Parametric protection console
          </Text>
        </View>

        <View style={styles.appBarActions}>
          {passiveTrackingEnabled ? (
            <View
              style={[
                styles.gpsBadge,
                {
                  backgroundColor: appColors.surface,
                  borderColor: appColors.outlineVariant,
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.gpsPulseDot,
                  {
                    backgroundColor: appColors.success,
                    opacity: pulseOpacity,
                    transform: [
                      {
                        scale: pulseOpacity.interpolate({
                          inputRange: [0.3, 1],
                          outputRange: [0.85, 1.25],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Text style={[styles.gpsLabel, { color: appColors.onSurface }]}>GPS Active</Text>
            </View>
          ) : null}

          <Pressable
            onPress={() => navigation.navigate('UserDetails')}
            style={({ pressed }) => [
              styles.profileButton,
              { backgroundColor: appColors.secondaryContainer },
              pressed ? styles.profilePressed : null,
            ]}
          >
            <Ionicons
              color={appColors.onSecondaryContainer}
              name="person-circle"
              size={24}
            />
          </Pressable>
        </View>
      </View>

      <View
        style={[
          styles.locationCard,
          {
            backgroundColor: appColors.surfaceContainerLow,
            borderColor: appColors.outlineVariant,
          },
        ]}
      >
        {/* WHY: Geo context is shown first because payout logic is zone-sensitive in parametric insurance. */}
        <View style={styles.locationHeader}>
          <Ionicons color={appColors.brand} name="location" size={20} />
          <Text style={[styles.locationTitle, { color: appColors.textSecondary }]}>
            Current Zone
          </Text>
        </View>
        <Text style={[styles.locationValue, { color: appColors.onSurface }]}>{location}</Text>
      </View>

      <View style={styles.navigationCardRow}>
        {/* WHY: Navigation-by-button makes each workflow explicit and mirrors traditional multi-page app behavior. */}
        <Pressable
          onPress={() => navigation.navigate('Policy')}
          style={({ pressed }) => [
            styles.pageButton,
            {
              backgroundColor: appColors.secondaryContainer,
              borderColor: appColors.outlineVariant,
            },
            pressed ? styles.pageButtonPressed : null,
          ]}
        >
          <Ionicons
            color={appColors.onSecondaryContainer}
            name="shield-checkmark-outline"
            size={18}
          />
          <Text style={[styles.pageButtonTitle, { color: appColors.onSecondaryContainer }]}>
            Open Policy Page
          </Text>
          <Text style={[styles.pageButtonHint, { color: appColors.onSurfaceVariant }]}>Choose tier and activate cover.</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('GeoReport')}
          style={({ pressed }) => [
            styles.pageButton,
            {
              backgroundColor: appColors.secondaryContainer,
              borderColor: appColors.outlineVariant,
            },
            pressed ? styles.pageButtonPressed : null,
          ]}
        >
          <Ionicons color={appColors.onSecondaryContainer} name="camera-outline" size={18} />
          <Text style={[styles.pageButtonTitle, { color: appColors.onSecondaryContainer }]}>
            Open Geo Report
          </Text>
          <Text style={[styles.pageButtonHint, { color: appColors.onSurfaceVariant }]}>
            Capture evidence and submit event.
          </Text>
        </Pressable>
      </View>

      <ProtectionCard
        active={protectionActive}
        busy={isMutating}
        onToggle={handleProtectionToggle}
      />

      <View
        style={[
          styles.riskCard,
          {
            backgroundColor: appColors.surfaceContainerLow,
            borderColor: appColors.outlineVariant,
          },
        ]}
      >
        {/* WHY: The live risk badge validates that the judge uses continuously changing hazard signals. */}
        <Text style={[styles.sectionTitle, { color: appColors.textPrimary }]}>Live Risk Status</Text>
        <LiveRiskBadge riskText={liveRisk} />
      </View>

      <View
        style={[
          styles.lastPayoutCard,
          {
            backgroundColor: appColors.tertiaryContainer,
            borderColor: appColors.outlineVariant,
          },
        ]}
      >
        {/* WHY: Last payout visibility makes automated compensation transparent to the worker. */}
        <Text style={[styles.lastPayoutLabel, { color: appColors.onTertiaryContainer }]}>Last Payout</Text>
        <Text style={[styles.lastPayoutAmount, { color: appColors.onTertiaryContainer }]}>
          {lastPayout ? `INR ${lastPayout.amount}` : 'No payout yet'}
        </Text>
        <Text style={[styles.lastPayoutReason, { color: appColors.onSurfaceVariant }]} numberOfLines={2}>
          {lastPayout ? lastPayout.reason : 'Trigger a debug event to generate one.'}
        </Text>
      </View>

      <RecentActivityFeed history={payoutHistory} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    padding: 16,
    paddingBottom: 36,
  },
  appBar: {
    alignItems: 'center',
    borderRadius: shape.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  appBarTextWrap: {
    gap: 2,
  },
  appBarActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  appTitle: {
    fontFamily: typography.headingFont,
    fontSize: 24,
  },
  appSubtitle: {
    fontFamily: typography.bodyFont,
    fontSize: 13,
  },
  profileButton: {
    alignItems: 'center',
    borderRadius: shape.pill,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  profilePressed: {
    opacity: 0.85,
  },
  gpsBadge: {
    alignItems: 'center',
    borderRadius: shape.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  gpsPulseDot: {
    borderRadius: shape.pill,
    height: 8,
    width: 8,
  },
  gpsLabel: {
    fontFamily: typography.monoFont,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
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
  locationCard: {
    ...elevation.level1,
    borderRadius: shape.md,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  locationHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  locationTitle: {
    fontFamily: typography.bodyFont,
    fontSize: 13,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  locationValue: {
    fontFamily: typography.headingFont,
    fontSize: 24,
  },
  navigationCardRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pageButton: {
    ...elevation.level1,
    borderRadius: shape.md,
    borderWidth: 1,
    flex: 1,
    gap: 7,
    minHeight: 102,
    padding: 12,
  },
  pageButtonPressed: {
    opacity: 0.88,
  },
  pageButtonTitle: {
    fontFamily: typography.headingFont,
    fontSize: 13,
  },
  pageButtonHint: {
    fontFamily: typography.bodyFont,
    fontSize: 12,
    lineHeight: 17,
  },
  riskCard: {
    ...elevation.level1,
    borderRadius: shape.md,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  sectionTitle: {
    fontFamily: typography.headingFont,
    fontSize: 17,
  },
  lastPayoutCard: {
    ...elevation.level1,
    borderRadius: shape.md,
    borderWidth: 1,
    gap: 6,
    padding: 16,
  },
  lastPayoutLabel: {
    fontFamily: typography.bodyFont,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  lastPayoutAmount: {
    fontFamily: typography.headingFont,
    fontSize: 28,
  },
  lastPayoutReason: {
    fontFamily: typography.bodyFont,
    fontSize: 13,
    lineHeight: 18,
  },
});
