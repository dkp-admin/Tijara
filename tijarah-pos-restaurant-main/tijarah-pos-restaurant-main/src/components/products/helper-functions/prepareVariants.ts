import logToAxiom from "../../../utils/log-to-axiom";

const prepareDefaultVariant = (values: any, businessDetails: any) => {
  const data = {
    parentSku: "",
    parentName: { en: "", ar: "" },
    type: "item",
    assignedToAll: false,
    en_name: "Regular",
    ar_name: "عادي",
    image: "",
    variantPic: "",
    sku: values.sku,
    code: values.code,
    unit: values?.unit?.key,
    noOfUnits: 1,
    costPrice: values?.costPrice,
    price: values?.price,
    originalPrice: values?.price,
    nonSaleable: false,
    locationRefs: [businessDetails?.location?._id],
    locations: [{ name: businessDetails?.location?.name?.en }],
    prices: [
      {
        costPrice: Number(values?.costPrice) > 0 ? `${values?.costPrice}` : "",
        price: Number(values?.price) > 0 ? `${values?.price}` : "",
        locationRef: businessDetails?.location?._id,
        location: { name: businessDetails?.location?.name?.en },
      },
    ],
    otherPrices: [],
    stocks: [
      {
        enabledAvailability: true,
        enabledTracking: false,
        stockCount: 0,
        enabledLowStockAlert: false,
        lowStockCount: 0,
        locationRef: businessDetails?.location?._id,
        location: { name: businessDetails?.location?.name?.en },
      },
    ],
    otherStocks: [],
    status: "active",
  };
  return data;
};

const prepareVariants = async (values: any, businessDetails: any) => {
  try {
    let variants = values?.variants || [];

    if (values.sku && values.unit.key && variants.length === 0) {
      logToAxiom({
        context: "prepareVariants",
        message: "Variant empty, creating default variant",
        type: "info",
      });

      const defaultVariant = prepareDefaultVariant(values, businessDetails);
      variants = [defaultVariant];

      logToAxiom({
        context: "prepareVariants",
        message: `Default variant added - ${JSON.stringify(variants)}`,
        type: "info",
      });
    }

    if (variants.length === 1) {
      const singleVariant = {
        ...variants[0],
        sku: values?.sku,
        code: values?.code,
        unit: values?.unit?.key,
        costPrice: Number(values?.costPrice) > 0 ? `${values?.costPrice}` : "",
        prices: [
          {
            costPrice:
              Number(values?.costPrice) > 0 ? `${values?.costPrice}` : "",
            price: Number(values?.price) > 0 ? `${values?.price}` : "",
            locationRef: businessDetails?.location?._id,
            location: { name: businessDetails?.location?.name?.en },
          },
        ],
      };

      variants = [singleVariant];

      logToAxiom({
        context: "prepareVariants",
        message: `Single variant prepared: ${JSON.stringify(variants)}`,
        type: "info",
      });
    }

    return variants;
  } catch (error: any) {
    logToAxiom({
      context: "prepareVariants",
      message: `Error in prepareVariants: ${error.message}`,
      type: "error",
    });
    throw error; // Re-throw the error to be handled by the caller
  }
};

export default prepareVariants;
