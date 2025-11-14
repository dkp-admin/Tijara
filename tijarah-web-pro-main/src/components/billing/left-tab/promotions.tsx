import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";

import {
  Button,
  CircularProgress,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { t } from "i18next";
import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Scrollbar } from "src/components/scrollbar";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import useItems from "src/hooks/use-items";
import useCartStore from "src/store/cart-item";
import cart from "src/utils/cart";
import { checkPromotionValidity } from "src/utils/check-promotion-validity";
import { trigger } from "src/utils/custom-event";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { endOfDay, startOfDay } from "date-fns";
import { useCurrency } from "src/utils/useCurrency";

function formatDiscountDetails(discountData: any) {
  const {
    code,
    type,
    status,
    company,
    createdAt,
    updatedAt,
    _id,
    target,
    offer,
    name,
    schedule,
    expiry,
    buy,
    reward,
  } = discountData;

  const formattedDiscount = {
    code: code.type === "no_code" ? name : code.code,
    name,
    discount:
      type?.type === "basic" ? type?.discountValue : reward?.discountValue,
    company: company.name,
    status,
    expiry: expiry?.expiryTo
      ? new Date(type?.expiryTo).toISOString()
      : "No expiration date",
    createdAt: new Date(createdAt).toISOString(),
    updatedAt: new Date(updatedAt).toISOString(),
    discountType:
      type?.type === "basic" ? type?.discountType : reward?.discountType,
    promotionTargetType: type.promotionTargetType,
    productSkus:
      type?.type === "basic"
        ? type.promotionTargetType === "product"
          ? type.products.map((prod: any) => prod.variant.sku)
          : []
        : type.promotionTargetType === "product"
        ? buy.products.map((prod: any) => prod.variant.sku)
        : [],
    promotionTargetIds:
      type?.type === "basic"
        ? type.promotionTargetType === "product"
          ? type.productRefs
          : type.promotionTargetType === "category"
          ? type.categoryRefs
          : []
        : buy.target === "product"
        ? buy.productRefs
        : buy.target === "category"
        ? buy.categoryRefs
        : [],
    type: "promotion",
    _id,
    target,
    offer,
    schedule,
    buy,
    reward,
    promotionType: type?.type,
    condition: type?.condition,
    advancedPromotion: type?.type === "advance",
    buyProductSkus:
      buy?.target === "product"
        ? buy.products.map((prod: any) => prod.variant.sku)
        : [],
  };

  return formattedDiscount;
}
interface PromotionsTabBillingProps {
  companyRef: string;
  locationRef: string;
}

