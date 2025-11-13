'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ADDRESS_TYPES, Address, FORM_DATA_KEY } from '@/utils/addressTypes';
import { cx } from '@/utils/styles';
import { useUserAddresses } from '../../src/hooks/useUserAddresses';
import type { Address as AddressType } from '@/utils/addressTypes';

interface AddressSelectorProps {
  onAddressSelect?: (address: Address) => void;
  selectedAddress?: Address | null;
  from?: 'cart' | 'profile';
}

export function AddressSelector({
  onAddressSelect,
  selectedAddress,
  from = 'profile',
}: AddressSelectorProps) {
  const { language } = useLanguage();
  const router = useRouter();
  const { addresses, isAuthenticated } = useUserAddresses();
  const [isOpen, setIsOpen] = useState(false);

  const handleAddressClick = (address: Address) => {
    onAddressSelect?.(address);
    setIsOpen(false);
  };

  const handleAddNewAddress = () => {
    // Save empty form data to sessionStorage for adding new address
    sessionStorage.setItem(
      FORM_DATA_KEY,
      JSON.stringify({
        name: '',
        address: '',
        addressType: 'home',
      }),
    );
    router.push(`/add-address?from=${from}`);
  };

  const getDisplayText = () => {
    if (!selectedAddress && addresses.length > 0) {
      return language === 'ar' ? 'اختر العنوان' : 'Select Address';
    }
    if (selectedAddress) {
      const addressType = ADDRESS_TYPES[selectedAddress.addressType];
      const typeName = addressType?.name[language as keyof typeof addressType.name] || 'Address';
      return `${addressType?.icon || '📍'} ${typeName}`;
    }
    return language === 'ar' ? 'لا يوجد عنوان' : 'No Address';
  };

  // Don't render anything if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // If no addresses, show "Add Address" button
  if (addresses.length === 0) {
    return (
      <button
        onClick={handleAddNewAddress}
        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
            {language === 'ar' ? 'إضافة عنوان' : 'Add Address'}
          </span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-400">
          <path
            d="M12 5V19M5 12H19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  }

  // If addresses exist, show the dropdown selector
  return (
    <div className="relative">
      {/* Address Dropdown */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50">
          <div className="p-2">
            {addresses.map((address: AddressType) => (
              <button
                key={address.id}
                onClick={() => handleAddressClick(address)}
                className={cx(
                  'w-full p-3 rounded-lg transition-colors text-left flex items-start gap-3',
                  selectedAddress?.id === address.id
                    ? 'bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800',
                )}
              >
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">
                    {ADDRESS_TYPES[address.addressType]?.icon || '📍'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
                    {ADDRESS_TYPES[address.addressType]?.name[
                      language as keyof typeof ADDRESS_TYPES.home.name
                    ] || ADDRESS_TYPES.home.name[language as keyof typeof ADDRESS_TYPES.home.name]}
                  </div>
                  <div className="text-gray-900 dark:text-gray-100 text-sm leading-relaxed break-words">
                    {address.fullAddress}
                  </div>
                </div>
                {selectedAddress?.id === address.id && (
                  <div className="text-orange-500 text-lg">✓</div>
                )}
              </button>
            ))}

            {/* Add new address option at the bottom */}
            <button
              onClick={handleAddNewAddress}
              className="w-full p-3 rounded-lg transition-colors text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-t border-gray-100 dark:border-gray-700 mt-2 pt-3"
            >
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-orange-500"
                >
                  <path
                    d="M12 5V19M5 12H19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-orange-500 font-medium text-sm">
                {language === 'ar' ? 'إضافة عنوان جديد' : 'Add New Address'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Address Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
            {getDisplayText()}
          </span>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className={cx('text-gray-400 transition-transform', isOpen && 'transform rotate-180')}
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
