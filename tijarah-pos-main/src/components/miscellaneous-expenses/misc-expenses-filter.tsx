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
import useMiscexpensesStore from "../../store/misc-expenses-filter";
import { debugLog } from "../../utils/log-patch";
import ActionSheetHeader from "../action-sheet/action-sheet-header";
import { PrimaryButton } from "../buttons/primary-button";
import RadioRow from "../common/radio-row";
import SeparatorVerticalView from "../common/separator-vertical-view";
import DateInput from "../input/date-input";
import Spacer from "../spacer";
import DefaultText from "../text/Text";

export default function MiscExpensesFilter({
  visible = false,
  handleClose,
}: {
  visible: boolean;
  handleClose: any;
}) {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();

  const [selectedOption, setSelectedOptions] = useState("date-range");
  const [startDate, setStartDate] = useState(undefined) as any;
  const [endDate, setEndDate] = useState(undefined) as any;
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>({
    title: t("All"),
    value: "all",
  });
  const [selectedExpenseType, setSelectedExpenseType] = useState<any>({
    title: t("All"),
    value: "all",
  });
  const [selectedStatus, setSelectedStatus] = useState<any>({
    title: t("All"),
    value: "all",
  });
  const [loadingApply, setLoadingApply] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  const { miscExpensesFilter, setMiscExpensesFilter } =
    useMiscexpensesStore() as any;

  const optionsList = [
    { title: t("Date range"), value: "date-range", show: true },
    {
      title: t("Payment Method"),
      desc: selectedPaymentMethod?.title,
      value: "paymentMethod",
      show: true,
    },
    {
      title: t("Expense Type"),
      desc: selectedExpenseType?.title,
      value: "expenseType",
      show: false,
    },
    {
      title: t("Status"),
      desc: selectedStatus?.title,
      value: "status",
      show: true,
    },
  ];

  const paymentMethodOptions = [
    { title: t("All"), value: "all" },
    { title: t("Cash"), value: "cash" },
    { title: t("Card"), value: "card" },
    { title: t("Credit"), value: "credit" },
  ];

  const expenseTypeOptions = [
    { title: "All", value: "all" },
    {
      title: "Administrative",
      value: "administrative",
    },
    {
      title: "Medical",
      value: "medical",
    },
    {
      title: "Marketing",
      value: "marketing",
    },
    {
      title: "Rental",
      value: "rental",
    },
    {
      title: "Other",
      value: "other",
    },
  ];

  const statusOptions = [
    { title: t("All"), value: "all" },
    { title: t("Paid"), value: "paid" },
    { title: t("To be paid"), value: "to_be_paid" },
  ];

  const handleApplyFilter = () => {
    setLoadingApply(true);

    const fromDate = new Date(startDate);
    const toDate = new Date(endDate);

    const obj = {
      paymentMethod: selectedPaymentMethod,
      expenseType: selectedExpenseType,
      status: selectedStatus,
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

    debugLog(
      "Misc Expenses apply filter",
      obj,
      "misc-expenses-screen",
      "handleApplyFilter"
    );

    setMiscExpensesFilter(obj);

    handleClose();
    setLoadingApply(false);
  };

  const handleResetFilter = () => {
    setLoadingReset(true);

    const fromDate = new Date();
    const toDate = new Date();

    const obj: any = {
      dateRange: {
        from: fromDate,
        to: toDate,
      },
      paymentMethod: { title: t("All"), value: "all" },
      expenseType: { title: t("All"), value: "all" },
      status: { title: t("All"), value: "all" },
    };

    Object.keys(obj).map((o: any) => {
      if (!obj[o]) {
        delete obj[o];
      }
    });

    debugLog(
      "Misc Expenses reset filter",
      obj,
      "misc-expenses-screen",
      "handleResetFilter"
    );

    setMiscExpensesFilter(obj);

    handleClose();
    setLoadingReset(false);
  };

  useEffect(() => {
    if (visible) {
      debugLog(
        "Misc Expenses filter modal opened",
        {},
        "misc-expenses-screen",
        "miscExpensesFilterFunction"
      );
      setLoadingApply(false);
      setLoadingReset(false);
      setSelectedOptions("date-range");

      if (Object.keys(miscExpensesFilter).length == 0) {
        setSelectedPaymentMethod({ title: t("All"), value: "all" });
        setSelectedExpenseType({ title: t("All"), value: "all" });
        setSelectedStatus({ title: t("All"), value: "all" });
        setStartDate(new Date());
        setEndDate(new Date());
      } else {
        setSelectedPaymentMethod(miscExpensesFilter?.paymentMethod);
        setSelectedExpenseType(miscExpensesFilter?.expenseType);
        setSelectedStatus(miscExpensesFilter?.status);
        setStartDate(new Date(miscExpensesFilter?.dateRange?.from));
        setEndDate(new Date(miscExpensesFilter?.dateRange?.to));
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
              {optionsList.map((option) => {
                if (!option.show) {
                  return;
                }

                return (
                  <TouchableOpacity
                    key={option.value}
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
              {selectedOption == "date-range" && (
                <View style={{ marginHorizontal: hp("2.5%") }}>
                  <DateInput
                    containerStyle={{ paddingRight: 16 }}
                    label={t("FROM DATE")}
                    placeholderText={t("Select Date")}
                    mode={"date"}
                    values={startDate}
                    maximumDate={endDate}
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
                    values={endDate}
                    maximumDate={new Date()}
                    handleChange={(val: any) => {
                      setEndDate(val);
                    }}
                  />
                </View>
              )}

              {selectedOption === "paymentMethod" && (
                <RadioRow
                  options={paymentMethodOptions}
                  selected={selectedPaymentMethod}
                  setSelected={setSelectedPaymentMethod}
                />
              )}

              {selectedOption === "expenseType" && (
                <RadioRow
                  options={expenseTypeOptions}
                  selected={selectedExpenseType}
                  setSelected={setSelectedExpenseType}
                />
              )}

              {selectedOption === "status" && (
                <RadioRow
                  options={statusOptions}
                  selected={selectedStatus}
                  setSelected={setSelectedStatus}
                />
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
                  handleResetFilter();
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
  dateOptionsView: {
    borderRadius: 50,
    marginHorizontal: 6,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  drop_down_view: {
    width: "100%",
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
