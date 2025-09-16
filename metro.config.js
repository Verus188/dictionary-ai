const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

const nativewindPath = path.dirname(require.resolve("nativewind/package.json"));
const cssInteropPath = path.resolve(
  nativewindPath,
  "..",
  "react-native-css-interop"
);

config.resolver = {
  ...(config.resolver ?? {}),
  extraNodeModules: {
    ...(config.resolver?.extraNodeModules ?? {}),
    "react-native-css-interop": cssInteropPath,
  },
};

module.exports = withNativeWind(config, { input: "./src/global.css" });
