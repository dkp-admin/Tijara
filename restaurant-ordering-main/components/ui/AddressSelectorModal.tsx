import { useLanguage } from '@/contexts/LanguageContext';
import { useOrderType } from '@/contexts/OrderTypeContext';
import { useUserAddresses } from '@/src/hooks/useUserAddresses';
import { useCartStore } from '@/src/stores/cart-store';
import { useLocationStore } from '@/src/stores/location-store';
import { cx } from '@/utils/styles';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';
import { ConfirmationDialog } from './ConfirmationDialog';

interface AddressSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (addressId: string) => void;
}

export const AddressSelectorModal: React.FC<AddressSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const { addresses, isAuthenticated, loadAddresses, selectedAddressId } = useUserAddresses();
  const { language } = useLanguage();
  const router = useRouter();
  const { orderType, setOrderType } = useOrderType();
  const { clearCart, items } = useCartStore();
  const { isPickupMenuAvailable, isDeliveryMenuAvailable } = useLocationStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [pendingOrderType, setPendingOrderType] = useState(orderType);
  const [pendingAddressId, setPendingAddressId] = useState(selectedAddressId);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      loadAddresses();
      // Reset state when modal opens
      setShowConfirmDialog(false);
      setPendingOrderType(orderType);
      setPendingAddressId(selectedAddressId);
    }
  }, [isOpen, loadAddresses, orderType, selectedAddressId]);

  const handleDoneAction = () => {
    if (pendingOrderType !== orderType) {
      clearCart();
      setOrderType(pendingOrderType);
    }
    if (
      pendingOrderType === 'delivery' &&
      pendingAddressId &&
      pendingAddressId !== selectedAddressId
    ) {
      onSelect(pendingAddressId);
    }
    onClose();
  };

  const handleConfirmOrderTypeChange = () => {
    setShowConfirmDialog(false);
    handleDoneAction();
  };

  const handleCancelOrderTypeChange = () => {
    setShowConfirmDialog(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 dark:bg-black/60" />
      {/* Bottom Sheet Modal */}
      <div
        className={cx(
          'relative w-full max-w-md mx-auto bg-white dark:bg-[#232323] rounded-t-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-7',
          'space-y-5',
          'animate-slideUp',
        )}
        style={{ zIndex: 100, marginBottom: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Delivery/Pickup Toggle always visible above address selection */}
        <div className="mb-6">
          <div className="space-y-4">
            {/* Delivery Option */}
            {isDeliveryMenuAvailable && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => setPendingOrderType('delivery')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setPendingOrderType('delivery');
                  }
                }}
                className={cx(
                  'w-full flex items-center px-5 py-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer',
                  pendingOrderType === 'delivery'
                    ? 'border-orange-500 bg-orange-50 dark:bg-[#2d1a0b] dark:bg-opacity-60'
                    : 'border-gray-300 bg-white dark:border-[#3a3a3a] dark:bg-[#232323]',
                  'hover:border-orange-600',
                )}
              >
                <div className="w-12 h-12 bg-[#2d1a0b] rounded-full flex items-center justify-center mr-4">
                  {/* Delivery Icon */}
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-orange-500"
                  >
                    <path
                      d="M3 7L5 5L7 7M5 5V19M5 5H19M7 7V19M7 7H19M19 7L21 5L23 7M21 5V19M21 5H7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-black dark:text-white text-lg">
                    {language === 'ar' ? 'توصيل' : 'Delivery'}
                  </div>
                  {pendingOrderType === 'delivery' && isAuthenticated && addresses.length === 0 ? (
                    <div className="text-gray-400 text-sm mt-2 flex flex-row items-center justify-between w-full">
                      <span>{language === 'ar' ? 'لا يوجد عناوين' : 'No addresses found'}</span>
                      <button
                        className="text-orange-500 hover:underline text-sm font-medium"
                        onClick={() => {
                          router.push('/add-address?from=home');
                          onClose();
                        }}
                        type="button"
                      >
                        {language === 'ar' ? '+ إضافة عنوان' : '+ Add address'}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                        {language === 'ar'
                          ? 'نوصلك في العنوان المحدد'
                          : 'We deliver to your address'}
                      </div>
                      {/* Address Dropdown (only show if delivery is selected and authenticated) */}
                      {pendingOrderType === 'delivery' &&
                        isAuthenticated &&
                        addresses.length > 0 && (
                          <div className="relative mt-2">
                            <button
                              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-orange-500 focus:outline-none text-xs bg-white text-black dark:bg-[#232323] dark:text-white min-h-0"
                              onClick={() => setDropdownOpen((open) => !open)}
                              type="button"
                            >
                              <span>
                                {addresses
                                  .find((a) => a._id === pendingAddressId)
                                  ?.fullAddress?.slice(0, 40) ||
                                  (language === 'ar' ? 'اختر العنوان' : 'Select address')}
                              </span>
                              <svg
                                width="18"
                                height="18"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="ml-2 text-orange-500"
                              >
                                <path
                                  d="M6 9l6 6 6-6"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                            {dropdownOpen && (
                              <div
                                ref={dropdownRef}
                                className="absolute left-0 right-0 z-20 mt-2 rounded-lg shadow-lg max-h-48 overflow-y-auto border border-orange-500 bg-white text-black dark:bg-[#232323] dark:text-white"
                              >
                                <button
                                  className="w-full text-left px-4 py-2 font-semibold hover:bg-orange-500/20 focus:bg-orange-500/30 transition-colors text-xs rounded-t-lg text-white bg-orange-500 border-b border-orange-200 dark:border-orange-700"
                                  onClick={() => {
                                    router.push('/add-address?from=home');
                                    setDropdownOpen(false);
                                    onClose();
                                  }}
                                >
                                  {language === 'ar' ? 'إضافة عنوان جديد' : '+ Add Address'}
                                </button>
                                {addresses.map((address) => (
                                  <button
                                    key={address._id}
                                    className={`w-full text-left px-4 py-2 hover:bg-orange-500/20 focus:bg-orange-500/30 transition-colors text-xs 
                                  ${pendingAddressId === address._id ? 'bg-orange-500/10' : ''}
                                  ${'dark:hover:bg-orange-500/20 dark:focus:bg-orange-500/30'}
                                `}
                                    onClick={() => {
                                      setPendingAddressId(address._id ?? '');
                                      setDropdownOpen(false);
                                    }}
                                  >
                                    {address.fullAddress}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Pickup Option */}
            {isPickupMenuAvailable && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => setPendingOrderType('pickup')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setPendingOrderType('pickup');
                  }
                }}
                className={cx(
                  'w-full flex items-center px-5 py-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer',
                  pendingOrderType === 'pickup'
                    ? 'border-orange-500 bg-orange-50 dark:bg-[#2d1a0b] dark:bg-opacity-60'
                    : 'border-gray-300 bg-white dark:border-[#3a3a3a] dark:bg-[#232323]',
                  'hover:border-orange-600',
                )}
              >
                <div className="w-12 h-12 bg-[#232323] rounded-full flex items-center justify-center mr-4">
                  {/* Pickup Icon */}
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-gray-400"
                  >
                    <path
                      d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-black dark:text-white text-lg">
                    {language === 'ar' ? 'استلام' : 'Pickup'}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">
                    {language === 'ar' ? 'استلم من المطعم' : 'Pick up from restaurant'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {pendingOrderType === 'delivery' && !isAuthenticated && (
          <div className="text-gray-400 text-sm text-center py-4">Login to add address</div>
        )}
        <div className="flex gap-3 mt-3">
          <button
            onClick={() => {
              // Check if order type is changing and cart has items
              if (pendingOrderType !== orderType && items.length > 0) {
                setShowConfirmDialog(true);
              } else {
                // No confirmation needed, proceed directly
                handleDoneAction();
              }
            }}
            className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base transition-colors shadow"
          >
            {language === 'ar' ? 'تم' : 'Done'}
          </button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={handleCancelOrderTypeChange}
        onConfirm={handleConfirmOrderTypeChange}
        title={language === 'ar' ? 'تغيير نوع الطلب' : 'Change Order Type'}
        message={
          language === 'ar'
            ? 'تغيير نوع الطلب سيؤدي إلى مسح جميع العناصر من السلة. هل تريد المتابعة؟'
            : 'Changing the order type will clear all items from your cart. Do you want to continue?'
        }
        confirmText={language === 'ar' ? 'نعم، امسح السلة' : 'Yes, Clear Cart'}
        cancelText={language === 'ar' ? 'إلغاء' : 'Cancel'}
        confirmButtonColor="red"
      />
    </div>
  );
};
