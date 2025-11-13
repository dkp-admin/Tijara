'use client';

import { useCartStore } from '@/src/stores/cart-store';
import { useLanguage } from '@/contexts/LanguageContext';
import { cx } from '@/utils/styles';
import { useRouter } from 'next/navigation';
import { useTopLoader } from 'nextjs-toploader';

export function FloatingCart() {
  const { items } = useCartStore();
  const { language } = useLanguage();
  const router = useRouter();
  const loader = useTopLoader();

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => {
    const itemPrice = item.calculatedPrice || item.variants?.[0]?.price || 0;
    return total + itemPrice * item.quantity;
  }, 0);
  const currency = items[0]?.currency || 'SAR';

  const handleCartClick = async () => {
    loader.start();
    await router.push('/cart');
    loader.done();
  };

  if (totalItems === 0) return null;

  return (
    <div className={cx('fixed bottom-8 left-4 right-4 z-40 mb-safe', 'animate-slide-up isolate')}>
      <button
        onClick={handleCartClick}
        className={cx(
          'w-full bg-[#f97315] text-white rounded-2xl p-4',
          'flex items-center justify-between',
          'shadow-lg hover:bg-[#f97315]/90 transition-colors',
          'backdrop-blur-sm',
        )}
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full px-3 py-1">
            <span className="text-white font-medium">
              {totalItems} {language === 'ar' ? 'عناصر' : 'Items'}
            </span>
          </div>
          <div className="text-white font-medium">
            {currency} {totalPrice.toFixed(2)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white font-medium">{language === 'ar' ? 'السلة' : 'Cart'}</span>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    </div>
  );
}
