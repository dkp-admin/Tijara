'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LoginModal } from '@/components/ui/LoginModal';
import { cx } from '@/utils/styles';
import { useUser } from '@/contexts/UserContext';
import { useCartStore } from '@/src/stores/cart-store';
import { useTopLoader } from 'nextjs-toploader';

export default function ProfilePage() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const router = useRouter();
  const loader = useTopLoader();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { token, clearUserData } = useUser();
  const { clearCart } = useCartStore();

  // Check if user is logged in
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setIsLoginModalOpen(true);
    }
  }, []);

  const handleLogin = () => {
    setIsLoginModalOpen(false);
  };

  const handleBackClick = () => {
    router.push('/');
  };

  const handleOrdersClick = async () => {
    loader.start();
    await router.push('/orders');
    loader.done();
  };

  const handleAddressesClick = async () => {
    loader.start();
    await router.push('/profile/addresses');
    loader.done();
  };

  const handleLogout = () => {
    clearUserData();
    clearCart();
    router.push('/');
  };

  return (
    <div className={cx('min-h-screen bg-white dark:bg-[#1a1a1a]', language === 'ar' && 'rtl')}>
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800">
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
              {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-3">
        {/* My Orders Card */}
        {token && (
          <div
            className={cx(
              'bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl border border-gray-100 dark:border-gray-700 py-3 px-4',
              language === 'ar' && 'rtl',
            )}
          >
            <button
              className={cx(
                'w-full focus:outline-none flex items-center justify-between',
                language === 'ar' ? 'flex-row-reverse' : 'text-left',
              )}
              onClick={handleOrdersClick}
            >
              <div className={cx(language === 'ar' ? 'text-right' : '')}>
                <h3 className="text-base font-semibold text-black dark:text-white">
                  {language === 'ar' ? 'طلباتي' : 'My Orders'}
                </h3>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {language === 'ar' ? 'افتح لعرض سجل الطلبات' : 'Open to view order history'}
                </div>
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="text-gray-400"
                style={
                  language === 'ar'
                    ? { marginLeft: 0, marginRight: 'auto' }
                    : { marginLeft: 'auto', marginRight: 0 }
                }
              >
                <path
                  d="M9 6L15 12L9 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Personal Details Navigation */}
        <div
          onClick={() => router.push('/profile/personal-details')}
          className={cx(
            'bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl border border-gray-100 dark:border-gray-700 py-3 px-4 cursor-pointer flex items-center justify-between',
            language === 'ar' && 'rtl',
          )}
        >
          <div className={cx(language === 'ar' ? 'text-right' : '')}>
            <h3 className="text-base font-semibold text-black dark:text-white">
              {language === 'ar' ? 'التفاصيل الشخصية' : 'Personal Details'}
            </h3>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {language === 'ar' ? 'عرض وتعديل التفاصيل الشخصية' : 'View and edit personal details'}
            </div>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="text-gray-400"
            style={
              language === 'ar'
                ? { marginLeft: 0, marginRight: 'auto' }
                : { marginLeft: 'auto', marginRight: 0 }
            }
          >
            <path
              d="M9 6L15 12L9 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Address Navigation */}
        <div
          onClick={handleAddressesClick}
          className={cx(
            'bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl border border-gray-100 dark:border-gray-700 py-3 px-4 cursor-pointer flex items-center justify-between',
            language === 'ar' && 'rtl',
          )}
        >
          <div className={cx(language === 'ar' ? 'text-right' : '')}>
            <h3 className="text-base font-semibold text-black dark:text-white">
              {language === 'ar' ? 'العناوين' : 'Address'}
            </h3>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {language === 'ar' ? 'إدارة عناوين التوصيل' : 'Manage delivery addresses'}
            </div>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="text-gray-400"
            style={
              language === 'ar'
                ? { marginLeft: 0, marginRight: 'auto' }
                : { marginLeft: 'auto', marginRight: 0 }
            }
          >
            <path
              d="M9 6L15 12L9 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Settings Section */}
        <div className="pt-4">
          <h3
            className={cx(
              'text-gray-600 dark:text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider',
              language === 'ar' && 'text-right',
            )}
          >
            {language === 'ar' ? 'الإعدادات' : 'Settings'}
          </h3>
          <div className="bg-transparent rounded-2xl shadow-sm overflow-hidden">
            {/* Language Settings */}
            <div
              onClick={() => router.push('/profile/language')}
              className={cx(
                'bg-gray-50 dark:bg-[#2a2a2a] p-5 flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-200 dark:border-gray-700',
                language === 'ar' && 'rtl',
              )}
            >
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {language === 'ar' ? 'اللغة' : 'Language'}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'ar' ? 'تغيير لغة التطبيق' : 'Change app language'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {language === 'ar' ? 'العربية' : 'English'}
                </span>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-gray-400 dark:text-gray-500"
                  style={{
                    transform: language === 'ar' ? 'rotate(180deg)' : 'none',
                  }}
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Theme Settings */}
            <div
              onClick={() => router.push('/profile/theme')}
              className={cx(
                'bg-gray-50 dark:bg-[#2a2a2a] p-5 flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-200 dark:border-gray-700',
                language === 'ar' && 'rtl',
              )}
            >
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {language === 'ar' ? 'المظهر' : 'Theme'}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'ar' ? 'تغيير مظهر التطبيق' : 'Change app theme'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {theme === 'dark'
                    ? language === 'ar'
                      ? 'داكن'
                      : 'Dark'
                    : language === 'ar'
                      ? 'فاتح'
                      : 'Light'}
                </span>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-gray-400 dark:text-gray-500"
                  style={{
                    transform: language === 'ar' ? 'rotate(180deg)' : 'none',
                  }}
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Logout Option */}
            {token && (
              <div
                onClick={handleLogout}
                className={cx(
                  'bg-gray-50 dark:bg-[#2a2a2a] p-5 flex justify-between items-center cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors',
                  language === 'ar' && 'rtl',
                )}
              >
                <div>
                  <h4 className="font-semibold text-red-600 dark:text-red-400">
                    {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'ar' ? 'تسجيل الخروج من الحساب' : 'Sign out of your account'}
                  </p>
                </div>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-red-500 dark:text-red-400"
                >
                  <path
                    d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 17L21 12L16 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21 12H9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}
