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

  newAddons: Array<any>;
  newHardwares?: Array<any>;

  // Package data
  packageAddons: Array<any>;
  packageHardwares?: Array<any>;
  packagePrices?: Array<any>;

  // Special flags
  isTrialConversion?: boolean;
  renewPackage?: boolean;
}

export const getBilling = (
  params: BillingCalculationParams
): {
  items: BillingItem[];
  total: number;
} => {
  const {
    currentAddons,
    currentHardwares = [],
    subscriptionEndDate,
    billingCycle,
    newAddons,
    newHardwares = [],
    packageAddons,
    packageHardwares = [],
    packagePrices = [],
    renewPackage = false,
    isTrialConversion = false,
  } = params;

  const items: BillingItem[] = [];
  let total = 0;

  const calculateProratedAmount = (price: number): number => {
    if (isTrialConversion || renewPackage) {
      return price;
    }

    if (!subscriptionEndDate) return 0;

    const remainingDays = Math.ceil(
      DateTime.fromISO(subscriptionEndDate).diff(DateTime.now(), "days").days
    );

    const totalDaysInCycle =
      billingCycle === "monthly" ? 30 : billingCycle === "quarterly" ? 90 : 365;

    const proratedAmount = (remainingDays / totalDaysInCycle) * price;

    return Math.round(proratedAmount * 100) / 100;
  };

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

  if (renewPackage || isTrialConversion) {
    const packagePriceInfo = getPriceInfo(packagePrices, billingCycle);
    const packageCost = packagePriceInfo.discountedPrice;
    const proratedPackageCost = calculateProratedAmount(packageCost);

    if (proratedPackageCost > 0) {
      items.push({
        name: "Package Amount",
        amount: proratedPackageCost,
      });
      total += proratedPackageCost;
    }
  }

  const specialAddonsMap = new Map();
  currentAddons.forEach((addon) => {
    if (addon.key === "location_addon") {
      specialAddonsMap.set("location_addon", addon.qty || 0);
    } else if (addon.key === "device_addon") {
      specialAddonsMap.set("device_addon", addon.qty || 0);
    }
  });

  const locationAddon = packageAddons.find(
    (addon) => addon.key === "location_addon"
  );
  if (locationAddon) {
    const currentLocationAddon = specialAddonsMap.get("location_addon") || 0;
    const incrementalLocationAddon =
      newAddons.find((addon) => addon.key === "location_addon")?.qty || 0;

    const locationCount = isTrialConversion
      ? incrementalLocationAddon
      : incrementalLocationAddon - currentLocationAddon;

    const locationPriceInfo = getPriceInfo(locationAddon.prices, billingCycle);
    const locationCost = locationPriceInfo.discountedPrice;
    const proratedAmount = calculateProratedAmount(
      locationCost * locationCount
    );

    if (proratedAmount > 0) {
      items.push({
        name: "Additional Locations",
        amount: proratedAmount,
      });
      total += proratedAmount;
    }
  }

  const deviceAddon = packageAddons.find(
    (addon) => addon.key === "device_addon"
  );
  if (deviceAddon) {
    const currentDeviceAddon = specialAddonsMap.get("device_addon") || 0;
    const incrementalDeviceAddon =
      newAddons.find((addon) => addon.key === "device_addon")?.qty || 0;

    const deviceCount = isTrialConversion
      ? incrementalDeviceAddon
      : incrementalDeviceAddon - currentDeviceAddon;

    const devicePriceInfo = getPriceInfo(deviceAddon.prices, billingCycle);
    const deviceCost = devicePriceInfo.discountedPrice;
    const proratedAmount = calculateProratedAmount(deviceCost * deviceCount);

    if (proratedAmount > 0) {
      items.push({
        name: "Additional Devices",
        amount: proratedAmount,
      });
      total += proratedAmount;
    }
  }

  const regularAddons = newAddons.filter(
    (addon) => addon.key !== "location_addon" && addon.key !== "device_addon"
  );

  const newlyAddedAddons = isTrialConversion
    ? regularAddons
    : regularAddons.filter(
        (addon) => !currentAddons.some((a) => a.key === addon.key)
      );

  if (newlyAddedAddons.length > 0) {
    newlyAddedAddons.map((addon) => {
      const packageAddonPrices = packageAddons.find(
        (a) => a.key === addon.key
      )?.prices;
      const addonPriceInfo = getPriceInfo(packageAddonPrices, billingCycle);
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
    });
  }

  const currentHardwareMap = new Map();
  currentHardwares.forEach((hw) => {
    currentHardwareMap.set(hw.key, hw.qty || 1);
  });

  newHardwares.forEach((hardware) => {
    const oldQty = currentHardwareMap.get(hardware.key) || 0;
    const incrementalQty = hardware.qty - oldQty;

    if (incrementalQty > 0 || isTrialConversion) {
      const packageHardware = packageHardwares.find(
        (hw) => hw.key === hardware.key
      );
      if (packageHardware) {
        const qtyToCharge = isTrialConversion
          ? hardware.qty || 0
          : incrementalQty;

        const hardwareCost = qtyToCharge * packageHardware.price;
        const hardwareAmount = hardwareCost;

        if (hardwareAmount > 0) {
          const hwName = packageHardware.name
            ? typeof packageHardware.name === "string"
              ? packageHardware.name
              : packageHardware.name.en
            : "Hardware";

          items.push({
            name: `${hwName} (${qtyToCharge} units)`,
            amount: hardwareAmount,
          });
          total += hardwareAmount;
        }
      }
    }
  });

  return { items, total };
};
