'use client';

import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ADDRESS_TYPES, FORM_DATA_KEY } from '@/utils/addressTypes';
import { useUserAddresses } from '../../src/hooks/useUserAddresses';
import { useDeleteAddress } from '@/src/hooks/api/address';

interface AddressDetailsProps {
  savedAddress?: string;
  savedAddressType?: string;
  showButtonOutside?: boolean;
  from?: 'cart' | 'profile';
}

export function AddressDetails({
  savedAddress,
  savedAddressType,
  from = 'profile',
}: AddressDetailsProps) {
  const { language } = useLanguage();
  const router = useRouter();
  const { addresses, isAuthenticated, loadAddresses } = useUserAddresses();
  const [hasProcessedSavedAddress, setHasProcessedSavedAddress] = useState(false);
  const { user, customerData } = useUser();
  const currentName = customerData?.name || user?.name || '';

  const deleteAddressMutation = useDeleteAddress({
    onSuccess: () => {
      loadAddresses();
    },
    onError: () => {
      alert('Failed to delete address.');
    },
  });

  console.log('addresses', addresses);

  // Always refresh addresses on mount and navigation
  useEffect(() => {
    loadAddresses();
    // Listen for focus events (when user returns to the tab)
    const handleFocus = () => loadAddresses();
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadAddresses, isAuthenticated]);

  // Monitor for URL parameters (when returning from add-address)
  useEffect(() => {
    if (!hasProcessedSavedAddress && savedAddress) {
      setHasProcessedSavedAddress(true);
      loadAddresses();

      // Clean up URL parameters
      if (typeof window !== 'undefined') {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [savedAddress, savedAddressType, hasProcessedSavedAddress, loadAddresses]);

  const handleEdit = (index: number) => {
    const addressToEdit = addresses[index];
    // Save the full address object to sessionStorage for editing

    router.push(`/add-address?from=${from}&id=${addressToEdit._id}`);
  };

  const handleDelete = async (index: number) => {
    const addressToDelete = addresses[index];
    if (!addressToDelete._id) return;

    deleteAddressMutation.mutate(addressToDelete._id);
  };

  const handleAddNewAddress = () => {
    // Check if user is authenticated before allowing to add address
    if (!isAuthenticated) {
      return;
    }

    sessionStorage.setItem(
      FORM_DATA_KEY,
      JSON.stringify({
        name: currentName,
        address: '',
        addressType: 'home',
      }),
    );
    router.push(`/add-address?from=${from}`);
  };

  const normalizeType = (type?: string) => {
    if (!type) return 'other';
    const map: Record<string, keyof typeof ADDRESS_TYPES> = {
      home: 'home',
      work: 'work',
      'friends and family': 'friendsFamily',
      friendsfamily: 'friendsFamily',
      friends_and_family: 'friendsFamily',
      other: 'other',
    };
    return map[type.trim().toLowerCase()] || 'other';
  };

  return (
    <>
      {/* Address Section */}
      <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl border border-gray-100 dark:border-gray-700 py-3 px-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-black dark:text-white">
            {language === 'ar' ? 'العنوان' : 'Address'}
          </h3>
          <button
            onClick={handleAddNewAddress}
            className="text-orange-500 hover:text-orange-400 dark:hover:text-orange-300 text-xs font-normal flex items-center gap-1"
          >
            <span className="text-base leading-none">+</span>
            {language === 'ar' ? 'إضافة عنوان جديد' : 'Add new address'}
          </button>
        </div>

        {/* Multiple Address List with Divider */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {isAuthenticated && addresses.length > 0 ? (
            addresses.map((addressItem, index: number) => (
              <div key={addressItem._id} className="py-3 relative">
                {/* Action buttons - top right corner */}
                <div className="absolute top-2 right-2 flex items-center gap-2">
                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(index)}
                    className="text-red-500 hover:text-red-400 dark:hover:text-red-300 transition-colors"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="stroke-current"
                    >
                      <path
                        d="M3 6H5H21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {/* Edit button */}
                  <button
                    onClick={() => handleEdit(index)}
                    className="text-orange-500 hover:text-orange-400 dark:hover:text-orange-300 transition-colors text-xs font-medium"
                  >
                    {language === 'ar' ? 'تعديل' : 'Edit'}
                  </button>
                </div>
                <div className="flex items-start gap-2 pr-16">
                  {(() => {
                    const typeKey = normalizeType(addressItem.type);
                    const typeObj = ADDRESS_TYPES[typeKey];
                    return (
                      <>
                        <div className="w-6 h-6 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-sm">{typeObj.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-gray-500 dark:text-gray-300 mb-0.5 font-medium">
                            {typeObj.name[language as keyof typeof typeObj.name]}
                          </div>
                          <div className="text-gray-900 dark:text-gray-100 font-medium text-xs leading-relaxed break-words">
                            {addressItem.fullAddress}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            ))
          ) : (
            <div className="py-3 text-center text-gray-500 dark:text-gray-400 text-xs">
              {language === 'ar' ? 'لم يتم إضافة أي عنوان بعد' : 'No addresses added yet'}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
