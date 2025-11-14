'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { cx } from '@/utils/styles';
import type { NextPage } from 'next';
import { useCartStore } from '@/src/stores/cart-store';
import { useCalculateBilling } from '@/src/hooks/api/billing';

const CouponsPage: NextPage = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const {
    couponCode: appliedCouponCode,
    setBillingResult,
    setCouponCode: setGlobalCouponCode,
    billingResult,
  } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutate: applyCoupon, isPending } = useCalculateBilling({
    onSuccess: (data) => {
      setBillingResult(data);
      // Only set coupon as applied if we get back a valid discount code and amount
      if (data.discountCode && data.discount > 0) {
        setGlobalCouponCode(couponCode);
        setIsCouponApplied(true);
        setErrorMessage(null);
      } else {
        setErrorMessage(
          language === 'ar' ? 'الكوبون غير صالح للاستخدام' : 'Coupon cannot be applied',
        );
        setGlobalCouponCode(null);
        setIsCouponApplied(false);
      }
    },
    onError: () => {
      setErrorMessage(language === 'ar' ? 'كوبون خصم غير صالح' : 'Invalid coupon');
      setBillingResult(null);
      setGlobalCouponCode(null);
      setIsCouponApplied(false);
    },
  });

  useEffect(() => {
    if (appliedCouponCode && billingResult?.discountCode) {
      setCouponCode(appliedCouponCode);
      setIsCouponApplied(true);
    } else {
      setIsCouponApplied(false);
    }
  }, [appliedCouponCode, billingResult]);

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      applyCoupon({ discount: couponCode });
    }
  };

  const handleRemoveCoupon = () => {
    setGlobalCouponCode(null);
    setBillingResult(null);
    setCouponCode('');
    setErrorMessage(null);
    setIsCouponApplied(false);
    // Recalculate billing without coupon
    applyCoupon({});
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
              onClick={() => router.push('/cart')}
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
              {language === 'ar' ? 'كوبونات الخصم' : 'Discount Coupons'}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Discount Code Input */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder={language === 'ar' ? 'رمز الخصم' : 'Discount code'}
              className={cx(
                'w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors text-sm',
                (language === 'ar' && 'text-right pr-16') || 'pl-4 pr-24',
              )}
            />
            {isCouponApplied ? (
              <button
                onClick={handleRemoveCoupon}
                className={cx(
                  'absolute top-1.5 bottom-1.5 px-4 bg-red-500 text-white rounded-lg text-sm font-medium transition-colors hover:bg-red-600',
                  language === 'ar' ? 'left-1.5' : 'right-1.5',
                )}
              >
                {language === 'ar' ? 'إزالة' : 'Remove'}
              </button>
            ) : (
              <button
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim() || isPending}
                className={cx(
                  'absolute top-1.5 bottom-1.5 px-4 bg-orange-500 text-white rounded-lg text-sm font-medium transition-colors hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed',
                  language === 'ar' ? 'left-1.5' : 'right-1.5',
                )}
              >
                {isPending
                  ? language === 'ar'
                    ? 'جار التحقق...'
                    : 'Verifying...'
                  : language === 'ar'
                    ? 'تطبيق'
                    : 'Apply'}
              </button>
            )}
          </div>
          {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
          {isCouponApplied && !errorMessage && billingResult?.discountCode && (
            <p className="text-green-500 text-sm mt-2">
              {language === 'ar' ? 'تم تطبيق الكوبون بنجاح!' : 'Coupon applied successfully!'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponsPage;
