import { MMKV } from "react-native-mmkv";
import { create } from "zustand";
import { StateStorage, createJSONStorage, persist } from "zustand/middleware";

const storage = new MMKV({ id: "app-persist-storage" });

const zustandMMKVStorage: StateStorage = {
  setItem: (name: any, value: any) => {
    return storage.set(name, value);
  },
  getItem: (name: any) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: any) => {
    return storage.delete(name);
  },
};

const useMiscexpensesStore = create(
  persist(
    (set: any) => ({
      miscExpensesFilter: {},
      setMiscExpensesFilter: (data: any) => set({ miscExpensesFilter: data }),
    }),
    {
      name: "misc-expenses-filter", // unique name
      storage: createJSONStorage(() => zustandMMKVStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

export default useMiscexpensesStore;
