'use client';

import { cx } from '@/utils/styles';
import { CloseIcon } from './icons/CloseIcon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className={cx('rounded-2xl p-8 w-[380px] mx-4', 'bg-white dark:bg-[#1E1F24]')}>
        <div className="flex justify-between items-center mb-8">
          {title && <h2 className="text-2xl text-black dark:text-white">{title}</h2>}
          <button
            onClick={onClose}
            className={cx(
              'text-black/60 hover:text-black',
              'dark:text-white/60 dark:hover:text-white',
            )}
          >
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
