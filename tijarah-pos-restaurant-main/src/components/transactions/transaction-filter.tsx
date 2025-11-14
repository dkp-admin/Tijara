import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import useCommonApis from "../../hooks/useCommonApis";
import useTransactionStore from "../../store/transaction-filter";
import { ChannelsName, PROVIDER_NAME } from "../../utils/constants";
import ActionSheetHeader from "../action-sheet/action-sheet-header";
import { PrimaryButton } from "../buttons/primary-button";
import RadioRow from "../common/radio-row";
import SeparatorVerticalView from "../common/separator-vertical-view";
import DateInput from "../input/date-input";
import Spacer from "../spacer";
import DefaultText from "../text/Text";

export default function TransactionFilter({
  visible = false,
  handleClose,
}: {
  visible: boolean;
  handleClose?: any;
}) {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();
  const { businessData } = useCommonApis();

  const [selectedOption, setSelectedOptions] = useState("payment-method");
  const [selectedMethod, setSelectedMethod] = useState<any>("");
  const [selectedType, setSelectedType] = useState<any>("");
  const [selectedStatus, setSelectedStatus] = useState<any>("");
  const [selectedDiscount, setSelectedDiscount] = useState<any>("");
  const [selectedOrderType, setSelectedOrderType] = useState<any>("");
  const [selectedSource, setSelectedSource] = useState<any>("");
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<any>("");
  const [startDate, setStartDate] = useState(undefined) as any;
  const [endDate, setEndDate] = useState(undefined) as any;
  const [loadingApply, setLoadingApply] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  const { setTransactionFilter, transactionFilter } =
    useTransactionStore() as any;

  const optionsList = [
    {
      title: t("Payment method"),
      desc: selectedMethod?.title,
      value: "payment-method",
    },
    {
      title: t("Payment type"),
      desc: selectedType?.title,
      value: "transaction-type",
    },
    {
      title: t("Order type"),
      desc: selectedOrderType?.title,
      value: "order-type",
    },
    {
      title: t("Source"),
      desc: selectedSource?.title,
      value: "source",
    },
    {
      title: t("Order status"),
      desc: selectedOrderStatus?.title,
      value: "order-status",
    },
    // {
    //   title: t("Payment status"),
    //   desc: selectedStatus?.title,
    //   value: "payment-status",
    // },
    { title: t("Discount"), desc: selectedDiscount?.title, value: "discount" },
    { title: t("Date range"), value: "date-range" },
  ];

  const paymentMethodOptions = [
    { title: t("All methods"), value: "all" },
    { title: t("Cash"), value: PROVIDER_NAME.CASH },
    { title: t("Card"), value: PROVIDER_NAME.CARD },
    { title: t("Wallet"), value: PROVIDER_NAME.WALLET },
    { title: t("Credit"), value: PROVIDER_NAME.CREDIT },
    { title: t("Jahez"), value: "jahez" },
    { title: t("HungerStation"), value: "hungerstation" },
    { title: t("Careem"), value: "careem" },
    { title: t("ToYou"), value: "toyou" },
    { title: t("Barakah"), value: "barakah" },
    { title: t("Ninja"), value: "ninja" },
    { title: t("STC Pay"), value: "stcpay" },
    { title: t("Nearpay"), value: "nearpay" },
  ];

  const transactionTypeOptions = [
    { title: t("All types"), value: "all" },
    // { title: t("Payment"), value: "payment" },
    { title: t("Refunds Only"), value: "refunds" },
  ];

  const orderTypeOptions = [{ title: t("All"), value: "all" }];

  if (businessData?.location?.channel?.length > 0) {
    businessData?.location?.channel?.forEach((type: any) => {
      orderTypeOptions.push({
        title: ChannelsName[type.name] || type.name,
        value: ChannelsName[type.name] || type.name,
      });
    });
  }

  const sourceOptions = [
    { title: t("All"), value: "all" },
    { title: t("Online"), value: "online" },
    { title: "QR", value: "qr" },
  ];

  const orderStatusOptions = [
    { title: t("All"), value: "all" },
    { title: t("Completed"), value: "completed" },
    { title: t("Cancelled"), value: "cancelled" },
  ];

  const paymentStatusOptions = [
    { title: t("All statuses"), value: "all" },
    { title: t("Completed"), value: "completed" },
    { title: t("Partially paid"), value: "partiallyPaid" },
    { title: t("Awaiting capture"), value: "awaitingCapture" },
  ];

  const discountOptions = [
    { title: t("All"), value: "all" },
    { title: t("Yes"), value: "yes" },
    { title: t("No"), value: "no" },
  ];

  const handleApplyFilter = () => {
    setLoadingApply(true);

    const fromDate = new Date(startDate);
    const toDate = new Date(endDate);

    const obj = {
      paymentMethod: selectedMethod,
      transactionType: selectedType,
      orderType: selectedOrderType,
      source: selectedSource,
      orderStatus: selectedOrderStatus,
      paymentStatus: selectedStatus,
      discount: selectedDiscount,
    } as any;

    if (startDate && endDate) {
      obj["dateRange"] = {
        from: fromDate,
        to: toDate,
      };
    }

    Object.keys(obj).map((o: any) => {
      if (!obj[o]) {
        delete obj[o];
      }
    });

    setTransactionFilter(obj);

    handleClose();
    setLoadingApply(false);
  };

  useEffect(() => {
    if (visible) {
      setLoadingApply(false);
      setLoadingReset(false);
      setSelectedOptions("payment-method");

      if (Object.keys(transactionFilter).length == 0) {
        setSelectedMethod("");
        setSelectedType("");
        setSelectedOrderType("");
        setSelectedSource("");
        setSelectedOrderStatus("");
        setSelectedStatus("");
        setSelectedDiscount("");
        setStartDate(undefined);
        setEndDate(undefined);
      } else {
        setSelectedMethod(transactionFilter?.paymentMethod);
        setSelectedType(transactionFilter?.transactionType);
        setSelectedOrderType(transactionFilter?.orderType);
        setSelectedSource(transactionFilter?.source);
        setSelectedOrderStatus(transactionFilter?.orderStatus);
        setSelectedStatus(transactionFilter?.paymentStatus);
        setSelectedDiscount(transactionFilter?.discount);
        setStartDate(transactionFilter?.dateRange?.from);
        setEndDate(transactionFilter?.dateRange?.to);
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
            title={t("Filter")}
            handleLeftBtn={() => handleClose()}
          />

          <ScrollView contentContainerStyle={{ flex: 1, flexDirection: "row" }}>
            <View
              style={{
                flex: 0.35,
                height: "100%",
                backgroundColor: theme.colors.white[1000],
              }}
            >
              {optionsList.map((option, index) => {
                return (
                  <TouchableOpacity
                    key={index}
                    style={{
                      paddingHorizontal: 22,
                      paddingVertical: option.desc ? 10 : 20,
                      backgroundColor:
                        selectedOption == option.value
                          ? "#F2F2F2"
                          : "transparent",
                    }}
                    onPress={() => {
                      setSelectedOptions(option.value);
                    }}
                  >
                    <DefaultText>{option.title}</DefaultText>

                    {option.desc && (
                      <DefaultText fontSize="md" color="otherGrey.200">
                        {option.desc}
                      </DefaultText>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <SeparatorVerticalView />

            <View
              style={{
                flex: 0.65,
                height: "100%",
                marginTop: hp("3%"),
              }}
            >
              {selectedOption == "payment-method" && (
                <RadioRow
                  options={paymentMethodOptions}
                  selected={selectedMethod}
                  setSelected={setSelectedMethod}
                />
              )}

              {selectedOption == "transaction-type" && (
                <RadioRow
                  options={transactionTypeOptions}
                  selected={selectedType}
                  setSelected={setSelectedType}
                />
              )}

              {selectedOption == "order-type" && (
                <RadioRow
                  options={orderTypeOptions}
                  selected={selectedOrderType}
                  setSelected={setSelectedOrderType}
                />
              )}

              {selectedOption == "source" && (
                <RadioRow
                  options={sourceOptions}
                  selected={selectedSource}
                  setSelected={setSelectedSource}
                />
              )}

              {selectedOption == "order-status" && (
                <RadioRow
                  options={orderStatusOptions}
                  selected={selectedOrderStatus}
                  setSelected={setSelectedOrderStatus}
                />
              )}

              {selectedOption == "payment-status" && (
                <RadioRow
                  options={paymentStatusOptions}
                  selected={selectedStatus}
                  setSelected={setSelectedStatus}
                />
              )}

              {selectedOption == "discount" && (
                <RadioRow
                  options={discountOptions}
                  selected={selectedDiscount}
                  setSelected={setSelectedDiscount}
                />
              )}

              {selectedOption == "date-range" && (
                <View style={{ marginHorizontal: hp("2.5%") }}>
                  <DateInput
                    containerStyle={{ paddingRight: 16 }}
                    label={t("FROM DATE")}
                    placeholderText={t("Select Date")}
                    mode={"date"}
                    values={startDate}
                    maximumDate={endDate || new Date()}
                    handleChange={(val: any) => {
                      setStartDate(val);
                    }}
                  />

                  <Spacer space={hp("3%")} />

                  <DateInput
                    containerStyle={{ paddingRight: 16 }}
                    label={t("TO DATE")}
                    placeholderText={t("Select Date")}
                    mode={"date"}
                    minimumDate={startDate}
                    maximumDate={new Date()}
                    values={endDate}
                    handleChange={(val: any) => {
                      setEndDate(val);
                    }}
                  />
                </View>
              )}
            </View>
          </ScrollView>

          <View
            style={{
              ...styles.footer,
              paddingVertical: hp("3.5%"),
              paddingHorizontal: hp("2%"),
              backgroundColor: "#FFFFFF",
            }}
          >
            <View style={{ flex: 1 }}>
              <PrimaryButton
                reverse
                style={{ paddingVertical: hp("2%") }}
                textStyle={{ fontSize: 18 }}
                loading={loadingReset}
                title={t("Reset")}
                onPress={() => {
                  setLoadingReset(true);
                  setTransactionFilter({});
                  handleClose();
                  setLoadingReset(false);
                }}
              />
            </View>

            <Spacer space={hp("3%")} />

            <View style={{ flex: 1 }}>
              <PrimaryButton
                style={{ paddingVertical: hp("2%") }}
                textStyle={{ fontSize: 18 }}
                loading={loadingApply}
                title={t("Apply")}
                onPress={handleApplyFilter}
              />
            </View>
          </View>
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
  footer: {
    flex: 1,
    bottom: 0,
    margin: 0,
    width: "100%",
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    elevation: 24,
    shadowRadius: 24,
    shadowOpacity: 24,
    shadowColor: "#15141F",
    shadowOffset: { width: 16, height: 16 },
  },
});
