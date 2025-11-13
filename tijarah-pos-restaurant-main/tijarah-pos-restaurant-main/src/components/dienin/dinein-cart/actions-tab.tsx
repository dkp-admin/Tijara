import { useNavigation } from "@react-navigation/core";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import repository from "../../../db/repository";
import useItemsDineIn from "../../../hooks/use-items-dinein";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { queryClient } from "../../../query-client";
import MMKVDB from "../../../utils/DB-MMKV";
import dineinCart from "../../../utils/dinein-cart";
import { getItemVAT } from "../../../utils/get-price";
import ICONS from "../../../utils/icons";
import { isSameModifiers } from "../../../utils/isSameModifiers";
import Spacer from "../../spacer";
import DefaultText from "../../text/Text";
import showToast from "../../toast";
import ClearItemsModal from "../dinein-table-menu/table/clear-items-modal";
import AssignWaiter from "./assign-waiter/assign-waiter";
import CustomAmountModal from "./custom-amount/custom-amount-modal";
import CustomChargesModalDinein from "./custom-charge/custom-charge-modal";
import DiscountModalDinein from "./discount/discount-modal";
import MoveTable from "./move-table/move-table";
import ReprintTicketModal from "./reprint-ticket/reprint-ticket-modal";
import VoidCompSelection from "./void-comp/void-comp";

