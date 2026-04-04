import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppAppearance } from '../context/AppearanceContext';
import { shape, typography } from '../theme/tokens';

interface CameraPlaceholderProps {
  latitude: number;
  longitude: number;
  timestamp: string;
  capturedImageUri: string | null;
  isCapturing: boolean;
  isPickingLibrary: boolean;
  onCapture: () => void;
  onPickFromLibrary: () => void;
  onRetake: () => void;
}

export default function CameraPlaceholder({
  latitude,
  longitude,
  timestamp,
  capturedImageUri,
  isCapturing,
  isPickingLibrary,
  onCapture,
  onPickFromLibrary,
  onRetake,
}: CameraPlaceholderProps) {
  const { appColors, resolvedTheme } = useAppAppearance();
  const hasEvidence = Boolean(capturedImageUri);
  const frameBackground = resolvedTheme === 'dark' ? '#0B1220' : '#E6EFF7';
  const viewportBackground = resolvedTheme === 'dark' ? '#102033' : '#1D3854';
  const scanBandColor =
    resolvedTheme === 'dark'
      ? 'rgba(226, 232, 240, 0.08)'
      : 'rgba(241, 248, 255, 0.18)';
  const telemetryBackground =
    resolvedTheme === 'dark'
      ? 'rgba(11, 18, 32, 0.78)'
      : 'rgba(8, 22, 42, 0.72)';
  const telemetryBorder =
    resolvedTheme === 'dark'
      ? 'rgba(138, 149, 148, 0.45)'
      : 'rgba(111, 121, 120, 0.4)';
  const promptAccent = resolvedTheme === 'dark' ? '#BFDBFE' : '#D8EAFE';

  return (
    <View
      style={[
        styles.frame,
        {
          backgroundColor: frameBackground,
          borderColor: appColors.outlineVariant,
        },
      ]}
    >
      <View style={styles.viewport}>
        {/* WHY: Real photo capture makes the geo report workflow operational while preserving telemetry overlays for judge traceability. */}
        {capturedImageUri ? (
          <Image
            resizeMode="cover"
            source={{ uri: capturedImageUri }}
            style={styles.previewImage}
          />
        ) : (
          <View style={[styles.mockBackground, { backgroundColor: viewportBackground }]}>
            <View style={styles.gradientCore} />
            <View style={styles.gradientBloom} />
            <View style={[styles.scanBand, { backgroundColor: scanBandColor }]} />

            <View style={styles.centerPrompt}>
              <Ionicons color={appColors.surfaceContainerLowest} name="camera-outline" size={30} />
              <Text style={[styles.cameraTitle, { color: appColors.surfaceContainerLowest }]}>
                Ready for Field Capture
              </Text>
              <Text style={[styles.cameraSubtitle, { color: promptAccent }]}>
                Tap capture to open device camera
              </Text>
            </View>
          </View>
        )}

        <View style={styles.topTelemetryRow}>
          <View
            style={[
              styles.telemetryChip,
              {
                backgroundColor: telemetryBackground,
                borderColor: telemetryBorder,
              },
            ]}
          >
            <Text style={[styles.overlayLabel, { color: appColors.textMuted }]}>LAT</Text>
            <Text style={[styles.overlayValue, { color: appColors.surfaceContainerLowest }]}>
              {latitude.toFixed(6)}
            </Text>
          </View>

          <View
            style={[
              styles.telemetryChip,
              {
                backgroundColor: telemetryBackground,
                borderColor: telemetryBorder,
              },
            ]}
          >
            <Text style={[styles.overlayLabel, { color: appColors.textMuted }]}>LON</Text>
            <Text style={[styles.overlayValue, { color: appColors.surfaceContainerLowest }]}>
              {longitude.toFixed(6)}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.timestampOverlay,
            {
              backgroundColor: telemetryBackground,
              borderColor: telemetryBorder,
            },
          ]}
        >
          <Text style={[styles.overlayLabel, { color: appColors.textMuted }]}>Timestamp</Text>
          <Text style={[styles.overlayValue, { color: appColors.surfaceContainerLowest }]}>
            {new Date(timestamp).toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={[styles.actionPanel, { backgroundColor: appColors.surfaceContainerLow }]}>
        {/* WHY: Evidence status and explicit actions make it clear when a report is camera-backed versus metadata-only. */}
        <View style={styles.evidenceHeader}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: hasEvidence
                  ? appColors.success
                  : appColors.warning,
              },
            ]}
          />
          <Text style={[styles.evidenceTitle, { color: appColors.textPrimary }]}>
            {hasEvidence ? 'Evidence Captured' : 'Awaiting Evidence Capture'}
          </Text>
        </View>

        <Text style={[styles.evidenceHint, { color: appColors.textSecondary }]}>
          {hasEvidence
            ? 'Review clarity, then submit the report packet.'
            : 'Capture a scene photo to include visual proof with telemetry.'}
        </Text>

        <View style={styles.actionRow}>
          <Pressable
            disabled={isCapturing}
            onPress={onCapture}
            style={({ pressed }) => [
              styles.captureButton,
              { backgroundColor: appColors.primary },
              pressed && !isCapturing ? styles.buttonPressed : null,
            ]}
          >
            {isCapturing ? (
              <ActivityIndicator color={appColors.onPrimary} size="small" />
            ) : (
              <Ionicons color={appColors.onPrimary} name="camera" size={16} />
            )}
            <Text style={[styles.captureButtonText, { color: appColors.onPrimary }]}>
              {isCapturing ? 'Opening Camera...' : hasEvidence ? 'Capture Again' : 'Capture Evidence'}
            </Text>
          </Pressable>

          <Pressable
            disabled={isPickingLibrary}
            onPress={onPickFromLibrary}
            style={({ pressed }) => [
              styles.libraryButton,
              {
                backgroundColor: appColors.secondaryContainer,
                borderColor: appColors.outlineVariant,
              },
              pressed && !isPickingLibrary ? styles.buttonPressed : null,
            ]}
          >
            {isPickingLibrary ? (
              <ActivityIndicator color={appColors.onSecondaryContainer} size="small" />
            ) : (
              <Ionicons
                color={appColors.onSecondaryContainer}
                name="images-outline"
                size={16}
              />
            )}
            <Text
              style={[styles.libraryButtonText, { color: appColors.onSecondaryContainer }]}
            >
              {isPickingLibrary ? 'Opening...' : 'Library'}
            </Text>
          </Pressable>

          {hasEvidence ? (
            <Pressable
              onPress={onRetake}
              style={({ pressed }) => [
                styles.secondaryButton,
                { backgroundColor: appColors.surfaceContainer },
                pressed ? styles.buttonPressed : null,
              ]}
            >
              <Text style={[styles.secondaryButtonText, { color: appColors.textSecondary }]}>Clear</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: shape.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  viewport: {
    minHeight: 285,
    overflow: 'hidden',
    padding: 12,
  },
  previewImage: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  mockBackground: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  gradientCore: {
    backgroundColor: '#1D4ED8',
    borderRadius: 220,
    height: 220,
    left: -40,
    opacity: 0.4,
    position: 'absolute',
    top: -30,
    width: 220,
  },
  gradientBloom: {
    backgroundColor: '#0F766E',
    borderRadius: 260,
    height: 260,
    opacity: 0.32,
    position: 'absolute',
    right: -70,
    top: 80,
    width: 260,
  },
  scanBand: {
    bottom: 88,
    height: 56,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  centerPrompt: {
    alignItems: 'center',
    gap: 6,
    marginTop: 100,
  },
  cameraTitle: {
    fontFamily: typography.headingFont,
    fontSize: 19,
    letterSpacing: 0.2,
  },
  cameraSubtitle: {
    fontFamily: typography.bodyFont,
    fontSize: 13,
  },
  topTelemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  telemetryChip: {
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 118,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  timestampOverlay: {
    borderRadius: 12,
    borderWidth: 1,
    bottom: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    position: 'absolute',
    right: 12,
  },
  overlayLabel: {
    fontFamily: typography.monoFont,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  overlayValue: {
    fontFamily: typography.monoFont,
    fontSize: 13,
    marginTop: 4,
  },
  actionPanel: {
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  evidenceHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  statusDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  evidenceTitle: {
    fontFamily: typography.headingFont,
    fontSize: 15,
  },
  evidenceHint: {
    fontFamily: typography.bodyFont,
    fontSize: 13,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  captureButton: {
    alignItems: 'center',
    borderRadius: shape.pill,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 148,
    paddingHorizontal: 12,
  },
  captureButtonText: {
    fontFamily: typography.headingFont,
    fontSize: 14,
    letterSpacing: 0.2,
  },
  libraryButton: {
    alignItems: 'center',
    borderRadius: shape.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 98,
    paddingHorizontal: 10,
  },
  libraryButtonText: {
    fontFamily: typography.bodyFont,
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: shape.pill,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 84,
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    fontFamily: typography.bodyFont,
    fontSize: 13,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.86,
  },
});
