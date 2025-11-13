import { useContext } from "react";
import CartContext from "../context/cart-context";

export default function useItems() {
  const {
    items,
    discountsApplied,
    cartData,
    chargeData,
    discount,
    chargesApplied,
    promotion,
    promotionsApplied,
  } = useContext(CartContext) as any;

  return {
    items,
    totalAmount: discount?.discountCodes
      ? Number((discount?.totalAmount + chargeData?.totalCharges)?.toFixed(2))
      : Number((cartData?.totalAmount + chargeData?.totalCharges)?.toFixed(2)),
    totalVatAmount: discount?.discountCodes
      ? Number((discount?.vatAmount + chargeData?.vatCharges)?.toFixed(2))
      : Number((cartData?.totalVatAmount + chargeData?.vatCharges)?.toFixed(2)),
    totalQty: cartData?.totalQty,
    totalItem: cartData?.totalItem,
    discountsApplied: discountsApplied,
    chargesApplied: chargesApplied,
    discountsPercentage: discount?.discountPercentage,
    promotionPercentage: promotion?.discountPercentage,
    discountCodes: discount?.discountCodes,
    promotionsApplied,
    promotion,
    totalDiscountPromotion: Number(promotion?.totalDiscountCalc?.toFixed(2)),
    promotionCodes: promotion?.promotionCodes,
    totalDiscount: Number(discount?.totalDiscountCalc?.toFixed(2)),
    vatWithoutDiscount: cartData?.vatWithoutDiscount,
    subTotalWithoutDiscount: cartData?.subTotalWithoutDiscount,
    totalCharges: Number(chargeData?.totalCharges?.toFixed(2)),
    vatCharges: Number(chargeData?.vatCharges?.toFixed(2)),
    totalModifierAmount: Number(cartData?.totalModifierAmount),
  };
}
