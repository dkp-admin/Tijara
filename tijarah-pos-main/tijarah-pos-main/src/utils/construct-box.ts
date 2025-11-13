export const constructBox = (box: any) => ({
  parentSku: box.parentSku || "",
  parentName: box?.parentName,
  type: box.type,
  assignedToAll: box.assignedToAll,
  name: { en: box.en_name, ar: box.ar_name },
  image: "",
  sku: box.sku,
  code: box?.code || "",
  unit: box.unit,
  unitCount: box.noOfUnits,
  costPrice: box.costPrice,
  price: box.price,
  locationRefs: box.locationRefs,
  locations: box.locations,
  prices: prices(box?.prices || [], box?.otherPrices || []),
  stockConfiguration: [],
  status: box.status,
  nonSaleable: box?.nonSaleable || false,
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
