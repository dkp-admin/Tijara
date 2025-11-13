'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cx } from '@/utils/styles';

interface MenuConfigErrorProps {
  error?: string;
  onRetry?: () => void;
}

export function MenuConfigError({ error, onRetry }: MenuConfigErrorProps) {
  const { language } = useLanguage();
  const { theme } = useTheme();

  const title = language === 'ar' ? 'خطأ في التكوين' : 'Configuration Error';
  const defaultMessage =
    language === 'ar'
      ? 'حدث خطأ أثناء تحميل إعدادات المطعم. يرجى المحاولة مرة أخرى.'
      : 'An error occurred while loading restaurant configuration. Please try again.';
  const retryText = language === 'ar' ? 'إعادة المحاولة' : 'Retry';

  return (
    <div
      className={cx(
        'flex flex-col items-center justify-center min-h-screen px-4',
        theme === 'dark' ? 'bg-background-dark text-white' : 'bg-white text-gray-900',
      )}
    >
      <div
        className={cx(
          'text-center max-w-md mx-auto p-6 rounded-lg border',
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200',
        )}
      >
        {/* Error Icon */}
        <div className="mb-4">
          <svg
            className="w-16 h-16 mx-auto text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-bold mb-3">{title}</h2>
        <p className={cx('mb-6 text-sm', theme === 'dark' ? 'text-gray-300' : 'text-gray-600')}>
          {error || defaultMessage}
        </p>

        {onRetry && (
          <button
            onClick={onRetry}
            className={cx(
              'px-6 py-2 rounded-lg font-medium transition-colors',
              'bg-primary text-white hover:bg-primary/90',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              theme === 'dark' ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white',
            )}
          >
            {retryText}
          </button>
        )}
      </div>
    </div>
  );
}
