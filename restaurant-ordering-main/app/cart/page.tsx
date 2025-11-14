'use client';

import { useCartStore } from '@/src/stores/cart-store';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { CouponSection } from '@/components/ui/CouponSection';
import { CartItemsList } from '@/components/ui/CartItemsList';
import { NoResults } from '@/components/ui/NoResults';
import { LoginModal } from '@/components/ui/LoginModal';
import { cx } from '@/utils/styles';
import { useCalculateBilling } from '@/src/hooks/api/billing';
import { useOrderType } from '@/contexts/OrderTypeContext';
import { useUserAddresses } from '@/src/hooks/useUserAddresses';
import { BillingDetailsSkeletonSection } from '@/components/skeleton/BillingDetailsSkeletonSection';
import { usePlaceOrder } from '@/src/hooks/api/orders';
import { useTopLoader } from 'nextjs-toploader';

export default function CartPage() {
  const {
    items,
    billingResult,
    couponCode,
    specialInstructions,
    setSpecialInstructions,
    setBillingResult,
  } = useCartStore();
  const { language } = useLanguage();
  const { user, customerData, token } = useUser();
  const { mutate: calculateBilling, isPending: isBillingLoading } = useCalculateBilling({
    onSuccess: (data) => {
      setBillingResult(data);
    },
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { addresses, selectedAddressId } = useUserAddresses();
  const selectedAddress =
    addresses.find((a) => a._id === selectedAddressId) ||
    (addresses.length > 0 ? addresses[0] : null);
  const {
    mutate: placeOrder,
    isPending: isCheckoutPending,
    isSuccess: isOrderPlaced,
    data: orderResponse,
  } = usePlaceOrder({
    onError: () => {
      alert('Failed to place order.');
    },
  });
  const [showInstructionsInput, setShowInstructionsInput] = useState(false);
  const instructionsRef = useRef<HTMLTextAreaElement>(null);
  const { orderType } = useOrderType();
  const loader = useTopLoader();

  useEffect(() => {
    if (isOrderPlaced && orderResponse) {
      const orderId = orderResponse?._id;
      if (orderId) {
        router.push(`/order-success?_id=${orderId}`);
      } else {
        router.push('/order-success');
      }
    }
  }, [isOrderPlaced, orderResponse, router]);

  // Clean up URL parameters when coming back from add-address
  useEffect(() => {
    const addressFromParams = searchParams.get('address');
    const shouldOpenEdit = searchParams.get('editPersonalDetails');

    if (addressFromParams && shouldOpenEdit === 'true') {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const freeItems = billingResult?.freeItems || [];

  const currency = items[0]?.currency || 'SAR';

  const isAuthenticated = !!(customerData?.phone || user?.phone);

  useEffect(() => {
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    const customerRef = customerData?._id || user?.customerRef;
    if (!customerRef || items.length === 0) {
      return;
    }

    calculateBilling({
      discount: couponCode || undefined,
    });
  }, [token, items, customerData, user, couponCode, calculateBilling]);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (isCheckoutPending) return;
    loader.start();
    try {
      await placeOrder();
    } finally {
      loader.done();
    }
  };

  const handleLogin = () => {
    setShowLoginModal(false);
  };

  return (
    <div
      className={cx(
        'min-h-screen flex flex-col bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white',
        language === 'ar' && 'rtl',
      )}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800 z-10">
        <div className="p-6">
          <div
            className={cx(
              'flex items-center justify-between mb-4',
              language === 'ar' && 'flex-row-reverse',
            )}
          >
            <div className={cx('flex items-center gap-4', language === 'ar' && 'flex-row-reverse')}>
              <button
                onClick={() => router.push('/')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-2xl"
              >
                {language === 'ar' ? '→' : '←'}
              </button>
              <h1
                className={cx(
                  'text-2xl font-bold text-gray-900 dark:text-white',
                  language === 'ar' && 'text-right',
                )}
              >
                {language === 'ar' ? 'السلة' : 'Cart'}
              </h1>
            </div>
          </div>

          {/* Items count header */}
          <div
            className={cx(
              'flex items-center justify-between',
              language === 'ar' && 'flex-row-reverse',
            )}
          >
            <h2
              className={cx(
                'text-xl font-semibold text-gray-900 dark:text-white',
                language === 'ar' && 'text-right',
              )}
            >
              {language === 'ar' ? 'العناصر' : 'Items'}
            </h2>
            <span className="text-orange-500 text-lg font-bold">{totalItems}</span>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 pb-40">
          {items.length === 0 ? (
            <div className="pt-16">
              <NoResults language={language} />
            </div>
          ) : (
            <>
              {/* Items Section */}
              <div className="max-w-md mx-auto bg-gray-50 dark:bg-[#2a2a2a] rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-4">
                <CartItemsList />
              </div>

              {/* Special Instructions Section */}
              <div className="max-w-md mx-auto bg-gray-50 dark:bg-[#2a2a2a] rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-4">
                <div>
                  <span className="text-gray-700 dark:text-gray-200 font-medium text-base">
                    {language === 'ar' ? 'تعليمات خاصة' : 'Special Instructions'}
                  </span>
                  {showInstructionsInput ? (
                    <div className="mt-2">
                      <textarea
                        ref={instructionsRef}
                        className={cx(
                          'w-full bg-transparent border-none outline-none resize-none text-black dark:text-white text-sm rounded-xl p-2 transition-all',
                        )}
                        rows={2}
                        maxLength={200}
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        placeholder={
                          language === 'ar'
                            ? 'اكتب تعليماتك هنا (بحد أقصى 200 حرف)'
                            : 'Write your instructions here (max 200 characters)'
                        }
                      />
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400">
                          {specialInstructions.length}/200
                        </span>
                      </div>
                      <div className="flex justify-end mt-2">
                        <button
                          className="bg-[#FF4201] text-white px-5 py-1.5 rounded-full text-sm font-medium hover:bg-[#ff6a1a] transition-colors"
                          onClick={() => setShowInstructionsInput(false)}
                          type="button"
                        >
                          {language === 'ar' ? 'حفظ' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : specialInstructions ? (
                    <div
                      className="mt-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer"
                      onClick={() => setShowInstructionsInput(true)}
                    >
                      {specialInstructions}
                    </div>
                  ) : (
                    <div
                      className="mt-2 text-sm text-gray-400 cursor-pointer"
                      onClick={() => setShowInstructionsInput(true)}
                    >
                      {language === 'ar'
                        ? 'اكتب تعليماتك هنا (بحد أقصى 200 حرف)'
                        : 'Write your instructions here (max 200 characters)'}
                    </div>
                  )}
                </div>
              </div>

              {/* Coupons Section */}
              <div className="max-w-md mx-auto mb-4">
                <CouponSection />
              </div>

              {/* Billing Details Card */}
              <div className="max-w-md mx-auto bg-gray-50 dark:bg-[#2a2a2a] rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <h2 className="text-xl font-bold mb-4 text-black dark:text-white">
                  {language === 'ar' ? 'تفاصيل الفاتورة' : 'Billing Details'}
                </h2>
                {isBillingLoading && !billingResult ? (
                  <BillingDetailsSkeletonSection />
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        {language === 'ar' ? 'إجمالي العناصر' : 'Item Total'}
                      </span>
                      <span className="text-black dark:text-white font-medium">
                        {billingResult?.subTotalWithoutDiscount !== undefined
                          ? `${currency} ${Number(billingResult.subTotalWithoutDiscount).toFixed(
                              2,
                            )}`
                          : '--'}
                      </span>
                    </div>
                    {billingResult?.discount !== undefined &&
                      billingResult.discount > 0 &&
                      billingResult.discountCode && (
                        <div className="flex flex-col gap-0.5">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">
                              {language === 'ar' ? 'الخصم' : 'Discount'}
                            </span>
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              - {currency} {Number(billingResult.discount).toFixed(2)}
                            </span>
                          </div>
                          <span className="text-xs text-red-500 font-semibold ml-auto">
                            {billingResult.discountCode}
                          </span>
                        </div>
                      )}
                    {freeItems.length > 0 && (
                      <div className="flex flex-col gap-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {language === 'ar' ? 'عناصر مجانية ومخفضة' : 'Free & Discounted Items'}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {freeItems.reduce((total, item) => total + item.qty, 0)}{' '}
                            {language === 'ar' ? 'عنصر' : 'items'}
                          </span>
                        </div>
                        {freeItems.map((item) => {
                          const originalPrice = item.variants?.[0]?.price || 0;
                          const discountedPrice = item.total || 0;
                          const isActuallyFree = item.isFree === true;
                          const isDiscounted = item.isQtyFree === true;
                          const textColor = isActuallyFree
                            ? 'text-green-600 dark:text-green-400'
                            : isDiscounted
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-gray-600 dark:text-gray-400';

                          return (
                            <div
                              key={item._id}
                              className="flex justify-between items-center text-sm"
                            >
                              <span className={textColor}>
                                {item.name[language]} x{item.qty}
                                <span
                                  className={`ml-2 text-xs px-2 py-0.5 rounded-full ${isActuallyFree ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300' : isDiscounted ? 'bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}
                                >
                                  {isActuallyFree
                                    ? language === 'ar'
                                      ? 'مجاني'
                                      : 'FREE'
                                    : isDiscounted
                                      ? language === 'ar'
                                        ? 'خصم'
                                        : 'DISCOUNT'
                                      : language === 'ar'
                                        ? 'عرض'
                                        : 'PROMO'}
                                </span>
                              </span>
                              <div className="flex items-center gap-2">
                                {(isActuallyFree || isDiscounted) && originalPrice > 0 && (
                                  <span className="text-gray-400 dark:text-gray-500 text-xs line-through">
                                    {currency} {originalPrice.toFixed(2)}
                                  </span>
                                )}
                                {isActuallyFree ? (
                                  <span className={`${textColor} font-medium`}>
                                    {language === 'ar' ? 'مجاني' : 'FREE'}
                                  </span>
                                ) : isDiscounted ? (
                                  <span className={`${textColor} font-medium`}>
                                    {currency} {discountedPrice.toFixed(2)}
                                  </span>
                                ) : (
                                  <span className={`${textColor} font-medium`}>
                                    {currency} {discountedPrice.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        {language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}
                      </span>
                      <span className="text-black dark:text-white font-medium">
                        {billingResult?.subTotal !== undefined
                          ? `${currency} ${Number(billingResult.subTotal).toFixed(2)}`
                          : '--'}
                      </span>
                    </div>
                    {billingResult?.appliedCharges && billingResult.appliedCharges.length > 0 && (
                      <>
                        {billingResult.appliedCharges.map((charge, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              {charge.name?.[language] || charge.name?.en || 'Service Charge'}
                            </span>
                            <span className="text-black dark:text-white font-medium">
                              {`+ ${currency} ${(charge?.total - charge?.vat)?.toFixed(2)}`}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        {language === 'ar' ? 'الضريبة' : 'Taxes'}
                      </span>
                      <span className="text-black dark:text-white font-medium">
                        + {currency}{' '}
                        {billingResult?.vatAmount !== undefined
                          ? Number(billingResult.vatAmount).toFixed(2)
                          : '--'}
                      </span>
                    </div>
                    <hr className="my-2 border-gray-200 dark:border-gray-700" />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-lg font-bold text-black dark:text-white">
                        {language === 'ar' ? 'المبلغ المستحق' : 'To Pay'}
                      </span>
                      <span className="text-lg font-bold text-black dark:text-white">
                        {billingResult?.total !== undefined
                          ? `${currency} ${Number(billingResult.total).toFixed(2)}`
                          : '--'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          <div className="pb-32" />
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] p-4">
        <div className="space-y-3 max-w-md mx-auto">
          {/* Address Display for Delivery Mode */}
          {orderType === 'delivery' && (
            <div
              className={`w-full flex items-center justify-between gap-2 rounded-md px-3 py-2 bg-white/60 dark:bg-[#232323]/60 border shadow-sm min-w-0 ${
                !selectedAddress ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-black dark:text-white">
                  {language === 'ar' ? 'التوصيل إلى:' : 'Delivering to:'}
                </span>
                <span
                  className={
                    selectedAddress
                      ? 'truncate max-w-[180px] text-xs font-normal text-gray-700 dark:text-gray-200'
                      : 'text-xs font-normal text-red-500'
                  }
                  title={selectedAddress ? selectedAddress.fullAddress : ''}
                >
                  {selectedAddress
                    ? selectedAddress.fullAddress
                    : language === 'ar'
                      ? 'العنوان مطلوب'
                      : 'Address required'}
                </span>
              </div>
              <button
                onClick={() => router.push('/profile?showAddresses=true')}
                className="text-sm font-semibold text-orange-500 hover:underline"
              >
                {language === 'ar' ? 'تغيير' : 'Change'}
              </button>
            </div>
          )}

          {/* Add Name Button (if user is logged in and has no name) */}
          {isAuthenticated && !(customerData?.name || user?.name) && (
            <div className="flex justify-start px-1 py-2">
              <button
                onClick={() => router.push('/profile/personal-details')}
                className="text-orange-500 hover:text-orange-400 dark:hover:text-orange-300 text-sm font-medium transition-colors flex items-center gap-1"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 5V19M5 12H19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {language === 'ar' ? 'إضافة الاسم' : 'Add Name'}
                <span className="text-red-500 ml-1">*</span>
              </button>
            </div>
          )}

          {/* Payment Method and Checkout */}
          <div className="flex items-center gap-4">
            {/* Payment Method Display */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-lg">💵</span>
              </div>
              <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                {orderType === 'pickup'
                  ? language === 'ar'
                    ? 'الدفع عند الكاونتر'
                    : 'Pay at Counter'
                  : language === 'ar'
                    ? 'الدفع عند الاستلام'
                    : 'Cash on Delivery'}
              </span>
            </div>

            {/* Main Button */}
            <button
              className={cx(
                'flex-1 font-semibold py-3 px-6 rounded-xl transition-colors',
                'bg-[#f97315] hover:bg-[#f97315]/90 text-white',
                (isBillingLoading ||
                  isCheckoutPending ||
                  (isAuthenticated && !(customerData?.name || user?.name)) ||
                  (orderType === 'delivery' && !selectedAddress) ||
                  items.length === 0) &&
                  'opacity-60 cursor-not-allowed',
                'flex items-center justify-between',
              )}
              disabled={
                isBillingLoading ||
                isCheckoutPending ||
                (isAuthenticated && !(customerData?.name || user?.name)) ||
                (orderType === 'delivery' && !selectedAddress) ||
                items.length === 0
              }
              onClick={handleCheckout}
              title={
                isAuthenticated && !(customerData?.name || user?.name)
                  ? language === 'ar'
                    ? 'يرجى إضافة الاسم للمتابعة'
                    : 'Please add your name to proceed'
                  : orderType === 'delivery' && !selectedAddress
                    ? language === 'ar'
                      ? 'يرجى إضافة عنوان للتوصيل'
                      : 'Please add a delivery address'
                    : ''
              }
            >
              <span>
                {isBillingLoading
                  ? language === 'ar'
                    ? 'جارٍ الحساب...'
                    : 'Calculating...'
                  : language === 'ar'
                    ? 'الدفع'
                    : 'Checkout'}
              </span>
              {isCheckoutPending && (
                <span className="ml-2 flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                </span>
              )}
              <span>
                {items.length > 0 && currency}{' '}
                {items.length > 0 && billingResult?.total !== undefined
                  ? Number(billingResult.total).toFixed(2)
                  : '--'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}
