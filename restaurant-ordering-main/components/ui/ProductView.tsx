'use client';

import Image from 'next/image';
import { Product } from '@/types/api';
import { FoodTypeIndicator } from '../FoodTypeIndicator';
import { cx } from '@/utils/styles';

interface ProductViewProps {
  product: Product;
  language: 'en' | 'ar';
  onClose: () => void;
  isOpen: boolean;
}

export function ProductView({ product, language, onClose, isOpen }: ProductViewProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end justify-center isolate">
      <div
        className={cx(
          'bg-card-light dark:bg-card-dark rounded-t-2xl w-full max-w-lg',
          'relative overflow-hidden animate-slide-up p-6',
          'z-[1]', // Ensure modal content stays above backdrop
          language === 'ar' && 'rtl',
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-5 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
        >
          ✕
        </button>

        <div className="flex flex-col gap-4">
          <div className="relative w-32 h-32 mx-auto">
            <Image
              src={product.image || '/assets/placeholder.png'}
              alt={product.name[language]}
              fill
              className="object-cover rounded-full"
            />
          </div>

          <div className="space-y-3 text-center">
            <h2 className="text-xl font-semibold flex items-center justify-center gap-2 text-black dark:text-white">
              <FoodTypeIndicator type={product.contains} />
              {product.name[language]}
            </h2>

            <div className="flex items-center justify-center gap-3">
              {product.nutritionalInformation?.calorieCount && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Image
                    src="/assets/icon.svg"
                    alt="Calories"
                    width={16}
                    height={16}
                    className="opacity-60"
                  />
                  <span className="text-sm">{product.nutritionalInformation.calorieCount} Cal</span>
                </div>
              )}

              {product.bestSeller && (
                <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                  <span>★</span>
                  <span>{language === 'ar' ? 'الأكثر مبيعا' : 'Bestseller'}</span>
                </div>
              )}
            </div>

            <p className="text-black/70 dark:text-white/70 text-sm leading-relaxed max-w-md mx-auto">
              {product.description || '--'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
