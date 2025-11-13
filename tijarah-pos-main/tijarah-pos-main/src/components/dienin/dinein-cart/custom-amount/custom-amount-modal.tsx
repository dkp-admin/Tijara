import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { checkDirection } from "../../../../hooks/check-direction";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import useCommonApis from "../../../../hooks/useCommonApis";
import { getItemSellingPrice, getItemVAT } from "../../../../utils/get-price";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import ItemDivider from "../../../action-sheet/row-divider";
import { KeypadView } from "../../../billing/left-view/keypad/keypad-view";
import DefaultText from "../../../text/Text";
import showToast from "../../../toast";
import dineinCart from "../../../../utils/dinein-cart";
import { debugLog } from "../../../../utils/log-patch";
import { EventRegister } from "react-native-event-listeners";

const numbers1 = [1, 2, 3];
const numbers2 = [4, 5, 6];
const numbers3 = [7, 8, 9];
const operations = ["del", 0, "add"];

export default function CustomAmountModal({
  visible,
  handleClose,
}: {
  visible: boolean;
  handleClose: any;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { hp, twoPaneView } = useResponsive();

  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const { businessData: businessDetails } = useCommonApis();

  const handleUpdatePrice = (value: any) => {
    let data = "";

    const split = price.split(".");

    const splitData = price.split("");

    if (value == "del") {
      splitData?.map((val: any, index: number) => {
        if (val == "." || splitData?.length - 1 == index) {
          return;
        }

        data = data + val;
      });

      setPrice(getPrice(data));
    } else if (value == "add") {
      const vat = businessDetails.company.vat.percentage;

      const item = {
        sentToKot: false,
        image: "",
        productRef: "OPEN_ITEM" + (Math.random() * 10).toString(),
        categoryRef: "",
        name: { en: "Open Item", ar: "افتح العنصر" },
        contains: false,
        category: { name: "" },
        costPrice: 0,
        sellingPrice: getItemSellingPrice(price, vat),
        variantNameEn: "Regular",
        variantNameAr: "عادي",
        type: "item",
        sku: "Open Item",
        parentSku: "",
        boxSku: "",
        vat,
        vatAmount: getItemVAT(price, vat),
        qty: 1,
        hasMultipleVariants: false,
        itemSubTotal: getItemSellingPrice(price, vat),
        itemVAT: getItemVAT(price, vat),
        total: Number(price),
        unit: "perItem",
        noOfUnits: 1,
        note: "",
        selected: false,
        isOpenItem: true,
        availability: true,
        tracking: false,
        stockCount: 1,
        modifiers: [],
        channels: [],
        productModifiers: [],
      };

      dineinCart.addToCart(item, (items: any) => {
        debugLog(
          "Open item added to cart",
          item,
          "action-tab",
          "handleAddKeypadFunction"
        );

        EventRegister.emit("itemAdded-dinein", items);
      });

      setLoading(false);

      if (price != "" && price != "0.00") {
        setPrice("");
      }

      handleClose();
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

        data = data + val;
      });

      let amount = data?.replace(/\b0+/g, "");

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
  }, [visible]);

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
            title={t("Custom Amount")}
            handleLeftBtn={() => handleClose()}
          />

          <View style={{ flex: 1, height: "100%" }}>
            <View
              style={{
                paddingVertical: "4%",
                flexDirection: isRTL ? "row-reverse" : "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DefaultText style={{ fontSize: hp("5%") }} fontWeight="medium">
                {` ${t("SAR")} `}
              </DefaultText>

              <DefaultText style={{ fontSize: hp("6%") }} fontWeight="medium">
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

            <View style={{ flexDirection: "row", maxHeight: "20%" }}>
              {numbers1.map((data, index) => {
                return (
                  <React.Fragment key={index}>
                    <View
                      key={index}
                      style={{
                        flex: 1,
                        borderStyle: "dashed",
                        borderRightWidth: index < numbers1.length - 1 ? 0.5 : 0,
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

            <View style={{ flexDirection: "row", maxHeight: "20%" }}>
              {numbers2.map((data, index) => {
                return (
                  <React.Fragment key={index}>
                    <View
                      key={index}
                      style={{
                        flex: 1,
                        borderStyle: "dashed",
                        borderRightWidth: index < numbers2.length - 1 ? 0.5 : 0,
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

            <View style={{ flexDirection: "row", maxHeight: "20%" }}>
              {numbers3.map((data, index) => {
                return (
                  <React.Fragment key={index}>
                    <View
                      key={index}
                      style={{
                        flex: 1,
                        borderStyle: "dashed",
                        borderRightWidth: index < numbers3.length - 1 ? 0.5 : 0,
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

            <View style={{ flexDirection: "row", maxHeight: "20%" }}>
              {operations.map((data, index) => {
                return (
                  <React.Fragment key={index}>
                    <View
                      key={index}
                      style={{
                        flex: 1,
                        borderStyle: "dashed",
                        borderRightWidth:
                          index < operations.length - 1 ? 0.5 : 0,
                        borderColor: theme.colors.dividerColor.secondary,
                      }}
                    >
                      <KeypadView
                        key={index}
                        data={data}
                        onPress={(data: any) => {
                          if (data == "add") {
                            if (Number(price) > 0) {
                              setLoading(true);
                              handleUpdatePrice(data);
                            } else {
                              showToast(
                                "error",
                                t("Price must be greater than 0")
                              );
                            }
                          } else {
                            handleUpdatePrice(data);
                          }
                        }}
                        disabled={loading}
                      />
                    </View>
                  </React.Fragment>
                );
              })}
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
});
