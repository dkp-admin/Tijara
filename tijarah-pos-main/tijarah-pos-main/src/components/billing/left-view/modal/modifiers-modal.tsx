import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Checkbox from "react-native-bouncy-checkbox";
import { EventRegister } from "react-native-event-listeners";
import Toast from "react-native-toast-message";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { checkDirection } from "../../../../hooks/check-direction";
// import useItems from "../../../../hooks/use-items";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import useCommonApis from "../../../../hooks/useCommonApis";
// import useCartStore from "../../../../store/cart-item";
// import { autoApplyCustomCharges } from "../../../../utils/auto-apply-custom-charge";
import cart from "../../../../utils/cart";
import dineinCart from "../../../../utils/dinein-cart";
import { getItemSellingPrice, getItemVAT } from "../../../../utils/get-price";
import ICONS from "../../../../utils/icons";
import { isSameModifiers } from "../../../../utils/isSameModifiers";
import { debugLog } from "../../../../utils/log-patch";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import Spacer from "../../../spacer";
import DefaultText from "../../../text/Text";
import showToast from "../../../toast";

export default function ModifiersModal({
  data,
  visible = false,
  handleClose,
  handleSuccess,
  dinein = false,
}: {
  data: any;
  visible: boolean;
  handleClose: any;
  handleSuccess: any;
  dinein?: boolean;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { hp, twoPaneView } = useResponsive();
  const { businessData: businessDetails } = useCommonApis();
  // const { channel } = useCartStore();
  // const { totalAmount, totalCharges, subTotalWithoutDiscount } = useItems();

  const [quantity, setQuantity] = useState(0);
  const [selectedModifier, setSelectedModifier] = useState<any>([]);

  const totalPrice = useMemo(() => {
    const price = selectedModifier?.reduce(
      (pc: number, item: any) => pc + item?.total,
      0
    );

    const productPrice = data?.itemSubTotal + data?.itemVAT;

    return (productPrice + price) * quantity || 0;
  }, [quantity, selectedModifier]);

  const checkModifierSelect = (modifier: any, option: any) => {
    const modIndex = selectedModifier?.findIndex(
      (item: any) => item.modifierRef === modifier.modifierRef
    );

    const index = selectedModifier?.findIndex(
      (item: any) =>
        item.modifierRef === modifier.modifierRef &&
        item.optionId === option._id
    );

    if (
      modIndex === -1 &&
      modifier.min > 0 &&
      modifier.default === option._id
    ) {
      updateModifier(modifier, option);
    }

    return modIndex === -1 && modifier.min > 0
      ? modifier.default === option._id
      : index !== -1;
  };

  const maxModifierSelected = (modifier: any, option: any) => {
    if (
      (modifier.min === 0 && modifier.max === 0) ||
      (modifier.min === 1 && modifier.max === 1)
    ) {
      return false;
    }

    const data = selectedModifier?.filter(
      (item: any) => item.modifierRef === modifier.modifierRef
    );

    if (checkModifierSelect(modifier, option)) {
      return false;
    }

    return data?.length === modifier.max;
  };

  const updateModifier = (modifier: any, option: any) => {
    let data;

    const index = selectedModifier?.findIndex((item: any) =>
      modifier.min === 1 && modifier.max === 1
        ? item.modifierRef === modifier.modifierRef
        : item.modifierRef === modifier.modifierRef &&
          item.optionId === option._id
    );

    if (modifier.min === 1 && modifier.max === 1 && index !== -1) {
      selectedModifier[index] = {
        modifierRef: modifier.modifierRef,
        name: modifier.name,
        optionId: option._id,
        optionName: option.name,
        contains: option.contains,
        discount: 0,
        discountPercentage: 0,
        vatAmount: getItemVAT(option.price, option.tax.percentage),
        vatPercentage: option.tax.percentage,
        subTotal: getItemSellingPrice(option.price, option.tax.percentage),
        total: option.price,
      };
      setSelectedModifier([...selectedModifier]);
    } else if (index !== -1) {
      data = [...selectedModifier];
      data.splice(index, 1);
      setSelectedModifier(data);
    } else {
      data = {
        modifierRef: modifier.modifierRef,
        name: modifier.name,
        optionId: option._id,
        optionName: option.name,
        contains: option.contains,
        discount: 0,
        discountPercentage: 0,
        vatAmount: getItemVAT(option.price, option.tax.percentage),
        vatPercentage: option.tax.percentage,
        subTotal: getItemSellingPrice(option.price, option.tax.percentage),
        total: option.price,
      };
      setSelectedModifier([...selectedModifier, data]);
    }
  };

  const checkModifierSelected = () => {
    for (let i = 0; i < data?.productModifiers?.length; i++) {
      const modifier = selectedModifier?.filter(
        (item: any) =>
          item.modifierRef === data?.productModifiers[i].modifierRef
      );

      if (
        data?.productModifiers[i].min !== 0 &&
        data?.productModifiers[i].min > (modifier?.length || 0)
      ) {
        showToast(
          "error",
          `${t("Please select")} ${data?.productModifiers[i].name} ${t(
            "minimum"
          )} ${data?.productModifiers[i].min}`
        );
        return true;
      }
    }

    return false;
  };

  const checkNotBillingProduct = () => {
    const available = data?.availability || true;
    const tracking = data?.tracking || false;
    const stockCount = data?.stockCount / data.noOfUnits;

    if (available && tracking && stockCount < 1) {
      return !Boolean(businessDetails?.location?.negativeBilling);
    } else {
      return !available;
    }
  };

  const sameModifierCheck = (prod: any) => {
    let sameModifier = false;

    for (let i = 0; i < prod?.modifiers?.length; i++) {
      const index = selectedModifier?.findIndex(
        (item: any) =>
          item.modifierRef === prod?.modifiers[i].modifierRef &&
          item.optionId === prod?.modifiers[i].optionId
      );

      if (index !== -1) {
        sameModifier = true;
      } else {
        sameModifier = false;
        return false;
      }
    }

    return sameModifier;
  };

  const handleAdd = () => {
    if (checkModifierSelected()) {
      return;
    }

    if (checkNotBillingProduct()) {
      debugLog(
        "Looks like the item is out of stock",
        {},
        "billing-screen",
        "handleCatalogueModifier"
      );
      showToast("error", t("Looks like the item is out of stock"));
      return;
    }

    const localItems = dinein
      ? dineinCart.getCartItems() || []
      : cart.getCartItems() || [];

    const idx = dinein
      ? localItems.findIndex(
          (item: any) =>
            data.sellingPrice &&
            item.sku === data.sku &&
            isSameModifiers(item?.modifiers, selectedModifier) &&
            (data?.sentToKot || false) === (item?.sentToKot || false)
        )
      : localItems.findIndex(
          (item: any) =>
            data.sellingPrice &&
            item.sku === data.sku &&
            isSameModifiers(item?.modifiers, selectedModifier)
        );

    const isSpecialItem =
      data?.name?.en === "Open Item" ||
      data.unit !== "perItem" ||
      data?.isOpenPrice;

    if (idx !== -1 && !isSpecialItem && sameModifierCheck(localItems[idx])) {
      const updatedQty = localItems[idx].qty + quantity;
      const updatedTotal = localItems[idx].total + totalPrice;

      if (!dinein) {
        cart.updateCartItem(
          idx,
          {
            ...localItems[idx],
            qty: updatedQty,
            total: updatedTotal,
          },
          (updatedItems: any) => {
            debugLog(
              "Item updated to cart",
              updatedItems,
              "billing-screen",
              "handleCatalogueModifier"
            );
            EventRegister.emit("itemUpdated", updatedItems);
          }
        );
      } else
        dineinCart.updateCartItem(
          idx,
          {
            ...localItems[idx],
            qty: updatedQty,
            sentToKot: false,
            total: updatedTotal,
            selected: false,
          },
          (updatedItems: any) => {
            debugLog(
              "Item updated to cart",
              updatedItems,
              "billing-screen",
              "handleCatalogueModifier"
            );
            EventRegister.emit("itemUpdated-dinein", updatedItems);
          }
        );

      // autoApplyCustomCharges(
      //   channel,
      //   totalPrice + totalAmount - totalCharges + totalCharges,
      //   localItems[idx].sellingPrice * quantity + subTotalWithoutDiscount
      // );

      handleSuccess();
      return;
    }

    const subTotal = selectedModifier?.reduce(
      (pc: number, item: any) => pc + item?.subTotal,
      0
    );

    const vatAmount = selectedModifier?.reduce(
      (pc: number, item: any) => pc + item?.vatAmount,
      0
    );

    const item = {
      ...data,
      note: "",
      selected: false,
      qty: quantity,
      sellingPrice: data?.itemSubTotal + subTotal,
      vatAmount: data?.itemVAT + vatAmount,
      total: totalPrice,
      modifiers: selectedModifier,
      productModifiers: data?.productModifiers,
      sentToKot: false,
    };

    if (!dinein) {
      cart.addToCart(item, (items: any) => {
        debugLog(
          "Item added to cart",
          item,
          "billing-screen",
          "handleCatalogueModifier"
        );
        EventRegister.emit("itemAdded", items);
      });
    } else
      dineinCart.addToCart(item, (items: any) => {
        debugLog(
          "Item added to cart",
          item,
          "billing-screen",
          "handleCatalogueModifier"
        );
        EventRegister.emit("itemAdded-dinein", items);
      });

    // autoApplyCustomCharges(
    //   channel,
    //   item.total + totalAmount - totalCharges + totalCharges,
    //   item.sellingPrice + subTotalWithoutDiscount
    // );

    handleSuccess();
  };

  useEffect(() => {
    if (visible) {
      setQuantity(data?.qty || 1);
      setSelectedModifier([]);
    }
  }, [visible]);

  const renderModifier = (modifier: any, option: any) => {
    const variantItemStyle: ViewStyle = {
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: hp("2.25%"),
      paddingHorizontal: hp("2%"),
      backgroundColor: theme.colors.white[1000],
    };

    if (modifier?.excluded?.includes(option._id)) {
      return <React.Fragment key={option._id}></React.Fragment>;
    }

    return (
      <View
        key={option._id}
        style={{
          marginBottom: hp("2%"),
          width: twoPaneView ? "48%" : "100%",
          marginHorizontal: twoPaneView ? "1%" : 0,
        }}
      >
        <Pressable
          key={option._id}
          onPress={() => {
            if (option.status === "inactive") {
              showToast("error", t("This option has been sold out"));
            } else if (!maxModifierSelected(modifier, option)) {
              updateModifier(modifier, option);
            } else {
              showToast(
                "info",
                t("Already selected maximum options for this modifier")
              );
            }
          }}
        >
          <View style={variantItemStyle}>
            <View
              style={{
                width: "50%",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {option.contains === "egg" ? (
                <ICONS.EggIcon />
              ) : option.contains === "non-veg" ? (
                <ICONS.NonVegIcon />
              ) : (
                <ICONS.VegIcon />
              )}

              <DefaultText
                style={{ marginLeft: hp("1%") }}
                fontSize="xl"
                fontWeight="medium"
                color="otherGrey.100"
              >
                {option.name}
              </DefaultText>
            </View>

            <View
              style={{
                width: "50%",
                flexDirection: isRTL ? "row-reverse" : "row",
                justifyContent: "flex-end",
              }}
            >
              <DefaultText
                fontSize="xl"
                fontWeight="medium"
                color="otherGrey.100"
              >
                {`${t("SAR")} ${option.price?.toFixed(2)}`}
              </DefaultText>

              {modifier.min === 1 && modifier.max === 1 ? (
                <Checkbox
                  style={{ marginLeft: hp("1%"), marginRight: -hp("2%") }}
                  isChecked={checkModifierSelect(modifier, option)}
                  fillColor={theme.colors.white[1000]}
                  unfillColor={theme.colors.white[1000]}
                  iconComponent={
                    checkModifierSelect(modifier, option) ? (
                      <ICONS.RadioFilledIcon
                        color={theme.colors.primary[1000]}
                      />
                    ) : (
                      <ICONS.RadioEmptyIcon
                        color={theme.colors.primary[1000]}
                      />
                    )
                  }
                  disableBuiltInState
                  disabled
                />
              ) : (
                <Checkbox
                  style={{ marginLeft: hp("1%"), marginRight: -hp("2%") }}
                  isChecked={checkModifierSelect(modifier, option)}
                  fillColor={theme.colors.white[1000]}
                  unfillColor={theme.colors.white[1000]}
                  iconComponent={
                    checkModifierSelect(modifier, option) ? (
                      <ICONS.TickFilledIcon
                        width={25}
                        height={25}
                        color={theme.colors.primary[1000]}
                      />
                    ) : (
                      <ICONS.TickEmptyIcon
                        width={25}
                        height={25}
                        color={theme.colors.primary[1000]}
                      />
                    )
                  }
                  disableBuiltInState
                  disabled
                />
              )}
            </View>
          </View>
        </Pressable>

        {option.status === "inactive" && (
          <DefaultText
            style={{ marginTop: 5, marginLeft: 16 }}
            fontSize="sm"
            color="red.default"
          >
            {t("Sold Out")}
          </DefaultText>
        )}
      </View>
    );
  };

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
            title={
              isRTL
                ? data?.hasMultipleVariants
                  ? `${data?.name?.ar}, ${data.variantNameAr}`
                  : data?.name?.ar
                : data?.hasMultipleVariants
                ? `${data?.name?.en}, ${data?.variantNameEn}`
                : data?.name?.en
            }
            handleLeftBtn={() => {
              handleClose();
            }}
          />

          <KeyboardAvoidingView enabled={true}>
            <ScrollView
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingVertical: hp("2.25%"),
                paddingHorizontal: hp("2.5%"),
              }}
            >
              <DefaultText
                style={{ marginBottom: hp("0.5%") }}
                fontSize="2xl"
                fontWeight="medium"
              >
                {t("Customise as per your taste")}
              </DefaultText>

              {data?.productModifiers?.map((modifier: any) => {
                if (modifier.status === "inactive") {
                  return (
                    <React.Fragment key={modifier.modifierRef}></React.Fragment>
                  );
                }

                return (
                  <React.Fragment key={modifier.modifierRef}>
                    <View
                      style={{
                        marginTop: hp("2%"),
                        marginLeft: hp("2.5%"),
                        marginBottom: hp("2.25%"),
                      }}
                    >
                      <DefaultText fontSize="xl" fontWeight="medium">
                        {modifier.name}
                      </DefaultText>

                      {modifier.min === 1 && modifier.max === 1 ? (
                        <DefaultText
                          style={{ marginTop: 5 }}
                          fontSize="lg"
                          fontWeight="normal"
                          color="otherGrey.100"
                        >
                          {`${t("Select any")} ${modifier.max}`}
                        </DefaultText>
                      ) : modifier.max > 0 ? (
                        <DefaultText
                          style={{ marginTop: 5 }}
                          fontSize="lg"
                          fontWeight="normal"
                          color="otherGrey.100"
                        >
                          {`${t("Select upto")} ${modifier.max}`}
                        </DefaultText>
                      ) : modifier.min > 0 ? (
                        <DefaultText
                          style={{ marginTop: 5 }}
                          fontSize="lg"
                          fontWeight="normal"
                          color="otherGrey.100"
                        >
                          {`${t("Select minimum")} ${modifier.max}`}
                        </DefaultText>
                      ) : (
                        <></>
                      )}
                    </View>

                    <View
                      style={{
                        flexWrap: "wrap",
                        flexDirection: twoPaneView ? "row" : "column",
                      }}
                    >
                      {modifier.values?.map((option: any) => {
                        return renderModifier(modifier, option);
                      })}
                    </View>
                  </React.Fragment>
                );
              })}

              <Spacer space={hp("22%")} />
            </ScrollView>
          </KeyboardAvoidingView>

          <View
            style={{
              width: "100%",
              bottom: 0,
              position: "absolute",
              backgroundColor: theme.colors.bgColor2,
            }}
          >
            <View
              style={{
                height: 1,
                width: "100%",
                backgroundColor: theme.colors.primary[200],
              }}
            />

            <View
              style={{
                paddingVertical: 16,
                paddingHorizontal: 20,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "transparent",
              }}
            >
              <View
                style={{
                  width: twoPaneView ? "22%" : "32%",
                  borderWidth: 1,
                  borderRadius: 10,
                  marginRight: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-evenly",
                  borderColor: theme.colors.primary[1000],
                  backgroundColor: "transparent",
                }}
              >
                <TouchableOpacity
                  style={{ ...styles.add_minus_view, paddingRight: 16 }}
                  onPress={() => {
                    if (quantity - 1 === 0) {
                      handleClose();
                      return;
                    }
                    setQuantity(quantity - 1);
                  }}
                >
                  <ICONS.MinusIcon
                    width={twoPaneView ? 30 : 25}
                    height={twoPaneView ? 30 : 25}
                    color={theme.colors.primary[1000]}
                  />
                </TouchableOpacity>

                <DefaultText
                  fontSize={twoPaneView ? "3xl" : "2xl"}
                  fontWeight="medium"
                  color="primary.1000"
                >
                  {`${quantity}`}
                </DefaultText>

                <TouchableOpacity
                  style={{ ...styles.add_minus_view, paddingLeft: 16 }}
                  onPress={() => {
                    setQuantity(quantity + 1);
                  }}
                >
                  <ICONS.PlusIcon
                    width={twoPaneView ? 30 : 25}
                    height={twoPaneView ? 30 : 25}
                    color={theme.colors.primary[1000]}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={{
                  width: twoPaneView ? "50%" : "65%",
                  borderRadius: 16,
                  paddingVertical: 15,
                  paddingHorizontal: 12,
                  backgroundColor: theme.colors.primary[1000],
                }}
                onPress={() => handleAdd()}
              >
                <DefaultText
                  style={{ textAlign: "center" }}
                  fontSize={twoPaneView ? "2xl" : "lg"}
                  fontWeight={twoPaneView ? "medium" : "normal"}
                  color="white.1000"
                >
                  {`${t("Add Item")} | ${t("SAR")} ${totalPrice.toFixed(2)}`}
                </DefaultText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
  add_minus_view: {
    borderWidth: 0,
    paddingVertical: 8,
    alignItems: "center",
  },
});
