import * as Constant from "expo-constants";
import { compareVersions, validate } from "compare-versions";

export const isUpdateAvailable = (version: any) => {
  if (!Constant.default.expoConfig) return false;
  return (
    compareVersions(Constant.default.expoConfig.version as any, version) === -1
  );
};
