'use client';

import Image from 'next/image';
import { Product } from '@/types/api';
import { FoodTypeIndicator } from './FoodTypeIndicator';
import { ProductPrice } from './ProductPrice';
import { ARButton } from './ui/ARButton';
import { ProductDetails } from './ui/ProductDetails';
import { ProductView } from './ui/ProductView';
import { cx } from '@/utils/styles';
import { useState, useMemo, useCallback, memo } from 'react';
import { QuantityCounter } from './ui/AddButton';
import { useCartStore } from '@/src/stores/cart-store';
import { RemoveItemModal } from './ui/RemoveItemModal';

interface ProductCardProps {
  product: Product;
  language: 'en' | 'ar';
  isBlinking?: boolean;
  onARClick: () => void;
}
// Add type for the name object
interface LocalizedName {
  [key: string]: string;
}

export const ProductCard = memo(function ProductCard({
  product,
  language,
  isBlinking,
  onARClick,
}: ProductCardProps) {
  const { items, addItem, updateItemQuantity, removeItem } = useCartStore();
  const [showDetails, setShowDetails] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  // Get all cart items for this product
  const cartItems = items.filter((item) => item._id === product._id);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const showCounter = totalQuantity > 0;

  // Memoize expensive calculations
  const productPrice = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return 0;
    return Math.min(...product.variants.map((variant) => variant.price));
  }, [product.variants]);

  const needsDetails = useMemo(() => {
    const hasMultipleVariants = product.variants.length > 1;
    const hasModifiers = product.modifiers && product.modifiers.length > 0;
    return hasMultipleVariants || hasModifiers;
  }, [product.variants.length, product.modifiers]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleIncrement = useCallback(() => {
    // If product has variants or modifiers, show details instead of direct increment
    if (needsDetails) {
      setShowDetails(true);
    } else {
      const cartItem = cartItems[0];
      if (cartItem) {
        updateItemQuantity(cartItem.uniqueId, cartItem.quantity + 1);
      }
    }
  }, [updateItemQuantity, cartItems, needsDetails]);

  // Memoize the complex handleAdd function
  const handleAdd = useCallback(() => {
    if (needsDetails) {
      setShowDetails(true);
    } else {
      // Simple product logic for first add or increment
      const variantPrice = product.variants[0]?.price || 0;
      const modifierPrice = product.modifiers?.[0]?.values[0]?.price || 0;
      const calculatedPrice = variantPrice + modifierPrice;

      if (totalQuantity === 0) {
        addItem({
          ...product,
          selectedVariant: product.variants[0],
          selectedModifiers: product.modifiers?.[0]
            ? { [product.modifiers[0]._id]: [product.modifiers[0].values[0]._id] }
            : {},
          calculatedPrice: calculatedPrice,
        });
      } else {
        const cartItem = cartItems[0];
        if (cartItem) {
          updateItemQuantity(cartItem.uniqueId, cartItem.quantity + 1);
        }
      }
    }
  }, [totalQuantity, product, addItem, updateItemQuantity, cartItems, needsDetails]);

  const handleDecrement = useCallback(() => {
    const productCartItems = items.filter((item) => item._id === product._id);

    if (productCartItems.length > 1) {
      setShowRemoveModal(true);
    } else if (productCartItems.length === 1) {
      const cartItem = productCartItems[0];
      if (cartItem.quantity <= 1) {
        removeItem(cartItem.uniqueId);
      } else {
        updateItemQuantity(cartItem.uniqueId, cartItem.quantity - 1);
      }
    }
  }, [removeItem, updateItemQuantity, product._id, items]);

  const handleVariantIncrement = useCallback(
    (uniqueId: string) => {
      const cartItem = items.find((item) => item.uniqueId === uniqueId);
      if (cartItem) {
        updateItemQuantity(uniqueId, cartItem.quantity + 1);
      }
    },
    [updateItemQuantity, items],
  );

  const handleVariantRemove = useCallback(
    (uniqueId: string) => {
      const cartItem = items.find((item) => item.uniqueId === uniqueId);
      if (cartItem) {
        if (cartItem.quantity <= 1) {
          removeItem(uniqueId);
          const remainingItems = items.filter((item) => item.uniqueId !== uniqueId).length;
          if (remainingItems === 0) {
            setShowRemoveModal(false);
          } else {
            const remainingVariants = items.filter(
              (item) => item._id === product._id && item.uniqueId !== uniqueId,
            );
            if (remainingVariants.length === 0) {
              setShowRemoveModal(false);
            }
          }
        } else {
          updateItemQuantity(uniqueId, cartItem.quantity - 1);
        }
      }
    },
    [removeItem, updateItemQuantity, product._id, items],
  );

  // Fix variant mapping with proper types
  const variantsForRemoval = cartItems.map((cartItem) => {
    const variant = product.variants.find((v) => v._id === cartItem.selectedVariant?._id);
    const variantName =
      variant?.name && typeof variant.name === 'object'
        ? (variant.name as LocalizedName)[language] || ''
        : '';

    const modifiers = Object.entries(cartItem.selectedModifiers || {})
      .map(([modKey, modValue]) => {
        const modifier = product.modifiers?.find((m) => m._id === modKey);
        const modifierValue = modifier?.values.find((v) => v._id === modValue);
        return modifierValue?.name && typeof modifierValue.name === 'object'
          ? (modifierValue.name as LocalizedName)[language] || ''
          : '';
      })
      .filter(Boolean);

    return {
      cartItemKey: cartItem.uniqueId,
      variantName,
      modifiers,
      quantity: cartItem.quantity,
      price: cartItem.calculatedPrice || variant?.price || 0,
    };
  });

  return (
    <>
      <div
        onClick={() => setShowView(true)}
        className={cx(
          'group rounded-xl overflow-hidden transition-all duration-300 relative',
          'text-black dark:text-white',
          // 'h-[200px] sm:h-[220px] md:h-[270px]',
          // index % 2 === 0 ? '-ml-4 mr-0.5' : '-mr-4 ml-0.5',
          'md:ml-0 md:mr-0',
          'cursor-pointer',
          isBlinking && 'animate-highlight', // Add highlight animation class
        )}
      >
        <div className="absolute bottom-0 left-0 right-0 h-[70%] rounded-2xl bg-card-light dark:bg-card-dark" />
        <div className="relative z-10">
          <div className="p-2">
            <div className="relative w-[50%] sm:w-[45%] pt-[50%] sm:pt-[45%] overflow-hidden mx-auto">
              <Image
                src={product.image || '/assets/placeholder.png'}
                alt={typeof product.name === 'object' ? product.name[language] : product.name}
                fill
                className="object-cover rounded-full"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          </div>
          <div className={cx('p-3 -mt-2 space-y-1', language === 'ar' && 'text-right rtl')}>
            <div className="relative mb-2">
              <div className="mt-4">
                <ARButton
                  hasAR={!!product.glbFileUrl}
                  onClick={(e) => {
                    e?.stopPropagation();
                    onARClick();
                  }}
                  position={language === 'ar' ? 'left' : 'right'}
                />
              </div>
            </div>
            <h3
              className={cx(
                'text-sm sm:text-lg font-semibold flex items-center gap-2',
                'text-black/90 dark:text-white/90',
                language === 'ar' ? 'flex-row-reverse justify-start gap-2 w-full' : 'gap-2',
              )}
            >
              <span className="flex-shrink-0 min-w-[18px]">
                <FoodTypeIndicator type={product.contains} />
              </span>
              <span className="truncate block">
                {typeof product.name === 'object' ? product.name[language] : product.name}
              </span>
            </h3>

            <div className="flex justify-between items-center">
              <ProductPrice
                price={productPrice}
                currency={product.currency}
                calories={product.nutritionalInformation?.calorieCount}
                language={language}
              />
              {/* Update counter positioning based on language */}
              <div
                className={cx(
                  'bottom-2 mobile-440:bottom-4 md:bottom-4',
                  language === 'ar' ? 'left-2' : 'right-2',
                )}
              >
                <QuantityCounter
                  quantity={totalQuantity}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                  size="small"
                  showCounter={showCounter}
                  onAdd={handleAdd}
                  onHide={() => {}}
                  onInitialAdd={needsDetails ? () => setShowDetails(true) : undefined}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProductView
        product={product}
        language={language}
        isOpen={showView}
        onClose={() => setShowView(false)}
      />

      <ProductDetails
        product={product}
        language={language}
        isOpen={showDetails}
        onClose={() => {
          setShowDetails(false);
          // Show cart if there are items in it
        }}
        onAdd={handleAdd}
      />

      <RemoveItemModal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        product={product}
        variants={variantsForRemoval}
        onRemove={handleVariantRemove}
        onIncrement={handleVariantIncrement}
        language={language}
      />
    </>
  );
});