export default function ActionsTab() {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();
  const tData = MMKVDB.get("activeTableDineIn");

  const voidCompRef = useRef<any>();
  const moveTableRef = useRef<any>();
  const assignWaiterRef = useRef<any>();

  const [type, setType] = useState("");
  const [visisbleDiscount, setVisibleDiscount] = useState(false);
  const [visisbleCustomCharges, setVisibleCustomCharges] = useState(false);
  const [visibleCustomAmount, setVisibleCustomAmount] = useState(false);
  const [visibleReprintModal, setVisibleReprintModal] = useState(false);
  const [visibleClearItemsModal, setVisibleClearItemsModal] = useState(false);
  const { items } = useItemsDineIn();
  const navigation = useNavigation() as any;

  const [tableData, setTableData] = useState(tData || {});

  useEffect(() => {
    EventRegister.addEventListener("tableUpdated", async (data) => {
      setTableData(data);
    });

    return () => {
      EventRegister.removeEventListener("tableUpdated");
    };
  }, []);

  const actionsData = [
    {
      leftIcon: <ICONS.ClearNewItemsIcon />,
      text: t("Clear new items"),
      disabled: false,
      path: "clear",
    },
    {
      leftIcon: <ICONS.MoveIcon />,
      text: t("Shift"),
      disabled: false,
      path: "move",
    },
    {
      leftIcon: <ICONS.VoidIcon />,
      text: t("Void"),
      disabled: false,
      path: "void",
    },
    {
      leftIcon: <ICONS.AssignIcon />,
      text: tableData?.waiter?.name ? t("Change") : t("Assign"),
      disabled: false,
      path: "assign",
    },
    {
      leftIcon: <ICONS.CompIcon />,
      text: t("Comp"),
      disabled: false,
      path: "comp",
    },
    {
      leftIcon: <ICONS.PrinterIcon />,
      text: t("Reprint ticket"),
      disabled: false,
      path: "reprint",
    },
  ];

  const detailsData = [
    {
      leftIcon: <ICONS.DineinDiscountsIcon />,
      text: t("Discounts"),
      disabled: false,
      path: "discounts",
    },
    {
      leftIcon: <ICONS.ServiceChargesIcon />,
      text: t("Service charges"),
      disabled: false,
      path: "charges",
    },
    {
      leftIcon: <ICONS.AddCustomAmtIcon isCustom={true} />,
      text: t("Add custom amount"),
      disabled: false,
      path: "customAmount",
    },
  ];

  const handleRelease = async () => {
    const tableData = MMKVDB.get("activeTableDineIn");

    const sectionDoc = await repository.sectionTableRepository.findById(
      tableData?.sectionRef
    );

    const updatedtables = sectionDoc?.tables.map((table: any) => {
      if (table.id === tableData.id) {
        table.status = "true";
        table.openedAt = "";
        table.waiter = { name: "" };
        table.waiterRef = "";
        ``;
        return table;
      }
      return table;
    });

    await repository.sectionTableRepository.update(tableData?.sectionRef, {
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
      source: "local",
    });

    await queryClient.invalidateQueries("find-section-tables");
  };

  return (
    <View style={{ flex: 1, height: "100%", paddingHorizontal: hp("2%") }}>
      <ScrollView
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexWrap: "wrap",
            flexDirection: twoPaneView ? "row" : "column",
            marginTop: 8,
          }}
        >
          {tableData?.waiter?.name && (
            <DefaultText>
              {t("Waiter")}:
              {tableData?.waiter?.name ? `(${tableData?.waiter?.name})` : ""}
            </DefaultText>
          )}

          <DefaultText>
            {t("No of guests")}: {tableData?.noOfGuests}
          </DefaultText>
        </View>

        <View
          style={{
            flexWrap: "wrap",
            flexDirection: twoPaneView ? "row" : "column",
          }}
        >
          {actionsData.map((data, index) => {
            const sentItems = items?.filter(
              (op: any) => op?.sentToKot === true
            );

            return (
              <View
                key={index}
                style={{
                  marginTop: hp("1.75%"),
                  flexDirection: "row",
                  width: twoPaneView ? "50%" : "100%",
                }}
              >
                <TouchableOpacity
                  style={{
                    flex: 1,
                    borderRadius: 8,
                    padding: hp("2%"),
                    flexDirection: "row",
                    justifyContent: "space-between",
                    opacity: data.disabled ? 0.3 : 1,
                    backgroundColor: theme.colors.white[1000],
                    marginRight: twoPaneView && index % 2 === 0 ? 12 : 0,
                  }}
                  onPress={() => {
                    if (data.path === "clear") {
                      setVisibleClearItemsModal(true);
                      // handleClearItems();
                    } else if (data.path === "move") {
                      moveTableRef.current.open();
                    } else if (data.path === "void") {
                      if (sentItems?.length > 0) {
                        setType("void");
                        voidCompRef.current.open();
                      } else showToast("error", t("No sent items to void"));
                    } else if (data.path === "assign") {
                      assignWaiterRef.current.open();
                    } else if (data.path === "comp") {
                      if (items?.length > 0) {
                        setType("comp");
                        voidCompRef.current.open();
                      } else showToast("error", t("Please add item to cart"));
                    } else if (data.path === "reprint") {
                      setVisibleReprintModal(true);
                    }
                  }}
                  disabled={data.disabled}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {data.leftIcon}

                    <DefaultText
                      style={{ marginLeft: 12 }}
                      fontSize="md"
                      fontWeight="medium"
                    >
                      {data.text}
                    </DefaultText>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <DefaultText
          style={{ marginTop: hp("2.5%") }}
          fontSize="md"
          fontWeight="medium"
        >
          {t("Details")}
        </DefaultText>

        <View
          style={{
            flexWrap: "wrap",
            flexDirection: twoPaneView ? "row" : "column",
          }}
        >
          {detailsData.map((data, index) => {
            return (
              <View
                key={index}
                style={{
                  marginTop: hp("1.75%"),
                  flexDirection: "row",
                  width: twoPaneView ? "50%" : "100%",
                }}
              >
                <TouchableOpacity
                  style={{
                    flex: 1,
                    borderRadius: 8,
                    padding: hp("2%"),
                    flexDirection: "row",
                    justifyContent: "space-between",
                    opacity: data.disabled ? 0.3 : 1,
                    backgroundColor: theme.colors.white[1000],
                    marginRight: twoPaneView && index % 2 === 0 ? 12 : 0,
                  }}
                  onPress={() => {
                    if (data.path === "discounts") {
                      setVisibleDiscount(true);
                    } else if (data.path === "charges") {
                      setVisibleCustomCharges(true);
                    } else if (data.path === "customAmount") {
                      setVisibleCustomAmount(true);
                    }
                  }}
                  disabled={data.disabled}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {data.leftIcon}

                    <DefaultText
                      style={{ marginLeft: 12 }}
                      fontSize="md"
                      fontWeight="medium"
                    >
                      {data.text}
                    </DefaultText>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <Spacer space={hp("10%")} />
      </ScrollView>

      {visisbleDiscount && (
        <DiscountModalDinein
          visible={visisbleDiscount}
          handleClose={() => setVisibleDiscount(false)}
        />
      )}

      {visisbleCustomCharges && (
        <CustomChargesModalDinein
          visible={visisbleCustomCharges}
          handleClose={() => setVisibleCustomCharges(false)}
        />
      )}

      {visibleCustomAmount && (
        <CustomAmountModal
          visible={visibleCustomAmount}
          handleClose={() => setVisibleCustomAmount(false)}
        />
      )}

      {visibleReprintModal && (
        <ReprintTicketModal
          visible={visibleReprintModal}
          handleClose={() => setVisibleReprintModal(false)}
        />
      )}

      <MoveTable
        sheetRef={moveTableRef}
        handleSelected={async (tableData: any) => {
          const activeTableDineIn = await MMKVDB.get("activeTableDineIn");

          const sectionDocActive =
            await repository.sectionTableRepository.findById(
              tableData?.sectionRef
            );

          const updatedtablesActive = sectionDocActive?.tables.map((table) => {
            if (table.id === activeTableDineIn.id) {
              table.status = "true";
              table.openedAt = "";
              table.waiter = { name: "" };
              table.waiterRef = "";
              table.noOfGuests = 0;
              return table;
            }
            if (table.id === tableData.id) {
              table.status = "seated";
              table.openedAt = new Date().toISOString();
              table.noOfGuests = activeTableDineIn?.noOfGuests;
              table.waiter = activeTableDineIn.waiter;
              table.waiterRef = activeTableDineIn.waiterRef;

              return table;
            }
            return table;
          });

          await repository.sectionTableRepository.update(
            tableData?.sectionRef,
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
              tables: updatedtablesActive,
              source: "local",
            }
          );

          dineinCart.shiftTable(tableData);

          handleRelease();

          navigation?.navigate("MainNavigator", { screen: "DineinHome" });

          showToast("success", t("Table moved"));
        }}
      />

      <VoidCompSelection
        type={type}
        sheetRef={voidCompRef}
        handleSelected={(data: any) => {
          if (data.type === "void") {
            const sentItems = items?.filter(
              (item: any) => item?.sentToKot === true
            );

            for (const item of sentItems) {
              const index = items.findIndex(
                (ind: any) =>
                  ind?.sku === item?.sku &&
                  ind?.qty === item?.qty &&
                  isSameModifiers(ind?.modifiers, item?.modifiers)
              );

              dineinCart.updateCartItem(
                index,
                {
                  ...item,
                  void: true,
                  amountBeforeVoidComp:
                    item?.total || item?.amountBeforeVoidComp,
                  voidRef: data?._id,
                  voidReason: data?.reason,
                  total: 0,
                  comp: false,
                  compRef: null,
                  compReason: {},
                },
                (updatedItems: any) => {
                  EventRegister.emit("itemUpdated-dinein", updatedItems);
                }
              );
            }
            showToast("success", t("Order void successfully"));
          } else {
            const indexes = [];

            for (const newItem of items) {
              const index = items.findIndex(
                (item: any) =>
                  item?.sku === newItem?.sku &&
                  item?.sentToKot === newItem?.sentToKot &&
                  item?.sentToKotAr === newItem?.sentToKotAt &&
                  JSON.stringify(item?.modifiers) ===
                    JSON.stringify(newItem?.modifiers)
              );
              indexes.push({ ...newItem, index });
            }

            for (const index of indexes) {
              dineinCart.updateCartItem(
                index?.index,
                {
                  ...index,
                  total: index?.amountBeforeVoidComp || index?.total,
                  vatAmount: getItemVAT(
                    index?.amountBeforeVoidComp || index?.total,
                    index?.vat
                  ),
                  void: false,
                  discountedTotal: 0,
                  voidRef: null,
                  voidReason: {},
                  comp: false,
                  compRef: null,
                  compReason: {},
                  sentToKotAt: index?.sentToKotAt,
                },
                (updatedItems: any) => {
                  EventRegister.emit("itemUpdated-dinein", updatedItems);
                }
              );
            }

            const unsentItems = items;

            for (const item of unsentItems) {
              const index = items.findIndex(
                (ind: any) =>
                  ind?.sku === item?.sku &&
                  item?.sentToKot === ind?.sentToKot &&
                  item?.sentToKotAt === ind?.sentToKotAt &&
                  JSON.stringify(item?.modifiers) ===
                    JSON.stringify(ind?.modifiers)
              );

              dineinCart.updateCartItem(
                index,
                {
                  ...item,
                  comp: true,

                  compRef: data?._id,
                  compReason: data?.reason,
                  total: 0,
                  // vatAmount: 0,
                  void: false,
                  voidRef: null,
                  amountBeforeVoidComp:
                    item?.total || item?.amountBeforeVoidComp,
                  voidReason: {},
                  sentToKotAt: item?.sentToKotAt,
                },
                (updatedItems: any) => {
                  EventRegister.emit("itemUpdated-dinein", updatedItems);
                }
              );
            }

            showToast("success", t("Order comp successfully"));
          }
          EventRegister.emit("voidCompApplied", {});
          voidCompRef.current.close();
        }}
      />

      <AssignWaiter
        values={{}}
        sheetRef={assignWaiterRef}
        handleSelected={async (waiter: any) => {
          const tableData = MMKVDB.get("activeTableDineIn");

          const sectionDoc = await repository.sectionTableRepository.findById(
            tableData?.sectionRef
          );

          const updatedtables = sectionDoc?.tables.map((table) => {
            if (table.id === tableData?.id) {
              table.waiterRef = waiter?._id;
              table.waiter = { name: waiter?.name };
              return table;
            }
            return table;
          });

          await repository.sectionTableRepository.update(
            tableData?.sectionRef,
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
              source: "local",
            }
          );

          const updatedTable = updatedtables?.find(
            (op) => op.id === tableData.id
          );

          MMKVDB.set("activeTableDineIn", updatedTable);

          EventRegister.emit("tableUpdated", updatedTable);

          await queryClient.invalidateQueries("find-section-tables");

          assignWaiterRef.current.close();

          showToast("success", t("Waiter assigned"));
        }}
      />

      {visibleClearItemsModal && (
        <ClearItemsModal
          visible={visibleClearItemsModal}
          handleClose={() => setVisibleClearItemsModal(false)}
        ></ClearItemsModal>
      )}
    </View>
  );
}
