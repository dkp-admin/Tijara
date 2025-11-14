import { FlashList } from "@shopify/flash-list";
import React from "react";
import { Modal, StyleSheet, View } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import cart from "../../../../utils/cart";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import NoDataPlaceholder from "../../../no-data-placeholder/no-data-placeholder";
import AppliedDiscountRow from "../row/applied-discount-row";

export default function AppliedDiscountModal({
  data,
  visible = false,
  handleClose,
}: {
  data: any;
  visible: boolean;
  handleClose?: any;
}) {
  const theme = useTheme();

  const { hp, twoPaneView } = useResponsive();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent={false}
      style={{ height: "100%" }}
    >
      <View
        style={{
          ...styles.container,
          backgroundColor: theme.colors.transparentBg,
        }}
      >
        <View
          style={{
            ...styles.container,
            marginHorizontal: twoPaneView ? "20%" : "0%",
            backgroundColor: theme.colors.bgColor,
          }}
        >
          <ActionSheetHeader
            title={t("Applied Discounts")}
            handleLeftBtn={() => handleClose()}
          />

          <FlashList
            onEndReached={() => {}}
            onEndReachedThreshold={0.01}
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            data={data}
            estimatedItemSize={hp("12%")}
            renderItem={({ item, index }) => {
              return (
                <AppliedDiscountRow
                  key={index}
                  data={item}
                  handleOnRemove={(discountData: any) => {
                    const discountLength = data?.filter(
                      (dis: any) => !dis?.type && dis?.type !== "promotion"
                    );

                    if (discountData?.advancedPromotion) {
                      cart?.cartItems?.map((item: any) => {
                        if (
                          discountData?.condition ===
                            "buys_the_following_items" &&
                          discountData?.reward?.rewardType ===
                            "save_certain_amount"
                        ) {
                          const indexes: number[] = [];

                          const exists = cart?.cartItems
                            ?.map((cartItems: any, ind: number) => {
                              if (
                                (cartItems?.isFree || cartItems?.isQtyFree) &&
                                cartItems?.promotionsData?.some(
                                  (promoData: any) => {
                                    return (
                                      promoData?.id ===
                                      data[index - discountLength.length]._id
                                    );
                                  }
                                )
                              ) {
                                indexes.push(ind);
                              }

                              return cartItems?.promotionsData?.some(
                                (promoData: any) => {
                                  return (
                                    promoData?.id ===
                                    data[index - discountLength.length]._id
                                  );
                                }
                              );
                            })
                            .filter((filterOp: any) => filterOp);

                          if (exists?.length === 1) {
                            delete item.exactTotal;
                            delete item.exactVat;
                            delete item.discountedTotal;
                            delete item.discountedVatAmount;
                            delete item.promotionsData;
                            cart.removePromotion(
                              index - discountLength.length,
                              (discounts: any) => {
                                EventRegister.emit(
                                  "promotionRemoved",
                                  discounts
                                );
                              }
                            );
                          }

                          cart.bulkRemoveFromCart(
                            indexes,
                            (removedItems: any) => {
                              EventRegister.emit("itemRemoved", removedItems);
                            }
                          );
                        }
                        if (
                          data?.advancedPromotion &&
                          data?.condition === "spends_the_following_amount" &&
                          data?.reward?.rewardType &&
                          data?.buy?.target === "product"
                        ) {
                          const indexes: number[] = [];

                          const exists = cart?.cartItems
                            ?.map((cartItems: any, ind: number) => {
                              if (
                                (cartItems?.isFree || cartItems?.isQtyFree) &&
                                cartItems?.promotionsData?.some(
                                  (promoData: any) => {
                                    return (
                                      promoData?.id ===
                                      data[index - discountLength.length]._id
                                    );
                                  }
                                )
                              ) {
                                indexes.push(ind);
                              }

                              return cartItems?.promotionsData?.some(
                                (promoData: any) => {
                                  return (
                                    promoData?.id ===
                                    data[index - discountLength.length]._id
                                  );
                                }
                              );
                            })
                            .filter((filterOp: any) => filterOp);

                          if (exists?.length === 1) {
                            delete item.exactTotal;
                            delete item.exactVat;
                            delete item.discountedTotal;
                            delete item.discountedVatAmount;
                            delete item.promotionsData;
                            cart.removePromotion(
                              index - discountLength.length,
                              (discounts: any) => {
                                EventRegister.emit(
                                  "promotionRemoved",
                                  discounts
                                );
                              }
                            );
                          }

                          cart.bulkRemoveFromCart(
                            indexes,
                            (removedItems: any) => {
                              EventRegister.emit("itemRemoved", removedItems);
                            }
                          );
                        }
                        if (
                          discountData?.promotionType === "advance" &&
                          discountData?.condition ===
                            "buys_the_following_items" &&
                          discountData?.reward?.rewardType ===
                            "save_certain_amount" &&
                          discountData?.buy?.productRefs?.length <= 0 &&
                          discountData?.buy?.categoryRefs?.length <= 0
                        ) {
                          const indexes: number[] = [];

                          const exists = cart?.cartItems
                            ?.map((cartItems: any, ind: number) => {
                              if (
                                (cartItems?.isFree || cartItems?.isQtyFree) &&
                                cartItems?.promotionsData?.some(
                                  (promoData: any) => {
                                    return (
                                      promoData?.id ===
                                      data[index - discountLength.length]._id
                                    );
                                  }
                                )
                              ) {
                                indexes.push(ind);
                              }

                              return cartItems?.promotionsData?.some(
                                (promoData: any) => {
                                  return (
                                    promoData?.id ===
                                    data[index - discountLength.length]._id
                                  );
                                }
                              );
                            })
                            .filter((filterOp: any) => filterOp);

                          if (exists?.length === 1) {
                            delete item.exactTotal;
                            delete item.exactVat;
                            delete item.discountedTotal;
                            delete item.discountedVatAmount;
                            delete item.promotionsData;
                            cart.removePromotion(
                              index - discountLength.length,
                              (discounts: any) => {
                                EventRegister.emit(
                                  "promotionRemoved",
                                  discounts
                                );
                              }
                            );
                          }

                          cart.bulkRemoveFromCart(
                            indexes,
                            (removedItems: any) => {
                              EventRegister.emit("itemRemoved", removedItems);
                            }
                          );
                        }
                        if (
                          discountData?.advancedPromotion &&
                          discountData?.condition ===
                            "spends_the_following_amount" &&
                          discountData?.reward?.rewardType ===
                            "save_certain_amount" &&
                          discountData?.reward?.saveOn ===
                            "off_the_entire_sale" &&
                          (discountData?.buyProductSkus?.length > 0 ||
                            discountData?.buy?.categoryRefs?.length > 0)
                        ) {
                          const indexes: number[] = [];

                          const exists = cart?.cartItems
                            ?.map((cartItems: any, ind: number) => {
                              if (
                                (cartItems?.isFree || cartItems?.isQtyFree) &&
                                cartItems?.promotionsData?.some(
                                  (promoData: any) => {
                                    return (
                                      promoData?.id ===
                                      data[index - discountLength.length]._id
                                    );
                                  }
                                )
                              ) {
                                indexes.push(ind);
                              }

                              return cartItems?.promotionsData?.some(
                                (promoData: any) => {
                                  return (
                                    promoData?.id ===
                                    data[index - discountLength.length]._id
                                  );
                                }
                              );
                            })
                            .filter((filterOp: any) => filterOp);

                          if (exists?.length === 1) {
                            delete item.exactTotal;
                            delete item.exactVat;
                            delete item.discountedTotal;
                            delete item.discountedVatAmount;
                            delete item.promotionsData;
                            cart.removePromotion(
                              index - discountLength.length,
                              (discounts: any) => {
                                EventRegister.emit(
                                  "promotionRemoved",
                                  discounts
                                );
                              }
                            );
                          }

                          cart.bulkRemoveFromCart(
                            indexes,
                            (removedItems: any) => {
                              EventRegister.emit("itemRemoved", removedItems);
                            }
                          );
                        }

                        if (
                          discountData?.promotionType === "advance" &&
                          discountData?.condition ===
                            "buys_the_following_items" &&
                          discountData?.reward?.rewardType ===
                            "get_the_following_items" &&
                          discountData?.reward?.discountType !== "free" &&
                          discountData?.buy?.productRefs?.length <= 0 &&
                          discountData?.buy?.categoryRefs?.length <= 0
                        ) {
                          const indexes: number[] = [];

                          const exists = cart?.cartItems
                            ?.map((cartItems: any, ind: number) => {
                              if (
                                (cartItems?.isFree || cartItems?.isQtyFree) &&
                                cartItems?.promotionsData?.some(
                                  (promoData: any) => {
                                    return (
                                      promoData?.id ===
                                      data[index - discountLength.length]._id
                                    );
                                  }
                                )
                              ) {
                                indexes.push(ind);
                              }

                              return cartItems?.promotionsData?.some(
                                (promoData: any) => {
                                  return (
                                    promoData?.id ===
                                    data[index - discountLength.length]._id
                                  );
                                }
                              );
                            })
                            .filter((filterOp: any) => filterOp);

                          if (exists?.length === 1) {
                            delete item.exactTotal;
                            delete item.exactVat;
                            delete item.discountedTotal;
                            delete item.discountedVatAmount;
                            delete item.promotionsData;
                            cart.removePromotion(
                              index - discountLength.length,
                              (discounts: any) => {
                                EventRegister.emit(
                                  "promotionRemoved",
                                  discounts
                                );
                              }
                            );
                          }

                          cart.bulkRemoveFromCart(
                            indexes,
                            (removedItems: any) => {
                              EventRegister.emit("itemRemoved", removedItems);
                            }
                          );
                        }

                        if (
                          discountData?.promotionType === "advance" &&
                          discountData?.condition ===
                            "buys_the_following_items" &&
                          discountData?.reward?.rewardType ===
                            "get_the_following_items" &&
                          discountData?.reward?.discountType !== "free" &&
                          (discountData?.buy?.productRefs?.length > 0 ||
                            discountData?.buy?.categoryRefs?.length > 0)
                        ) {
                          const indexes: number[] = [];

                          const exists = cart?.cartItems
                            ?.map((cartItems: any, ind: number) => {
                              if (
                                (cartItems?.isFree || cartItems?.isQtyFree) &&
                                cartItems?.promotionsData?.some(
                                  (promoData: any) => {
                                    return (
                                      promoData?.id ===
                                      data[index - discountLength.length]._id
                                    );
                                  }
                                )
                              ) {
                                indexes.push(ind);
                              }

                              return cartItems?.promotionsData?.some(
                                (promoData: any) => {
                                  return (
                                    promoData?.id ===
                                    data[index - discountLength.length]._id
                                  );
                                }
                              );
                            })
                            .filter((filterOp: any) => filterOp);

                          if (exists?.length === 1) {
                            delete item.exactTotal;
                            delete item.exactVat;
                            delete item.discountedTotal;
                            delete item.discountedVatAmount;
                            delete item.promotionsData;
                            cart.removePromotion(
                              index - discountLength.length,
                              (discounts: any) => {
                                EventRegister.emit(
                                  "promotionRemoved",
                                  discounts
                                );
                              }
                            );
                          }

                          cart.bulkRemoveFromCart(
                            indexes,
                            (removedItems: any) => {
                              EventRegister.emit("itemRemoved", removedItems);
                            }
                          );
                        }

                        if (
                          discountData?.promotionType === "advance" &&
                          discountData?.condition ===
                            "buys_the_following_items" &&
                          discountData?.reward?.rewardType ===
                            "get_the_following_items" &&
                          discountData?.reward?.discountType === "free" &&
                          discountData?.buy?.target === "category" &&
                          discountData?.buy?.categoryRefs?.length > 0 &&
                          discountData?.buy?.categoryRefs.includes(
                            item.categoryRef
                          )
                        ) {
                          const indexes: number[] = [];

                          const exists = cart?.cartItems
                            ?.map((cartItems: any, ind: number) => {
                              if (
                                (cartItems?.isFree || cartItems?.isQtyFree) &&
                                cartItems?.promotionsData?.some(
                                  (promoData: any) => {
                                    return (
                                      promoData?.id ===
                                      data[index - discountLength.length]._id
                                    );
                                  }
                                )
                              ) {
                                indexes.push(ind);
                              }

                              return cartItems?.promotionsData?.some(
                                (promoData: any) => {
                                  return (
                                    promoData?.id ===
                                    data[index - discountLength.length]._id
                                  );
                                }
                              );
                            })
                            .filter((filterOp: any) => filterOp);

                          if (exists?.length === 1) {
                            delete item.exactTotal;
                            delete item.exactVat;
                            delete item.discountedTotal;
                            delete item.discountedVatAmount;
                            delete item.promotionsData;
                            cart.removePromotion(
                              index - discountLength.length,
                              (discounts: any) => {
                                EventRegister.emit(
                                  "promotionRemoved",
                                  discounts
                                );
                              }
                            );
                          }

                          cart.bulkRemoveFromCart(
                            indexes,
                            (removedItems: any) => {
                              EventRegister.emit("itemRemoved", removedItems);
                            }
                          );
                        }

                        if (
                          discountData?.promotionType === "advance" &&
                          discountData?.condition ===
                            "buys_the_following_items" &&
                          discountData?.reward?.rewardType ===
                            "get_the_following_items" &&
                          discountData?.reward?.discountType === "free" &&
                          discountData?.buy?.target === "product" &&
                          discountData?.buy?.productRefs?.length > 0 &&
                          discountData?.buyProductSkus.includes(item.sku)
                        ) {
                          const indexes: number[] = [];

                          const exists = cart?.cartItems
                            ?.map((cartItems: any, ind: number) => {
                              if (
                                (cartItems?.isFree || cartItems?.isQtyFree) &&
                                cartItems?.promotionsData?.some(
                                  (promoData: any) => {
                                    return (
                                      promoData?.id ===
                                      data[index - discountLength.length]._id
                                    );
                                  }
                                )
                              ) {
                                indexes.push(ind);
                              }

                              return cartItems?.promotionsData?.some(
                                (promoData: any) => {
                                  return (
                                    promoData?.id ===
                                    data[index - discountLength.length]._id
                                  );
                                }
                              );
                            })
                            .filter((filterOp: any) => filterOp);

                          if (exists?.length === 1) {
                            delete item.exactTotal;
                            delete item.exactVat;
                            delete item.discountedTotal;
                            delete item.discountedVatAmount;
                            delete item.promotionsData;
                            cart.removePromotion(
                              index - discountLength.length,
                              (discounts: any) => {
                                EventRegister.emit(
                                  "promotionRemoved",
                                  discounts
                                );
                              }
                            );
                          }

                          cart.bulkRemoveFromCart(
                            indexes,
                            (removedItems: any) => {
                              EventRegister.emit("itemRemoved", removedItems);
                            }
                          );
                        }

                        if (
                          discountData?.promotionType === "advance" &&
                          discountData?.condition ===
                            "buys_the_following_items" &&
                          discountData?.reward?.rewardType ===
                            "get_the_following_items" &&
                          discountData?.reward?.discountType === "free" &&
                          discountData?.buy?.productRefs?.length <= 0 &&
                          discountData?.buy?.categoryRefs?.length <= 0
                        ) {
                          const indexes: number[] = [];

                          const exists = cart?.cartItems
                            ?.map((cartItems: any, ind: number) => {
                              if (
                                (cartItems?.isFree || cartItems?.isQtyFree) &&
                                cartItems?.promotionsData?.some(
                                  (promoData: any) => {
                                    return (
                                      promoData?.id ===
                                      data[index - discountLength.length]._id
                                    );
                                  }
                                )
                              ) {
                                indexes.push(ind);
                              }

                              return cartItems?.promotionsData?.some(
                                (promoData: any) => {
                                  return (
                                    promoData?.id ===
                                    data[index - discountLength.length]._id
                                  );
                                }
                              );
                            })
                            .filter((filterOp: any) => filterOp);

                          if (exists?.length === 1) {
                            delete item.exactTotal;
                            delete item.exactVat;
                            delete item.discountedTotal;
                            delete item.discountedVatAmount;
                            delete item.promotionsData;
                            cart.removePromotion(
                              index - discountLength.length,
                              (discounts: any) => {
                                EventRegister.emit(
                                  "promotionRemoved",
                                  discounts
                                );
                              }
                            );
                          }

                          cart.bulkRemoveFromCart(
                            indexes,
                            (removedItems: any) => {
                              EventRegister.emit("itemRemoved", removedItems);
                            }
                          );
                        }

                        if (
                          discountData?.promotionType === "advance" &&
                          discountData?.condition ===
                            "spends_the_following_amount" &&
                          discountData?.reward?.rewardType ===
                            "get_the_following_items" &&
                          discountData?.reward?.discountType === "free" &&
                          discountData?.buy?.productRefs?.length <= 0 &&
                          discountData?.buy?.categoryRefs?.length <= 0
                        ) {
                          const indexes: number[] = [];

                          const exists = cart?.cartItems
                            ?.map((cartItems: any, ind: number) => {
                              if (
                                (cartItems?.isFree || cartItems?.isQtyFree) &&
                                cartItems?.promotionsData?.some(
                                  (promoData: any) => {
                                    return (
                                      promoData?.id ===
                                      data[index - discountLength.length]._id
                                    );
                                  }
                                )
                              ) {
                                indexes.push(ind);
                              }

                              return cartItems?.promotionsData?.some(
                                (promoData: any) => {
                                  return (
                                    promoData?.id ===
                                    data[index - discountLength.length]._id
                                  );
                                }
                              );
                            })
                            .filter((filterOp: any) => filterOp);

                          if (exists?.length === 1) {
                            delete item.exactTotal;
                            delete item.exactVat;
                            delete item.discountedTotal;
                            delete item.discountedVatAmount;
                            delete item.promotionsData;
                            cart.removePromotion(
                              index - discountLength.length,
                              (discounts: any) => {
                                EventRegister.emit(
                                  "promotionRemoved",
                                  discounts
                                );
                              }
                            );
                          }

                          cart.bulkRemoveFromCart(
                            indexes,
                            (removedItems: any) => {
                              EventRegister.emit("itemRemoved", removedItems);
                            }
                          );
                        }

                        if (
                          discountData?.promotionType === "advance" &&
                          discountData?.condition ===
                            "spends_the_following_amount" &&
                          discountData?.reward?.rewardType ===
                            "get_the_following_items" &&
                          discountData?.reward?.discountType !== "free" &&
                          discountData?.buy?.productRefs?.length <= 0 &&
                          discountData?.buy?.categoryRefs?.length <= 0
                        ) {
                          const indexes: number[] = [];

                          const exists = cart?.cartItems
                            ?.map((cartItems: any, ind: number) => {
                              if (
                                (cartItems?.isFree || cartItems?.isQtyFree) &&
                                cartItems?.promotionsData?.some(
                                  (promoData: any) => {
                                    return (
                                      promoData?.id ===
                                      data[index - discountLength.length]._id
                                    );
                                  }
                                )
                              ) {
                                indexes.push(ind);
                              }

                              return cartItems?.promotionsData?.some(
                                (promoData: any) => {
                                  return (
                                    promoData?.id ===
                                    data[index - discountLength.length]._id
                                  );
                                }
                              );
                            })
                            .filter((filterOp: any) => filterOp);

                          if (exists?.length === 1) {
                            delete item.exactTotal;
                            delete item.exactVat;
                            delete item.discountedTotal;
                            delete item.discountedVatAmount;
                            delete item.promotionsData;
                            cart.removePromotion(
                              index - discountLength.length,
                              (discounts: any) => {
                                EventRegister.emit(
                                  "promotionRemoved",
                                  discounts
                                );
                              }
                            );
                          }

                          cart.bulkRemoveFromCart(
                            indexes,
                            (removedItems: any) => {
                              EventRegister.emit("itemRemoved", removedItems);
                            }
                          );
                        }
                        if (
                          discountData?.promotionType === "advance" &&
                          discountData?.condition ===
                            "spends_the_following_amount" &&
                          discountData?.reward?.rewardType ===
                            "get_the_following_items" &&
                          discountData?.reward?.discountType !== "free" &&
                          (data?.buy?.productRefs?.length > 0 ||
                            discountData?.buy?.categoryRefs?.length > 0)
                        ) {
                          const indexes: number[] = [];

                          const exists = cart?.cartItems
                            ?.map((cartItems: any, ind: number) => {
                              if (
                                (cartItems?.isFree || cartItems?.isQtyFree) &&
                                cartItems?.promotionsData?.some(
                                  (promoData: any) => {
                                    return (
                                      promoData?.id ===
                                      data[index - discountLength.length]._id
                                    );
                                  }
                                )
                              ) {
                                indexes.push(ind);
                              }

                              return cartItems?.promotionsData?.some(
                                (promoData: any) => {
                                  return (
                                    promoData?.id ===
                                    data[index - discountLength.length]._id
                                  );
                                }
                              );
                            })
                            .filter((filterOp: any) => filterOp);

                          if (exists?.length === 1) {
                            delete item.exactTotal;
                            delete item.exactVat;
                            delete item.discountedTotal;
                            delete item.discountedVatAmount;
                            delete item.promotionsData;
                            cart.removePromotion(
                              index - discountLength.length,
                              (discounts: any) => {
                                EventRegister.emit(
                                  "promotionRemoved",
                                  discounts
                                );
                              }
                            );
                          }

                          cart.bulkRemoveFromCart(
                            indexes,
                            (removedItems: any) => {
                              EventRegister.emit("itemRemoved", removedItems);
                            }
                          );
                        }

                        if (
                          discountData?.promotionType === "advance" &&
                          discountData?.condition ===
                            "buys_the_following_items" &&
                          discountData?.reward?.rewardType ===
                            "save_certain_amount" &&
                          discountData?.buy?.productRefs?.length <= 0 &&
                          discountData?.buy?.categoryRefs?.length <= 0
                        ) {
                          const indexes: number[] = [];

                          const exists = cart?.cartItems
                            ?.map((cartItems: any, ind: number) => {
                              if (
                                (cartItems?.isFree || cartItems?.isQtyFree) &&
                                cartItems?.promotionsData?.some(
                                  (promoData: any) => {
                                    return (
                                      promoData?.id ===
                                      data[index - discountLength.length]._id
                                    );
                                  }
                                )
                              ) {
                                indexes.push(ind);
                              }

                              return cartItems?.promotionsData?.some(
                                (promoData: any) => {
                                  return (
                                    promoData?.id ===
                                    data[index - discountLength.length]._id
                                  );
                                }
                              );
                            })
                            .filter((filterOp: any) => filterOp);

                          if (exists?.length === 1) {
                            delete item.exactTotal;
                            delete item.exactVat;
                            delete item.discountedTotal;
                            delete item.discountedVatAmount;
                            delete item.promotionsData;
                            cart.removePromotion(
                              index - discountLength.length,
                              (discounts: any) => {
                                EventRegister.emit(
                                  "promotionRemoved",
                                  discounts
                                );
                              }
                            );
                          }

                          cart.bulkRemoveFromCart(
                            indexes,
                            (removedItems: any) => {
                              EventRegister.emit("itemRemoved", removedItems);
                            }
                          );
                        }
                      });
                    }

                    if (
                      discountData?.type &&
                      discountData?.type === "promotion" &&
                      !discountData?.advancedPromotion
                    ) {
                      const discount: any = item;

                      if (discount?.promotionTargetIds?.length !== 0) {
                        cart.cartItems.map((item: any) => {
                          if (discount?.productSkus.includes(item.sku)) {
                            delete item.exactTotal;
                            delete item.exactVat;
                            delete item.discountedTotal;
                            delete item.discountedVatAmount;
                            delete item.promotionsData;
                          }
                          if (
                            discount?.promotionTargetIds.includes(
                              item.categoryRef
                            )
                          ) {
                            delete item.exactTotal;
                            delete item.exactVat;
                            delete item.discountedTotal;
                            delete item.discountedVatAmount;
                            delete item.promotionsData;
                          }
                        });
                        cart.removePromotion(
                          index - discountLength.length,
                          (discounts: any) => {
                            EventRegister.emit("promotionRemoved", discounts);
                          }
                        );
                      } else {
                        cart.removePromotion(
                          index - discountLength.length,
                          (discounts: any) => {
                            EventRegister.emit("promotionRemoved", discounts);
                          }
                        );
                      }
                    } else {
                      cart.removeDiscount(index, (discounts: any) => {
                        EventRegister.emit("discountRemoved", discounts);
                      });
                    }
                  }}
                />
              );
            }}
            ListEmptyComponent={() => {
              return (
                <View style={{ marginHorizontal: 16 }}>
                  <NoDataPlaceholder
                    title={t("No Applied Discounts!")}
                    marginTop={hp("30%")}
                  />
                </View>
              );
            }}
            ListFooterComponent={() => <View style={{ height: hp("10%") }} />}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
});
