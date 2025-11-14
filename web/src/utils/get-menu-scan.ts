import toast from "react-hot-toast";
import serviceCaller from "src/api/serviceCaller";

const getMenuScanBySku = async (
  finalSku: string,
  orderType: string,
  companyRef: string,
  locationRef: string
) => {
  try {
    const menu = await serviceCaller("/menu-management/menu", {
      method: "GET",
      query: {
        orderType: orderType,
        companyRef: companyRef,
        locationRef: locationRef,
        _q: finalSku.replace("AltMetaDead", ""),
      },
    });

    if (menu?.results?.products?.length > 0) {
      const item = menu?.results?.products[0];
      const variant = item.variants?.find((variant: any) => {
        return variant.sku === finalSku;
      });

      return {
        ...item,
        variants: [variant],
        multiVariants: item.variants?.length > 1,
      };
    } else {
      toast.error("Item not found");
      return null;
    }
  } catch (error) {
    console.log(error, "ERROR");
    if (error.code === "not_found") {
      toast.error("Item not found");
    } else if (error?._err?.statusCode === 500) {
      toast.error("Internal Server Error");
    }
  }

  return null;
};

export default getMenuScanBySku;
