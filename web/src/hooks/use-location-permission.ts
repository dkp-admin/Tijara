import { useCallback, useEffect, useState } from "react";
import {
  getCachedLocationData,
  getStoredLocationPermission,
  isGeolocationSupported,
  isPermissionsAPISupported,
  isSafari,
  shouldRequestLocationPermission,
  storeLocationData,
  storeLocationPermission,
} from "src/utils/location-storage";

interface LocationData {
  lat: number;
  lng: number;
  address?: string;
}

interface UseLocationPermissionReturn {
  locationData: LocationData | null;
  permissionStatus:
    | "granted"
    | "denied"
    | "prompt"
    | "dismissed"
    | "loading"
    | null;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  hasValidLocation: boolean;
  shouldShowPermissionDialog: boolean;
  dismissDialog: () => void;
  clearError: () => void;
}

export const useLocationPermission = (): UseLocationPermissionReturn => {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<UseLocationPermissionReturn["permissionStatus"]>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldShowPermissionDialog, setShouldShowPermissionDialog] =
    useState(false);

  // Reverse geocoding function
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch address");
      }

      const data = await response.json();
      console.log(data, "ASDJKHASKJDHSAJKD");
      return (
        data?.address?.town ||
        data?.address?.city ||
        data?.address?.county ||
        "Address not found"
      );
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return "Unable to get address";
    }
  };

  // Request location permission and get coordinates
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isGeolocationSupported()) {
      setError("Geolocation is not supported by this browser");
      storeLocationPermission("denied");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000, // 10 seconds timeout
            maximumAge: 5 * 60 * 1000, // 5 minutes cache
          });
        }
      );

      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      // Get address
      const address = await reverseGeocode(coords.lat, coords.lng);

      const locationWithAddress = {
        ...coords,
        address,
      };

      // Store the location data and permission
      storeLocationData(locationWithAddress);
      storeLocationPermission("granted");

      setLocationData(locationWithAddress);
      setPermissionStatus("granted");
      setShouldShowPermissionDialog(false);

      return true;
    } catch (error: any) {
      console.error("Location permission error:", error);

      let errorMessage = "Unable to get your location";
      let permissionStatus: "denied" | "dismissed" = "denied";

      if (error.code) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission was denied";
            permissionStatus = "denied";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable";
            permissionStatus = "denied";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            permissionStatus = "dismissed"; // Timeout might be temporary
            break;
          default:
            errorMessage = "An unknown error occurred getting location";
            permissionStatus = "denied";
        }
      }

      setError(errorMessage);
      setPermissionStatus(permissionStatus);
      storeLocationPermission(permissionStatus);
      setShouldShowPermissionDialog(false);

      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check initial permission state
  const checkInitialPermissionState = useCallback(async () => {
    // First, check if we have cached location data
    const cachedLocation = getCachedLocationData();
    if (cachedLocation) {
      setLocationData(cachedLocation);
      setPermissionStatus("granted");
      return;
    }

    // Check stored permission
    const storedPermission = getStoredLocationPermission();
    if (storedPermission) {
      setPermissionStatus(storedPermission.status);

      // If permission was granted but no location data, we might need to re-request
      if (storedPermission.status === "granted") {
        setShouldShowPermissionDialog(true);
      }
      return;
    }

    // For Safari or browsers without Permissions API, check if we should request
    if (isSafari() || !isPermissionsAPISupported()) {
      if (shouldRequestLocationPermission()) {
        setShouldShowPermissionDialog(true);
        setPermissionStatus("prompt");
      }
      return;
    }

    // Use Permissions API if available
    try {
      const result = await navigator.permissions.query({ name: "geolocation" });
      setPermissionStatus(result.state as any);

      if (result.state === "granted") {
        // If granted but no cached data, request location
        if (!cachedLocation) {
          await requestPermission();
        }
      } else if (result.state === "prompt") {
        if (shouldRequestLocationPermission()) {
          setShouldShowPermissionDialog(true);
        }
      }
    } catch (error) {
      console.error("Error checking permission state:", error);
      // Fallback for browsers that don't support permissions query
      if (shouldRequestLocationPermission()) {
        setShouldShowPermissionDialog(true);
        setPermissionStatus("prompt");
      }
    }
  }, [requestPermission]);

  // Function to manually dismiss the dialog
  const dismissDialog = useCallback(() => {
    setShouldShowPermissionDialog(false);
    storeLocationPermission("dismissed");
    setPermissionStatus("dismissed");
  }, []);

  // Function to clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize on mount
  useEffect(() => {
    checkInitialPermissionState();
  }, [checkInitialPermissionState]);

  const hasValidLocation = locationData !== null;

  return {
    locationData,
    permissionStatus,
    isLoading,
    error,
    requestPermission,
    hasValidLocation,
    shouldShowPermissionDialog,
    dismissDialog,
    clearError,
  };
};
