'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { cx } from '@/utils/styles';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useInfiniteOrderList } from '@/src/hooks/api/orders';
import { AxiosError } from 'axios';
import type { OrderDetails } from '@/src/hooks/api/orders/orders.api-types';
import { formatDate } from '@/utils/formatting';

const PAGE_SIZE = 5;

const statusMap = {
  open: { label: 'Open', color: 'text-black', icon: <span className="ml-1">🕒</span> },
  inprocess: { label: 'Inprocess', color: 'text-black', icon: <span className="ml-1">🕒</span> },
  ready: { label: 'Ready', color: 'text-black', icon: <span className="ml-1">🕒</span> },
  completed: {
    label: 'Delivered',
    color: 'text-green-600',
    icon: <span className="ml-1">✔️</span>,
  },
  cancelled: { label: 'Cancelled', color: 'text-red-500', icon: <span className="ml-1">⚠️</span> },
};

export default function OrdersPage() {
  const { customerData, token } = useUser();
  const router = useRouter();
  const { language } = useLanguage();
  const { theme } = useTheme();

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, error } =
    useInfiniteOrderList(customerData?._id || '', !!token && !!customerData?._id, PAGE_SIZE);

  const orders = data?.pages?.flatMap((page) => page.results) || [];

  const handleCancel = (orderId: string) => {
    router.push(`/order-success?_id=${orderId}`);
  };

  const handleOrderClick = (orderId: string) => {
    router.push(`/order-success?_id=${orderId}`);
  };

  // Infinite scroll: observe the sentinel div
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 1 },
    );
    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);
    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div
      className={cx(
        'min-h-screen flex flex-col bg-white dark:bg-[#1a1a1a] text-black dark:text-white',
        language === 'ar' && 'rtl',
      )}
    >
      {/* Profile-style Header at the very top, flush left/top */}
      <div className="bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800 w-full">
        <div className="px-4 py-4">
          <div className={cx('flex items-center gap-3', language === 'ar' && 'flex-row-reverse')}>
            <button
              onClick={() => router.push('/profile')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="text-gray-700 dark:text-gray-300"
                style={{
                  transform: language === 'ar' ? 'rotate(180deg)' : 'none',
                }}
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
              {language === 'ar' ? 'الطلبات السابقة' : 'Past Orders'}
            </h1>
          </div>
        </div>
      </div>
      <div className="w-full max-w-xl mt-8 px-4 flex-1">
        {orders.length === 0 && !isLoading && (
          <div className="flex flex-1 items-center justify-center min-h-[50vh]">
            <div
              className={cx(
                'rounded-2xl flex items-center justify-center min-h-[250px] min-w-[400px] max-w-md px-8 text-center',
                theme === 'dark'
                  ? 'bg-[#232323] border border-gray-700 text-gray-300'
                  : 'bg-gray-50 border border-gray-300 text-gray-600',
                'shadow-sm',
              )}
            >
              <span className="text-lg font-medium">
                {language === 'ar' ? 'لا توجد طلبات' : 'No Orders'}
              </span>
            </div>
          </div>
        )}
        {orders.map((order: OrderDetails) => {
          const status =
            statusMap[(order.orderStatus?.toLowerCase() ?? 'open') as keyof typeof statusMap] ||
            statusMap.open;
          return (
            <div
              key={order._id}
              className={cx(
                'rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#232323] mb-6 p-5 transition hover:border-gray-300 cursor-pointer',
                language === 'ar' && 'rtl',
              )}
              onClick={() => handleOrderClick(order._id)}
            >
              <div
                className={cx(
                  'flex justify-between items-center mb-1',
                  language === 'ar' && 'flex-row-reverse',
                )}
              >
                <div className="font-bold text-lg">
                  {order.company?.name || (language === 'ar' ? 'مطعم' : 'Restaurant')}
                </div>
                <div
                  className={cx(
                    'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
                    status.label === 'Cancelled'
                      ? 'bg-red-50 text-red-600'
                      : status.label === 'Delivered'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-gray-100 text-gray-600',
                  )}
                >
                  <span>{status.icon}</span>
                  <span>
                    {language === 'ar'
                      ? status.label === 'Open'
                        ? 'مفتوح'
                        : status.label === 'Inprocess'
                          ? 'قيد التحضير'
                          : status.label === 'Ready'
                            ? 'جاهز'
                            : status.label === 'Delivered'
                              ? 'تم التوصيل'
                              : status.label === 'Cancelled'
                                ? 'ملغي'
                                : status.label
                      : status.label}
                  </span>
                </div>
              </div>
              <div className={cx('text-gray-500 text-sm mb-2', language === 'ar' && 'text-right')}>
                {order.location?.address || ''}
              </div>
              <div
                className={cx(
                  'flex items-center justify-between mb-2',
                  language === 'ar' && 'flex-row-reverse',
                )}
              >
                <div className="text-xl font-semibold">
                  {order.currency} {order.payment?.total?.toFixed(2) || '--'}
                </div>
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  className={cx(language === 'ar' ? 'rotate-180' : '')}
                >
                  <path
                    d="M9 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className={cx('text-gray-400 text-xs mb-2', language === 'ar' && 'text-right')}>
                {formatDate(order.receivedAt)}
              </div>
              {(order.orderStatus === 'open' || order.orderStatus === 'inprocess') && (
                <div className="flex gap-4 mt-6">
                  <a
                    href={`tel:${order.location?.phone || ''}`}
                    className="flex-1 rounded-xl border border-green-500 text-green-600 font-semibold py-3 text-center bg-gray-50 dark:bg-[#232323] transition-colors"
                  >
                    {language === 'ar' ? 'اتصال' : 'Call'}
                  </a>
                  <button
                    className="flex-1 rounded-xl border border-red-500 text-red-600 font-semibold py-3 text-center bg-gray-50 dark:bg-[#232323] transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancel(order._id);
                    }}
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {error && (
          <div className="text-red-500 text-center my-4">
            {(error as AxiosError)?.message || String(error)}
          </div>
        )}
        {isLoading && (
          <div className="text-center my-4">
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </div>
        )}
        {/* Infinite scroll sentinel and loading spinner */}
        <div ref={sentinelRef} />
        {isFetchingNextPage && (
          <div className="text-center my-4">
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </div>
        )}
      </div>
    </div>
  );
}
