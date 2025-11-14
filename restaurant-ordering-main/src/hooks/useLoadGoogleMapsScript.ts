import { useEffect, useState } from 'react';
import { config } from '@/src/config';

export function useLoadGoogleMapsScript() {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.google?.maps) {
      setMapLoaded(true);
      return;
    }
    let script: HTMLScriptElement | null = null;
    const existingScript = document.querySelector(
      'script[src^="https://maps.googleapis.com/maps/api/js"]',
    ) as HTMLScriptElement | null;
    if (existingScript) {
      if (existingScript.hasAttribute('data-gmaps-loaded')) {
        setMapLoaded(true);
      } else {
        existingScript.addEventListener('load', () => setMapLoaded(true));
      }
      return;
    }
    script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.GOOGLE_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => {
      script?.setAttribute('data-gmaps-loaded', 'true');
      setMapLoaded(true);
    };
    document.body.appendChild(script);
    return () => {
      if (script) {
        script.onload = null;
      }
    };
  }, []);

  return mapLoaded;
}
