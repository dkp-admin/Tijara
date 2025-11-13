import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ICONS from "../../../utils/icons";
import { debugLog } from "../../../utils/log-patch";
import { showAlert } from "../../../utils/showAlert";
import WalletCustomerModal from "../../billing/right-view/modal/wallet-customer-modal";
import Spacer from "../../spacer";
import DefaultText from "../../text/Text";
import showToast from "../../toast";
import AssignWaiter from "./assign-waiter/assign-waiter";
import CustomAmountModal from "./custom-amount/custom-amount-modal";
import CustomChargesModalDinein from "./custom-charge/custom-charge-modal";
import CustomerSearchAdd from "./customer/customer-search-add";
import DiscountModalDinein from "./discount/discount-modal";
import MoveTable from "./move-table/move-table";
import ReprintTicketModal from "./reprint-ticket/reprint-ticket-modal";
import VoidCompSelection from "./void-comp/void-comp";
import MMKVDB from "../../../utils/DB-MMKV";
import { repo } from "../../../utils/createDatabaseConnection";
import { queryClient } from "../../../query-client";
import dineinCart from "../../../utils/dinein-cart";
import { EventRegister } from "react-native-event-listeners";
import useItemsDineIn from "../../../hooks/use-items-dinein";
import { useNavigation } from "@react-navigation/core";
import { getItemVAT } from "../../../utils/get-price";
import { isSameModifiers } from "../../../utils/isSameModifiers";
import ClearItemsModal from "../dinein-table-menu/table/clear-items-modal";
import useCartStore from "../../../store/cart-item-dinein";

