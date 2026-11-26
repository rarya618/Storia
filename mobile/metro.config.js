// Learn more https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// @storia/core (the script's rules and data shapes, shared with web) is
// linked into node_modules from ../packages/core. Metro follows the link but
// only bundles files it watches, so it watches that folder too.
config.watchFolders = [path.resolve(__dirname, '../packages/core')];

module.exports = config;
