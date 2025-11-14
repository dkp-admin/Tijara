import {
  useQuery,
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { apiInstance } from '@/src/api/instance';
import { useUser } from '@/contexts/UserContext';
import { useLocationStore } from '@/src/stores/location-store';

import { AddressPayload, AddressResponse, AddressFormData } from './address.api-types';

export function useGetAddressById(
  id: string,
  options?: Omit<UseQueryOptions<AddressResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<AddressResponse, AxiosError>({
    queryKey: ['address', id],
    queryFn: () => apiInstance.get(`/ordering/address/${id}`).then((res) => res.data),
    ...options,
  });
}

export function useCreateAddress(
  options?: Omit<UseMutationOptions<unknown, AxiosError, AddressFormData>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  const { user, customerData } = useUser();
  const { companyRef, companyName } = useLocationStore();

  return useMutation<unknown, AxiosError, AddressFormData>({
    mutationKey: ['create-address'],
    mutationFn: async (formData) => {
      if (!companyRef) {
        throw new Error('Company reference is required but not available');
      }

      // Transform form data to API payload
      const addressParts = [
        formData.mapAddress,
        formData.houseDetails.trim(),
        formData.apartmentDetails.trim(),
        formData.directions.trim(),
      ].filter(Boolean);
      const fullAddress = addressParts.join(', ');

      const payload: AddressPayload = {
        name: customerData?.name || user?.name || '',
        phone: customerData?.phone || user?.phone || '',
        customerRef: customerData?._id || user?.customerRef || '',
        companyRef,
        company: { en: companyName || '', ar: companyName || '' },
        fullAddress,
        houseFlatBlock: formData.houseDetails,
        apartmentArea: formData.apartmentDetails,
        directionToReach: formData.directions,
        coordinates: formData.coordinates,
        type:
          formData.addressType === 'friendsFamily' ? 'Friends and Family' : formData.addressType,
        otherName: '',
        receiverName: formData.addressType === 'friendsFamily' ? formData.friendsName || '' : '',
        receiverPhone:
          formData.addressType === 'friendsFamily'
            ? `${formData.friendsCountryCode || '+966'}-${formData.friendsPhone || ''}`
            : '',
      };

      return apiInstance.post('/ordering/address', payload);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['address-list'] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

export function useUpdateAddress(
  id: string,
  options?: Omit<UseMutationOptions<unknown, AxiosError, AddressFormData>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  const { user, customerData } = useUser();
  const { companyRef, companyName } = useLocationStore();

  return useMutation<unknown, AxiosError, AddressFormData>({
    mutationKey: ['update-address', id],
    mutationFn: async (formData) => {
      if (!companyRef) {
        throw new Error('Company reference is required but not available');
      }

      // Transform form data to API payload
      const addressParts = [
        formData.mapAddress,
        formData.houseDetails.trim(),
        formData.apartmentDetails.trim(),
        formData.directions.trim(),
      ].filter(Boolean);
      const fullAddress = addressParts.join(', ');

      const payload: AddressPayload = {
        name: customerData?.name || user?.name || '',
        phone: customerData?.phone || user?.phone || '',
        customerRef: customerData?._id || user?.customerRef || '',
        companyRef,
        company: { en: companyName || '', ar: companyName || '' },
        fullAddress,
        houseFlatBlock: formData.houseDetails,
        apartmentArea: formData.apartmentDetails,
        directionToReach: formData.directions,
        coordinates: formData.coordinates,
        type:
          formData.addressType === 'friendsFamily' ? 'Friends and Family' : formData.addressType,
        otherName: '',
        receiverName: formData.addressType === 'friendsFamily' ? formData.friendsName || '' : '',
        receiverPhone:
          formData.addressType === 'friendsFamily'
            ? `${formData.friendsCountryCode || '+966'}-${formData.friendsPhone || ''}`
            : '',
      };

      return apiInstance.patch(`/ordering/address/${id}`, payload);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['address-list'] });
      queryClient.invalidateQueries({ queryKey: ['address', id] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

export function useDeleteAddress(
  options?: Omit<UseMutationOptions<unknown, AxiosError, string>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<unknown, AxiosError, string>({
    mutationKey: ['delete-address'],
    mutationFn: (addressId: string) => apiInstance.delete(`/ordering/address/${addressId}`),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['address-list'] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
