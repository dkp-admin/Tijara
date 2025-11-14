import { useState, useCallback, useEffect } from 'react';
import type { AddressResponse, AddressFormData } from '@/src/hooks/api/address/address.api-types';
import type { AddressTypeId } from '@/utils/addressTypes';

export interface FormData {
  houseDetails: string;
  apartmentDetails: string;
  directions: string;
  addressType: AddressTypeId;
}

export interface CountryCode {
  code: string;
  country: string;
  length: number;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: '+966', country: 'Saudi Arabia', length: 9 },
  { code: '+91', country: 'India', length: 10 },
];

const INITIAL_FORM_STATE: FormData = {
  houseDetails: '',
  apartmentDetails: '',
  directions: '',
  addressType: 'home',
};

export function useAddressForm(isEditing: boolean, addressData?: AddressResponse) {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_STATE);
  const [mapLat, setMapLat] = useState<number | null>(null);
  const [mapLng, setMapLng] = useState<number | null>(null);
  const [mapAddress, setMapAddress] = useState<string>('');
  const [friendsPhone, setFriendsPhone] = useState('');
  const [friendsCountryCode, setFriendsCountryCode] = useState('+966');
  const [friendsName, setFriendsName] = useState('');

  // Transform API address type to UI address type
  const mapApiTypeToAddressType = useCallback((apiType: string): AddressTypeId => {
    if (apiType === 'Friends and Family') return 'friendsFamily';
    if (['home', 'work', 'other'].includes(apiType?.toLowerCase())) {
      return apiType.toLowerCase() as AddressTypeId;
    }
    return 'home'; // fallback
  }, []);

  // Parse phone number from API format (+966-123456789) to separate parts
  const parsePhoneNumber = useCallback((phoneString: string) => {
    const phoneParts = phoneString.split('-');
    return {
      countryCode: phoneParts[0] || '+966',
      phoneNumber: phoneParts[1] || '',
    };
  }, []);

  // Extract map address from full address by removing the individual components
  const extractMapAddressFromFull = useCallback(
    (fullAddress: string, houseDetails: string, apartmentDetails: string, directions: string) => {
      if (!fullAddress) return '';

      // Create array of components to remove
      const componentsToRemove = [directions, apartmentDetails, houseDetails].filter(Boolean);

      let mapAddress = fullAddress;

      // Remove each component from anywhere in the address
      componentsToRemove.forEach((component) => {
        if (component.trim()) {
          const escapedComponent = component.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

          // Remove component with comma before it
          const patternBefore = new RegExp(`,\\s*${escapedComponent}`, 'gi');
          mapAddress = mapAddress.replace(patternBefore, '');

          // Remove component with comma after it
          const patternAfter = new RegExp(`${escapedComponent}\\s*,`, 'gi');
          mapAddress = mapAddress.replace(patternAfter, '');

          // Remove component without comma (standalone)
          const patternStandalone = new RegExp(`^\\s*${escapedComponent}\\s*$`, 'gi');
          mapAddress = mapAddress.replace(patternStandalone, '');

          // Remove component at the beginning or end without comma
          const patternBeginning = new RegExp(`^\\s*${escapedComponent}\\s*`, 'gi');
          const patternEnd = new RegExp(`\\s*${escapedComponent}\\s*$`, 'gi');
          mapAddress = mapAddress.replace(patternBeginning, '').replace(patternEnd, '');
        }
      });

      // Clean up any double commas or leading/trailing commas
      mapAddress = mapAddress
        .replace(/,\s*,/g, ',')
        .replace(/^,\s*|,\s*$/g, '')
        .trim();

      return mapAddress;
    },
    [],
  );

  // Load address data from API response and transform it for the form
  const loadAddressData = useCallback(
    (data: AddressResponse) => {
      const addressType = mapApiTypeToAddressType(data.type || '');
      const houseDetails = data.houseFlatBlock || '';
      const apartmentDetails = data.apartmentArea || '';
      const directions = data.directionToReach || '';

      setFormData({
        houseDetails,
        apartmentDetails,
        directions,
        addressType,
      });

      setMapLat(data.coordinates?.lat || null);
      setMapLng(data.coordinates?.lng || null);

      // Extract just the map/location part from the full address
      const mapAddress = extractMapAddressFromFull(
        data.fullAddress || '',
        houseDetails,
        apartmentDetails,
        directions,
      );
      setMapAddress(mapAddress);

      // Handle Friends and Family specific data
      if (data.type === 'Friends and Family') {
        setFriendsName(data.receiverName || '');
        if (data.receiverPhone) {
          const { countryCode, phoneNumber } = parsePhoneNumber(data.receiverPhone);
          setFriendsCountryCode(countryCode);
          setFriendsPhone(phoneNumber);
        }
      }
    },
    [mapApiTypeToAddressType, parsePhoneNumber, extractMapAddressFromFull],
  );

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
    setMapLat(null);
    setMapLng(null);
    setMapAddress('');
    setFriendsName('');
    setFriendsCountryCode('+966');
    setFriendsPhone('');
  }, []);

  useEffect(() => {
    if (isEditing && addressData) {
      loadAddressData(addressData);
    } else if (!isEditing) {
      resetForm();
    }
  }, [isEditing, addressData, loadAddressData, resetForm]);

  // Handle form input changes
  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Build full address string for navigation params
  const buildFullAddress = useCallback(() => {
    const addressParts = [
      mapAddress,
      formData.houseDetails.trim(),
      formData.apartmentDetails.trim(),
      formData.directions.trim(),
    ].filter(Boolean);
    return addressParts.join(', ');
  }, [formData, mapAddress]);

  // Get current country configuration based on selected country code
  const getCurrentCountry = useCallback((): CountryCode => {
    return COUNTRY_CODES.find((c) => c.code === friendsCountryCode) || COUNTRY_CODES[0];
  }, [friendsCountryCode]);

  // Handle phone number input with validation
  const handlePhoneChange = useCallback(
    (value: string) => {
      const currentCountry = getCurrentCountry();
      // Only allow up to the correct number of digits for the selected country
      const raw = value.replace(/\D/g, '');
      const maxLen = currentCountry.length;
      setFriendsPhone(raw.slice(0, maxLen));
    },
    [getCurrentCountry],
  );

  // Validate friends phone number
  const isFriendsPhoneValid = useCallback((): boolean => {
    if (formData.addressType !== 'friendsFamily') return true;
    const currentCountry = getCurrentCountry();
    return friendsPhone.length === currentCountry.length;
  }, [formData.addressType, friendsPhone, getCurrentCountry]);

  // Validate entire form
  const isFormValid = useCallback((): boolean => {
    const hasRequiredFields = Boolean(
      formData.houseDetails.trim() && formData.apartmentDetails.trim(),
    );

    if (formData.addressType === 'friendsFamily') {
      return hasRequiredFields && Boolean(friendsName.trim()) && isFriendsPhoneValid();
    }

    return hasRequiredFields;
  }, [formData, friendsName, isFriendsPhoneValid]);

  // Prepare form data for API submission
  const prepareFormDataForAPI = useCallback((): AddressFormData => {
    return {
      houseDetails: formData.houseDetails,
      apartmentDetails: formData.apartmentDetails,
      directions: formData.directions,
      addressType: formData.addressType,
      mapAddress: mapAddress,
      coordinates: { lat: mapLat, lng: mapLng },
      friendsName: formData.addressType === 'friendsFamily' ? friendsName : undefined,
      friendsPhone: formData.addressType === 'friendsFamily' ? friendsPhone : undefined,
      friendsCountryCode: formData.addressType === 'friendsFamily' ? friendsCountryCode : undefined,
    };
  }, [formData, mapAddress, mapLat, mapLng, friendsName, friendsPhone, friendsCountryCode]);

  return {
    state: {
      formData,
      mapLat,
      mapLng,
      mapAddress,
      friendsPhone,
      friendsCountryCode,
      friendsName,
    },
    actions: {
      setFormData,
      setMapLat,
      setMapLng,
      setMapAddress,
      setFriendsPhone,
      setFriendsCountryCode,
      setFriendsName,
      handleInputChange,
      handlePhoneChange,
      resetForm,
      loadAddressData,
      prepareFormDataForAPI,
      buildFullAddress,
      getCurrentCountry,
      isFormValid,
      isFriendsPhoneValid,
    },
  };
}
