import create from "zustand";
import { persist } from "zustand/middleware";

const useScanStore = create(
  persist(
    (set: any) => ({
      scan: false,
      setScan: (value: any) => set({ scan: value }),
    }),
    {
      name: "scan-store",
      getStorage: () => sessionStorage, // (optional) by default, 'localStorage' is used
    }
  )
);

export default useScanStore;
