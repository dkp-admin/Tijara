'use client';

import { FC } from 'react';
import { Product } from '@/types/api';
import { cx } from '@/utils/styles';

interface VariantItem {
  cartItemKey: string;
  variantName: string;
  modifiers: string[];
  quantity: number;
  price: number;
}

interface RemoveItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  variants: VariantItem[];
  onRemove: (cartItemKey: string) => void;
  onIncrement: (cartItemKey: string) => void;
  language: 'en' | 'ar';
}

export const RemoveItemModal: FC<RemoveItemModalProps> = ({
  isOpen,
  onClose,
  product,
  variants,
  onRemove,
  onIncrement,
  language,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-background-dark rounded-t-2xl w-full max-h-[70vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {product.name[language]}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
            {language === 'en' ? 'Your customisations' : 'تخصيصاتك'}
          </h3>

          <div className="space-y-4">
            {variants.map((variant) => (
              <div
                key={variant.cartItemKey}
                className={cx(
                  'p-4 border rounded-lg',
                  'border-gray-200 dark:border-gray-700',
                  'bg-gray-50 dark:bg-card-dark',
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-300">
                        {variant.variantName}
                        {variant.modifiers.length > 0 && (
                          <span> • {variant.modifiers.join(' • ')}</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        ₹{variant.price}
                      </span>
                      <div className="flex items-center bg-[#EBEBEB] dark:bg-[#2a2a2a] rounded-full px-1 py-1">
                        <button
                          onClick={() => onRemove(variant.cartItemKey)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-black/10 dark:hover:bg-black/20 rounded-full transition-colors"
                        >
                          <span className="text-gray-600 dark:text-white text-base">−</span>
                        </button>
                        <span className="text-gray-900 dark:text-white text-sm font-medium px-3 min-w-[2rem] text-center">
                          {variant.quantity}
                        </span>
                        <button
                          onClick={() => onIncrement(variant.cartItemKey)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-black/10 dark:hover:bg-black/20 rounded-full transition-colors"
                        >
                          <span className="text-[#FF4201] text-base">+</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
