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
import ProductCustomPriceModal from "./product-custom-price-modal";
import repository from "../../../../db/repository";
import { useCurrency } from "../../../../store/get-currency";

export default function ProductPriceModal({
  data,
  visible = false,
  handleClose,
  onChange,
  onDelete,
  dinein = false,
}: {
  data: any;
  visible: boolean;
  handleClose?: any;
  onChange?: any;
  onDelete?: any;
  dinein?: boolean;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { currency } = useCurrency();
  const isKeyboardVisible = checkKeyboardState();
  const { wp, hp, twoPaneView } = useResponsive();
  const [totalPrice, setTotalPrice] = useState("0");
  const [quantity, setQuantity] = useState(0) as any;
  const [notes, setNotes] = useState("");
  const [boxes, setBoxes] = useState<any[]>([]);
  const [crates, setCrates] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [variantData, setVariantData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [visibleProductCustomPrice, setVisibleProductCustomPrice] =
    useState(false);

  const isSelected = (sku: any) => {
    return sku == selectedVariant?.sku;
  };

  const getVariantPrice = useMemo(
    () => (item: any) => {
      if (selectedVariant?.sku == item?.sku && selectedVariant?.isOpenPrice) {
        return `${currency} ${
          Number(selectedVariant?.sellingPrice)?.toFixed(2) || "0"
        }`;
      } else if (Number(item.prices[0]?.price) > 0) {
        return `${currency} ${Number(item.prices[0].price)?.toFixed(2)}`;
      } else {
        return t("Custom");
      }
    },
    [selectedVariant]
  );

  const getBoxCratePrice = useMemo(
    () => (item: any) => {
      if (selectedVariant?.sku == item?.sku && selectedVariant?.isOpenPrice) {
        return `${currency} ${
          Number(selectedVariant?.sellingPrice)?.toFixed(2) || "0"
        }`;
      } else {
        return `${currency} ${Number(
          item.prices[0]?.price || item?.price || 0
        )?.toFixed(2)}`;
      }
    },
    [selectedVariant]
  );

  const productData = useMemo(
    () => (stocks: any) => {
      const available = stocks ? stocks.enabledAvailability : true;
      const tracking = stocks ? stocks.enabledTracking : false;
      const stockCount = stocks?.stockCount;
      const lowStockAlert = stocks ? stocks.enabledLowStockAlert : false;
      const lowStockCount = stocks?.lowStockCount;

      let availabilityText = "";
      let textColor = "text.primary";
      let notBillingProduct = false;

      if (!available || (tracking && stockCount <= 0)) {
        availabilityText = t("Out of Stock");
        textColor = "red.default";
        notBillingProduct = !Boolean(data?.negativeBilling);
      } else if (lowStockAlert && stockCount <= lowStockCount) {
        availabilityText = t("Running Low");
        textColor = "#F58634";
      }

      if (!Boolean(data?.negativeBilling)) {
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

    const prodData = productData(item.stocks?.[0]);

    const handlePress = () => {
      if (prodData.notBillingProduct) {
        showToast("error", t("Looks like the item is out of stock"));
        return;
      }

      if (Number(item?.prices[0]?.price || 0) > 0) {
        if (item.unit === "perItem") {
          setQuantity(1);
        } else {
          setQuantity();
        }
        setTotalPrice(Number(item?.prices[0]?.price || 0)?.toFixed(2));
      } else {
        setVariantData({
          ...item,
          boxSku: "",
          crateSku: "",
          boxRef: "",
          crateRef: "",
        });
        setVisibleProductCustomPrice(true);
      }

      setSelectedVariant({
        ...item,
        _id: item._id,
        localImage: item.localImage,
        name: item.name,
        type: item.type || "item",
        sku: item.sku,
        parentSku: item.parentSku,
        boxSku: "",
        image: item?.image,
        crateSku: "",
        boxRef: "",
        crateRef: "",
        unit: item.unit,
        code: item?.code || "",
        noOfUnits: 1,
        costPrice: item.prices[0]?.costPrice || 0,
        sellingPrice: item.prices[0]?.price,
        availability: item.stocks?.[0]
          ? item.stocks[0].enabledAvailability
          : true,
        tracking: item.stocks?.[0] ? item.stocks[0].enabledTracking : false,
        stockCount: item.stocks?.[0]?.stockCount
          ? item.stocks[0].stockCount
          : 0,
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
              {data.variants?.length > 1
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
                {getVariantPrice(item)}
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
      borderColor: isSelected(
        item.type === "crate" ? item.crateSku : item.boxSku
      )
        ? theme.colors.primary[1000]
        : theme.colors.white[1000],
      backgroundColor: theme.colors.white[1000],
    };

    const variant: any = data.variants?.find(
      (variant: any) => variant.sku === item.productSku
    );

    const prodData = productData(item?.stocks?.[0]);

    const handlePress = () => {
      if (prodData.notBillingProduct) {
        showToast("error", t("Looks like the item is out of stock"));
        return;
      }

      setQuantity(1);
      setTotalPrice(
        Number(item.prices?.[0]?.price || item?.price || 0)?.toFixed(2)
      );
      setSelectedVariant({
        ...item,
        _id: item._id,
        localImage: "",
        name: variant.name,
        code: item?.code || "",
        type: item.type,
        sku: item.type === "crate" ? item.crateSku : item.boxSku,
        parentSku: item.productSku,
        boxSku: item.boxSku,
        crateSku: item.type === "crate" ? item.crateSku : "",
        boxRef: item.type === "crate" ? item.boxRef : item._id,
        crateRef: item.type === "crate" ? item._id : "",
        unit: "perItem",
        noOfUnits: item.qty,
        costPrice: item.prices[0]?.costPrice || item?.costPrice || 0,
        sellingPrice: item.prices?.[0]?.price || item?.price,
        availability: item?.stocks?.[0]
          ? item.stocks[0].enabledAvailability
          : true,
        tracking: item?.stocks?.[0] ? item.stocks[0].enabledTracking : false,
        stockCount: item?.stocks?.[0]?.stockCount
          ? item.stocks[0].stockCount
          : 0,
        kitchenRefs: data?.kitchenRefs || [],
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
              {data.variants?.length > 1
                ? trimText(variant?.name?.en, 12) + ` x${item.qty}`
                : trimText(data?.name?.en, 12) + ` x${item.qty}`}
            </DefaultText>

            <DefaultText
              fontSize="lg"
              fontWeight="normal"
              color={"otherGrey.100"}
            >
              {getBoxCratePrice(item)}
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
    if (!data?.negativeBilling && selectedVariant.tracking) {
      const stockCount = getUpdatedProductStock(
        Number(selectedVariant?.stockCount),
        selectedVariant?.type,
        selectedVariant?.sku,
        Number(quantity),
        false
      );

      if (stockCount < 0) {
        showToast("error", t("Looks like the item is out of stock"));
        return;
      }
    }

    onChange({
      ...data,
      _id: data._id,
      image:
        selectedVariant.localImage ||
        selectedVariant?.image ||
        data?.localImage ||
        data.image ||
        "",
      name: data.name,
      categoryRef: data.categoryRef || "",
      category: { name: data.category.name },
      variantName: selectedVariant.name,
      type: selectedVariant.type,
      sku: selectedVariant.sku,
      parentSku: selectedVariant.parentSku,
      boxSku: selectedVariant.boxSku,
      crateSku: selectedVariant.crateSku,
      boxRef: selectedVariant.boxRef,
      crateRef: selectedVariant.crateRef,
      code: selectedVariant?.code || "",
      qty: Number(quantity),
      hasMultipleVariants: data?.scan
        ? Boolean(data?.multiVariants)
        : data?.variants?.length > 1,
      note: notes,
      unit: selectedVariant.unit,
      noOfUnits: selectedVariant.noOfUnits,
      costPrice: selectedVariant?.costPrice || 0,
      price: selectedVariant.sellingPrice,
      tax: selectedVariant.isOpenPrice
        ? Number(selectedVariant.vat)
        : Number(data.tax.name || data.tax.percentage),
      isOpenPrice: selectedVariant.isOpenPrice || false,
      availability: selectedVariant.availability,
      tracking: selectedVariant.tracking,
      stockCount: selectedVariant?.stockCount || 0,
      modifiers: [],
      channels: data?.channels,
      productModifiers: data?.modifiers,
      kitchenRefs: data?.kitchenRefs || [],
    });

    setSelectedVariant(null);

    handleClose();
  }, [selectedVariant, quantity]);

  useEffect(() => {
    if (visible) {
      const variant = data.variants[0];
      if (data?.variants?.length == 1 && Number(variant.prices[0]?.price)) {
        setSelectedVariant({
          ...variant,
          _id: variant._id,
          localImage: variant.localImage,
          name: variant.name,
          type: variant.type || "item",
          sku: variant.sku,
          parentSku: variant.parentSku,
          boxSku: "",
          crateSku: "",
          boxRef: "",
          crateRef: "",
          unit: variant.unit,
          code: selectedVariant?.code || "",
          noOfUnits: 1,
          costPrice: variant.prices[0]?.costPrice || 0,
          sellingPrice: variant.prices[0].price,
          availability: variant.stocks?.[0]
            ? variant.stocks[0].enabledAvailability
            : true,
          tracking: variant.stocks?.[0]
            ? variant.stocks[0].enabledTracking
            : false,
          stockCount: variant.stocks?.[0]?.stockCount
            ? variant.stocks[0].stockCount
            : 0,
          ...variant,
          kitchenRefs: data?.kitchenRefs || [],
        });
        setQuantity(1);
        setTotalPrice(Number(variant.prices[0].price)?.toFixed(2));
      }

      if (data.boxRefs?.length > 0) {
        repository.boxCratesRepository
          .findByProduct(data._id)
          .then((result) => {
            const boxes = result.filter((t) => t.type === "box");
            setBoxes(boxes);
          });
      }

      if (data.crateRefs?.length > 0) {
        repository.boxCratesRepository
          .findWithQuery({
            where: {
              type: "crate",
              status: "active",
              nonSaleable: false,
              productSku: data.variants.map((t: any) => t.sku),
            },
          })
          .then((result) => {
            setCrates(result);
          });
      }
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
              setSelectedVariant(null);
              handleClose();
            }}
            loading={loading}
            rightBtnText={data?.isAdd ? t("Add") : t("Save")}
            permission={true}
            handleRightBtn={() => {
              if (selectedVariant) {
                if (quantity > 0) {
                  setLoading(true);

                  if (onChange) {
                    handleChange();
                  } else {
                    setSelectedVariant({});
                    handleClose();
                  }
                  setLoading(false);
                } else {
                  if (selectedVariant != null) {
                    if (Number(quantity) == 0) {
                      showToast(
                        "error",
                        t("Entered value must be greater than 0")
                      );
                    } else {
                      if (selectedVariant?.unit == "perItem") {
                      } else if (selectedVariant?.unit == "perLitre") {
                        showToast("error", t("Please enter volume in litre"));
                      } else if (selectedVariant?.unit == "perGram") {
                        showToast("error", t("Please enter weight in gram"));
                      } else if (selectedVariant?.unit == "perKilogram") {
                        showToast("error", t("Please enter weight in kg"));
                      } else if (selectedVariant?.unit == "perOunce") {
                        showToast("error", t("Please enter weight in ounce"));
                      }
                    }
                  } else {
                    showToast("error", t("Please select variant"));
                  }
                }
              } else showToast("error", t("Please select variant"));
            }}
          />

          <KeyboardAvoidingView enabled={true}>
            <ScrollView
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingVertical: hp("2.25%"),
                paddingHorizontal: hp("2.5%"),
                marginTop: isKeyboardVisible ? "-3.4%" : "0%",
              }}
            >
              <View style={{ alignItems: "flex-end" }}>
                <CurrencyView
                  amount={selectedVariant ? totalPrice : "0"}
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
                      marginBottom: data.modifiers?.length > 0 ? 2 : 6,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <DefaultText fontSize="md" fontWeight="medium">
                      {t("VARIANTS")}
                    </DefaultText>

                    {data.variants?.length > 1 && (
                      <DefaultText fontSize="md" fontWeight="normal">
                        {" - " + t("CHOOSE ONE")}
                      </DefaultText>
                    )}
                  </View>

                  {data.modifiers?.length > 0 && (
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
                    {data.variants?.map((variant: any, index: number) => {
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
                      marginBottom: data.modifiers?.length > 0 ? 2 : 6,
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

                  {data.modifiers?.length > 0 && (
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
                      marginBottom: data.modifiers?.length > 0 ? 2 : 6,
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

                  {data.modifiers?.length > 0 && (
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
                    {crates?.map((box: any, index: number) => {
                      return renderBoxCrateItem(box, index);
                    })}
                  </View>
                </>
              )}

              {selectedVariant != null ? (
                selectedVariant?.type === "box" ||
                selectedVariant?.type === "crate" ||
                selectedVariant?.unit == "perItem" ? (
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
                ) : (
                  <>
                    <Label>{t(getUnitTitleValue[selectedVariant?.unit])}</Label>

                    <Input
                      containerStyle={{
                        borderWidth: 1,
                        borderRadius: 50,
                        borderColor: "#DFDFDFCC",
                        justifyContent: "center",
                        backgroundColor: "transparent",
                      }}
                      style={{
                        width: quantity == "" ? "99.5%" : "100%",
                        fontSize: 40,
                        textAlign: "center",
                        alignSelf: "center",
                      }}
                      keyboardType={"number-pad"}
                      placeholderText={
                        selectedVariant?.unit == "perLitre"
                          ? t("Enter volume")
                          : t("Enter weight")
                      }
                      values={`${quantity || ""}`}
                      handleChange={(val: any) => {
                        if (
                          val?.length < 10 &&
                          (val === "" || /^[0-9]*\.?[0-9]*$/.test(val))
                        ) {
                          const price =
                            val * Number(selectedVariant?.sellingPrice);

                          setQuantity(val);
                          setTotalPrice(price?.toFixed(2));
                        }
                      }}
                    />
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

              {/* <Spacer space={hp("5%")} />

              <Input
                style={{ width: "100%" }}
                label={t("NOTES")}
                autoCapitalize="sentence"
                placeholderText={t("Add a note")}
                values={notes}
                handleChange={(val: any) => {
                  setNotes(val);
                }}
              /> */}

              {!data?.isAdd && (
                <TouchableOpacity
                  style={{ marginTop: hp("5%"), maxWidth: wp("12%") }}
                  onPress={() => onDelete()}
                >
                  <DefaultText
                    fontSize="3xl"
                    fontWeight="normal"
                    color={"red.default"}
                  >
                    {t("Remove Item")}
                  </DefaultText>
                </TouchableOpacity>
              )}

              <Spacer space={hp("15%")} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>

      <ProductCustomPriceModal
        data={variantData}
        productName={
          data?.variants?.length > 1 ? variantData?.name : data?.name
        }
        isFromPriceModal={true}
        visible={visibleProductCustomPrice}
        handleClose={() => {}}
        handlePriceModalClose={(item: any) => {
          if (!item) {
            setSelectedVariant(null);
            setVisibleProductCustomPrice(false);
            return;
          }

          if (item.unit == "perItem") {
            setQuantity(1);
          } else {
            setQuantity();
          }

          setTotalPrice(Number(item?.sellingPrice || 0).toFixed(2));
          setSelectedVariant(item);
          setVisibleProductCustomPrice(false);
        }}
      />

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
    width: "27.5%",
    borderWidth: 0,
    paddingVertical: 16,
    borderColor: "#DFDFDFCC",
    alignItems: "center",
  },
});
