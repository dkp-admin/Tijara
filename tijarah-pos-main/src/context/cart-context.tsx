import { useIsFocused } from "@react-navigation/core";
import React, { useEffect, useMemo, useState } from "react";
import { EventRegister } from "react-native-event-listeners";
import useCartStore from "../store/cart-item";
import MMKVDB from "../utils/DB-MMKV";
import { DBKeys } from "../utils/DBKeys";
import cart from "../utils/cart";
import { getItemVAT } from "../utils/get-price";
import { debugLog } from "../utils/log-patch";

const CartContext = React.createContext({});

export function CartContextProvider({ children }: any) {
  const [items, setItems] = useState([]) as any;
  const [discountsApplied, setDiscountsApplied] = useState([]) as any;
  const [promotionsApplied, setPromotionsApplied] = useState([]) as any;
  const [chargesApplied, setChargesApplied] = useState([]) as any;
  const isFocused = useIsFocused();
  const { setOrder, setTotalPaidAmount } = useCartStore();

  useEffect(() => {
    setItems(cart.getCartItems());
    setDiscountsApplied(cart.getDiscountApplied());
    setPromotionsApplied(cart.getPromotionApplied());
    setChargesApplied(cart.getChargesApplied());
  }, [isFocused]);

  useEffect(() => {
    const listener = EventRegister.addEventListener("itemRemoved", (data) => {
      setItems([...data]);
    });

    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, []);

  useEffect(() => {
    const listener = EventRegister.addEventListener("cart-clear", () => {
      setItems([]);
      setDiscountsApplied([]);
      setChargesApplied([]);
      setPromotionsApplied([]);
    });

    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, []);

  useEffect(() => {
    const listener = EventRegister.addEventListener("itemAdded", (data) => {
      setItems([...data]);
    });
    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, []);

  useEffect(() => {
    const listener = EventRegister.addEventListener("itemUpdated", (data) => {
      setItems([...data]);
    });
    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, []);

  useEffect(() => {
    const listener = EventRegister.addEventListener(
      "discountApplied",
      (data) => {
        setDiscountsApplied([...data]);
      }
    );
    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, []);

  useEffect(() => {
    const listener = EventRegister.addEventListener(
      "promotionApplied",
      (data) => {
        setPromotionsApplied([...data]);
      }
    );
    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, []);

  useEffect(() => {
    const listener = EventRegister.addEventListener(
      "discountRemoved",
      (data) => {
        setDiscountsApplied([...data]);
      }
    );
    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, []);

  useEffect(() => {
    const listener = EventRegister.addEventListener(
      "promotionRemoved",
      (data) => {
        setPromotionsApplied([...data]);
      }
    );
    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, []);

  useEffect(() => {
    const listener = EventRegister.addEventListener("chargeApplied", (data) => {
      setChargesApplied([...data]);
    });
    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, []);

  useEffect(() => {
    const listener = EventRegister.addEventListener("chargeRemoved", (data) => {
      setChargesApplied([...data]);
    });
    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, []);

  const cartData = useMemo(() => {
    if (items?.length > 0) {
      return items.reduce(
        (accumulator: any, item: any) => {
          let qty = accumulator.totalQty;
          let totalVat = accumulator.totalVatAmount;
          let totalAmount = accumulator.totalAmount;
          let totalVatWithoutDiscount = accumulator.vatWithoutDiscount;
          let totalAmountWithoutDiscount =
            accumulator.subTotalWithoutDiscount +
            accumulator.vatWithoutDiscount;
          let discount = 0;
          let totalModifierAmount = 0;
          let totalModifierVAT = 0;
          let discountAmount = accumulator?.discountAmount || 0;

          if (!item?.isFree) {
            if (item.unit === "perItem") {
              qty += item.qty;
            } else {
              qty += 1;
            }

            if (item?.promotionsData?.length > 0) {
              discount = item?.promotionsData?.reduce((ac: any, cur: any) => {
                if (cur?.type !== "all") {
                  return ac + cur?.discount;
                }
                return ac;
              }, 0);
              discountAmount += discount;
            }

            if (item?.modifiers?.length > 0) {
              totalModifierAmount =
                item?.modifiers?.reduce(
                  (ac: any, ar: any) => ac + ar.total,
                  0
                ) * item?.qty;

              totalModifierVAT =
                item?.modifiers?.reduce(
                  (ac: any, ar: any) => ac + ar.vatAmount,
                  0
                ) * item?.qty;
            }

            totalVat += Number(
              getItemVAT(
                item.total - totalModifierAmount - discount,
                item.vat
              ) + totalModifierVAT
            );

            totalVatWithoutDiscount += Number(
              getItemVAT(item.total - totalModifierAmount, item.vat) +
                totalModifierVAT
            );

            totalAmount += item.total - discount;
            totalAmountWithoutDiscount += item.total;
          }

          return {
            totalQty: qty,
            totalVatAmount: Number(totalVat.toFixed(2)),
            totalItem: items.length,
            totalAmount: Number(totalAmount?.toFixed(2)),
            vatWithoutDiscount: Number(totalVatWithoutDiscount?.toFixed(2)),
            subTotalWithoutDiscount: Number(
              totalAmountWithoutDiscount - totalVatWithoutDiscount?.toFixed(2)
            ),
            totalModifierAmount: Number(totalModifierAmount).toFixed(2),
            discountAmount,
          };
        },
        {
          totalQty: 0,
          totalVatAmount: 0,
          totalItem: 0,
          totalAmount: 0,
          vatWithoutDiscount: 0,
          subTotalWithoutDiscount: 0,
          totalModifierAmount: 0,
          discountAmount: 0,
        }
      );
    } else {
      setOrder({});
      setTotalPaidAmount(0);
    }

    return {
      totalQty: 0,
      totalVatAmount: 0,
      totalItem: 0,
      totalAmount: 0,
      vatWithoutDiscount: 0,
      subTotalWithoutDiscount: 0,
      totalModifierAmount: 0,
    };
  }, [items, discountsApplied, promotionsApplied]);

  const promotion = useMemo(() => {
    const totalDiscountCalc = promotionsApplied?.reduce(
      (prev: any, cur: any, index: number) => {
        if (cur?.promotionType === "basic") {
          if (cur?.promotionTargetIds && cur?.promotionTargetIds?.length > 0) {
            let totalPromotionDiscount = 0;

            cart.cartItems.map((item: any) => {
              if (cur.productSkus.includes(item.sku)) {
                const res = cart.cartItems.some((id: any) =>
                  cur.productSkus.includes(id.sku)
                );

                if (!res) {
                  return;
                }

                if (cur?.discountType === "percent") {
                  let totalAmountToConsider =
                    true &&
                    cur?.type === "promotion" &&
                    item?.modifiers?.length > 0
                      ? item.total
                      : item.total;

                  // minus  - cartData.totalModifierAmount

                  const totalVatAmountToConsider =
                    true &&
                    cur?.type === "promotion" &&
                    item?.modifiers?.length > 0
                      ? item.vatAmount
                      : item.vatAmount;

                  const discountAmount =
                    (totalAmountToConsider * cur.discount) / 100;

                  const discountedVat =
                    (totalVatAmountToConsider * cur.discount) / 100;

                  totalPromotionDiscount += discountAmount;

                  item.exactTotal = item.total;

                  item.exactVat = item.vatAmount;

                  item.discountedTotal = totalAmountToConsider - discountAmount;

                  item.discountedVatAmount =
                    totalVatAmountToConsider - discountedVat;

                  item.promotionsData = item.promotionsData || [];

                  const itemSpecificDiscount = item.promotionsData.reduce(
                    (ac: any, ar: any) => {
                      if (ar?.type === "specific") {
                        return ac + ar?.discount;
                      } else return ac;
                    },
                    0
                  );

                  item.discountedTotal = item.total - itemSpecificDiscount;
                } else {
                  const includedItemslength = cart.cartItems.filter(
                    (car: any) => cur.productSkus.includes(car.sku)
                  );

                  const includedCategoryLength = [cart.cartItems].filter(
                    (car: any) =>
                      cur.promotionTargetIds.includes(car.categoryRef)
                  );

                  let totalAmountToConsider =
                    true &&
                    cur?.type === "promotion" &&
                    item?.modifiers?.length > 0
                      ? item.total
                      : item.total;

                  const specificLength =
                    includedItemslength.length > 0
                      ? includedItemslength.length
                      : includedCategoryLength.length > 0
                      ? includedCategoryLength.length
                      : 1;

                  const totalVatAmountToConsider =
                    true &&
                    cur?.type === "promotion" &&
                    item?.modifiers?.length > 0
                      ? item.vatAmount
                      : item.vatAmount;

                  const fixedPercentage =
                    Number((cur?.discount * 100) / totalAmountToConsider) /
                    specificLength;

                  const discountAmount =
                    (totalAmountToConsider * fixedPercentage) / 100;

                  const discountedVat =
                    (item.vatAmount * fixedPercentage) / 100;

                  totalPromotionDiscount += discountAmount;

                  item.exactTotal = item.total;

                  item.exactVat = item.vatAmount;

                  item.discountedTotal = totalAmountToConsider - discountAmount;

                  item.discountedVatAmount =
                    totalVatAmountToConsider - discountedVat;

                  item.promotionsData = item.promotionsData || [];

                  const itemSpecificDiscount = item.promotionsData.reduce(
                    (ac: any, ar: any) => {
                      if (ar?.type === "specific") {
                        return ac + ar?.discount;
                      } else return ac;
                    },
                    0
                  );

                  item.discountedTotal = item.total - itemSpecificDiscount;
                }
              }

              if (cur.promotionTargetIds.includes(item.categoryRef)) {
                const res = cart.cartItems.some((id: any) =>
                  cur.promotionTargetIds.includes(id.categoryRef)
                );

                if (!res) {
                  return;
                }

                if (cur?.discountType === "percent") {
                  let totalAmountToConsider =
                    true &&
                    cur?.type === "promotion" &&
                    item?.modifiers?.length > 0
                      ? item.total
                      : item.total;

                  const discountAmount =
                    (totalAmountToConsider * cur.discount) / 100;

                  const discountedVat = (item.vatAmount * cur.discount) / 100;

                  const totalVatAmountToConsider =
                    true &&
                    cur?.type === "promotion" &&
                    item?.modifiers?.length > 0
                      ? item.vatAmount
                      : item.vatAmount;

                  totalPromotionDiscount += discountAmount;

                  item.exactTotal = item.total;

                  item.exactVat = item.vatAmount;

                  item.discountedTotal = totalAmountToConsider - discountAmount;

                  item.discountedVatAmount =
                    totalVatAmountToConsider - discountedVat;

                  item.promotionsData = item.promotionsData || [];

                  const itemSpecificDiscount = item.promotionsData.reduce(
                    (ac: any, ar: any) => {
                      if (ar?.type === "specific") {
                        return ac + ar?.discount;
                      } else return ac;
                    },
                    0
                  );

                  item.discountedTotal = item.total - itemSpecificDiscount;
                } else {
                  const includedItemslength = cart.cartItems.filter(
                    (car: any) => cur.productSkus.includes(car.sku)
                  );

                  const includedCategoryLength = [cart.cartItems].filter(
                    (car: any) =>
                      cur.promotionTargetIds.includes(car.categoryRef)
                  );

                  let totalAmountToConsider =
                    true &&
                    cur?.type === "promotion" &&
                    item?.modifiers?.length > 0
                      ? item.total
                      : item.total;

                  const specificLength =
                    includedItemslength.length > 0
                      ? includedItemslength.length
                      : includedCategoryLength.length > 0
                      ? includedCategoryLength.length
                      : 1;

                  const totalVatAmountToConsider =
                    true &&
                    cur?.type === "promotion" &&
                    item?.modifiers?.length > 0
                      ? item.vatAmount
                      : item.vatAmount;

                  const fixedPercentage =
                    Number((cur?.discount * 100) / totalAmountToConsider) /
                    specificLength;

                  const discountAmount =
                    (totalAmountToConsider * fixedPercentage) / 100;

                  const discountedVat =
                    (item.vatAmount * fixedPercentage) / 100;

                  totalPromotionDiscount += discountAmount;

                  item.exactTotal = item.total;

                  item.exactVat = item.vatAmount;

                  item.discountedTotal = totalAmountToConsider - discountAmount;

                  item.discountedVatAmount =
                    totalVatAmountToConsider - discountedVat;

                  item.promotionsData = item.promotionsData || [];

                  const itemSpecificDiscount = item.promotionsData.reduce(
                    (ac: any, ar: any) => {
                      if (ar?.type === "specific") {
                        return ac + ar?.discount;
                      } else return ac;
                    },
                    0
                  );

                  item.discountedTotal = item.total - itemSpecificDiscount;
                }
              }

              const doc = item?.promotionsData?.find(
                (f: any) => f?.id === cur?._id
              );

              const includedItemslength = cart.cartItems.filter((car: any) =>
                cur.productSkus.includes(car.sku)
              );

              const includedCategoryLength = [cart.cartItems].filter(
                (car: any) => cur.promotionTargetIds.includes(car.categoryRef)
              );

              const specificLength =
                includedItemslength.length > 0
                  ? includedItemslength.length
                  : includedCategoryLength.length > 0
                  ? includedCategoryLength.length
                  : 1;

              const fixedPercentage =
                Number((cur?.discount * 100) / item.total) / specificLength;

              const discountAmount = (item.total * fixedPercentage) / 100;

              if (
                doc &&
                (cur.promotionTargetIds.includes(item.categoryRef) ||
                  cur.productSkus.includes(item.sku))
              ) {
                const newArray = [...item?.promotionsData]?.filter(
                  (pro) => pro?.id !== doc?.id
                );

                newArray.push({
                  name: cur.code,
                  discount:
                    cur?.discountType == "percent"
                      ? (item.total * cur.discount) / 100
                      : discountAmount,
                  id: cur?._id,
                  type: "specific",
                });

                item.promotionsData = [...newArray];
              }

              if (
                !doc &&
                (cur.promotionTargetIds.includes(item.categoryRef) ||
                  cur.productSkus.includes(item.sku))
              ) {
                item.promotionsData = item?.promotionsData || [];

                const newArray = [...item?.promotionsData];

                newArray.push({
                  name: cur.code,
                  discount:
                    cur?.discountType == "percent"
                      ? (item.total * cur.discount) / 100
                      : discountAmount,
                  id: cur?._id,
                  type: "specific",
                });

                item.promotionsData = [...newArray];
              }

              if (
                totalPromotionDiscount > cur?.offer?.budget &&
                cur?.offer?.type === "budget" &&
                cur?.offer?.budgetType !== "unlimited"
              ) {
                delete item.exactTotal;
                delete item.exactVat;
                delete item.discountedTotal;
                delete item.discountedVatAmount;
                delete item.promotionsData;
                cart.removePromotion(index, (promotions: any) => {
                  debugLog(
                    "Promotion removed from cart",
                    promotions,
                    "cart-billing-screen",
                    "handleRemoveDiscountFunctionBUDGET1"
                  );
                  EventRegister.emit("promotionRemoved", promotions);
                });
                return;
              }
            });

            return prev + totalPromotionDiscount;
          } else return prev;
        } else if (cur?.promotionType === "advance") {
          if (cur?.condition === "buys_the_following_items") {
            let totalPromotionDiscount = 0;

            const totalAddedItems = cart?.cartItems?.filter(
              (op: any) => !op?.isFree && !op?.isQtyFree
            );

            const totalAddedItemsLength = totalAddedItems?.length;

            cart.cartItems.map((item: any) => {
              if (
                cur?.promotionType === "advance" &&
                cur?.condition === "buys_the_following_items" &&
                cur?.reward?.rewardType === "get_the_following_items" &&
                cur?.reward?.discountType === "free" &&
                cur?.buy?.target === "product" &&
                cur?.buy?.productRefs?.length > 0 &&
                !cart?.cartItems?.some(
                  (op: any) =>
                    !op?.isFree &&
                    !op?.isQtyFree &&
                    cur?.buyProductSkus?.includes(op?.sku)
                )
              ) {
                delete item.exactTotal;
                delete item.exactVat;
                delete item.discountedTotal;
                delete item.discountedVatAmount;
                delete item.promotionsData;

                const indexes: number[] = [];

                const res = cart.cartItems.some((cart: any, ind: number) => {
                  if (cart?.isFree || cart?.isQtyFree) {
                    indexes.push(ind);
                  }
                  if (
                    cur?.buy?.target === "product" &&
                    cur?.buy?.productRefs?.length > 0
                  ) {
                    return (
                      cur?.buyProductSkus.includes(cart.sku) &&
                      !cart.isFree &&
                      ((cur?.buy?.buyType === "quantity" &&
                        cur?.buy?.quantity <= cart?.qty) ||
                        (cur?.buy?.buyType === "minMax" &&
                          cur?.buy?.min <= cart?.qty))
                    );
                  }
                });

                if (!res) {
                  cart.removePromotion(index, (promotions: any) => {
                    debugLog(
                      "Promotion removed from cart",
                      promotions,
                      "cart-billing-screen",
                      "handleRemoveDiscountFunctionBUDGET2"
                    );
                    EventRegister.emit("promotionRemoved", promotions);
                  });
                  cart.bulkRemoveFromCart(indexes, (removedItems: any) => {
                    debugLog(
                      "Items removed from cart",
                      removedItems,
                      "cart-context",
                      "calculatedPromotionsMethod2"
                    );
                  });
                }
              }
              if (
                item?.sku !== "Open Item" &&
                !item?.isFree &&
                !item?.isQtyFree
              ) {
                let itemQty: number = 0;
                if (cur?.buy?.target === "category") {
                  itemQty = cart?.cartItems?.reduce((ac: any, ar: any) => {
                    if (
                      cur?.buy?.categoryRefs?.includes(ar?.categoryRef) &&
                      !ar?.isFree
                    ) {
                      return ac + Number(ar?.qty);
                    } else return ac;
                  }, 0);
                }

                const includedItemQty = cart?.cartItems?.reduce(
                  (acc: any, ob: any) => {
                    if (
                      cur?.buyProductSkus.includes(ob?.sku) &&
                      !ob?.isFree &&
                      !ob?.isQtyFree
                    ) {
                      return acc + Number(ob?.qty);
                    } else return acc;
                  },
                  0
                );

                if (
                  cur?.promotionType === "advance" &&
                  cur?.condition === "buys_the_following_items" &&
                  cur?.reward?.rewardType === "save_certain_amount" &&
                  cur?.buy?.productRefs?.length <= 0 &&
                  cur?.buy?.categoryRefs?.length <= 0
                ) {
                  if (cur?.discountType === "percent") {
                    let totalAmountToConsider =
                      true &&
                      cur?.type === "promotion" &&
                      item?.modifiers?.length > 0
                        ? item.total
                        : item.total;

                    // minus  - cartData.totalModifierAmount

                    const totalVatAmountToConsider =
                      true &&
                      cur?.type === "promotion" &&
                      item?.modifiers?.length > 0
                        ? item.vatAmount
                        : item.vatAmount;

                    const discountAmount =
                      (totalAmountToConsider * cur.discount) / 100;

                    const discountedVat =
                      (totalVatAmountToConsider * cur.discount) / 100;

                    totalPromotionDiscount += discountAmount;

                    item.exactTotal = item.total;

                    item.exactVat = item.vatAmount;

                    item.discountedTotal =
                      totalAmountToConsider - discountAmount;

                    item.discountedVatAmount =
                      totalVatAmountToConsider - discountedVat;

                    item.promotionsData = item.promotionsData || [];

                    const itemSpecificDiscount = item.promotionsData.reduce(
                      (ac: any, ar: any) => {
                        if (ar?.type === "specific") {
                          return ac + ar?.discount;
                        } else return ac;
                      },
                      0
                    );

                    item.discountedTotal = item.total - itemSpecificDiscount;
                  } else {
                    let totalAmountToConsider =
                      true &&
                      cur?.type === "promotion" &&
                      item?.modifiers?.length > 0
                        ? item.total
                        : item.total;

                    const specificLength = totalAddedItemsLength;

                    const totalVatAmountToConsider =
                      true &&
                      cur?.type === "promotion" &&
                      item?.modifiers?.length > 0
                        ? item.vatAmount
                        : item.vatAmount;

                    const fixedPercentage =
                      Number((cur?.discount * 100) / totalAmountToConsider) /
                      specificLength;

                    const discountAmount =
                      (totalAmountToConsider * fixedPercentage) / 100;

                    const discountedVat =
                      (item.vatAmount * fixedPercentage) / 100;

                    totalPromotionDiscount += discountAmount;

                    item.exactTotal = item.total;

                    item.exactVat = item.vatAmount;

                    item.discountedTotal =
                      totalAmountToConsider - discountAmount;

                    item.discountedVatAmount =
                      totalVatAmountToConsider - discountedVat;

                    item.promotionsData = item.promotionsData || [];

                    const itemSpecificDiscount = item.promotionsData.reduce(
                      (ac: any, ar: any) => {
                        if (ar?.type === "specific") {
                          return ac + ar?.discount;
                        } else return ac;
                      },
                      0
                    );

                    item.discountedTotal = item.total - itemSpecificDiscount;
                  }

                  const doc = item?.promotionsData?.find(
                    (f: any) => f?.id === cur?._id
                  );

                  const fixedPercentage =
                    cur?.discountType === "amount"
                      ? (Number(cur?.discount / item?.total) * 100) /
                        totalAddedItemsLength
                      : Number(cur?.discount);

                  const discountAmount = (item.total * fixedPercentage) / 100;

                  if (doc) {
                    const newArray = [...item?.promotionsData]?.filter(
                      (pro) => pro?.id !== doc?.id
                    );

                    newArray.push({
                      name: cur.code,
                      discount:
                        cur?.discountType == "percent"
                          ? (item.total * cur.discount) / 100
                          : discountAmount,
                      id: cur?._id,
                      type: "specific",
                    });

                    item.promotionsData = [...newArray];
                  }

                  if (!doc) {
                    item.promotionsData = item?.promotionsData || [];

                    const newArray = [...item?.promotionsData];

                    newArray.push({
                      name: cur.code,
                      discount:
                        cur?.discountType == "percent"
                          ? (item.total * cur.discount) / 100
                          : discountAmount,
                      id: cur?._id,
                      type: "specific",
                    });

                    item.promotionsData = [...newArray];
                  }

                  if (
                    totalPromotionDiscount > cur?.offer?.budget &&
                    cur?.offer?.type === "budget" &&
                    cur?.offer?.budgetType !== "unlimited"
                  ) {
                    delete item.exactTotal;
                    delete item.exactVat;
                    delete item.discountedTotal;
                    delete item.discountedVatAmount;
                    delete item.promotionsData;
                    cart.removePromotion(index, (promotions: any) => {
                      debugLog(
                        "Promotion removed from cart",
                        promotions,
                        "cart-billing-screen",
                        "handleRemoveDiscountFunctionBUDGET43"
                      );
                      EventRegister.emit("promotionRemoved", promotions);
                    });
                    return;
                  }

                  if (discountAmount > item?.total) {
                    delete item.exactTotal;
                    delete item.exactVat;
                    delete item.discountedTotal;
                    delete item.discountedVatAmount;
                    delete item.promotionsData;
                    const indexes: number[] = [];

                    const exists = cart?.cartItems
                      ?.map((cartItems: any, ind: number) => {
                        if (cartItems?.isFree || cartItems?.isQtyFree) {
                          indexes.push(ind);
                        }
                        return cartItems?.promotionsData?.some(
                          (promoData: any) => {
                            return (
                              promoData?.id === promotionsApplied[index]._id
                            );
                          }
                        );
                      })
                      .filter((filterOp: any) => filterOp);

                    if (indexes?.length > 0) {
                      cart.bulkRemoveFromCart(indexes, (removedItems: any) => {
                        debugLog(
                          "Items removed from cart",
                          removedItems,
                          "cart-context",
                          "calculatedPromotionsMethod1"
                        );
                        EventRegister.emit("itemRemoved", removedItems);
                      });
                    }

                    if (exists?.length === 1) {
                      cart.removePromotion(index, (promotions: any) => {
                        debugLog(
                          "Promotion removed from cart",
                          promotions,
                          "cart-billing-screen",
                          "handleRemoveDiscountFunctionBUDGET4"
                        );
                        EventRegister.emit("promotionRemoved", promotions);
                      });
                    }
                  }
                }

                if (
                  cur?.buyProductSkus?.length > 0 &&
                  cur.buyProductSkus.includes(item.sku) &&
                  ((cur?.buy?.buyType === "quantity" &&
                    cur?.buy?.quantity <= item?.qty) ||
                    (cur?.buy?.buyType === "minMax" &&
                      cur?.buy?.min <= item?.qty)) &&
                  cur?.reward?.rewardType === "pay_fixed_price" &&
                  cur?.buy?.target === "product"
                ) {
                  const unitPrice = item?.sellingPrice + item?.vatAmount;

                  let totalAmountToConsider =
                    cur?.buy?.buyType === "minMax" && cur?.buy?.max < item?.qty
                      ? unitPrice * cur?.buy?.max
                      : item.total;

                  const totalVatAmountToConsider =
                    true &&
                    cur?.type === "promotion" &&
                    item?.modifiers?.length > 0
                      ? item.vatAmount
                      : item.vatAmount;

                  const fixedPercentage = Number(
                    ((totalAmountToConsider - cur?.reward?.payAmount) /
                      totalAmountToConsider) *
                      100
                  );

                  const discountAmount =
                    (totalAmountToConsider * fixedPercentage) / 100;

                  const discountedVat =
                    (item.vatAmount * fixedPercentage) / 100;

                  totalPromotionDiscount += discountAmount;

                  item.exactTotal = item.total;

                  item.exactVat = item.vatAmount;

                  item.discountedTotal =
                    cur?.buy?.buyType === "minMax" && cur?.buy?.max < item?.qty
                      ? item?.total - discountAmount
                      : totalAmountToConsider - discountAmount;

                  item.discountedVatAmount =
                    totalVatAmountToConsider - discountedVat;

                  item.promotionsData = item.promotionsData || [];

                  const doc = item?.promotionsData?.find(
                    (f: any) => f?.id === cur?._id
                  );

                  if (
                    doc &&
                    (cur.buyProductSkus.includes(item.sku) ||
                      cur?.buyProductSkus?.length <= 0)
                  ) {
                    const newArray = [...item?.promotionsData]?.filter(
                      (pro) => pro?.id !== doc?.id
                    );

                    newArray.push({
                      name: cur.code,
                      discount:
                        cur?.discountType == "percent"
                          ? (item.total * cur.discount) / 100
                          : discountAmount,
                      id: cur?._id,
                      type: "specific",
                    });

                    item.promotionsData = [...newArray];
                  }

                  if (
                    !doc &&
                    (cur.buyProductSkus.includes(item.sku) ||
                      cur?.buyProductSkus?.length <= 0)
                  ) {
                    item.promotionsData = item?.promotionsData || [];

                    const newArray = [...item?.promotionsData];

                    newArray.push({
                      name: cur.code,
                      discount:
                        cur?.discountType == "percent"
                          ? (item.total * cur.discount) / 100
                          : discountAmount,
                      id: cur?._id,
                      type: "specific",
                    });

                    item.promotionsData = [...newArray];
                  }

                  if (
                    cur?.promotionType === "advance" &&
                    cur?.condition === "spends_the_following_amount" &&
                    cur?.buy?.spendAmount > cartData.totalAmount
                  ) {
                    delete item.exactTotal;
                    delete item.exactVat;
                    delete item.discountedTotal;
                    delete item.discountedVatAmount;
                    delete item.promotionsData;
                    cart.removePromotion(index, (promotions: any) => {
                      debugLog(
                        "Promotion removed from cart",
                        promotions,
                        "cart-billing-screen",
                        "handleRemoveDiscountFunctionBUDGET5"
                      );
                      EventRegister.emit("promotionRemoved", promotions);
                    });
                    return;
                  }

                  if (
                    totalPromotionDiscount > cur?.offer?.budget &&
                    cur?.offer?.type === "budget" &&
                    cur?.offer?.budgetType !== "unlimited"
                  ) {
                    delete item.exactTotal;
                    delete item.exactVat;
                    delete item.discountedTotal;
                    delete item.discountedVatAmount;
                    delete item.promotionsData;
                    cart.removePromotion(index, (promotions: any) => {
                      debugLog(
                        "Promotion removed from cart",
                        promotions,
                        "cart-billing-screen",
                        "handleRemoveDiscountFunctionBUDGET4asda"
                      );
                      EventRegister.emit("promotionRemoved", promotions);
                    });
                    return;
                  }
                }

                if (
                  cur?.buy?.categoryRefs?.length > 0 &&
                  cur.buy?.categoryRefs.includes(item.categoryRef) &&
                  ((cur?.buy?.buyType === "quantity" &&
                    cur?.buy?.quantity <= itemQty) ||
                    (cur?.buy?.buyType === "minMax" &&
                      cur?.buy?.min <= itemQty)) &&
                  cur?.reward?.rewardType === "pay_fixed_price" &&
                  cur?.buy?.target === "category"
                ) {
                  const unitPrice = item?.sellingPrice + item?.vatAmount;

                  let totalAmountToConsider =
                    cur?.buy?.buyType === "minMax" && cur?.buy?.max < itemQty
                      ? unitPrice * cur?.buy?.max
                      : item.total;

                  const totalVatAmountToConsider =
                    true &&
                    cur?.type === "promotion" &&
                    item?.modifiers?.length > 0
                      ? item.vatAmount
                      : item.vatAmount;

                  const fixedPercentage = Number(
                    ((totalAmountToConsider - cur?.reward?.payAmount) /
                      totalAmountToConsider) *
                      100
                  );

                  const discountAmount =
                    (totalAmountToConsider * fixedPercentage) / 100;

                  const discountedVat =
                    (item.vatAmount * fixedPercentage) / 100;

                  totalPromotionDiscount += discountAmount;

                  item.exactTotal = item.total;

                  item.exactVat = item.vatAmount;

                  item.discountedTotal =
                    cur?.buy?.buyType === "minMax" && cur?.buy?.max < itemQty
                      ? item?.total - discountAmount
                      : totalAmountToConsider - discountAmount;

                  item.discountedVatAmount =
                    totalVatAmountToConsider - discountedVat;

                  item.promotionsData = item.promotionsData || [];

                  const doc = item?.promotionsData?.find(
                    (f: any) => f?.id === cur?._id
                  );

                  if (
                    doc &&
                    (cur?.buy?.categoryRefs.includes(item.categoryRef) ||
                      cur?.buy?.categoryRefs?.length <= 0)
                  ) {
                    const newArray = [...item?.promotionsData]?.filter(
                      (pro) => pro?.id !== doc?.id
                    );

                    newArray.push({
                      name: cur.code,
                      discount:
                        cur?.discountType == "percent"
                          ? (item.total * cur.discount) / 100
                          : discountAmount,
                      id: cur?._id,
                      type: "specific",
                    });

                    item.promotionsData = [...newArray];
                  }

                  if (
                    !doc &&
                    (cur?.buy?.categoryRefs.includes(item.categoryRef) ||
                      cur?.buy?.categoryRefs?.length <= 0)
                  ) {
                    item.promotionsData = item?.promotionsData || [];

                    const newArray = [...item?.promotionsData];

                    newArray.push({
                      name: cur.code,
                      discount:
                        cur?.discountType == "percent"
                          ? (item.total * cur.discount) / 100
                          : discountAmount,
                      id: cur?._id,
                      type: "specific",
                    });

                    item.promotionsData = [...newArray];
                  }

                  if (
                    cur?.promotionType === "advance" &&
                    cur?.condition === "spends_the_following_amount" &&
                    cur?.buy?.spendAmount > cartData.totalAmount
                  ) {
                    delete item.exactTotal;
                    delete item.exactVat;
                    delete item.discountedTotal;
                    delete item.discountedVatAmount;
                    delete item.promotionsData;
                    cart.removePromotion(index, (promotions: any) => {
                      debugLog(
                        "Promotion removed from cart",
                        promotions,
                        "cart-billing-screen",
                        "asdasdadadasdasd"
                      );
                      EventRegister.emit("promotionRemoved", promotions);
                    });
                    return;
                  }

                  if (
                    totalPromotionDiscount > cur?.offer?.budget &&
                    cur?.offer?.type === "budget" &&
                    cur?.offer?.budgetType !== "unlimited"
                  ) {
                    delete item.exactTotal;
                    delete item.exactVat;
                    delete item.discountedTotal;
                    delete item.discountedVatAmount;
                    delete item.promotionsData;
                    cart.removePromotion(index, (promotions: any) => {
                      debugLog(
                        "Promotion removed from cart",
                        promotions,
                        "cart-billing-screen",
                        "handleRemoveDiscountFunctionBUdasdasdasdadsdDGET"
                      );
                      EventRegister.emit("promotionRemoved", promotions);
                    });
                    return;
                  }
                }

                if (
                  cur?.reward?.rewardType === "pay_fixed_price" &&
                  cur?.buy?.productRefs?.length <= 0 &&
                  cur?.buy?.categoryRefs?.length <= 0
                ) {
                  const unitPrice = item?.sellingPrice + item?.vatAmount;

                  let totalAmountToConsider =
                    cur?.buy?.buyType === "minMax" &&
                    cartData?.totalQty > cur?.buy?.max
                      ? unitPrice * cur?.buy?.max
                      : item.total;

                  const totalVatAmountToConsider =
                    true &&
                    cur?.type === "promotion" &&
                    item?.modifiers?.length > 0
                      ? item.vatAmount
                      : item.vatAmount;

                  const fixedPercentage = Number(
                    ((totalAmountToConsider - cur?.reward?.payAmount) /
                      totalAmountToConsider) *
                      100
                  );

                  const discountAmount =
                    (totalAmountToConsider * fixedPercentage) / 100;

                  const discountedVat =
                    (item.vatAmount * fixedPercentage) / 100;

                  totalPromotionDiscount += discountAmount;

                  item.exactTotal = item.total;

                  item.exactVat = item.vatAmount;

                  item.discountedTotal =
                    cur?.buy?.buyType === "minMax" &&
                    cur?.buy?.max < cartData?.totalQty
                      ? item?.total - discountAmount
                      : totalAmountToConsider - discountAmount;

                  item.discountedVatAmount =
                    totalVatAmountToConsider - discountedVat;

                  item.promotionsData = item.promotionsData || [];

                  const doc = item?.promotionsData?.find(
                    (f: any) => f?.id === cur?._id
                  );

                  if (
                    doc &&
                    (cur?.buy?.categoryRefs.includes(item.categoryRef) ||
                      cur?.buy?.categoryRefs?.length <= 0)
                  ) {
                    const newArray = [...item?.promotionsData]?.filter(
                      (pro) => pro?.id !== doc?.id
                    );

                    newArray.push({
                      name: cur.code,
                      discount:
                        cur?.discountType == "percent"
                          ? (item.total * cur.discount) / 100
                          : discountAmount,
                      id: cur?._id,
                      type: "specific",
                    });

                    item.promotionsData = [...newArray];
                  }

                  if (
                    !doc &&
                    (cur?.buy?.categoryRefs.includes(item.categoryRef) ||
                      cur?.buy?.categoryRefs?.length <= 0)
                  ) {
                    item.promotionsData = item?.promotionsData || [];

                    const newArray = [...item?.promotionsData];

                    newArray.push({
                      name: cur.code,
                      discount:
                        cur?.discountType == "percent"
                          ? (item.total * cur.discount) / 100
                          : discountAmount,
                      id: cur?._id,
                      type: "specific",
                    });

                    item.promotionsData = [...newArray];
                  }

                  if (
                    cur?.promotionType === "advance" &&
                    cur?.condition === "spends_the_following_amount" &&
                    cur?.buy?.spendAmount > cartData.totalAmount
                  ) {
                    delete item.exactTotal;
                    delete item.exactVat;
                    delete item.discountedTotal;
                    delete item.discountedVatAmount;
                    delete item.promotionsData;
                    cart.removePromotion(index, (promotions: any) => {
                      debugLog(
                        "Promotion removed from cart",
                        promotions,
                        "cart-billing-screen",
                        "handleRemoveDiscountFunctionBUDGET1212"
                      );
                      EventRegister.emit("promotionRemoved", promotions);
                    });
                    return;
                  }

                  if (
                    totalPromotionDiscount > cur?.offer?.budget &&
                    cur?.offer?.type === "budget" &&
                    cur?.offer?.budgetType !== "unlimited"
                  ) {
                    delete item.exactTotal;
                    delete item.exactVat;
                    delete item.discountedTotal;
                    delete item.discountedVatAmount;
                    delete item.promotionsData;
                    cart.removePromotion(index, (promotions: any) => {
                      debugLog(
                        "Promotion removed from cart",
                        promotions,
                        "cart-billing-screen",
                        "handleRemoveDiscountFunctionBUDGET123213"
                      );
                      EventRegister.emit("promotionRemoved", promotions);
                    });
                    return;
                  }
                }

                if (
                  cur?.reward?.rewardType === "save_certain_amount" &&
                  cur?.reward?.saveOn === "off_the_specific_items_above" &&
                  (cur?.buy?.productRefs?.length > 0 ||
                    cur?.buy?.categoryRefs?.length > 0)
                ) {
                  const unitPrice = item?.sellingPrice + item?.vatAmount;

                  const categoryQuantities = cart?.cartItems?.reduce(
                    (ac: any, ar: any) => {
                      if (
                        cur?.buy?.categoryRefs?.includes(ar?.categoryRef) &&
                        !ar?.isFree &&
                        !ar?.isQtyFree
                      ) {
                        return ac + Number(ar?.qty);
                      } else return ac;
                    },
                    0
                  );

                  if (
                    cur.buyProductSkus.includes(item.sku) &&
                    cur?.buy?.target === "product" &&
                    ((cur?.buy?.buyType === "quantity" &&
                      cur?.buy?.quantity <= includedItemQty) ||
                      (cur?.buy?.buyType === "minMax" &&
                        cur?.buy?.min <= includedItemQty))
                  ) {
                    const res = cart.cartItems.some((id: any) =>
                      cur.buyProductSkus.includes(id.sku)
                    );

                    if (!res) {
                      return;
                    }

                    if (cur?.discountType === "percent") {
                      let totalAmountToConsider =
                        cur?.buy?.buyType === "minMax" &&
                        cur?.buy?.max < includedItemQty
                          ? unitPrice * cur?.buy?.max
                          : item.total;

                      // minus  - cartData.totalModifierAmount

                      const totalVatAmountToConsider =
                        true &&
                        cur?.type === "promotion" &&
                        item?.modifiers?.length > 0
                          ? item.vatAmount
                          : item.vatAmount;

                      const discountAmount =
                        (totalAmountToConsider * cur.discount) / 100;

                      const discountedVat =
                        (totalVatAmountToConsider * cur.discount) / 100;

                      totalPromotionDiscount += discountAmount;

                      item.exactTotal = item.total;

                      item.exactVat = item.vatAmount;

                      item.discountedTotal =
                        cur?.buy?.buyType === "minMax" &&
                        cur?.buy?.max < includedItemQty
                          ? item?.total - discountAmount
                          : totalAmountToConsider - discountAmount;

                      item.discountedVatAmount =
                        totalVatAmountToConsider - discountedVat;

                      item.promotionsData = item.promotionsData || [];
                    } else {
                      const includedItemslength = cart.cartItems.filter(
                        (car: any) => cur.productSkus.includes(car.sku)
                      );

                      const includedCategoryLength = [cart.cartItems].filter(
                        (car: any) =>
                          cur.promotionTargetIds.includes(car.categoryRef)
                      );

                      let totalAmountToConsider =
                        true &&
                        cur?.type === "promotion" &&
                        item?.modifiers?.length > 0
                          ? item.total
                          : item.total;

                      const specificLength =
                        includedItemslength.length > 0
                          ? includedItemslength.length
                          : includedCategoryLength.length > 0
                          ? includedCategoryLength.length
                          : 1;

                      const totalVatAmountToConsider =
                        true &&
                        cur?.type === "promotion" &&
                        item?.modifiers?.length > 0
                          ? item.vatAmount
                          : item.vatAmount;

                      const fixedPercentage =
                        Number((cur?.discount * 100) / totalAmountToConsider) /
                        specificLength;

                      const discountAmount =
                        (totalAmountToConsider * fixedPercentage) / 100;

                      const discountedVat =
                        (item.vatAmount * fixedPercentage) / 100;

                      totalPromotionDiscount += discountAmount;

                      item.exactTotal = item.total;

                      item.exactVat = item.vatAmount;

                      item.discountedTotal =
                        totalAmountToConsider - discountAmount;

                      item.discountedVatAmount =
                        totalVatAmountToConsider - discountedVat;

                      item.promotionsData = item.promotionsData || [];

                      const itemSpecificDiscount = item.promotionsData.reduce(
                        (ac: any, ar: any) => {
                          if (ar?.type === "specific") {
                            return ac + ar?.discount;
                          } else return ac;
                        },
                        0
                      );

                      item.discountedTotal = item.total - itemSpecificDiscount;
                    }
                  }

                  if (
                    cur.buy?.categoryRefs.includes(item.categoryRef) &&
                    cur?.buy?.target === "category" &&
                    ((cur?.buy?.buyType === "quantity" &&
                      cur?.buy?.quantity <= categoryQuantities) ||
                      (cur?.buy?.buyType === "minMax" &&
                        cur?.buy?.min <= categoryQuantities))
                  ) {
                    const res = cart.cartItems.some((id: any) =>
                      cur.buy?.categoryRefs.includes(id.categoryRef)
                    );

                    if (!res) {
                      return;
                    }

                    if (cur?.discountType === "percent") {
                      let totalAmountToConsider =
                        cur?.buy?.buyType === "minMax" &&
                        cur?.buy?.max < categoryQuantities
                          ? unitPrice * cur?.buy?.max
                          : item.total;

                      const discountAmount =
                        (totalAmountToConsider * cur.discount) / 100;

                      const discountedVat =
                        (item.vatAmount * cur.discount) / 100;

                      const totalVatAmountToConsider =
                        true &&
                        cur?.type === "promotion" &&
                        item?.modifiers?.length > 0
                          ? item.vatAmount
                          : item.vatAmount;

                      totalPromotionDiscount += discountAmount;

                      item.exactTotal = item.total;

                      item.exactVat = item.vatAmount;

                      item.discountedTotal =
                        cur?.buy?.buyType === "minMax" &&
                        cur?.buy?.max < categoryQuantities
                          ? item?.total - discountAmount
                          : totalAmountToConsider - discountAmount;

                      item.discountedVatAmount =
                        totalVatAmountToConsider - discountedVat;

                      item.promotionsData = item.promotionsData || [];
                    } else {
                      const includedItemslength = cart.cartItems.filter(
                        (car: any) => cur.productSkus.includes(car.sku)
                      );

                      const includedCategoryLength = [cart.cartItems].filter(
                        (car: any) =>
                          cur.promotionTargetIds.includes(car.categoryRef)
                      );

                      let totalAmountToConsider =
                        true &&
                        cur?.type === "promotion" &&
                        item?.modifiers?.length > 0
                          ? item.total
                          : item.total;

                      const specificLength =
                        includedItemslength.length > 0
                          ? includedItemslength.length
                          : includedCategoryLength.length > 0
                          ? includedCategoryLength.length
                          : 1;

                      const totalVatAmountToConsider =
                        true &&
                        cur?.type === "promotion" &&
                        item?.modifiers?.length > 0
                          ? item.vatAmount
                          : item.vatAmount;

                      const fixedPercentage =
                        Number((cur?.discount * 100) / totalAmountToConsider) /
                        specificLength;

                      const discountAmount =
                        (totalAmountToConsider * fixedPercentage) / 100;

                      const discountedVat =
                        (item.vatAmount * fixedPercentage) / 100;

                      totalPromotionDiscount += discountAmount;

                      item.exactTotal = item.total;

                      item.exactVat = item.vatAmount;

                      item.discountedTotal =
                        totalAmountToConsider - discountAmount;

                      item.discountedVatAmount =
                        totalVatAmountToConsider - discountedVat;

                      item.promotionsData = item.promotionsData || [];

                      const itemSpecificDiscount = item.promotionsData.reduce(
                        (ac: any, ar: any) => {
                          if (ar?.type === "specific") {
                            return ac + ar?.discount;
                          } else return ac;
                        },
                        0
                      );

                      item.discountedTotal = item.total - itemSpecificDiscount;
                    }
                  }

                  const doc = item?.promotionsData?.find(
                    (f: any) => f?.id === cur?._id
                  );

                  const includedItemslength = cart.cartItems.filter(
                    (car: any) => cur.productSkus.includes(car.sku)
                  );

                  const includedCategoryLength = [cart.cartItems].filter(
                    (car: any) =>
                      cur.promotionTargetIds.includes(car.categoryRef)
                  );

                  const specificLength =
                    includedItemslength.length > 0
                      ? includedItemslength.length
                      : includedCategoryLength.length > 0
                      ? includedCategoryLength.length
                      : 1;

                  const fixedPercentage =
                    Number((cur?.discount * 100) / item.total) / specificLength;

                  const discountAmount = (item.total * fixedPercentage) / 100;

                  if (
                    doc &&
                    (cur.promotionTargetIds.includes(item.categoryRef) ||
                      cur.productSkus.includes(item.sku))
                  ) {
                    const newArray = [...item?.promotionsData]?.filter(
                      (pro) => pro?.id !== doc?.id
                    );

                    newArray.push({
                      name: cur.code,
                      discount:
                        cur?.discountType == "percent"
                          ? (item.total * cur.discount) / 100
                          : discountAmount,
                      id: cur?._id,
                      type: "specific",
                    });

                    item.promotionsData = [...newArray];
                  }

                  if (
                    !doc &&
                    (cur.promotionTargetIds.includes(item.categoryRef) ||
                      cur.productSkus.includes(item.sku))
                  ) {
                    item.promotionsData = item?.promotionsData || [];

                    const newArray = [...item?.promotionsData];

                    newArray.push({
                      name: cur.code,
                      discount:
                        cur?.discountType == "percent"
                          ? (item.total * cur.discount) / 100
                          : discountAmount,
                      id: cur?._id,
                      type: "specific",
                    });

                    item.promotionsData = [...newArray];
                  }

                  if (
                    totalPromotionDiscount > cur?.offer?.budget &&
                    cur?.offer?.type === "budget" &&
                    cur?.offer?.budgetType !== "unlimited"
                  ) {
                    delete item.exactTotal;
                    delete item.exactVat;
                    delete item.discountedTotal;
                    delete item.discountedVatAmount;
                    delete item.promotionsData;
                    cart.removePromotion(index, (promotions: any) => {
                      debugLog(
                        "Promotion removed from cart",
                        promotions,
                        "cart-billing-screen",
                        "handleRemoveDiscountFunctionBUDGET123213"
                      );
                      EventRegister.emit("promotionRemoved", promotions);
                    });
                    return;
                  }
                }

                if (
                  cur?.promotionType === "advance" &&
                  cur?.condition === "buys_the_following_items" &&
                  cur?.reward?.rewardType === "save_certain_amount" &&
                  cur?.buy?.productRefs?.length <= 0 &&
                  cur?.buy?.categoryRefs?.length <= 0
                ) {
                  const quantities = cart?.cartItems?.reduce(
                    (prev: any, curr: any) => prev + Number(curr?.qty),
                    0
                  );

                  const res = cart.cartItems.some((cart: any) => {
                    if (cur?.buy?.target === "product") {
                      return (
                        !cart.isFree &&
                        ((cur?.buy?.buyType === "quantity" &&
                          cur?.buy?.quantity <= quantities) ||
                          (cur?.buy?.buyType === "minMax" &&
                            cur?.buy?.min <= quantities))
                      );
                    } else if (cur?.buy?.target === "category") {
                      return (
                        !cart.isFree &&
                        ((cur?.buy?.buyType === "quantity" &&
                          cur?.buy?.quantity <= quantities) ||
                          (cur?.buy?.buyType === "minMax" &&
                            cur?.buy?.min <= quantities))
                      );
                    }
                  });

                  if (!res) {
                    const indexes: number[] = [];

                    const exists = cart?.cartItems
                      ?.map((cartItems: any, ind: number) => {
                        if (cartItems?.isFree) {
                          indexes.push(ind);
                        }
                        return cartItems?.promotionsData?.some(
                          (promoData: any) => {
                            return (
                              promoData?.id === promotionsApplied[index]._id
                            );
                          }
                        );
                      })
                      .filter((filterOp: any) => filterOp);

                    if (exists?.length <= 0) {
                      delete item.exactTotal;
                      delete item.exactVat;
                      delete item.discountedTotal;
                      delete item.discountedVatAmount;
                      delete item.promotionsData;

                      EventRegister.emit("itemUpated", items);
                      cart.removePromotion(index, (promotions: any) => {
                        debugLog(
                          "Promotion removed from cart",
                          promotions,
                          "cart-billing-screen",
                          "handleRemoveDiscountFunctionBUDGETasdsad2222"
                        );
                        EventRegister.emit("promotionRemoved", promotions);
                      });
                    }
                    if (indexes?.length > 0) {
                      cart.bulkRemoveFromCart(indexes, (removedItems: any) => {
                        debugLog(
                          "Items removed from cart",
                          removedItems,
                          "cart-context",
                          "calculatedPromotionsMethod1"
                        );
                        EventRegister.emit("itemRemoved", removedItems);
                      });
                    }
                  }
                }

                if (
                  cur?.reward?.rewardType === "save_certain_amount" &&
                  cur?.reward?.saveOn === "off_the_entire_sale" &&
                  (cur?.buy?.productRefs?.length > 0 ||
                    cur?.buy?.categoryRefs?.length > 0)
                ) {
                  const categoryQuantities = cart?.cartItems?.reduce(
                    (ac: any, ar: any) => {
                      if (
                        cur?.buy?.categoryRefs?.includes(ar?.categoryRef) &&
                        !ar?.isFree
                      ) {
                        return ac + Number(ar?.qty);
                      } else return ac;
                    },
                    0
                  );

                  if (
                    cur.buyProductSkus.includes(item.sku) &&
                    cur?.buy?.target === "product" &&
                    ((cur?.buy?.buyType === "quantity" &&
                      cur?.buy?.quantity <= item?.qty) ||
                      (cur?.buy?.buyType === "minMax" &&
                        cur?.buy?.min <= item?.qty))
                  ) {
                    const res = cart.cartItems.some((id: any) =>
                      cur.buyProductSkus.includes(id.sku)
                    );

                    if (!res) {
                      return;
                    }

                    if (cur?.discountType === "percent") {
                      let totalAmountToConsider =
                        true &&
                        cur?.type === "promotion" &&
                        item?.modifiers?.length > 0
                          ? item.total
                          : item.total;

                      // minus  - cartData.totalModifierAmount

                      const totalVatAmountToConsider =
                        true &&
                        cur?.type === "promotion" &&
                        item?.modifiers?.length > 0
                          ? item.vatAmount
                          : item.vatAmount;

                      const discountAmount =
                        (totalAmountToConsider * cur.discount) / 100;

                      const discountedVat =
                        (totalVatAmountToConsider * cur.discount) / 100;

                      totalPromotionDiscount += discountAmount;

                      item.exactTotal = item.total;

                      item.exactVat = item.vatAmount;

                      item.discountedTotal =
                        totalAmountToConsider - discountAmount;

                      item.discountedVatAmount =
                        totalVatAmountToConsider - discountedVat;

                      item.promotionsData = item.promotionsData || [];

                      const itemSpecificDiscount = item.promotionsData.reduce(
                        (ac: any, ar: any) => {
                          if (ar?.type === "specific") {
                            return ac + ar?.discount;
                          } else return ac;
                        },
                        0
                      );

                      item.discountedTotal = item.total - itemSpecificDiscount;
                    } else {
                      const includedItemslength = cart.cartItems.filter(
                        (car: any) => cur.buyProductSkus.includes(car.sku)
                      );

                      const includedCategoryLength = [cart.cartItems].filter(
                        (car: any) =>
                          cur.buy?.categoryRefs.includes(car.categoryRef)
                      );

                      let totalAmountToConsider =
                        true &&
                        cur?.type === "promotion" &&
                        item?.modifiers?.length > 0
                          ? item.total
                          : item.total;

                      const specificLength =
                        includedItemslength.length > 0
                          ? includedItemslength.length
                          : includedCategoryLength.length > 0
                          ? includedCategoryLength.length
                          : 1;

                      const totalVatAmountToConsider =
                        true &&
                        cur?.type === "promotion" &&
                        item?.modifiers?.length > 0
                          ? item.vatAmount
                          : item.vatAmount;

                      const fixedPercentage =
                        Number((cur?.discount * 100) / totalAmountToConsider) /
                        specificLength;

                      const discountAmount =
                        (totalAmountToConsider * fixedPercentage) / 100;

                      const discountedVat =
                        (item.vatAmount * fixedPercentage) / 100;

                      totalPromotionDiscount += discountAmount;

                      item.exactTotal = item.total;

                      item.exactVat = item.vatAmount;

                      item.discountedTotal =
                        totalAmountToConsider - discountAmount;

                      item.discountedVatAmount =
                        totalVatAmountToConsider - discountedVat;

                      item.promotionsData = item.promotionsData || [];

                      const itemSpecificDiscount = item.promotionsData.reduce(
                        (ac: any, ar: any) => {
                          if (ar?.type === "specific") {
                            return ac + ar?.discount;
                          } else return ac;
                        },
                        0
                      );

                      item.discountedTotal = item.total - itemSpecificDiscount;
                    }
                  }

                  if (
                    cur.buy?.categoryRefs.includes(item.categoryRef) &&
                    cur?.buy?.target === "category" &&
                    ((cur?.buy?.buyType === "quantity" &&
                      cur?.buy?.quantity <= categoryQuantities) ||
                      (cur?.buy?.buyType === "minMax" &&
                        cur?.buy?.min <= categoryQuantities))
                  ) {
                    const res = cart.cartItems.some((id: any) =>
                      cur.buy?.categoryRefs.includes(id.categoryRef)
                    );

                    if (!res) {
                      return;
                    }

                    if (cur?.discountType === "percent") {
                      let totalAmountToConsider = item.total;

                      const discountAmount =
                        (totalAmountToConsider * cur.discount) / 100;

                      const discountedVat =
                        (item.vatAmount * cur.discount) / 100;

                      const totalVatAmountToConsider =
                        true &&
                        cur?.type === "promotion" &&
                        item?.modifiers?.length > 0
                          ? item.vatAmount
                          : item.vatAmount;

                      totalPromotionDiscount += discountAmount;

                      item.exactTotal = item.total;

                      item.exactVat = item.vatAmount;

                      item.discountedTotal = item?.total - discountAmount;

                      item.discountedVatAmount =
                        totalVatAmountToConsider - discountedVat;

                      item.promotionsData = item.promotionsData || [];
                    } else {
                      const includedItemslength = cart.cartItems.filter(
                        (car: any) => cur.buyProductSkus.includes(car.sku)
                      );

                      const includedCategoryLength = [cart.cartItems].filter(
                        (car: any) =>
                          cur.buy?.categoryRefs.includes(car.categoryRef)
                      );

                      let totalAmountToConsider = item.total;

                      const specificLength =
                        includedItemslength.length > 0
                          ? includedItemslength.length
                          : includedCategoryLength.length > 0
                          ? includedCategoryLength.length
                          : 1;

                      const totalVatAmountToConsider =
                        true &&
                        cur?.type === "promotion" &&
                        item?.modifiers?.length > 0
                          ? item.vatAmount
                          : item.vatAmount;

                      const fixedPercentage =
                        Number((cur?.discount * 100) / totalAmountToConsider) /
                        specificLength;

                      const discountAmount =
                        (totalAmountToConsider * fixedPercentage) / 100;

                      const discountedVat =
                        (item.vatAmount * fixedPercentage) / 100;

                      totalPromotionDiscount += discountAmount;

                      item.exactTotal = item.total;

                      item.exactVat = item.vatAmount;

                      item.discountedTotal =
                        totalAmountToConsider - discountAmount;

                      item.discountedVatAmount =
                        totalVatAmountToConsider - discountedVat;

                      item.promotionsData = item.promotionsData || [];

                      const itemSpecificDiscount = item.promotionsData.reduce(
                        (ac: any, ar: any) => {
                          if (ar?.type === "specific") {
                            return ac + ar?.discount;
                          } else return ac;
                        },
                        0
                      );

                      item.discountedTotal = item.total - itemSpecificDiscount;
                    }
                  }

                  const doc = item?.promotionsData?.find(
                    (f: any) => f?.id === cur?._id
                  );

                  const includedItemslength = cart.cartItems.filter(
                    (car: any) => cur.buyProductSkus.includes(car.sku)
                  );

                  const includedCategoryLength = [cart.cartItems].filter(
                    (car: any) =>
                      cur.buy?.categoryRefs.includes(car.categoryRef)
                  );

                  const specificLength =
                    includedItemslength.length > 0
                      ? includedItemslength.length
                      : includedCategoryLength.length > 0
                      ? includedCategoryLength.length
                      : 1;

                  const fixedPercentage =
                    Number((cur?.discount * 100) / item.total) / specificLength;

                  const discountAmount = (item.total * fixedPercentage) / 100;

                  if (doc) {
                    const newArray = [...item?.promotionsData]?.filter(
                      (pro) => pro?.id !== doc?.id
                    );

                    newArray.push({
                      name: cur.code,
                      discount:
                        cur?.discountType == "percent"
                          ? (item.total * cur.discount) / 100
                          : discountAmount,
                      id: cur?._id,
                      type: "specific",
                    });

                    item.promotionsData = [...newArray];
                  }

                  if (!doc) {
                    item.promotionsData = item?.promotionsData || [];

                    const newArray = [...item?.promotionsData];

                    newArray.push({
                      name: cur.code,
                      discount:
                        cur?.discountType == "percent"
                          ? (item.total * cur.discount) / 100
                          : discountAmount,
                      id: cur?._id,
                      type: "specific",
                    });

                    item.promotionsData = [...newArray];
                  }

                  if (
                    totalPromotionDiscount > cur?.offer?.budget &&
                    cur?.offer?.type === "budget" &&
                    cur?.offer?.budgetType !== "unlimited"
                  ) {
                    delete item.exactTotal;
                    delete item.exactVat;
                    delete item.discountedTotal;
                    delete item.discountedVatAmount;
                    delete item.promotionsData;
                    cart.removePromotion(index, (promotions: any) => {
                      debugLog(
                        "Promotion removed from cart",
                        promotions,
                        "cart-billing-screen",
                        "handleRemoveDiscountFunctionBUDGETdasasdsda"
                      );
                      EventRegister.emit("promotionRemoved", promotions);
                    });
                    return;
                  }
                }

                if (
                  cur?.promotionType === "advance" &&
                  cur?.condition === "buys_the_following_items" &&
                  cur?.reward?.rewardType === "get_the_following_items" &&
                  cur?.reward?.discountType === "free" &&
                  cur?.buy?.target === "product" &&
                  cur?.buy?.productRefs?.length > 0 &&
                  cur?.buyProductSkus.includes(item.sku) &&
                  ((cur?.buy?.buyType === "quantity" &&
                    cur?.buy?.quantity > item?.qty) ||
                    (cur?.buy?.buyType === "minMax" &&
                      cur?.buy?.min > item?.qty))
                ) {
                  delete item.exactTotal;
                  delete item.exactVat;
                  delete item.discountedTotal;
                  delete item.discountedVatAmount;
                  delete item.promotionsData;

                  const indexes: number[] = [];

                  const res = cart.cartItems.some((cart: any, ind: number) => {
                    if (
                      (cart?.isFree || cart?.isQtyFree) &&
                      cart?.promotionsData?.some((promoData: any) => {
                        return promoData?.id === promotionsApplied[index]._id;
                      })
                    ) {
                      indexes.push(ind);
                    }
                    if (
                      cur?.buy?.target === "product" &&
                      cur?.buy?.productRefs?.length > 0
                    ) {
                      return (
                        cur?.buyProductSkus.includes(cart.sku) &&
                        !cart.isFree &&
                        ((cur?.buy?.buyType === "quantity" &&
                          cur?.buy?.quantity <= cart?.qty) ||
                          (cur?.buy?.buyType === "minMax" &&
                            cur?.buy?.min <= cart?.qty))
                      );
                    }
                  });

                  if (!res) {
                    cart.removePromotion(index, (promotions: any) => {
                      debugLog(
                        "Promotion removed from cart",
                        promotions,
                        "cart-billing-screen",
                        "handleRemoveDiscountFunctionBUDGETasdasdas"
                      );
                      EventRegister.emit("promotionRemoved", promotions);
                    });
                    cart.bulkRemoveFromCart(indexes, (removedItems: any) => {
                      debugLog(
                        "Items removed from cart",
                        removedItems,
                        "cart-context",
                        "calculatedPromotionsMethod2"
                      );
                    });
                  }
                }

                if (
                  cur?.promotionType === "advance" &&
                  cur?.condition === "buys_the_following_items" &&
                  cur?.reward?.rewardType === "get_the_following_items" &&
                  cur?.reward?.discountType === "free" &&
                  cur?.buy?.target === "category" &&
                  cur?.buy?.categoryRefs?.length > 0 &&
                  cur?.buy?.categoryRefs.includes(item.categoryRef) &&
                  ((cur?.buy?.buyType === "quantity" &&
                    cur?.buy?.quantity > itemQty) ||
                    (cur?.buy?.buyType === "minMax" && cur?.buy?.min > itemQty))
                ) {
                  delete item.exactTotal;
                  delete item.exactVat;
                  delete item.discountedTotal;
                  delete item.discountedVatAmount;
                  delete item.promotionsData;
                  const indexes: number[] = [];

                  const exists = cart?.cartItems
                    ?.map((cartItems: any, ind: number) => {
                      if (cartItems?.isFree || cartItems?.isQtyFree) {
                        indexes.push(ind);
                      }
                      return cartItems?.promotionsData?.some(
                        (promoData: any) => {
                          return promoData?.id === promotionsApplied[index]._id;
                        }
                      );
                    })
                    .filter((filterOp: any) => filterOp);

                  if (exists?.length <= 0) {
                    cart.removePromotion(index, (promotions: any) => {
                      debugLog(
                        "Promotion removed from cart",
                        promotions,
                        "cart-billing-screen",
                        "handleRemoveDiscountFunctionBUDGETasdasda"
                      );
                      EventRegister.emit("promotionRemoved", promotions);
                    });
                  }

                  cart.bulkRemoveFromCart(indexes, (removedItems: any) => {
                    debugLog(
                      "Items removed from cart",
                      removedItems,
                      "cart-context",
                      "calculatedPromotionsMethod3"
                    );
                    EventRegister.emit("itemRemoved", removedItems);
                  });
                }

                if (
                  cur?.promotionType === "advance" &&
                  cur?.condition === "buys_the_following_items" &&
                  cur?.reward?.rewardType === "save_certain_amount" &&
                  cur?.buy?.target === "category" &&
                  cur?.buy?.categoryRefs?.length > 0 &&
                  cur?.buy?.categoryRefs.includes(item.categoryRef) &&
                  ((cur?.buy?.buyType === "quantity" &&
                    cur?.buy?.quantity > itemQty) ||
                    (cur?.buy?.buyType === "minMax" && cur?.buy?.min > itemQty))
                ) {
                  const categoryQuantities = cart?.cartItems?.reduce(
                    (ac: any, ar: any) => {
                      if (
                        cur?.buy?.categoryRefs?.includes(ar?.categoryRef) &&
                        !ar?.isFree &&
                        !ar?.isQtyFree
                      ) {
                        return ac + Number(ar?.qty);
                      } else return ac;
                    },
                    0
                  );
                  delete item.exactTotal;
                  delete item.exactVat;
                  delete item.discountedTotal;
                  delete item.discountedVatAmount;
                  delete item.promotionsData;

                  const indexes: number[] = [];

                  const res = cart.cartItems.some((cart: any, ind: number) => {
                    if (cart?.isFree || cart?.isQtyFree) {
                      indexes.push(ind);
                    }
                    if (
                      cur?.buy?.target === "category" &&
                      cur?.buy?.categoryRefs?.length > 0
                    ) {
                      return (
                        cur?.buy?.categoryRefs?.includes(cart.categoryRef) &&
                        !cart.isFree &&
                        ((cur?.buy?.buyType === "quantity" &&
                          cur?.buy?.quantity <= categoryQuantities) ||
                          (cur?.buy?.buyType === "minMax" &&
                            cur?.buy?.min <= categoryQuantities))
                      );
                    }
                  });

                  if (!res) {
                    cart.removePromotion(index, (promotions: any) => {
                      debugLog(
                        "Promotion removed from cart",
                        promotions,
                        "cart-billing-screen",
                        "handleRemoveDiscountFunctionBUDGETasdasdasd"
                      );
                      EventRegister.emit("promotionRemoved", promotions);
                    });
                    cart.bulkRemoveFromCart(indexes, (removedItems: any) => {
                      debugLog(
                        "Items removed from cart",
                        removedItems,
                        "cart-context",
                        "calculatedPromotionsMethod4"
                      );
                    });
                  }
                }

                if (
                  cur?.promotionType === "advance" &&
                  cur?.condition === "buys_the_following_items" &&
                  cur?.reward?.rewardType === "save_certain_amount" &&
                  cur?.buy?.target === "product" &&
                  cur?.buy?.productRefs?.length > 0 &&
                  cur?.buyProductSkus.includes(item.sku) &&
                  ((cur?.buy?.buyType === "quantity" &&
                    cur?.buy?.quantity > includedItemQty) ||
                    (cur?.buy?.buyType === "minMax" &&
                      cur?.buy?.min > includedItemQty))
                ) {
                  delete item.exactTotal;
                  delete item.exactVat;
                  delete item.discountedTotal;
                  delete item.discountedVatAmount;
                  delete item.promotionsData;
                  const indexes: number[] = [];

                  const exists = cart?.cartItems
                    ?.map((cartItems: any, ind: number) => {
                      if (cartItems?.isFree || cartItems?.isQtyFree) {
                        indexes.push(ind);
                      }
                      return cartItems?.promotionsData?.some(
                        (promoData: any) => {
                          return promoData?.id === promotionsApplied[index]._id;
                        }
                      );
                    })
                    .filter((filterOp: any) => filterOp);

                  if (exists?.length <= 0) {
                    cart.removePromotion(index, (promotions: any) => {
                      debugLog(
                        "Promotion removed from cart",
                        promotions,
                        "cart-billing-screen",
                        "handleRemoveDiscountFunctionBUDGETasdsadasdsdasdsadasds"
                      );
                      EventRegister.emit("promotionRemoved", promotions);
                    });
                  }

                  cart.bulkRemoveFromCart(indexes, (removedItems: any) => {
                    debugLog(
                      "Items removed from cart",
                      removedItems,
                      "cart-context",
                      "calculatedPromotionsMethod5"
                    );
                    EventRegister.emit("itemRemoved", removedItems);
                  });
                }

                const totalAddedQty = cart?.cartItems?.reduce(
                  (a: any, b: any) => {
                    if (!b?.isFree && !b?.isQtyFree) {
                      return a + b?.qty;
                    } else return a;
                  },
                  0
                );

                if (
                  cur?.promotionType === "advance" &&
                  cur?.condition === "buys_the_following_items" &&
                  (cur?.reward?.rewardType === "get_the_following_items" ||
                    cur?.reward?.rewardType === "save_certain_amount") &&
                  cur?.buy?.productRefs?.length <= 0 &&
                  cur?.buy?.categoryRefs?.length <= 0 &&
                  ((cur?.buy?.buyType === "quantity" &&
                    cur?.buy?.quantity > totalAddedQty) ||
                    (cur?.buy?.buyType === "minMax" &&
                      (cur?.buy?.min > totalAddedQty ||
                        cur?.buy?.max < totalAddedQty)))
                ) {
                  delete item.exactTotal;
                  delete item.exactVat;
                  delete item.discountedTotal;
                  delete item.discountedVatAmount;
                  delete item.promotionsData;
                  const indexes: number[] = [];

                  const exists = cart?.cartItems
                    ?.map((cartItems: any, ind: number) => {
                      if (cartItems?.isFree || cartItems?.isQtyFree) {
                        indexes.push(ind);
                      }
                      return cartItems?.promotionsData?.some(
                        (promoData: any) => {
                          return promoData?.id === promotionsApplied[index]._id;
                        }
                      );
                    })
                    .filter((filterOp: any) => filterOp);

                  if (exists?.length <= 0) {
                    cart.removePromotion(index, (promotions: any) => {
                      debugLog(
                        "Promotion removed from cart",
                        promotions,
                        "cart-billing-screen",
                        "handleRemoveDiscountFunctionBUDGETadssadasdasdas"
                      );
                      EventRegister.emit("promotionRemoved", promotions);
                    });
                  }

                  cart.bulkRemoveFromCart(indexes, (removedItems: any) => {
                    debugLog(
                      "Items removed from cart",
                      removedItems,
                      "cart-context",
                      "calculatedPromotionsMethod6"
                    );
                    EventRegister.emit("itemRemoved", removedItems);
                  });
                }

                if (
                  cur?.buyProductSkus?.length > 0 &&
                  cur.buyProductSkus.includes(item.sku) &&
                  ((cur?.buy?.buyType === "quantity" &&
                    cur?.buy?.quantity > item?.qty) ||
                    (cur?.buy?.buyType === "minMax" &&
                      cur?.buy?.min > item?.qty)) &&
                  cur?.reward?.rewardType === "pay_fixed_price" &&
                  cur?.buy?.target === "product"
                ) {
                  delete item.exactTotal;
                  delete item.exactVat;
                  delete item.discountedTotal;
                  delete item.discountedVatAmount;
                  delete item.promotionsData;
                  const indexes: number[] = [];

                  const exists = cart?.cartItems
                    ?.map((cartItems: any, ind: number) => {
                      if (cartItems?.isFree || cartItems?.isQtyFree) {
                        indexes.push(ind);
                      }
                      return cartItems?.promotionsData?.some(
                        (promoData: any) => {
                          return promoData?.id === promotionsApplied[index]._id;
                        }
                      );
                    })
                    .filter((filterOp: any) => filterOp);

                  if (exists?.length <= 0) {
                    cart.removePromotion(index, (promotions: any) => {
                      debugLog(
                        "Promotion removed from cart",
                        promotions,
                        "cart-billing-screen",
                        "handleRemoveDiscountFunctionBUDGET"
                      );
                      EventRegister.emit("promotionRemoved", promotions);
                    });
                  }

                  cart.bulkRemoveFromCart(indexes, (removedItems: any) => {
                    debugLog(
                      "Items removed from cart",
                      removedItems,
                      "cart-context",
                      "calculatedPromotionsMethod7"
                    );
                    EventRegister.emit("itemRemoved", removedItems);
                  });
                }

                if (
                  cur?.buy?.categoryRefs?.length > 0 &&
                  cur.buy?.categoryRefs.includes(item.categoryRef) &&
                  ((cur?.buy?.buyType === "quantity" &&
                    cur?.buy?.quantity > itemQty) ||
                    (cur?.buy?.buyType === "minMax" &&
                      cur?.buy?.min > itemQty)) &&
                  cur?.reward?.rewardType === "pay_fixed_price" &&
                  cur?.buy?.target === "category"
                ) {
                  delete item.exactTotal;
                  delete item.exactVat;
                  delete item.discountedTotal;
                  delete item.discountedVatAmount;
                  delete item.promotionsData;
                  const indexes: number[] = [];

                  const exists = cart?.cartItems
                    ?.map((cartItems: any, ind: number) => {
                      if (cartItems?.isFree || cartItems?.isQtyFree) {
                        indexes.push(ind);
                      }
                      return cartItems?.promotionsData?.some(
                        (promoData: any) => {
                          return promoData?.id === promotionsApplied[index]._id;
                        }
                      );
                    })
                    .filter((filterOp: any) => filterOp);

                  if (exists?.length <= 0) {
                    cart.removePromotion(index, (promotions: any) => {
                      debugLog(
                        "Promotion removed from cart",
                        promotions,
                        "cart-billing-screen",
                        "handleRemoveDiscountFunctionBUDGET"
                      );
                      EventRegister.emit("promotionRemoved", promotions);
                    });
                  }

                  cart.bulkRemoveFromCart(indexes, (removedItems: any) => {
                    debugLog(
                      "Items removed from cart",
                      removedItems,
                      "cart-context",
                      "calculatedPromotionsMethod8"
                    );
                    EventRegister.emit("itemRemoved", removedItems);
                  });
                }

                if (
                  cur?.reward?.rewardType === "pay_fixed_price" &&
                  cur?.buy?.productRefs?.length <= 0 &&
                  cur?.buy?.categoryRefs?.length <= 0 &&
                  ((cur?.buy?.buyType === "quantity" &&
                    cur?.buy?.quantity > cartData.totalQty) ||
                    (cur?.buy?.buyType === "minMax" &&
                      (cur?.buy?.min > cartData.totalQty ||
                        cur?.buy?.max < cartData.totalQty)))
                ) {
                  delete item.exactTotal;
                  delete item.exactVat;
                  delete item.discountedTotal;
                  delete item.discountedVatAmount;
                  delete item.promotionsData;
                  const indexes: number[] = [];

                  const exists = cart?.cartItems
                    ?.map((cartItems: any, ind: number) => {
                      if (cartItems?.isFree || cartItems?.isQtyFree) {
                        indexes.push(ind);
                      }
                      return cartItems?.promotionsData?.some(
                        (promoData: any) => {
                          return promoData?.id === promotionsApplied[index]._id;
                        }
                      );
                    })
                    .filter((filterOp: any) => filterOp);

                  if (exists?.length <= 0) {
                    cart.removePromotion(index, (promotions: any) => {
                      debugLog(
                        "Promotion removed from cart",
                        promotions,
                        "cart-billing-screen",
                        "handleRemoveDiscountFunctionBUDGET"
                      );
                      EventRegister.emit("promotionRemoved", promotions);
                    });
                  }

                  cart.bulkRemoveFromCart(indexes, (removedItems: any) => {
                    debugLog(
                      "Items removed from cart",
                      removedItems,
                      "cart-context",
                      "calculatedPromotionsMethod9"
                    );
                    EventRegister.emit("itemRemoved", removedItems);
                  });
                }

                if (
                  cur?.promotionType === "advance" &&
                  cur?.condition === "buys_the_following_items" &&
                  cur?.reward?.rewardType === "get_the_following_items" &&
                  cur?.reward?.discountType !== "free" &&
                  cur?.buy?.productRefs?.length <= 0 &&
                  cur?.buy?.categoryRefs?.length <= 0
                ) {
                  const quantities = cart?.cartItems?.reduce(
                    (prev: any, curr: any) => {
                      if (!curr?.isFree && !curr?.isQtyFree) {
                        return prev + Number(curr?.qty);
                      } else return prev;
                    },
                    0
                  );
                  const res = cart.cartItems.some((cart: any) => {
                    if (cur?.buy?.target === "product") {
                      return (
                        !cart.isFree &&
                        !cart?.isQtyFree &&
                        cart?.sku !== "Open Item" &&
                        ((cur?.buy?.buyType === "quantity" &&
                          cur?.buy?.quantity <= quantities) ||
                          (cur?.buy?.buyType === "minMax" &&
                            (cur?.buy?.min <= quantities ||
                              cur?.buy?.max > quantities)))
                      );
                    } else if (cur?.buy?.target === "category") {
                      return (
                        !cart.isFree &&
                        !cart?.isQtyFree &&
                        cart?.sku !== "Open Item" &&
                        ((cur?.buy?.buyType === "quantity" &&
                          cur?.buy?.quantity <= quantities) ||
                          (cur?.buy?.buyType === "minMax" &&
                            (cur?.buy?.min <= quantities ||
                              cur?.buy?.max > quantities)))
                      );
                    }
                  });

                  if (!res) {
                    delete item.exactTotal;
                    delete item.exactVat;
                    delete item.discountedTotal;
                    delete item.discountedVatAmount;
                    delete item.promotionsData;
                    const indexes: number[] = [];

                    const exists = cart?.cartItems
                      ?.map((cartItems: any, ind: number) => {
                        if (cartItems?.isFree || cartItems?.isQtyFree) {
                          indexes.push(ind);
                        }
                        return cartItems?.promotionsData?.some(
                          (promoData: any) => {
                            return (
                              promoData?.id === promotionsApplied[index]._id
                            );
                          }
                        );
                      })
                      .filter((filterOp: any) => filterOp);

                    if (exists?.length <= 0) {
                      cart.removePromotion(index, (promotions: any) => {
                        debugLog(
                          "Promotion removed from cart",
                          promotions,
                          "cart-billing-screen",
                          "handleRemoveDiscountFunctionBUDGET"
                        );
                        EventRegister.emit("promotionRemoved", promotions);
                      });
                    }

                    cart.bulkRemoveFromCart(indexes, (removedItems: any) => {
                      debugLog(
                        "Items removed from cart",
                        removedItems,
                        "cart-context",
                        "calculatedPromotionsMethod10"
                      );
                      EventRegister.emit("itemRemoved", removedItems);
                    });
                  }
                }
                if (
                  cur?.promotionType === "advance" &&
                  cur?.condition === "buys_the_following_items" &&
                  cur?.reward?.rewardType === "get_the_following_items" &&
                  cur?.reward?.discountType !== "free" &&
                  (cur?.buy?.productRefs?.length > 0 ||
                    cur?.buy?.categoryRefs?.length > 0)
                ) {
                  const categoryQuantities = cart?.cartItems?.reduce(
                    (ac: any, ar: any) => {
                      if (
                        cur?.buy?.categoryRefs?.includes(ar?.categoryRef) &&
                        !ar?.isFree &&
                        !ar?.isQtyFree
                      ) {
                        return ac + Number(ar?.qty);
                      } else return ac;
                    },
                    0
                  );
                  const res = cart.cartItems.some((cart: any) => {
                    if (cur?.buy?.target === "product") {
                      return (
                        !cart.isFree &&
                        !cart?.isQtyFree &&
                        cart?.sku !== "Open Item" &&
                        ((cur?.buy?.buyType === "quantity" &&
                          cur?.buy?.quantity <= includedItemQty) ||
                          (cur?.buy?.buyType === "minMax" &&
                            cur?.buy?.min <= includedItemQty))
                      );
                    } else if (cur?.buy?.target === "category") {
                      return (
                        !cart.isFree &&
                        !cart?.isQtyFree &&
                        cart?.sku !== "Open Item" &&
                        ((cur?.buy?.buyType === "quantity" &&
                          cur?.buy?.quantity <= categoryQuantities) ||
                          (cur?.buy?.buyType === "minMax" &&
                            cur?.buy?.min <= categoryQuantities))
                      );
                    }
                  });

                  if (!res) {
                    delete item.exactTotal;
                    delete item.exactVat;
                    delete item.discountedTotal;
                    delete item.discountedVatAmount;
                    delete item.promotionsData;
                    const indexes: number[] = [];

                    const exists = cart?.cartItems
                      ?.map((cartItems: any, ind: number) => {
                        if (cartItems?.isFree || cartItems?.isQtyFree) {
                          indexes.push(ind);
                        }
                        return cartItems?.promotionsData?.some(
                          (promoData: any) => {
                            return (
                              promoData?.id === promotionsApplied[index]._id
                            );
                          }
                        );
                      })
                      .filter((filterOp: any) => filterOp);

                    if (exists?.length <= 0) {
                      cart.removePromotion(index, (promotions: any) => {
                        debugLog(
                          "Promotion removed from cart",
                          promotions,
                          "cart-billing-screen",
                          "handleRemoveDiscountFunctionBUDGET"
                        );
                        EventRegister.emit("promotionRemoved", promotions);
                      });
                    }

                    cart.bulkRemoveFromCart(indexes, (removedItems: any) => {
                      debugLog(
                        "Items removed from cart",
                        removedItems,
                        "cart-context",
                        "calculatedPromotionsMethod11"
                      );
                      EventRegister.emit("itemRemoved", removedItems);
                    });
                  }
                }
              }
            });

            return prev + totalPromotionDiscount;
          } else if (cur?.condition === "spends_the_following_amount") {
            let totalPromotionDiscount = 0;

            if (
              cur?.advancedPromotion &&
              cur?.condition === "spends_the_following_amount" &&
              cur?.reward?.rewardType === "save_certain_amount" &&
              cur?.reward?.saveOn === "off_the_entire_sale"
            ) {
              if (
                cartData?.totalAmount + cartData?.discountAmount >=
                cur?.buy?.spendAmount
              ) {
                cart.cartItems.map((item: any) => {
                  if (cur?.discountType === "percent") {
                    let totalAmountToConsider =
                      true &&
                      cur?.type === "promotion" &&
                      item?.modifiers?.length > 0
                        ? item.total
                        : item.total;

                    const totalVatAmountToConsider =
                      true &&
                      cur?.type === "promotion" &&
                      item?.modifiers?.length > 0
                        ? item.vatAmount
                        : item.vatAmount;

                    const discountAmount =
                      (totalAmountToConsider * cur.discount) / 100;

                    const discountedVat =
                      (totalVatAmountToConsider * cur.discount) / 100;

                    totalPromotionDiscount += discountAmount;

                    item.exactTotal = item.total;

                    item.exactVat = item.vatAmount;

                    item.discountedTotal =
                      totalAmountToConsider - discountAmount;

                    item.discountedVatAmount =
                      totalVatAmountToConsider - discountedVat;

                    item.promotionsData = item.promotionsData || [];

                    const itemSpecificDiscount = item.promotionsData.reduce(
                      (ac: any, ar: any) => {
                        if (ar?.type === "specific") {
                          return ac + ar?.discount;
                        } else return ac;
                      },
                      0
                    );

                    item.discountedTotal = item.total - itemSpecificDiscount;
                  } else {
                    let totalAmountToConsider =
                      true &&
                      cur?.type === "promotion" &&
                      item?.modifiers?.length > 0
                        ? item.total
                        : item.total;

                    const specificLength = cartData?.totalItem;

                    const totalVatAmountToConsider =
                      true &&
                      cur?.type === "promotion" &&
                      item?.modifiers?.length > 0
                        ? item.vatAmount
                        : item.vatAmount;

                    const fixedPercentage =
                      Number((cur?.discount * 100) / totalAmountToConsider) /
                      specificLength;

                    const discountAmount =
                      (totalAmountToConsider * fixedPercentage) / 100;

                    const discountedVat =
                      (item.vatAmount * fixedPercentage) / 100;

                    totalPromotionDiscount += discountAmount;

                    item.exactTotal = item.total;

                    item.exactVat = item.vatAmount;

                    item.discountedTotal =
                      totalAmountToConsider - discountAmount;

                    item.discountedVatAmount =
                      totalVatAmountToConsider - discountedVat;

                    item.promotionsData = item.promotionsData || [];

                    const itemSpecificDiscount = item.promotionsData.reduce(
                      (ac: any, ar: any) => {
                        if (ar?.type === "specific") {
                          return ac + ar?.discount;
                        } else return ac;
                      },
                      0
                    );

                    item.discountedTotal = item.total - itemSpecificDiscount;
                  }

                  const doc = item?.promotionsData?.find(
                    (f: any) => f?.id === cur?._id
                  );

                  const specificLength = cartData?.totalItem;

                  const fixedPercentage =
                    Number((cur?.discount * 100) / item.total) / specificLength;

                  const discountAmount = (item.total * fixedPercentage) / 100;

                  if (doc) {
                    const newArray = [...item?.promotionsData]?.filter(
                      (pro) => pro?.id !== doc?.id
                    );

                    newArray.push({
                      name: cur.code,
                      discount:
                        cur?.discountType == "percent"
                          ? (item.total * cur.discount) / 100
                          : discountAmount,
                      id: cur?._id,
                      type: "specific",
                    });

                    item.promotionsData = [...newArray];
                  }

                  if (!doc) {
                    item.promotionsData = item?.promotionsData || [];

                    const newArray = [...item?.promotionsData];

                    newArray.push({
                      name: cur.code,
                      discount:
                        cur?.discountType == "percent"
                          ? (item.total * cur.discount) / 100
                          : discountAmount,
                      id: cur?._id,
                      type: "specific",
                    });

                    item.promotionsData = [...newArray];
                  }

                  if (
                    totalPromotionDiscount > cur?.offer?.budget &&
                    cur?.offer?.type === "budget" &&
                    cur?.offer?.budgetType !== "unlimited"
                  ) {
                    delete item.exactTotal;
                    delete item.exactVat;
                    delete item.discountedTotal;
                    delete item.discountedVatAmount;
                    delete item.promotionsData;
                    cart.removePromotion(index, (promotions: any) => {
                      debugLog(
                        "Promotion removed from cart",
                        promotions,
                        "cart-billing-screen",
                        "handleRemoveDiscountFunctionBUDGET"
                      );
                      EventRegister.emit("promotionRemoved", promotions);
                    });
                    return;
                  }
                });
              }
            }

            if (
              cur?.advancedPromotion &&
              cur?.condition === "spends_the_following_amount" &&
              cur?.reward?.rewardType === "save_certain_amount" &&
              cur?.reward?.saveOn === "off_the_specific_items_above" &&
              cur?.buy?.target === "product"
            ) {
              cart.cartItems.map((item: any) => {
                if (item?.total >= cur?.buy?.spendAmount) {
                  {
                    if (cur?.buyProductSkus?.includes(item?.sku)) {
                      if (cur?.discountType === "percent") {
                        let totalAmountToConsider =
                          true &&
                          cur?.type === "promotion" &&
                          item?.modifiers?.length > 0
                            ? item.total
                            : item.total;

                        const totalVatAmountToConsider =
                          true &&
                          cur?.type === "promotion" &&
                          item?.modifiers?.length > 0
                            ? item.vatAmount
                            : item.vatAmount;

                        const discountAmount =
                          (totalAmountToConsider * cur.discount) / 100;

                        const discountedVat =
                          (totalVatAmountToConsider * cur.discount) / 100;

                        totalPromotionDiscount += discountAmount;

                        item.exactTotal = item.total;

                        item.exactVat = item.vatAmount;

                        item.discountedTotal =
                          totalAmountToConsider - discountAmount;

                        item.discountedVatAmount =
                          totalVatAmountToConsider - discountedVat;

                        item.promotionsData = item.promotionsData || [];

                        const itemSpecificDiscount = item.promotionsData.reduce(
                          (ac: any, ar: any) => {
                            if (ar?.type === "specific") {
                              return ac + ar?.discount;
                            } else return ac;
                          },
                          0
                        );

                        item.discountedTotal =
                          item.total - itemSpecificDiscount;
                      } else {
                        const includedItemslength = cart.cartItems.filter(
                          (car: any) =>
                            cur.productSkus.includes(car.sku) &&
                            car?.total >= cur?.buy?.spendAmount
                        );

                        const includedCategoryLength = [cart.cartItems].filter(
                          (car: any) =>
                            cur.buy?.categoryRefs.includes(car.categoryRef) &&
                            car?.total >= cur?.buy?.spendAmount
                        );

                        const specificLength =
                          includedItemslength.length > 0
                            ? includedItemslength.length
                            : includedCategoryLength.length > 0
                            ? includedCategoryLength.length
                            : 1;

                        let totalAmountToConsider =
                          true &&
                          cur?.type === "promotion" &&
                          item?.modifiers?.length > 0
                            ? item.total
                            : item.total;

                        const totalVatAmountToConsider =
                          true &&
                          cur?.type === "promotion" &&
                          item?.modifiers?.length > 0
                            ? item.vatAmount
                            : item.vatAmount;

                        const fixedPercentage =
                          Number(
                            (cur?.discount * 100) / totalAmountToConsider
                          ) / specificLength;

                        const discountAmount =
                          (totalAmountToConsider * fixedPercentage) / 100;

                        const discountedVat =
                          (item.vatAmount * fixedPercentage) / 100;

                        totalPromotionDiscount += discountAmount;

                        item.exactTotal = item.total;

                        item.exactVat = item.vatAmount;

                        item.discountedTotal =
                          totalAmountToConsider - discountAmount;

                        item.discountedVatAmount =
                          totalVatAmountToConsider - discountedVat;

                        item.promotionsData = item.promotionsData || [];

                        const itemSpecificDiscount = item.promotionsData.reduce(
                          (ac: any, ar: any) => {
                            if (ar?.type === "specific") {
                              return ac + ar?.discount;
                            } else return ac;
                          },
                          0
                        );

                        item.discountedTotal =
                          item.total - itemSpecificDiscount;
                      }
                    }

                    const doc = item?.promotionsData?.find(
                      (f: any) => f?.id === cur?._id
                    );

                    const includedItemslength = cart.cartItems.filter(
                      (car: any) =>
                        cur.productSkus.includes(car.sku) &&
                        car?.total >= cur?.buy?.spendAmount
                    );

                    const includedCategoryLength = [cart.cartItems].filter(
                      (car: any) =>
                        cur.buy?.categoryRefs.includes(car.categoryRef) &&
                        car?.total >= cur?.buy?.spendAmount
                    );

                    const specificLength =
                      includedItemslength.length > 0
                        ? includedItemslength.length
                        : includedCategoryLength.length > 0
                        ? includedCategoryLength.length
                        : 1;

                    const fixedPercentage =
                      Number((cur?.discount * 100) / item?.total) /
                      specificLength;

                    const discountAmount = (item.total * fixedPercentage) / 100;

                    if (doc) {
                      const newArray = [...item?.promotionsData]?.filter(
                        (pro) => pro?.id !== doc?.id
                      );

                      newArray.push({
                        name: cur.code,
                        discount:
                          cur?.discountType == "percent"
                            ? (item.total * cur.discount) / 100
                            : discountAmount,
                        id: cur?._id,
                        type: "specific",
                      });

                      item.promotionsData = [...newArray];
                    }

                    if (!doc) {
                      item.promotionsData = item?.promotionsData || [];

                      const newArray = [...item?.promotionsData];

                      newArray.push({
                        name: cur.code,
                        discount:
                          cur?.discountType == "percent"
                            ? (item.total * cur.discount) / 100
                            : discountAmount,
                        id: cur?._id,
                        type: "specific",
                      });

                      item.promotionsData = [...newArray];
                    }

                    if (
                      totalPromotionDiscount > cur?.offer?.budget &&
                      cur?.offer?.type === "budget" &&
                      cur?.offer?.budgetType !== "unlimited"
                    ) {
                      delete item.exactTotal;
                      delete item.exactVat;
                      delete item.discountedTotal;
                      delete item.discountedVatAmount;
                      delete item.promotionsData;
                      cart.removePromotion(index, (promotions: any) => {
                        debugLog(
                          "Promotion removed from cart",
                          promotions,
                          "cart-billing-screen",
                          "handleRemoveDiscountFunctionBUDGET"
                        );
                        EventRegister.emit("promotionRemoved", promotions);
                      });
                      return;
                    }
                  }
                } else return prev;
              });
            }

            cart?.cartItems?.map((item: any) => {
              let itemQty: number = 0;
              if (cur?.buy?.target === "category") {
                itemQty = cart?.cartItems?.reduce((ac: any, ar: any) => {
                  if (
                    cur?.buy?.categoryRefs?.includes(ar?.categoryRef) &&
                    !ar?.isFree
                  ) {
                    return ac + Number(ar?.qty);
                  } else return ac;
                }, 0);
              }

              const includedItemQty = cart?.cartItems?.reduce(
                (acc: any, ob: any) => {
                  if (cur?.buyProductSkus.includes(ob?.sku) && !ob?.isFree) {
                    return acc + Number(ob?.qty);
                  } else return acc;
                },
                0
              );

              const totalCategoryAmount = cart?.cartItems?.reduce(
                (acc: any, ob: any) => {
                  if (
                    cur?.buy?.categoryRefs.includes(ob?.categoryRef) &&
                    !ob?.isFree
                  ) {
                    return acc + Number(ob?.total);
                  } else return acc;
                },
                0
              );
              if (
                cur?.advancedPromotion &&
                cur?.reward?.rewardType === "save_certain_amount" &&
                cur?.reward?.saveOn === "off_the_specific_items_above" &&
                cur?.buy?.target === "product"
              ) {
                if (item?.total < cur?.buy?.spendAmount) {
                  delete item.exactTotal;
                  delete item.exactVat;
                  delete item.discountedTotal;
                  delete item.discountedVatAmount;
                  delete item.promotionsData;

                  const exists = cart?.cartItems
                    ?.map((cartItems: any) => {
                      return cartItems?.promotionsData?.some(
                        (promoData: any) => {
                          return promoData?.id === promotionsApplied[index]._id;
                        }
                      );
                    })
                    .filter((filterOp: any) => filterOp);

                  if (exists?.length <= 0) {
                    cart.removePromotion(index, (promotions: any) => {
                      debugLog(
                        "Promotion removed from cart",
                        promotions,
                        "cart-billing-screen",
                        "handleRemoveDiscountFunctionBUDGET"
                      );
                      EventRegister.emit("promotionRemoved", promotions);
                    });
                  }
                }
              }
              if (
                cur?.advancedPromotion &&
                cur?.reward?.rewardType === "save_certain_amount" &&
                cur?.reward?.saveOn === "off_the_entire_sale"
              ) {
                if (
                  cartData?.totalAmount + cartData?.discountAmount <
                  cur?.buy?.spendAmount
                ) {
                  delete item.exactTotal;
                  delete item.exactVat;
                  delete item.discountedTotal;
                  delete item.discountedVatAmount;
                  delete item.promotionsData;

                  const exists = cart?.cartItems
                    ?.map((cartItems: any) => {
                      return cartItems?.promotionsData?.some(
                        (promoData: any) => {
                          return promoData?.id === promotionsApplied[index]._id;
                        }
                      );
                    })
                    .filter((filterOp: any) => filterOp);

                  if (exists?.length <= 0) {
                    cart.removePromotion(index, (promotions: any) => {
                      debugLog(
                        "Promotion removed from cart",
                        promotions,
                        "cart-billing-screen",
                        "handleRemoveDiscountFunctionBUDGET"
                      );
                      EventRegister.emit("promotionRemoved", promotions);
                    });
                  }
                }
              }

              if (
                cur?.advancedPromotion &&
                cur?.condition === "spends_the_following_amount" &&
                cur?.reward?.rewardType === "save_certain_amount" &&
                cur?.reward?.saveOn === "off_the_entire_sale" &&
                (cur?.buyProductSkus?.length > 0 ||
                  cur?.buy?.categoryRefs?.length > 0)
              ) {
                if (cur?.buy?.target === "product") {
                  const itemTotal = cart?.cartItems?.reduce(
                    (prev: any, curr: any) => {
                      if (
                        cur?.buyProductSkus?.includes(curr?.sku) &&
                        !curr?.isFree
                      ) {
                        return prev + Number(curr?.total);
                      } else return prev;
                    },
                    0
                  );

                  if (itemTotal < cur?.buy?.spendAmount) {
                    delete item.exactTotal;
                    delete item.exactVat;
                    delete item.discountedTotal;
                    delete item.discountedVatAmount;
                    delete item.promotionsData;

                    const exists = cart?.cartItems
                      ?.map((cartItems: any) => {
                        return cartItems?.promotionsData?.some(
                          (promoData: any) => {
                            return (
                              promoData?.id === promotionsApplied[index]._id
                            );
                          }
                        );
                      })
                      .filter((filterOp: any) => filterOp);

                    if (exists?.length <= 0) {
                      cart.removePromotion(index, (promotions: any) => {
                        debugLog(
                          "Promotion removed from cart",
                          promotions,
                          "cart-billing-screen",
                          "handleRemoveDiscountFunctionBUDGET"
                        );
                        EventRegister.emit("promotionRemoved", promotions);
                      });
                    }
                  }
                } else if (cur?.buy?.target === "category") {
                  const itemTotalCat = cart?.cartItems?.reduce(
                    (prev: any, curr: any) => {
                      if (
                        cur?.buy?.categoryRefs?.includes(curr?.categoryRef) &&
                        !curr?.isFree
                      ) {
                        return prev + Number(curr?.total);
                      } else return prev;
                    },
                    0
                  );

                  if (itemTotalCat < cur?.buy?.spendAmount) {
                    delete item.exactTotal;
                    delete item.exactVat;
                    delete item.discountedTotal;
                    delete item.discountedVatAmount;
                    delete item.promotionsData;

                    const exists = cart?.cartItems
                      ?.map((cartItems: any) => {
                        return cartItems?.promotionsData?.some(
                          (promoData: any) => {
                            return (
                              promoData?.id === promotionsApplied[index]._id
                            );
                          }
                        );
                      })
                      .filter((filterOp: any) => filterOp);

                    if (exists?.length <= 0) {
                      cart.removePromotion(index, (promotions: any) => {
                        debugLog(
                          "Promotion removed from cart",
                          promotions,
                          "cart-billing-screen",
                          "handleRemoveDiscountFunctionBUDGET"
                        );
                        EventRegister.emit("promotionRemoved", promotions);
                      });
                    }
                  }
                }
              }

              if (
                cur?.promotionType === "advance" &&
                cur?.condition === "spends_the_following_amount" &&
                cur?.reward?.rewardType === "get_the_following_items" &&
                cur?.reward?.discountType === "free" &&
                cur?.buy?.target === "product" &&
                cur?.buy?.productRefs?.length > 0 &&
                cur?.buyProductSkus.includes(item.sku) &&
                item?.total < cur?.buy?.spendAmount
              ) {
                delete item.exactTotal;
                delete item.exactVat;
                delete item.discountedTotal;
                delete item.discountedVatAmount;
                delete item.promotionsData;

                const indexes: number[] = [];

                const res = cart.cartItems.some((cart: any, ind: number) => {
                  if (cart?.isFree || cart?.isQtyFree) {
                    indexes.push(ind);
                  }
                  if (cur?.buy?.target === "product") {
                    return (
                      cur?.buyProductSkus.includes(cart.sku) &&
                      !cart.isFree &&
                      item?.total < cur?.buy?.spendAmount
                    );
                  }
                });

                if (!res) {
                  cart.removePromotion(index, (promotions: any) => {
                    debugLog(
                      "Promotion removed from cart",
                      promotions,
                      "cart-billing-screen",
                      "handleRemoveDiscountFunctionBUDGET"
                    );
                    EventRegister.emit("promotionRemoved", promotions);
                  });
                  cart.bulkRemoveFromCart(indexes, (removedItems: any) => {
                    debugLog(
                      "Items removed from cart",
                      removedItems,
                      "cart-context",
                      "calculatedPromotionsMethod12"
                    );
                    EventRegister.emit("itemRemoved", removedItems);
                  });
                }
              }

              if (
                cur?.promotionType === "advance" &&
                cur?.condition === "spends_the_following_amount" &&
                cur?.reward?.rewardType === "get_the_following_items" &&
                cur?.reward?.discountType === "free" &&
                cur?.buy?.target === "category" &&
                cur?.buy?.categoryRefs?.length > 0 &&
                cur?.buy?.categoryRefs.includes(item.categoryRef) &&
                totalCategoryAmount < cur?.buy?.spendAmount
              ) {
                delete item.exactTotal;
                delete item.exactVat;
                delete item.discountedTotal;
                delete item.discountedVatAmount;
                delete item.promotionsData;

                const indexes: number[] = [];

                const res = cart.cartItems.some((cart: any, ind: number) => {
                  if (cart?.isFree || cart?.isQtyFree) {
                    indexes.push(ind);
                  }
                  if (cur?.buy?.target === "product") {
                    return (
                      cur?.buyProductSkus.includes(cart.sku) &&
                      !cart.isFree &&
                      item?.total < cur?.buy?.spendAmount
                    );
                  }
                });

                if (!res) {
                  cart.removePromotion(index, (promotions: any) => {
                    debugLog(
                      "Promotion removed from cart",
                      promotions,
                      "cart-billing-screen",
                      "handleRemoveDiscountFunctionBUDGET"
                    );
                    EventRegister.emit("promotionRemoved", promotions);
                  });
                  cart.bulkRemoveFromCart(indexes, (removedItems: any) => {
                    debugLog(
                      "Items removed from cart",
                      removedItems,
                      "cart-context",
                      "calculatedPromotionsMethod13"
                    );
                    EventRegister.emit("itemRemoved", removedItems);
                  });
                }
              }

              if (
                cur?.promotionType === "advance" &&
                cur?.condition === "spends_the_following_amount" &&
                cur?.reward?.rewardType === "get_the_following_items" &&
                cur?.reward?.discountType === "free" &&
                cur?.buy?.productRefs?.length <= 0 &&
                cur?.buy?.categoryRefs?.length <= 0 &&
                cartData?.totalAmount < cur?.buy?.spendAmount
              ) {
                delete item.exactTotal;
                delete item.exactVat;
                delete item.discountedTotal;
                delete item.discountedVatAmount;
                delete item.promotionsData;

                const indexes: number[] = [];

                const res = cart.cartItems.some((cart: any, ind: number) => {
                  if (cart?.isFree || cart?.isQtyFree) {
                    indexes.push(ind);
                  }
                });

                if (!res) {
                  cart.removePromotion(index, (promotions: any) => {
                    debugLog(
                      "Promotion removed from cart",
                      promotions,
                      "cart-billing-screen",
                      "handleRemoveDiscountFunctionBUDGET"
                    );
                    EventRegister.emit("promotionRemoved", promotions);
                  });
                  cart.bulkRemoveFromCart(indexes, (removedItems: any) => {
                    debugLog(
                      "Items removed from cart",
                      removedItems,
                      "cart-context",
                      "calculatedPromotionsMethod14"
                    );
                    EventRegister.emit("itemRemoved", removedItems);
                  });
                }
              }

              if (
                cur?.promotionType === "advance" &&
                cur?.condition === "spends_the_following_amount" &&
                cur?.reward?.rewardType === "get_the_following_items" &&
                cur?.reward?.discountType !== "free" &&
                cur?.buy?.productRefs?.length <= 0 &&
                cur?.buy?.categoryRefs?.length <= 0 &&
                cur?.buy?.spendAmount > cartData?.totalAmount
              ) {
                delete item.exactTotal;
                delete item.exactVat;
                delete item.discountedTotal;
                delete item.discountedVatAmount;
                delete item.promotionsData;
                const indexes: number[] = [];

                const exists = cart?.cartItems
                  ?.map((cartItems: any, ind: number) => {
                    if (cartItems?.isFree || cartItems?.isQtyFree) {
                      indexes.push(ind);
                    }
                    return cartItems?.promotionsData?.some((promoData: any) => {
                      return promoData?.id === promotionsApplied[index]._id;
                    });
                  })
                  .filter((filterOp: any) => filterOp);

                if (exists?.length <= 0) {
                  cart.removePromotion(index, (promotions: any) => {
                    debugLog(
                      "Promotion removed from cart",
                      promotions,
                      "cart-billing-screen",
                      "handleRemoveDiscountFunctionBUDGET"
                    );
                    EventRegister.emit("promotionRemoved", promotions);
                  });
                }

                cart.bulkRemoveFromCart(indexes, (removedItems: any) => {
                  debugLog(
                    "Items removed from cart",
                    removedItems,
                    "cart-context",
                    "calculatedPromotionsMethod15"
                  );
                  EventRegister.emit("itemRemoved", removedItems);
                });
              }
              if (
                cur?.promotionType === "advance" &&
                cur?.condition === "spends_the_following_amount" &&
                cur?.reward?.rewardType === "get_the_following_items" &&
                cur?.reward?.discountType !== "free" &&
                (cur?.buy?.productRefs?.length > 0 ||
                  cur?.buy?.categoryRefs?.length > 0)
              ) {
                const res = cart.cartItems.reduce((ac: any, ar: any) => {
                  if (
                    cur?.buy?.target === "product" &&
                    ar?.sku !== "Open Item" &&
                    cur?.buy?.productRefs?.length > 0 &&
                    cur?.buyProductSkus.includes(ar.sku) &&
                    !ar?.isFree &&
                    !ar?.isQtyFree
                  ) {
                    return ac + Number(ar?.total);
                  } else if (
                    cur?.buy?.target === "category" &&
                    ar?.sku !== "Open Item" &&
                    cur?.buy?.categoryRefs?.length > 0 &&
                    cur?.buy?.categoryRefs?.includes(ar.categoryRef) &&
                    !ar?.isFree &&
                    !ar?.isQtyFree
                  ) {
                    return ac + Number(ar?.total);
                  } else return ac;
                }, 0);

                if (res < cur?.buy?.spendAmount) {
                  delete item.exactTotal;
                  delete item.exactVat;
                  delete item.discountedTotal;
                  delete item.discountedVatAmount;
                  delete item.promotionsData;
                  const indexes: number[] = [];

                  const exists = cart?.cartItems
                    ?.map((cartItems: any, ind: number) => {
                      if (cartItems?.isFree || cartItems?.isQtyFree) {
                        indexes.push(ind);
                      }
                      return cartItems?.promotionsData?.some(
                        (promoData: any) => {
                          return promoData?.id === promotionsApplied[index]._id;
                        }
                      );
                    })
                    .filter((filterOp: any) => filterOp);

                  if (exists?.length <= 0) {
                    cart.removePromotion(index, (promotions: any) => {
                      debugLog(
                        "Promotion removed from cart",
                        promotions,
                        "cart-billing-screen",
                        "handleRemoveDiscountFunctionBUDGET"
                      );
                      EventRegister.emit("promotionRemoved", promotions);
                    });
                  }

                  cart.bulkRemoveFromCart(indexes, (removedItems: any) => {
                    debugLog(
                      "Items removed from cart",
                      removedItems,
                      "cart-context",
                      "calculatedPromotionsMethod16"
                    );
                    EventRegister.emit("itemRemoved", removedItems);
                  });
                }
              }
            });

            return prev + totalPromotionDiscount;
          } else return prev;
        } else return prev;
      },
      0
    );

    const totalCartAmount = cart?.cartItems?.reduce(
      (ac: any, ar: any) => ac + ar?.total,
      0
    );

    const discountPercentage = Number(
      (totalDiscountCalc * 100) / totalCartAmount
    );

    const discountCodes = promotionsApplied
      .map((d: any) => {
        if (d?.promotionTargetIds?.length !== 0) {
          return d.code;
        } else if (d?.advancedPromotion) {
          return d?.code;
        }
      })
      .join(",");

    const vatAmount =
      cartData.totalVatAmount -
      (cartData.totalVatAmount * discountPercentage) / 100;

    const totalAmount =
      cartData.totalAmount - (cartData.totalAmount * discountPercentage) / 100;

    const promotionRefs = promotionsApplied.map((promo: any) => promo?._id);

    return {
      promotionCodes: discountCodes,
      discountPercentage,
      totalDiscountCalc,
      vatAmount: Number(vatAmount?.toFixed(2)),
      totalAmount: Number(totalAmount?.toFixed(2)),
      promotionRefs,
    };
  }, [promotionsApplied, cartData, discountsApplied]);

  const discount = useMemo(() => {
    let totalAmountToConsider = 0;

    const totalDiscountCalc = [
      ...promotionsApplied,
      ...discountsApplied,
    ]?.reduce((prev: any, cur: any) => {
      totalAmountToConsider =
        true && cur?.type === "promotion"
          ? cartData.totalAmount
          : cartData.totalAmount;
      if (
        (cur?.promotionTargetIds?.length === 0 || !cur?.promotionTargetIds) &&
        !cur?.advancedPromotion
      ) {
        if (cur.discountType === "percent") {
          if (cur?.type === "promotion") {
            cart.cartItems.map((item: any) => {
              item.promotionsData = item.promotionsData || [];

              const doc = item?.promotionsData?.find(
                (f: any) => f?.id === cur?._id
              );

              if (!doc) {
                const newArray = [...item.promotionsData];

                newArray.push({
                  name: cur.code,
                  discount:
                    ((item.discountedTotal || item.total) * cur.discount) / 100,
                  id: cur?._id,
                  type: "all",
                });

                item.promotionsData = [...newArray];
              } else {
                const newArray = [...item?.promotionsData]?.filter(
                  (pro) => pro?.id !== doc?.id
                );

                newArray.push({
                  name: cur.code,
                  discount:
                    ((item.discountedTotal || item.total) * cur.discount) / 100,
                  id: cur?._id,
                  type: "all",
                });

                item.promotionsData = [...newArray];
              }
            });
          }
          // Calculate discount based on percentage
          const discountAmount =
            (totalAmountToConsider * Number(cur.discount)) / 100;

          if (
            discountAmount > cur?.offer?.budget &&
            cur?.offer?.type === "budget" &&
            cur?.offer?.budgetType !== "unlimited"
          ) {
            const index = promotionsApplied.findIndex(
              (pro: any) => pro._id === cur?._id
            );
            cart.removePromotion(index, (promotions: any) => {
              debugLog(
                "Promotion removed from cart",
                promotions,
                "cart-billing-screen",
                "handleRemoveDiscountFunctionBUDGET2"
              );
              EventRegister.emit("promotionRemoved", promotions);
            });
            return;
          }

          return prev + discountAmount;
        } else if (cur.discountType === "amount") {
          if (cur?.type === "promotion") {
            cart.cartItems.map((item: any) => {
              item.promotionsData = item.promotionsData || [];

              const doc = item?.promotionsData?.find(
                (f: any) => f?.id === cur?._id
              );

              if (!doc) {
                const fixedPercentage =
                  Number((cur?.discount * 100) / item.total) /
                  cartData.totalItem;

                const discountAmount = (item.total * fixedPercentage) / 100;

                item?.promotionsData?.push({
                  name: cur.code,
                  discount: discountAmount,
                  id: cur?._id,
                  type: "all",
                });
              } else {
                const fixedPercentage =
                  Number((cur?.discount * 100) / item.total) /
                  cartData.totalItem;

                const discountAmount = (item.total * fixedPercentage) / 100;

                const newArray = [...item?.promotionsData]?.filter(
                  (pro) => pro?.id !== doc?.id
                );

                newArray.push({
                  name: cur.code,
                  discount: discountAmount,
                  id: cur?._id,
                  type: "all",
                });

                item.promotionsData = [...newArray];
              }
            });
          }

          if (
            prev + Number(cur.discount) > cur?.offer?.budget &&
            cur?.offer?.type === "budget" &&
            cur?.offer?.budgetType !== "unlimited"
          ) {
            const index = promotionsApplied.findIndex(
              (pro: any) => pro._id === cur?._id
            );
            cart.removePromotion(index, (promotions: any) => {
              debugLog(
                "Promotion removed from cart",
                promotions,
                "cart-billing-screen",
                "handleRemoveDiscountFunctionBUDGET3"
              );
              EventRegister.emit("promotionRemoved", promotions);
            });
            return;
          }

          // Add fixed discount amount
          return prev + Number(cur.discount);
        } else {
          return prev;
        }
      } else return prev;
    }, 0);

    const totalCartAmount = items?.reduce(
      (ac: any, ar: any) => ac + (ar?.discountedTotal || ar?.total),
      0
    );

    const discountPercentage = Number(
      (totalDiscountCalc * 100) / totalCartAmount
    );

    const discountCodes = [...promotionsApplied, ...discountsApplied]
      .map((d: any) => {
        if (
          (d?.promotionTargetIds?.length === 0 || !d?.promotionTargetIds) &&
          !d?.advancedPromotion
        ) {
          return d.code;
        }
      })
      .join(",");

    const vatAmount =
      cartData.totalVatAmount -
      (cartData.totalVatAmount * discountPercentage) / 100;

    const totalAmount = true
      ? totalAmountToConsider - totalDiscountCalc
      : totalAmountToConsider -
        (totalAmountToConsider * discountPercentage) / 100 +
        (Number(cartData.totalModifierAmount) || 0);

    return {
      discountCodes,
      discountPercentage,
      totalDiscountCalc,
      vatAmount: Number(vatAmount?.toFixed(2)),
      totalAmount: Number(totalAmount?.toFixed(2)),
    };
  }, [discountsApplied, cartData, items, promotionsApplied]);

  const chargeData = useMemo(() => {
    if (chargesApplied.length > 0) {
      let totalCharges = chargesApplied?.reduce(
        (accumulator: any, charge: any) => {
          return accumulator + charge.total;
        },
        0
      );

      let vatCharges = chargesApplied?.reduce(
        (accumulator: any, charge: any) => {
          return accumulator + charge.vat;
        },
        0
      );

      return {
        totalCharges: Number((totalCharges || 0).toFixed(2)),
        vatCharges: Number((vatCharges || 0).toFixed(2)),
      };
    } else {
      return {
        totalCharges: 0,
        vatCharges: 0,
      };
    }
  }, [chargesApplied]);

  useMemo(() => {
    const cartItems = MMKVDB.get("cartItems");

    if (items?.length === 0 && cartItems?.length === 0) {
      cart.clearCharges();
      setChargesApplied([]);
      return;
    }

    if (chargesApplied?.length > 0) {
      const user = MMKVDB.get(DBKeys.DEVICE);

      const charges = chargesApplied.map((charge: any) => {
        if (charge.type === "percentage") {
          const vat = charge?.taxRef
            ? charge?.tax?.percentage || 0
            : Number(user?.company?.vat?.percentage || 15);
          const price =
            (cartData?.subTotalWithoutDiscount * charge.value) / 100;

          return {
            name: { en: charge.name.en, ar: charge.name.ar },
            total: Number(price?.toFixed(2)),
            vat: getItemVAT(price, vat),
            type: charge.type,
            chargeType: charge.chargeType,
            value: charge.value,
            chargeId: charge.chargeId,
          };
        } else {
          return charge;
        }
      });

      cart.clearCharges();
      cart.updateAllCharges(charges, (items: any) => {
        EventRegister.emit("chargeApplied", items);
      });
    }
  }, [cartData]);

  // useMemo(() => {
  //   if (cartData?.totalAmount > 0) {
  //     autoApplyCustomCharges(
  //       channel,
  //       discount.totalAmount > 0 ? discount.totalAmount : cartData.totalAmount,
  //       chargesApplied,
  //       cartData.subTotalWithoutDiscount
  //     );
  //   }
  // }, [cartData, discount]);

  useMemo(() => {
    setItems([...cart.cartItems]);
  }, [promotion.totalAmount]);

  return (
    <CartContext.Provider
      value={{
        items,
        discount,
        cartData,
        chargeData,
        discountsApplied,
        chargesApplied,
        promotion,
        promotionsApplied,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export default CartContext;
