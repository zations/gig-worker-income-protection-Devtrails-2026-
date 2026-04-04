import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { logger } from '../utils/logger';

export interface StoredUserProfile {
  fullName: string;
  phone: string;
  workerId: string;
  loginAt: string;
}

export interface StoredWorkProfile {
  primaryWorkPlatform: string;
  vehicleType: string;
  homeZone: string;
  updatedAt: string;
}

function isValidProfile(value: unknown): value is StoredUserProfile {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.fullName === 'string' &&
    typeof candidate.phone === 'string' &&
    typeof candidate.workerId === 'string' &&
    typeof candidate.loginAt === 'string'
  );
}

function isValidWorkProfile(value: unknown): value is StoredWorkProfile {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.primaryWorkPlatform === 'string' &&
    typeof candidate.vehicleType === 'string' &&
    typeof candidate.homeZone === 'string' &&
    typeof candidate.updatedAt === 'string'
  );
}

export async function getLoginCompletedFlag() {
  const flag = await AsyncStorage.getItem(STORAGE_KEYS.loginCompleted);

  return flag === '1';
}

export async function persistLoginSession(profile: StoredUserProfile) {
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.loginCompleted, '1'],
    [STORAGE_KEYS.userProfile, JSON.stringify(profile)],
  ]);
}

export async function getStoredUserProfile() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.userProfile);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isValidProfile(parsed)) {
      logger.warn('Ignoring invalid stored user profile payload.');
      return null;
    }

    return parsed;
  } catch (error) {
    logger.warn('Unable to parse stored user profile.', error);
    return null;
  }
}

export async function persistWorkProfile(profile: StoredWorkProfile) {
  await AsyncStorage.setItem(STORAGE_KEYS.workProfile, JSON.stringify(profile));
}

export async function getStoredWorkProfile() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.workProfile);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isValidWorkProfile(parsed)) {
      logger.warn('Ignoring invalid stored work profile payload.');
      return null;
    }

    return parsed;
  } catch (error) {
    logger.warn('Unable to parse stored work profile.', error);
    return null;
  }
}
