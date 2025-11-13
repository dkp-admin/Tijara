import React, { useEffect, useRef, useState } from 'react';
import { useLoadGoogleMapsScript } from '@/src/hooks/useLoadGoogleMapsScript';

declare global {
  interface Window {
    google: unknown;
  }
}

interface GoogleMapPickerProps {
  onLocationChange: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function GoogleMapPicker({
  onLocationChange,
  initialLat,
  initialLng,
}: GoogleMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLInputElement>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const mapLoaded = useLoadGoogleMapsScript();
  const markerRef = useRef<google.maps.Marker | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Initialize map and controls
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google?.maps) return;

    const initialLocation = {
      lat: initialLat || 0,
      lng: initialLng || 0,
    };

    const map = new window.google.maps.Map(mapRef.current, {
      center: initialLocation,
      zoom: initialLat && initialLng ? 15 : 2, // Zoom in if we have coordinates, otherwise show world map
      mapTypeControl: true,
      streetViewControl: true,
    });
    mapInstanceRef.current = map;

    const marker = new window.google.maps.Marker({
      position: initialLocation,
      map: initialLat && initialLng ? map : null, // Only show marker if we have initial coordinates
      draggable: true,
    });
    markerRef.current = marker;

    // Only get address and notify if we have initial coordinates
    if (initialLat && initialLng) {
      getAddress(initialLat, initialLng);
      onLocationChange(initialLat, initialLng, '');
    }

    // Add click event to map
    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      if (!markerRef.current?.getMap()) {
        markerRef.current?.setMap(map);
      }
      marker.setPosition({ lat, lng });
      getAddress(lat, lng);
      onLocationChange(lat, lng, '');
    });

    // Add dragend event to marker
    marker.addListener('dragend', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      getAddress(lat, lng);
      onLocationChange(lat, lng, '');
    });

    // Add Places Autocomplete
    if (searchBoxRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(searchBoxRef.current, {
        fields: ['geometry', 'formatted_address'],
      });
      autocompleteRef.current?.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          map.setCenter({ lat, lng });
          map.setZoom(15);
          if (!markerRef.current?.getMap()) {
            markerRef.current?.setMap(map);
          }
          marker.setPosition({ lat, lng });
          getAddress(lat, lng);
          onLocationChange(lat, lng, place.formatted_address || '');
        }
      });
    }
    // eslint-disable-next-line
  }, [mapLoaded]);

  // Reverse geocode to get address
  const getAddress = (lat: number, lng: number) => {
    if (!window.google?.maps) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat, lng } },
      (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        if (status === 'OK' && results && results[0]) {
          setSelectedAddress(results[0].formatted_address);
          onLocationChange(lat, lng, results[0].formatted_address);
        } else {
          setSelectedAddress('');
          onLocationChange(lat, lng, '');
        }
      },
    );
  };

  // Locate Me button handler
  const handleLocateMe = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    try {
      // Check permission status first
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      console.log('Location permission status:', permission.state);

      if (permission.state === 'denied') {
        alert('Please enable location access in your browser settings to use this feature');
        return;
      }

      // Request position with proper error handling
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log('Location acquired successfully');
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          if (mapInstanceRef.current && markerRef.current) {
            if (!markerRef.current.getMap()) {
              markerRef.current.setMap(mapInstanceRef.current);
            }
            mapInstanceRef.current.setCenter({ lat, lng });
            markerRef.current.setPosition({ lat, lng });
            mapInstanceRef.current.setZoom(15); // Zoom in when location is found
          }
          getAddress(lat, lng);
          onLocationChange(lat, lng, '');
        },
        (error) => {
          console.log('Location error:', error.message);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              alert('Please allow location access to use this feature');
              break;
            case error.POSITION_UNAVAILABLE:
              alert('Location information is unavailable');
              break;
            case error.TIMEOUT:
              alert('Location request timed out');
              break;
            default:
              alert('An unknown error occurred while getting location');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    } catch (error) {
      console.error('Error requesting location:', error);
      alert('Failed to get your location. Please try again.');
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          width: '100%',
          height: 240,
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: 12,
          position: 'relative',
        }}
      >
        {/* Overlay: Search Box and Locate Me Button in a flex row */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            right: 12,
            zIndex: 2,
            display: 'flex',
            gap: 8,
            maxWidth: 480,
          }}
        >
          <input
            ref={searchBoxRef}
            type="text"
            placeholder="Search for a place..."
            style={{
              flex: 1,
              minWidth: 0,
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #ddd',
              fontSize: 16,
              background: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          />
          <button
            type="button"
            onClick={handleLocateMe}
            style={{
              padding: '8px 16px',
              background: '#f97315',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 500,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Locate Me
          </button>
        </div>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </div>
      {/* Show selected address below the map */}
      {selectedAddress && (
        <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-gray-800 dark:text-gray-200">
          {selectedAddress}
        </div>
      )}
    </div>
  );
}
