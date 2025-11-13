import { apiInstance } from '@/src/api/instance';
import { useLocationStore } from '@/src/stores/location-store';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export interface MenuConfigResponse {
  _id: string;
  name: {
    en: string;
    ar: string;
  };
  phone: string;
  address: string;
  company: {
    name: {
      en: string;
      ar: string;
    };
  };
  pickupDeliveryConfiguration: {
    pickup: boolean;
    delivery: boolean;
    pickupNextAvailable: string | null;
    deliveryNextAvailable: string | null;
    pickupOffTill: string;
    deliveryOffTill: string;
  };
  qrOrderingConfiguration: {
    onlineOrdering: boolean;
    qrOrdering: boolean;
    coordinates: {
      lat: string;
      lng: string;
    };
    schedule: Array<{
      startTime: string;
      endTime: string;
    }>;
    deliveryType: string;
    paymentOptions: string;
    paymentOptionsQr: string;
    enableGeofencingOnlineOrdering: boolean;
    enableCollectionOnlineOrdering: boolean;
    arMenu: boolean;
    deliveryRange: string;
  };
  pickupQRConfiguration: {
    pickup: boolean;
    pickupOffTill: string;
    pickupNextAvailable: string | null;
  };
  industry: string;
  currency: string;
  companyRef: string;
  locationRef: string;
  isPickupMenuAvailable: string;
  isDeliveryMenuAvailable: string;
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

export type UseMenuConfigOptions = Omit<
  UseQueryOptions<MenuConfigResponse, AxiosError>,
  'queryKey' | 'queryFn'
>;

export function useMenuConfig(options?: UseMenuConfigOptions) {
  const setCompanyRef = useLocationStore((state) => state.setCompanyRef);
  const setLocationRef = useLocationStore((state) => state.setLocationRef);
  const setCompanyName = useLocationStore((state) => state.setCompanyName);
  const setLocationName = useLocationStore((state) => state.setLocationName);
  const setIsPickupMenuAvailable = useLocationStore((state) => state.setIsPickupMenuAvailable);
  const setIsDeliveryMenuAvailable = useLocationStore((state) => state.setIsDeliveryMenuAvailable);

  const hostname = getLocationFromUrl();
  const queryString = hostname ? `?hostname=${hostname}` : '';

  return useQuery<MenuConfigResponse, AxiosError>({
    queryKey: ['menu-config', hostname], // Include hostname in query key for proper caching
    queryFn: async () => {
      const response = await apiInstance.get(`/ordering/get-menu-config${queryString}`);
      const data = response.data;

      // Set all the configuration values in the store
      if (data) {
        if (data.companyRef) {
          setCompanyRef(data.companyRef);
        }
        if (data.locationRef) {
          setLocationRef(data.locationRef);
        }
        if (data.company?.name) {
          setCompanyName(data.company.name.en);
        }
        if (data.name) {
          setLocationName(data.name.en);
        }

        setIsPickupMenuAvailable(data.isPickupMenuAvailable);

        setIsDeliveryMenuAvailable(data.isDeliveryMenuAvailable);
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
    refetchOnReconnect: false, // Don't refetch on network reconnect
    ...options,
  });
}
