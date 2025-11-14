const { withProjectBuildGradle } = require("@expo/config-plugins");

module.exports = (config) => {
  return withProjectBuildGradle(config, async (config) => {
    if (config.modResults.language === "groovy") {
      config.modResults.contents = modifyBuildGradle(
        config.modResults.contents
      );
    }
    return config;
  });
};

function modifyBuildGradle(buildGradle) {
  const flatDirLine = `flatDir { dirs "$rootDir/../node_modules/expo-print-help/android/libs","$rootDir/../node_modules/tsc-print-label-v1/android/libs" }`;
  if (!buildGradle.includes(flatDirLine)) {
    return buildGradle.replace(
      /allprojects\s*{[^}]*repositories\s*{/,
      (match) => {
        return `${match}\n        ${flatDirLine}`;
      }
    );
  }
  return buildGradle;
}
