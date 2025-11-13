import { FlashList } from "@shopify/flash-list";
import React, { useContext, useEffect, useState } from "react";
import { Keyboard, RefreshControl, StyleSheet, View } from "react-native";
import { useQuery } from "react-query";
import { t } from "../../../../i18n";
import AuthContext from "../../../context/auth-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { AuthType } from "../../../types/auth-types";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import AddEditPrinterModal from "./add-printer-modal";
import PrinterHeader from "./printer-header";
import PrinterRow from "./printer-row";
import repository from "../../../db/repository";
import * as ExpoPrintHelp from "expo-print-help";

const PrinterList = () => {
  const { hp } = useResponsive();

  const authContext = useContext<AuthType>(AuthContext);

  const [refreshing] = useState(false);
  const [printerData, setPrinterData] = useState({});
  const [visibleEditPrinter, setVisibleEditPrinter] = useState(false);
  const { data: printers } = useQuery("find-printers", () => {
    return repository.printerRepository.findAll();
  }) as any;

  useEffect(() => {
    repository.printerRepository
      .init()
      .then((r) => {})
      .catch((r) => {});
  }, []);

  if (!authContext.permission["pos:printer"]?.read) {
    return (
      <View style={{ marginHorizontal: 16 }}>
        <NoDataPlaceholder
          title={t("You don't have permissions to view this screen")}
          marginTop={hp("35%")}
        />
      </View>
    );
  }

  return (
    <View style={{ ...styles.container }}>
      <FlashList
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {}} />
        }
        onEndReached={() => {}}
        onEndReachedThreshold={0.01}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={Keyboard.dismiss}
        data={printers || []}
        estimatedItemSize={hp("12%")}
        renderItem={({ item, index }) => {
          return (
            <PrinterRow
              data={item}
              isFirst={index == 0}
              isLast={index == printers.length - 1}
              handleOnPress={(data: any) => {
                setPrinterData({ isAdd: false, printer: data });
                setVisibleEditPrinter(true);
              }}
            />
          );
        }}
        ListHeaderComponent={() => {
          return (
            <PrinterHeader
              handleAdd={() => {
                setPrinterData({ isAdd: true });
                setVisibleEditPrinter(true);
              }}
            />
          );
        }}
        ListEmptyComponent={() => {
          return (
            <View style={{ marginHorizontal: 16 }}>
              <NoDataPlaceholder
                title={t("No Printers!")}
                marginTop={hp("30%")}
              />
            </View>
          );
        }}
        ListFooterComponent={() => <View style={{ height: hp("10%") }} />}
      />

      {visibleEditPrinter && (
        <AddEditPrinterModal
          data={printerData}
          visible={visibleEditPrinter}
          handleClose={() => {
            setVisibleEditPrinter(false);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PrinterList;
