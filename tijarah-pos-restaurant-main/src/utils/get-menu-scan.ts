import repository from "../db/repository";

async function fetchMenu(finalSku: string, orderType: string) {
  const menu = await repository.menuRepository.findByOrderType(orderType);

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
