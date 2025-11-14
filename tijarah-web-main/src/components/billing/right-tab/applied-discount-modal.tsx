import CloseIcon from "@mui/icons-material/Close";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import {
  Button,
  Dialog,
  DialogContent,
  Divider,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import useItems from "src/hooks/use-items";
import cart from "src/utils/cart";
import { trigger } from "src/utils/custom-event";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

interface AppliedDiscountModalProps {
  discounts: any[];
  open: boolean;
  handleClose: any;
}

export const AppliedDiscountModal: React.FC<AppliedDiscountModalProps> = ({
  discounts,
  open = false,
  handleClose,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const currency = useCurrency();
  const getDiscountValue = (discount: string, type: string) => {
    if (type === "percent") {
      return `${discount}%`;
    } else {
      return `${currency} ` + Number(discount)?.toFixed(2);
    }
  };

  const { totalAmount } = useItems();
  return (
    <>
      <Box>
        <Dialog
          fullWidth
          maxWidth="sm"
          open={open}
          onClose={() => {
            handleClose();
          }}
        >
          {/* header */}
          <Box
            sx={{
              display: "flex",
              p: 2,
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor:
                theme.palette.mode === "light" ? "#fff" : "#111927",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            ></Box>

            <Typography sx={{}} variant="h6">
              {t("Applied Discounts")}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": {
                  backgroundColor: "action.hover",
                  cursor: "pointer",
                  opacity: 0.5,
                },
              }}
            >
              <CloseIcon
                fontSize="medium"
                onClick={() => {
                  handleClose();
                }}
              />
            </Box>
          </Box>
          <Divider />
          <DialogContent>
            <TableContainer>
              <Table>
                <TableBody>
                  {discounts?.length > 0 ? (
                    discounts?.map((data, index) => {
                      const freeItemsDiscount: any = cart.cartItems?.reduce(
                        (prev: any, cur: any) => {
                          if (
                            cur?.isFree &&
                            cur?.promotionsData[0].id === data._id
                          )
                            return (
                              prev +
                              Number(
                                cur?.discountedTotal > 0
                                  ? cur?.total - cur?.discountedTotal
                                  : cur?.total
                              )
                            );
                          else return prev;
                        },
                        0
                      );

                      return (
                        <>
                          <TableRow key={index}>
                            <TableCell>
                              <Typography variant="subtitle2">
                                {data.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2">
                                {data.code}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2">
                                {data?.advancedPromotion &&
                                data?.reward?.rewardType ===
                                  "get_the_following_items" &&
                                data?.reward?.discountType === "free"
                                  ? `${currency} ${toFixedNumber(
                                      freeItemsDiscount
                                    )}`
                                  : getDiscountValue(
                                      data.discount,
                                      data.discountType
                                    )}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ width: "10%" }}>
                              <Button
                                onClick={() => {
                                  const discountLength = discounts.filter(
                                    (dis) =>
                                      !dis.type && dis.type !== "promotion"
                                  ).length;

                                  if (data?.advancedPromotion) {
                                    cart?.cartItems?.map((item: any) => {
                                      if (
                                        data?.condition ===
                                          "buys_the_following_items" &&
                                        data?.reward?.rewardType ===
                                          "save_certain_amount"
                                      ) {
                                        const indexes: number[] = [];

                                        const exists = cart?.cartItems
                                          ?.map(
                                            (cartItems: any, ind: number) => {
                                              if (
                                                (cartItems?.isFree ||
                                                  cartItems?.isQtyFree) &&
                                                cartItems?.promotionsData?.some(
                                                  (promoData: any) => {
                                                    return (
                                                      promoData?.id ===
                                                      discounts[
                                                        index - discountLength
                                                      ]._id
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
                                                    discounts[
                                                      index - discountLength
                                                    ]._id
                                                  );
                                                }
                                              );
                                            }
                                          )
                                          .filter((filterOp: any) => filterOp);

                                        console.log(exists, "ASDSADAS");

                                        if (exists?.length > 0) {
                                          delete item.exactTotal;
                                          delete item.exactVat;
                                          delete item.discountedTotal;
                                          delete item.discountedVatAmount;
                                          delete item.promotionsData;

                                          cart.removePromotion(
                                            index - discountLength,
                                            (promotions: any) => {
                                              trigger(
                                                "promotionRemoved",
                                                null,
                                                promotions,
                                                null,
                                                null
                                              );
                                            }
                                          );
                                        }

                                        cart.bulkRemoveFromCart(
                                          indexes,
                                          (removedItems: any) => {
                                            trigger(
                                              "itemRemoved",
                                              null,
                                              removedItems,
                                              null,
                                              null
                                            );
                                          }
                                        );
                                      }
                                      if (
                                        data?.advancedPromotion &&
                                        data?.condition ===
                                          "spends_the_following_amount" &&
                                        data?.reward?.rewardType &&
                                        data?.buy?.target === "product"
                                      ) {
                                        const indexes: number[] = [];

                                        const exists = cart?.cartItems
                                          ?.map(
                                            (cartItems: any, ind: number) => {
                                              if (
                                                (cartItems?.isFree ||
                                                  cartItems?.isQtyFree) &&
                                                cartItems?.promotionsData?.some(
                                                  (promoData: any) => {
                                                    return (
                                                      promoData?.id ===
                                                      discounts[
                                                        index - discountLength
                                                      ]._id
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
                                                    discounts[
                                                      index - discountLength
                                                    ]._id
                                                  );
                                                }
                                              );
                                            }
                                          )
                                          .filter((filterOp: any) => filterOp);

                                        if (exists?.length === 1) {
                                          delete item.exactTotal;
                                          delete item.exactVat;
                                          delete item.discountedTotal;
                                          delete item.discountedVatAmount;
                                          delete item.promotionsData;
                                          cart.removePromotion(
                                            index - discountLength,
                                            (promotions: any) => {
                                              trigger(
                                                "promotionRemoved",
                                                null,
                                                promotions,
                                                null,
                                                null
                                              );
                                            }
                                          );
                                        }

                                        cart.bulkRemoveFromCart(
                                          indexes,
                                          (removedItems: any) => {
                                            trigger(
                                              "itemRemoved",
                                              null,
                                              removedItems,
                                              null,
                                              null
                                            );
                                          }
                                        );
                                      }
                                      // if (
                                      //   data?.advancedPromotion &&
                                      //   data?.condition ===
                                      //     "spends_the_following_amount" &&
                                      //   data?.reward?.rewardType ===
                                      //     "save_certain_amount" &&
                                      //   data?.reward?.saveOn ===
                                      //     "off_the_entire_sale" &&
                                      //   (data?.buyProductSkus?.length > 0 ||
                                      //     data?.buy?.categoryRefs?.length > 0)
                                      // ) {
                                      //   delete item.exactTotal;
                                      //   delete item.exactVat;
                                      //   delete item.discountedTotal;
                                      //   delete item.discountedVatAmount;
                                      //   delete item.promotionsData;

                                      //   const exists = cart?.cartItems
                                      //     ?.map((cartItems: any) => {
                                      //       return cartItems?.promotionsData?.some(
                                      //         (promoData: any) => {
                                      //           return (
                                      //             promoData?.id ===
                                      //             discounts[
                                      //               index - discountLength
                                      //             ]._id
                                      //           );
                                      //         }
                                      //       );
                                      //     })
                                      //     .filter((filterOp: any) => filterOp);

                                      //   if (exists?.length <= 0) {
                                      //     cart.removePromotion(
                                      //       index,
                                      //       (promotions: any) => {
                                      //         trigger(
                                      //           "promotionRemoved",
                                      //           null,
                                      //           promotions,
                                      //           null,
                                      //           null
                                      //         );
                                      //       }
                                      //     );
                                      //   }
                                      // }

                                      if (
                                        data?.promotionType === "advance" &&
                                        data?.condition ===
                                          "buys_the_following_items" &&
                                        data?.reward?.rewardType ===
                                          "get_the_following_items" &&
                                        data?.reward?.discountType !== "free" &&
                                        data?.buy?.productRefs?.length <= 0 &&
                                        data?.buy?.categoryRefs?.length <= 0
                                      ) {
                                        const indexes: number[] = [];

                                        const exists = cart?.cartItems
                                          ?.map(
                                            (cartItems: any, ind: number) => {
                                              if (
                                                (cartItems?.isFree ||
                                                  cartItems?.isQtyFree) &&
                                                cartItems?.promotionsData?.some(
                                                  (promoData: any) => {
                                                    return (
                                                      promoData?.id ===
                                                      discounts[
                                                        index - discountLength
                                                      ]._id
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
                                                    discounts[
                                                      index - discountLength
                                                    ]._id
                                                  );
                                                }
                                              );
                                            }
                                          )
                                          .filter((filterOp: any) => filterOp);

                                        if (exists?.length === 1) {
                                          delete item.exactTotal;
                                          delete item.exactVat;
                                          delete item.discountedTotal;
                                          delete item.discountedVatAmount;
                                          delete item.promotionsData;
                                          cart.removePromotion(
                                            index - discountLength,
                                            (promotions: any) => {
                                              trigger(
                                                "promotionRemoved",
                                                null,
                                                promotions,
                                                null,
                                                null
                                              );
                                            }
                                          );
                                        }

                                        cart.bulkRemoveFromCart(
                                          indexes,
                                          (removedItems: any) => {
                                            trigger(
                                              "itemRemoved",
                                              null,
                                              removedItems,
                                              null,
                                              null
                                            );
                                          }
                                        );
                                      }

                                      if (
                                        data?.promotionType === "advance" &&
                                        data?.condition ===
                                          "buys_the_following_items" &&
                                        data?.reward?.rewardType ===
                                          "get_the_following_items" &&
                                        data?.reward?.discountType !== "free" &&
                                        (data?.buy?.productRefs?.length > 0 ||
                                          data?.buy?.categoryRefs?.length > 0)
                                      ) {
                                        const indexes: number[] = [];

                                        const exists = cart?.cartItems
                                          ?.map(
                                            (cartItems: any, ind: number) => {
                                              if (
                                                (cartItems?.isFree ||
                                                  cartItems?.isQtyFree) &&
                                                cartItems?.promotionsData?.some(
                                                  (promoData: any) => {
                                                    return (
                                                      promoData?.id ===
                                                      discounts[
                                                        index - discountLength
                                                      ]._id
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
                                                    discounts[
                                                      index - discountLength
                                                    ]._id
                                                  );
                                                }
                                              );
                                            }
                                          )
                                          .filter((filterOp: any) => filterOp);

                                        if (exists?.length === 1) {
                                          delete item.exactTotal;
                                          delete item.exactVat;
                                          delete item.discountedTotal;
                                          delete item.discountedVatAmount;
                                          delete item.promotionsData;
                                          cart.removePromotion(
                                            index - discountLength,
                                            (promotions: any) => {
                                              trigger(
                                                "promotionRemoved",
                                                null,
                                                promotions,
                                                null,
                                                null
                                              );
                                            }
                                          );
                                        }

                                        cart.bulkRemoveFromCart(
                                          indexes,
                                          (removedItems: any) => {
                                            trigger(
                                              "itemRemoved",
                                              null,
                                              removedItems,
                                              null,
                                              null
                                            );
                                          }
                                        );
                                      }

                                      if (
                                        data?.promotionType === "advance" &&
                                        data?.condition ===
                                          "buys_the_following_items" &&
                                        data?.reward?.rewardType ===
                                          "get_the_following_items" &&
                                        data?.reward?.discountType === "free" &&
                                        data?.buy?.target === "category" &&
                                        data?.buy?.categoryRefs?.length > 0 &&
                                        data?.buy?.categoryRefs.includes(
                                          item.categoryRef
                                        )
                                      ) {
                                        const indexes: number[] = [];

                                        const exists = cart?.cartItems
                                          ?.map(
                                            (cartItems: any, ind: number) => {
                                              if (
                                                (cartItems?.isFree ||
                                                  cartItems?.isQtyFree) &&
                                                cartItems?.promotionsData?.some(
                                                  (promoData: any) => {
                                                    return (
                                                      promoData?.id ===
                                                      discounts[
                                                        index - discountLength
                                                      ]._id
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
                                                    discounts[
                                                      index - discountLength
                                                    ]._id
                                                  );
                                                }
                                              );
                                            }
                                          )
                                          .filter((filterOp: any) => filterOp);

                                        console.log(exists, "EXUSTS");

                                        if (exists?.length === 1) {
                                          delete item.exactTotal;
                                          delete item.exactVat;
                                          delete item.discountedTotal;
                                          delete item.discountedVatAmount;
                                          delete item.promotionsData;
                                          cart.removePromotion(
                                            index - discountLength,
                                            (promotions: any) => {
                                              trigger(
                                                "promotionRemoved",
                                                null,
                                                promotions,
                                                null,
                                                null
                                              );
                                            }
                                          );
                                        }

                                        cart.bulkRemoveFromCart(
                                          indexes,
                                          (removedItems: any) => {
                                            trigger(
                                              "itemRemoved",
                                              null,
                                              removedItems,
                                              null,
                                              null
                                            );
                                          }
                                        );
                                      }

                                      if (
                                        data?.promotionType === "advance" &&
                                        data?.condition ===
                                          "buys_the_following_items" &&
                                        data?.reward?.rewardType ===
                                          "get_the_following_items" &&
                                        data?.reward?.discountType === "free" &&
                                        data?.buy?.target === "product" &&
                                        data?.buy?.productRefs?.length > 0 &&
                                        data?.buyProductSkus.includes(item.sku)
                                      ) {
                                        const indexes: number[] = [];

                                        const exists = cart?.cartItems
                                          ?.map(
                                            (cartItems: any, ind: number) => {
                                              if (
                                                (cartItems?.isFree ||
                                                  cartItems?.isQtyFree) &&
                                                cartItems?.promotionsData?.some(
                                                  (promoData: any) => {
                                                    return (
                                                      promoData?.id ===
                                                      discounts[
                                                        index - discountLength
                                                      ]._id
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
                                                    discounts[
                                                      index - discountLength
                                                    ]._id
                                                  );
                                                }
                                              );
                                            }
                                          )
                                          .filter((filterOp: any) => filterOp);

                                        if (exists?.length === 1) {
                                          delete item.exactTotal;
                                          delete item.exactVat;
                                          delete item.discountedTotal;
                                          delete item.discountedVatAmount;
                                          delete item.promotionsData;
                                          cart.removePromotion(
                                            index - discountLength,
                                            (promotions: any) => {
                                              trigger(
                                                "promotionRemoved",
                                                null,
                                                promotions,
                                                null,
                                                null
                                              );
                                            }
                                          );
                                        }

                                        cart.bulkRemoveFromCart(
                                          indexes,
                                          (removedItems: any) => {
                                            trigger(
                                              "itemRemoved",
                                              null,
                                              removedItems,
                                              null,
                                              null
                                            );
                                          }
                                        );
                                      }

                                      if (
                                        data?.promotionType === "advance" &&
                                        data?.condition ===
                                          "buys_the_following_items" &&
                                        data?.reward?.rewardType ===
                                          "get_the_following_items" &&
                                        data?.reward?.discountType === "free" &&
                                        data?.buy?.productRefs?.length <= 0 &&
                                        data?.buy?.categoryRefs?.length <= 0
                                      ) {
                                        const indexes: number[] = [];

                                        const exists = cart?.cartItems
                                          ?.map(
                                            (cartItems: any, ind: number) => {
                                              if (
                                                (cartItems?.isFree ||
                                                  cartItems?.isQtyFree) &&
                                                cartItems?.promotionsData?.some(
                                                  (promoData: any) => {
                                                    return (
                                                      promoData?.id ===
                                                      discounts[
                                                        index - discountLength
                                                      ]._id
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
                                                    discounts[
                                                      index - discountLength
                                                    ]._id
                                                  );
                                                }
                                              );
                                            }
                                          )
                                          .filter((filterOp: any) => filterOp);

                                        if (exists?.length === 1) {
                                          delete item.exactTotal;
                                          delete item.exactVat;
                                          delete item.discountedTotal;
                                          delete item.discountedVatAmount;
                                          delete item.promotionsData;
                                          cart.removePromotion(
                                            index - discountLength,
                                            (promotions: any) => {
                                              trigger(
                                                "promotionRemoved",
                                                null,
                                                promotions,
                                                null,
                                                null
                                              );
                                            }
                                          );
                                        }

                                        cart.bulkRemoveFromCart(
                                          indexes,
                                          (removedItems: any) => {
                                            trigger(
                                              "itemRemoved",
                                              null,
                                              removedItems,
                                              null,
                                              null
                                            );
                                          }
                                        );
                                      }

                                      if (
                                        data?.promotionType === "advance" &&
                                        data?.condition ===
                                          "spends_the_following_amount" &&
                                        data?.reward?.rewardType ===
                                          "get_the_following_items" &&
                                        data?.reward?.discountType === "free" &&
                                        data?.buy?.productRefs?.length <= 0 &&
                                        data?.buy?.categoryRefs?.length <= 0
                                      ) {
                                        const indexes: number[] = [];

                                        const exists = cart?.cartItems
                                          ?.map(
                                            (cartItems: any, ind: number) => {
                                              if (
                                                (cartItems?.isFree ||
                                                  cartItems?.isQtyFree) &&
                                                cartItems?.promotionsData?.some(
                                                  (promoData: any) => {
                                                    return (
                                                      promoData?.id ===
                                                      discounts[
                                                        index - discountLength
                                                      ]._id
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
                                                    discounts[
                                                      index - discountLength
                                                    ]._id
                                                  );
                                                }
                                              );
                                            }
                                          )
                                          .filter((filterOp: any) => filterOp);

                                        if (exists?.length === 1) {
                                          delete item.exactTotal;
                                          delete item.exactVat;
                                          delete item.discountedTotal;
                                          delete item.discountedVatAmount;
                                          delete item.promotionsData;
                                          cart.removePromotion(
                                            index - discountLength,
                                            (promotions: any) => {
                                              trigger(
                                                "promotionRemoved",
                                                null,
                                                promotions,
                                                null,
                                                null
                                              );
                                            }
                                          );
                                        }

                                        cart.bulkRemoveFromCart(
                                          indexes,
                                          (removedItems: any) => {
                                            trigger(
                                              "itemRemoved",
                                              null,
                                              removedItems,
                                              null,
                                              null
                                            );
                                          }
                                        );
                                      }

                                      if (
                                        data?.promotionType === "advance" &&
                                        data?.condition ===
                                          "spends_the_following_amount" &&
                                        data?.reward?.rewardType ===
                                          "get_the_following_items" &&
                                        data?.reward?.discountType !== "free" &&
                                        data?.buy?.productRefs?.length <= 0 &&
                                        data?.buy?.categoryRefs?.length <= 0
                                      ) {
                                        const indexes: number[] = [];

                                        const exists = cart?.cartItems
                                          ?.map(
                                            (cartItems: any, ind: number) => {
                                              if (
                                                (cartItems?.isFree ||
                                                  cartItems?.isQtyFree) &&
                                                cartItems?.promotionsData?.some(
                                                  (promoData: any) => {
                                                    return (
                                                      promoData?.id ===
                                                      discounts[
                                                        index - discountLength
                                                      ]._id
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
                                                    discounts[
                                                      index - discountLength
                                                    ]._id
                                                  );
                                                }
                                              );
                                            }
                                          )
                                          .filter((filterOp: any) => filterOp);

                                        if (exists?.length === 1) {
                                          delete item.exactTotal;
                                          delete item.exactVat;
                                          delete item.discountedTotal;
                                          delete item.discountedVatAmount;
                                          delete item.promotionsData;
                                          cart.removePromotion(
                                            index - discountLength,
                                            (promotions: any) => {
                                              trigger(
                                                "promotionRemoved",
                                                null,
                                                promotions,
                                                null,
                                                null
                                              );
                                            }
                                          );
                                        }

                                        cart.bulkRemoveFromCart(
                                          indexes,
                                          (removedItems: any) => {
                                            trigger(
                                              "itemRemoved",
                                              null,
                                              removedItems,
                                              null,
                                              null
                                            );
                                          }
                                        );
                                      }

                                      if (
                                        data?.promotionType === "advance" &&
                                        data?.condition ===
                                          "spends_the_following_amount" &&
                                        data?.reward?.rewardType ===
                                          "get_the_following_items" &&
                                        data?.reward?.discountType !== "free" &&
                                        (data?.buy?.productRefs?.length > 0 ||
                                          data?.buy?.categoryRefs?.length > 0)
                                      ) {
                                        const indexes: number[] = [];

                                        const exists = cart?.cartItems
                                          ?.map(
                                            (cartItems: any, ind: number) => {
                                              if (
                                                (cartItems?.isFree ||
                                                  cartItems?.isQtyFree) &&
                                                cartItems?.promotionsData?.some(
                                                  (promoData: any) => {
                                                    return (
                                                      promoData?.id ===
                                                      discounts[
                                                        index - discountLength
                                                      ]._id
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
                                                    discounts[
                                                      index - discountLength
                                                    ]._id
                                                  );
                                                }
                                              );
                                            }
                                          )
                                          .filter((filterOp: any) => filterOp);

                                        if (exists?.length === 1) {
                                          delete item.exactTotal;
                                          delete item.exactVat;
                                          delete item.discountedTotal;
                                          delete item.discountedVatAmount;
                                          delete item.promotionsData;
                                          cart.removePromotion(
                                            index - discountLength,
                                            (promotions: any) => {
                                              trigger(
                                                "promotionRemoved",
                                                null,
                                                promotions,
                                                null,
                                                null
                                              );
                                            }
                                          );
                                        }

                                        cart.bulkRemoveFromCart(
                                          indexes,
                                          (removedItems: any) => {
                                            trigger(
                                              "itemRemoved",
                                              null,
                                              removedItems,
                                              null,
                                              null
                                            );
                                          }
                                        );
                                      }

                                      if (
                                        data?.promotionType === "advance" &&
                                        data?.condition ===
                                          "buys_the_following_items" &&
                                        data?.reward?.rewardType ===
                                          "save_certain_amount" &&
                                        data?.buy?.productRefs?.length <= 0 &&
                                        data?.buy?.categoryRefs?.length <= 0
                                      ) {
                                        const indexes: number[] = [];

                                        const exists = cart?.cartItems
                                          ?.map(
                                            (cartItems: any, ind: number) => {
                                              if (
                                                (cartItems?.isFree ||
                                                  cartItems?.isQtyFree) &&
                                                cartItems?.promotionsData?.some(
                                                  (promoData: any) => {
                                                    return (
                                                      promoData?.id ===
                                                      discounts[
                                                        index - discountLength
                                                      ]._id
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
                                                    discounts[
                                                      index - discountLength
                                                    ]._id
                                                  );
                                                }
                                              );
                                            }
                                          )
                                          .filter((filterOp: any) => filterOp);

                                        if (exists?.length === 1) {
                                          delete item.exactTotal;
                                          delete item.exactVat;
                                          delete item.discountedTotal;
                                          delete item.discountedVatAmount;
                                          delete item.promotionsData;
                                          cart.removePromotion(
                                            index - discountLength,
                                            (promotions: any) => {
                                              trigger(
                                                "promotionRemoved",
                                                null,
                                                promotions,
                                                null,
                                                null
                                              );
                                            }
                                          );
                                        }

                                        cart.bulkRemoveFromCart(
                                          indexes,
                                          (removedItems: any) => {
                                            trigger(
                                              "itemRemoved",
                                              null,
                                              removedItems,
                                              null,
                                              null
                                            );
                                          }
                                        );
                                      }
                                    });
                                  }

                                  if (
                                    data?.type &&
                                    data?.type === "promotion" &&
                                    !data?.advancedPromotion
                                  ) {
                                    const discount = discounts[index];

                                    if (
                                      discount?.promotionTargetIds?.length !== 0
                                    ) {
                                      cart.cartItems.map((item: any) => {
                                        if (
                                          discount.productSkus.includes(
                                            item.sku
                                          )
                                        ) {
                                          if (
                                            item?.promotionsData?.length > 0
                                          ) {
                                            const filteredPromotionsData =
                                              item?.promotionsData?.filter(
                                                (promo: any) =>
                                                  promo?.id !== discount?._id
                                              );

                                            item.promotionsData = [
                                              ...filteredPromotionsData,
                                            ];
                                          }
                                          delete item.exactTotal;
                                          delete item.exactVat;
                                          delete item.discountedTotal;
                                          delete item.discountedVatAmount;
                                          delete item.promotionsData;
                                        }
                                        if (
                                          discount.promotionTargetIds.includes(
                                            item.categoryRef
                                          )
                                        ) {
                                          const filteredPromotionsData =
                                            item?.promotionsData?.filter(
                                              (promo: any) =>
                                                promo?.id === discount?._id
                                            );

                                          if (
                                            filteredPromotionsData?.length > 0
                                          ) {
                                            item.promotionsData = [
                                              ...filteredPromotionsData,
                                            ];
                                          }
                                          delete item.exactTotal;
                                          delete item.exactVat;
                                          delete item.discountedTotal;
                                          delete item.discountedVatAmount;
                                        }
                                      });
                                      if (discount?.type === "promotion") {
                                        cart.cartItems.map((item: any) => {
                                          if (
                                            item?.promotionsData?.length > 0
                                          ) {
                                            const filteredPromotionsData =
                                              item?.promotionsData?.filter(
                                                (promo: any) =>
                                                  promo?.id !== discount?._id
                                              );

                                            item.promotionsData = [
                                              ...filteredPromotionsData,
                                            ];
                                          }
                                        });
                                      }
                                      cart.removePromotion(
                                        index - discountLength,
                                        (promotions: any) => {
                                          trigger(
                                            "promotionRemoved",
                                            null,
                                            promotions,
                                            null,
                                            null
                                          );
                                        }
                                      );
                                    } else {
                                      cart.cartItems.map((item: any) => {
                                        if (item?.promotionsData?.length > 0) {
                                          const filteredPromotionsData =
                                            item?.promotionsData?.filter(
                                              (promo: any) =>
                                                promo?.id !== discount?._id
                                            );

                                          item.promotionsData = [
                                            ...filteredPromotionsData,
                                          ];
                                        }
                                      });
                                      cart.removePromotion(
                                        index - discountLength,
                                        (promotions: any) => {
                                          trigger(
                                            "promotionRemoved",
                                            null,
                                            promotions,
                                            null,
                                            null
                                          );
                                        }
                                      );
                                    }
                                  } else {
                                    cart.removeDiscount(
                                      index,
                                      (discounts: any) => {
                                        trigger(
                                          "discountRemoved",
                                          null,
                                          discounts,
                                          null,
                                          null
                                        );
                                      }
                                    );
                                  }
                                }}
                                sx={{
                                  p: 1,
                                  borderRadius: 50,
                                  minWidth: "auto",
                                }}
                              >
                                <SvgIcon
                                  color={"error"}
                                  fontSize="medium"
                                  sx={{
                                    m: "auto",
                                    cursor: "pointer",
                                  }}
                                >
                                  <RemoveCircleIcon />
                                </SvgIcon>
                              </Button>
                            </TableCell>
                          </TableRow>
                        </>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        style={{
                          textAlign: "center",
                          borderBottom: "none",
                        }}
                      >
                        <Box sx={{ mt: 10, mb: 6 }}>
                          <NoDataAnimation
                            text={
                              <Typography
                                variant="h6"
                                textAlign="center"
                                sx={{ mt: 5 }}
                              >
                                {t("No Applied Discounts!")}
                              </Typography>
                            }
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
        </Dialog>
      </Box>
    </>
  );
};
