import { useLanguage } from '@/contexts/LanguageContext';
import { useUserLocation } from '@/src/hooks/useUserLocation';
import { useLocationStore } from '@/src/stores/location-store';
import { useCartStore } from '@/src/stores/cart-store';
import { cx } from '@/utils/styles';
import React, { useEffect, useState } from 'react';
import { ConfirmationDialog } from './ConfirmationDialog';

interface OrderTypeModalProps {
  isOpen: boolean;
  onSelect: (orderType: 'delivery' | 'pickup') => void;
  selectedOrderType: 'delivery' | 'pickup';
}

export const OrderTypeModal: React.FC<OrderTypeModalProps> = ({
  isOpen,
  onSelect,
  selectedOrderType,
}) => {
  const { language } = useLanguage();
  const { location, permission, error, requestLocation } = useUserLocation();
  const { items, clearCart } = useCartStore();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingOrderType, setPendingOrderType] = useState<'delivery' | 'pickup' | null>(null);

  const isPickupAvailable = useLocationStore((state) => state.isPickupMenuAvailable);
  const isDeliveryAvailable = useLocationStore((state) => state.isDeliveryMenuAvailable);

  // Handle order type selection with cart confirmation
  const handleOrderTypeSelect = (orderType: 'delivery' | 'pickup') => {
    // If cart has items and user is changing order type, show confirmation
    if (items.length > 0 && selectedOrderType && selectedOrderType !== orderType) {
      setPendingOrderType(orderType);
      setShowConfirmDialog(true);
    } else {
      // No items in cart or same order type, proceed directly
      onSelect(orderType);
    }
  };

  const handleConfirmOrderTypeChange = () => {
    if (pendingOrderType) {
      clearCart();
      onSelect(pendingOrderType);
      setShowConfirmDialog(false);
      setPendingOrderType(null);
    }
  };

  const handleCancelOrderTypeChange = () => {
    setShowConfirmDialog(false);
    setPendingOrderType(null);
  };

  // Reset local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowConfirmDialog(false);
      setPendingOrderType(null);
    }
  }, [isOpen]);

  // Auto-select default order type if only one is available
  useEffect(() => {
    if (isOpen && (isPickupAvailable || isDeliveryAvailable)) {
      const availableCount = (isPickupAvailable ? 1 : 0) + (isDeliveryAvailable ? 1 : 0);

      // If only one option is available, auto-select it
      if (availableCount === 1 && (isPickupAvailable || isDeliveryAvailable)) {
        onSelect(isPickupAvailable ? 'pickup' : 'delivery');
        return;
      }
    }
  }, [isOpen, isPickupAvailable, isDeliveryAvailable, onSelect]);

  // Request location permission when modal opens
  useEffect(() => {
    if (isOpen) {
      // Force a new location request when modal opens
      navigator.geolocation.getCurrentPosition(
        () => {
          // Location received successfully
        },
        () => {
          // Handle location error silently
        },
        { enableHighAccuracy: true },
      );
      requestLocation();
    }
  }, [isOpen, requestLocation]);

  // Log location updates
  useEffect(() => {
    if (location) {
      console.log('Location updated:', location);
    }
  }, [location]);

  // Log permission changes
  useEffect(() => {
    if (permission) {
      console.log('Permission state:', permission);
    }
  }, [permission]);

  // Log errors
  useEffect(() => {
    if (error) {
      console.log('Location error:', error);
    }
  }, [error]);

  if (!isOpen) return null;

  // Don't show modal if no order types are available
  if (!(isPickupAvailable || isDeliveryAvailable)) return null;

  // Helper for option styles
  const getOptionClasses = (type: 'delivery' | 'pickup') => {
    const isSelected = selectedOrderType === type;
    if (isSelected) {
      return cx(
        'w-full flex items-center px-5 py-4 rounded-2xl border-2 transition-all duration-200',
        'border-orange-500',
        'bg-white dark:bg-[#2d1a0b]',
        'hover:border-orange-600',
        'shadow-sm',
        language === 'ar' && 'flex-row-reverse',
      );
    } else {
      return cx(
        'w-full flex items-center px-5 py-4 rounded-2xl border-2 transition-all duration-200',
        'border-gray-200 dark:border-[#3a3a3a]',
        'bg-gray-100 dark:bg-[#232323]',
        'hover:border-gray-400',
        'shadow-sm',
        language === 'ar' && 'flex-row-reverse',
      );
    }
  };

  const getIconBg = (type: 'delivery' | 'pickup') => {
    const isSelected = selectedOrderType === type;
    if (isSelected) {
      return type === 'delivery'
        ? 'bg-orange-50 dark:bg-[#2d1a0b]'
        : 'bg-orange-50 dark:bg-[#232323]';
    } else {
      return 'bg-gray-200 dark:bg-[#232323]';
    }
  };

  const getTextColor = (type: 'delivery' | 'pickup') => {
    const isSelected = selectedOrderType === type;
    return isSelected ? 'text-black dark:text-white' : 'text-gray-700 dark:text-gray-200';
  };

  const getArrowColor = (type: 'delivery' | 'pickup') => {
    const isSelected = selectedOrderType === type;
    return isSelected ? 'text-orange-500' : 'text-gray-400';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={() => onSelect('pickup')} // Default to pickup if user clicks outside
      />
      {/* Modal Content */}
      <div
        className={cx(
          'relative w-full max-w-md mx-auto bg-white dark:bg-[#232323] rounded-t-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-7',
          'space-y-5',
          'animate-slideUp',
        )}
      >
        {/* Handle */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
        {/* Title */}
        <h2
          className={cx(
            'text-2xl font-bold text-center mb-2',
            'text-gray-900 dark:text-white',
            language === 'ar' && 'text-right',
          )}
        >
          {language === 'ar' ? 'اختر طريقة الطلب' : 'Choose your order type'}
        </h2>
        <p className={cx('text-gray-400 text-center mb-8', language === 'ar' && 'text-right')}>
          {language === 'ar'
            ? 'كيف تريد استلام طلبك؟'
            : 'How would you like to receive your order?'}
        </p>
        {/* Options */}
        <div className="space-y-4">
          {/* Delivery Option */}
          {isDeliveryAvailable && (
            <button
              onClick={() => handleOrderTypeSelect('delivery')}
              className={getOptionClasses('delivery')}
              type="button"
            >
              <div
                className={cx(
                  'w-12 h-12 rounded-full flex items-center justify-center mr-4',
                  getIconBg('delivery'),
                )}
              >
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
              <div className={cx('flex-1 text-left', getTextColor('delivery'))}>
                <div className="font-semibold text-lg">
                  {language === 'ar' ? 'توصيل' : 'Delivery'}
                </div>
                <div className="text-gray-400 text-sm">
                  {language === 'ar' ? 'نوصلك في العنوان المحدد' : 'We deliver to your address'}
                </div>
              </div>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className={getArrowColor('delivery')}
              >
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          {/* Pickup Option */}
          {isPickupAvailable && (
            <button
              onClick={() => handleOrderTypeSelect('pickup')}
              className={getOptionClasses('pickup')}
              type="button"
            >
              <div
                className={cx(
                  'w-12 h-12 rounded-full flex items-center justify-center mr-4',
                  getIconBg('pickup'),
                )}
              >
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
              <div className={cx('flex-1 text-left', getTextColor('pickup'))}>
                <div className="font-semibold text-lg">
                  {language === 'ar' ? 'استلام' : 'Pickup'}
                </div>
                <div className="text-gray-400 text-sm">
                  {language === 'ar' ? 'استلم من المطعم' : 'Pick up from restaurant'}
                </div>
              </div>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className={getArrowColor('pickup')}
              >
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

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
