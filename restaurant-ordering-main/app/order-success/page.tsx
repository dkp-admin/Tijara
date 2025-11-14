'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { useCancelOrder, useOrderDetails, useRateOrder } from '@/src/hooks/api/orders';
import { formatDate } from '@/utils/formatting';
import { cx } from '@/utils/styles';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('_id');
  const { language } = useLanguage();
  const { token } = useUser();

  const {
    data: orderDetails,
    isLoading: loadingDetails,
    error: detailsError,
  } = useOrderDetails(orderId, {
    enabled: !!orderId && !!token,
  });

  const [packagingRating, setPackagingRating] = useState(0);
  const [foodQualityRating, setFoodQualityRating] = useState(0);
  const [comments, setComments] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  const {
    mutate: rateOrder,
    isPending: ratingLoading,
    isError: ratingError,
    isSuccess: ratingSuccess,
  } = useRateOrder(orderId!);

  const {
    mutate: cancelOrder,
    isPending: cancelling,
    isSuccess: isCancelled,
  } = useCancelOrder(orderId!);

  const handleSubmitRating = () => {
    if (!orderDetails) return;
    rateOrder({
      packagingRating,
      foodQualityRating,
      comments,
    });
  };

  const handleCancelOrder = () => {
    if (!orderDetails?.createdAt) return;
    cancelOrder({
      createdAt: orderDetails.createdAt,
      orderStatus: 'cancelled',
      cancelledBy: 'customer',
    });
    setShowCancelDialog(false);
  };

  return (
    <div
      className={cx(
        'min-h-screen bg-white dark:bg-[#1a1a1a] text-black dark:text-white',
        language === 'ar' && 'rtl',
      )}
    >
      {/* Profile-style Header at the very top */}
      <div className="bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800 w-full">
        <div className="px-4 py-4">
          <div className={cx('flex items-center gap-3', language === 'ar' && 'flex-row-reverse')}>
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              aria-label={language === 'ar' ? 'العودة' : 'Back'}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="text-gray-700 dark:text-gray-300"
                style={{ transform: language === 'ar' ? 'rotate(180deg)' : 'none' }}
              >
                <path
                  d="M19 12H5M12 19L5 12L12 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {language === 'ar' ? 'نجاح الطلب' : 'Order Success'}
            </h1>
          </div>
        </div>
      </div>

      <div className="w-full max-w-xl mx-auto flex-1 flex flex-col gap-8 py-8 px-4 sm:px-0">
        {/* Restaurant Details & Status Tracker or Cancelled */}
        {orderDetails && (
          <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
            <div className="text-lg font-bold mb-1 text-black dark:text-white">
              {orderDetails.company?.name || '--'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {orderDetails.location?.phone || ''}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 mb-2">
              {orderDetails.location?.address || '--'}
            </div>
            <hr className="my-3 border-gray-200 dark:border-gray-700" />
            <div>
              <div className="text-base font-semibold mb-4 text-black dark:text-white">
                {orderDetails.orderType === 'delivery' || orderDetails.orderType === 'Delivery'
                  ? language === 'ar'
                    ? 'طلب توصيل'
                    : 'Delivery Order'
                  : language === 'ar'
                    ? 'طلب استلام'
                    : 'Pickup Order'}
              </div>
              {orderDetails.orderStatus === 'cancelled' ? (
                <div className="flex items-center gap-2 text-red-600 font-medium text-base">
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M12 9v4m0 4h.01M21 19a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h7l7 7v9z"
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M17 17H7V7h5V3.5L21 12h-4v5z" fill="#fff" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-200 font-normal">
                    {language === 'ar' ? 'تم الإلغاء في' : 'Cancelled on'}{' '}
                    {formatDate(
                      (orderDetails.updatedAt ||
                        orderDetails.cancelledAt ||
                        orderDetails.createdAt) ??
                        '',
                      language,
                    )}
                  </span>
                </div>
              ) : (
                <>
                  {/* Status Tracker */}
                  {(() => {
                    const steps = [
                      {
                        key: 'open',
                        label: language === 'ar' ? 'تم تقديم الطلب' : 'Order Placed',
                        date: formatDate(orderDetails.receivedAt, language),
                        icon: (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-300">
                            <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                              <path
                                d="M5 10.5l3 3 7-7"
                                stroke="#166534"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        ),
                      },
                      {
                        key: 'inprocess',
                        label: language === 'ar' ? 'قيد التحضير' : 'Inprocess',
                        icon: (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-300">
                            <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                              <path
                                d="M5 10.5l3 3 7-7"
                                stroke="#166534"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        ),
                      },
                      {
                        key: 'ready',
                        label: language === 'ar' ? 'جاهز' : 'Ready',
                        icon: (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-300">
                            <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                              <path
                                d="M5 10.5l3 3 7-7"
                                stroke="#166534"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        ),
                        pendingIcon: (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-700">
                            <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                              <circle cx="10" cy="10" r="8" stroke="#fff" strokeWidth="2" />
                              <path
                                d="M10 5v5l3 3"
                                stroke="#fff"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </span>
                        ),
                      },
                      {
                        key: 'completed',
                        label: language === 'ar' ? 'اكتمل' : 'Completed',
                        icon: (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-300">
                            <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                              <path
                                d="M5 10.5l3 3 7-7"
                                stroke="#166534"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        ),
                        pendingIcon: (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 text-gray-500">
                            <span className="text-lg font-bold">4</span>
                          </span>
                        ),
                      },
                    ];
                    const statusMap: Record<string, number> = {
                      open: 0,
                      inprocess: 1,
                      ready: 2,
                      completed: 3,
                    };
                    const currentStep =
                      statusMap[(orderDetails.orderStatus || '').toLowerCase()] ?? 0;
                    return (
                      <div className="flex flex-col gap-0.5">
                        {steps.map((step, idx) => (
                          <div key={step.key} className="flex items-start gap-3 relative mb-2">
                            <div className="flex flex-col items-center">
                              {idx < currentStep ? (
                                step.icon
                              ) : idx === currentStep ? (
                                step.key === 'ready' && step.pendingIcon ? (
                                  step.pendingIcon
                                ) : step.key === 'completed' && step.icon ? (
                                  step.icon
                                ) : (
                                  step.icon
                                )
                              ) : step.key === 'completed' && step.pendingIcon ? (
                                step.pendingIcon
                              ) : (
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 text-gray-500">
                                  <span className="text-lg font-bold">{idx + 1}</span>
                                </span>
                              )}
                              {idx < steps.length - 1 && (
                                <div className="absolute top-8 bottom-0 w-0.5 bg-gray-300" />
                              )}
                            </div>
                            <div
                              className={cx(
                                'flex-1',
                                idx === currentStep &&
                                  'font-semibold text-green-900 dark:text-green-300',
                              )}
                            >
                              <div className="text-base text-black dark:text-white">
                                {step.label}
                              </div>
                              {step.date && idx === 0 && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {step.date}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                  {/* Call Button */}
                  {orderDetails.location?.phone && (
                    <a
                      href={`tel:${orderDetails.location.phone}`}
                      className="mt-4 block w-full rounded-xl bg-gray-50 dark:bg-[#2a2a2a] text-green-600 border border-green-500 font-semibold py-3 text-center transition-colors"
                    >
                      <span className="inline-flex items-center gap-2 justify-center">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                          <path
                            d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.08 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72c.13 1.05.37 2.07.73 3.06a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c.99.36 2.01.6 3.06.73A2 2 0 0 1 22 16.92z"
                            stroke="#16a34a"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {language === 'ar' ? 'اتصل بالمطعم' : 'Call Restaurant'}
                      </span>
                    </a>
                  )}
                  {/* Cancel Order Button */}
                  {!isCancelled &&
                    (orderDetails.orderStatus === 'open' ||
                      orderDetails.orderStatus === 'inprocess') && (
                      <button
                        ref={cancelBtnRef}
                        className="mt-4 w-full rounded-xl border border-red-400 text-red-500 font-semibold py-3 text-center bg-gray-50 dark:bg-[#2a2a2a]"
                        onClick={() => setShowCancelDialog(true)}
                        disabled={cancelling}
                      >
                        {language === 'ar' ? 'إلغاء الطلب' : 'Cancel Order'}
                      </button>
                    )}
                  {isCancelled && (
                    <div className="mt-4 w-full rounded-xl border border-red-400 text-red-500 font-semibold py-2 text-center bg-red-50">
                      {language === 'ar' ? 'تم إلغاء الطلب' : 'Order Cancelled'}
                    </div>
                  )}
                  {/* Cancel Confirmation Dialog */}
                  {showCancelDialog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                      <div className="bg-white dark:bg-[#232323] rounded-2xl shadow-lg p-6 w-full max-w-sm mx-4">
                        <h3 className="text-lg font-bold text-black dark:text-white">
                          {language === 'ar' ? 'تأكيد الإلغاء' : 'Confirm Cancellation'}
                        </h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                          {language === 'ar'
                            ? 'هل أنت متأكد أنك تريد إلغاء هذا الطلب؟'
                            : 'Are you sure you want to cancel this order?'}
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                          <button
                            className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            onClick={() => setShowCancelDialog(false)}
                          >
                            {language === 'ar' ? 'تراجع' : 'Go Back'}
                          </button>
                          <button
                            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                            onClick={handleCancelOrder}
                          >
                            {language === 'ar' ? 'إلغاء الطلب' : 'Cancel Order'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Order Details Card */}
        <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
          <div className="text-xl font-bold mb-3 text-black dark:text-white">
            {language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
          </div>
          <hr className="mb-4 border-gray-200 dark:border-gray-700" />
          {loadingDetails ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-300">
              {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : detailsError ? (
            <div className="text-center py-8 text-red-500">{detailsError.message}</div>
          ) : orderDetails ? (
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-base">
              <div className="text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'رقم الطلب' : 'Order Number'}
              </div>
              <div className="text-right font-medium text-black dark:text-white">
                {orderDetails.orderNum}
              </div>

              <div className="text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'رقم الإيصال' : 'Token Number'}
              </div>
              <div className="text-right font-medium text-black dark:text-white">
                {orderDetails.tokenNumber}
              </div>

              <div className="text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'تاريخ الطلب' : 'Order Date'}
              </div>
              <div className="text-right font-medium text-black dark:text-white">
                {formatDate(orderDetails.receivedAt, language)}
              </div>

              <div className="text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'الاسم' : 'Name'}
              </div>
              <div className="text-right font-medium text-black dark:text-white">
                {orderDetails.customer?.name || '--'}
              </div>

              <div className="text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'رقم الهاتف' : 'Phone'}
              </div>
              <div className="text-right font-medium text-black dark:text-white">
                {orderDetails.customer?.phone || '--'}
              </div>

              {orderDetails.customer?.address?.fullAddress && (
                <>
                  <div className="text-gray-600 dark:text-gray-400">
                    {language === 'ar' ? 'العنوان' : 'Address'}
                  </div>
                  <div className="text-right font-medium text-black dark:text-white">
                    {orderDetails.customer.address.fullAddress}
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>

        {/* Summary Card */}
        {orderDetails && (
          <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
            <div className="text-xl font-bold mb-4 text-black dark:text-white">
              {language === 'ar' ? 'ملخص الطلب' : 'Summary'}
            </div>
            <div className="space-y-3">
              {orderDetails.items?.map((item, index) => {
                const isItemFree = item.isFree === true;
                const isItemDiscounted = item.isQtyFree === true;
                const originalPrice = item.billing?.total || 0;
                const finalPrice = item.billing?.total - item?.billing?.discountAmount || 0;

                return (
                  <div
                    key={index}
                    className={`flex justify-between items-center ${isItemFree || isItemDiscounted ? (isItemFree ? 'bg-green-50 dark:bg-green-900/20' : 'bg-orange-50 dark:bg-orange-900/20') + ' rounded-lg p-2' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`font-bold ${isItemFree ? 'text-green-500' : isItemDiscounted ? 'text-orange-500' : 'text-orange-500'}`}
                      >
                        {item.quantity}x
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-black dark:text-white">
                            {item.name?.[language] || item.name?.en}
                          </span>
                          {isItemFree && (
                            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                              {language === 'ar' ? 'مجاني' : 'FREE'}
                            </span>
                          )}
                          {isItemDiscounted && (
                            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                              {language === 'ar' ? 'خصم' : 'DISCOUNT'}
                            </span>
                          )}
                        </div>
                        {/* Variant Name - only show if item has multiple variants */}
                        {item.hasMultipleVariants && item.variant?.name && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {item.variant.name[language] || item.variant.name.en}
                          </div>
                        )}
                        {/* Modifiers */}
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            {item.modifiers.map((modifier) => modifier.optionName).join(' • ')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(isItemFree || isItemDiscounted) && originalPrice > 0 && (
                        <span className="text-gray-400 dark:text-gray-500 font-medium text-sm line-through">
                          {orderDetails.currency || 'SAR'} {originalPrice.toFixed(2)}
                        </span>
                      )}
                      <div
                        className={`font-medium ${isItemFree ? 'text-green-600 dark:text-green-400' : isItemDiscounted ? 'text-orange-600 dark:text-orange-400' : 'text-black dark:text-white'}`}
                      >
                        {isItemFree
                          ? language === 'ar'
                            ? 'مجاني'
                            : 'FREE'
                          : isItemDiscounted
                            ? `${orderDetails.currency || 'SAR'} ${finalPrice.toFixed(2)}`
                            : `${orderDetails.currency || 'SAR'} ${finalPrice.toFixed(2)}`}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Free/Discounted Items from freeItems array */}
              {orderDetails.freeItems?.map((freeItem, index) => {
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
                const priceTextColor = isActuallyFree
                  ? 'text-green-600 dark:text-green-400'
                  : isDiscounted
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-gray-600 dark:text-gray-400';

                return (
                  <div
                    key={`free-${index}`}
                    className={`flex justify-between items-center ${bgColor} rounded-lg p-2`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`font-bold ${isActuallyFree ? 'text-green-500' : 'text-orange-500'}`}
                      >
                        {freeItem.qty}x
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-black dark:text-white">
                            {freeItem.name?.[language] || freeItem.name?.en}
                          </span>
                          <span
                            className={`${badgeColor} text-white text-xs px-2 py-0.5 rounded-full font-medium`}
                          >
                            {badgeText}
                          </span>
                        </div>
                        {/* Variant Name for Free Items - only show if item has multiple variants */}
                        {freeItem.multiVariants &&
                          freeItem.variants &&
                          freeItem.variants.length > 0 &&
                          freeItem.variants[0].name && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {freeItem.variants[0].name[language] || freeItem.variants[0].name.en}
                            </div>
                          )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(isActuallyFree || isDiscounted) && originalPrice > 0 && (
                        <span className="text-gray-400 dark:text-gray-500 font-medium text-sm line-through">
                          {orderDetails.currency || 'SAR'} {originalPrice.toFixed(2)}
                        </span>
                      )}
                      <div className={`font-medium ${priceTextColor}`}>
                        {isActuallyFree
                          ? language === 'ar'
                            ? 'مجاني'
                            : 'FREE'
                          : isDiscounted
                            ? `${orderDetails.currency || 'SAR'} ${discountedPrice.toFixed(2)}`
                            : `${orderDetails.currency || 'SAR'} ${discountedPrice.toFixed(2)}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <hr className="my-4 border-gray-200 dark:border-gray-700" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'إجمالي العناصر' : 'Item Total'}
                </span>
                <span className="font-medium text-black dark:text-white">
                  {orderDetails.currency || 'SAR'}{' '}
                  {orderDetails.payment?.subTotalWithoutDiscount?.toFixed(2) ||
                    orderDetails.payment?.subTotal?.toFixed(2) ||
                    '0.00'}
                </span>
              </div>
              {orderDetails.payment?.discountAmount !== undefined &&
                orderDetails.payment.discountAmount > 0 && (
                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        {language === 'ar' ? 'الخصم' : 'Discount'}
                      </span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        - {orderDetails.currency || 'SAR'}{' '}
                        {orderDetails.payment.discountAmount.toFixed(2)}
                      </span>
                    </div>
                    {orderDetails.payment?.discountCode && (
                      <span className="text-xs text-red-500 font-semibold ml-auto">
                        {orderDetails.payment.discountCode}
                      </span>
                    )}
                  </div>
                )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}
                </span>
                <span className="font-medium text-black dark:text-white">
                  {orderDetails.currency || 'SAR'}{' '}
                  {orderDetails.payment?.subTotal?.toFixed(2) || '0.00'}
                </span>
              </div>
              {orderDetails.payment?.charges && orderDetails.payment.charges.length > 0 && (
                <>
                  {orderDetails.payment.charges.map((charge, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        {charge.name?.[language] || charge.name?.en || 'Service Charge'}
                      </span>
                      <span className="font-medium text-black dark:text-white">
                        {`+ ${orderDetails?.currency || 'SAR'} ${(charge?.total - charge?.vat)?.toFixed(2)}`}
                      </span>
                    </div>
                  ))}
                </>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'الضريبة' : 'Taxes'}
                </span>
                <span className="font-medium text-black dark:text-white">
                  + {orderDetails.currency || 'SAR'}{' '}
                  {orderDetails.payment?.vatAmount?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
            <hr className="my-4 border-gray-200 dark:border-gray-700" />
            <div className="flex justify-between text-xl font-bold text-black dark:text-white">
              <span>{language === 'ar' ? 'الإجمالي' : 'Total'}</span>
              <span>
                {orderDetails.currency || 'SAR'} {orderDetails.payment?.total?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        )}

        {/* Rate Order Card */}
        {orderDetails &&
          orderDetails.orderStatus === 'completed' &&
          !orderDetails.rating?.foodQualityRating && (
            <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
              <h3 className="text-xl font-bold text-black dark:text-white mb-4">
                {language === 'ar' ? 'تقييم الطلب' : 'Rate Your Order'}
              </h3>
              {ratingSuccess ? (
                <div className="text-center py-6 text-green-600 font-semibold">
                  {language === 'ar' ? 'شكراً لتقييمك!' : 'Thank you for your feedback!'}
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'جودة التغليف' : 'Packaging Quality'}
                    </label>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setPackagingRating(star)}
                          className={`text-4xl transition-colors ${packagingRating >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'جودة الطعام' : 'Food Quality'}
                    </label>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setFoodQualityRating(star)}
                          className={`text-4xl transition-colors ${foodQualityRating >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="comments"
                      className="block text-base font-medium text-gray-700 dark:text-gray-300"
                    >
                      {language === 'ar' ? 'تعليقات' : 'Comments'}
                    </label>
                    <textarea
                      id="comments"
                      rows={3}
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm text-black dark:text-white p-2"
                    />
                  </div>
                  {ratingError && (
                    <p className="text-sm text-red-600">
                      {language === 'ar'
                        ? 'فشل في إرسال التقييم. يرجى المحاولة مرة أخرى.'
                        : 'Failed to submit rating. Please try again.'}
                    </p>
                  )}
                  <button
                    onClick={handleSubmitRating}
                    disabled={ratingLoading}
                    className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 text-center transition-colors shadow-lg disabled:bg-orange-300"
                  >
                    {ratingLoading
                      ? language === 'ar'
                        ? 'جارٍ الإرسال...'
                        : 'Submitting...'
                      : language === 'ar'
                        ? 'إرسال التقييم'
                        : 'Submit Rating'}
                  </button>
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
}
