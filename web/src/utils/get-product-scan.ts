import toast from "react-hot-toast";
import serviceCaller from "src/api/serviceCaller";

const getProductScanBySku = async (
  finalSku: String,
  companyRef: string,
  locationRef?: string,
  locationRefs?: string[]
) => {
  try {
    const prod = await serviceCaller("/product/scan-product", {
      method: "GET",
      query: {
        page: 0,
        sort: "asc",
        activeTab: "all",
        limit: 1,
        _q: finalSku.replace("AltMetaDead", ""),
        companyRef: companyRef,
        locationRef: locationRef,
        locationRefs: locationRefs || [],
      },
    });

    if (prod) {
      if (prod?.box?.type === "box" || prod?.box?.type === "crate") {
        const variantDoc = prod.variants?.find((variant: any) => {
          return variant.sku === prod.box.productSku;
        });

        const boxCrateDoc = {
          ...prod.box,
          unit: "perItem",
          name: variantDoc?.name || prod.box.name,
          image: variantDoc?.image || "",
          unitCount: prod.box.qty,
          parentSku: prod.box.productSku,
          boxSku: prod.box.boxSku,
          crateSku: prod.box.type === "box" ? "" : prod.box.crateSku,
          boxRef: prod.box.type === "box" ? prod.box._id : prod.box.boxRef,
          crateRef: prod.box.type === "box" ? "" : prod.box._id,
          sku: prod.box.type === "box" ? prod.box.boxSku : prod.box.crateSku,
        };

        return {
          ...prod,
          variants: [boxCrateDoc],
          multiVariants: prod.variants?.length > 1,
        };
      } else {
        return prod;
      }
    } else return null;
  } catch (error) {
    console.log(error, "ERROR");
    if (error.code === "not_found") {
      toast.error("Product not found");
    } else if (error?._err?.statusCode === 500) {
      toast.error("Internal Server Error");
    }
  }

  return null;
};

export default getProductScanBySku;
