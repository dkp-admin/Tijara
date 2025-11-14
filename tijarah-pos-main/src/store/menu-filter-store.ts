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

const useMenuStore = create(
  persist(
    (set: any) => ({
      categoryId: "all",
      setCategoryId: (categoryId: any) => set({ categoryId }),
    }),
    {
      name: "menu-store",
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);

export default useMenuStore;
