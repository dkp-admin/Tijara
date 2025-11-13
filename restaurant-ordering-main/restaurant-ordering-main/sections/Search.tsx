'use client';

import { useState } from 'react';
import { Product } from '@/types/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { SearchInput } from '@/components/ui/SearchInput';
import { NoResults } from '@/components/ui/NoResults';
import { SearchResult } from '@/components/SearchResult';

interface SearchProps {
  products: Product[];
  onProductSelect?: (productId: string, categoryRef: string) => void;
}

export default function Search({ products = [], onProductSelect }: SearchProps) {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');

  const filteredProducts = query
    ? products.filter((product) =>
        product.name[language].toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  const handleSelect = (product: Product) => {
    if (onProductSelect) {
      onProductSelect(product._id, product.categoryRef);
    }
    setQuery('');
  };

  return (
    <div className={`py-4 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <SearchInput
        value={query}
        onChange={setQuery}
        onClear={() => setQuery('')}
        language={language}
      />

      {query && (
        <div className="absolute left-0 right-0 top-full bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-800 shadow-lg max-h-search-results overflow-y-auto">
          {filteredProducts.length > 0 ? (
            <div className="p-4">
              {filteredProducts.map((product, index) => (
                <SearchResult
                  key={`${product._id}-search-${index}`}
                  product={product}
                  language={language}
                  onSelect={() => handleSelect(product)}
                />
              ))}
            </div>
          ) : (
            <NoResults language={language} />
          )}
        </div>
      )}
    </div>
  );
}
