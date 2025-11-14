'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Categories from '@/sections/Categories';
import Search from '@/sections/Search';
import { Product, Category } from '@/types/api';
import { useTheme } from '@/contexts/ThemeContext';
import { ProfileIcon } from './ui/icons/ProfileIcon';
import { cx } from '@/utils/styles';
import { useUserAddresses } from '@/src/hooks/useUserAddresses';
import { useOrderType } from '@/contexts/OrderTypeContext';
import { ADDRESS_TYPES } from '@/utils/addressTypes';
import { AddressSelectorModal } from './ui/AddressSelectorModal';
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocationStore } from '@/src/stores/location-store';

interface HeaderProps {
  companyName: string;
  categories: Category[];
  onCategorySelect: (categoryRef: string) => void;
  allProducts: Product[];
  activeCategory: string;
  onProductSelect?: (productId: string, categoryRef: string) => void;
  isAuthenticated: boolean;
}

export default function Header({
  companyName,
  categories,
  onCategorySelect,
  allProducts,
  activeCategory,
  onProductSelect,
  isAuthenticated,
}: HeaderProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const { addresses, selectedAddressId, setSelectedAddressId } = useUserAddresses();
  const mainAddress =
    addresses.find((a) => a._id === selectedAddressId) ||
    (addresses.length > 0 ? addresses[0] : null);
  const { orderType } = useOrderType();
  const { language } = useLanguage();
  const { isPickupMenuAvailable, isDeliveryMenuAvailable } = useLocationStore();

  console.log(isPickupMenuAvailable, isDeliveryMenuAvailable);

  // Address modal state
  const [showAddressModal, setShowAddressModal] = React.useState(false);
  const addressButtonRef = React.useRef<HTMLButtonElement>(null);

  // Handler for selecting address
  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    setShowAddressModal(false);
  };

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
  const addressTypeKey = normalizeType(mainAddress?.type);
  const addressType = ADDRESS_TYPES[addressTypeKey];

  return (
    <header
      className={cx(
        'fixed top-0 left-0 right-0 border-b z-50',
        'transition-colors duration-200',
        'bg-background-light dark:bg-background-dark',
        'border-gray-200 dark:border-gray-800',
      )}
    >
      <div className="px-4 sm:px-6 pt-4">
        {/* First line: logo and company name */}
        <div className="flex items-center gap-4 mb-2">
          <Image
            src={theme === 'dark' ? '/assets/black background.png' : '/assets/white background.png'}
            alt="Logo"
            width={64}
            height={64}
            className="object-contain"
            priority
          />
          <h1 className="text-2xl font-bold truncate text-black dark:text-white">{companyName}</h1>
        </div>
        {/* Second line: address/type or pickup, profile icon */}
        <div className="flex items-center justify-between gap-4 mt-1 mb-2">
          {/* Always show address/type block for delivery */}
          {orderType === 'delivery' ? (
            <button
              ref={addressButtonRef}
              className="flex items-center gap-1 rounded-lg px-2 py-1 bg-white/80 dark:bg-[#232323]/80 border border-gray-200 dark:border-gray-700 shadow-sm min-w-0 transition hover:bg-gray-50 dark:hover:bg-[#232323]"
              onClick={() => setShowAddressModal(true)}
              style={{ boxShadow: 'none' }}
            >
              <span className="flex items-center gap-1">
                <span className="text-base text-orange-500">
                  {mainAddress ? addressType.icon : '📍'}
                </span>
                <span className="text-sm font-semibold text-black dark:text-white">
                  {mainAddress ? addressType.name.en : 'Delivering to'}
                </span>
              </span>
              <span
                className={
                  mainAddress
                    ? 'truncate max-w-[90px] text-xs font-medium text-gray-600 dark:text-gray-300 ml-1'
                    : 'text-xs font-medium text-gray-400 ml-1 cursor-pointer'
                }
                title={mainAddress ? mainAddress.fullAddress : ''}
              >
                {mainAddress ? (
                  mainAddress.fullAddress
                ) : !isAuthenticated ? (
                  <span>---</span>
                ) : (
                  <span>Add address</span>
                )}
              </span>
            </button>
          ) : orderType === 'pickup' ? (
            <button
              ref={addressButtonRef}
              className="flex items-center gap-1 rounded-lg px-2 py-1 bg-white/80 dark:bg-[#232323]/80 border border-gray-200 dark:border-gray-700 shadow-sm min-w-0 transition hover:bg-gray-50 dark:hover:bg-[#232323]"
              onClick={() => setShowAddressModal(true)}
              style={{ boxShadow: 'none' }}
            >
              <span className="flex items-center gap-1">
                <span className="text-sm font-semibold text-black dark:text-white">
                  {language === 'ar' ? 'استلام من المطعم' : 'Pickup from restaurant'}
                </span>
              </span>
            </button>
          ) : null}
          {/* Profile icon */}
          <button
            className="relative group p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/30 active:bg-gray-200 dark:active:bg-gray-800/50 transition-all duration-200"
            onClick={() => router.push('/profile')}
          >
            <div className="relative">
              <ProfileIcon />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-background-dark" />
            </div>
          </button>
        </div>
      </div>
      <div className="px-4 sm:px-8">
        <Categories
          categories={categories}
          activeCategory={activeCategory}
          onCategorySelect={onCategorySelect}
        />
        <Search products={allProducts} onProductSelect={onProductSelect} />
      </div>
      {/* Address Selector Modal */}
      <AddressSelectorModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSelect={handleSelectAddress}
      />
    </header>
  );
}
