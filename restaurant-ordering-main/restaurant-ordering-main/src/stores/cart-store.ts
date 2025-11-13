import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, ProductVariant } from '@/types/api';
import type { BillingResponse } from '@/src/hooks/api/billing/billing.api-types';

export interface CartItem extends Product {
  quantity: number;
  uniqueId: string;
  selectedVariant?: ProductVariant;
  selectedModifiers?: Record<string, string | string[]>;
  note?: string;
  calculatedPrice?: number;
}

interface CartState {
  items: CartItem[];
  billingResult: BillingResponse | null;
  specialInstructions: string;
  couponCode: string | null;
  addItem: (item: Omit<CartItem, 'quantity' | 'uniqueId'>) => void;
  removeItem: (uniqueId: string) => void;
  updateItemQuantity: (uniqueId: string, quantity: number) => void;
  setBillingResult: (result: BillingResponse | null) => void;
  setSpecialInstructions: (instructions: string) => void;
  setCouponCode: (code: string | null) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      billingResult: null,
      specialInstructions: '',
      couponCode: null,
      addItem: (item) => {
        const { items } = get();

        // Create a more comprehensive uniqueId that includes modifiers
        const modifiersKey = item.selectedModifiers
          ? Object.entries(item.selectedModifiers)
              .sort(([a], [b]) => a.localeCompare(b)) // Sort for consistency
              .map(([modifierId, valueIds]) => {
                const sortedValueIds = Array.isArray(valueIds) ? [...valueIds].sort() : [valueIds];
                return `${modifierId}:${sortedValueIds.join(',')}`;
              })
              .join('|')
          : '';

        const uniqueId = `${item._id}-${item.selectedVariant?._id}-${modifiersKey}`;
        const existingItem = items.find((i) => i.uniqueId === uniqueId);

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.uniqueId === uniqueId ? { ...i, quantity: i.quantity + 1 } : i,
            ),
            billingResult: null,
          });
        } else {
          set({ items: [...items, { ...item, quantity: 1, uniqueId }], billingResult: null });
        }
      },
      removeItem: (uniqueId) => {
        set((state) => ({
          items: state.items.filter((item) => item.uniqueId !== uniqueId),
          billingResult: null,
        }));
      },
      updateItemQuantity: (uniqueId, quantity) => {
        set((state) => ({
          items: state.items
            .map((item) => (item.uniqueId === uniqueId ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0),
          billingResult: null,
        }));
      },
      setBillingResult: (result) => {
        set({ billingResult: result });
      },
      setSpecialInstructions: (instructions) => {
        set({ specialInstructions: instructions });
      },
      setCouponCode: (code) => {
        set({ couponCode: code });
      },
      clearCart: () => {
        set({ items: [], billingResult: null, specialInstructions: '', couponCode: null });
      },
    }),
    {
      name: 'cart-storage',
    },
  ),
);
