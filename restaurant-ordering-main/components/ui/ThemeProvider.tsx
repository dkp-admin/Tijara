'use client';

import { ReactNode } from 'react';
import { cx } from '@/utils/styles';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeContainerProps {
  children: ReactNode;
  className?: string;
}

export function ThemeContainer({ children, className }: ThemeContainerProps) {
  const { theme } = useTheme();

  return (
    <div className={cx('transition-colors duration-200', theme === 'dark' && 'dark', className)}>
      {children}
    </div>
  );
}
