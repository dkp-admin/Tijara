import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
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
import { getItemSellingPrice, getItemVAT } from "../../../../utils/get-price";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import ItemDivider from "../../../action-sheet/row-divider";
import DefaultText from "../../../text/Text";
import showToast from "../../../toast";
import { KeypadView } from "../keypad/keypad-view";
import ModifiersModal from "./modifiers-modal";
import dineinCart from "../../../../utils/dinein-cart";
import { useCurrency } from "../../../../store/get-currency";

export default function ProductCustomPriceModal({
  data,
  productName,
  isFromPriceModal = false,
  visible,
  handleClose,
  handleAddedToCart,
  handlePriceModalClose,
  dinein = false,
}: any) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { hp, twoPaneView } = useResponsive();
  const { currency } = useCurrency();
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const { businessData: businessDetails } = useCommonApis();

  const [productData, setProductData] = useState<any>(null);
  const [visibleModifierModal, setVisibleModifierModal] = useState(false);

  const handleUpdatePrice = (value: any) => {
    let priceData = "";

    const split = price.split(".");

    const splitData = price.split("");

    if (value == "del") {
      splitData?.map((val: any, index: number) => {
        if (val == "." || splitData?.length - 1 == index) {
          return;
        }

        priceData = priceData + val;
      });

      setPrice(getPrice(priceData));
    } else if (value == "add") {
      if (price > businessDetails?.company?.transactionVolumeCategory) {
        showToast(
          "error",
          `${t("Billing amount must be less than or equal to ")}${
            businessDetails?.company?.transactionVolumeCategory
          }`
        );
        setLoading(false);
        setPrice("");
        return;
      }
      const vat = businessDetails.company.vat.percentage;

      if (isFromPriceModal) {
        handlePriceModalClose({
          ...data,
          _id: data._id,
          localImage: data.localImage,
          name: { en: data.name.en, ar: data.name.ar },
          type: data.type || "item",
          sku: data.sku,
          parentSku: data.parentSku,
          boxSku: data.boxSku,
          crateSku: data.crateSku,
          boxRef: data.boxRef,
          code: data?.code || "",
          crateRef: data.crateRef,
          costPrice: data.prices[0]?.costPrice || 0,
          sellingPrice: Number(price),
          vat,
          qty: 1,
          unit: data.unit || "perItem",
          sentToKot: false,
          noOfUnits: 1,
          note: "",
          isOpenPrice: true,
          availability: data.stocks?.[0]
            ? data.stocks[0].enabledAvailability
            : true,
          tracking: data.stocks?.[0] ? data.stocks[0].enabledTracking : false,
          stockCount: data.stocks?.[0]?.stockCount
            ? data.stocks[0].stockCount
            : 0,
        });
      } else {
        const item = {
          ...data,
          productRef: data._id,
          categoryRef: data.categoryRef || "",
          image:
            data?.variants[0].localImage ||
            data?.variants[0]?.image ||
            data?.localImage ||
            data.image ||
            "",
          name: { en: data.name.en, ar: data.name.ar },
          contains: data?.contains,
          category: { name: data.category.name },
          code: data?.variants[0]?.code || "",
          variantNameEn: data.variants[0].name.en,
          variantNameAr: data.variants[0].name.ar,
          type: data.variants[0].type || "item",
          sku: data.variants[0].sku,
          parentSku: data.variants[0].parentSku,
          boxSku: "",
          crateSku: "",
          boxRef: "",
          crateRef: "",
          costPrice: data.variants[0].prices[0]?.costPrice || 0,
          sellingPrice: getItemSellingPrice(price, vat),
          vat,
          vatAmount: getItemVAT(price, vat),
          qty: 1,
          hasMultipleVariants: data?.multiVariants
            ? Boolean(data?.multiVariants)
            : data?.variants?.length > 1,
          itemSubTotal: getItemSellingPrice(price, vat),
          sentToKot: false,
          itemVAT: getItemVAT(price, vat),
          total: Number(price),
          unit: data.variants[0].unit || "perItem",
          noOfUnits: 1,
          note: "",
          selected: false,
          isOpenPrice: true,
          availability: data.variants[0].stocks?.[0]
            ? data.variants[0].stocks[0].enabledAvailability
            : true,
          tracking: data.variants[0].stocks?.[0]
            ? data.variants[0].stocks?.[0].enabledTracking
            : false,
          stockCount: data.variants[0].stocks?.[0]?.stockCount
            ? data.variants[0].stocks[0].stockCount
            : 0,
          modifiers: [],
          channels: data?.channels,
          productModifiers: data?.modifiers,
        };

        const activeModifiers = data?.modifiers?.filter(
          (modifier: any) => modifier.status === "active"
        );

        if (data?.modifiers?.length > 0 && activeModifiers?.length > 0) {
          setProductData(item);
          setVisibleModifierModal(true);
          return;
        }

        if (!dinein) {
          cart.addToCart(item, (items: any) => {
            EventRegister.emit("itemAdded", items);
          });
        } else
          dineinCart.addToCart(item, (items: any) => {
            EventRegister.emit("itemAdded-dinein", items);
          });

        handleAddedToCart();
      }
      setLoading(false);

      if (price != "" && price != "0.00") {
        setPrice("");
      }
    } else {
      if (split[0].length > 5) {
        return;
      }

      if (split[0].length > 2) {
        showToast("info", t("Amount exceeds 3 digits"));
      }

      splitData?.map((val: any) => {
        if (val == ".") {
          return;
        }

        priceData = priceData + val;
      });

      let amount = priceData?.replace(/\b0+/g, "");

      amount = getPrice(amount + value);

      setPrice(amount);
    }
  };

  const getPrice = (val = "") => {
    const decimalPart = val.substring(val.length - 2).padStart(2, "0");
    const intPart = val.substring(0, val.length - 2) || "0";
    return `${intPart}.${decimalPart}`;
  };

  useEffect(() => {
    setPrice("");
  }, []);

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
            title={isRTL ? productName?.ar : productName?.en}
            handleLeftBtn={() => {
              if (isFromPriceModal) {
                handlePriceModalClose();
              } else {
                handleClose();
              }
            }}
            rightBtnText={""}
          />

          <View
            style={{
              paddingVertical: twoPaneView ? "4.75%" : "6%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DefaultText
              style={{ fontSize: twoPaneView ? 54 : hp("5%") }}
              fontWeight="medium"
            >
              {` ${currency} `}
            </DefaultText>

            <DefaultText
              style={{ fontSize: twoPaneView ? 54 : hp("5%") }}
              fontWeight="medium"
            >
              {price || "0.00"}
            </DefaultText>
          </View>

          <ItemDivider
            style={{
              margin: 0,
              borderWidth: 0,
              borderBottomWidth: 1,
              borderColor: theme.colors.dividerColor.secondary,
            }}
          />

          <View style={{ flexDirection: "row" }}>
            <View style={{ width: "75%" }}>
              <View
                style={{
                  flexDirection: "row",
                  maxHeight: twoPaneView ? "20%" : "22%",
                }}
              >
                {[1, 2, 3].map((data, index) => {
                  return (
                    <React.Fragment key={index}>
                      <View
                        style={{
                          flex: 1,
                          borderStyle: "dashed",
                          borderRightWidth: 1,
                          borderColor: theme.colors.dividerColor.secondary,
                        }}
                      >
                        <KeypadView
                          key={index}
                          data={data}
                          onPress={(data: any) => {
                            handleUpdatePrice(data);
                          }}
                        />
                      </View>
                    </React.Fragment>
                  );
                })}
              </View>

              <ItemDivider
                style={{
                  margin: 0,
                  borderWidth: 0,
                  borderBottomWidth: 1,
                  borderColor: theme.colors.dividerColor.secondary,
                }}
              />

              <View
                style={{
                  flexDirection: "row",
                  maxHeight: twoPaneView ? "20%" : "22%",
                }}
              >
                {[4, 5, 6].map((data, index) => {
                  return (
                    <React.Fragment key={index}>
                      <View
                        style={{
                          flex: 1,
                          borderStyle: "dashed",
                          borderRightWidth: 1,
                          borderColor: theme.colors.dividerColor.secondary,
                        }}
                      >
                        <KeypadView
                          key={index}
                          data={data}
                          onPress={(data: any) => {
                            handleUpdatePrice(data);
                          }}
                        />
                      </View>
                    </React.Fragment>
                  );
                })}
              </View>

              <ItemDivider
                style={{
                  margin: 0,
                  borderWidth: 0,
                  borderBottomWidth: 1,
                  borderColor: theme.colors.dividerColor.secondary,
                }}
              />

              <View
                style={{
                  flexDirection: "row",
                  maxHeight: twoPaneView ? "20%" : "22%",
                }}
              >
                {[7, 8, 9].map((data, index) => {
                  return (
                    <React.Fragment key={index}>
                      <View
                        style={{
                          flex: 1,
                          borderStyle: "dashed",
                          borderRightWidth: 1,
                          borderColor: theme.colors.dividerColor.secondary,
                        }}
                      >
                        <KeypadView
                          key={index}
                          data={data}
                          onPress={(data: any) => {
                            handleUpdatePrice(data);
                          }}
                        />
                      </View>
                    </React.Fragment>
                  );
                })}
              </View>

              <ItemDivider
                style={{
                  margin: 0,
                  borderWidth: 0,
                  borderBottomWidth: 1,
                  borderColor: theme.colors.dividerColor.secondary,
                }}
              />

              <View
                style={{
                  flexDirection: "row",
                  maxHeight: twoPaneView ? "21%" : "23%",
                }}
              >
                {["00", 0].map((data, index) => {
                  return (
                    <React.Fragment key={index}>
                      <View
                        style={{
                          flex: 1,
                          borderStyle: "dashed",
                          borderRightWidth: 1,
                          borderColor: theme.colors.dividerColor.secondary,
                        }}
                      >
                        <KeypadView
                          key={index}
                          data={data}
                          onPress={(data: any) => {
                            handleUpdatePrice(data);
                          }}
                        />
                      </View>
                    </React.Fragment>
                  );
                })}
              </View>
            </View>

            <View style={{ width: "25%" }}>
              <View
                style={{
                  maxHeight: twoPaneView ? "42%" : "46%",
                }}
              >
                <View>
                  <KeypadView
                    data={"del"}
                    onPress={(data: any) => {
                      handleUpdatePrice(data);
                    }}
                  />
                </View>

                <ItemDivider
                  style={{
                    margin: 0,
                    borderWidth: 0,
                    borderBottomWidth: 1,
                    borderColor: theme.colors.dividerColor.secondary,
                  }}
                />

                <View>
                  <KeypadView
                    data={"add"}
                    onPress={(data: any) => {
                      if (Number(price) > 0) {
                        setLoading(true);
                        handleUpdatePrice(data);
                      } else {
                        showToast("error", t("Price must be greater than 0"));
                      }
                    }}
                    disabled={loading}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {visibleModifierModal && (
        <ModifiersModal
          dinein={dinein}
          data={productData}
          visible={visibleModifierModal}
          handleClose={() => {
            setVisibleModifierModal(false);
          }}
          handleSuccess={() => {
            handleClose();
            setVisibleModifierModal(false);
          }}
        />
      )}

      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
});
