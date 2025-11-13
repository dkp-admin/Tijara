/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import Header from '@/components/Header';
import { ProductGridSkeletonSection } from '@/components/skeleton/ProductGridSkeletonSection';
import { FloatingCart } from '@/components/ui/FloatingCart';
import { PageLayout } from '@/components/ui/layout/PageLayout';
import { MenuConfigError } from '@/components/ui/MenuConfigError';
import { NoOrderTypesAvailable } from '@/components/ui/NoOrderTypesAvailable';
import { OrderTypeModal } from '@/components/ui/OrderTypeModal';

import { useOrderType } from '@/contexts/OrderTypeContext';
import { useUser } from '@/contexts/UserContext';
import ProductGrid from '@/sections/ProductGrid';
import { useMenu } from '@/src/hooks/api';
import { useCalculateBilling } from '@/src/hooks/api/billing';
import { getErrorMessage } from '@/src/hooks/api/error-utils';
import { useMenuConfig } from '@/src/hooks/api/menu/use-menu-config';
import { useUrlParams } from '@/src/hooks/use-url-params';
import { useLocationStore } from '@/src/stores/location-store';
import { Category } from '@/types/api';
import { normalizeOrderType } from '@/utils/formatting';
import { cx } from '@/utils/styles';
import { useTopLoader } from 'nextjs-toploader';
import { useEffect, useMemo, useState } from 'react';

