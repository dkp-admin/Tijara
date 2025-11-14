import { getItemSellingPrice, getItemVAT } from "./get-price";

export const transformCartItems = (cartItems: any, discountPercentage: any) => {
  const items: any[] = [];
  cartItems.map((cItem: any) => {
    const specificPromoDiscount = cItem?.promotionsData?.reduce(
      (ac: any, ar: any) => {
        if (ar?.type === "specific") {
          return ac + ar?.discount;
        } else return ac;
      },
      0
    );

    const itemSpecificDiscountPercentage =
      ((specificPromoDiscount || 0) / cItem.total) * 100;

    const discount =
      ((cItem.discountedTotal || cItem.total) * discountPercentage) / 100;

    const itemDiscountPercentage = (discount / cItem.total) * 100;

    const total = cItem?.isFree
      ? cItem.total
      : Number(
          (
            cItem.total -
            Number(discount?.toFixed(2)) -
            Number(Number(specificPromoDiscount || 0)?.toFixed(2))
          )?.toFixed(2)
        );

    items.push({
      categoryRef: cItem.categoryRef || "",
      productRef: cItem.productRef,
      image: cItem.image || "",
      name: { en: cItem.name.en || "Open Item", ar: cItem.name.ar },
      contains: cItem.contains,
      category: { name: cItem.category.name },
      variantNameEn: cItem.variantNameEn,
      variantNameAr: cItem.variantNameAr,
      type: cItem.type,
      code: cItem.code || "",
      sku: cItem.sku,
      isFree: cItem?.isFree,
      isQtyFree: cItem?.isQtyFree,
      parentSku: cItem.parentSku,
      boxSku: cItem.boxSku,
      crateSku: cItem.crateSku,
      boxRef: cItem.boxRef ? cItem.boxRef : null,
      crateRef: cItem.crateRef ? cItem.crateRef : null,
      qty: cItem.qty,
      hasMultipleVariants: cItem.hasMultipleVariants,
      costPrice: cItem.costPrice,
      itemSubTotal: cItem.itemSubTotal,
      sellingPrice: getItemSellingPrice(total, Number(cItem.vat)), //cItem.sellingPrice,
      total,
      discountedTotal: cItem?.isFree ? total : cItem.discountedTotal || 0,
      discountedVat: cItem.discountedVatAmount || 0,
      unit: cItem.unit,
      vat: cItem?.isFree ? 0 : getItemVAT(total, Number(cItem.vat)), //cItem.vatAmount
      vatPercentage: Number(cItem.vat),
      discount:
        Number(discount?.toFixed(2)) +
        Number(Number(specificPromoDiscount || 0)?.toFixed(2)),
      discountPercentage:
        Number(itemDiscountPercentage || 0) +
        Number(itemSpecificDiscountPercentage || 0),
      promotionPercentage: Number(itemSpecificDiscountPercentage || 0),
      note: cItem.note,
      refundedQty: 0,
      noOfUnits: cItem.noOfUnits,
      availability: cItem.availability,
      tracking: cItem.tracking,
      stockCount: cItem.stockCount,
      modifiers: cItem.modifiers,
      promotionsData: cItem?.promotionsData,
    });
  });

  return items;
};