export default function ActionsTab() {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();
  const tData = MMKVDB.get("activeTableDineIn");
  const { setCustomer, customer } = useCartStore() as any;

  const voidCompRef = useRef<any>();
  const moveTableRef = useRef<any>();
  const assignWaiterRef = useRef<any>();

  const [type, setType] = useState("");
  const [visisbleDiscount, setVisibleDiscount] = useState(false);
  const [visisbleCustomers, setVisibleCustomers] = useState(false);
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
      leftIcon: <ICONS.AddCustomAmtIcon />,
      text: t("Add custom amount"),
      disabled: false,
      path: "customAmount",
    },
  ];

  const getNameInitials = () => {
    const firstNameInitial = customer?.firstName?.charAt(0)?.toUpperCase() + "";
    return `${firstNameInitial || ""}`;
  };

  const handleRelease = async () => {
    const tableData = MMKVDB.get("activeTableDineIn");

    const sectionDoc = await repo.sectionTables.findOne({
      where: { _id: tableData?.sectionRef },
    });

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
  };

  return (
    <View style={{ flex: 1, height: "100%", paddingHorizontal: hp("2%") }}>
      <ScrollView
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
      >
        {customer?._id ? (
          <View
            style={{
              ...styles.customerContentView,
              backgroundColor: theme.colors.primary[100],
            }}
          >
            {customer.totalOrders != 0 && (
              <View style={styles.customerTotalOrdersView}>
                <View
                  style={{
                    ...styles.customerOrdersBgView,
                    backgroundColor:
                      customer?.totalOrders == 0
                        ? theme.colors.red.default
                        : theme.colors.primary[1000],
                  }}
                >
                  <DefaultText
                    style={{ textAlign: "center", marginHorizontal: 5 }}
                    fontSize="sm"
                    color="white.1000"
                  >
                    {Number(customer?.totalOrders) == 1
                      ? t("One Timer")
                      : t("Regular")}
                  </DefaultText>
                </View>
              </View>
            )}

            <View
              style={{
                width: customer.totalOrders != 0 ? "96%" : "100%",
                marginLeft: customer.totalOrders != 0 ? "4%" : "0%",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  paddingVertical: hp("0.75%"),
                  paddingHorizontal: 16,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                {customer?.profilePicture ? (
                  <Image
                    key={"customer-pic"}
                    resizeMode="contain"
                    style={{ width: 42, height: 42 }}
                    borderRadius={50}
                    source={{ uri: customer.profilePicture }}
                  />
                ) : (
                  <View
                    style={{
                      ...styles.customerNameInitialView,
                      backgroundColor: theme.colors.primary[300],
                    }}
                  >
                    <DefaultText
                      fontSize="xl"
                      fontWeight="medium"
                      color="white.1000"
                    >
                      {getNameInitials()}
                    </DefaultText>
                  </View>
                )}

                <View
                  style={{
                    width: twoPaneView ? "65%" : "75%",
                    marginHorizontal: hp("1.25%"),
                  }}
                >
                  <DefaultText fontSize="lg" fontWeight="medium" noOfLines={1}>
                    {`${customer.firstName} ${customer.lastName}`}
                  </DefaultText>

                  <DefaultText
                    fontSize="md"
                    fontWeight="normal"
                    color="otherGrey.100"
                  >
                    {customer.phone}
                  </DefaultText>
                </View>
              </View>

              <TouchableOpacity
                style={{ padding: 10 }}
                onPress={() => {
                  debugLog(
                    "Customer removed from dinein screen",
                    customer,
                    "dinein-cart-screen",
                    "handleRemoveCustomerFunction"
                  );
                  setCustomer(null);
                }}
              >
                <ICONS.CloseClearIcon />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <CustomerSearchAdd
            handlePress={() => {
              setVisibleCustomers(true);
            }}
          />
        )}

        <View
          style={{
            flexWrap: "wrap",
            flexDirection: twoPaneView ? "row" : "column",
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

      {visisbleCustomers && (
        <WalletCustomerModal
          visible={visisbleCustomers}
          handleSelectedCustomer={(customer: any) => {
            setCustomer(customer);
            setVisibleCustomers(false);
          }}
          handleClose={() => {
            setVisibleCustomers(false);
          }}
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

          const sectionDocActive = await repo.sectionTables.findOne({
            where: { _id: tableData?.sectionRef },
          });

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
              tables: updatedtablesActive,
            }
          );

          debugLog(
            "Table Status Updated",
            { ...sectionDocActive, tables: updatedtablesActive },
            "table-guest-modal",
            "formik-open-table-funtion"
          );

          dineinCart.shiftTable(tableData);

          handleRelease();

          navigation?.navigate("DineinHome");

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
                  debugLog(
                    "Item updated to cart",
                    updatedItems,
                    "billing-screen",
                    "handleCatalogueModifier"
                  );
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
                  debugLog(
                    "Item updated to cart",
                    updatedItems,
                    "billing-screen",
                    "handleCatalogueModifier"
                  );
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
                  debugLog(
                    "Item updated to cart",
                    updatedItems,
                    "billing-screen",
                    "handleCatalogueModifier"
                  );
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

          const sectionDoc = await repo.sectionTables.findOne({
            where: { _id: tableData?.sectionRef },
          });

          const updatedtables = sectionDoc?.tables.map((table) => {
            if (table.id === tableData?.id) {
              table.waiterRef = waiter?._id;
              table.waiter = { name: waiter?.name };
              return table;
            }
            return table;
          });

          await repo.sectionTables.update(
            {
              _id: tableData?.sectionRef,
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

          const updatedTable = updatedtables?.find(
            (op) => op.id === tableData.id
          );

          MMKVDB.set("activeTableDineIn", updatedTable);

          EventRegister.emit("tableUpdated", updatedTable);

          await queryClient.invalidateQueries("find-section-tables");

          debugLog(
            "Assigned Waiter to Table",
            { ...sectionDoc, tables: updatedtables },
            "action-tab",
            "assign-waiter-onchange"
          );

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

const styles = StyleSheet.create({
  customerContentView: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 6,
  },
  customerTotalOrdersView: {
    flex: 1,
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    borderRadius: 8,
    overflow: "hidden",
    position: "absolute",
  },
  customerOrdersBgView: {
    top: "28%",
    left: "-48%",
    width: "100%",
    paddingVertical: 5,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    position: "absolute",
    transform: [{ rotate: "-90deg" }],
  },
  customerNameInitialView: {
    width: 40,
    height: 40,
    padding: 6,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});
