import { MMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

const storage = new MMKV({ id: "app-persist-storage" });

const zustandMMKVStorage: StateStorage = {
  setItem: (name, value) => {
    return storage.set(name, value);
  },
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    return storage.delete(name);
  },
};

const useChannelStore = create(
  persist(
    (set: any) => ({
      channel: "",
      channelList: [],
      setChannel: (channel: any) => set({ channel }),
      setChannelList: (channelList: any) => set({ channelList }),
    }),
    {
      name: "channel-store",
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);

export default useChannelStore;
