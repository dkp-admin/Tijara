/**
 * Format address for display in hyperlocal components
 * Extracts location name from full address, prioritizing city/locality over full address
 */
export const formatAddressForDisplay = (fullAddress: string): string => {
  if (!fullAddress) return '';

  // Split address by commas and clean up
  const addressParts = fullAddress.split(',').map((part) => part.trim());

  // If address has multiple parts, try to extract the most relevant location name
  if (addressParts.length > 1) {
    // Look for city/locality (usually the second or third part)
    // Skip the first part if it's a street number/name
    const relevantPart = addressParts.find((part, index) => {
      // Skip very short parts (likely street numbers)
      if (part.length < 3) return false;

      // Skip parts that look like street addresses (contain numbers)
      if (index === 0 && /\d/.test(part)) return false;

      // Prefer parts that don't contain too many numbers
      const numberCount = (part.match(/\d/g) || []).length;
      return numberCount <= 2;
    });

    if (relevantPart) {
      return relevantPart;
    }
  }

  // Fallback to first meaningful part or truncated full address
  const firstPart = addressParts[0];
  if (firstPart && firstPart.length > 2) {
    return firstPart.length > 30 ? firstPart.substring(0, 30) + '...' : firstPart;
  }

  // Final fallback - truncate full address
  return fullAddress.length > 30 ? fullAddress.substring(0, 30) + '...' : fullAddress;
};

/**
 * Extract city name from a full address
 */
export const extractCityFromAddress = (fullAddress: string): string => {
  if (!fullAddress) return '';

  const addressParts = fullAddress.split(',').map((part) => part.trim());

  // Look for city-like parts (usually 2nd or 3rd part, without numbers)
  const cityPart = addressParts.find((part, index) => {
    if (index === 0) return false; // Skip first part (usually street)
    if (part.length < 3) return false; // Skip very short parts

    // Look for parts that don't have many numbers (cities usually don't)
    const numberCount = (part.match(/\d/g) || []).length;
    return numberCount === 0;
  });

  return cityPart || addressParts[Math.min(1, addressParts.length - 1)] || '';
};

/**
 * Format coordinates for display
 */
export const formatCoordinates = (lat: number, lng: number): string => {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

/**
 * Check if an address looks like a valid location
 */
export const isValidAddress = (address: string): boolean => {
  if (!address || address.length < 5) return false;

  // Check if address contains some meaningful content
  const meaningfulWords = address
    .split(/[\s,]+/)
    .filter((word) => word.length > 2 && !/^\d+$/.test(word));

  return meaningfulWords.length >= 2;
};
