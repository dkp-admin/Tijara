import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { debugLog } from "../../../utils/log-patch";
import ActionSheetHeader from "../../action-sheet/action-sheet-header";
import { PrimaryButton } from "../../buttons/primary-button";
import RadioRow from "../../common/radio-row";
import SeparatorVerticalView from "../../common/separator-vertical-view";
import Spacer from "../../spacer";
import DefaultText from "../../text/Text";

const stockOptions = [
  { title: "All", value: "all" },
  { title: "Stock Received", value: "received" },
  { title: "Inventory Re-Count", value: "inventory-re-count" },
  { title: "Damage", value: "damaged" },
  { title: "Theft", value: "theft" },
  { title: "Loss", value: "loss" },
  { title: "Restock Return", value: "restock-return" },
  { title: "Batch Shift", value: "transfer" },
  { title: "Internal Transfer", value: "internal-transfer" },
  { title: "Billing", value: "billing" },
];

const batchOptions = [
  { title: "All", value: "all" },
  { title: "Available Stocks", value: "available-stocks" },
  { title: "Zero Stocks", value: "zero-stocks" },
  { title: "Negative Stocks", value: "negative-stocks" },
];

export default function StockBatchFilter({
  selectedTab,
  selectedValue,
  visible = false,
  handleClose,
  handleSelected,
}: {
  selectedTab: string;
  selectedValue: any;
  visible: boolean;
  handleClose: any;
  handleSelected: any;
}) {
  const theme = useTheme();

  const { hp, twoPaneView } = useResponsive();

  const [selectedOption, setSelectedOptions] = useState("");
  const [selectedStockBatch, setSelectedStockBatch] = useState({
    title: t("All"),
    value: "all",
  });

  const optionsList = [
    {
      title: t("Stocks"),
      desc: selectedStockBatch?.title,
      value: "stock",
    },
    {
      title: t("Batches"),
      desc: selectedStockBatch?.title,
      value: "batch",
    },
  ];

  useEffect(() => {
    if (visible) {
      setSelectedOptions(selectedTab);
      setSelectedStockBatch(selectedValue);
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
          backgroundColor: "transparent",
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
            isClose={false}
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
                if (option.value !== selectedTab) {
                  return;
                }

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

                    <DefaultText fontSize="md" color="otherGrey.200">
                      {option.desc}
                    </DefaultText>
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
              {selectedOption === "stock" && (
                <RadioRow
                  options={stockOptions}
                  selected={selectedStockBatch}
                  setSelected={setSelectedStockBatch}
                />
              )}

              {selectedOption === "batch" && (
                <RadioRow
                  options={batchOptions}
                  selected={selectedStockBatch}
                  setSelected={setSelectedStockBatch}
                />
              )}
            </View>
          </ScrollView>

          <View
            style={{
              ...styles.footer,
              paddingVertical: hp("3.5%"),
              paddingHorizontal: hp("2%"),
              backgroundColor: theme.colors.white[1000],
            }}
          >
            <View style={{ flex: 1 }}>
              <PrimaryButton
                reverse
                style={{ paddingVertical: hp("2%") }}
                textStyle={{ fontSize: 18 }}
                title={t("Reset")}
                onPress={() => {
                  debugLog(
                    "Reset stock history filter",
                    { title: "All", value: "all" },
                    "stock-history-modal",
                    "handleReset"
                  );
                  handleSelected({ title: t("All"), value: "all" });
                }}
              />
            </View>

            <Spacer space={hp("3%")} />

            <View style={{ flex: 1 }}>
              <PrimaryButton
                style={{ paddingVertical: hp("2%") }}
                textStyle={{ fontSize: 18 }}
                title={t("Apply")}
                onPress={() => {
                  debugLog(
                    "Apply stock history filter",
                    selectedStockBatch,
                    "stock-history-modal",
                    "handleApply"
                  );
                  handleSelected(selectedStockBatch);
                }}
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
