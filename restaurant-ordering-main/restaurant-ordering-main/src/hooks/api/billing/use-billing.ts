import { useUser } from '@/contexts/UserContext';
import { apiInstance } from '@/src/api/instance';
import { useCartStore } from '@/src/stores/cart-store';
import { useLocationStore } from '@/src/stores/location-store';
import { transformModifiersForBilling } from '@/src/utils/modifier-transformer';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  BillingPayload,
  BillingResponse,
  BillingResponseWithValidation,
} from './billing.api-types';

type CalculateBillingVariables = Partial<Pick<BillingPayload, 'discount'>>;

export function useCalculateBilling(
  options?: Omit<
    UseMutationOptions<BillingResponseWithValidation, AxiosError, CalculateBillingVariables | void>,
    'mutationFn' | 'mutationKey'
  >,
) {
  const { items } = useCartStore();
  const { user, customerData } = useUser();
  const { companyRef, locationRef, menuRef } = useLocationStore();

  return useMutation<BillingResponseWithValidation, AxiosError, CalculateBillingVariables | void>({
    mutationKey: ['billing'],
    mutationFn: async (variables) => {
      const cartItems = items.map((item) => {
        // Transform modifiers to the correct format using utility function
        const formattedModifiers = transformModifiersForBilling(
          item.selectedModifiers,
          item.modifiers as unknown[],
        );

        return {
          productRef: item._id,
          variant: {
            sku: item.selectedVariant?.sku || '',
            type: 'item' as const,
          },
          quantity: item.quantity,
          modifiers: formattedModifiers,
          categoryRef: item.categoryRef,
        };
      });

      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
      ).toISOString();
      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
      ).toISOString();

      const payload: BillingPayload = {
        items: cartItems,
        companyRef: companyRef || '',
        locationRef: locationRef || '',

        startOfDay,
        endOfDay,
        customerRef: customerData?._id || user?.customerRef || '',
        menuRef: menuRef || '',
        discount: variables?.discount,
      };

      const { data } = await apiInstance.post<BillingResponse>('/ordering/billing', payload);

      // Process the response to include validation information
      const enhancedResponse: BillingResponseWithValidation = {
        ...data,
        isValidCoupon: true,
        couponError: undefined,
      };

      // Check if the response indicates an invalid coupon
      if (data && typeof data === 'object' && 'code' in data && data.code === 'INVALID DISCOUNT') {
        enhancedResponse.isValidCoupon = false;
        enhancedResponse.couponError = 'Invalid coupon code';
        // Throw an error so it's handled in onError
        throw new Error('Invalid coupon code');
      }

      return enhancedResponse;
    },
    ...options,
  });
}
