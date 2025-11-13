import { useNavigation } from "@react-navigation/core";
import React, { useContext, useMemo, useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { t } from "../../../../../i18n";
import AuthContext from "../../../../context/auth-context";
import { useTheme } from "../../../../context/theme-context";
import { checkInternet } from "../../../../hooks/check-internet";
import usePrinterStatus from "../../../../hooks/use-printer-status";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import { queryClient } from "../../../../query-client";
import useCartStore from "../../../../store/cart-item-dinein";
import { AuthType } from "../../../../types/auth-types";
import MMKVDB from "../../../../utils/DB-MMKV";
import { repo } from "../../../../utils/createDatabaseConnection";
import dineinCart from "../../../../utils/dinein-cart";
import ICONS from "../../../../utils/icons";
import { debugLog } from "../../../../utils/log-patch";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import { PrimaryButton } from "../../../buttons/primary-button";
import Spacer from "../../../spacer";
import DefaultText from "../../../text/Text";
import PrintPreviewModal from "../../print-preview/print-preview";
import SendReceiptModal from "../../send-receipt/send-receipt";

export default function CashChangeModalDinein({
  data,
  visible = false,
  handleClose,
  handleSendReceipt,
  handlePrintReceipt,
}: {
  data: any;
  visible: boolean;
  handleClose?: any;
  handleSendReceipt?: any;
  handlePrintReceipt?: any;
}) {
  const theme = useTheme();
  const isConnected = checkInternet();
  const navigation = useNavigation() as any;
  const { wp, hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);
  const { isConnected: isPrinterConnected } = usePrinterStatus();
  const [showWebView, setShowWebView] = useState(false);
  const [showSendReceipt, setShowSendReceipt] = useState(false);
  const [previewData] = useState<any>(null);
  const { setOrder, setLastOrder } = useCartStore();

  const totalPaid = useMemo(
    () =>
      data?.payment?.breakup?.reduce(
        (prev: any, cur: any) => prev + Number(cur.total),
        0
      ),
    [data]
  );

  const totalCharges = useMemo(
    () =>
      data?.payment?.charges?.reduce(
        (prev: any, cur: any) => prev + Number(cur.total),
        0
      ),
    [data]
  );

  const total = useMemo(() => {
    if (data?.items?.length > 0) {
      return data.items.reduce(
        (prev: any, cur: any) => Number((prev + Number(cur.total))?.toFixed(2)),
        0
      );
    }
    return 0;
  }, [data]);

  useMemo(() => {
    if (data) {
      setLastOrder(data);
    }
  }, [data]);

  const handleRestore = async (data: any) => {
    const sectionDocActive = await repo.sectionTables.findOne({
      where: { _id: data?.sectionRef },
    });

    const findOtherTable = sectionDocActive?.tables.find(
      (tab) =>
        tab.parentTable === data?.parentTable && tab.label !== data?.label
    );

    const tablesIds = [data.id, findOtherTable?.id];

    const updatedtables = sectionDocActive?.tables?.filter(
      (table) => !tablesIds.includes(table.id)
    );

    const mergeTable = {
      capacity: Number(data?.parentTableCapacity),
      id: data?.parentTableRef,
      label: data?.parentTable,
      openedAt: new Date().toISOString(),
      sectionRef: data?.sectionRef,
      status: "true",
      waiter: { name: "" },
      waiterRef: "",
      parentTable: "",
      parentTableRef: "",
      childTable: false,
    };

    updatedtables?.push(mergeTable);

    await repo.sectionTables.update(
      {
        _id: sectionDocActive?._id,
      },
      {
        _id: sectionDocActive?._id,
        company: sectionDocActive?.company,
        companyRef: sectionDocActive?.companyRef,
        floorType: sectionDocActive?.floorType,
        location: sectionDocActive?.location,
        locationRef: sectionDocActive?.locationRef,
        name: sectionDocActive?.name,
        numberOfTable: sectionDocActive?.numberOfTable,
        status: sectionDocActive?.status,
        tableNaming: sectionDocActive?.tableNaming,
        tables: updatedtables,
      }
    );

    await queryClient.invalidateQueries("find-section-tables");

    debugLog(
      "Table Status Updated",
      { ...sectionDocActive, tables: updatedtables },
      "table-guest-modal",
      "formik-open-table-funtion"
    );
  };

  const handleSplit = async (data: any) => {
    const sectionDocActive = await repo.sectionTables.findOne({
      where: { _id: data?.sectionRef },
    });

    const table1 = {
      ...data?.childOne,
    };

    const table2 = {
      ...data?.childTwo,
    };

    const updatedtables: any = sectionDocActive?.tables?.filter(
      (table) => table.id !== data?.id
    );

    updatedtables.push(table1, table2);

    await repo.sectionTables.update(
      {
        _id: sectionDocActive?._id,
      },
      {
        _id: sectionDocActive?._id,
        company: sectionDocActive?.company,
        companyRef: sectionDocActive?.companyRef,
        floorType: sectionDocActive?.floorType,
        location: sectionDocActive?.location,
        locationRef: sectionDocActive?.locationRef,
        name: sectionDocActive?.name,
        numberOfTable: sectionDocActive?.numberOfTable,
        status: sectionDocActive?.status,
        tableNaming: sectionDocActive?.tableNaming,
        tables: updatedtables,
      }
    );

    await queryClient.invalidateQueries("find-section-tables");

    debugLog(
      "Table Status Updated",
      { ...sectionDocActive, tables: updatedtables },
      "table-guest-modal",
      "formik-open-table-funtion"
    );
  };

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
            title={""}
            handleLeftBtn={() => {
              setOrder({});
              handleClose();
            }}
            isDivider={false}
          />

          <View
            style={{
              paddingVertical: hp("3%"),
              paddingHorizontal: hp("2.5%"),
            }}
          >
            <DefaultText
              style={{ textAlign: "center" }}
              fontSize="lg"
              fontWeight="normal"
              color={"otherGrey.100"}
            >
              {"#" + data?.orderNum}
            </DefaultText>

            <DefaultText
              style={{
                marginTop: 12,
                fontSize: 22,
                marginBottom: hp("11%"),
                textAlign: "center",
              }}
              fontWeight="medium"
            >
              {t("Completed")}
            </DefaultText>

            <DefaultText
              style={{
                fontSize: 40,
                textAlign: "center",
              }}
              fontWeight="medium"
            >
              {Number(totalPaid) - Number((total + totalCharges)?.toFixed(2))
                ? `${t("SAR")} ${(totalPaid - (total + totalCharges)).toFixed(
                    2
                  )} ${t("Change")}`
                : t("No Change")}
            </DefaultText>

            <DefaultText
              style={{
                marginTop: hp("4%"),
                fontSize: 24,
                marginBottom: hp("20.75%"),
                textAlign: "center",
              }}
              fontWeight="normal"
            >
              {`${t("out of")} ${t("SAR")} ${totalPaid?.toFixed(2)}`}
            </DefaultText>

            <PrimaryButton
              style={{
                paddingVertical: hp("2.25%"),
              }}
              textStyle={{
                fontSize: 20,
                fontWeight: theme.fontWeights.medium,
                fontFamily: theme.fonts.circulatStd,
              }}
              title={t("New Sale")}
              onPress={async () => {
                setOrder({});
                handleClose();
                dineinCart.clearCart();
                const tableData = MMKVDB.get("activeTableDineIn");

                const sectionDoc = await repo.sectionTables.findOne({
                  where: { _id: tableData?.sectionRef },
                });

                const updatedtables: any = sectionDoc?.tables.map((table) => {
                  if (table.id === tableData.id) {
                    table.status = "true";
                    table.openedAt = "";
                    table.waiter = { name: "" };
                    table.waiterRef = "";
                    table.noOfGuests = 0;
                    return table;
                  }
                  return table;
                });

                await repo.sectionTables.update(
                  {
                    _id: sectionDoc?._id,
                  },
                  {
                    _id: sectionDoc?._id,
                    company: sectionDoc?.company,
                    companyRef: sectionDoc?.companyRef,
                    floorType: sectionDoc?.floorType,
                    location: sectionDoc?.location,
                    locationRef: sectionDoc?.locationRef,
                    name: sectionDoc?.name,
                    numberOfTable: sectionDoc?.numberOfTable,
                    status: sectionDoc?.status,
                    tableNaming: sectionDoc?.tableNaming,
                    tables: updatedtables,
                  }
                );

                await queryClient.invalidateQueries("find-section-tables");

                debugLog(
                  "Table Status Updated",
                  { ...sectionDoc, tables: updatedtables },
                  "table-guest-modal",
                  "formik-open-table-funtion"
                );

                const splitted = tableData?.id?.split("-");

                if (splitted[splitted?.length - 1] === "M") {
                  await handleSplit(tableData);
                }
                if (tableData?.childTable) {
                  await handleRestore(tableData);
                }

                navigation.navigate("DineinHome");
              }}
            />

            <View
              style={{
                marginTop: hp("3.75%"),
                flexDirection: "row",
              }}
            >
              <View style={{ flex: 1 }}>
                <PrimaryButton
                  reverse
                  style={{
                    paddingVertical: hp("1.5%"),
                    backgroundColor:
                      authContext.permission["pos:order"]?.["send-receipt"] &&
                      isConnected
                        ? theme.colors.primary[200]
                        : theme.colors.dividerColor.main,
                  }}
                  textStyle={{
                    fontSize: 20,
                    marginLeft: 12,
                    fontWeight: theme.fontWeights.medium,
                    fontFamily: theme.fonts.circulatStd,
                    color:
                      authContext.permission["pos:order"]?.["send-receipt"] &&
                      isConnected
                        ? theme.colors.primary[1000]
                        : theme.colors.otherGrey[200],
                  }}
                  leftIcon={
                    <ICONS.SendReceiptIcon
                      color={
                        authContext.permission["pos:order"]?.["send-receipt"] &&
                        isConnected
                          ? theme.colors.primary[1000]
                          : theme.colors.otherGrey[200]
                      }
                    />
                  }
                  title={t("Send Receipt")}
                  onPress={() => {
                    setShowSendReceipt(true);
                  }}
                  disabled={
                    !authContext.permission["pos:order"]?.["send-receipt"] ||
                    !isConnected
                  }
                />
              </View>

              <Spacer space={wp("2.5%")} />

              <View style={{ flex: 1 }}>
                <PrimaryButton
                  disabled={
                    !authContext.permission["pos:order"]?.print ||
                    !isPrinterConnected
                  }
                  reverse
                  textStyle={{
                    fontSize: 20,
                    marginLeft: 12,
                    fontWeight: theme.fontWeights.medium,
                    fontFamily: theme.fonts.circulatStd,
                    color:
                      authContext.permission["pos:order"]?.print &&
                      isPrinterConnected
                        ? theme.colors.primary[1000]
                        : theme.colors.otherGrey[200],
                  }}
                  style={{
                    paddingVertical: hp("1.5%"),
                    backgroundColor:
                      authContext.permission["pos:order"]?.print &&
                      isPrinterConnected
                        ? theme.colors.primary[200]
                        : theme.colors.dividerColor.main,
                  }}
                  leftIcon={
                    <ICONS.ReprintReceiptIcon
                      color={
                        authContext.permission["pos:order"]?.print &&
                        isPrinterConnected
                          ? theme.colors.primary[1000]
                          : theme.colors.otherGrey[200]
                      }
                    />
                  }
                  title={t("Reprint Receipt")}
                  onPress={() => {
                    handlePrintReceipt({
                      ...data,
                    });
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </View>

      <PrintPreviewModal
        data={previewData}
        visible={showWebView}
        handleClose={() => setShowWebView(false)}
      />

      {/*TODO: Get These values from order */}

      <SendReceiptModal
        data={data}
        customer={{}}
        visible={showSendReceipt}
        handleClose={() => setShowSendReceipt(false)}
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
});
