import { useState, useEffect, useCallback } from 'react';
import { Address } from '@/utils/addressTypes';
import { useUser } from '@/contexts/UserContext';
import { apiInstance } from '@/src/api/instance';
import type { AddressResponse } from '@/src/hooks/api/address/address.api-types';

export function useUserAddresses() {
  const { user, customerData } = useUser();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem('selectedAddressId') : null,
  );

  // Check if user is authenticated
  const isAuthenticated = !!(customerData?.phone || user?.phone);

  // Delete address function
  const deleteAddress = useCallback(
    async (addressId: string) => {
      try {
        await apiInstance.delete(`/ordering/address/${addressId}`);
        setAddresses((prevAddresses) => prevAddresses.filter((addr) => addr._id !== addressId));

        // If the deleted address was selected, clear the selection
        if (selectedAddressId === addressId) {
          setSelectedAddressId(null);
          localStorage.removeItem('selectedAddressId');
        }
      } catch (error) {
        console.error('Error deleting address:', error);
        throw error;
      }
    },
    [selectedAddressId],
  );

  // Memoize the address loading function
  const loadAddresses = useCallback(async () => {
    if (!isAuthenticated) {
      setAddresses([]);
      return;
    }
    if (!customerData?.companyRef && !user?.customerRef) {
      setAddresses([]);
      return;
    }
    try {
      const customerRef = customerData?._id || user?.customerRef;
      if (!customerRef) return;
      const res = await apiInstance.get(`/ordering/address?customerRef=${customerRef}`);
      const apiAddresses = res.data.results || [];

      // Transform API response to match Address interface
      const transformedAddresses: Address[] = apiAddresses.map((apiAddress: AddressResponse) => ({
        id: apiAddress._id, // Use backend _id as local id
        _id: apiAddress._id, // Keep backend _id
        address: apiAddress.fullAddress || '',
        fullAddress: apiAddress.fullAddress || '',
        addressType: mapTypeToAddressType(apiAddress.type),
        type: apiAddress.type,
        // Add other fields from API response as needed
        houseFlatBlock: apiAddress.houseFlatBlock,
        apartmentArea: apiAddress.apartmentArea,
        directionToReach: apiAddress.directionToReach,
        coordinates: apiAddress.coordinates,
        receiverName: apiAddress.receiverName,
        receiverPhone: apiAddress.receiverPhone,
      }));

      setAddresses(transformedAddresses);
    } catch {
      setAddresses([]);
    }
  }, [isAuthenticated, customerData, user]);

  // Helper function to map API type to AddressTypeId
  const mapTypeToAddressType = (apiType: string) => {
    if (apiType === 'Friends and Family') return 'friendsFamily';
    if (['home', 'work', 'other'].includes(apiType?.toLowerCase())) {
      return apiType.toLowerCase() as 'home' | 'work' | 'other';
    }
    return 'other'; // fallback
  };

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses, isAuthenticated]);

  // Persist selectedAddressId in localStorage
  useEffect(() => {
    if (selectedAddressId) {
      localStorage.setItem('selectedAddressId', selectedAddressId);
    }
  }, [selectedAddressId]);

  // Remove add/edit/delete logic for localStorage

  return {
    addresses,
    setAddresses,
    isAuthenticated,
    loadAddresses,
    selectedAddressId,
    setSelectedAddressId,
    deleteAddress, // Expose deleteAddress function
  };
}
