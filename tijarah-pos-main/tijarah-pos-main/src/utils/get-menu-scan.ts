import { MenuModel } from "../database/menu/menu";
import { db } from "./createDatabaseConnection";

async function fetchMenu(finalSku: string, orderType: string) {
  const repo = db.getRepository(MenuModel);

  const menu = await repo.findOne({ where: { orderType: orderType } });

  const scanProduct = menu?.products?.find((product: any) =>
    product.variants.some((variant: any) => variant.sku.includes(finalSku))
  );

  const variant = scanProduct?.variants?.find(
    (variant: any) => variant.sku === finalSku
  );

  return scanProduct
    ? {
        ...scanProduct,
        variants: [variant],
        multiVariants: scanProduct.variants.length > 1,
      }
    : null;
}

const getMenuScanBySku = async (finalSku: string, orderType: string) => {
  try {
    return await fetchMenu(finalSku, orderType);
  } catch (error) {
    return null;
  }
};

export default getMenuScanBySku;
