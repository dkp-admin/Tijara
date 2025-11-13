import create from "zustand";
import { persist } from "zustand/middleware";

const usePackageStore = create(
  persist(
    (set: any) => ({
      selectedPlan: {},
      clearSelectedPlan: () => set({ selectedPlan: {} }),
      setSelectedPlan: (data: any) => set({ selectedPlan: data }),
    }),
    {
      name: "package-store",
      getStorage: () => sessionStorage, // (optional) by default, 'localStorage' is used
    }
  )
);

export default usePackageStore;
