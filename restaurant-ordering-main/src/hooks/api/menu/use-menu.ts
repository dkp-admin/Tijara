import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { apiInstance } from '@/src/api/instance';
import { Product } from '@/types/api';

import { useLocationStore } from '@/src/stores/location-store';
import { MenuData, MenuQueryParams, ProcessedMenuData } from './menu.api-types';

function processMenuData(data: MenuData): ProcessedMenuData {
  if (!data?.results) {
    return {
      companyName: 'Company Name Not Available',
      categories: [],
      productsByCategory: {},
      allProducts: [],
      locationRef: null,
      menuRef: '',
    };
  }

  // Helper type guards for price and unit
  function hasValidUnitAndPrice(
    obj: unknown,
  ): obj is { price: number | null | undefined; unit: string } {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'price' in obj &&
      'unit' in obj &&
      (typeof (obj as { price: unknown }).price === 'number' ||
        (obj as { price: unknown }).price === null ||
        (obj as { price: unknown }).price === undefined) &&
      typeof (obj as { unit: unknown }).unit === 'string'
    );
  }

  // Filter products: only show if at least one variant has unit 'perItem' and valid price
  const products = (data.results.products || [])
    .filter((product) => {
      if (product.variants && product.variants.length > 0) {
        return product.variants.some((variant) => {
          const locationPrice = variant?.prices?.find(
            (p) => p?.locationRef === data?.results?.locationRef?.toString(),
          )?.price;
          const finalPrice = locationPrice || variant.price;
          return (
            hasValidUnitAndPrice(variant) &&
            finalPrice !== null &&
            finalPrice !== undefined &&
            finalPrice > 0 &&
            variant.unit === 'perItem'
          );
        });
      }
      return (
        hasValidUnitAndPrice(product) &&
        product.price !== null &&
        product.price !== undefined &&
        product.price > 0 &&
        product.unit === 'perItem'
      );
    })
    .map((product) => {
      if (product.variants && product.variants.length > 0) {
        return {
          ...product,
          variants: product.variants
            .map((variant) => {
              const locationPrice = variant?.prices?.find(
                (p) => p?.locationRef === data?.results?.locationRef?.toString(),
              )?.price;
              const finalPrice = locationPrice || variant.price;
              return finalPrice > 0 ? { ...variant, price: finalPrice } : null;
            })
            .filter(
              (variant): variant is NonNullable<typeof variant> =>
                variant !== null && variant.unit === 'perItem',
            ),
        };
      }
      return product;
    });

  const productsByCategory = products.reduce(
    (acc, product, index) => {
      const uniqueProductId = `${product._id}-${index}-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      if (!acc[product.categoryRef]) {
        acc[product.categoryRef] = [];
      }

      acc[product.categoryRef].push({
        ...product,
        uniqueId: uniqueProductId,
        _uniqueIndex: index,
      });
      return acc;
    },
    {} as Record<string, Product[]>,
  );

  const enhancedProducts = products.map((product, index) => ({
    ...product,
    uniqueId: `${product._id}-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    _uniqueIndex: index,
  }));

  return {
    companyName: data.results.company?.name || 'Company Name Not Available',
    categories: data.results.categories || [],
    productsByCategory,
    allProducts: enhancedProducts,
    locationRef: data.results.locationRef || null,
    menuRef: data.results._id || '',
  };
}

function getLocationFromUrl() {
  if (typeof window === 'undefined') return null;

  try {
    const url = window.location.href;
    const urlObj = new URL(url);
    const hostParts = urlObj.hostname.split('.');

    console.log('[getLocationFromUrl] Parsing hostname:', urlObj.hostname, 'Parts:', hostParts);

    // For dev environments: dev.jeddah.mealtime.ruyahdine.com -> jeddah
    if (hostParts.length >= 3 && hostParts[0] === 'dev') {
      const location = hostParts[1];
      console.log('[getLocationFromUrl] Dev environment detected, location:', location);
      return location;
    }
    // For production: online.mealtime.ruyahdine.com -> ccc (add 's' for API)
    else if (hostParts.length >= 2) {
      const subdomain = hostParts[0];
      // Convert 'online' to 'ccc' for API compatibility
      const location = subdomain === 'localhost' ? 'ccc' : subdomain;
      console.log(
        '[getLocationFromUrl] Production environment, subdomain:',
        subdomain,
        '-> location:',
        location,
      );
      return location;
    }

    // Fallback for localhost development
    if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
      console.log('[getLocationFromUrl] Localhost detected, using default location: ccc');
      return 'ccc'; // Default location for development
    }

    console.log('[getLocationFromUrl] No valid hostname pattern found');
    return null;
  } catch (error) {
    console.error('[getLocationFromUrl] Invalid URL:', error);
    return null;
  }
}

type UseMenuOptions = Omit<
  UseQueryOptions<MenuData, AxiosError, ProcessedMenuData>,
  'queryKey' | 'queryFn' | 'select'
>;

export function useMenu(params: MenuQueryParams, options?: UseMenuOptions) {
  const setMenuRef = useLocationStore((state) => state.setMenuRef);

  const clearMenuReferences = useLocationStore((state) => state.clearMenuReferences);
  const currentMenuRef = useLocationStore((state) => state.menuRef);

  const queryString = new URLSearchParams({
    _q: params._q || '',
    orderType: params.orderType || 'pickup',
  }).toString();

  const finalQuery = queryString + `&hostname=${getLocationFromUrl()}`;

  return useQuery<MenuData, AxiosError, ProcessedMenuData>({
    queryKey: ['menu-items', params.orderType, getLocationFromUrl()],
    queryFn: () =>
      apiInstance.get(`/menu-management/menu/?${finalQuery}`).then((res) => {
        // Store all reference values when menu loads
        if (res.data?.results) {
          const newMenuRef = res.data.results._id;

          // If menu has changed, clear old references first
          if (currentMenuRef && currentMenuRef !== newMenuRef) {
            clearMenuReferences();
          }

          if (newMenuRef) {
            setMenuRef(newMenuRef);
          }
        }
        return res.data;
      }),
    select: processMenuData,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    ...options,
  });
}
