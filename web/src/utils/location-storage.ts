interface LocationData {
  lat: number;
  lng: number;
  address?: string;
  timestamp: number;
}

interface LocationPermissionData {
  status: 'granted' | 'denied' | 'prompt' | 'dismissed';
  timestamp: number;
  expiresAt: number;
}

// Storage keys
const LOCATION_DATA_KEY = 'hyperlocal_location_data';
const LOCATION_PERMISSION_KEY = 'hyperlocal_location_permission';

// Cache duration: 24 hours for location data, 7 days for permissions
const LOCATION_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const PERMISSION_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Store location data in localStorage with timestamp
 */
export const storeLocationData = (locationData: Omit<LocationData, 'timestamp'>): void => {
  try {
    const dataToStore: LocationData = {
      ...locationData,
      timestamp: Date.now(),
    };
    localStorage.setItem(LOCATION_DATA_KEY, JSON.stringify(dataToStore));
    
    // Dispatch storage event for cross-tab communication
    window.dispatchEvent(new StorageEvent('storage', {
      key: LOCATION_DATA_KEY,
      newValue: JSON.stringify(dataToStore),
      storageArea: localStorage
    }));
  } catch (error) {
    console.error('Error storing location data:', error);
  }
};

/**
 * Get cached location data from localStorage
 */
export const getCachedLocationData = (): LocationData | null => {
  try {
    const stored = localStorage.getItem(LOCATION_DATA_KEY);
    if (!stored) return null;

    const locationData: LocationData = JSON.parse(stored);
    
    // Check if data is expired
    if (Date.now() - locationData.timestamp > LOCATION_CACHE_DURATION) {
      localStorage.removeItem(LOCATION_DATA_KEY);
      return null;
    }

    return locationData;
  } catch (error) {
    console.error('Error getting cached location data:', error);
    return null;
  }
};

/**
 * Store location permission status with expiration
 */
export const storeLocationPermission = (status: LocationPermissionData['status']): void => {
  try {
    const permissionData: LocationPermissionData = {
      status,
      timestamp: Date.now(),
      expiresAt: Date.now() + PERMISSION_CACHE_DURATION,
    };
    localStorage.setItem(LOCATION_PERMISSION_KEY, JSON.stringify(permissionData));
  } catch (error) {
    console.error('Error storing location permission:', error);
  }
};

/**
 * Get stored location permission status
 */
export const getStoredLocationPermission = (): LocationPermissionData | null => {
  try {
    const stored = localStorage.getItem(LOCATION_PERMISSION_KEY);
    if (!stored) return null;

    const permissionData: LocationPermissionData = JSON.parse(stored);
    
    // Check if permission data is expired
    if (Date.now() > permissionData.expiresAt) {
      localStorage.removeItem(LOCATION_PERMISSION_KEY);
      return null;
    }

    return permissionData;
  } catch (error) {
    console.error('Error getting stored location permission:', error);
    return null;
  }
};

/**
 * Clear all location-related data from storage
 */
export const clearLocationData = (): void => {
  try {
    localStorage.removeItem(LOCATION_DATA_KEY);
    localStorage.removeItem(LOCATION_PERMISSION_KEY);
  } catch (error) {
    console.error('Error clearing location data:', error);
  }
};

/**
 * Check if location permission should be requested
 * Returns true if we should ask for permission, false if we should skip
 */
export const shouldRequestLocationPermission = (): boolean => {
  const storedPermission = getStoredLocationPermission();
  
  // If no stored permission, we should request
  if (!storedPermission) return true;
  
  // If user previously denied or dismissed, don't ask again until expiration
  if (storedPermission.status === 'denied' || storedPermission.status === 'dismissed') {
    return false;
  }
  
  // If granted, check if we have valid location data
  if (storedPermission.status === 'granted') {
    const locationData = getCachedLocationData();
    return !locationData; // Request if no valid location data
  }
  
  return true;
};

/**
 * Safari-specific geolocation check
 * Safari has different behavior for geolocation permissions
 */
export const isSafari = (): boolean => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

/**
 * Check if geolocation is supported and available
 */
export const isGeolocationSupported = (): boolean => {
  return 'geolocation' in navigator;
};

/**
 * Check if permissions API is supported (not available in Safari)
 */
export const isPermissionsAPISupported = (): boolean => {
  return 'permissions' in navigator;
};
