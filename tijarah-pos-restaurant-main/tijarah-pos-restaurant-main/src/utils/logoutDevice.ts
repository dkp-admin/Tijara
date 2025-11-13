import MMKVDB from "./DB-MMKV";
import NearpaySDK from "./embedNearpay";

export const logoutDevice = async (deviceContext: any) => {
  MMKVDB.removeAll();
  if (deviceContext) {
    deviceContext.logout();
  }
  try {
    (await NearpaySDK.getInstance()).logout();
  } catch (error) {
    console.log("Error:", error);
  }
};
