// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// This will prevent test files from being included in the final bundle.
const testFilePattern = /\.test\.(js|ts|tsx)$/;

config.resolver.blockList = [
  ...(config.resolver.blockList || []),
  testFilePattern,
];

module.exports = config;