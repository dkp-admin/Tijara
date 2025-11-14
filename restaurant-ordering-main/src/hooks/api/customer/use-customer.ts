import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { apiInstance } from '@/src/api/instance';
import type { UpdateCustomerRequest, UpdateCustomerResponse } from './customer.api-types';
import { AxiosError } from 'axios';

export function useUpdateCustomer(
  customerId: string,
  options?: UseMutationOptions<UpdateCustomerResponse, AxiosError, UpdateCustomerRequest>,
) {
  const queryClient = useQueryClient();
  return useMutation<UpdateCustomerResponse, AxiosError, UpdateCustomerRequest>({
    mutationKey: ['update-customer', customerId],
    mutationFn: (payload) =>
      apiInstance.patch(`/customer/${customerId}`, payload).then((res) => res.data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['customer-details'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
