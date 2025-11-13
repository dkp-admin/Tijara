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

const useStcPayStore = create(
  persist(
    (set: any) => ({
      data: { status: null, amount: null, refNum: null, billNum: null },
      setData: (data: any) => set({ data }),
      clearData: () =>
        set({ data: { status: undefined, amount: null, refNum: null } }),
    }),
    {
      name: "stcpay-store",
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);

export default useStcPayStore;
