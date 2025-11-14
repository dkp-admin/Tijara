import {
  browserName,
  browserVersion,
  osName,
  osVersion,
} from "react-device-detect";
import serviceCaller from "src/api/serviceCaller";
import packageJson from "../../package.json";

export const sendDeviceDetails = async (id: string) => {
  if (!id) return;
  const deviceInfo = {
    appVersion: packageJson.version,
    osVersion: osVersion,
    osName: osName,
    model: browserVersion,
    brand: browserName,
    identity: id,
  };
  try {
    await serviceCaller(`/device/${id}/metadata`, {
      method: "PUT",
      body: {
        ...deviceInfo,
      },
    });
  } catch (error: any) {
    console.log(error);
  }
};
