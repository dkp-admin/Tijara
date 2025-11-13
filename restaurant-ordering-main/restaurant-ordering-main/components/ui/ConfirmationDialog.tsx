'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { cx } from '@/utils/styles';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: 'red' | 'orange';
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  confirmButtonColor = 'orange',
}) => {
  const { language } = useLanguage();

  const defaultConfirmText = language === 'ar' ? 'نعم' : 'Yes';
  const defaultCancelText = language === 'ar' ? 'إلغاء' : 'Cancel';

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div
        className={cx(
          'w-full max-w-sm mx-4 bg-white dark:bg-[#1a1a1a] rounded-2xl p-6',
          'animate-scale-up',
        )}
      >
        {/* Title */}
        <h3
          className={cx(
            'text-lg font-semibold mb-3 text-gray-900 dark:text-white',
            language === 'ar' && 'text-right',
          )}
        >
          {title}
        </h3>

        {/* Message */}
        <p
          className={cx(
            'text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed',
            language === 'ar' && 'text-right',
          )}
        >
          {message}
        </p>

        {/* Buttons */}
        <div className={cx('flex gap-3', language === 'ar' && 'flex-row-reverse')}>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            {cancelText || defaultCancelText}
          </button>
          <button
            onClick={onConfirm}
            className={cx(
              'flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-colors text-white',
              confirmButtonColor === 'red'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-orange-500 hover:bg-orange-600',
            )}
          >
            {confirmText || defaultConfirmText}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scale-up {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-up {
          animation: scale-up 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
};
