'use client';

import { useTheme } from '@/contexts/ThemeContext';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  language: 'en' | 'ar';
}

export function SearchInput({ value, onChange, onClear, language }: SearchInputProps) {
  const { theme } = useTheme();

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={language === 'ar' ? 'ابحث عن الأطباق' : 'Search for dishes'}
        value={value}
        className={`w-full py-3 rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/50
          ${
            theme === 'dark'
              ? 'bg-search-dark text-white/90 placeholder:text-white/40'
              : 'bg-search-light text-black placeholder:text-black/40 border border-gray-200'
          }
          ${language === 'ar' ? 'pl-12 pr-12 text-right' : 'pl-12 pr-12 text-left'}`}
        onChange={(e) => onChange(e.target.value)}
      />
      <div
        className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'right-4' : 'left-4'}`}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </div>
      {value && (
        <button
          onClick={onClear}
          className={`absolute top-1/2 -translate-y-1/2 ${
            theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'
          } ${language === 'ar' ? 'left-4' : 'right-4'}`}
        >
          {language === 'ar' ? 'إلغاء' : 'Cancel'}
        </button>
      )}
    </div>
  );
}
