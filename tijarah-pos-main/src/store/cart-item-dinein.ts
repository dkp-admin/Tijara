import { EventRegister } from "react-native-event-listeners";
import { MMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";
import calculateCart from "../utils/calculate-cart";
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

const useCartStore = create(
  persist(
    (set: any) => ({
      setCartCalculations: (obj: any) =>
        set(() => {
          return {
            ...obj,
          };
        }),

      customer: {},
      channel: "",
      channelList: [],
      specialInstructions: "",
      order: {},
      items: [],
      customerRef: "",
      discountsApplied: [],
      totalDiscount: 0,
      lastOrder: {},
      totalAmount: 0,
      totalQty: 0,
      totalSellingPrice: 0,
      vatAmount: 0,
      totalDiscountCalc: 0,
      totalPaidAmount: 0,
      remainingWalletBalance: 0,
      remainingCreditBalance: 0,
      discountPercentage: 0,
      discountCodes: "",
      setTotalAmount: (amount: any) => set({ totalAmount: amount }),
      setTotalQty: (qty: any) => set({ totalQty: qty }),
      setRemainingWalletBalance: (amount: any) =>
        set({ remainingWalletBalance: amount }),
      setRemainingCreditBalance: (amount: any) =>
        set({ remainingCreditBalance: amount }),
      setTotalPaidAmount: (amount: any) => set({ totalPaidAmount: amount }),
      setTotalDiscount: (discount: any) => set({ totalDiscount: discount }),
      setDiscountsApplied: (discount: any) =>
        set({ discountsApplied: discount }),
      setLastOrder: (order: any) => set({ lastOrder: order }),
      clearDiscount: () => {
        return set((state: any) => {
          EventRegister.emit("discount-applied-dinein", true);
          const calculation = calculateCart();
          return {
            discountsApplied: [],
            totalAmount: calculation.totalAmount,
            totalVatAmount: calculation.totalVatAmount,
            totalSellingPrice: calculation.totalSellingPrice,
            totalDiscountCalc: calculation.totalDiscountCalc,
            totalPaidAmount: calculation.totalPaidAmount,
            discountPercentage: calculation.discountPercentage,
            discountCodes: calculation.discountCodes,
            totalDiscount: 0,
          };
        });
      },
      applyDiscount: (discount: any) => {
        return set((state: any) => {
          const calculation = calculateCart();
          EventRegister.emit("discount-applied-dinein", true);
          return {
            discountsApplied: [...state.discountsApplied, discount],
            totalAmount: calculation.totalAmount,
            totalVatAmount: calculation.totalVatAmount,
            totalSellingPrice: calculation.totalSellingPrice,
            totalDiscountCalc: calculation.totalDiscountCalc,
            totalDiscount: calculation.totalDiscount,
            totalPaidAmount: calculation.totalPaidAmount,
            discountPercentage: calculation.discountPercentage,
            discountCodes: calculation.discountCodes,
          };
        });
      },
      removeDiscount: (idx: any) => {
        return set((state: any) => {
          EventRegister.emit("discount-applied-dinein", true);
          const calculation = calculateCart();
          return {
            discountsApplied: [...state.discountsApplied],
            totalAmount: calculation.totalAmount,
            totalVatAmount: calculation.totalVatAmount,
            totalSellingPrice: calculation.totalSellingPrice,
            totalDiscountCalc: calculation.totalDiscountCalc,
            totalDiscount: calculation.totalDiscount,
            totalPaidAmount: calculation.totalPaidAmount,
            discountPercentage: calculation.discountPercentage,
            discountCodes: calculation.discountCodes,
          };
        });
      },
      setCustomer: (customer: any) => set({ customer }),
      setChannel: (channel: any) => set({ channel }),
      setChannelList: (channelList: any) => set({ channelList }),
      setSpecialInstructions: (specialInstructions: any) =>
        set({ specialInstructions }),
      setOrder: (order: any) => set({ order }),
      setItems: (items: any) => set({ items }),
      setVATAmount: (vat: any) => set({ vatAmount: vat }),
      setCustomerRef: (customerRef: any) => set({ customerRef }),
    }),
    {
      name: "cart-item-dinein",
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);

export default useCartStore;
