'use client';

import { FoodTypeIndicator } from '@/components/FoodTypeIndicator';
import { useCartStore, CartItem } from '@/src/stores/cart-store';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCallback } from 'react';

export function CartItemsList() {
  const { items, updateItemQuantity, removeItem, billingResult } = useCartStore();
  const { language } = useLanguage();
  const currency = 'SAR'; // Or get this from a config/context if available

  const handleIncrement = useCallback(
    (uniqueId: string) => {
      const item = items.find((i) => i.uniqueId === uniqueId);
      if (item) {
        updateItemQuantity(uniqueId, item.quantity + 1);
      }
    },
    [items, updateItemQuantity],
  );

  const handleDecrement = useCallback(
    (uniqueId: string) => {
      const item = items.find((i) => i.uniqueId === uniqueId);
      if (item && item.quantity <= 1) {
        removeItem(uniqueId);
      } else if (item) {
        updateItemQuantity(uniqueId, item.quantity - 1);
      }
    },
    [items, removeItem, updateItemQuantity],
  );

  const getVariantName = (item: CartItem) => {
    // Show Regular if no variants exist or empty variants array
    if (!item.variants || item.variants.length === 0) return 'Regular';
    // Show Regular if no variant is selected
    if (!item.selectedVariant) return 'Regular';
    // Find and show the selected variant name
    const variant = item.variants.find((v) => v._id === item.selectedVariant?._id);
    return variant?.name?.[language] || 'Regular';
  };

  const getSelectedModifierNames = (item: CartItem) => {
    if (!item.selectedModifiers || !item.modifiers) return [];

    const modifierNames: string[] = [];

    Object.entries(item.selectedModifiers).forEach(([modifierId, valueIds]) => {
      const modifier = item.modifiers?.find((m) => m._id === modifierId);

      // Handle both old format (string) and new format (string[])
      const valueIdArray = Array.isArray(valueIds) ? valueIds : [valueIds];

      valueIdArray.forEach((valueId) => {
        const value = modifier?.values.find((v) => v._id === valueId);
        if (value?.name) {
          modifierNames.push(value.name);
        }
      });
    });

    return modifierNames;
  };

  const isEmpty =
    items.length === 0 && (!billingResult?.freeItems || billingResult.freeItems.length === 0);
  const freeItems = billingResult?.freeItems || [];

  return (
    <div>
      {isEmpty ? (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
            {language === 'ar' ? 'السلة فارغة' : 'Cart is empty'}
          </div>
          <div className="text-gray-400 dark:text-gray-500 text-sm">
            {language === 'ar' ? 'أضف منتجات لبدء التسوق' : 'Add items to start shopping'}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Regular Cart Items */}
          {items.map((item) => (
            <div key={item.uniqueId} className="flex items-center justify-between py-2">
              {/* Item Info */}
              <div className="flex items-center gap-3 mt-[-5px]">
                <FoodTypeIndicator type={item.contains} />
                <div className="flex flex-col">
                  <span className="text-gray-900 dark:text-white font-medium">
                    {item.name[language]}
                  </span>
                  <div className="text-gray-500 dark:text-gray-400 text-sm font-light">
                    <span>{getVariantName(item)}</span>
                    {getSelectedModifierNames(item).length > 0 && (
                      <span> • {getSelectedModifierNames(item).join(' • ')}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls and Price (vertical stack, right-aligned) */}
              <div className="flex flex-col items-end gap-2 min-w-[5.5rem]">
                <div className="flex items-center bg-gray-200 dark:bg-[#3a3a3a] rounded-lg px-1 py-1">
                  <button
                    onClick={() => handleDecrement(item.uniqueId)}
                    className="w-6 h-6 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-black/20 rounded-full transition-colors"
                  >
                    <span className="text-gray-700 dark:text-white text-base">−</span>
                  </button>
                  <span className="text-gray-900 dark:text-white text-sm font-medium px-3 min-w-[2rem] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleIncrement(item.uniqueId)}
                    className="w-6 h-6 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-black/20 rounded-full transition-colors"
                  >
                    <span className="text-orange-500 text-base">+</span>
                  </button>
                </div>
                <span className="text-gray-900 dark:text-white font-medium text-sm min-w-[4rem] text-right">
                  {currency} {item.calculatedPrice || item.variants?.[0]?.price || 0}
                </span>
              </div>
            </div>
          ))}

          {/* Free/Discounted Items from Billing Result */}
          {freeItems.map((freeItem) => {
            const originalPrice = freeItem.variants?.[0]?.price || 0;
            const discountedPrice = freeItem.total || 0;
            const isActuallyFree = freeItem.isFree === true;
            const isDiscounted = freeItem.isQtyFree === true;
            const bgColor = isActuallyFree
              ? 'bg-green-50 dark:bg-green-900/20'
              : isDiscounted
                ? 'bg-orange-50 dark:bg-orange-900/20'
                : 'bg-gray-50 dark:bg-gray-900/20';
            const badgeColor = isActuallyFree
              ? 'bg-green-500'
              : isDiscounted
                ? 'bg-orange-500'
                : 'bg-gray-500';
            const badgeText = isActuallyFree
              ? language === 'ar'
                ? 'مجاني'
                : 'FREE'
              : isDiscounted
                ? language === 'ar'
                  ? 'خصم'
                  : 'DISCOUNT'
                : language === 'ar'
                  ? 'عرض'
                  : 'PROMO';
            const quantityBgColor = isActuallyFree
              ? 'bg-green-100 dark:bg-green-800/30'
              : isDiscounted
                ? 'bg-orange-100 dark:bg-orange-800/30'
                : 'bg-gray-100 dark:bg-gray-800/30';
            const quantityTextColor = isActuallyFree
              ? 'text-green-700 dark:text-green-300'
              : isDiscounted
                ? 'text-orange-700 dark:text-orange-300'
                : 'text-gray-700 dark:text-gray-300';
            const priceTextColor = isActuallyFree
              ? 'text-green-600 dark:text-green-400'
              : isDiscounted
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-gray-600 dark:text-gray-400';

            return (
              <div
                key={`free-${freeItem._id}`}
                className={`flex items-center justify-between py-2 ${bgColor} rounded-lg px-3`}
              >
                {/* Item Info */}
                <div className="flex items-center gap-3 mt-[-5px]">
                  <FoodTypeIndicator
                    type={freeItem.contains as 'veg' | 'non-veg' | 'egg' | undefined}
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 dark:text-white font-medium">
                        {freeItem.name[language]}
                      </span>
                      <span
                        className={`${badgeColor} text-white text-xs px-2 py-0.5 rounded-full font-medium`}
                      >
                        {badgeText}
                      </span>
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm font-light">
                      <span>{freeItem.variants?.[0]?.name?.[language] || 'Regular'}</span>
                    </div>
                  </div>
                </div>

                {/* Quantity and Price */}
                <div className="flex flex-col items-end gap-2 min-w-[5.5rem]">
                  <div className={`flex items-center ${quantityBgColor} rounded-lg px-3 py-1`}>
                    <span className={`${quantityTextColor} text-sm font-medium`}>
                      {freeItem.qty}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {(isActuallyFree || isDiscounted) && originalPrice > 0 && (
                      <span className="text-gray-400 dark:text-gray-500 font-medium text-sm line-through">
                        {currency} {originalPrice.toFixed(2)}
                      </span>
                    )}
                    {isActuallyFree ? (
                      <span className={`${priceTextColor} font-bold text-sm`}>
                        {language === 'ar' ? 'مجاني' : 'FREE'}
                      </span>
                    ) : isDiscounted ? (
                      <span className={`${priceTextColor} font-bold text-sm`}>
                        {currency} {discountedPrice.toFixed(2)}
                      </span>
                    ) : (
                      <span className={`${priceTextColor} font-bold text-sm`}>
                        {currency} {discountedPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
