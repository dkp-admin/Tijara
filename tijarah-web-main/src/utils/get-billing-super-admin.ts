import { DateTime } from "luxon";

interface BillingItem {
  name: string;
  amount: number;
}

interface BillingCalculationParams {
  // Current subscription data
  currentLocationLimit: number;
  currentDeviceLimit: number;
  currentAddons: Array<any>;
  currentHardwares?: Array<any>;
  subscriptionEndDate: string;
  billingCycle: string;

  // New values
  newLocationLimit: number;
  newDeviceLimit: number;
  newAddons: Array<any>;
  newHardwares?: Array<any>;

  // Package data
  packageAddons: Array<any>;
  packageHardwares?: Array<any>;
  packagePrices: Array<any>;

  currentPackageRef: string;
  newPackageRef: string;

  // Renewal option
  renewPackage?: boolean;

  // Trial conversion
  isTrial?: boolean;
}

export const getBillingSuperAdmin = (
  params: BillingCalculationParams
): {
  items: BillingItem[];
  total: number;
} => {
  const {
    currentLocationLimit,
    currentDeviceLimit,
    currentAddons = [],
    currentHardwares = [],
    subscriptionEndDate,
    billingCycle,
    newLocationLimit,
    newDeviceLimit,
    newAddons = [],
    newHardwares = [],
    packageAddons = [],
    packageHardwares = [],
    packagePrices = [],
    currentPackageRef,
    newPackageRef,
    renewPackage = false,
    isTrial = false,
  } = params;

  const items: BillingItem[] = [];
  let total = 0;

  // Helper function to calculate prorated amount
  const calculateProratedAmount = (price: number): number => {
    if (renewPackage || !subscriptionEndDate) return price;

    const remainingDays = Math.ceil(
      DateTime.fromISO(subscriptionEndDate).diff(DateTime.now(), "days").days
    );

    const totalDaysInCycle =
      billingCycle === "monthly" ? 30 : billingCycle === "quarterly" ? 90 : 365;

    const proratedAmount = (remainingDays / totalDaysInCycle) * price;

    return Math.round(proratedAmount * 100) / 100;
  };

  // Helper function to get price info
  const getPriceInfo = (prices: any[] = [], cycle: string) => {
    const priceObj = prices.find((p) => p.type === cycle) || {
      price: 0,
      discountPercentage: 0,
    };
    const originalPrice = priceObj.price;
    const discountedPrice =
      originalPrice * (1 - (priceObj.discountPercentage || 0) / 100);
    return { originalPrice, discountedPrice };
  };

  const packagePriceInfo = getPriceInfo(packagePrices, billingCycle);
  const packageCost = packagePriceInfo.discountedPrice;
  const proratedPackageCost = calculateProratedAmount(packageCost);

  // Always include package amount when renewPackage is true or when package has changed
  if (
    (renewPackage && proratedPackageCost > 0) ||
    (proratedPackageCost > 0 && currentPackageRef !== newPackageRef)
  ) {
    items.push({
      name: "Package Amount",
      amount: proratedPackageCost,
    });
    total += proratedPackageCost;
  }

  // Calculate location cost difference
  const locationAddon = packageAddons.find(
    (addon) => addon.key === "location_addon"
  );

  // Show locations when renewPackage is true or when there's a difference
  if (
    locationAddon &&
    (renewPackage || newLocationLimit > currentLocationLimit)
  ) {
    const locationPriceInfo = getPriceInfo(locationAddon.prices, billingCycle);

    // Always show the difference between new and current limits
    const locationCount = newLocationLimit - currentLocationLimit;

    if (locationCount > 0) {
      const locationCost = locationCount * locationPriceInfo.discountedPrice;
      const proratedAmount = calculateProratedAmount(locationCost);

      if (proratedAmount > 0) {
        items.push({
          name: "Additional Locations",
          amount: proratedAmount,
        });
        total += proratedAmount;
      }
    }
  }

  // Calculate device cost difference
  const deviceAddon = packageAddons.find(
    (addon) => addon.key === "device_addon"
  );

  // Show devices when renewPackage is true or when there's a difference
  if (deviceAddon && (renewPackage || newDeviceLimit > currentDeviceLimit)) {
    const devicePriceInfo = getPriceInfo(deviceAddon.prices, billingCycle);

    // Always show the difference between new and current limits
    const deviceCount = newDeviceLimit - currentDeviceLimit;

    if (deviceCount > 0) {
      const deviceCost = deviceCount * devicePriceInfo.discountedPrice;
      const proratedAmount = calculateProratedAmount(deviceCost);

      if (proratedAmount > 0) {
        items.push({
          name: "Additional Devices",
          amount: proratedAmount,
        });
        total += proratedAmount;
      }
    }
  }

  // Calculate addons cost
  const currentAddonKeys = currentAddons.map((addon) => addon.key) || [];
  const newAddonKeys = newAddons.map((addon) => addon.key) || [];

  // If renewPackage is true, include all addons in the new subscription
  // Otherwise, only include newly added addons
  const addonsToShow = renewPackage
    ? newAddonKeys
    : newAddonKeys.filter((key) => !currentAddonKeys.includes(key));

  addonsToShow.forEach((key) => {
    const addon = packageAddons.find((addon) => addon.key === key);
    if (
      addon &&
      addon.key !== "location_addon" &&
      addon.key !== "device_addon"
    ) {
      const addonPriceInfo = getPriceInfo(addon.prices, billingCycle);
      const proratedAmount = calculateProratedAmount(
        addonPriceInfo.discountedPrice
      );

      if (proratedAmount > 0) {
        items.push({
          name: addon.name,
          amount: proratedAmount,
        });
        total += proratedAmount;
      }
    }
  });

  // Calculate hardware costs
  // Show hardware when renewPackage is true and it's a trial conversion, or when there are new hardwares
  if (newHardwares.length > 0 && ((renewPackage && isTrial) || !renewPackage)) {
    const currentHardwareMap = new Map();
    currentHardwares.forEach((hw) => {
      currentHardwareMap.set(hw.key, hw.qty || 1);
    });

    newHardwares.forEach((hardware) => {
      const incrementalQty = hardware.qty || 0;
      if (incrementalQty > 0) {
        const packageHardware = packageHardwares.find(
          (hw) => hw.key === hardware.key
        );
        if (packageHardware) {
          const hardwareCost = incrementalQty * packageHardware.price;
          // Hardware is not prorated in this context
          const hardwareAmount = hardwareCost;

          if (hardwareAmount > 0) {
            const hwName = packageHardware.name
              ? typeof packageHardware.name === "string"
                ? packageHardware.name
                : packageHardware.name.en
              : "Hardware";

            items.push({
              name: `${hwName} (${incrementalQty} units)`,
              amount: hardwareAmount,
            });
            total += hardwareAmount;
          }
        }
      }
    });
  }

  return { items, total };
};
