'use client';

import { useTheme } from '@/contexts/ThemeContext';

export function NoProducts() {
  const { theme } = useTheme();

  return (
    <div className={`text-center py-8 ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
      No products found
    </div>
  );
}