const PromotionsTabBilling: FC<PromotionsTabBillingProps> = (props) => {
  const { companyRef } = props;

  const currency = useCurrency();

  const { entities: promotions, find, loading } = useEntity("promotion/pos");

  const [isApplying, setIsApplying] = useState(false);

  const { device } = useAuth();

  const { promotionsApplied, totalAmount, totalItem } = useItems();

  const { customer } = useCartStore() as any;

  const checkPromotionApplicable = async (promotionData: any) => {
    const data = formatDiscountDetails(promotionData) as any;

    const idx = promotionsApplied.findIndex((dis: any) => dis._id == data._id);

    if (idx !== -1) {
      toast.error(t("Promotion already applied"));
      setIsApplying(false);
      return;
    }

    const [isValid] = await Promise.all([
      checkPromotionValidity(
        data,
        customer,
        companyRef,
        device?.locationRef,
        totalAmount
      ),
    ]);

    if (!isValid) {
      toast.error("Promotion not applicable");
      setIsApplying(false);

      return;
    }

    cart?.cartItems?.map((item: any) => {
      let totalPromotionDiscount = 0;
      if (
        data?.promotionType === "advance" &&
        data?.condition === "buys_the_following_items" &&
        data?.reward?.rewardType === "save_certain_amount" &&
        data?.buy?.productRefs?.length <= 0 &&
        data?.buy?.categoryRefs?.length <= 0
      ) {
        if (data?.discountType === "percent") {
          let totalAmountToConsider =
            true && data?.type === "promotion" && item?.modifiers?.length > 0
              ? item?.total
              : item?.total;

          // minus  - cartData.totalModifierAmount

          const totalVatAmountToConsider =
            true && data?.type === "promotion" && item?.modifiers?.length > 0
              ? item.vatAmount
              : item.vatAmount;

          const discountAmount = (totalAmountToConsider * data.discount) / 100;

          totalPromotionDiscount += discountAmount;
        } else {
          let totalAmountToConsider =
            true && data?.type === "promotion" && item?.modifiers?.length > 0
              ? item.total
              : item.total;

          const specificLength = totalItem;

          const fixedPercentage =
            Number((data?.discount * 100) / totalAmountToConsider) /
            specificLength;

          const discountAmount =
            (totalAmountToConsider * fixedPercentage) / 100;

          totalPromotionDiscount += discountAmount;
        }

        const fixedPercentage =
          data?.discountType === "amount"
            ? (Number(data?.discount / item?.total) * 100) / totalItem
            : Number((data?.discount / 100) * item?.total);

        const discountAmount = (item.total * fixedPercentage) / 100;

        if (discountAmount > item?.total) {
          localStorage.setItem("blockedPromotion", data?._id);
        }
      }
    });

    const blockedPromotion = localStorage.getItem("blockedPromotion");

    if (blockedPromotion) {
      localStorage.setItem("blockedPromotion", "");
      toast.error("Promotion not applicable");
      setIsApplying(false);

      return;
    }

    if (
      data?.buy?.spendAmount <= data?.discount &&
      data?.condition === "spends_the_following_amount"
    ) {
      toast.error("Promotion not applicable");
      setIsApplying(false);

      return;
    }

    let discount = 0;

    const amountToConsider = true ? totalAmount : totalAmount;

    //minus the modifier amount

    if (data.discountType === "percent") {
      const discountAmount = (amountToConsider * Number(data.discount)) / 100;
      discount = Number(discountAmount);
    } else if (data.discountType === "amount") {
      const percentAmount = (data.discount / amountToConsider) * 100;
      discount = (amountToConsider * Number(percentAmount)) / 100;
    }

    if (
      discount > data?.offer?.budget &&
      data?.offer?.type === "budget" &&
      data?.offer?.budgetType !== "unlimited"
    ) {
      const indexes: number[] = [];
      cart?.cartItems?.map((item: any, index: number) => {
        item?.promotionsData?.map((promoData: any) => {
          if (promoData?.id === data?._id) {
            delete item.exactTotal;
            delete item.exactVat;
            delete item.discountedTotal;
            delete item.discountedVatAmount;
            delete item.promotionsData;
            if (item?.isFree || item?.isQtyFree) {
              indexes.push(index);
            }
          }
        });
      });

      cart?.bulkRemoveFromCart(indexes, (updatedItems: any) => {
        trigger("itemRemoved", null, updatedItems, null, null);
      });

      toast.error("Promotion not applicable");
      setIsApplying(false);

      return;
    }

    if (
      data?.offer?.type === "offer" &&
      data?.offer?.offer <= 0 &&
      data?.offer?.budgetType !== "unlimited"
    ) {
      const indexes: number[] = [];
      cart?.cartItems?.map((item: any, index: number) => {
        item?.promotionsData?.map((promoData: any) => {
          if (promoData?.id === data?._id) {
            delete item.exactTotal;
            delete item.exactVat;
            delete item.discountedTotal;
            delete item.discountedVatAmount;
            delete item.promotionsData;
            if (item?.isFree || item?.isQtyFree) {
              indexes.push(index);
            }
          }
        });
      });

      cart?.bulkRemoveFromCart(indexes, (updatedItems: any) => {
        trigger("itemRemoved", null, updatedItems, null, null);
      });

      toast.error(`Promotion not applicable`);
      setIsApplying(false);

      return;
    }

    if (discount < totalAmount) {
      const idx = promotionsApplied.findIndex(
        (dis: any) => dis._id == data._id
      );

      if (idx === -1) {
        if (cart.cartItems.length >= 0) {
          cart.applyPromotion(data, (promotions: any) => {
            trigger("promotionApplied", null, promotions, null, null);
          });
          setIsApplying(false);
        }
      } else {
        setIsApplying(false);

        toast.error(t("Promotion already applied"));
      }
    } else {
      setIsApplying(false);

      toast.error(t("Promotion amount must be less than total amount"));
    }
  };

  useEffect(() => {
    find({
      page: 0,
      sort: "asc",
      activeTab: "active",
      limit: 100,
      _q: "",
      companyRef: companyRef,
      locationRef: device?.locationRef,
      startOfDay: startOfDay(new Date()),
      endOfDay: endOfDay(new Date()),
      showAdvancedPromo: true,
    });
  }, [companyRef]);

  const getPromotionDetails = (promotion: any) => {
    return `Applied on: ${
      promotion?.type?.type === "advance" &&
      promotion?.type?.condition === "buys_the_following_items"
        ? `${
            promotion?.buy?.products?.length > 0
              ? `${promotion?.buy?.products
                  ?.map((pro: any) => pro?.name?.en)
                  .join(",")}`
              : promotion?.buy?.categoryRefs?.length > 0
              ? `${promotion?.buy?.category
                  ?.map((pro: any) => pro?.name?.en)
                  .join(",")}`
              : "Order"
          }, ${
            promotion?.buy?.buyType === "quantity"
              ? `Minimum Quanity: ${promotion?.buy?.quantity}`
              : `Minimum Quantity: ${promotion?.buy?.min} - Maximum Quantity: ${promotion?.buy?.max}`
          }${
            promotion?.reward?.rewardType === "save_certain_amount"
              ? `, Save ${
                  promotion?.reward?.discountType === "amount"
                    ? `${currency} ${promotion?.reward?.discountValue}`
                    : `${promotion?.reward?.discountValue}%`
                } amount ${
                  promotion?.reward?.saveOn === "off_the_entire_sale"
                    ? "on the sale"
                    : "on the items above."
                }`
              : ``
          } ${
            promotion?.reward?.rewardType === "get_the_following_items"
              ? `, Get ${promotion?.reward?.products
                  ?.map((pro: any) => pro?.name?.en)
                  .join(",")}`
              : ``
          }${
            promotion?.reward?.rewardType === "get_the_following_items"
              ? ` for ${
                  promotion?.reward?.discountType === "free"
                    ? "free"
                    : promotion?.reward?.discountType === "amount"
                    ? `${currency} ${promotion?.reward?.discountValue} off`
                    : `${promotion?.reward?.discountValue}% off`
                }`
              : ``
          }`
        : `${
            promotion?.buy?.products?.length > 0
              ? `${promotion?.buy?.products
                  ?.map((pro: any) => pro?.name?.en)
                  .join(",")}`
              : promotion?.buy?.categoryRefs?.length > 0
              ? `${promotion?.buy?.category
                  ?.map((pro: any) => pro?.name?.en)
                  .join(",")}`
              : "Order"
          }, Minimum Spend: ${currency} ${toFixedNumber(
            promotion?.buy?.spendAmount
          )}${
            promotion?.reward?.rewardType === "save_certain_amount"
              ? `, Save ${
                  promotion?.reward?.discountType === "amount"
                    ? `${currency} ${promotion?.reward?.discountValue}`
                    : `${promotion?.reward?.discountValue}%`
                } amount ${
                  promotion?.reward?.saveOn === "off_the_entire_sale"
                    ? "on the sale"
                    : "on the items above."
                }`
              : ``
          } ${
            promotion?.reward?.rewardType === "get_the_following_items"
              ? `, Get ${promotion?.reward?.products
                  ?.map((pro: any) => pro?.name?.en)
                  .join(",")}`
              : ``
          }${
            promotion?.reward?.rewardType === "get_the_following_items"
              ? ` for ${
                  promotion?.reward?.discountType === "free"
                    ? "free"
                    : promotion?.reward?.discountType === "amount"
                    ? `${currency} ${promotion?.reward?.discountValue} off`
                    : `${promotion?.reward?.discountValue}% off`
                }`
              : ``
          }`
    } `;
  };

  return (
    <Box sx={{ p: 0 }}>
      <Scrollbar sx={{ maxHeight: "calc(100vh - 280px)" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("Promotion Name")}</TableCell>
                <TableCell>{t("Code")}</TableCell>
                {/* <TableCell>{t("Promotion Value")}</TableCell> */}
                <TableCell>{t("Expiry")}</TableCell>
                {/* <TableCell>{t("Info")}</TableCell> */}
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    style={{ textAlign: "center", borderBottom: "none" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        width: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "450px",
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                promotions.results &&
                (promotions.results?.length > 0 ? (
                  promotions.results?.map((promotion: any, index: number) => {
                    return (
                      <TableRow key={index} hover>
                        <TableCell
                          sx={{
                            pl: 2.5,
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="subtitle2">
                            {promotion?.name}
                          </Typography>
                          <Box sx={{ mt: 0.7, pl: 1 }}>
                            <Tooltip title={getPromotionDetails(promotion)}>
                              <SvgIcon fontSize="small" color="primary">
                                <InfoCircleIcon />
                              </SvgIcon>
                            </Tooltip>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2">
                            {promotion?.code?.code
                              ? promotion?.code?.code
                              : "-"}
                          </Typography>
                        </TableCell>
                        {/* <TableCell>
                          <Typography variant="subtitle2">
                            {promotion?.type?.discountType === "amount"
                              ? t("${currency} ")
                              : ""}
                            {promotion?.type?.discountValue}
                            {promotion?.type?.discountType === "percent"
                              ? "%"
                              : ""}
                          </Typography>
                        </TableCell> */}
                        <TableCell>
                          <Typography variant="subtitle2">
                            {!promotion?.schedule?.noEndDate
                              ? new Date(
                                  promotion?.schedule?.expiryTo
                                ).toLocaleDateString("en-GB")
                              : "No expiry date"}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Button
                            variant="outlined"
                            disabled={isApplying}
                            onClick={() => {
                              setIsApplying(true);
                              if (cart.cartItems?.length === 0) {
                                toast.error(
                                  t("Please add item in the cart for promotion")
                                );
                                setIsApplying(false);
                                return;
                              }

                              checkPromotionApplicable(promotion);
                            }}
                            sx={{
                              p: 1,
                              borderRadius: 1,
                              minWidth: "auto",
                            }}
                            startIcon={
                              <SvgIcon
                                color={
                                  promotionsApplied.findIndex(
                                    (dis: any) => dis._id == promotion._id
                                  ) !== -1
                                    ? "action"
                                    : "inherit"
                                }
                              >
                                <PlusIcon />
                              </SvgIcon>
                            }
                          >
                            <Typography
                              sx={{
                                color:
                                  promotionsApplied.findIndex(
                                    (dis: any) => dis._id == promotion._id
                                  ) !== -1
                                    ? "grey"
                                    : "inherit",
                              }}
                            >
                              {t("Apply")}
                            </Typography>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      style={{ textAlign: "center", borderBottom: "none" }}
                    >
                      <Box sx={{ mt: 10, mb: 6 }}>
                        <NoDataAnimation
                          text={
                            <Typography
                              variant="h6"
                              textAlign="center"
                              sx={{ mt: 5 }}
                            >
                              {t("No Promotions!")}
                            </Typography>
                          }
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>
    </Box>
  );
};

export default PromotionsTabBilling;
