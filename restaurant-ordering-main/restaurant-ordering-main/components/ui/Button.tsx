'use client';
import { cx } from '@/utils/styles';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cx(
        'py-4 rounded-full transition-colors',
        variant === 'primary' && 'bg-primary text-white hover:bg-[#00A578]',
        variant === 'secondary' &&
          'bg-gray-100 dark:bg-[rgb(35,36,42)] text-black dark:text-white hover:bg-gray-200 dark:hover:bg-[#2A2B30]',
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
