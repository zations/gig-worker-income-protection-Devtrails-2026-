import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { postLocationUpdate } from '../../services/mockApi';
import {
  getStoredWorkProfile,
  persistWorkProfile,
  StoredWorkProfile,
} from '../services/appStorage';
import { logger } from '../utils/logger';

export const WORK_PLATFORMS = ['Swiggy', 'Zomato', 'Uber', 'Porter'] as const;
export const VEHICLE_TYPES = ['Bike', 'Scooter', 'Auto', 'Car'] as const;
export const HOME_ZONES = [
  'Velachery',
  'Anna Nagar',
  'T. Nagar',
  'Sholinganallur',
  'Perungudi',
] as const;

export type WorkPlatform = (typeof WORK_PLATFORMS)[number];
export type VehicleType = (typeof VEHICLE_TYPES)[number];
export type HomeZone = (typeof HOME_ZONES)[number];

export interface WorkProfile {
  primaryWorkPlatform: WorkPlatform;
  vehicleType: VehicleType;
  homeZone: HomeZone;
  updatedAt: string;
}

export interface TelemetryPacket {
  lat: number;
  lon: number;
  speed: number;
  battery: number;
  capturedAt: string;
}

interface UserContextValue {
  workProfile: WorkProfile | null;
  isUserBootstrapping: boolean;
  saveWorkProfile: (
    profile: Omit<WorkProfile, 'updatedAt'>,
  ) => Promise<WorkProfile>;
  passiveTrackingEnabled: boolean;
  setPassiveTrackingEnabled: (nextValue: boolean) => void;
  lastTelemetryPacket: TelemetryPacket | null;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

interface UserProviderProps {
  children: React.ReactNode;
}

function toStoredProfile(profile: WorkProfile): StoredWorkProfile {
  return {
    primaryWorkPlatform: profile.primaryWorkPlatform,
    vehicleType: profile.vehicleType,
    homeZone: profile.homeZone,
    updatedAt: profile.updatedAt,
  };
}

function toWorkPlatform(value: string): WorkPlatform {
  return WORK_PLATFORMS.includes(value as WorkPlatform)
    ? (value as WorkPlatform)
    : 'Swiggy';
}

function toVehicleType(value: string): VehicleType {
  return VEHICLE_TYPES.includes(value as VehicleType)
    ? (value as VehicleType)
    : 'Bike';
}

function toHomeZone(value: string): HomeZone {
  return HOME_ZONES.includes(value as HomeZone)
    ? (value as HomeZone)
    : 'Velachery';
}

function hydrateStoredProfile(profile: StoredWorkProfile): WorkProfile {
  return {
    primaryWorkPlatform: toWorkPlatform(profile.primaryWorkPlatform),
    vehicleType: toVehicleType(profile.vehicleType),
    homeZone: toHomeZone(profile.homeZone),
    updatedAt: profile.updatedAt,
  };
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function UserProvider({ children }: UserProviderProps) {
  const [workProfile, setWorkProfile] = useState<WorkProfile | null>(null);
  const [isUserBootstrapping, setIsUserBootstrapping] = useState(true);
  const [passiveTrackingEnabled, setPassiveTrackingEnabled] = useState(false);
  const [lastTelemetryPacket, setLastTelemetryPacket] =
    useState<TelemetryPacket | null>(null);

  const batteryLevelRef = useRef(93);
  const coordinateRef = useRef({ lat: 12.9753, lon: 80.2212 });

  useEffect(() => {
    let isMounted = true;

    const restoreUserProfile = async () => {
      try {
        const storedProfile = await getStoredWorkProfile();

        if (!isMounted || !storedProfile) {
          return;
        }

        setWorkProfile(hydrateStoredProfile(storedProfile));
      } catch (error) {
        logger.warn('Unable to restore user work profile.', error);
      } finally {
        if (isMounted) {
          setIsUserBootstrapping(false);
        }
      }
    };

    restoreUserProfile().catch(error => {
      logger.warn('Unexpected work profile bootstrap failure.', error);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const saveWorkProfile = useCallback(
    async (profile: Omit<WorkProfile, 'updatedAt'>) => {
      const nextProfile: WorkProfile = {
        ...profile,
        updatedAt: new Date().toISOString(),
      };

      await persistWorkProfile(toStoredProfile(nextProfile));
      setWorkProfile(nextProfile);

      return nextProfile;
    },
    [],
  );

  const sendLocationUpdate = useCallback(async () => {
    const nextBattery =
      batteryLevelRef.current <= 18
        ? 92
        : Math.max(8, batteryLevelRef.current - Math.round(randomBetween(1, 3)));

    batteryLevelRef.current = nextBattery;

    coordinateRef.current = {
      lat: Number((coordinateRef.current.lat + randomBetween(-0.0017, 0.0017)).toFixed(6)),
      lon: Number((coordinateRef.current.lon + randomBetween(-0.0015, 0.0015)).toFixed(6)),
    };

    const speedBounds = workProfile?.vehicleType === 'Car' ? [22, 58] : [18, 64];

    const payload: TelemetryPacket = {
      lat: coordinateRef.current.lat,
      lon: coordinateRef.current.lon,
      speed: Number(randomBetween(speedBounds[0], speedBounds[1]).toFixed(1)),
      battery: nextBattery,
      capturedAt: new Date().toISOString(),
    };

    setLastTelemetryPacket(payload);

    try {
      await postLocationUpdate(payload);
    } catch (error) {
      logger.warn('Passive telemetry update failed.', error);
    }
  }, [workProfile?.vehicleType]);

  useEffect(() => {
    if (!passiveTrackingEnabled) {
      return;
    }

    sendLocationUpdate().catch(error => {
      logger.warn('Initial passive telemetry update failed.', error);
    });

    const timer = setInterval(() => {
      sendLocationUpdate().catch(error => {
        logger.warn('Scheduled passive telemetry update failed.', error);
      });
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, [passiveTrackingEnabled, sendLocationUpdate]);

  const contextValue = useMemo<UserContextValue>(
    () => ({
      workProfile,
      isUserBootstrapping,
      saveWorkProfile,
      passiveTrackingEnabled,
      setPassiveTrackingEnabled,
      lastTelemetryPacket,
    }),
    [
      workProfile,
      isUserBootstrapping,
      saveWorkProfile,
      passiveTrackingEnabled,
      lastTelemetryPacket,
    ],
  );

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
}

export function useUserContext() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUserContext must be used within UserProvider.');
  }

  return context;
}
