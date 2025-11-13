import { useIsFocused } from "@react-navigation/core";
import React, { useEffect, useMemo, useState } from "react";
import { EventRegister } from "react-native-event-listeners";
import dineinCart from "../utils/dinein-cart";
import { getItemVAT } from "../utils/get-price";
import useCartStore from "../store/cart-item-dinein";
import MMKVDB from "../utils/DB-MMKV";
import { DBKeys } from "../utils/DBKeys";

const DineInCartContext = React.createContext({});

export function DineInCartContextProvider({ children }: any) {
  const [items, setItems] = useState([]) as any;
  const [discountsApplied, setDiscountsApplied] = useState([]) as any;
  const [promotionsApplied, setPromotionsApplied] = useState([]) as any;
  const [chargesApplied, setChargesApplied] = useState([]) as any;
  const [compsApplied, setCompsApplied] = useState([]) as any;
  const [seed, setSeed] = useState(false) as any;
  const isFocused = useIsFocused();
  const { setOrder, setTotalPaidAmount } = useCartStore();

  useEffect(() => {
    setItems(dineinCart.getCartItems());
    setDiscountsApplied(dineinCart.getDiscountApplied());
    setPromotionsApplied(dineinCart.getPromotionApplied());
    setChargesApplied(dineinCart.getChargesApplied());
    setCompsApplied(dineinCart.getCompsApplied());
  }, [isFocused]);

  useEffect(() => {
    const listener = EventRegister.addEventListener(
      "itemRemoved-dinein",
      (data) => {
        setItems([...data]);
      }
    );

    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, []);

  useEffect(() => {
    const listener = EventRegister.addEventListener("cart-clear-dinein", () => {
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
    const listener = EventRegister.addEventListener(
      "itemAdded-dinein",
      (data) => {
        setItems([...data]);
      }
    );
    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, []);

  useEffect(() => {
    const listener = EventRegister.addEventListener(
      "compsAdded-dinein",
      (data) => {
        setCompsApplied([...data]);
      }
    );
    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, []);

  useEffect(() => {
    const listener = EventRegister.addEventListener(
      "itemUpdated-dinein",
      (data) => {
        setItems([...data]);
      }
    );
    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, []);

  useEffect(() => {
    const listener = EventRegister.addEventListener(
      "discountApplied-dinein",
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
      "promotionApplied-dinein",
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
      "discountRemoved-dinein",
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
      "promotionRemoved-dinein",
      (data) => {
        setPromotionsApplied([...data]);
      }
    );
    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, []);

  useEffect(() => {
    const listener = EventRegister.addEventListener("voidCompApplied", () => {
      setSeed(!seed);
    });
    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, []);

  useEffect(() => {
    const listener = EventRegister.addEventListener(
      "chargeApplied-dinein",
      (data) => {
        setChargesApplied([...data]);
      }
    );
    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, []);

  useEffect(() => {
    const listener = EventRegister.addEventListener(
      "chargeRemoved-dinein",
      (data) => {
        setChargesApplied([...data]);
      }
    );
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
          let totalVatWithoutDiscount = accumulator.vatWithoutDiscount || 0;
          let totalAmountWithoutDiscount =
            accumulator.subTotalWithoutDiscount +
            accumulator.vatWithoutDiscount;
          let discount = 0;
          let totalModifierAmount = 0;
          let totalModifierVAT = 0;

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
          }

          if (item?.modifiers?.length > 0 && !item?.comp && !item?.void) {
            totalModifierAmount =
              item?.modifiers?.reduce((ac: any, ar: any) => ac + ar.total, 0) *
              item?.qty;

            totalModifierVAT =
              item?.modifiers?.reduce(
                (ac: any, ar: any) => ac + ar.vatAmount,
                0
              ) * item?.qty;
          }

          totalVat += Number(
            getItemVAT(item.total - totalModifierAmount - discount, item.vat) +
              totalModifierVAT
          );
          totalVatWithoutDiscount += Number(
            getItemVAT(item.total - totalModifierAmount, item.vat) +
              totalModifierVAT
          );

          totalAmount += item.total - discount;
          totalAmountWithoutDiscount += item.total;

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

  const discount = useMemo(() => {
    let totalAmountToConsider = 0;

    const totalDiscountCalc = [...discountsApplied]?.reduce(
      (prev: any, cur: any) => {
        totalAmountToConsider = cartData.totalAmount;

        if (cur.discountType === "percent") {
          const discountAmount =
            (totalAmountToConsider * Number(cur.discount)) / 100;

          return prev + discountAmount;
        } else if (cur.discountType === "amount") {
          // Add fixed discount amount
          return prev + Number(cur.discount);
        } else {
          return prev;
        }
      },
      0
    );

    const totalCartAmount = items?.reduce(
      (ac: any, ar: any) => ac + ar?.total,
      0
    );

    const discountPercentage = Number(
      (totalDiscountCalc * 100) / totalCartAmount
    );

    const discountCodes = [...discountsApplied]
      .map((d: any) => {
        return d.code;
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
  }, [discountsApplied, cartData, items]);

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

  // useMemo(() => {
  //   // const cartItems = [...(dineinCart.getCartItems() || [])];

  //   // if (items?.length === 0 && cartItems?.length === 0) {
  //   //   dineinCart.clearCharges();
  //   //   setChargesApplied([]);
  //   //   return;
  //   // }

  //   if (chargesApplied?.length > 0) {
  //     const user = MMKVDB.get(DBKeys.DEVICE);

  //     const charges = chargesApplied.map((charge: any) => {
  //       if (charge.type === "percentage") {
  //         const vat = charge?.taxRef
  //           ? charge?.tax?.percentage || 0
  //           : Number(user?.company?.vat?.percentage || 15);
  //         const price =
  //           (cartData?.subTotalWithoutDiscount * charge.value) / 100;

  //         return {
  //           name: { en: charge.name.en, ar: charge.name.ar },
  //           total: Number(price?.toFixed(2)),
  //           vat: getItemVAT(price, vat),
  //           type: charge.type,
  //           chargeType: charge.chargeType,
  //           value: charge.value,
  //           chargeId: charge.chargeId,
  //         };
  //       } else {
  //         return charge;
  //       }
  //     });

  //     console.log(charges, "CHARGES");

  //     dineinCart.clearCharges();
  //     dineinCart.updateAllCharges(charges, (items: any) => {
  //       EventRegister.emit("chargeApplied-dinein", items);
  //     });
  //   }
  // }, [cartData]);

  useEffect(() => {
    if (discountsApplied?.length > 0 && discount?.totalAmount <= 0) {
      dineinCart.clearDiscounts((removedDiscounts: any) => {
        EventRegister.emit("discountRemoved-dinein", removedDiscounts);
      });
    }
  }, [seed, discountsApplied, discount]);

  return (
    <DineInCartContext.Provider
      value={{
        items,
        discount,
        cartData,
        chargeData,
        discountsApplied,
        chargesApplied,
        compsApplied,
        promotionsApplied,
      }}
    >
      {children}
    </DineInCartContext.Provider>
  );
}

export default DineInCartContext;
