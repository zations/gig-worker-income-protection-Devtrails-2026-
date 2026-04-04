import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../src/constants/storageKeys';
import {
  getLoginCompletedFlag,
  getStoredWorkProfile,
  getStoredUserProfile,
  persistWorkProfile,
  persistLoginSession,
  StoredWorkProfile,
  StoredUserProfile,
} from '../src/services/appStorage';
import { logger } from '../src/utils/logger';

const validProfile: StoredUserProfile = {
  fullName: 'Arun Kumar',
  phone: '9840011223',
  workerId: 'GW-CHN-1223',
  loginAt: '2026-04-03T10:00:00.000Z',
};

const validWorkProfile: StoredWorkProfile = {
  primaryWorkPlatform: 'Swiggy',
  vehicleType: 'Bike',
  homeZone: 'Velachery',
  updatedAt: '2026-04-03T10:05:00.000Z',
};

describe('appStorage', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(async () => {
    warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('returns false when login completion flag is missing', async () => {
    const completed = await getLoginCompletedFlag();

    expect(completed).toBe(false);
  });

  it('persists login session payload and completion flag', async () => {
    await persistLoginSession(validProfile);

    const completed = await getLoginCompletedFlag();
    const storedProfile = await getStoredUserProfile();

    expect(completed).toBe(true);
    expect(storedProfile).toEqual(validProfile);
  });

  it('returns null for malformed stored profile JSON', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.userProfile, '{"broken":');

    const storedProfile = await getStoredUserProfile();

    expect(storedProfile).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      'Unable to parse stored user profile.',
      expect.any(SyntaxError),
    );
  });

  it('returns null for structurally invalid stored profile', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.userProfile,
      JSON.stringify({ fullName: 'Only Name' }),
    );

    const storedProfile = await getStoredUserProfile();

    expect(storedProfile).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      'Ignoring invalid stored user profile payload.',
    );
  });

  it('persists and restores work profile', async () => {
    await persistWorkProfile(validWorkProfile);

    const storedProfile = await getStoredWorkProfile();

    expect(storedProfile).toEqual(validWorkProfile);
  });

  it('returns null for malformed work profile JSON', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.workProfile, '{"broken":');

    const storedProfile = await getStoredWorkProfile();

    expect(storedProfile).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      'Unable to parse stored work profile.',
      expect.any(SyntaxError),
    );
  });

  it('returns null for structurally invalid work profile', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.workProfile,
      JSON.stringify({ primaryWorkPlatform: 'Swiggy' }),
    );

    const storedProfile = await getStoredWorkProfile();

    expect(storedProfile).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      'Ignoring invalid stored work profile payload.',
    );
  });
});
