import create from "zustand";
import { persist } from "zustand/middleware";

const useActiveTabs = create(
  persist(
    (set: any, get: any) => ({
      activeTabs: {
        companyDetail: "accountOverview",
        rolesAndPermissions: "platform",
        createLocation: "location",
        accountDetails: "overview",
        apkManagement: "apkTab",
        companiesList: "completedSignup",
        customersList: "customers",
        promotionsList: "current",
        pos: "billing",
        subscriptions: "subscriptions",
      },

      changeTab: (tab: any, screen: any) => {
        const tabData = get().activeTabs;
        tabData[screen] = tab;
        return set({ activeTabs: tabData });
      },
      getTab: (screen: any) => {
        const data = get().activeTabs;
        return data[screen];
      },
    }),
    {
      name: "tabs-storage", // unique name
      getStorage: () => sessionStorage, // (optional) by default, 'localStorage' is used
    }
  )
);

export default useActiveTabs;
