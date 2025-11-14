import create from "zustand";
import { persist } from "zustand/middleware";

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
      getStorage: () => sessionStorage, // (optional) by default, 'localStorage' is used
    }
  )
);

export default useTicketStore;
