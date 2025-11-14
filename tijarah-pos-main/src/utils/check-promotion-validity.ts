import { EventRegister } from "react-native-event-listeners";
import serviceCaller from "../api";
import MMKVDB from "./DB-MMKV";
import cart from "./cart";
import { getItemSellingPrice, getItemVAT } from "./get-price";
import { debugLog } from "./log-patch";

export const checkPromotionValidity = async (
  data: any,
  customer: any,
  companyRef: any,
  locationRef: any,
  totalAmount: number
) => {
  const handleAdd = (
    productlist: any,
    cartItems: any = [],
    scan: boolean = false,
    qty: any,
    promotions: any,
    isFree: boolean = true
  ) => {
    const {
      _id,
      categoryRef,
      category,
      tax,
      variants,
      boxRefs,
      crateRefs,
      name,
      multiVariants,
      modifiers,
      channel,
    } = productlist;

    if (
      !scan &&
      (variants?.length > 1 || boxRefs?.length > 0 || crateRefs?.length > 0)
    ) {
    } else {
      const variant = variants[0];

      const priceData = variant.prices?.find(
        (price: any) => price?.locationRef === locationRef
      );

      const stockConfig = variant.stockConfiguration?.find(
        (stock: any) => stock?.locationRef === locationRef
      );

      if (
        variant.unit === "perItem" &&
        !priceData?.price &&
        variant.type !== "box" &&
        variant.type !== "crate"
      ) {
        return;
      }

      const totalAmountToConsider =
        variant.type === "box" || variant.type === "crate"
          ? Number(priceData?.price) * qty || Number(variant.price) * qty
          : Number(priceData.price) * qty;

      const sellingPrice = getItemSellingPrice(
        variant.type === "box" || variant.type === "crate"
          ? priceData?.price || variant.price
          : priceData.price,
        tax.percentage
      );

      const totalVatAmountToConsider = getItemVAT(
        totalAmountToConsider,
        tax.percentage
      );

      const fixedPercentage = Number(
        (promotions?.discount / totalAmountToConsider) * 100
      );

      const discountAmount =
        promotions?.reward?.discountType !== "free"
          ? promotions?.discountType === "amount"
            ? (totalAmountToConsider * fixedPercentage) / 100
            : (totalAmountToConsider * promotions.discount) / 100
          : 0;

      if (
        variant.unit === "perItem" ||
        variant.type === "box" ||
        variant.type === "crate"
      ) {
        const item: any = {
          productRef: _id,
          categoryRef: categoryRef || "",
          image: variant.image || productlist.image || "",
          name: { en: name.en, ar: name.ar },
          category: { name: category.name },
          costPrice: priceData?.costPrice || variant?.costPrice || 0,
          sellingPrice: getItemSellingPrice(
            variant.type === "box" || variant.type === "crate"
              ? priceData?.price || variant.price
              : priceData.price,
            tax.percentage
          ),
          variantNameEn: variant.name.en,
          variantNameAr: variant.name.ar,
          type: variant.type || "item",
          sku: variant.sku,
          parentSku: variant?.parentSku || "",
          boxSku: variant?.boxSku || "",
          crateSku: variant?.crateSku || "",
          boxRef: variant?.boxRef || "",
          crateRef: variant?.crateRef || "",
          vat: Number(tax.percentage),
          vatAmount: getItemVAT(
            variant.type === "box" || variant.type === "crate"
              ? priceData?.price || variant.price
              : priceData.price,
            tax.percentage
          ),
          qty,
          hasMultipleVariants: scan
            ? Boolean(multiVariants)
            : variants.length > 1,
          itemSubTotal: sellingPrice,
          isFree,
          isQtyFree: !isFree,
          itemVAT: getItemVAT(sellingPrice, tax.percentage),
          total: totalAmountToConsider,
          unit: variant.unit || "perItem",
          noOfUnits: Number(variant?.unitCount || 1),
          note: "",
          availability: stockConfig ? stockConfig.availability : true,
          tracking: stockConfig ? stockConfig.tracking : false,
          stockCount: stockConfig?.count ? stockConfig.count : 0,
          modifiers: [] as any,
          channel: channel,
          productModifiers: modifiers,
          promotionsData: [
            {
              name: promotions.code,
              discount:
                promotions?.reward?.discountType !== "free"
                  ? discountAmount
                  : totalAmountToConsider,
              id: promotions?._id,
              type: "specific",
            },
          ],
        };

        if (discountAmount > 0) {
          item.discountedTotal = totalAmountToConsider - discountAmount;
          item.exactTotal = totalAmountToConsider;
          item.exactVat = totalVatAmountToConsider;
        }

        if (
          (discountAmount < totalAmount && discountAmount < item?.total) ||
          promotions?.discountType !== "free"
        ) {
          cart.addToCart(item, (items: any) => {
            debugLog(
              "Item added to cart",
              item,
              "billing-screen",
              "handleCatalogueProductFunction"
            );
            EventRegister.emit("itemAdded", items);
          });
        } else {
          MMKVDB.set("blockedPromotion", promotions?._id);
        }
      }

      if (variant.unit !== "perItem") {
        MMKVDB.set("blockedPromotion", promotions?._id);
      }
    }
  };

  if (
    data?.target?.limitUsage === "new_customers" &&
    Object.keys(customer).length <= 0
  ) {
    return false;
  }

  if (
    data?.target?.limitUsage === "new_customers" &&
    Object.keys(customer).length > 0 &&
    customer?.totalSpend !== 0
  ) {
    return false;
  }

  if (
    data?.target?.customerGroupRefs?.length > 0 &&
    Object.keys(customer).length <= 0
  ) {
    return false;
  }

  if (
    data?.target?.customerGroupRefs?.length > 0 &&
    Object.keys(customer).length > 0
  ) {
    const customerDoc = await serviceCaller(`/customer/${customer?._id}`, {
      method: "GET",
    });

    if (customerDoc?.groupRefs?.length > 0) {
      const checkGroup = data?.target?.customerGroupRefs?.some((cu: string) =>
        customerDoc?.groupRefs?.includes(cu)
      );

      if (!checkGroup) {
        return false;
      }
    } else return false;
  }

  if (
    Object.keys(customer).length > 0 &&
    data?.target?.limitUsage === "no_of_times_per_customers" &&
    data?.target?.limit > 0
  ) {
    try {
      const res = await serviceCaller("/promotion/customer-usage", {
        method: "POST",
        body: {
          customerRef: customer?._id,
          companyRef,
          locationRef,
          promotionRef: data?._id,
        },
      });

      if (res?.promotionUsage >= data?.target?.limit) {
        return false;
      }
    } catch (error) {}
  }

  if (
    data?.target?.limit <= 0 &&
    data?.target?.limitUsage === "no_of_times_per_customers"
  ) {
    return false;
  }

  if (
    data?.target?.limitUsage === "no_of_times_per_customers" &&
    Object.keys(customer).length <= 0
  ) {
    return false;
  }

  if (
    data?.promotionType === "advance" &&
    data?.condition === "buys_the_following_items" &&
    data?.reward?.rewardType === "pay_fixed_price" &&
    data?.buy?.productRefs?.length <= 0 &&
    data?.buy?.categoryRefs?.length <= 0
  ) {
    const quantities = cart?.cartItems?.reduce(
      (prev: any, curr: any) => prev + Number(curr?.qty),
      0
    );
    const res = cart.cartItems.some((cart: any) => {
      if (data?.buy?.target === "product") {
        return (
          !cart.isFree &&
          cart?.sku !== "Open Item" &&
          ((data?.buy?.buyType === "quantity" &&
            data?.buy?.quantity <= quantities) ||
            (data?.buy?.buyType === "minMax" && data?.buy?.min <= quantities))
        );
      } else if (data?.buy?.target === "category") {
        return (
          !cart.isFree &&
          cart?.sku !== "Open Item" &&
          ((data?.buy?.buyType === "quantity" &&
            data?.buy?.quantity <= quantities) ||
            (data?.buy?.buyType === "minMax" && data?.buy?.min <= quantities))
        );
      }
    });

    if (!res) {
      return false;
    }
  }

  if (
    data?.promotionType === "advance" &&
    data?.condition === "buys_the_following_items" &&
    data?.reward?.rewardType === "pay_fixed_price" &&
    (data?.buy?.productRefs?.length > 0 || data?.buy?.categoryRefs?.length > 0)
  ) {
    const categoryQuantities = cart?.cartItems?.reduce((ac: any, ar: any) => {
      if (data?.buy?.categoryRefs?.includes(ar?.categoryRef) && !ar?.isFree) {
        return ac + Number(ar?.qty);
      } else return ac;
    }, 0);

    const res = cart.cartItems.some((cart: any) => {
      if (
        data?.buy?.target === "product" &&
        data?.buy?.productRefs?.length > 0
      ) {
        return (
          data?.buyProductSkus.includes(cart.sku) &&
          !cart.isFree &&
          cart?.sku !== "Open Item" &&
          ((data?.buy?.buyType === "quantity" &&
            data?.buy?.quantity <= cart?.qty) ||
            (data?.buy?.buyType === "minMax" && data?.buy?.min <= cart?.qty))
        );
      } else if (
        data?.buy?.target === "category" &&
        data?.buy?.categoryRefs?.length > 0
      ) {
        return (
          data?.buy?.categoryRefs?.includes(cart.categoryRef) &&
          !cart.isFree &&
          cart?.sku !== "Open Item" &&
          ((data?.buy?.buyType === "quantity" &&
            data?.buy?.quantity <= categoryQuantities) ||
            (data?.buy?.buyType === "minMax" &&
              data?.buy?.min <= categoryQuantities))
        );
      }
    });

    if (!res) {
      return false;
    }
  }

  if (
    data?.promotionType === "advance" &&
    data?.condition === "buys_the_following_items" &&
    data?.reward?.rewardType === "get_the_following_items" &&
    data?.reward?.discountType === "free" &&
    (data?.buy?.productRefs?.length > 0 || data?.buy?.categoryRefs?.length > 0)
  ) {
    const categoryQuantities = cart?.cartItems?.reduce((ac: any, ar: any) => {
      if (data?.buy?.categoryRefs?.includes(ar?.categoryRef) && !ar?.isFree) {
        return ac + Number(ar?.qty);
      } else return ac;
    }, 0);

    const res = cart.cartItems.some((cart: any) => {
      if (
        data?.buy?.target === "product" &&
        data?.buy?.productRefs?.length > 0
      ) {
        return (
          data?.buyProductSkus.includes(cart.sku) &&
          !cart.isFree &&
          cart?.sku !== "Open Item" &&
          ((data?.buy?.buyType === "quantity" &&
            data?.buy?.quantity <= cart?.qty) ||
            (data?.buy?.buyType === "minMax" && data?.buy?.min <= cart?.qty))
        );
      } else if (
        data?.buy?.target === "category" &&
        data?.buy?.categoryRefs?.length > 0
      ) {
        return (
          data?.buy?.categoryRefs?.includes(cart.categoryRef) &&
          !cart.isFree &&
          cart?.sku !== "Open Item" &&
          ((data?.buy?.buyType === "quantity" &&
            data?.buy?.quantity <= categoryQuantities) ||
            (data?.buy?.buyType === "minMax" &&
              data?.buy?.min <= categoryQuantities))
        );
      }
    });

    const prods: any = [];

    if (res) {
      try {
        const rewardsProcessed = await Promise.all(
          data?.reward?.products?.map(async (pro: any) => {
            try {
              const prod = await serviceCaller("/product/scan-product", {
                method: "GET",
                query: {
                  page: 0,
                  sort: "asc",
                  activeTab: "all",
                  limit: 1,
                  _q: pro?.variant?.sku,
                  companyRef: companyRef,
                  locationRef: locationRef,
                  showCustomPrice: false,
                },
              });

              prods.push(pro?.variant?.sku);

              const findPrice = prod?.variants[0]?.prices?.find(
                (priceData: any) => priceData?.locationRef === locationRef
              );

              if (findPrice?.price && findPrice?.price > 0) {
                handleAdd(
                  prod,
                  cart?.cartItems || [],
                  true,
                  data?.reward?.quantity,
                  data
                );
                return true; // Indicate successful processing
              } else {
                return false; // Indicate failure in processing this product
              }
            } catch (error) {
              console.error("Error processing product:", pro, error);
              return false; // Indicate failure in processing this product
            }
          })
        );

        // Check if all rewards were processed successfully
        if (rewardsProcessed.every((result) => result)) {
          return true;
        } else {
          for (const sku of prods) {
            const indexes: number[] = [];

            cart?.cartItems?.map((op: any, index: number) => {
              if (sku === op?.sku && (op?.isFree || op?.isQtyFree)) {
                indexes.push(index);
              }
            });

            cart.bulkRemoveFromCart(indexes, (updatedItems: any) => {
              EventRegister.emit("itemRemoved", updatedItems);
            });
          }
          return false;
        }
      } catch (error) {
        console.error("Error processing rewards:", error);
        return false;
      }
    } else {
      return false;
    }
  }

  if (
    data?.promotionType === "advance" &&
    data?.condition === "buys_the_following_items" &&
    data?.reward?.rewardType === "save_certain_amount" &&
    (data?.buy?.productRefs?.length > 0 || data?.buy?.categoryRefs?.length > 0)
  ) {
    const categoryQuantities = cart?.cartItems?.reduce((ac: any, ar: any) => {
      if (data?.buy?.categoryRefs?.includes(ar?.categoryRef) && !ar?.isFree) {
        return ac + Number(ar?.qty);
      } else return ac;
    }, 0);

    const res = cart.cartItems.some((cart: any) => {
      if (
        data?.buy?.target === "product" &&
        data?.buy?.productRefs?.length > 0
      ) {
        return (
          data?.buyProductSkus.includes(cart.sku) &&
          cart?.sku !== "Open Item" &&
          !cart.isFree &&
          ((data?.buy?.buyType === "quantity" &&
            data?.buy?.quantity <= cart?.qty) ||
            (data?.buy?.buyType === "minMax" && data?.buy?.min <= cart?.qty))
        );
      } else if (
        data?.buy?.target === "category" &&
        data?.buy?.categoryRefs?.length > 0
      ) {
        return (
          data?.buy?.categoryRefs?.includes(cart.categoryRef) &&
          !cart.isFree &&
          cart?.sku !== "Open Item" &&
          ((data?.buy?.buyType === "quantity" &&
            data?.buy?.quantity <= categoryQuantities) ||
            (data?.buy?.buyType === "minMax" &&
              data?.buy?.min <= categoryQuantities))
        );
      }
    });

    if (!res) {
      return false;
    }
  }

  if (
    data?.promotionType === "advance" &&
    data?.condition === "buys_the_following_items" &&
    data?.reward?.rewardType === "get_the_following_items" &&
    data?.reward?.discountType === "free" &&
    data?.buy?.productRefs?.length <= 0 &&
    data?.buy?.categoryRefs?.length <= 0
  ) {
    const quantities = cart?.cartItems?.reduce(
      (prev: any, curr: any) => prev + Number(curr?.qty),
      0
    );
    const res = cart.cartItems.some((cart: any) => {
      if (data?.buy?.target === "product") {
        return (
          !cart.isFree &&
          cart?.sku !== "Open Item" &&
          ((data?.buy?.buyType === "quantity" &&
            data?.buy?.quantity <= quantities) ||
            (data?.buy?.buyType === "minMax" && data?.buy?.min <= quantities))
        );
      } else if (data?.buy?.target === "category") {
        return (
          !cart.isFree &&
          cart?.sku !== "Open Item" &&
          ((data?.buy?.buyType === "quantity" &&
            data?.buy?.quantity <= quantities) ||
            (data?.buy?.buyType === "minMax" && data?.buy?.min <= quantities))
        );
      }
    });

    const prods: any = [];

    if (res) {
      try {
        const rewardsProcessed = await Promise.all(
          data?.reward?.products?.map(async (pro: any) => {
            try {
              const prod = await serviceCaller("/product/scan-product", {
                method: "GET",
                query: {
                  page: 0,
                  sort: "asc",
                  activeTab: "all",
                  limit: 1,
                  _q: pro?.variant?.sku,
                  companyRef: companyRef,
                  locationRef: locationRef,
                  showCustomPrice: false,
                },
              });

              prods.push(pro?.variant?.sku);

              const findPrice = prod?.variants[0]?.prices?.find(
                (priceData: any) => priceData?.locationRef === locationRef
              );

              if (findPrice?.price && findPrice?.price > 0) {
                handleAdd(
                  prod,
                  cart?.cartItems || [],
                  true,
                  data?.reward?.quantity,
                  data
                );
                return true; // Indicate successful processing
              } else {
                return false; // Indicate failure in processing this product
              }
            } catch (error) {
              console.error("Error processing product:", pro, error);
              return false; // Indicate failure in processing this product
            }
          })
        );

        // Check if all rewards were processed successfully
        if (rewardsProcessed.every((result) => result)) {
          return true;
        } else {
          for (const sku of prods) {
            const indexes: number[] = [];

            cart?.cartItems?.map((op: any, index: number) => {
              if (sku === op?.sku && (op?.isFree || op?.isQtyFree)) {
                indexes.push(index);
              }
            });

            cart.bulkRemoveFromCart(indexes, (updatedItems: any) => {
              EventRegister.emit("itemRemoved", updatedItems);
            });
          }
          return false;
        }
      } catch (error) {
        console.error("Error processing rewards:", error);
        return false;
      }
    } else {
      return false;
    }
  }

  if (
    data?.promotionType === "advance" &&
    data?.condition === "buys_the_following_items" &&
    data?.reward?.rewardType === "get_the_following_items" &&
    data?.reward?.discountType !== "free" &&
    data?.buy?.productRefs?.length <= 0 &&
    data?.buy?.categoryRefs?.length <= 0
  ) {
    const quantities = cart?.cartItems?.reduce(
      (prev: any, curr: any) => prev + Number(curr?.qty),
      0
    );
    const res = cart.cartItems.some((cart: any) => {
      if (data?.buy?.target === "product") {
        return (
          !cart.isFree &&
          cart?.sku !== "Open Item" &&
          ((data?.buy?.buyType === "quantity" &&
            data?.buy?.quantity <= quantities) ||
            (data?.buy?.buyType === "minMax" && data?.buy?.min <= quantities))
        );
      } else if (data?.buy?.target === "category") {
        return (
          !cart.isFree &&
          cart?.sku !== "Open Item" &&
          ((data?.buy?.buyType === "quantity" &&
            data?.buy?.quantity <= quantities) ||
            (data?.buy?.buyType === "minMax" && data?.buy?.min <= quantities))
        );
      }
    });

    const prods: any = [];

    if (res) {
      try {
        const rewardsProcessed = await Promise.all(
          data?.reward?.products?.map(async (pro: any) => {
            try {
              const prod = await serviceCaller("/product/scan-product", {
                method: "GET",
                query: {
                  page: 0,
                  sort: "asc",
                  activeTab: "all",
                  limit: 1,
                  _q: pro?.variant?.sku,
                  companyRef: companyRef,
                  locationRef: locationRef,
                  showCustomPrice: false,
                },
              });

              prods.push(pro?.variant?.sku);

              const findPrice = prod?.variants[0]?.prices?.find(
                (priceData: any) => priceData?.locationRef === locationRef
              );

              if (findPrice?.price && findPrice?.price > 0) {
                handleAdd(
                  prod,
                  cart?.cartItems || [],
                  true,
                  data?.reward?.quantity,
                  data,
                  false
                );
                return true; // Indicate successful processing
              } else {
                return false; // Indicate failure in processing this product
              }
            } catch (error) {
              console.error("Error processing product:", pro, error);
              return false; // Indicate failure in processing this product
            }
          })
        );

        // Check if all rewards were processed successfully
        if (rewardsProcessed.every((result) => result)) {
          return true;
        } else {
          for (const sku of prods) {
            const indexes: number[] = [];

            cart?.cartItems?.map((op: any, index: number) => {
              if (sku === op?.sku && (op?.isFree || op?.isQtyFree)) {
                indexes.push(index);
              }
            });

            cart.bulkRemoveFromCart(indexes, (updatedItems: any) => {
              EventRegister.emit("itemRemoved", updatedItems);
            });
          }
          return false;
        }
      } catch (error) {
        console.error("Error processing rewards:", error);
        return false;
      }
    } else {
      return false;
    }
  }

  if (
    data?.promotionType === "advance" &&
    data?.condition === "spends_the_following_amount" &&
    data?.reward?.rewardType === "get_the_following_items" &&
    data?.reward?.discountType !== "free" &&
    data?.buy?.productRefs?.length <= 0 &&
    data?.buy?.categoryRefs?.length <= 0 &&
    data?.buy?.spendAmount <= totalAmount
  ) {
    const prods: any = [];

    try {
      const rewardsProcessed = await Promise.all(
        data?.reward?.products?.map(async (pro: any) => {
          try {
            const prod = await serviceCaller("/product/scan-product", {
              method: "GET",
              query: {
                page: 0,
                sort: "asc",
                activeTab: "all",
                limit: 1,
                _q: pro?.variant?.sku,
                companyRef: companyRef,
                locationRef: locationRef,
                showCustomPrice: false,
              },
            });

            prods.push(pro?.variant?.sku);

            const findPrice = prod?.variants[0]?.prices?.find(
              (priceData: any) => priceData?.locationRef === locationRef
            );

            if (findPrice?.price && findPrice?.price > 0) {
              handleAdd(
                prod,
                cart?.cartItems || [],
                true,
                data?.reward?.quantity,
                data,
                false
              );
              return true; // Indicate successful processing
            } else {
              return false; // Indicate failure in processing this product
            }
          } catch (error) {
            console.error("Error processing product:", pro, error);
            return false; // Indicate failure in processing this product
          }
        })
      );

      // Check if all rewards were processed successfully
      if (rewardsProcessed.every((result) => result)) {
        return true;
      } else {
        for (const sku of prods) {
          const indexes: number[] = [];

          cart?.cartItems?.map((op: any, index: number) => {
            if (sku === op?.sku && (op?.isFree || op?.isQtyFree)) {
              indexes.push(index);
            }
          });

          cart.bulkRemoveFromCart(indexes, (updatedItems: any) => {
            EventRegister.emit("itemRemoved", updatedItems);
          });
        }
        return false;
      }
    } catch (error) {
      console.error("Error processing rewards:", error);
      return false;
    }
  }

  if (
    data?.promotionType === "advance" &&
    data?.condition === "spends_the_following_amount" &&
    data?.reward?.rewardType === "get_the_following_items" &&
    data?.reward?.discountType !== "free" &&
    (data?.buy?.productRefs?.length > 0 || data?.buy?.categoryRefs?.length > 0)
  ) {
    const res = cart.cartItems.reduce((ac: any, ar: any) => {
      if (
        data?.buy?.target === "product" &&
        ar?.sku !== "Open Item" &&
        data?.buy?.productRefs?.length > 0 &&
        data?.buyProductSkus.includes(ar.sku) &&
        !ar?.isFree &&
        !ar?.isQtyFree
      ) {
        return ac + Number(ar?.total);
      } else if (
        data?.buy?.target === "category" &&
        ar?.sku !== "Open Item" &&
        data?.buy?.categoryRefs?.length > 0 &&
        data?.buy?.categoryRefs?.includes(ar.categoryRef) &&
        !ar?.isFree &&
        !ar?.isQtyFree
      ) {
        return ac + Number(ar?.total);
      } else return ac;
    }, 0);

    if (res >= data?.buy?.spendAmount) {
      let valid = true;
      for (const pro of data?.reward?.products) {
        try {
          const prod = await serviceCaller("/product/scan-product", {
            method: "GET",
            query: {
              page: 0,
              sort: "asc",
              activeTab: "all",
              limit: 1,
              _q: pro?.variant?.sku,
              companyRef: companyRef,
              locationRef: locationRef,
            },
          });

          handleAdd(
            prod,
            cart?.cartItems || [],
            true,
            data?.reward?.quantity,
            data,
            false
          );
        } catch (error) {
          valid = false;
          break;
        }
      }

      if (!valid) return false;
    }
  }

  if (
    data?.promotionType === "advance" &&
    data?.condition === "buys_the_following_items" &&
    data?.reward?.rewardType === "get_the_following_items" &&
    data?.reward?.discountType !== "free" &&
    (data?.buy?.productRefs?.length > 0 || data?.buy?.categoryRefs?.length > 0)
  ) {
    const includedItemQty = cart?.cartItems?.reduce((acc: any, ob: any) => {
      if (
        data?.buyProductSkus.includes(ob?.sku) &&
        !ob?.isFree &&
        !ob?.isQtyFree
      ) {
        return acc + Number(ob?.qty);
      } else return acc;
    }, 0);
    const categoryQuantities = cart?.cartItems?.reduce((ac: any, ar: any) => {
      if (data?.buy?.categoryRefs?.includes(ar?.categoryRef) && !ar?.isFree) {
        return ac + Number(ar?.qty);
      } else return ac;
    }, 0);

    const res = cart.cartItems.some((cart: any) => {
      if (data?.buy?.target === "product") {
        return (
          !cart.isFree &&
          cart?.sku !== "Open Item" &&
          ((data?.buy?.buyType === "quantity" &&
            data?.buy?.quantity <= includedItemQty) ||
            (data?.buy?.buyType === "minMax" &&
              data?.buy?.min <= includedItemQty))
        );
      } else if (data?.buy?.target === "category") {
        return (
          !cart.isFree &&
          cart?.sku !== "Open Item" &&
          ((data?.buy?.buyType === "quantity" &&
            data?.buy?.quantity <= categoryQuantities) ||
            (data?.buy?.buyType === "minMax" &&
              data?.buy?.min <= categoryQuantities))
        );
      }
    });

    if (res) {
      let valid = true;
      for (const pro of data?.reward?.products) {
        try {
          const prod = await serviceCaller("/product/scan-product", {
            method: "GET",
            query: {
              page: 0,
              sort: "asc",
              activeTab: "all",
              limit: 1,
              _q: pro?.variant?.sku,
              companyRef: companyRef,
              locationRef: locationRef,
            },
          });

          handleAdd(
            prod,
            cart?.cartItems || [],
            true,
            data?.reward?.quantity,
            data,
            false
          );
        } catch (error) {
          valid = false;
          break;
        }
      }

      if (!valid) return false;
    } else return false;
  }

  if (
    data?.promotionType === "advance" &&
    data?.condition === "spends_the_following_amount" &&
    data?.buy?.spendAmount > totalAmount
  ) {
    return false;
  }

  if (
    data?.promotionType === "advance" &&
    data?.condition === "spends_the_following_amount" &&
    data?.reward?.rewardType === "save_certain_amount" &&
    (data?.buy?.productRefs?.length > 0 || data?.buy?.categoryRefs?.length > 0)
  ) {
    const res = cart.cartItems.reduce((ac: any, ar: any) => {
      if (
        data?.buy?.target === "product" &&
        ar?.sku !== "Open Item" &&
        data?.buy?.productRefs?.length > 0 &&
        data?.buyProductSkus.includes(ar.sku)
      ) {
        return ac + Number(ar?.total);
      } else if (
        data?.buy?.target === "category" &&
        ar?.sku !== "Open Item" &&
        data?.buy?.categoryRefs?.length > 0 &&
        data?.buy?.categoryRefs?.includes(ar.categoryRef)
      ) {
        return ac + Number(ar?.total);
      } else return ac;
    }, 0);

    if (res < data?.buy?.spendAmount) {
      return false;
    }
  }

  if (
    data?.promotionType === "advance" &&
    data?.condition === "spends_the_following_amount" &&
    data?.reward?.rewardType === "save_certain_amount" &&
    data?.buy?.productRefs?.length <= 0 &&
    data?.buy?.categoryRefs?.length <= 0
  ) {
    const res = cart.cartItems.reduce((ac: any, ar: any) => {
      if (data?.buy?.target === "product") {
        return ac + ar?.total;
      } else if (data?.buy?.target === "category") {
        return ac + ar?.total;
      }
    });

    if (res < data?.buy?.spendAmount) {
      return false;
    }
  }

  if (
    data?.promotionType === "advance" &&
    data?.condition === "buys_the_following_items" &&
    data?.reward?.rewardType === "save_certain_amount" &&
    data?.buy?.productRefs?.length <= 0 &&
    data?.buy?.categoryRefs?.length <= 0
  ) {
    const quantities = cart?.cartItems?.reduce(
      (prev: any, curr: any) => prev + Number(curr?.qty),
      0
    );
    const res = cart.cartItems.some((cart: any) => {
      if (cart?.sku !== "Open Item" && data?.buy?.target === "product") {
        return (
          !cart.isFree &&
          ((data?.buy?.buyType === "quantity" &&
            data?.buy?.quantity <= quantities) ||
            (data?.buy?.buyType === "minMax" && data?.buy?.min <= quantities))
        );
      } else if (
        cart?.sku !== "Open Item" &&
        data?.buy?.target === "category"
      ) {
        return (
          !cart.isFree &&
          ((data?.buy?.buyType === "quantity" &&
            data?.buy?.quantity <= quantities) ||
            (data?.buy?.buyType === "minMax" && data?.buy?.min <= quantities))
        );
      }
    });

    if (!res) {
      return false;
    }
  }

  if (
    data?.discountType === "amount" &&
    data?.offer?.budgetType === "amount" &&
    data?.offer?.type === "budget" &&
    Number(data?.discount) > data?.offer?.budget
  ) {
    return false;
  }

  if (data?.promotionTargetIds?.length > 0 && data?.promotionType === "basic") {
    if (data.promotionTargetType === "category") {
      const res = cart.cartItems.some((id: any) =>
        data.promotionTargetIds.includes(id.categoryRef)
      );

      if (!res) {
        return false;
      }
    }
    if (data.promotionTargetType === "product") {
      const res = cart.cartItems.some((id: any) =>
        data.productSkus.includes(id.sku)
      );

      if (!res) {
        return false;
      }
    }
  }

  if (
    data?.promotionType === "advance" &&
    data?.condition === "spends_the_following_amount" &&
    data?.reward?.rewardType === "get_the_following_items" &&
    data?.reward?.discountType === "free" &&
    (data?.buy?.productRefs?.length > 0 || data?.buy?.categoryRefs?.length > 0)
  ) {
    if (data?.buy?.target === "product") {
      const cartTotalAmount = cart.cartItems.reduce((acc: number, cur: any) => {
        if (data?.buyProductSkus?.length > 0) {
          if (data?.buyProductSkus?.includes(cur?.sku) && !cur?.isFree) {
            return acc + cur.total;
          } else return acc;
        } else return acc;
      }, 0);

      if (cartTotalAmount >= data?.buy?.spendAmount) {
        let valid = true;
        for (const pro of data?.reward?.products) {
          try {
            const prod = await serviceCaller("/product/scan-product", {
              method: "GET",
              query: {
                page: 0,
                sort: "asc",
                activeTab: "all",
                limit: 1,
                _q: pro?.variant?.sku,
                companyRef: companyRef,
                locationRef: locationRef,
              },
            });

            handleAdd(
              prod,
              cart?.cartItems || [],
              true,
              data?.reward?.quantity,
              data
            );
          } catch (error) {
            valid = false;
            break;
          }
        }

        if (!valid) return false;
      }
    } else if (data?.buy?.target === "category") {
      const cartTotalAmount = cart.cartItems.reduce((acc: number, cur: any) => {
        if (data?.buy?.categoryRefs?.length > 0) {
          if (
            data?.buy?.categoryRefs?.includes(cur?.categoryRef) &&
            !cur?.isFree
          ) {
            return acc + cur.total;
          } else return acc;
        } else return acc;
      }, 0);

      if (cartTotalAmount >= data?.buy?.spendAmount) {
        let valid = true;
        for (const pro of data?.reward?.products) {
          try {
            const prod = await serviceCaller("/product/scan-product", {
              method: "GET",
              query: {
                page: 0,
                sort: "asc",
                activeTab: "all",
                limit: 1,
                _q: pro?.variant?.sku,
                companyRef: companyRef,
                locationRef: locationRef,
              },
            });

            handleAdd(
              prod,
              cart?.cartItems || [],
              true,
              data?.reward?.quantity,
              data
            );
          } catch (error) {
            valid = false;
            break;
          }
        }

        if (!valid) return false;
      }
    } else return false;
  }

  if (
    data?.promotionType === "advance" &&
    data?.condition === "spends_the_following_amount" &&
    data?.reward?.rewardType === "get_the_following_items" &&
    data?.reward?.discountType === "free" &&
    data?.buy?.productRefs?.length <= 0 &&
    data?.buy?.categoryRefs?.length <= 0
  ) {
    if (totalAmount >= data?.buy?.spendAmount) {
      let valid = true;
      for (const pro of data?.reward?.products) {
        try {
          const prod = await serviceCaller("/product/scan-product", {
            method: "GET",
            query: {
              page: 0,
              sort: "asc",
              activeTab: "all",
              limit: 1,
              _q: pro?.variant?.sku,
              companyRef: companyRef,
              locationRef: locationRef,
            },
          });

          handleAdd(
            prod,
            cart?.cartItems || [],
            true,
            data?.reward?.quantity,
            data
          );
        } catch (error) {
          valid = false;
          break;
        }
      }

      if (!valid) return false;
    }
  }

  return true;
};
