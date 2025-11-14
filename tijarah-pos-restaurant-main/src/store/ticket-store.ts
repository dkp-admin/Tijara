import { MMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";
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

const useTicketStore = create(
  persist(
    (set: any) => ({
      tickets: [],
      clearTicket: () => set({ tickets: [] }),
      addToTicket: (ticket: any) => {
        return set((state: any) => {
          return {
            tickets: [...state.tickets, ticket],
          };
        });
      },
      updateToTicket: (index: any, ticket: any) => {
        return set((state: any) => {
          const ticketArray = [...state.tickets];
          ticketArray.splice(index, 1, ticket);

          return {
            tickets: ticketArray,
          };
        });
      },
      removeSingleTicket: (index: any) => {
        return set((state: any) => {
          const ticketArray = [...state.tickets];
          ticketArray.splice(index, 1);

          return {
            tickets: ticketArray,
          };
        });
      },
    }),
    {
      name: "ticket-store",
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);

export default useTicketStore;
