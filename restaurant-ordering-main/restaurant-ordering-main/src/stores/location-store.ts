import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

type MenuReference = string | { _id: string } | null;

interface LocationState {
  companyRef: string | null;
  locationRef: string | null;
  menuRef: string | null;
  companyName: string | null;
  locationName: string | null;
  isPickupMenuAvailable: MenuReference;
  isDeliveryMenuAvailable: MenuReference;
  setCompanyRef: (ref: string) => void;
  setLocationRef: (ref: string) => void;
  setMenuRef: (ref: string) => void;
  setCompanyName: (name: string) => void;
  setLocationName: (name: string) => void;
  setIsPickupMenuAvailable: (ref: MenuReference) => void;
  setIsDeliveryMenuAvailable: (ref: MenuReference) => void;
  clearReferences: () => void;
  clearMenuReferences: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    subscribeWithSelector((set) => ({
      companyRef: null,
      locationRef: null,
      menuRef: null,
      companyName: null,
      locationName: null,
      isPickupMenuAvailable: null,
      isDeliveryMenuAvailable: null,
      setCompanyRef: (ref) => set({ companyRef: ref }),
      setLocationRef: (ref) => set({ locationRef: ref }),
      setMenuRef: (ref) => set({ menuRef: ref }),
      setCompanyName: (name) => set({ companyName: name }),
      setLocationName: (name) => set({ locationName: name }),
      setIsPickupMenuAvailable: (ref) => set({ isPickupMenuAvailable: ref }),
      setIsDeliveryMenuAvailable: (ref) => set({ isDeliveryMenuAvailable: ref }),
      clearReferences: () =>
        set({
          companyRef: null,
          locationRef: null,
          menuRef: null,
          companyName: null,
          locationName: null,
          isPickupMenuAvailable: null,
          isDeliveryMenuAvailable: null,
        }),
      clearMenuReferences: () =>
        set({
          menuRef: null,
          // Don't clear companyRef, locationRef, companyName, locationName, isPickupMenuAvailable, isDeliveryMenuAvailable
          // as these come from useMenuConfig and should persist across menu changes
        }),
    })),
    {
      name: 'location-storage',
    },
  ),
);
