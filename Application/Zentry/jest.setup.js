require('react-native-gesture-handler/jestSetup');

const memoryStorage = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async key =>
    Object.prototype.hasOwnProperty.call(memoryStorage, key)
      ? memoryStorage[key]
      : null,
  ),
  setItem: jest.fn(async (key, value) => {
    memoryStorage[key] = String(value);
  }),
  removeItem: jest.fn(async key => {
    delete memoryStorage[key];
  }),
  clear: jest.fn(async () => {
    Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);
  }),
  multiSet: jest.fn(async entries => {
    entries.forEach(([key, value]) => {
      memoryStorage[key] = String(value);
    });
  }),
  multiGet: jest.fn(async keys =>
    keys.map(key => [
      key,
      Object.prototype.hasOwnProperty.call(memoryStorage, key)
        ? memoryStorage[key]
        : null,
    ]),
  ),
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(async () => ({ didCancel: true })),
  launchImageLibrary: jest.fn(async () => ({ didCancel: true })),
}));
