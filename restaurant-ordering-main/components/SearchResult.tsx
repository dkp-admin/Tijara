'use client';

import Image from 'next/image';
import { Product } from '@/types/api';
import { cx } from '@/utils/styles';

interface SearchResultProps {
  product: Product;
  language: 'en' | 'ar';
  onSelect: (id: string) => void;
}

export function SearchResult({ product, language, onSelect }: SearchResultProps) {
  return (
    <div
      className={cx(
        'flex items-center gap-4 p-4 cursor-pointer transition-colors',
        'hover:bg-gray-100 dark:hover:bg-[#2A2B30]',
        'text-black dark:text-white',
      )}
      onClick={() => onSelect(product._id)}
    >
      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
        <Image
          src={product.image || '/assets/placeholder.png'}
          alt={product.name[language]}
          fill
          className="object-cover"
        />
      </div>
      <h3 className="font-medium">{product.name[language]}</h3>
    </div>
  );
}
