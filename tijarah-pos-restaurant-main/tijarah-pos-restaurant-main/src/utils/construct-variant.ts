export const constructVariant = (variant: any) => ({
  type: variant.type,
  assignedToAll: variant.assignedToAll,
  name: { en: variant.en_name, ar: variant.ar_name },
  image: variant.variantPic || "",
  sku: variant.sku,
  code: variant?.code || "",
  unit: variant.unit,
  unitCount: variant?.noOfUnits || 1,
  costPrice: variant.costPrice,
  price: variant.originalPrice,
  locationRefs: variant.locationRefs,
  locations: variant.locations,
  prices: prices(variant.prices, variant?.otherPrices || []),
  stockConfiguration: stocks(variant?.stocks || [], variant?.otherStocks || []),
  status: variant.status,
  nonSaleable: variant?.nonSaleable || false,
});

const prices = (prices: any[], otherPrices: any[]) => {
  const data = prices;

  otherPrices?.forEach((price: any) => {
    data.push({
      costPrice: price.costPrice,
      price: price.price,
      locationRef: price.locationRef,
      location: price.location,
    });
  });

  return data;
};

const stocks = (stocks: any[], otherStocks: any[]) => {
  const data = stocks?.map((stock: any) => {
    return {
      availability: stock.enabledAvailability || true,
      tracking: stock.enabledTracking || false,
      count: stock?.stockCount || 0,
      lowStockAlert: stock?.enabledLowStockAlert || false,
      lowStockCount: stock?.lowStockCount || 0,
      locationRef: stock.locationRef,
      location: stock.location,
    };
  });

  otherStocks?.forEach((stock: any) => {
    data.push({
      availability: stock.enabledAvailability || true,
      tracking: stock.enabledTracking || false,
      count: stock?.stockCount || 0,
      lowStockAlert: stock?.enabledLowStockAlert || false,
      lowStockCount: stock?.lowStockCount || 0,
      locationRef: stock.locationRef,
      location: stock.location,
    });
  });

  return data;
};
