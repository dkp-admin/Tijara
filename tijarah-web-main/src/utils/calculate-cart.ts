import cart from "./cart";
import { getItemSellingPrice, getItemVAT } from "./get-price";

const calculateCart = (
  isOnlineOrder: boolean = false,
  breakup: any[] = [],
  discountsAppliedArray: any[] = []
) => {
  const useCartStore = require("../store/cart-item").default;
  const items = cart?.getCartItems() || [];
  const discountsApplied =
    discountsAppliedArray?.length > 0
      ? discountsAppliedArray
      : useCartStore?.getState()?.discountsApplied;
  const order = (useCartStore?.getState()?.order as any) || {};
  const totalAmount = items?.reduce(
    (prev: any, cur: any) => Number((prev + Number(cur.total))?.toFixed(2)),
    0
  );

  const totalPaidAmount = (
    isOnlineOrder ? breakup : order?.payment?.breakup
  )?.reduce((prev: any, cur: any) => prev + Number(cur.total), 0);

  const totalSellingPrice = items?.reduce(
    (prev: any, item: any) =>
      Number(
        (prev + Number(getItemSellingPrice(item.total, item.vat)))?.toFixed(2)
      ),
    0
  );
  const totalVatAmount = items?.reduce(
    (prev: any, item: any) =>
      Number((prev + Number(getItemVAT(item.total, item.vat)))?.toFixed(2)),
    0
  );

  const totalDiscountCalc = discountsApplied?.reduce((prev: any, cur: any) => {
    if (cur.discountType === "percent") {
      // Calculate discount based on percentage
      const discountAmount = (totalAmount * Number(cur.discount)) / 100;
      return prev + discountAmount;
    } else if (cur.discountType === "amount") {
      // Add fixed discount amount
      return prev + Number(cur.discount);
    } else {
      return prev;
    }
  }, 0);

  const discountPercentage = Number((totalDiscountCalc * 100) / totalAmount);
  const discountCodes = discountsApplied?.map((d: any) => d.code).join(",");

  useCartStore?.getState()?.setCartCalculations({
    totalAmount,
    totalSellingPrice,
    totalVatAmount,
    totalDiscountCalc,
    totalPaidAmount,
    discountPercentage,
    discountCodes,
    totalDiscount: totalDiscountCalc,
  });

  return {
    totalAmount,
    totalSellingPrice,
    totalVatAmount,
    totalDiscountCalc,
    totalPaidAmount,
    discountPercentage,
    discountCodes,
    totalDiscount: totalDiscountCalc,
  };
};

export default calculateCart;
