import MMKVDB from "./DB-MMKV";

export const logoutDevice = async (deviceContext: any) => {
  MMKVDB.removeAll();
  deviceContext.logout();
};
