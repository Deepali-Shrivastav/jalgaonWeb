'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { reverseGeocode, searchLocation, LocationDetails, GeocodeResult, getCurrentLocation } from '@/utils/locationService';

// Fix for default Leaflet marker icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (lat: number, lng: number, address: LocationDetails) => void;
  initialLat?: number;
  initialLng?: number;
}

const DEFAULT_CENTER = { lat: 21.0076, lng: 75.5626 }; // Jalgaon fallback

export default function LocationMapPicker({
  isOpen,
  onClose,
  onConfirm,
  initialLat,
  initialLng,
}: LocationMapPickerProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number }>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : DEFAULT_CENTER
  );
  const [addressPreview, setAddressPreview] = useState<LocationDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>(null);

  // Initialize with initial position or current location if no initial position
  useEffect(() => {
    if (isOpen) {
      if (initialLat && initialLng) {
        setPosition({ lat: initialLat, lng: initialLng });
        updateAddressDetails(initialLat, initialLng);
      } else {
        // Try to get current location if no initial position provided
        handleCenterOnCurrentLocation();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialLat, initialLng]);

  // Handle map resizing when modal opens to prevent gray areas
  useEffect(() => {
    if (isOpen && mapInstance) {
      setTimeout(() => {
        mapInstance.invalidateSize();
      }, 100); // Wait for modal animation to complete
    }
  }, [isOpen, mapInstance]);

  const updateAddressDetails = async (lat: number, lng: number) => {
    setIsLoading(true);
    // Clear previous so user knows it's fetching a new one
    setAddressPreview(null);
    try {
      const details = await reverseGeocode(lat, lng);
      setAddressPreview(details);
    } catch (error) {
      console.error("Error getting address:", error);
      // Fallback if API rate limits us or fails
      setAddressPreview({
        detailedAddress: `Location at Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)} (Please refine manually)`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCenterOnCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const coords = await getCurrentLocation();
      setPosition(coords);
      if (mapInstance) {
        mapInstance.flyTo([coords.lat, coords.lng], 15);
      }
      await updateAddressDetails(coords.lat, coords.lng);
    } catch (error) {
      console.error("Failed to get current location:", error);
      // Fallback to Jalgaon if we couldn't get location and don't have one
      if (!initialLat || !initialLng) {
         setPosition(DEFAULT_CENTER);
         if (mapInstance) mapInstance.flyTo([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 13);
         await updateAddressDetails(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length >= 3) {
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await searchLocation(query);
        setSuggestions(results);
      }, 500); // 500ms debounce
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (result: GeocodeResult) => {
    setPosition({ lat: result.lat, lng: result.lng });
    setAddressPreview(result.address);
    setSearchQuery('');
    setSuggestions([]);
    if (mapInstance) {
      mapInstance.flyTo([result.lat, result.lng], 16);
    }
  };

  const handleConfirm = () => {
    if (addressPreview) {
      onConfirm(position.lat, position.lng, addressPreview);
    }
  };

  // Component to handle map clicks and drag events
  function MapEvents() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition({ lat, lng });
        updateAddressDetails(lat, lng);
      },
    });
    return null;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-outline-variant">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">map</span>
            Set Location
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-surface-container rounded-full text-secondary hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
          
          {/* Map Area */}
          <div className="w-full md:w-2/3 h-64 md:h-[500px] relative">
            <MapContainer
              center={[position.lat, position.lng]}
              zoom={13}
              className="h-full w-full"
              ref={setMapInstance}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                position={[position.lat, position.lng]}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const marker = e.target;
                    const pos = marker.getLatLng();
                    setPosition({ lat: pos.lat, lng: pos.lng });
                    updateAddressDetails(pos.lat, pos.lng);
                  },
                }}
              />
              <MapEvents />
            </MapContainer>
            
            {/* Search overlay on map */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[400]">
              <div className="relative">
                <div className="flex bg-white rounded-lg shadow-md overflow-hidden border border-outline-variant">
                  <span className="material-symbols-outlined text-outline p-3">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search for a location..."
                    className="flex-1 p-3 outline-none text-on-surface"
                  />
                  {searchQuery && (
                    <button onClick={() => { setSearchQuery(''); setSuggestions([]); }} className="p-3 text-outline hover:text-on-surface">
                       <span className="material-symbols-outlined">close</span>
                    </button>
                  )}
                </div>
                
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-outline-variant max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        className="w-full text-left p-3 hover:bg-surface-container border-b border-hairline-soft last:border-b-0 text-sm transition-colors"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion.address.detailedAddress}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleCenterOnCurrentLocation}
              className="absolute bottom-6 right-4 z-[400] bg-white p-3 rounded-full shadow-lg border border-outline-variant text-primary hover:bg-primary/10 transition-colors"
              title="Center on my location"
            >
              <span className="material-symbols-outlined">my_location</span>
            </button>
          </div>

          {/* Details Area */}
          <div className="w-full md:w-1/3 p-4 flex flex-col bg-surface-container-lowest border-t md:border-t-0 md:border-l border-outline-variant overflow-y-auto">
            <h3 className="font-bold text-on-surface mb-4">Location Details</h3>
            
            <div className="bg-surface p-4 rounded-xl border border-hairline-soft mb-4 flex-1">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-secondary gap-2">
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  <span>Fetching address...</span>
                </div>
              ) : addressPreview ? (
                <div>
                  <p className="text-sm font-semibold text-primary mb-1">Selected Address:</p>
                  <p className="text-sm text-on-surface-variant mb-4">{addressPreview.detailedAddress}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-secondary">Lat:</span>
                      <p className="font-mono bg-surface-container px-1 py-0.5 rounded">{position.lat.toFixed(5)}</p>
                    </div>
                    <div>
                      <span className="text-secondary">Lng:</span>
                      <p className="font-mono bg-surface-container px-1 py-0.5 rounded">{position.lng.toFixed(5)}</p>
                    </div>
                    
                    {addressPreview.city && (
                      <div className="col-span-2 mt-2">
                        <span className="text-secondary">City:</span>
                        <p className="font-semibold">{addressPreview.city}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-secondary text-center">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">pin_drop</span>
                  <p>Click on the map or search to select a location.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-auto">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-bold text-secondary bg-surface-container hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!addressPreview || isLoading}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
