'use client';

import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRef } from 'react';
import { cx } from '@/utils/styles';

interface CategoriesProps {
  categories?: {
    categoryRef: string;
    name: {
      en: string;
      ar: string;
    };
    image: string;
  }[];
  activeCategory?: string;
  onCategorySelect?: (categoryRef: string) => void;
}

export default function Categories({
  categories = [],
  activeCategory = '',
  onCategorySelect = () => {},
}: CategoriesProps) {
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div
      className={cx(
        'w-full overflow-x-auto no-scrollbar scroll-smooth',
        language === 'ar' && 'scroll-end',
      )}
      ref={containerRef}
    >
      <div
        className={cx('flex gap-3 min-w-max', language === 'ar' ? 'flex-row-reverse' : 'flex-row')}
      >
        {categories.map((category) => (
          <div
            key={category.categoryRef}
            onClick={() => onCategorySelect(category.categoryRef)}
            className={cx(
              'flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-all h-11 relative',
              'bg-category-light dark:bg-category-dark',
              'hover:bg-gray-200 dark:hover:bg-[#2A2B30]',
              activeCategory === category.categoryRef && 'overflow-hidden',
            )}
          >
            <Image
              src={category.image || '/assets/placeholder.png'}
              alt={category.name.en}
              width={20}
              height={20}
              className="object-contain relative z-10"
            />
            <span className="text-sm font-bold whitespace-nowrap relative z-10 text-black dark:text-white">
              {category.name[language]}
            </span>
            {activeCategory === category.categoryRef && (
              <div
                className="absolute bottom-0 left-0 right-0 h-[12%] bg-[#FF4201]"
                style={{
                  clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 85% 50%, 15% 50%, 0 0)',
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
