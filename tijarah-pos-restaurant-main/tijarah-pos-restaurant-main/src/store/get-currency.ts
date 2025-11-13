import { create } from "zustand";
import repository from "../db/repository";

type Currency = {
  currency: string;
  setCurrency: () => Promise<void>;
};

export const useCurrency = create<Currency>((set) => ({
  currency: "SAR",
  setCurrency: async () => {
    const businessDetails = await repository.business.findAll();
    const businessDetail = businessDetails[0];
    const currency = businessDetail.company.currency;
    set({ currency });
  },
}));
