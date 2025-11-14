import { MMKV } from "react-native-mmkv";
import { MMKV_ENCRYPTION_KEY } from "./constants";

const storage = new MMKV({
  id: "app-persist-storage",
  encryptionKey: MMKV_ENCRYPTION_KEY,
});

const MMKVDB = {
  set: (key: string, value: any) => {
    storage.set(key, JSON.stringify(value));
  },

  get: (key: string) => {
    const storedData = storage.getString(key);

    if (storedData) {
      const parseData = JSON.parse(storedData);
      return parseData;
    } else {
      return null;
    }
  },

  remove(key: string) {
    storage.delete(key);
  },

  removeAll() {
    storage.clearAll();
  },
};

export default MMKVDB;
