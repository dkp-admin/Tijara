import { useState, useEffect } from 'react';

interface LocationState {
  lat: number;
  lng: number;
  timestamp: number;
}

export const useUserLocation = () => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [permission, setPermission] = useState<PermissionState | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load cached location on mount
  useEffect(() => {
    const cachedLocation = localStorage.getItem('userLocation');
    if (cachedLocation) {
      try {
        const parsed = JSON.parse(cachedLocation);
        // Only use cached location if it's less than 15 minutes old
        if (Date.now() - parsed.timestamp < 15 * 60 * 1000) {
          setLocation(parsed);
        }
      } catch {
        localStorage.removeItem('userLocation');
      }
    }
  }, []);

  const requestLocation = async () => {
    try {
      if (!navigator.geolocation) {
        console.log('Geolocation not supported');
        setError('Geolocation is not supported by this browser');
        return;
      }

      console.log('Requesting location permission...');
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
      console.log('Permission status:', permissionStatus.state);
      setPermission(permissionStatus.state);

      // Listen for permission changes
      permissionStatus.addEventListener('change', () => {
        console.log('Permission status changed:', permissionStatus.state);
        setPermission(permissionStatus.state);
      });

      if (permissionStatus.state === 'granted') {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              timestamp: Date.now(),
            };
            setLocation(newLocation);
            setError(null);
            localStorage.setItem('userLocation', JSON.stringify(newLocation));
          },
          (error) => {
            setError(error.message);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          },
        );
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to get location');
    }
  };

  return {
    location,
    permission,
    error,
    requestLocation,
  };
};
