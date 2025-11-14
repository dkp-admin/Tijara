const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function androiManifestPlugin(config) {
  return withAndroidManifest(config, async (config) => {
    let androidManifest = config.modResults.manifest;

    androidManifest.queries.push({
      package: {
        $: {
          "android:name": "woyou.aidlservice.jiuiv5",
        },
      },
    });

    return config;
  });
};
