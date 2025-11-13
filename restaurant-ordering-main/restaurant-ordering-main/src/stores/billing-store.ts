import { create } from 'zustand';
import type { BillingResponse } from '@/src/hooks/api/billing/billing.api-types';

interface BillingStore {
  billingResult: BillingResponse | null;
  setBillingResult: (result: BillingResponse | null) => void;
  clearBillingResult: () => void;
}

export const useBillingStore = create<BillingStore>((set) => ({
  billingResult: null,
  setBillingResult: (result) => set({ billingResult: result }),
  clearBillingResult: () => set({ billingResult: null }),
}));
