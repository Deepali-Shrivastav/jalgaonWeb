import { useState, useCallback } from 'react';

interface LocationState {
  lat: number | null;
  lng: number | null;
  hasLocation: boolean;
  error: string | null;
  isLoading: boolean;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    lat: null,
    lng: null,
    hasLocation: false,
    error: null,
    isLoading: false,
  });

  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Geolocation is not supported by this browser' }));
      return;
    }

    setState((s) => ({ ...s, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          hasLocation: true,
          error: null,
          isLoading: false,
        });
      },
      (error) => {
        let msg = 'Failed to retrieve location';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied';
        }
        setState((s) => ({
          ...s,
          error: msg,
          isLoading: false,
          hasLocation: false,
        }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return { ...state, requestLocation };
}
