'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { cx } from '@/utils/styles';

export default function ThemePage() {
  const { theme, setTheme } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();

  // No navigation after selection
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };

  const handleBackClick = () => {
    router.push('/profile');
  };

  return (
    <div className={cx('min-h-screen bg-white dark:bg-[#1a1a1a]', language === 'ar' && 'rtl')}>
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800 shadow-sm">
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
              {language === 'ar' ? 'المظهر' : 'Theme'}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <div className="space-y-3">
          <button
            onClick={() => handleThemeChange('light')}
            className={cx(
              'w-full text-left px-4 py-3 rounded-2xl transition-colors flex items-center justify-between border',
              'bg-gray-50 dark:bg-[#2a2a2a]',
              theme === 'light'
                ? 'border-green-500 text-green-600 dark:text-green-400 font-semibold'
                : 'border-transparent text-gray-900 dark:text-white',
            )}
            style={{ background: theme === 'light' ? '' : undefined }}
          >
            <span>{language === 'ar' ? 'فاتح' : 'Light'}</span>
            {theme === 'light' && (
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                className="text-green-600 dark:text-green-400"
              >
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          <button
            onClick={() => handleThemeChange('dark')}
            className={cx(
              'w-full text-left px-4 py-3 rounded-2xl transition-colors flex items-center justify-between border',
              'bg-gray-50 dark:bg-[#2a2a2a]',
              theme === 'dark'
                ? 'border-green-500 text-green-600 dark:text-green-400 font-semibold'
                : 'border-transparent text-gray-900 dark:text-white',
            )}
            style={{ background: theme === 'dark' ? '' : undefined }}
          >
            <span>{language === 'ar' ? 'داكن' : 'Dark'}</span>
            {theme === 'dark' && (
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                className="text-green-600 dark:text-green-400"
              >
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
