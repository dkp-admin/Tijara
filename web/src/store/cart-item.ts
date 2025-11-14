import { trigger } from "src/utils/custom-event";
import create from "zustand";
import { persist } from "zustand/middleware";
import calculateCart from "../utils/calculate-cart";

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
      customCharges: [],
      order: {},
      items: [],
      customerRef: "",
      staff: {},
      staffRef: "",
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
        set({ remainingWalletBalance: amount }),
      setTotalPaidAmount: (amount: any) => set({ totalPaidAmount: amount }),
      setTotalDiscount: (discount: any) => set({ totalDiscount: discount }),
      setDiscountsApplied: (discount: any) =>
        set({ discountsApplied: discount }),

      setLastOrder: (order: any) => set({ lastOrder: order }),
      clearDiscount: () => {
        return set((state: any) => {
          trigger("discount-applied", null, true as any, null, null);
          const calculation = calculateCart();
          return {
            discountsApplied: [] as any,
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
          trigger("discount-applied", null, true as any, null, null);
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
          trigger("discount-applied", null, true as any, null, null);
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
      setCustomCharges: (customCharges: any) => set({ customCharges }),
      setOrder: (order: any) => set({ order }),
      setItems: (items: any) => set({ items }),
      setVATAmount: (vat: any) => set({ vatAmount: vat }),
      setCustomerRef: (customerRef: any) => set({ customerRef }),
      setStaff: (staff: any) => set({ staff }),
      setStaffRef: (staffRef: any) => set({ staffRef }),
    }),
    {
      name: "cart-item",
      getStorage: () => sessionStorage, // (optional) by default, 'localStorage' is used
    }
  )
);

export default useCartStore;
