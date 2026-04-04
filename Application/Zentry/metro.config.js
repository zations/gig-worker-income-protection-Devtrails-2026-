const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const projectRoot = path.resolve(__dirname);
const defaultConfig = getDefaultConfig(projectRoot);

const config = {
  // WHY: Explicit roots reduce flaky asset lookups from node_modules during cache resets and multi-terminal workflows.
  projectRoot,
  watchFolders: [path.resolve(projectRoot, 'node_modules')],
  resolver: {
    assetExts: defaultConfig.resolver.assetExts,
  },
};

module.exports = mergeConfig(defaultConfig, config);
