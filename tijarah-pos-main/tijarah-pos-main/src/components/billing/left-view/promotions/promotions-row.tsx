import { format } from "date-fns";
import React, { useContext, useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { t } from "../../../../../i18n";
import AuthContext from "../../../../context/auth-context";
import { useTheme } from "../../../../context/theme-context";
import useItems from "../../../../hooks/use-items";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import useCartStore from "../../../../store/cart-item";
import { AuthType } from "../../../../types/auth-types";
import cart from "../../../../utils/cart";
import { checkPromotionValidity } from "../../../../utils/check-promotion-validity";
import ICONS from "../../../../utils/icons";
import { debugLog } from "../../../../utils/log-patch";
import ItemDivider from "../../../action-sheet/row-divider";
import DefaultText from "../../../text/Text";
import showToast from "../../../toast";
import PromotionCodeModal from "./promotions-code-modal";
import ToolTip from "../../../tool-tip";
import { EventRegister } from "react-native-event-listeners";
import MMKVDB from "../../../../utils/DB-MMKV";

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
    code: code.code || "-",
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

export default function PromotionsRow({
  data,
  handleOnPress,
}: {
  data: any;
  handleOnPress: any;
}) {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();
  const { promotionsApplied, totalAmount, totalItem } = useItems();
  const [selectedPromotion, setSelectedPromotion] = useState({});
  const [openPromoModal, setOpenPromoModal] = useState<boolean>(false);
  const { customer } = useCartStore() as any;
  const authContext = useContext<AuthType>(AuthContext) as any;

  if (!data) {
    return;
  }

  const checkPromotionApplicable = async (promoData: any) => {
    const promotionData = formatDiscountDetails(promoData) as any;

    const idx = promotionsApplied.findIndex((dis: any) => dis._id == data._id);

    if (idx !== -1) {
      showToast("error", "Promotion already applied");

      return;
    }

    const isValid = await checkPromotionValidity(
      promotionData,
      customer,
      authContext?.user?.companyRef,
      authContext?.user?.locationRef,
      totalAmount
    );

    if (!isValid) {
      showToast("error", "Promotion is not valid");
      return;
    }

    cart?.cartItems?.map((item: any) => {
      let totalPromotionDiscount = 0;

      if (
        promotionData?.promotionType === "advance" &&
        promotionData?.condition === "buys_the_following_items" &&
        promotionData?.reward?.rewardType === "save_certain_amount" &&
        promotionData?.buy?.productRefs?.length <= 0 &&
        promotionData?.buy?.categoryRefs?.length <= 0
      ) {
        if (promotionData?.discountType === "percent") {
          let totalAmountToConsider =
            true &&
            promotionData?.type === "promotion" &&
            item?.modifiers?.length > 0
              ? item?.total
              : item?.total;

          // minus  - cartpromotionData.totalModifierAmount

          const totalVatAmountToConsider =
            true &&
            promotionData?.type === "promotion" &&
            item?.modifiers?.length > 0
              ? item.vatAmount
              : item.vatAmount;

          const discountAmount =
            (totalAmountToConsider * promotionData.discount) / 100;

          totalPromotionDiscount += discountAmount;
        } else {
          let totalAmountToConsider =
            true &&
            promotionData?.type === "promotion" &&
            item?.modifiers?.length > 0
              ? item.total
              : item.total;

          const specificLength = totalItem;

          const fixedPercentage =
            Number((promotionData?.discount * 100) / totalAmountToConsider) /
            specificLength;

          const discountAmount =
            (totalAmountToConsider * fixedPercentage) / 100;

          totalPromotionDiscount += discountAmount;
        }

        const fixedPercentage =
          promotionData?.discountType === "amount"
            ? (Number(promotionData?.discount / item?.total) * 100) / totalItem
            : Number((promotionData?.discount / 100) * item?.total);

        const discountAmount = (item.total * fixedPercentage) / 100;

        if (discountAmount >= item?.total) {
          MMKVDB.set("blockedPromotion", promotionData?._id);
        }
      }
    });

    const blockedPromotion = MMKVDB.get("blockedPromotion");

    if (blockedPromotion) {
      MMKVDB.set("blockedPromotion", "");
      showToast("error", "Promotion not applicable");
      return;
    }

    if (
      promotionData?.buy?.spendAmount <= promotionData?.discount &&
      promotionData?.condition === "spends_the_following_amount"
    ) {
      showToast("error", "Promotion not applicable");
      return;
    }

    let discount = 0;

    if (
      promotionData?.promotionTargetIds?.length > 0 &&
      promotionData?.promotionType === "basic"
    ) {
      if (promotionData.promotionTargetType === "category") {
        const res = cart.cartItems.some((id: any) =>
          promotionData.promotionTargetIds.includes(id.categoryRef)
        );

        cart.cartItems.map((item: any) => {
          if (promotionData.promotionTargetIds.includes(item.categoryRef)) {
            const res = cart.cartItems.some((id: any) =>
              promotionData.promotionTargetIds.includes(id.categoryRef)
            );

            if (!res) {
              return;
            }

            if (promotionData?.discountType === "percent") {
              const discountAmount =
                (item.total * promotionData.discount) / 100;

              const discountedVat =
                (item.vatAmount * promotionData.discount) / 100;

              item.exactTotal = item.total;

              item.exactVat = item.vatAmount;

              item.discountedTotal = item.total - discountAmount;

              item.discountedVatAmount = item.vatAmount - discountedVat;

              item.promotionsData = item.promotionsData || [];
            } else {
              const includedItemslength = cart.cartItems.filter((car: any) =>
                promotionData.promotionTargetIds.includes(car.productRef)
              );

              const includedCategoryLength = [cart.cartItems].filter(
                (car: any) =>
                  promotionData.promotionTargetIds.includes(car.categoryRef)
              );

              const specificLength =
                includedItemslength.length > 0
                  ? includedItemslength.length
                  : includedCategoryLength.length > 0
                  ? includedCategoryLength.length
                  : 1;

              const fixedPercentage =
                Number((promotionData?.discount * 100) / item.total) /
                specificLength;

              const discountAmount = (item.total * fixedPercentage) / 100;

              const discountedVat = (item.vatAmount * fixedPercentage) / 100;

              item.exactTotal = item.total;

              item.exactVat = item.vatAmount;

              item.discountedTotal = item.total - discountAmount;

              item.discountedVatAmount = item.vatAmount - discountedVat;

              item.promotionsData = item.promotionsData || [];
            }
          }
        });

        if (!res) {
          showToast("error", "Promomtion not applicable");
          return false;
        }
      }
      if (promotionData.promotionTargetType === "product") {
        const res = cart.cartItems.some((id: any) =>
          promotionData.productSkus.includes(id.sku)
        );

        cart.cartItems.map((item: any) => {
          if (promotionData.productSkus.includes(item.sku)) {
            const res = cart.cartItems.some((id: any) =>
              promotionData.productSkus.includes(id.sku)
            );

            if (!res) {
              return;
            }

            if (promotionData?.discountType === "percent") {
              const discountAmount =
                (item.total * promotionData.discount) / 100;

              const discountedVat =
                (item.vatAmount * promotionData.discount) / 100;

              item.exactTotal = item.total;

              item.exactVat = item.vatAmount;

              item.discountedTotal = item.total - discountAmount;

              item.discountedVatAmount = item.vatAmount - discountedVat;

              item.promotionsData = item.promotionsData || [];
            } else {
              const includedItemslength = cart.cartItems.filter((car: any) =>
                promotionData.productSkus.includes(car.sku)
              );

              const includedCategoryLength = [cart.cartItems].filter(
                (car: any) =>
                  promotionData.promotionTargetIds.includes(car.categoryRef)
              );

              const specificLength =
                includedItemslength.length > 0
                  ? includedItemslength.length
                  : includedCategoryLength.length > 0
                  ? includedCategoryLength.length
                  : 1;

              const fixedPercentage =
                Number((promotionData?.discount * 100) / item.total) /
                specificLength;

              const discountAmount = (item.total * fixedPercentage) / 100;

              const discountedVat = (item.vatAmount * fixedPercentage) / 100;

              item.exactTotal = item.total;

              item.exactVat = item.vatAmount;

              item.discountedTotal = item.total - discountAmount;

              item.discountedVatAmount = item.vatAmount - discountedVat;

              item.promotionsData = item.promotionsData || [];
            }
          }

          const doc = item?.promotionsData?.find(
            (f: any) => f?.name === promotionData?.code
          );

          if (
            !doc &&
            (promotionData.promotionTargetIds.includes(item.categoryRef) ||
              promotionData.productSkus.includes(item.sku))
          ) {
            const includedItemslength = cart.cartItems.filter((car: any) =>
              promotionData.productSkus.includes(car.sku)
            );

            const includedCategoryLength = [cart.cartItems].filter((car: any) =>
              promotionData.promotionTargetIds.includes(car.categoryRef)
            );

            const specificLength =
              includedItemslength.length > 0
                ? includedItemslength.length
                : includedCategoryLength.length > 0
                ? includedCategoryLength.length
                : 1;

            const fixedPercentage =
              Number((promotionData?.discount * 100) / item.total) /
              specificLength;

            const discountAmount = (item.total * fixedPercentage) / 100;

            item?.promotionsData?.push({
              name: promotionData.code,
              discount:
                promotionData?.discountType == "percent"
                  ? (item.total * promotionData.discount) / 100
                  : discountAmount,
              id: promotionData?._id,
            });
          }
        });

        if (!res) {
          showToast("error", "Promomtion not applicable");
          return;
        }
      }
    }

    if (promotionData.discountType === "percent") {
      const discountAmount =
        (totalAmount * Number(promotionData.discount)) / 100;
      discount = Number(discountAmount);
    } else if (promotionData.discountType === "amount") {
      const percentAmount = (promotionData.discount / totalAmount) * 100;
      discount = (totalAmount * Number(percentAmount)) / 100;
    }

    if (
      discount > promotionData?.offer?.budget &&
      promotionData?.offer?.type === "budget" &&
      promotionData?.offer?.budgetType !== "unlimited"
    ) {
      showToast("error", "Promotion not applicable");
      return;
    }

    if (
      promotionData?.offer?.type === "offer" &&
      promotionData?.offer?.offer <= 0
    ) {
      showToast("error", "Promotion not applicable");
      return;
    }

    if (discount < totalAmount) {
      const idx = promotionsApplied.findIndex(
        (dis: any) => dis._id == promotionData._id
      );

      if (idx === -1) {
        if (cart.cartItems.length >= 0) {
          handleOnPress(promotionData);
        }
      } else {
        showToast("info", t("Promotion already applied"));
      }
    } else {
      const indexes: any = [];
      cart?.cartItems?.map((cartItems: any, ind: number) => {
        if (
          (cartItems?.isFree || cartItems?.isQtyFree) &&
          cartItems?.promotionsData?.some((promoData: any) => {
            return promoData?.id === promotionData._id;
          })
        ) {
          indexes.push(ind);
        }
      });

      cart.bulkRemoveFromCart(indexes, (removedItems: any) => {
        debugLog(
          "Items removed from cart",
          removedItems,
          "cart-context",
          "calculatedPromotionsMethod11"
        );
        EventRegister.emit("itemRemoved", removedItems);
      });

      showToast("info", "Promotion amount must be less than total amount");
    }
  };

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
                    ? `SAR ${promotion?.reward?.discountValue}`
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
                    ? `SAR ${promotion?.reward?.discountValue} off`
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
          }, Minimum Spend: SAR ${Number(promotion?.buy?.spendAmount).toFixed(
            2
          )}${
            promotion?.reward?.rewardType === "save_certain_amount"
              ? `, Save ${
                  promotion?.reward?.discountType === "amount"
                    ? `SAR ${promotion?.reward?.discountValue}`
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
                    ? `SAR ${promotion?.reward?.discountValue} off`
                    : `${promotion?.reward?.discountValue}% off`
                }`
              : ``
          }`
    } `;
  };

  return (
    <>
      <View
        style={{
          paddingVertical: hp("1.75%"),
          paddingHorizontal: hp("3%"),
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <DefaultText
          style={{
            width: "15%",
            marginRight: "2%",
          }}
          fontSize={"lg"}
          fontWeight="normal"
        >
          {data?.name}
        </DefaultText>
        <TouchableOpacity>
          <ToolTip infoMsg={getPromotionDetails(data)} />
        </TouchableOpacity>

        <DefaultText
          style={{
            width: "30%",
            marginRight: "2%",
            textAlign: "right",
          }}
          fontSize={"lg"}
          fontWeight="normal"
        >
          {data?.code?.code || "-"}
        </DefaultText>

        <DefaultText
          style={{
            width: "22%",
            marginRight: "2%",
            textAlign: "right",
          }}
          fontSize={"lg"}
          fontWeight="normal"
        >
          {data?.schedule?.noEndDate
            ? "No Expiry"
            : format(new Date(data?.schedule?.expiryTo), "dd/MM/yyyy")}
        </DefaultText>

        <TouchableOpacity
          style={{
            width: "23%",
            marginLeft: twoPaneView ? "0%" : "1.5%",
            alignItems: "flex-end",
          }}
          onPress={() => {
            if (cart.cartItems?.length === 0) {
              debugLog(
                "Please add item in the cart for discount",
                cart.cartItems,
                "billing-screen",
                "handleAddPromotionButton"
              );
              showToast("info", t("Please add item in the cart for promotion"));
              return;
            }

            checkPromotionApplicable(data);
          }}
        >
          <ICONS.AddCircleIcon
            color={
              promotionsApplied.findIndex((dis: any) => dis._id == data._id) !==
              -1
                ? theme.colors.otherGrey[200]
                : theme.colors.primary[1000]
            }
          />
        </TouchableOpacity>
      </View>

      <ItemDivider
        style={{
          margin: 0,
          borderWidth: 0,
          borderBottomWidth: 1,
          borderColor: "#E5E9EC",
        }}
      />
      {selectedPromotion && (
        <PromotionCodeModal
          visible={openPromoModal}
          handleClose={() => {
            setOpenPromoModal(false);
            setSelectedPromotion({});
          }}
          data={selectedPromotion}
          getPromoCode={(data: any) => {
            checkPromotionApplicable(data);
          }}
        />
      )}
    </>
  ) as any;
}
