export const constructDBVariant = (variant: any) => ({
  _id: variant._id,
  parentSku: variant.parentSku || "",
  parentName: variant?.parentName,
  type: variant.type,
  assignedToAll: variant.assignedToAll,
  name: { en: variant.en_name, ar: variant.ar_name },
  image: variant.image || "",
  localImage: variant.variantPic,
  sku: variant.sku,
  code: variant?.code || "",
  unit: variant.unit,
  noOfUnits: variant?.noOfUnits || 1,
  costPrice: variant.costPrice,
  sellingPrice: variant.price,
  originalPrice: variant.originalPrice,
  locationRefs: variant.locationRefs,
  locations: variant.locations,
  prices: [
    {
      costPrice: variant.prices[0].costPrice,
      price: variant.prices[0].price,
      locationRef: variant.prices[0].locationRef,
      location: variant.prices[0].location,
    },
  ],
  otherPrices: variant.otherPrices,
  stocks: [
    {
      enabledAvailability: variant.stocks?.[0]
        ? variant.stocks[0].enabledAvailability
        : true,
      enabledTracking: variant.stocks?.[0]
        ? variant.stocks[0].enabledTracking
        : false,
      stockCount: variant.stocks?.[0] ? variant.stocks[0].stockCount : null,
      enabledLowStockAlert: variant.stocks?.[0]
        ? variant.stocks[0].enabledLowStockAlert
        : false,
      lowStockCount: variant.stocks?.[0] ? variant.stocks[0].lowStockCount : 0,
      locationRef: variant.stocks?.[0]
        ? variant.stocks[0].locationRef
        : variant.prices[0].locationRef,
      location: variant.stocks?.[0]
        ? variant.stocks[0].location
        : variant.prices[0].location,
    },
  ],
  otherStocks: variant.otherStocks,
  status: variant.status,
  nonSaleable: variant?.nonSaleable || false,
});
