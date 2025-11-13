import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Checkbox from "react-native-bouncy-checkbox";
import Toast from "react-native-toast-message";
import i18n, { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { checkDirection } from "../../../../hooks/check-direction";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import { getUpdatedProductStock } from "../../../../utils/check-updated-product-stock";
import {
  UNIT_OPTIONS,
  getUnitTitle,
  getUnitTitleValue,
} from "../../../../utils/constants";
import { getItemSellingPrice, getItemVAT } from "../../../../utils/get-price";
import ICONS from "../../../../utils/icons";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import Input from "../../../input/input";
import SelectInput from "../../../input/select-input";
import CurrencyView from "../../../modal/currency-view-modal";
import Spacer from "../../../spacer";
import DefaultText from "../../../text/Text";
import Label from "../../../text/label";
import showToast from "../../../toast";
import { useCurrency } from "../../../../store/get-currency";

export default function EditItemModal({
  data,
  visible = false,
  handleClose,
  onChange,
  businessDetails,
}: {
  data: any;
  visible: boolean;
  handleClose: any;
  onChange: any;
  businessDetails: any;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { hp, twoPaneView } = useResponsive();
  const { currency } = useCurrency();
  const [itemName, setItemName] = useState("");
  const [unit, setUnit] = useState({ value: "", key: "" });
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [title, setTitle] = useState("");
  const [showCustomised, setShowCustomised] = useState(false);
  const [selectedModifier, setSelectedModifier] = useState<any>([]);

  const checkOutOfStockItem = (val: any) => {
    if (!Boolean(businessDetails?.location?.negativeBilling) && data.tracking) {
      const stockCount = getUpdatedProductStock(
        data.stockCount,
        data.type,
        data.sku,
        Number(val) - data.qty,
        false
      );

      if (stockCount < 0) {
        showToast("error", t("Looks like the item is out of stock"));
      } else {
        setQuantity(val);
      }
    } else {
      setQuantity(val);
    }
  };

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

  const handleUpdate = () => {
    if (!itemName.trim()) {
      showToast("error", t("Item name is required"));
      return;
    }

    if (quantity <= 0) {
      showToast("error", t("Quantity cannot be less than 1"));
      return;
    }

    if (data?.modifiers?.length > 0 && checkModifierSelected()) {
      return;
    }

    const name: any = {
      en: data?.name.en,
      ar: data?.name.ar,
    };

    if (data?.isOpenItem) {
      name[i18n.currentLocale()] = itemName;
    }

    const updatedDiscountedTotal = Number(data.discountedTotal) || 0;

    const updatedDiscountedVat = Number(data.discountedVatAmount) || 0;

    const subTotal = selectedModifier?.reduce(
      (pc: number, item: any) => pc + item?.subTotal,
      0
    );

    const vatAmount = selectedModifier?.reduce(
      (pc: number, item: any) => pc + item?.vatAmount,
      0
    );

    console.log(
      vatAmount,
      totalPrice,
      updatedDiscountedTotal,
      subTotal,
      updatedDiscountedVat,
      {
        ...data,
      },
      "DATFAYDFTASD"
    );

    onChange({
      ...data,
      qty: quantity,
      note: notes,
      name: name,
      notes: notes,
      unit: unit?.key,
      total: totalPrice,
      discountedTotal: updatedDiscountedTotal,
      discountedVatAmount: updatedDiscountedVat,
      sellingPrice: data?.itemSubTotal + subTotal,
      vatAmount: data?.itemVAT + vatAmount,
      modifiers: selectedModifier,
    });

    handleClose();
  };

  const getModifierName = () => {
    let name = "";

    selectedModifier?.map((mod: any) => {
      name += `${name === "" ? "" : ","} ${mod.name} - ${mod.optionName}`;
    });

    return name;
  };

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
              showToast("info", t("This option has been sold out"));
            } else if (!maxModifierSelected(modifier, option)) {
              updateModifier(modifier, option);
            } else {
              showToast(
                "info",
                "Already selected maximum options for this modifier"
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
                {`${currency} ${option.price?.toFixed(2)}`}
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

  useEffect(() => {
    if (visible) {
      const unitData = UNIT_OPTIONS.filter(
        (unit: any) => unit?.key == data?.unit
      );
      const name = data?.name?.[i18n.currentLocale()];

      setItemName(name);
      setSelectedModifier(data?.modifiers || []);
      setUnit({ value: unitData[0]?.value, key: unitData[0]?.key });
    }
  }, [visible]);

  useEffect(() => {
    setQuantity(data?.qty);
    setTitle(t(getUnitTitleValue[unit?.key]));
    setNotes(data?.note);
  }, [unit, data]);

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

          <KeyboardAvoidingView
            enabled={true}
            behavior={"height"}
            keyboardVerticalOffset={Platform.OS == "ios" ? 50 : 20}
          >
            <ScrollView
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingVertical: hp("3%"),
                paddingHorizontal: hp("2.5%"),
              }}
            >
              {data?.isOpenItem && (
                <>
                  <Input
                    style={{
                      width: "100%",
                    }}
                    label={t("ITEM NAME")}
                    autoCapitalize="words"
                    placeholderText={t("Enter item name")}
                    values={itemName}
                    handleChange={(val: any) => {
                      setItemName(val);
                    }}
                    maxLength={60}
                  />

                  <Spacer space={hp("4%")} />

                  <SelectInput
                    label={t("ITEM UNIT")}
                    containerStyle={{ borderWidth: 0 }}
                    allowSearch={false}
                    leftText={t("Unit")}
                    clearValues={unit.key == ""}
                    placeholderText={t("Select Unit")}
                    options={UNIT_OPTIONS}
                    values={unit}
                    handleChange={(val: any) => {
                      if (val.key && val.value) {
                        setUnit(val);
                      }
                    }}
                  />
                </>
              )}

              <Spacer space={hp("3.75%")} />

              {unit?.key == null || unit?.key == "perItem" ? (
                <>
                  <Label>{title}</Label>

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
                        opacity: quantity <= 1 ? 0.25 : 1,
                        borderRightWidth: 1,
                      }}
                      onPress={() => {
                        if (quantity > 1) {
                          setQuantity(quantity - 1);
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
                        height: 70,
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
                          if (val?.length < 10) {
                            checkOutOfStockItem(Number(val));
                          }
                        }
                      }}
                    />

                    <TouchableOpacity
                      style={{ ...styles.add_minus_view, borderLeftWidth: 1 }}
                      onPress={() => {
                        checkOutOfStockItem(quantity + 1);
                      }}
                    >
                      <ICONS.PlusIcon />
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Label>{title}</Label>

                  <Input
                    containerStyle={{
                      borderWidth: 1,
                      borderRadius: 50,
                      borderColor: "#DFDFDFCC",
                      backgroundColor: "transparent",
                    }}
                    style={{
                      height: 70,
                      width: quantity ? "100%" : "99.9%",
                      fontSize: 40,
                      textAlign: "center",
                    }}
                    keyboardType={"number-pad"}
                    placeholderText={
                      unit?.key == "perLitre"
                        ? t("Enter volume")
                        : t("Enter weight")
                    }
                    values={`${quantity}`}
                    handleChange={(val: any) => {
                      if (
                        val?.length < 10 &&
                        (val === "" || /^[0-9]*\.?[0-9]*$/.test(val))
                      ) {
                        checkOutOfStockItem(val);
                      }
                    }}
                  />
                </>
              )}

              <Spacer space={hp("3%")} />

              <Input
                style={{ width: "100%" }}
                label={t("NOTES")}
                autoCapitalize="sentence"
                placeholderText={t("Add a note")}
                values={notes}
                handleChange={(val: any) => {
                  setNotes(val);
                }}
              />

              <Spacer space={hp("4%")} />

              <Input
                style={{ width: "100%" }}
                label={`${t("ITEM PRICE")} ${getUnitTitle[unit.key]}`}
                keyboardType={"number-pad"}
                placeholderText={t("Enter price")}
                values={`${currency} ${Number(
                  data?.sellingPrice + data?.vatAmount
                )?.toFixed(2)}`}
                handleChange={(val: any) => {}}
                disabled
              />

              {data?.productModifiers?.length > 0 && (
                <View>
                  <DefaultText
                    style={{
                      marginTop: hp("4%"),
                      marginBottom: hp("0.5%"),
                      paddingHorizontal: hp("2.5%"),
                    }}
                    fontSize="2xl"
                    fontWeight="medium"
                  >
                    {t("Customise as per your taste")}
                  </DefaultText>

                  {data?.productModifiers?.map((modifier: any) => {
                    if (modifier.status === "inactive") {
                      return (
                        <React.Fragment
                          key={modifier.modifierRef}
                        ></React.Fragment>
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
                </View>
              )}

              <Spacer
                space={
                  data?.productModifiers?.length > 0 ? hp("25%") : hp("22%")
                }
              />
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

            {showCustomised && (
              <View>
                <DefaultText
                  style={{ paddingVertical: 12, paddingHorizontal: 16 }}
                  fontSize="lg"
                  fontWeight="medium"
                >
                  {getModifierName()}
                </DefaultText>

                <View
                  style={{
                    height: 1,
                    width: "100%",
                    backgroundColor: theme.colors.dividerColor.secondary,
                  }}
                />
              </View>
            )}

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
                  borderRadius: 10,
                  marginRight: 16,
                  backgroundColor: "transparent",
                }}
              >
                <CurrencyView
                  amount={`${(totalPrice || 0)?.toFixed(2)}`}
                  symbolFontweight="normal"
                  symbolFontsize={twoPaneView ? 16 : 12}
                  amountFontsize={twoPaneView ? 30 : 22}
                  decimalFontsize={twoPaneView ? 30 : 22}
                />

                {data?.modifiers?.length > 0 && (
                  <TouchableOpacity
                    style={{ paddingTop: 3 }}
                    onPress={() => {
                      setShowCustomised(!showCustomised);
                    }}
                  >
                    <DefaultText
                      style={{ marginTop: 3 }}
                      fontSize={twoPaneView ? "md" : "sm"}
                      fontWeight="medium"
                      color="red.default"
                    >
                      {t("View Customised Items")}
                    </DefaultText>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={{
                  width: twoPaneView ? "45%" : "55%",
                  borderRadius: 16,
                  paddingVertical: 15,
                  paddingHorizontal: 12,
                  backgroundColor: theme.colors.primary[1000],
                }}
                onPress={() => handleUpdate()}
              >
                <DefaultText
                  style={{ textAlign: "center" }}
                  fontSize={twoPaneView ? "2xl" : "lg"}
                  fontWeight={twoPaneView ? "medium" : "normal"}
                  color="white.1000"
                >
                  {t("Update Item to Cart")}
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
    width: "27.5%",
    borderWidth: 0,
    paddingVertical: 10,
    borderColor: "#DFDFDFCC",
    alignItems: "center",
  },
});
