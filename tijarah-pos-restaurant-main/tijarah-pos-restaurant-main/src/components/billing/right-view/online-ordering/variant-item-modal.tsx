import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Toast from "react-native-toast-message";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { checkDirection } from "../../../../hooks/check-direction";
import { checkKeyboardState } from "../../../../hooks/use-keyboard-state";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import { getUpdatedProductStock } from "../../../../utils/check-updated-product-stock";
import { getUnitName, getUnitTitleValue } from "../../../../utils/constants";
import ICONS from "../../../../utils/icons";
import { trimText } from "../../../../utils/trim-text";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import Input from "../../../input/input";
import CurrencyView from "../../../modal/currency-view-modal";
import Spacer from "../../../spacer";
import DefaultText from "../../../text/Text";
import Label from "../../../text/label";
import showToast from "../../../toast";
import serviceCaller from "../../../../api";
import { useCurrency } from "../../../../store/get-currency";

export default function VariantItemModal({
  data,
  visible = false,
  locationRef,
  negativeBilling,
  handleClose,
  onChange,
}: {
  data: any;
  visible: boolean;
  locationRef: string;
  negativeBilling: boolean;
  handleClose: any;
  onChange: any;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const isKeyboardVisible = checkKeyboardState();
  const { hp, twoPaneView } = useResponsive();
  const { currency } = useCurrency();
  const [boxes, setBoxes] = useState<any[]>([]);
  const [crates, setCrates] = useState<any[]>([]);
  const [totalPrice, setTotalPrice] = useState("0");
  const [quantity, setQuantity] = useState(0) as any;
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  const isSelected = (sku: string) => {
    return sku == selectedVariant?.sku;
  };

  const getVariantPrice = useMemo(
    () => (item: any, sku: string) => {
      if (selectedVariant?.sku == sku) {
        return `${currency} ${
          Number(selectedVariant?.sellingPrice)?.toFixed(2) || "0"
        }`;
      } else {
        return `${currency} ${Number(item?.price || 0)?.toFixed(2)}`;
      }
    },
    []
  );

  const getBoxCratePrice = useMemo(
    () => (item: any) => {
      return `${currency} ${Number(
        item?.price || item?.prices?.[0]?.price || 0
      )?.toFixed(2)}`;
    },
    []
  );

  const productData = useMemo(
    () => (stocks: any) => {
      const available = stocks ? stocks.availability : true;
      const tracking = stocks ? stocks.tracking : false;
      const stockCount = stocks?.count;
      const lowStockAlert = stocks ? stocks.lowStockAlert : false;
      const lowStockCount = stocks?.lowStockCount;

      let availabilityText = "";
      let textColor = "text.primary";
      let notBillingProduct = false;

      if (!available || (tracking && stockCount <= 0)) {
        availabilityText = t("Out of Stock");
        textColor = "red.default";
        notBillingProduct = !negativeBilling;
      } else if (lowStockAlert && stockCount <= lowStockCount) {
        availabilityText = t("Running Low");
        textColor = "#F58634";
      }

      if (!negativeBilling) {
        notBillingProduct = !available || (tracking && stockCount <= 0);
      }

      return {
        availabilityText,
        textColor,
        notBillingProduct,
      };
    },
    [data]
  );

  const getActiveModifiers = () => {
    const activeModifiers = data?.modifiers?.filter(
      (modifier: any) => modifier.status === "active"
    );

    return activeModifiers?.length > 0;
  };

  const renderVariantItem = (item: any, index: number) => {
    const variantItemStyle: ViewStyle = {
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: hp("2.25%"),
      paddingHorizontal: hp("2%"),
      borderWidth: 2,
      borderColor: isSelected(item.sku)
        ? theme.colors.primary[1000]
        : theme.colors.white[1000],
      backgroundColor: theme.colors.white[1000],
    };

    const priceData = item.prices?.find(
      (price: any) => price?.locationRef === locationRef
    );

    const stockConfig = item.stockConfiguration?.find(
      (stock: any) => stock?.locationRef === locationRef
    );

    const prodData = productData(stockConfig);

    const handlePress = () => {
      if (prodData.notBillingProduct) {
        showToast("error", t("Looks like the item is out of stock"));
        return;
      }

      setQuantity(1);
      setTotalPrice(Number(priceData.price || 0)?.toFixed(2));

      setSelectedVariant({
        _id: item._id,
        image: item.image,
        name: item.name,
        type: item.type || "item",
        sku: item.sku,
        parentSku: item.parentSku,
        boxSku: item?.boxSku || "",
        crateSku: item?.crateSku || "",
        boxRef: item?.boxRef || "",
        crateRef: item?.crateRef || "",
        unit: item.unit,
        noOfUnits: 1,
        costPrice: priceData?.costPrice || 0,
        sellingPrice: priceData?.price,
        availability: stockConfig ? stockConfig.availability : true,
        tracking: stockConfig ? stockConfig.tracking : false,
        stockCount: stockConfig?.count ? stockConfig.count : 0,
      });
    };

    return (
      <View
        key={index}
        style={{
          marginBottom: hp("2%"),
          width: twoPaneView ? "48%" : "100%",
          marginHorizontal: twoPaneView ? "1%" : 0,
        }}
      >
        <TouchableOpacity
          key={index}
          onPress={handlePress}
          disabled={item.sku === selectedVariant?.sku}
        >
          <View style={variantItemStyle}>
            <DefaultText
              fontSize="2xl"
              fontWeight="normal"
              color={"otherGrey.100"}
            >
              {data?.variants?.length > 1
                ? trimText(item.name.en, 17)
                : trimText(data.name.en, 17)}
            </DefaultText>

            <View
              style={{
                flexDirection: isRTL ? "row-reverse" : "row",
                alignItems: "flex-end",
              }}
            >
              <DefaultText
                fontSize="lg"
                fontWeight="normal"
                color={"otherGrey.100"}
              >
                {getVariantPrice(item, item.sku)}
              </DefaultText>

              <DefaultText style={{ fontSize: 11 }} fontWeight="normal">
                {getUnitName[item.unit]}
              </DefaultText>
            </View>
          </View>
        </TouchableOpacity>

        {prodData.availabilityText && (
          <DefaultText
            style={{ marginTop: 5, marginLeft: 16 }}
            fontSize="sm"
            color={prodData.textColor}
          >
            {prodData.availabilityText}
          </DefaultText>
        )}
      </View>
    );
  };

  const renderBoxCrateItem = (item: any, index: number) => {
    const boxItemStyle: ViewStyle = {
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: hp("2.25%"),
      paddingHorizontal: hp("2%"),
      borderWidth: 2,
      borderColor: isSelected(item.type === "box" ? item.boxSku : item.crateSku)
        ? theme.colors.primary[1000]
        : theme.colors.white[1000],
      backgroundColor: theme.colors.white[1000],
    };

    const variant: any = data?.variants?.find(
      (variant: any) => variant.sku === item?.productSku
    );

    const priceData = item.prices?.find(
      (price: any) => price?.locationRef === locationRef
    );

    const stockConfig = item?.stockConfiguration?.find(
      (stock: any) => stock?.locationRef === locationRef
    );

    const prodData = productData(stockConfig);

    const handlePress = () => {
      if (item.status === "inactive") {
        showToast(
          "error",
          item.type === "box"
            ? t("Box are disabled for billing")
            : t("Crate are disabled for billing")
        );
        return;
      }

      if (item.nonSaleable) {
        showToast(
          "error",
          item.type === "box"
            ? t("Box are not for sale")
            : t("Crate are not for sale")
        );
        return;
      }

      if (prodData.notBillingProduct) {
        showToast("error", t("Looks like the item is out of stock"));
        return;
      }

      setQuantity(1);
      setTotalPrice(Number(priceData?.price || item?.price || 0)?.toFixed(2));

      setSelectedVariant({
        _id: item._id,
        image: variant?.image,
        name: variant?.name,
        type: item.type,
        sku: item.type === "crate" ? item.crateSku : item.boxSku,
        parentSku: item?.productSku || "",
        boxSku: item.boxSku,
        crateSku: item.type === "crate" ? item.crateSku : "",
        boxRef: item.type === "crate" ? item.boxRef : item._id,
        crateRef: item.type === "crate" ? item._id : "",
        unit: "perItem",
        noOfUnits: item.qty,
        costPrice: priceData?.costPrice || item?.costPrice || 0,
        sellingPrice: priceData?.price || item?.price,
        availability: stockConfig ? stockConfig.availability : true,
        tracking: stockConfig ? stockConfig.tracking : false,
        stockCount: stockConfig?.count ? stockConfig.count : 0,
      });
    };

    return (
      <View
        key={index}
        style={{
          marginBottom: hp("2%"),
          width: twoPaneView ? "48%" : "100%",
          marginHorizontal: twoPaneView ? "1%" : 0,
        }}
      >
        <TouchableOpacity
          key={index}
          onPress={handlePress}
          disabled={
            (item.type === "crate" ? item.crateSku : item.boxSku) ===
            selectedVariant?.sku
          }
        >
          <View style={boxItemStyle}>
            <DefaultText
              fontSize="2xl"
              fontWeight="normal"
              color={"otherGrey.100"}
            >
              {data?.variants?.length > 1
                ? trimText(variant?.name?.en, 12) + ` x${item.qty}`
                : trimText(data?.name?.en, 12) + ` x${item.qty}`}
            </DefaultText>

            <DefaultText
              fontSize="lg"
              fontWeight="normal"
              color={"otherGrey.100"}
            >
              {getBoxCratePrice(priceData)}
            </DefaultText>
          </View>
        </TouchableOpacity>

        {prodData.availabilityText && (
          <DefaultText
            style={{ marginTop: 5, marginLeft: 16 }}
            fontSize="sm"
            color={prodData.textColor}
          >
            {prodData.availabilityText}
          </DefaultText>
        )}
      </View>
    );
  };

  const handleChange = useCallback(() => {
    if (!negativeBilling && selectedVariant.tracking) {
      const stockCount = getUpdatedProductStock(
        Number(selectedVariant?.stockCount),
        selectedVariant?.type,
        selectedVariant?.sku,
        Number(quantity * selectedVariant.noOfUnits),
        false
      );

      if (stockCount < 0) {
        showToast("error", t("Looks like the item is out of stock"));
        return;
      }
    }

    onChange({
      _id: data._id,
      name: data.name,
      categoryRef: data.categoryRef || "",
      variantName: selectedVariant.name,
      type: selectedVariant.type,
      sku: selectedVariant.sku,
      parentSku: selectedVariant.parentSku,
      boxSku: selectedVariant.boxSku,
      crateSku: selectedVariant.crateSku,
      boxRef: selectedVariant.boxRef,
      crateRef: selectedVariant.crateRef,
      qty: Number(quantity),
      unit: selectedVariant.unit,
      unitCount: selectedVariant.noOfUnits,
      hasMultipleVariants: data?.variants?.length > 1,
      price: selectedVariant.sellingPrice,
      tax: Number(data.tax.name || data.tax.percentage),
      productModifiers: data?.modifiers,
    });
  }, [selectedVariant, quantity, data]);

  const getBoxesCrates = async () => {
    if (data.boxRefs?.length > 0 || data.crateRefs?.length > 0) {
      const res = await serviceCaller(`/ordering/boxes-crates`, {
        method: "GET",
        query: {
          _q: "",
          page: 0,
          limit: 100,
          sort: "asc",
          activeTab: "active",
          productRef: data._id,
          companyRef: data.companyRef,
        },
      });

      const boxes = res?.results?.filter((data: any) => data.type === "box");
      const crates = res?.results?.filter((data: any) => data.type === "crate");

      if (boxes?.length > 0) {
        setBoxes(boxes);
      } else {
        setBoxes([]);
      }

      if (crates?.length > 0) {
        setCrates(crates);
      } else {
        setCrates([]);
      }
    }
  };

  useEffect(() => {
    if (visible) {
      const variant = data?.variants?.[0];

      const priceData = variant.prices?.find(
        (price: any) => price?.locationRef === locationRef
      );

      const stockConfig = variant.stockConfiguration?.find(
        (stock: any) => stock?.locationRef === locationRef
      );

      if (data?.variants?.length == 1 && priceData?.price) {
        setSelectedVariant({
          _id: variant._id,
          image: variant.image || data.image || "",
          name: variant.name,
          type: variant.type || "item",
          sku: variant.sku,
          parentSku: variant.parentSku,
          boxSku: variant?.boxSku || "",
          crateSku: variant?.crateSku || "",
          boxRef: variant?.boxRef || "",
          crateRef: variant?.crateRef || "",
          unit: variant.unit,
          noOfUnits: 1,
          costPrice: priceData?.costPrice || 0,
          sellingPrice: priceData.price,
          availability: stockConfig ? stockConfig.availability : true,
          tracking: stockConfig ? stockConfig.tracking : false,
          stockCount: stockConfig?.count ? stockConfig.count : 0,
        });
        setQuantity(1);
        setTotalPrice(Number(priceData.price)?.toFixed(2));
      }

      getBoxesCrates();
    }
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
            title={isRTL ? data?.name?.ar : data?.name?.en}
            handleLeftBtn={() => {
              handleClose();
            }}
            rightBtnText={t("Add")}
            permission={true}
            handleRightBtn={() => {
              if (quantity > 0 && selectedVariant != null) {
                handleChange();
              } else {
                if (Number(quantity) == 0) {
                  showToast("error", t("Entered value must be greater than 0"));
                } else if (selectedVariant != null) {
                  showToast("error", t("Please select variant"));
                }
              }
            }}
          />

          <KeyboardAvoidingView enabled={true}>
            <ScrollView
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingVertical: hp("2.25%"),
                paddingHorizontal: hp("2.5%"),
                marginTop: isKeyboardVisible ? "-7.5%" : "0%",
              }}
            >
              <View style={{ alignItems: "flex-end" }}>
                <CurrencyView
                  amount={totalPrice || "0"}
                  symbolFontweight="normal"
                  symbolFontsize={16}
                  amountFontsize={30}
                  decimalFontsize={30}
                />
              </View>

              {data?.variants?.length > 0 && (
                <>
                  <View
                    style={{
                      marginLeft: 16,
                      marginBottom: getActiveModifiers() ? 2 : 6,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <DefaultText fontSize="md" fontWeight="medium">
                      {t("VARIANTS")}
                    </DefaultText>

                    {data?.variants?.length > 1 && (
                      <DefaultText fontSize="md" fontWeight="normal">
                        {" - " + t("CHOOSE ONE")}
                      </DefaultText>
                    )}
                  </View>

                  {getActiveModifiers() && (
                    <DefaultText
                      style={{ marginLeft: 16, marginBottom: 6, fontSize: 11 }}
                    >
                      {t("Customisable")}
                    </DefaultText>
                  )}

                  <View
                    style={{
                      flexWrap: "wrap",
                      flexDirection: twoPaneView ? "row" : "column",
                    }}
                  >
                    {data?.variants?.map((variant: any, index: number) => {
                      return renderVariantItem(variant, index);
                    })}
                  </View>
                </>
              )}

              {boxes?.length > 0 && !data?.scan && (
                <>
                  <View
                    style={{
                      marginTop: 5,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-evenly",
                    }}
                  >
                    <View
                      style={{
                        minWidth: "45%",
                        marginRight: 8,
                        marginLeft: hp("2%"),
                        borderBottomWidth: 0.5,
                        borderColor: theme.colors.dividerColor.secondary,
                      }}
                    />

                    <DefaultText
                      fontSize="lg"
                      fontWeight="normal"
                      color="otherGrey.100"
                    >
                      {t("OR")}
                    </DefaultText>

                    <View
                      style={{
                        minWidth: "45%",
                        marginLeft: 8,
                        marginRight: hp("2%"),
                        borderBottomWidth: 0.5,
                        borderColor: theme.colors.dividerColor.secondary,
                      }}
                    />
                  </View>

                  <View
                    style={{
                      marginLeft: 16,
                      marginBottom: getActiveModifiers() ? 2 : 6,
                      marginTop: hp("2.5%"),
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <DefaultText fontSize="md" fontWeight="medium">
                      {t("BOXES")}
                    </DefaultText>

                    {boxes?.length > 1 && (
                      <DefaultText fontSize="md" fontWeight="normal">
                        {" - " + t("CHOOSE ONE")}
                      </DefaultText>
                    )}
                  </View>

                  {getActiveModifiers() && (
                    <DefaultText
                      style={{ marginLeft: 16, marginBottom: 6, fontSize: 11 }}
                    >
                      {t("Customisable")}
                    </DefaultText>
                  )}

                  <View
                    style={{
                      flexWrap: "wrap",
                      flexDirection: twoPaneView ? "row" : "column",
                    }}
                  >
                    {boxes?.map((box: any, index: number) => {
                      return renderBoxCrateItem(box, index);
                    })}
                  </View>
                </>
              )}

              {crates?.length > 0 && !data?.scan && (
                <>
                  <View
                    style={{
                      marginTop: 5,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-evenly",
                    }}
                  >
                    <View
                      style={{
                        minWidth: "45%",
                        marginRight: 8,
                        marginLeft: hp("2%"),
                        borderBottomWidth: 0.5,
                        borderColor: theme.colors.dividerColor.secondary,
                      }}
                    />

                    <DefaultText
                      fontSize="lg"
                      fontWeight="normal"
                      color="otherGrey.100"
                    >
                      {t("OR")}
                    </DefaultText>

                    <View
                      style={{
                        minWidth: "45%",
                        marginLeft: 8,
                        marginRight: hp("2%"),
                        borderBottomWidth: 0.5,
                        borderColor: theme.colors.dividerColor.secondary,
                      }}
                    />
                  </View>

                  <View
                    style={{
                      marginLeft: 16,
                      marginBottom: getActiveModifiers() ? 2 : 6,
                      marginTop: hp("2.5%"),
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <DefaultText fontSize="md" fontWeight="medium">
                      {t("CRATES")}
                    </DefaultText>

                    {crates?.length > 1 && (
                      <DefaultText fontSize="md" fontWeight="normal">
                        {" - " + t("CHOOSE ONE")}
                      </DefaultText>
                    )}
                  </View>

                  {getActiveModifiers() && (
                    <DefaultText
                      style={{ marginLeft: 16, marginBottom: 6, fontSize: 11 }}
                    >
                      {t("Customisable")}
                    </DefaultText>
                  )}

                  <View
                    style={{
                      flexWrap: "wrap",
                      flexDirection: twoPaneView ? "row" : "column",
                    }}
                  >
                    {crates?.map((crate: any, index: number) => {
                      return renderBoxCrateItem(crate, index);
                    })}
                  </View>
                </>
              )}

              {selectedVariant != null ? (
                (selectedVariant?.type === "box" ||
                  selectedVariant?.type === "crate" ||
                  selectedVariant?.unit == "perItem") && (
                  <>
                    <Label>
                      {selectedVariant?.type === "box" ||
                      selectedVariant?.type === "crate"
                        ? t("QUANTITY")
                        : t(getUnitTitleValue[selectedVariant?.unit])}
                    </Label>

                    <View
                      style={{
                        borderWidth: 1,
                        borderRadius: 50,
                        borderColor: "#DFDFDFCC",
                        backgroundColor: "transparent",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          ...styles.add_minus_view,
                          opacity: Number(quantity) <= 1 ? 0.25 : 1,
                          borderRightWidth: 1,
                        }}
                        onPress={() => {
                          if (quantity > 1) {
                            const price =
                              (quantity - 1) *
                              Number(selectedVariant?.sellingPrice);

                            setQuantity(quantity - 1);
                            setTotalPrice(price?.toFixed(2));
                          }
                        }}
                        disabled={quantity < 1}
                      >
                        <ICONS.MinusIcon />
                      </TouchableOpacity>

                      <Input
                        containerStyle={{
                          borderWidth: 0,
                          borderRadius: 0,
                          width: "45%",
                          justifyContent: "center",
                          backgroundColor: "transparent",
                        }}
                        style={{
                          width: quantity > 0 ? "100%" : "99%",
                          fontSize: 40,
                          textAlign: "center",
                        }}
                        maxLength={10}
                        keyboardType={"number-pad"}
                        placeholderText={"1"}
                        values={`${quantity || ""}`}
                        handleChange={(val: any) => {
                          if (val === "" || /^[0-9\b]+$/.test(val)) {
                            const price =
                              Number(val) *
                              Number(selectedVariant?.sellingPrice);

                            setQuantity(Number(val));
                            setTotalPrice(price?.toFixed(2));
                          }
                        }}
                      />

                      <TouchableOpacity
                        style={{ ...styles.add_minus_view, borderLeftWidth: 1 }}
                        onPress={() => {
                          const price =
                            (quantity + 1) *
                            Number(selectedVariant?.sellingPrice);

                          setQuantity(quantity + 1);
                          setTotalPrice(price?.toFixed(2));
                        }}
                      >
                        <ICONS.PlusIcon />
                      </TouchableOpacity>
                    </View>
                  </>
                )
              ) : (
                <></>
              )}

              {data?.variants?.length < 1 && (
                <>
                  <Spacer space={hp("5%")} />

                  <Input
                    style={{ width: "100%" }}
                    label={t("ITEM PRICE")}
                    keyboardType={"number-pad"}
                    placeholderText={t("Enter price")}
                    values={`${currency} ${selectedVariant?.sellingPrice}`}
                    handleChange={(val: any) => {}}
                    disabled
                  />
                </>
              )}

              <Spacer space={hp("5%")} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>

      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { overflow: "hidden", height: "100%" },
  add_minus_view: {
    width: "27.5%",
    borderWidth: 0,
    paddingVertical: 16,
    borderColor: "#DFDFDFCC",
    alignItems: "center",
  },
});
