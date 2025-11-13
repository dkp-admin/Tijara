'use client';

import Image from 'next/image';
import { formatCalories } from '@/utils/formatting';
import { cx } from '@/utils/styles';

interface ProductPriceProps {
  price: number;
  currency: string;
  calories?: number;
  language: 'en' | 'ar';
  className?: string;
}

export function ProductPrice({
  price,
  currency,
  calories,
  language,
  className,
}: ProductPriceProps) {
  const symbol = currency === '₹' ? '₹' : 'SAR';

  return (
    <div
      className={cx(
        'flex flex-col max-[360px]:bg-red-600',
        language === 'ar' && 'items-end',
        className,
      )}
    >
      <div className="font-semibold flex items-baseline gap-1">
        <span className="text-[10px] sm:text-xs text-black/70 dark:text-white/70">{symbol}</span>
        <span className="text-sm sm:text-base text-black dark:text-white">{price.toFixed(2)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">{formatCalories(calories)}</span>
        <div className="relative w-3 h-3">
          <Image
            src="/assets/icon.svg"
            alt="Product icon"
            width={12}
            height={12}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