const ALL_CATEGORIES_ID = 'all';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES_ID);
  const [mounted, setMounted] = useState(false);
  const [highlightProductId, setHighlightProductId] = useState<string | null>(null);
  const { orderType, setOrderType, hasSeenOrderTypeModal, setHasSeenOrderTypeModal } =
    useOrderType();
  const [hasRequiredConfig, setHasRequiredConfig] = useState(true);
  const normalizedOrderType = normalizeOrderType(orderType);
  const { user, customerData } = useUser();
  const isAuthenticated = !!(customerData?.phone || user?.phone);

  // Get location store values
  const { companyRef, locationRef, companyName, isDeliveryMenuAvailable, isPickupMenuAvailable } =
    useLocationStore();

  // Get available order types

  // Initialize billing hook
  useCalculateBilling();
  useUrlParams();
  const loader = useTopLoader();

  useEffect(() => {
    setMounted(true);
  }, []);

  // First, load menu configuration
  const {
    isLoading: isConfigLoading,
    error: configError,
    refetch: refetchConfig,
  } = useMenuConfig();

  // Check if required config is missing (companyRef and locationRef are required, menu availability can be null)

  useEffect(() => {
    setHasRequiredConfig(!!companyRef && !!locationRef);
  }, [companyRef, locationRef]);

  // Auto-set order type if there's a default and no current selection
  useEffect(() => {
    if (isPickupMenuAvailable || isDeliveryMenuAvailable) {
      const availableCount = (isPickupMenuAvailable ? 1 : 0) + (isDeliveryMenuAvailable ? 1 : 0);

      // If only one option is available, auto-select it
      if (
        availableCount === 1 &&
        (isPickupMenuAvailable || isDeliveryMenuAvailable) &&
        mounted &&
        hasRequiredConfig &&
        !orderType
      ) {
        setOrderType(isPickupMenuAvailable ? 'pickup' : 'delivery');
        setHasSeenOrderTypeModal(true);
        return;
      }
    }
  }, [mounted, hasRequiredConfig, orderType]);

  // Only load menu after config is loaded and has required fields
  const { data: menuData, isLoading: isMenuLoading } = useMenu(
    {
      orderType: normalizedOrderType,
    },
    {
      enabled: !!orderType && hasRequiredConfig, // Only fetch if orderType and config are available
    },
  );

  const isLoading = isConfigLoading || isMenuLoading;

  // Company name is now set directly in the menu hook - no need to set it here

  // Set initial category from localStorage or default to "All"
  useEffect(() => {
    if (mounted) {
      const storedCategory = localStorage.getItem('selectedCategory');
      if (storedCategory) {
        setSelectedCategory(storedCategory);
      } else {
        setSelectedCategory(ALL_CATEGORIES_ID);
      }
    }
  }, [mounted]);

  // Handle category selection and persist to localStorage
  const handleCategorySelect = (categoryRef: string) => {
    setSelectedCategory(categoryRef);
    if (mounted) {
      localStorage.setItem('selectedCategory', categoryRef);
    }
  };

  // Handle order type selection from modal
  const handleOrderTypeSelect = (selectedOrderType: 'delivery' | 'pickup') => {
    setOrderType(selectedOrderType);
    setHasSeenOrderTypeModal(true);
  };

  // Handle product select from search
  const handleProductSelect = (productId: string, categoryRef: string) => {
    setSelectedCategory(categoryRef);
    setHighlightProductId(productId);
  };

  const handleHighlightDone = () => {
    setHighlightProductId(null);
  };

  const categoriesWithAll = useMemo(() => {
    if (!menuData) return [];
    const allCategory: Category = {
      categoryRef: ALL_CATEGORIES_ID,
      name: { en: 'All', ar: 'الكل' },
      sortOrder: 0,
      image: '',
    };
    return [allCategory, ...menuData.categories];
  }, [menuData]);

  useEffect(() => {
    if (isLoading) {
      loader.start();
    } else {
      loader.done();
    }
  }, [isLoading, loader]);

  // Show error if menu config failed to load
  if (configError) {
    return <MenuConfigError error={getErrorMessage(configError)} onRetry={refetchConfig} />;
  }

  // Show error if required config is missing after successful load
  if (!isConfigLoading && !hasRequiredConfig) {
    const missingFields = [];
    if (!companyRef) missingFields.push('companyRef');
    if (!locationRef) missingFields.push('locationRef');

    return (
      <MenuConfigError
        error={`Missing required configuration: ${missingFields.join(', ')}`}
        onRetry={refetchConfig}
      />
    );
  }

  // Show error if no order types are available after config is loaded
  if (
    !isConfigLoading &&
    hasRequiredConfig &&
    !(isPickupMenuAvailable || isDeliveryMenuAvailable)
  ) {
    return <NoOrderTypesAvailable onRetry={refetchConfig} />;
  }

  if (isLoading || !menuData) {
    return (
      <PageLayout>
        <Header
          companyName=""
          categories={[]}
          onCategorySelect={handleCategorySelect}
          allProducts={[]}
          activeCategory={selectedCategory}
          onProductSelect={handleProductSelect}
          isAuthenticated={isAuthenticated}
        />
        <main
          className={cx('container mx-auto px-4 pt-64 pb-32', 'bg-white dark:bg-background-dark')}
        >
          <ProductGridSkeletonSection />
        </main>
        <FloatingCart />
        <OrderTypeModal
          isOpen={mounted && (!hasSeenOrderTypeModal || !orderType)}
          onSelect={handleOrderTypeSelect}
          selectedOrderType={normalizedOrderType || 'delivery'}
        />
      </PageLayout>
    );
  }

  const products =
    selectedCategory === ALL_CATEGORIES_ID
      ? menuData.allProducts || []
      : menuData.productsByCategory[selectedCategory] || [];

  return (
    <PageLayout>
      <Header
        companyName={companyName || ''}
        categories={categoriesWithAll}
        onCategorySelect={handleCategorySelect}
        allProducts={menuData.allProducts || []}
        activeCategory={selectedCategory}
        onProductSelect={handleProductSelect}
        isAuthenticated={isAuthenticated}
      />

      <main
        className={cx(
          'container mx-auto px-4 pt-64 pb-32', //  for bottom padding
          'bg-white dark:bg-background-dark',
        )}
      >
        <ProductGrid
          products={products}
          highlightProductId={highlightProductId}
          onHighlightDone={handleHighlightDone}
        />
      </main>

      <FloatingCart />
      <OrderTypeModal
        isOpen={mounted && (!hasSeenOrderTypeModal || !orderType)}
        onSelect={handleOrderTypeSelect}
        selectedOrderType={normalizedOrderType || 'delivery'}
      />
    </PageLayout>
  );
}
