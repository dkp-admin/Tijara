import cart from "./cart";

export const getUpdatedProductStock = (
  stock: number,
  type: string,
  sku: string,
  qty: number,
  scan: boolean
) => {
  const stockCount = stock;

  const items = cart.cartItems?.filter((item: any) => item.sku === sku);

  const totalAddedQty = items?.reduce((acc: number, item: any) => {
    return acc + item.qty;
  }, 0);

  return scan && (type === "box" || type === "crate")
    ? stockCount - totalAddedQty
    : stockCount - totalAddedQty - qty;
};

export const checkNotBillingProduct = (
  variant: any,
  locationRef: string,
  negativeBilling: boolean,
  scan?: boolean
) => {
  const stockConfig = variant.stockConfiguration?.find(
    (stock: any) => stock?.locationRef === locationRef
  );

  const available = stockConfig ? stockConfig.availability : true;
  const tracking = stockConfig ? stockConfig.tracking : false;
  const stockCount = negativeBilling
    ? stockConfig?.count
    : getUpdatedProductStock(
        Number(stockConfig?.count),
        variant.type,
        variant.type === "box"
          ? variant?.boxSku || variant.sku
          : variant.type === "crate"
          ? variant?.crateSku || variant.sku
          : variant.sku,
        0,
        scan || false
      );

  if (available && tracking) {
    if (negativeBilling) {
      return false;
    } else {
      return stockCount <= 0;
    }
  } else {
    return !available;
  }
};
