const fs = require('fs');
const path = require('path');

const assetsDir = path.join(
  __dirname,
  '..',
  'node_modules',
  '@react-navigation',
  'elements',
  'lib',
  'module',
  'assets',
);

const iconNames = ['back-icon', 'search-icon'];
const scales = ['1', '2', '3', '4'];

function ensureGenericScale(iconName, scale) {
  const genericName = `${iconName}@${scale}x.png`;
  const genericPath = path.join(assetsDir, genericName);

  if (fs.existsSync(genericPath)) {
    return false;
  }

  const candidates = [
    path.join(assetsDir, `${iconName}@${scale}x.android.png`),
    path.join(assetsDir, `${iconName}@${scale}x.ios.png`),
  ];

  const sourcePath = candidates.find(candidate => fs.existsSync(candidate));

  if (!sourcePath) {
    return false;
  }

  fs.copyFileSync(sourcePath, genericPath);
  return true;
}

function run() {
  if (!fs.existsSync(assetsDir)) {
    console.log('[syncNavigationAssets] Skipped: assets directory not found.');
    return;
  }

  let createdCount = 0;

  for (const iconName of iconNames) {
    for (const scale of scales) {
      if (ensureGenericScale(iconName, scale)) {
        createdCount += 1;
      }
    }
  }

  if (createdCount > 0) {
    console.log(`[syncNavigationAssets] Created ${createdCount} generic asset alias(es).`);
    return;
  }

  console.log('[syncNavigationAssets] No asset aliases needed.');
}

run();
