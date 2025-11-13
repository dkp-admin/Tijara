import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ICONS from "../../../utils/icons";
import ActionSheetHeader from "../../action-sheet/action-sheet-header";
import TabButton from "../../buttons/tab-button";
import DefaultText from "../../text/Text";
import Batches from "./batches";
import StockBatchFilter from "./stock-batch-filter";
import StockChanges from "./stock-changes";
import { checkDirection } from "../../../hooks/check-direction";
import { debugLog } from "../../../utils/log-patch";

export default function StockHistory({
  data,
  visible = false,
  handleClose,
  handleDone,
}: {
  data: any;
  visible: boolean;
  handleClose: any;
  handleDone: any;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { hp, twoPaneView } = useResponsive();

  const [activeTab, setActiveTab] = useState(0);
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedStockBatch, setSelectedStockBatch] = useState({
    title: t("All"),
    value: "all",
  });

  useEffect(() => {
    if (visible) {
      setActiveTab(0);
      setSelectedStockBatch({ title: t("All"), value: "all" });
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
            title={t("Stock History")}
            handleLeftBtn={() => handleClose()}
          />

          <TabButton
            tabs={[t("Stock Changes"), t("Batches")]}
            activeTab={activeTab}
            onChange={(tab: number) => {
              setSelectedStockBatch({ title: t("All"), value: "all" });
              setActiveTab(tab);
            }}
          />

          <View
            style={{
              paddingVertical: hp("1.5%"),
              paddingHorizontal: hp("3.5%"),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <DefaultText fontWeight="medium">
              {isRTL
                ? `${data.productName.ar}, ${data.variant.ar_name}`
                : `${data.productName.en}, ${data.variant.en_name}`}
            </DefaultText>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <DefaultText fontSize="lg" fontWeight="medium">
                {t(selectedStockBatch.title)}
              </DefaultText>

              <TouchableOpacity
                style={{ marginLeft: 12 }}
                onPress={() => {
                  debugLog(
                    "Stock history filter modal opened",
                    {},
                    "stock-history-modal",
                    "handleOnPress"
                  );
                  setOpenFilter(true);
                }}
              >
                {selectedStockBatch.value === "all" ? (
                  <ICONS.FilterSquareIcon />
                ) : (
                  <ICONS.FilterAppliedIcon />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {activeTab === 0 && (
            <StockChanges variant={data.variant} filter={selectedStockBatch} />
          )}

          {activeTab === 1 && (
            <Batches variant={data.variant} filter={selectedStockBatch} />
          )}
        </View>
      </View>

      <StockBatchFilter
        selectedTab={activeTab == 0 ? "stock" : "batch"}
        selectedValue={selectedStockBatch}
        visible={openFilter}
        handleClose={() => {
          debugLog(
            "Stock history filter modal closed",
            {},
            "stock-history-modal",
            "handleClose"
          );
          setOpenFilter(false);
        }}
        handleSelected={(data: any) => {
          setSelectedStockBatch(data);
          setOpenFilter(false);
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
});
