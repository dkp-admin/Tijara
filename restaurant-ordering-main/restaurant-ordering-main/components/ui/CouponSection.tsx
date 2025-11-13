'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/src/stores/cart-store';

export function CouponSection() {
  const router = useRouter();
  const { billingResult } = useCartStore();

  const handleApplyClick = () => {
    router.push('/cart/coupons');
  };

  // Only show coupon as applied if it exists in the billing result
  const isCouponApplied = billingResult?.discountCode && billingResult?.discount > 0;
  // Only show discount code if it was successfully applied
  const displayCouponCode = isCouponApplied ? billingResult.discountCode : null;

  return (
    <div className="mt-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-xl border border-gray-100 dark:border-gray-700 p-4">
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3 uppercase">
        Savings Corner
      </h3>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF4201] rounded-lg flex items-center justify-center">
            <Image src="/assets/coupon.svg" alt="Coupon" width={20} height={20} />
          </div>
          <div>
            {isCouponApplied ? (
              <>
                <div className="text-gray-900 dark:text-white text-base font-medium">
                  Coupon Applied
                </div>
                <div className="text-green-500 dark:text-green-400 text-sm font-bold">
                  {displayCouponCode?.toUpperCase()}
                </div>
              </>
            ) : (
              <>
                <div className="text-gray-900 dark:text-white text-base font-medium">
                  Apply Coupon
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-sm">No coupon applied</div>
              </>
            )}
          </div>
        </div>

        <button
          onClick={handleApplyClick}
          className="bg-transparent border border-[#FF4201] text-[#FF4201] px-5 py-1.5 rounded-full text-sm font-medium hover:bg-[#FF4201] hover:text-white transition-colors"
        >
          {isCouponApplied ? 'Change' : 'Apply'}
        </button>
      </div>
    </div>
  );
}
