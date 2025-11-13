import { FlashList } from "@shopify/flash-list";
import React, { useContext, useEffect, useState } from "react";
import { Keyboard, RefreshControl, StyleSheet, View } from "react-native";
import { useQuery } from "react-query";
import { t } from "../../../../i18n";
import AuthContext from "../../../context/auth-context";
import { PrinterRepository } from "../../../database/printer/printer-repo";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { AuthType } from "../../../types/auth-types";
import { db, repo } from "../../../utils/createDatabaseConnection";
import { debugLog } from "../../../utils/log-patch";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import AddEditPrinterModal from "./add-printer-modal";
import PrinterHeader from "./printer-header";
import PrinterRow from "./printer-row";

const PrinterList = () => {
  const { hp } = useResponsive();
  const printerRepository = new PrinterRepository(db);
  const authContext = useContext<AuthType>(AuthContext);

  const [refreshing] = useState(false);
  const [printerData, setPrinterData] = useState({});
  const [visibleEditPrinter, setVisibleEditPrinter] = useState(false);
  const { data: printers } = useQuery("find-printers", () => {
    debugLog(
      "Printers fetched from db",
      {},
      "setting-printer-screen",
      "fetchPrinters"
    );
    return repo.printer.find({});
  }) as any;

  if (!authContext.permission["pos:printer"]?.read) {
    debugLog(
      "Permission denied to view this screen",
      {},
      "setting-printer-screen",
      "handlePermission"
    );

    return (
      <View style={{ marginHorizontal: 16 }}>
        <NoDataPlaceholder
          title={t("You don't have permissions to view this screen")}
          marginTop={hp("35%")}
        />
      </View>
    );
  }

  useEffect(() => {
    printerRepository.printers();
  }, []);

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
                debugLog(
                  "Add printer modal opened",
                  data,
                  "setting-printer-screen",
                  "handleEditPrinter"
                );
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
                debugLog(
                  "Add printer modal opened",
                  {},
                  "setting-printer-screen",
                  "handleAddPrinter"
                );
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
            debugLog(
              "Add printer modal closed",
              {},
              "setting-printer-screen",
              "handleClose"
            );
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
