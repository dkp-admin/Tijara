const { AndroidConfig, withAndroidManifest } = require("@expo/config-plugins");
const { getMainApplicationOrThrow } = AndroidConfig.Manifest;

function setDisallowAdbBackup(androidManifest) {
  const application = getMainApplicationOrThrow(androidManifest);

  if (application.$) {
    application.$["android:allowBackup"] = "false";
    // application.$["android:usesCleartextTraffic"] = "false";
  } else {
    application.$ = {
      "android:allowBackup": "false",
      // "android:usesCleartextTraffic": "false",
    };
  }

  return androidManifest;
}

module.exports = function withDisallowAdbBackup(config) {
  return withAndroidManifest(config, (config) => {
    config.modResults = setDisallowAdbBackup(config.modResults);
    return config;
  });
};
