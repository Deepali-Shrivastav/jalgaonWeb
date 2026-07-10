export interface LocationDetails {
  detailedAddress: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  district?: string;
  area?: string;
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  address: LocationDetails;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Use a simple cache for reverse geocoding to avoid duplicate requests
const geocodeCache = new Map<string, LocationDetails>();

/**
 * Gets the user's current location using Browser Geolocation API
 */
export const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location permission denied by user.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location information is unavailable.'));
            break;
          case error.TIMEOUT:
            reject(new Error('The request to get user location timed out.'));
            break;
          default:
            reject(new Error('An unknown error occurred.'));
            break;
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
};

/**
 * Reverse geocodes latitude and longitude into address details using Nominatim
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<LocationDetails> => {
  const cacheKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'Accept-Language': 'en'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch address details from Nominatim');
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    const address = data.address || {};
    
    const addressParts = [];
    if (address.amenity || address.shop || address.building) {
        addressParts.push(address.amenity || address.shop || address.building);
    }
    if (address.house_number) addressParts.push(address.house_number);
    if (address.road || address.street) addressParts.push(address.road || address.street);
    if (address.suburb || address.neighbourhood || address.residential) {
        addressParts.push(address.suburb || address.neighbourhood || address.residential);
    }
    if (address.city || address.town || address.village) {
        addressParts.push(address.city || address.town || address.village);
    }
    if (address.state_district) addressParts.push(address.state_district);
    
    // Use addressParts if it has good detail, otherwise fallback to display_name
    let detailedAddress = data.display_name || addressParts.join(', ');
    if (addressParts.length > 0 && (!data.display_name || addressParts.length >= 3)) {
      detailedAddress = addressParts.join(', ');
    }

    const result: LocationDetails = {
      detailedAddress,
      city: address.city || address.town || address.village,
      state: address.state,
      pincode: address.postcode,
      country: address.country,
      district: address.state_district || address.county,
      area: address.suburb || address.neighbourhood || address.residential
    };

    geocodeCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Reverse Geocoding Error:', error);
    throw error;
  }
};

/**
 * Forward geocoding (Search) using Nominatim
 */
export const searchLocation = async (query: string): Promise<GeocodeResult[]> => {
  if (query.length < 3) return [];
  
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?format=jsonv2&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`,
      {
        headers: {
          'Accept-Language': 'en'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Search failed');
    }

    const data = await response.json();
    
    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      address: {
        detailedAddress: item.display_name,
        city: item.address?.city || item.address?.town || item.address?.village,
        state: item.address?.state,
        pincode: item.address?.postcode,
        country: item.address?.country,
        district: item.address?.state_district || item.address?.county,
        area: item.address?.suburb || item.address?.neighbourhood || item.address?.residential
      }
    }));
  } catch (error) {
    console.error('Search Location Error:', error);
    return [];
  }
};
