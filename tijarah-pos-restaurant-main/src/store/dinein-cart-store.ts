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

const useDineinCartStore = create(
  persist(
    (set: any) => ({
      itemRowClick: false,
      setItemRowClick: (itemRowClick: any) => set({ itemRowClick }),
    }),
    {
      name: "dienin-cart-store",
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);

export default useDineinCartStore;
