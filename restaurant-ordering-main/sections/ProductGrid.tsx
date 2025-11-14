'use client';

import { Product } from '@/types/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useRef, useEffect } from 'react';
import ARModal from '@/components/ARModal';
import { ProductCard } from '../components/ProductCard';
import { NoProducts } from '@/components/ui/NoProducts';

interface ProductGridProps {
  products: Product[];
  highlightProductId?: string | null;
  onHighlightDone?: () => void;
}

export default function ProductGrid({
  products,
  highlightProductId,
  onHighlightDone,
}: ProductGridProps) {
  const { language } = useLanguage();
  const [selectedAR, setSelectedAR] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const productRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [blinkingId, setBlinkingId] = useState<string | null>(null);

  useEffect(() => {
    if (highlightProductId) {
      const idx = products.findIndex((p) => p._id === highlightProductId);
      if (idx !== -1 && productRefs.current[idx]) {
        productRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setBlinkingId(highlightProductId);
        // Remove blink after animation duration (e.g., 1s)
        setTimeout(() => {
          setBlinkingId(null);
          onHighlightDone?.();
        }, 1000);
      }
    }
  }, [highlightProductId, products, onHighlightDone]);

  const handleARClick = (product: Product) => {
    if (product.glbFileUrl) {
      setSelectedAR(product.glbFileUrl);
      setSelectedProduct(product);
    }
  };

  if (!products || products.length === 0) {
    return <NoProducts />;
  }

  return (
    <>
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {products.map((product, index) => (
          <div
            key={product.uniqueId || `${product._id}-${index}`}
            ref={(el) => {
              productRefs.current[index] = el;
            }}
            className="scroll-mt-32 transition-all duration-300"
          >
            <ProductCard
              product={product}
              language={language}
              isBlinking={blinkingId === product._id}
              onARClick={() => handleARClick(product)}
            />
          </div>
        ))}
      </div>

      <ARModal
        isOpen={!!selectedAR}
        onClose={() => {
          setSelectedAR(null);
          setSelectedProduct(null);
        }}
        glbUrl={selectedAR || ''}
        productName={selectedProduct?.name[language]}
      />
    </>
  );
}
