import { DEFAULT_PAYMENT_TYPES } from "./constants";

/**
 * Merges existing payment types with the complete list of available payment types.
 * This ensures that new payment types are automatically added to existing devices
 * while preserving the status of existing payment types.
 * 
 * @param existingPaymentTypes - The current payment types from device configuration
 * @returns Merged array of payment types with new ones added as disabled by default
 */
export const mergePaymentTypes = (existingPaymentTypes: any[] = []) => {
  const mergedPaymentTypes: any[] = [];

  // Add existing payment types first (preserving their status)
  if (existingPaymentTypes?.length > 0) {
    existingPaymentTypes.forEach((existingType) => {
      mergedPaymentTypes.push({
        ...existingType,
        // Ensure the existing type has the correct structure
        _id: existingType._id,
        name: existingType.name,
        status: existingType.status,
      });
    });
  }

  // Add any new payment types that don't exist in the existing list
  DEFAULT_PAYMENT_TYPES.forEach((defaultType) => {
    const exists = mergedPaymentTypes.find(
      (type) => type.name === defaultType.name
    );
    if (!exists) {
      mergedPaymentTypes.push({
        ...defaultType,
        // New payment types should be disabled by default
        status: false,
      });
    }
  });

  // Sort by _id to maintain consistent order
  return mergedPaymentTypes.sort((a, b) => a._id - b._id);
};
