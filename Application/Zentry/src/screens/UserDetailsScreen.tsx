import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  ThemePreference,
  useAppAppearance,
} from '../context/AppearanceContext';
import {
  FraudClearanceReport,
  useSystemState,
} from '../context/SystemStateContext';
import { useUserContext } from '../context/UserContext';
import { getStoredUserProfile } from '../services/appStorage';
import { elevation, shape, typography } from '../theme/tokens';
import { logger } from '../utils/logger';

interface UserProfile {
  fullName: string;
  workerId: string;
  role: string;
  phone: string;
  memberSince: string;
  walletStatus: string;
}

const fallbackUser: UserProfile = {
  fullName: 'Arun Kumar',
  workerId: 'GW-CHN-2048',
  role: 'Delivery Partner',
  phone: '+91 98400 11223',
  memberSince: 'Aug 2024',
  walletStatus: 'Verified',
};

const THEME_OPTIONS: Array<{ label: string; value: ThemePreference }> = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

function wait(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

function InfoRow({
  label,
  value,
  accentColor,
  labelColor,
  valueColor,
  borderColor,
}: {
  label: string;
  value: string;
  accentColor?: string;
  labelColor?: string;
  valueColor?: string;
  borderColor?: string;
}) {
  return (
    <View style={[styles.infoRow, borderColor ? { borderBottomColor: borderColor } : null]}>
      <Text style={[styles.infoLabel, labelColor ? { color: labelColor } : null]}>
        {label}
      </Text>
      <Text
        style={[
          styles.infoValue,
          valueColor ? { color: valueColor } : null,
          accentColor ? { color: accentColor } : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export default function UserDetailsScreen() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(fallbackUser);
  const [isRainSimulationRunning, setIsRainSimulationRunning] = useState(false);
  const [isRiskSpikeSimulationEnabled, setIsRiskSpikeSimulationEnabled] =
    useState(false);
  const [isOfflineSimulationEnabled, setIsOfflineSimulationEnabled] =
    useState(false);
  const [localSimulationEvents, setLocalSimulationEvents] = useState<string[]>([]);
  const [systemCheckReport, setSystemCheckReport] =
    useState<FraudClearanceReport | null>(null);
  const [payoutToastMessage, setPayoutToastMessage] = useState<string | null>(null);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    location,
    protectionActive,
    dynamicRiskScore,
    liveRisk,
    lastPayout,
    simulateRainEvent,
    isMutating,
  } = useSystemState();
  const {
    passiveTrackingEnabled,
    setPassiveTrackingEnabled,
    lastTelemetryPacket,
    workProfile,
  } = useUserContext();
  const { appColors, themePreference, resolvedTheme, setThemePreference } =
    useAppAppearance();

  const modePalette = useMemo(
    () => ({
      pageBackground: appColors.background,
      profileCardBackground: appColors.secondaryContainer,
      sectionBackground: appColors.surfaceContainerLow,
      elevatedSurface: appColors.surfaceContainer,
      chipBackground: appColors.surfaceContainerHighest,
      border: appColors.outlineVariant,
      title: appColors.textPrimary,
      body: appColors.textSecondary,
      muted: appColors.textMuted,
      profileName: appColors.onSecondaryContainer,
      profileRole: appColors.onSurfaceVariant,
      chipText: appColors.onSurface,
      avatarBackground: appColors.secondary,
      secondaryButtonText: appColors.onSecondaryContainer,
    }),
    [appColors],
  );

  const effectiveRiskScore = useMemo(
    () =>
      isRiskSpikeSimulationEnabled
        ? Math.min(0.99, Number((dynamicRiskScore + 0.21).toFixed(2)))
        : dynamicRiskScore,
    [dynamicRiskScore, isRiskSpikeSimulationEnabled],
  );

  const effectiveLiveRisk = isRiskSpikeSimulationEnabled
    ? 'Simulated Severe Storm (local only)'
    : liveRisk;

  const connectivityState = isOfflineSimulationEnabled
    ? 'Offline (simulated)'
    : 'Online';

  const registerLocalSimulation = (eventTitle: string) => {
    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    setLocalSimulationEvents(previous => [`${timestamp} - ${eventTitle}`, ...previous].slice(0, 6));
  };

  const showPayoutToast = (message: string) => {
    setPayoutToastMessage(message);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setPayoutToastMessage(null);
      toastTimerRef.current = null;
    }, 2600);
  };

  const handleSimulateRainEvent = async () => {
    setIsRainSimulationRunning(true);

    try {
      const result = await simulateRainEvent();

      setSystemCheckReport(result.fraudClearanceReport);
      registerLocalSimulation(
        `Fraud clearance passed (score ${result.fraudClearanceReport.fraud_score.toFixed(2)})`,
      );

      await wait(1500);

      setSystemCheckReport(null);
      showPayoutToast(`Payout released: INR ${result.payout.amount}`);
      registerLocalSimulation('Backend rain payout simulation completed');
    } catch (error) {
      logger.warn('Rain simulation failed from profile section.', error);
      Alert.alert('Simulation Failed', 'The rain event could not be completed.');
      setSystemCheckReport(null);
    } finally {
      setIsRainSimulationRunning(false);
    }
  };

  const handleToggleRiskSpikeSimulation = () => {
    setIsRiskSpikeSimulationEnabled(previous => {
      const nextValue = !previous;

      registerLocalSimulation(
        nextValue
          ? 'Enabled local risk spike preview'
          : 'Disabled local risk spike preview',
      );

      return nextValue;
    });
  };

  const handleToggleOfflineSimulation = () => {
    setIsOfflineSimulationEnabled(previous => {
      const nextValue = !previous;

      registerLocalSimulation(
        nextValue
          ? 'Enabled offline connectivity preview'
          : 'Disabled offline connectivity preview',
      );

      return nextValue;
    });
  };

  const handlePassiveTrackingToggle = (nextValue: boolean) => {
    setPassiveTrackingEnabled(nextValue);

    registerLocalSimulation(
      nextValue
        ? 'Enabled passive tracking (/location_update every 5s)'
        : 'Disabled passive tracking',
    );
  };

  const handleTriggerLocalSafetyAlert = () => {
    Alert.alert(
      'Local Safety Alert Simulation',
      'This alert is generated on-device and does not call backend services.',
    );

    registerLocalSimulation('Triggered local safety alert simulation');
  };

  useEffect(() => {
    let isMounted = true;

    const loadUserProfile = async () => {
      try {
        const profile = await getStoredUserProfile();

        if (!profile) {
          return;
        }

        if (!isMounted) {
          return;
        }

        setCurrentUser(previous => ({
          ...previous,
          fullName: profile.fullName ?? previous.fullName,
          phone: profile.phone ? `+91 ${profile.phone}` : previous.phone,
          workerId: profile.workerId ?? previous.workerId,
          memberSince: profile.loginAt
            ? new Date(profile.loginAt).toLocaleDateString(undefined, {
                month: 'short',
                year: 'numeric',
              })
            : previous.memberSince,
        }));
      } catch (error) {
        logger.warn('Failed to load user profile.', error);
      }
    };

    loadUserProfile().catch(error => {
      logger.warn('Unexpected user profile hydration failure.', error);
    });

    return () => {
      isMounted = false;

      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  return (
    <View style={[styles.screen, { backgroundColor: modePalette.pageBackground }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { backgroundColor: modePalette.pageBackground },
        ]}
      >
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: modePalette.profileCardBackground,
              borderColor: modePalette.border,
            },
          ]}
        >
          {/* WHY: This card keeps identity and adjudication context together for quick claim triage checks. */}
          <View style={styles.profileTopRow}>
            <View
              style={[styles.avatarWrap, { backgroundColor: modePalette.avatarBackground }]}
            >
              <Ionicons color={appColors.onSecondary} name="person" size={24} />
            </View>
            <View style={styles.profileTextWrap}>
              <Text style={[styles.nameText, { color: modePalette.profileName }]}> 
                {currentUser.fullName}
              </Text>
              <Text style={[styles.roleText, { color: modePalette.profileRole }]}> 
                {currentUser.role}
              </Text>
            </View>
          </View>

          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badgeChip,
                {
                  backgroundColor: modePalette.chipBackground,
                  borderColor: modePalette.border,
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: modePalette.chipText }]}> 
                {currentUser.workerId}
              </Text>
            </View>
            <View
              style={[
                styles.badgeChip,
                {
                  backgroundColor: modePalette.chipBackground,
                  borderColor: modePalette.border,
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: modePalette.chipText }]}> 
                {currentUser.walletStatus}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: modePalette.sectionBackground,
              borderColor: modePalette.border,
            },
          ]}
        >
          {/* WHY: These fields represent user metadata usually fetched from identity and wallet services. */}
          <Text style={[styles.sectionTitle, { color: modePalette.title }]}>Identity Snapshot</Text>
          <InfoRow
            borderColor={modePalette.border}
            label="Phone"
            labelColor={modePalette.muted}
            value={currentUser.phone}
            valueColor={modePalette.title}
          />
          <InfoRow
            borderColor={modePalette.border}
            label="Member Since"
            labelColor={modePalette.muted}
            value={currentUser.memberSince}
            valueColor={modePalette.title}
          />
          <InfoRow
            borderColor={modePalette.border}
            label="Current Zone"
            labelColor={modePalette.muted}
            value={location}
            valueColor={modePalette.title}
          />
          <InfoRow
            borderColor={modePalette.border}
            label="Home Zone"
            labelColor={modePalette.muted}
            value={workProfile?.homeZone ?? 'Not set'}
            valueColor={modePalette.title}
          />
          <InfoRow
            borderColor={modePalette.border}
            label="Vehicle"
            labelColor={modePalette.muted}
            value={workProfile?.vehicleType ?? 'Not set'}
            valueColor={modePalette.title}
          />
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: modePalette.sectionBackground,
              borderColor: modePalette.border,
            },
          ]}
        >
          {/* WHY: System state values show what the judge currently sees for payout decisioning. */}
          <Text style={[styles.sectionTitle, { color: modePalette.title }]}>Protection State</Text>
          <InfoRow
            borderColor={modePalette.border}
            label="Protection"
            labelColor={modePalette.muted}
            value={protectionActive ? 'Active' : 'Inactive'}
            valueColor={modePalette.title}
          />
          <InfoRow
            borderColor={modePalette.border}
            label="Live Risk"
            labelColor={modePalette.muted}
            value={effectiveLiveRisk}
            accentColor={isRiskSpikeSimulationEnabled ? appColors.warning : undefined}
            valueColor={modePalette.title}
          />
          <InfoRow
            borderColor={modePalette.border}
            label="Risk Score"
            labelColor={modePalette.muted}
            value={effectiveRiskScore.toFixed(2)}
            valueColor={modePalette.title}
          />
          <InfoRow
            borderColor={modePalette.border}
            label="Connectivity"
            labelColor={modePalette.muted}
            value={connectivityState}
            accentColor={
              isOfflineSimulationEnabled ? appColors.warning : appColors.success
            }
            valueColor={modePalette.title}
          />
          <InfoRow
            borderColor={modePalette.border}
            label="Passive GPS"
            labelColor={modePalette.muted}
            value={passiveTrackingEnabled ? 'Active' : 'Off'}
            accentColor={passiveTrackingEnabled ? appColors.success : appColors.textMuted}
            valueColor={modePalette.title}
          />
          <InfoRow
            borderColor={modePalette.border}
            label="Last Payout"
            labelColor={modePalette.muted}
            value={lastPayout ? `INR ${lastPayout.amount}` : 'No payout yet'}
            valueColor={modePalette.title}
          />
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: modePalette.sectionBackground,
              borderColor: modePalette.border,
            },
          ]}
        >
          {/* WHY: Theme preference controls visual mode and allows user-level override of system appearance. */}
          <Text style={[styles.sectionTitle, { color: modePalette.title }]}>Appearance Settings</Text>
          <Text style={[styles.helperText, { color: modePalette.body }]}> 
            Active mode: {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
          </Text>

          <View style={styles.themeOptionRow}>
            {THEME_OPTIONS.map(option => (
              <Pressable
                key={option.value}
                onPress={() => setThemePreference(option.value)}
                style={({ pressed }) => [
                  styles.themeOption,
                  {
                    backgroundColor: modePalette.elevatedSurface,
                    borderColor: modePalette.border,
                  },
                  themePreference === option.value
                    ? {
                        backgroundColor: appColors.primary,
                        borderColor: appColors.primary,
                      }
                    : null,
                  pressed ? styles.buttonPressed : null,
                ]}
              >
                <Text
                  style={[
                    styles.themeOptionText,
                    { color: modePalette.body },
                    themePreference === option.value
                      ? { color: appColors.onPrimary }
                      : null,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: modePalette.sectionBackground,
              borderColor: modePalette.border,
            },
          ]}
        >
          {/* WHY: A dedicated simulation lab keeps debug/testing tools away from core policy workflows. */}
          <Text style={[styles.sectionTitle, { color: modePalette.title }]}>Simulation Lab</Text>
          <Text style={[styles.helperText, { color: modePalette.body }]}> 
            Use local and backend simulations without leaving the profile page.
          </Text>

          <View
            style={[
              styles.passiveTrackingRow,
              {
                backgroundColor: modePalette.elevatedSurface,
                borderColor: modePalette.border,
              },
            ]}
          >
            <View style={styles.passiveTrackingTextWrap}>
              <Text style={[styles.passiveTrackingTitle, { color: modePalette.title }]}>Toggle Passive Tracking</Text>
              <Text style={[styles.passiveTrackingCaption, { color: modePalette.body }]}>POST /location_update every 5s with lat, lon, speed, and battery.</Text>
            </View>
            <Switch
              onValueChange={handlePassiveTrackingToggle}
              thumbColor={passiveTrackingEnabled ? appColors.onPrimary : appColors.surfaceContainerHighest}
              trackColor={{ false: appColors.outlineVariant, true: appColors.primary }}
              value={passiveTrackingEnabled}
            />
          </View>

          {lastTelemetryPacket ? (
            <Text style={[styles.telemetryText, { color: modePalette.muted }]}> 
              Last packet: {lastTelemetryPacket.lat.toFixed(4)},{' '}
              {lastTelemetryPacket.lon.toFixed(4)} | {lastTelemetryPacket.speed.toFixed(1)} km/h | {lastTelemetryPacket.battery}% battery
            </Text>
          ) : (
            <Text style={[styles.telemetryText, { color: modePalette.muted }]}> 
              No passive packets sent yet.
            </Text>
          )}

          <Text style={[styles.subsectionLabel, { color: modePalette.muted }]}>Backend-connected simulation</Text>
          <Pressable
            disabled={isRainSimulationRunning || isMutating}
            onPress={handleSimulateRainEvent}
            style={({ pressed }) => [
              styles.backendButton,
              { backgroundColor: appColors.primary },
              pressed && !(isRainSimulationRunning || isMutating)
                ? styles.buttonPressed
                : null,
            ]}
          >
            <Ionicons color={appColors.onPrimary} name="rainy-outline" size={16} />
            <Text style={[styles.backendButtonText, { color: appColors.onPrimary }]}> 
              {isRainSimulationRunning
                ? 'Running Rain Simulation...'
                : 'Trigger Rain Payout (Mock Backend)'}
            </Text>
          </Pressable>

          <Text style={[styles.subsectionLabel, { color: modePalette.muted }]}>Local-only simulations (no backend call)</Text>
          <View style={styles.localActionList}>
            <Pressable
              onPress={handleToggleRiskSpikeSimulation}
              style={({ pressed }) => [
                styles.localActionButton,
                {
                  backgroundColor: modePalette.elevatedSurface,
                  borderColor: modePalette.border,
                },
                pressed ? styles.buttonPressed : null,
              ]}
            >
              <Ionicons
                color={appColors.onSecondaryContainer}
                name={isRiskSpikeSimulationEnabled ? 'flash' : 'flash-outline'}
                size={16}
              />
              <Text
                style={[styles.localActionText, { color: modePalette.secondaryButtonText }]}
              >
                {isRiskSpikeSimulationEnabled
                  ? 'Disable Risk Spike Preview'
                  : 'Enable Risk Spike Preview'}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleToggleOfflineSimulation}
              style={({ pressed }) => [
                styles.localActionButton,
                {
                  backgroundColor: modePalette.elevatedSurface,
                  borderColor: modePalette.border,
                },
                pressed ? styles.buttonPressed : null,
              ]}
            >
              <Ionicons
                color={appColors.onSecondaryContainer}
                name={isOfflineSimulationEnabled ? 'cloud-offline' : 'cloud-outline'}
                size={16}
              />
              <Text
                style={[styles.localActionText, { color: modePalette.secondaryButtonText }]}
              >
                {isOfflineSimulationEnabled
                  ? 'Disable Offline Preview'
                  : 'Enable Offline Preview'}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleTriggerLocalSafetyAlert}
              style={({ pressed }) => [
                styles.localActionButton,
                {
                  backgroundColor: modePalette.elevatedSurface,
                  borderColor: modePalette.border,
                },
                pressed ? styles.buttonPressed : null,
              ]}
            >
              <Ionicons
                color={appColors.onSecondaryContainer}
                name="notifications-outline"
                size={16}
              />
              <Text
                style={[styles.localActionText, { color: modePalette.secondaryButtonText }]}
              >
                Trigger Local Safety Alert
              </Text>
            </Pressable>
          </View>

          <View
            style={[
              styles.simulationHistoryWrap,
              { backgroundColor: modePalette.elevatedSurface },
            ]}
          >
            <Text style={[styles.simulationHistoryTitle, { color: modePalette.title }]}> 
              Recent Simulation Events
            </Text>
            {localSimulationEvents.length === 0 ? (
              <Text style={[styles.simulationHistoryEmpty, { color: modePalette.muted }]}> 
                No local simulation events yet.
              </Text>
            ) : (
              localSimulationEvents.map((event, index) => (
                <Text
                  key={`${event}-${index}`}
                  style={[styles.simulationHistoryEntry, { color: modePalette.body }]}
                >
                  {event}
                </Text>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {systemCheckReport ? (
        <View style={styles.overlayBackdrop}>
          <View
            style={[
              styles.overlayCard,
              {
                backgroundColor: appColors.surface,
                borderColor: appColors.outlineVariant,
              },
            ]}
          >
            <Text style={[styles.overlayTitle, { color: appColors.textPrimary }]}>System Check</Text>
            <Text style={[styles.overlayBody, { color: appColors.textSecondary }]}>Fraud clearance report validated before payout release.</Text>
            <Text style={[styles.overlayMetric, { color: appColors.textPrimary }]}>Fraud score: {systemCheckReport.fraud_score.toFixed(2)}</Text>
            <Text style={[styles.overlayMetric, { color: appColors.textPrimary }]}>Location verified: {systemCheckReport.location_verified ? 'True' : 'False'}</Text>
            <Text style={[styles.overlayMetric, { color: appColors.textPrimary }]}>Telemetry consistency: {Math.round(systemCheckReport.telemetry_consistency * 100)}%</Text>
          </View>
        </View>
      ) : null}

      {payoutToastMessage ? (
        <View pointerEvents="none" style={styles.toastWrap}>
          <View
            style={[
              styles.toastCard,
              {
                backgroundColor: appColors.secondaryContainer,
                borderColor: appColors.outlineVariant,
              },
            ]}
          >
            <Text style={[styles.toastText, { color: appColors.onSecondaryContainer }]}> 
              {payoutToastMessage}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    gap: 14,
    padding: 16,
    paddingBottom: 32,
  },
  profileCard: {
    ...elevation.level1,
    borderWidth: 1,
    borderRadius: shape.lg,
    gap: 12,
    padding: 16,
  },
  profileTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  avatarWrap: {
    alignItems: 'center',
    borderRadius: shape.md,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  profileTextWrap: {
    flex: 1,
    gap: 3,
  },
  nameText: {
    fontFamily: typography.headingFont,
    fontSize: 20,
  },
  roleText: {
    fontFamily: typography.bodyFont,
    fontSize: 13,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badgeChip: {
    borderRadius: shape.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontFamily: typography.monoFont,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  sectionCard: {
    ...elevation.level1,
    borderRadius: shape.md,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  sectionTitle: {
    fontFamily: typography.headingFont,
    fontSize: 16,
  },
  helperText: {
    fontFamily: typography.bodyFont,
    fontSize: 13,
    lineHeight: 19,
  },
  themeOptionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOption: {
    alignItems: 'center',
    borderRadius: shape.pill,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 9,
  },
  themeOptionText: {
    fontFamily: typography.bodyFont,
    fontSize: 13,
    fontWeight: '700',
  },
  passiveTrackingRow: {
    alignItems: 'center',
    borderRadius: shape.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  passiveTrackingTextWrap: {
    flex: 1,
    gap: 3,
  },
  passiveTrackingTitle: {
    fontFamily: typography.headingFont,
    fontSize: 13,
  },
  passiveTrackingCaption: {
    fontFamily: typography.bodyFont,
    fontSize: 12,
    lineHeight: 17,
  },
  telemetryText: {
    fontFamily: typography.monoFont,
    fontSize: 11,
    lineHeight: 16,
  },
  subsectionLabel: {
    fontFamily: typography.bodyFont,
    fontSize: 12,
    letterSpacing: 0.3,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  backendButton: {
    alignItems: 'center',
    borderRadius: shape.pill,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  backendButtonText: {
    fontFamily: typography.headingFont,
    fontSize: 14,
  },
  localActionList: {
    gap: 8,
  },
  localActionButton: {
    alignItems: 'center',
    borderRadius: shape.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  localActionText: {
    fontFamily: typography.bodyFont,
    fontSize: 13,
    fontWeight: '700',
  },
  simulationHistoryWrap: {
    borderRadius: shape.sm,
    gap: 6,
    padding: 10,
  },
  simulationHistoryTitle: {
    fontFamily: typography.headingFont,
    fontSize: 13,
  },
  simulationHistoryEmpty: {
    fontFamily: typography.bodyFont,
    fontSize: 12,
  },
  simulationHistoryEntry: {
    fontFamily: typography.monoFont,
    fontSize: 11,
    lineHeight: 16,
  },
  buttonPressed: {
    opacity: 0.86,
  },
  infoRow: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  infoLabel: {
    fontFamily: typography.bodyFont,
    fontSize: 13,
  },
  infoValue: {
    fontFamily: typography.headingFont,
    fontSize: 13,
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  overlayCard: {
    ...elevation.level2,
    borderRadius: shape.md,
    borderWidth: 1,
    gap: 5,
    maxWidth: 360,
    padding: 14,
    width: '100%',
  },
  overlayTitle: {
    fontFamily: typography.headingFont,
    fontSize: 18,
  },
  overlayBody: {
    fontFamily: typography.bodyFont,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 4,
  },
  overlayMetric: {
    fontFamily: typography.monoFont,
    fontSize: 12,
  },
  toastWrap: {
    bottom: 18,
    left: 16,
    position: 'absolute',
    right: 16,
  },
  toastCard: {
    ...elevation.level2,
    borderRadius: shape.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  toastText: {
    fontFamily: typography.headingFont,
    fontSize: 13,
    textAlign: 'center',
  },
});
