'use client';

import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cx } from '@/utils/styles';
import { useUpdateCustomer } from '@/src/hooks/api/customer';
import type { UserDoc, CustomerDoc } from '@/src/hooks/api/auth/auth.api-types';

interface FormData {
  name: string;
}

export default function PersonalDetailsPage() {
  const { user, customerData, token, setUserData } = useUser();
  const { language } = useLanguage();
  const router = useRouter();

  const updateCustomerMutation = useUpdateCustomer(user?.customerRef || '');

  const [formData, setFormData] = useState<FormData>({
    name: customerData?.name || user?.name || '',
  });
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (updateCustomerMutation.isSuccess && updateCustomerMutation.data) {
      if (
        updateCustomerMutation.data.acknowledged &&
        updateCustomerMutation.data.modifiedCount > 0
      ) {
        const updatedUser: UserDoc = { ...user!, name: formData.name };
        const updatedCustomer: CustomerDoc = { ...customerData!, name: formData.name };
        setUserData(updatedUser, updatedCustomer, token || '');
        router.push('/profile');
      }
    }

    if (updateCustomerMutation.isError) {
      setNameError(language === 'ar' ? 'فشل تحديث الاسم' : 'Failed to update name');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    updateCustomerMutation.isSuccess,
    updateCustomerMutation.isError,
    updateCustomerMutation.data,
    updateCustomerMutation.isPending,
  ]);

  const currentPhone = customerData?.phone || user?.phone || '';

  const handleSave = () => {
    setNameError('');
    if (formData.name.trim().length < 2) {
      setNameError(
        language === 'ar'
          ? 'يجب أن يتكون الاسم من حرفين على الأقل'
          : 'Name must be at least 2 characters',
      );
      return;
    }
    updateCustomerMutation.mutate({ name: formData.name });
  };

  const handleBackClick = () => {
    router.push('/profile');
  };

  return (
    <div className={cx('min-h-screen bg-gray-50 dark:bg-[#1a1a1a]', language === 'ar' && 'rtl')}>
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1a1a] shadow-sm">
        <div className="px-4 py-4">
          <div className={cx('flex items-center gap-3', language === 'ar' && 'flex-row-reverse')}>
            <button
              onClick={handleBackClick}
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
              {language === 'ar' ? 'التفاصيل الشخصية' : 'Personal Details'}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className={cx(
                'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2',
                language === 'ar' ? 'text-right' : 'text-left',
              )}
            >
              {language === 'ar' ? 'الاسم' : 'Name'}
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={cx(
                'w-full px-4 py-3 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all',
                language === 'ar' && 'text-right',
                nameError && 'border-red-500',
              )}
            />
            {nameError && <p className="mt-2 text-sm text-red-600">{nameError}</p>}
          </div>

          <div>
            <label
              htmlFor="phone"
              className={cx(
                'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2',
                language === 'ar' ? 'text-right' : 'text-left',
              )}
            >
              {language === 'ar' ? 'رقم الهاتف' : 'Phone'}
            </label>
            <input
              type="text"
              id="phone"
              value={currentPhone}
              disabled
              className="w-full px-4 py-3 bg-gray-100 dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Fixed Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-gray-800 px-4 py-6">
        <button
          onClick={handleSave}
          disabled={updateCustomerMutation.isPending}
          className="w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-200 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 shadow-lg disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {updateCustomerMutation.isPending
            ? language === 'ar'
              ? 'جار الحفظ...'
              : 'Saving...'
            : language === 'ar'
              ? 'حفظ التغييرات'
              : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
