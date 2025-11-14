'use client';

import Image from 'next/image';
import { Product } from '@/types/api';
import { FoodTypeIndicator } from '../FoodTypeIndicator';
import { cx } from '@/utils/styles';
import { QuantityCounter } from './AddButton';
import { useCartStore } from '@/src/stores/cart-store';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

interface ProductDetailsProps {
  product: Product;
  language: 'en' | 'ar';
  onClose: () => void;
  isOpen: boolean;
  onAdd: () => void;
}

export function ProductDetails({ product, language, onClose, isOpen, onAdd }: ProductDetailsProps) {
  const { addItem } = useCartStore();
  const [selectedVariant, setSelectedVariant] = useState<string>(product.variants[0]?._id || '');
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({});
  const [tempQuantity, setTempQuantity] = useState<number>(1); // Local temporary quantity
  const [shakeModifierId, setShakeModifierId] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset temporary quantity when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempQuantity(1);
      setSelectedVariant(product.variants[0]?._id || '');
      setSelectedModifiers({});
    }
  }, [isOpen, product.variants]);

  // Calculate total price based on selected variant and modifiers
  const totalPrice = useMemo(() => {
    const variant = product.variants.find((v) => v._id === selectedVariant);
    const variantPrice = variant?.price || 0;

    const modifiersPrice = Object.entries(selectedModifiers).reduce(
      (total, [modifierId, valueIds]) => {
        const modifier = product.modifiers?.find((m) => m._id === modifierId);
        if (!modifier) return total;

        return (
          total +
          valueIds.reduce((modifierTotal, valueId) => {
            const value = modifier.values.find((v) => v._id === valueId);
            return modifierTotal + (value?.price || 0);
          }, 0)
        );
      },
      0,
    );

    return variantPrice + modifiersPrice;
  }, [product.variants, product.modifiers, selectedVariant, selectedModifiers]);

  const handleTempIncrement = useCallback(() => {
    setTempQuantity((prev) => prev + 1);
  }, []);

  const handleTempDecrement = useCallback(() => {
    setTempQuantity((prev) => Math.max(1, prev - 1));
  }, []);

  const handleModifierChange = useCallback(
    (modifierId: string, valueId: string) => {
      setSelectedModifiers((prev) => {
        const newState = { ...prev };
        const currentSelections = prev[modifierId] || [];
        const modifier = product.modifiers?.find((m) => m._id === modifierId);

        if (!modifier) return newState;

        const isCurrentlySelected = currentSelections.includes(valueId);

        if (isCurrentlySelected) {
          // Remove the selection if it's currently selected
          const updatedSelections = currentSelections.filter((id) => id !== valueId);
          if (updatedSelections.length === 0) {
            delete newState[modifierId];
          } else {
            newState[modifierId] = updatedSelections;
          }
        } else {
          // Add the selection if we haven't reached the maximum
          if (currentSelections.length < modifier.max) {
            newState[modifierId] = [...currentSelections, valueId];
          }
          // If we've reached the maximum, don't add (could show a message here)
        }

        return newState;
      });
    },
    [product.modifiers],
  );

  const handleVariantChange = useCallback((variantId: string) => {
    setSelectedVariant(variantId);
  }, []);

  // Check if all required modifiers have a selection
  const allRequiredModifiersSelected = useMemo(() => {
    if (!product.modifiers || product.modifiers.length === 0) return true;
    return product.modifiers.every((modifier) => {
      const selections = selectedModifiers[modifier._id] || [];
      return selections.length >= modifier.min;
    });
  }, [product.modifiers, selectedModifiers]);

  const handleAddToCart = useCallback(() => {
    // If not all required modifiers are selected, animate the select any text
    if (product.modifiers && product.modifiers.length > 0) {
      const missing = product.modifiers.find((modifier) => {
        const selections = selectedModifiers[modifier._id] || [];
        return selections.length < modifier.min;
      });
      if (missing) {
        setShakeModifierId(missing._id);
        setTimeout(() => setShakeModifierId(null), 600);
        return;
      }
    }

    const variantObject = product.variants.find((v) => v._id === selectedVariant);
    if (!variantObject) return;

    // Add the item with the temporary quantity to the cart, including variant/modifier selections
    for (let i = 0; i < tempQuantity; i++) {
      addItem({
        ...product,
        selectedVariant: variantObject,
        selectedModifiers: selectedModifiers,
        calculatedPrice: totalPrice,
      });
    }

    onAdd();
    onClose();
    // Show floating cart after closing
    setTimeout(() => {}, 300);
  }, [
    addItem,
    product,
    tempQuantity,
    selectedVariant,
    selectedModifiers,
    totalPrice,
    onAdd,
    onClose,
  ]);

  // Handle clicking outside modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the backdrop itself, not the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={cx(
          'bg-card-light dark:bg-card-dark rounded-t-2xl w-full max-w-lg',
          'relative animate-slide-up',
          'max-h-[90vh] overflow-y-auto',
          language === 'ar' && 'rtl',
        )}
      >
        <div className="sticky top-0 bg-card-light dark:bg-card-dark z-10 p-6 pb-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col min-h-0">
          <div className="flex-shrink-0 p-6 pt-2">
            <div className="relative w-24 h-24 mx-auto">
              <Image
                src={product.image || '/assets/placeholder.png'}
                alt={product.name[language]}
                fill
                className="object-cover rounded-full"
              />
            </div>

            <div className="space-y-2 text-center mt-4">
              <h2 className="text-xl font-semibold flex items-center justify-center gap-2 text-black dark:text-white">
                <FoodTypeIndicator type={product.contains} />
                {product.name[language]}
              </h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6">
            <div className={cx('text-left space-y-1', language === 'ar' && 'text-right')}>
              {/* Description section */}
              <div className="mb-6">
                <div className="font-medium text-black dark:text-white">
                  {language === 'ar' ? 'الوصف:' : 'Description:'}
                </div>
                <div className="text-black/70 dark:text-white/70 text-sm leading-relaxed mt-1">
                  {product.description || '--'}
                </div>
              </div>

              {/* Add Modifiers section in card format */}
              {product.modifiers && product.modifiers.length > 0 && (
                <div className="space-y-3 mb-6">
                  {product.modifiers.map((modifier) => (
                    <div
                      key={modifier._id}
                      className="bg-surface-light dark:bg-surface-dark rounded-lg p-3 border border-gray-200 dark:border-gray-700 mb-3"
                    >
                      <div className="font-bold mb-2 text-sm text-black dark:text-white flex items-center gap-1">
                        {modifier.name}
                        {modifier.min > 0 && (
                          <>
                            <span className="text-red-500 text-xs" title="Required">
                              *
                            </span>
                            {(selectedModifiers[modifier._id]?.length || 0) < modifier.min && (
                              <span
                                className={cx(
                                  'text-orange-500 text-xs ml-1 inline-block',
                                  shakeModifierId === modifier._id && 'animate-shake-x',
                                )}
                              >
                                {language === 'ar' ? 'اختر أي خيار' : 'Select any'}
                              </span>
                            )}
                          </>
                        )}
                        <span className="text-gray-500 text-xs ml-auto">
                          {language === 'ar'
                            ? `(${selectedModifiers[modifier._id]?.length || 0}/${modifier.max})`
                            : `(${selectedModifiers[modifier._id]?.length || 0}/${modifier.max})`}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {modifier.values.map((value) => (
                          <label
                            key={value._id}
                            className="flex items-center justify-between p-2 cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={(selectedModifiers[modifier._id] || []).includes(
                                  value._id,
                                )}
                                onChange={() => handleModifierChange(modifier._id, value._id)}
                                className="w-3.5 h-3.5 accent-[#FF4201] rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                              />
                              <span className="text-black/90 dark:text-white/90 text-sm">
                                {value.name}
                              </span>
                            </div>
                            {value.price > 0 && (
                              <span className="font-medium text-black dark:text-white text-sm">
                                +{product.currency} {value.price}
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Variants section in card format */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <div className="bg-surface-light dark:bg-surface-dark rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="font-bold mb-2 text-sm text-black dark:text-white">
                      {language === 'ar' ? 'الأنواع:' : 'Variants:'}
                    </div>
                    <div className="space-y-1">
                      {product.variants.map((variant) => (
                        <label
                          key={variant._id}
                          className="flex items-center justify-between p-2 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="variant"
                              value={variant._id}
                              checked={selectedVariant === variant._id}
                              onChange={() => handleVariantChange(variant._id)}
                              className="w-3.5 h-3.5 accent-[#FF4201] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                            />
                            <span className="text-black/90 dark:text-white/90 text-sm">
                              {variant.name[language]}
                            </span>
                          </div>
                          <span className="font-medium text-black dark:text-white text-sm">
                            {product.currency} {variant.price}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom section with sticky positioning */}
          <div className="sticky bottom-0 bg-card-light dark:bg-card-dark pt-4 pb-6 px-6 border-t border-gray-200 dark:border-gray-700">
            {/* Price and controls container */}
            <div className="flex items-center gap-4">
              {/* Quantity Counter - using temporary quantity */}
              <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                <QuantityCounter
                  quantity={tempQuantity}
                  onIncrement={handleTempIncrement}
                  onDecrement={handleTempDecrement}
                  size="xlarge"
                  showCounter={true}
                  onAdd={() => {}}
                  onHide={() => {}}
                />
              </div>

              {/* Add Item Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!allRequiredModifiersSelected) {
                    // Find the first missing required modifier and shake its label
                    if (product.modifiers && product.modifiers.length > 0) {
                      const missing = product.modifiers.find((modifier) => {
                        const selections = selectedModifiers[modifier._id] || [];
                        return selections.length < modifier.min;
                      });
                      if (missing) {
                        setShakeModifierId(missing._id);
                        setTimeout(() => setShakeModifierId(null), 600);
                        return;
                      }
                    }
                  }
                  handleAddToCart();
                }}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-2xl transition-colors text-sm font-medium"
                // Don't disable the button, allow click for shake
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Add Item</span>
                  <span>
                    | {product.currency} {(totalPrice * tempQuantity).toFixed(2)}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes shake-x {
          10%,
          90% {
            transform: translateX(-2px);
          }
          20%,
          80% {
            transform: translateX(4px);
          }
          30%,
          50%,
          70% {
            transform: translateX(-8px);
          }
          40%,
          60% {
            transform: translateX(8px);
          }
        }
        .animate-shake-x {
          animation: shake-x 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
    </div>
  );
}
