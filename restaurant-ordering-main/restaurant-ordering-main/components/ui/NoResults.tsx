'use client';

import { useTheme } from '@/contexts/ThemeContext';

interface NoResultsProps {
  language: 'en' | 'ar';
}

export function NoResults({ language }: NoResultsProps) {
  const title = language === 'ar' ? 'لا توجد نتائج' : 'No Results';
  const message =
    language === 'ar'
      ? 'لم نتمكن من العثور على ما تبحث عنه'
      : 'We could not find what you are looking for';
  const { theme } = useTheme();

  return (
    <div
      className={`text-center py-10 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
    >
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="mb-6">{message}</p>
    </div>
  );
}
