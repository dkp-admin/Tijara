import * as Constant from "expo-constants";
import * as Device from "expo-device";
import serviceCaller from "../api";
import MMKVDB from "./DB-MMKV";
import { DBKeys } from "./DBKeys";

export const sendDeviceDetails = async (id: string) => {
  const sessionId = Constant.default.sessionId;

  MMKVDB.set(DBKeys.POS_SESSION_ID, sessionId);

  if (!id) return;
  const deviceInfo = {
    appVersion: Constant.default.expoConfig?.version,
    osVersion: Device.osVersion,
    osName: Device.osName,
    model: Device.modelName,
    brand: Device?.manufacturer === "neostra" ? "iMin" : Device.brand,
    identity: sessionId,
  };

  try {
    await serviceCaller(`/device/${id}/metadata`, {
      method: "PUT",
      body: {
        ...deviceInfo,
      },
    });
  } catch (error: any) {}
};
