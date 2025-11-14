import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
  UseQueryOptions,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { apiInstance } from '@/src/api/instance';
import { useCartStore, CartItem } from '@/src/stores/cart-store';
import { useLocationStore } from '@/src/stores/location-store';
import { useUser } from '@/contexts/UserContext';
import { useOrderType } from '@/contexts/OrderTypeContext';
import { useUserAddresses } from '@/src/hooks/useUserAddresses';
import { transformModifiersForBilling } from '@/src/utils/modifier-transformer';

import {
  OrderDetails,
  CancelOrderPayload,
  RatingPayload,
  OrderListResponse,
  CancelResponse,
  RatingResponse,
  PlaceOrderPayload,
  PlaceOrderResponse,
} from './orders.api-types';

export function useOrderDetails(
  orderId: string | null,
  options?: Omit<UseQueryOptions<OrderDetails, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<OrderDetails, AxiosError>({
    queryKey: ['order-details', orderId],
    queryFn: () => apiInstance.get(`/ordering/order/${orderId}`, {}).then((res) => res.data),
    ...options,
    enabled: !!orderId,
  });
}

export function useCancelOrder(
  orderId: string,
  options?: Omit<UseMutationOptions<CancelResponse, AxiosError, CancelOrderPayload>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();

  return useMutation<CancelResponse, AxiosError, CancelOrderPayload>({
    mutationKey: ['cancel-order', orderId],
    mutationFn: (payload) =>
      apiInstance.patch(`/ordering/order/${orderId}`, payload).then((res) => res.data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['order-details', orderId] });
      queryClient.invalidateQueries({ queryKey: ['order-list'] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

export function useRateOrder(
  orderId: string,
  options?: Omit<UseMutationOptions<RatingResponse, AxiosError, RatingPayload>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();

  return useMutation<RatingResponse, AxiosError, RatingPayload>({
    mutationKey: ['rate-order', orderId],
    mutationFn: (payload) =>
      apiInstance.patch(`/ordering/order/${orderId}/rating`, payload).then((res) => res.data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['order-details', orderId] });
      queryClient.invalidateQueries({ queryKey: ['order-list'] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

export function useInfiniteOrderList(customerRef: string, enabled: boolean, pageSize: number = 5) {
  return useInfiniteQuery<OrderListResponse, AxiosError>({
    queryKey: ['order-list', customerRef],
    queryFn: async ({ pageParam = 0 }) => {
      const queryString = new URLSearchParams({
        _q: '',
        limit: String(pageSize),
        page: String(pageParam),
        sort: 'desc',
        customerRef,
      }).toString();
      return apiInstance.get(`/ordering/order?${queryString}`).then((res) => res.data);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((acc, p) => acc + p.results.length, 0);
      return loaded < lastPage.total ? allPages.length : undefined;
    },
    enabled,
  });
}

// Place Order
export function usePlaceOrder(
  options?: Omit<
    UseMutationOptions<PlaceOrderResponse, AxiosError, void>,
    'mutationFn' | 'mutationKey'
  >,
) {
  const queryClient = useQueryClient();
  const { items, specialInstructions, billingResult, clearCart, couponCode } = useCartStore();
  const { companyRef, locationRef, menuRef } = useLocationStore();
  const { user, customerData } = useUser();
  const { addresses, selectedAddressId } = useUserAddresses();
  const selectedAddress =
    addresses.find((a) => a._id === selectedAddressId) ||
    (addresses.length > 0 ? addresses[0] : null);
  const { orderType } = useOrderType();

  const mutationFn = async () => {
    if (orderType === 'delivery' && !selectedAddress?._id) {
      throw new Error('Please add an address to place your order.');
    }
    if (!menuRef) {
      throw new Error('Menu reference is missing.');
    }
    if (!companyRef || !locationRef) {
      throw new Error('Company or location reference is missing.');
    }

    const customerRef = customerData?._id || user?.customerRef || '';

    const cartItems = items.map((item) => {
      const cartItem = item as CartItem;
      // Transform modifiers using the utility function
      const formattedModifiers = transformModifiersForBilling(
        cartItem.selectedModifiers,
        cartItem.modifiers as unknown[],
      );

      return {
        productRef: cartItem._id || '',
        variant: {
          sku: cartItem.selectedVariant?.sku || '',
          type: 'item',
        },
        quantity: cartItem.quantity,
        hasMultipleVariants: !!cartItem.variants && cartItem.variants.length > 1,
        note: cartItem.note || '',
        modifiers: formattedModifiers,
        categoryRef: cartItem.categoryRef,
      };
    });

    let normalizedOrderType = '';
    if (orderType === 'pickup') {
      normalizedOrderType = 'Pickup';
    } else if (orderType === 'delivery') {
      normalizedOrderType = 'Delivery';
    }

    const payload: PlaceOrderPayload = {
      qrOrdering: false,
      onlineOrdering: true,
      companyRef: companyRef || '',
      locationRef: locationRef || '',
      menuRef,
      customerRef,
      orderType: normalizedOrderType,
      specialInstructions,
      items: cartItems,
      billing: {
        subTotal: billingResult?.subTotal || 0,
        total: billingResult?.total || 0,
        deliveryFee: 0, // Set to 0 as it is not in billingResult
        discount: billingResult?.discount || 0,
        vat: billingResult?.vatAmount || 0,
      },
      discount: couponCode || undefined,
    };

    // Only include addressRef for delivery orders with a valid address
    if (orderType === 'delivery' && selectedAddress?._id) {
      payload.addressRef = selectedAddress._id;
    }

    const { data } = await apiInstance.post<PlaceOrderResponse>('/ordering/place-order', payload);
    return data;
  };

  return useMutation<PlaceOrderResponse, AxiosError, void>({
    mutationKey: ['place-order'],
    mutationFn,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['order-list'] });
      clearCart();
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
}
