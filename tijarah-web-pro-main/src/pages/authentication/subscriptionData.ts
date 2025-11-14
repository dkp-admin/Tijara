import create from "zustand";
import { persist } from "zustand/middleware";

const useSubscriptionStore = create(
  persist(
    (set: any) => ({
      subscriptionData: {},
      clearSubscriptionData: () => set({ subscriptionData: {} }),
      setSubscriptionData: (data: any) => set({ subscriptionData: data }),
    }),
    {
      name: "susbscriptionData-store",
      getStorage: () => sessionStorage, // (optional) by default, 'localStorage' is used
    }
  )
);

export default useSubscriptionStore;
