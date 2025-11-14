'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { cx } from '@/utils/styles';
import { useUserAddresses } from '@/src/hooks/useUserAddresses';
import { ADDRESS_TYPES } from '@/utils/addressTypes';
import { useState } from 'react';

export default function AddressesPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { addresses, deleteAddress } = useUserAddresses();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Helper to normalize type
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

  const handleDelete = async (addressId: string) => {
    if (
      window.confirm(
        language === 'ar'
          ? 'هل أنت متأكد من حذف هذا العنوان؟'
          : 'Are you sure you want to delete this address?',
      )
    ) {
      setDeletingId(addressId);
      await deleteAddress(addressId);
      setDeletingId(null);
    }
  };

  return (
    <div
      className={cx(
        'min-h-screen bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white',
        language === 'ar' && 'rtl',
      )}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800 z-10">
        <div className="p-6">
          <div className={cx('flex items-center gap-4', language === 'ar' && 'flex-row-reverse')}>
            <button
              onClick={() => router.push('/profile')}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-2xl transition-colors"
            >
              {language === 'ar' ? '→' : '←'}
            </button>
            <h1
              className={cx(
                'text-2xl font-bold text-gray-900 dark:text-white',
                language === 'ar' && 'text-right',
              )}
            >
              {language === 'ar' ? 'العناوين' : 'Addresses'}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-md mx-auto space-y-4">
          {/* Add New Address Button */}
          <button
            onClick={() => router.push('/add-address')}
            className="w-full bg-transparent border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 flex items-center justify-center gap-2 hover:border-orange-500 dark:hover:border-orange-500 transition-colors group"
          >
            <span className="text-orange-500">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 5V19M5 12H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-gray-600 dark:text-gray-400 group-hover:text-orange-500 transition-colors">
              {language === 'ar' ? 'إضافة عنوان جديد' : 'Add new address'}
            </span>
          </button>

          {/* Existing Addresses */}
          {addresses.map((address) => {
            const addressTypeKey = normalizeType(address.type);
            const addressType = ADDRESS_TYPES[addressTypeKey];

            return (
              <div
                key={address._id}
                className="bg-gray-50 dark:bg-[#2a2a2a] rounded-xl border border-gray-100 dark:border-gray-700 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{addressType.icon}</span>
                    <span className="font-medium text-black dark:text-white">
                      {addressType.name[language === 'ar' ? 'ar' : 'en']}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => router.push(`/add-address?from=profile&id=${address._id}`)}
                      className="text-orange-500 hover:text-orange-600 transition-colors"
                    >
                      {language === 'ar' ? 'تعديل' : 'Edit'}
                    </button>
                    <button
                      onClick={() => address._id && handleDelete(address._id)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                      disabled={deletingId === address._id}
                    >
                      {deletingId === address._id ? (
                        <span className="text-sm">
                          {language === 'ar' ? 'جاري الحذف...' : 'Deleting...'}
                        </span>
                      ) : language === 'ar' ? (
                        'حذف'
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 break-words">
                  {address.fullAddress}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
