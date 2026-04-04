import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CameraPlaceholder from '../components/CameraPlaceholder';
import { useAppAppearance } from '../context/AppearanceContext';
import { EventType, useSystemState } from '../context/SystemStateContext';
import { elevation, shape, typography } from '../theme/tokens';
import { logger } from '../utils/logger';

const EVENT_TYPES: EventType[] = ['Flood', 'Protest', 'Traffic'];

async function requestCameraAccess() {
  if (Platform.OS !== 'android') {
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
    {
      title: 'Camera Permission',
      message: 'Zentry needs camera access to capture geo-report evidence.',
      buttonNegative: 'Cancel',
      buttonPositive: 'Allow',
    },
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

async function requestLibraryAccess() {
  if (Platform.OS !== 'android') {
    return true;
  }

  const permissionToRequest =
    Platform.Version >= 33
      ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
      : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

  const result = await PermissionsAndroid.request(permissionToRequest, {
    title: 'Library Permission',
    message: 'Zentry needs gallery access to attach existing evidence photos.',
    buttonNegative: 'Cancel',
    buttonPositive: 'Allow',
  });

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export default function GeoReportScreen() {
  const insets = useSafeAreaInsets();
  const { appColors } = useAppAppearance();
  const { isBootstrapping, isMutating, submitGeoReport } = useSystemState();

  const [selectedEventType, setSelectedEventType] = useState<EventType>('Flood');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [timestamp, setTimestamp] = useState(new Date().toISOString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPickingLibrary, setIsPickingLibrary] = useState(false);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState({
    latitude: 12.92547,
    longitude: 80.21676,
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimestamp(new Date().toISOString());
      setCoordinates(previous => ({
        latitude: Number(
          (previous.latitude + (Math.random() - 0.5) * 0.0006).toFixed(6),
        ),
        longitude: Number(
          (previous.longitude + (Math.random() - 0.5) * 0.0006).toFixed(6),
        ),
      }));
    }, 1800);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleCaptureEvidence = async () => {
    setIsCapturing(true);

    try {
      const hasCameraPermission = await requestCameraAccess();

      if (!hasCameraPermission) {
        Alert.alert(
          'Permission Required',
          'Camera permission is needed to capture evidence.',
        );
        return;
      }

      const captureResult = await launchCamera({
        cameraType: 'back',
        mediaType: 'photo',
        quality: 0.82,
        saveToPhotos: false,
      });

      if (captureResult.didCancel) {
        return;
      }

      if (captureResult.errorCode) {
        Alert.alert(
          'Camera Error',
          captureResult.errorMessage ?? 'Unable to open the camera right now.',
        );
        return;
      }

      const imageUri = captureResult.assets?.[0]?.uri;

      if (!imageUri) {
        Alert.alert(
          'Capture Unavailable',
          'No image was returned. Please capture again.',
        );
        return;
      }

      const captureTime = new Date().toISOString();
      setCapturedImageUri(imageUri);
      setTimestamp(captureTime);
    } catch (error) {
      logger.warn('Camera capture failed.', error);
      Alert.alert('Capture Failed', 'Unable to capture photo evidence.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePickEvidenceFromLibrary = async () => {
    setIsPickingLibrary(true);

    try {
      const hasLibraryPermission = await requestLibraryAccess();

      if (!hasLibraryPermission) {
        Alert.alert(
          'Permission Required',
          'Library permission is needed to attach an evidence image.',
        );
        return;
      }

      const pickResult = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.82,
        selectionLimit: 1,
      });

      if (pickResult.didCancel) {
        return;
      }

      if (pickResult.errorCode) {
        Alert.alert(
          'Library Error',
          pickResult.errorMessage ?? 'Unable to open photo library right now.',
        );
        return;
      }

      const imageUri = pickResult.assets?.[0]?.uri;

      if (!imageUri) {
        Alert.alert(
          'Image Unavailable',
          'No image was selected. Please try again.',
        );
        return;
      }

      setCapturedImageUri(imageUri);
      setTimestamp(new Date().toISOString());
    } catch (error) {
      logger.warn('Library selection failed.', error);
      Alert.alert('Selection Failed', 'Unable to pick image from library.');
    } finally {
      setIsPickingLibrary(false);
    }
  };

  const clearCapture = () => {
    setCapturedImageUri(null);
  };

  const handleSubmitReport = async () => {
    if (!capturedImageUri) {
      Alert.alert(
        'Evidence Required',
        'Please capture a photo before submitting the geo report.',
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const referenceId = await submitGeoReport(selectedEventType, {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        timestamp,
      });

      Alert.alert(
        'Geo Report Submitted',
        `Event: ${selectedEventType}\nReference: ${referenceId}`,
      );
    } catch (error) {
      logger.warn('Geo report failed.', error);
      Alert.alert('Submission Failed', 'Unable to submit the geo report right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isBootstrapping) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: appColors.background }]}>
        <ActivityIndicator color={appColors.brand} size="large" />
        <Text style={[styles.loadingText, { color: appColors.textSecondary }]}>
          Preparing geo-reporting tools...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        {
          backgroundColor: appColors.background,
          paddingBottom: insets.bottom + 28,
        },
      ]}
    >
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: appColors.secondaryContainer,
            borderColor: appColors.outlineVariant,
          },
        ]}
      >
        {/* WHY: This header frames geo reporting as a structured claims-intelligence workflow rather than a generic form. */}
        <View style={styles.heroRow}>
          <View style={[styles.heroIconWrap, { backgroundColor: appColors.secondary }]}>
            <Ionicons color={appColors.onSecondary} name="navigate-circle" size={24} />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={[styles.heroTitle, { color: appColors.onSecondaryContainer }]}>
              Geo Report Console
            </Text>
            <Text style={[styles.heroSubtitle, { color: appColors.onSurfaceVariant }]}>
              Capture visual proof and telemetry before adjudication.
            </Text>
          </View>
        </View>
      </View>

      {/* WHY: The camera panel is now actionable so field reports can include actual image evidence. */}
      <CameraPlaceholder
        capturedImageUri={capturedImageUri}
        isCapturing={isCapturing}
        isPickingLibrary={isPickingLibrary}
        latitude={coordinates.latitude}
        longitude={coordinates.longitude}
        onCapture={handleCaptureEvidence}
        onPickFromLibrary={handlePickEvidenceFromLibrary}
        onRetake={clearCapture}
        timestamp={timestamp}
      />

      <View
        style={[
          styles.telemetryCard,
          {
            backgroundColor: appColors.surfaceContainerLow,
            borderColor: appColors.outlineVariant,
          },
        ]}
      >
        {/* WHY: Live metrics expose the exact coordinates and evidence state used by downstream judge logic. */}
        <Text style={[styles.telemetryTitle, { color: appColors.textPrimary }]}>Telemetry Snapshot</Text>

        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, { backgroundColor: appColors.surfaceContainer }]}>
            <Text style={[styles.metricLabel, { color: appColors.textMuted }]}>Latitude</Text>
            <Text style={[styles.metricValue, { color: appColors.textPrimary }]}>
              {coordinates.latitude.toFixed(6)}
            </Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: appColors.surfaceContainer }]}>
            <Text style={[styles.metricLabel, { color: appColors.textMuted }]}>Longitude</Text>
            <Text style={[styles.metricValue, { color: appColors.textPrimary }]}>
              {coordinates.longitude.toFixed(6)}
            </Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View
            style={[styles.metricCardLarge, { backgroundColor: appColors.surfaceContainer }]}
          >
            <Text style={[styles.metricLabel, { color: appColors.textMuted }]}>Captured At</Text>
            <Text style={[styles.metricValue, { color: appColors.textPrimary }]}>
              {new Date(timestamp).toLocaleString()}
            </Text>
          </View>

          <View
            style={[styles.metricCardLarge, { backgroundColor: appColors.surfaceContainer }]}
          >
            <Text style={[styles.metricLabel, { color: appColors.textMuted }]}>Evidence Status</Text>
            <Text
              style={[
                styles.metricValue,
                {
                  color: capturedImageUri
                    ? appColors.success
                    : appColors.warning,
                },
              ]}
            >
              {capturedImageUri ? 'Attached' : 'Missing'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.dropdownBlock}>
        {/* WHY: Event selection captures structured incident labels used by downstream adjudication rules. */}
        <Text style={[styles.dropdownLabel, { color: appColors.textSecondary }]}>Event Type</Text>

        <Pressable
          onPress={() => setDropdownOpen(previous => !previous)}
          style={({ pressed }) => [
            styles.dropdownButton,
            {
              backgroundColor: appColors.surfaceContainerLow,
              borderColor: appColors.outlineVariant,
            },
            pressed ? styles.dropdownPressed : null,
          ]}
        >
          <Text style={[styles.dropdownValue, { color: appColors.textPrimary }]}>
            {selectedEventType}
          </Text>
          <Ionicons
            color={appColors.textSecondary}
            name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
          />
        </Pressable>

        {dropdownOpen ? (
          <View
            style={[
              styles.dropdownMenu,
              {
                backgroundColor: appColors.surfaceContainerLow,
                borderColor: appColors.outlineVariant,
              },
            ]}
          >
            {EVENT_TYPES.map(eventType => (
              <Pressable
                key={eventType}
                onPress={() => {
                  setSelectedEventType(eventType);
                  setDropdownOpen(false);
                }}
                style={({ pressed }) => [
                  styles.dropdownItem,
                  { borderBottomColor: appColors.surfaceMuted },
                  eventType === selectedEventType
                    ? { backgroundColor: appColors.brandSoft }
                    : null,
                  pressed ? styles.dropdownItemPressed : null,
                ]}
              >
                <Text style={[styles.dropdownItemText, { color: appColors.textPrimary }]}>
                  {eventType}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      <Pressable
        disabled={isSubmitting || isMutating}
        onPress={handleSubmitReport}
        style={({ pressed }) => [
          styles.submitButton,
          { backgroundColor: appColors.primary },
          pressed && !(isSubmitting || isMutating) ? styles.submitPressed : null,
        ]}
      >
        {/* WHY: Submitting geo telemetry tests report ingestion flow before production API connectivity exists. */}
        <Ionicons color={appColors.onPrimary} name="send" size={16} />
        <Text style={[styles.submitButtonText, { color: appColors.onPrimary }]}>
          {isSubmitting ? 'Submitting Report...' : 'Submit Geo Report'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    padding: 16,
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
  heroCard: {
    ...elevation.level1,
    borderRadius: shape.lg,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 14,
  },
  heroRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  heroIconWrap: {
    alignItems: 'center',
    borderRadius: shape.sm,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  heroTextWrap: {
    flex: 1,
    gap: 2,
  },
  heroTitle: {
    fontFamily: typography.headingFont,
    fontSize: 19,
  },
  heroSubtitle: {
    fontFamily: typography.bodyFont,
    fontSize: 13,
  },
  telemetryCard: {
    ...elevation.level1,
    borderRadius: shape.md,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  telemetryTitle: {
    fontFamily: typography.headingFont,
    fontSize: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    borderRadius: shape.sm,
    flex: 1,
    gap: 5,
    padding: 10,
  },
  metricCardLarge: {
    borderRadius: shape.sm,
    flex: 1,
    gap: 5,
    minHeight: 72,
    padding: 10,
  },
  metricLabel: {
    fontFamily: typography.monoFont,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontFamily: typography.headingFont,
    fontSize: 12,
  },
  dropdownBlock: {
    gap: 8,
  },
  dropdownLabel: {
    fontFamily: typography.bodyFont,
    fontSize: 13,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  dropdownButton: {
    alignItems: 'center',
    borderRadius: shape.sm,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownPressed: {
    opacity: 0.9,
  },
  dropdownValue: {
    fontFamily: typography.headingFont,
    fontSize: 15,
  },
  dropdownMenu: {
    borderRadius: shape.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownItem: {
    borderBottomWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownItemPressed: {
    opacity: 0.85,
  },
  dropdownItemText: {
    fontFamily: typography.bodyFont,
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    alignItems: 'center',
    borderRadius: shape.pill,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  submitPressed: {
    opacity: 0.9,
  },
  submitButtonText: {
    fontFamily: typography.headingFont,
    fontSize: 15,
    letterSpacing: 0.2,
  },
});
