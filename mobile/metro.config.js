// Learn more https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// The script's rules (flow.ts, characters.ts, pages.ts…) are web-new's pure
// TypeScript, imported as @screenplay/* (tsconfig.json's paths). Metro only
// bundles files it watches, so it watches that folder too.
config.watchFolders = [path.resolve(__dirname, '../web-new/src/screenplay')];

module.exports = config;
