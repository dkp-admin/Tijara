import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
} from "date-fns";
import React, { useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import MMKVDB from "../../../../utils/DB-MMKV";
import ICONS from "../../../../utils/icons";
import DefaultText from "../../../text/Text";
import showToast from "../../../toast";
import MergeShiftTableModal from "./merge-shift-table";
import SplitTableModal from "./split-table";
import TableGuest from "./table-guest-modal";
import TableMoreOptions from "./table-more-options";
import dineinCart from "../../../../utils/dinein-cart";
import { queryClient } from "../../../../query-client";
import repository from "../../../../db/repository";

export default function TableRow(tableDoc: any) {
  const { data } = tableDoc;

  const theme = useTheme();
  const navigation = useNavigation() as any;
  const { hp, twoPaneView } = useResponsive();

  if (!data) {
    return <></>;
  }

  const [tableType, setTableType] = useState("");
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [visibleTableGuest, setVisibleTableGuest] = useState(false);
  const [visibleTableSplit, setVisibleTableSplit] = useState(false);
  const [visibleTableMergeShift, setVisibleTableMergeShift] = useState(false);

  const tableData = useMemo(() => {
    let bgColor = theme.colors.dark[100];
    let tableText = "Empty";
    let textColor = theme.colors.placeholder;

    if (data?.status === "served") {
      bgColor = theme.colors.primary[100];
      tableText = "Served";
      textColor = theme.colors.primary[1000];
    } else if (data?.status === "seated") {
      bgColor = theme.colors.red[100];
      tableText = "Seated";
      textColor = theme.colors.red.default;
    } else if (data?.status === "ordered") {
      bgColor = theme.colors.yellow[100];
      tableText = "Ordered";
      textColor = theme.colors.yellow.default;
    }

    return { bgColor, tableText, textColor };
  }, [data]);

  const handleSplit = async (splitTableData: any) => {
    const sectionDocActive = await repository.sectionTableRepository.findById(
      splitTableData?.sectionRef
    );

    const table1 = {
      ...splitTableData?.childOne,
    };

    const table2 = {
      ...splitTableData?.childTwo,
    };

    const updatedtables: any = sectionDocActive?.tables?.filter(
      (table) => table.id !== splitTableData?.id
    );

    updatedtables.push(table1, table2);

    await repository.sectionTableRepository.update(splitTableData?.sectionRef, {
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
      source: "local",
    });

    await queryClient.invalidateQueries("find-section-tables");
  };

  return (
    <>
      <TouchableOpacity
        style={{
          borderWidth: 1,
          borderRadius: 5,
          marginBottom: hp("3%"),
          borderColor: "#E5E9EC",
          marginRight: hp("2.5%"),
          paddingLeft: hp("2.5%"),
          paddingRight: hp("2%"),
          paddingVertical: hp("1%"),
          width: twoPaneView ? "24%" : "48%",
          backgroundColor: theme.colors.white[1000],
        }}
        onPress={() => {
          try {
            MMKVDB.set("activeTableDineIn", data);

            if (data?.status === "empty" || data?.status === "true") {
              setVisibleTableGuest(true);
            } else {
              navigation.navigate("DineInNavigator", {
                screen: "DineinMenuCart",
              });
            }
          } catch (error) {
            console.log(error);
          }
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {data?.waiter?.name && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ICONS.ProfileSmallIcon
                width={16}
                height={16}
                color={theme.colors.placeholder}
              />

              <DefaultText
                style={{ marginLeft: 5 }}
                fontSize="sm"
                fontWeight="medium"
                color={theme.colors.placeholder}
              >
                {data?.waiter?.name}
              </DefaultText>
            </View>
          )}

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <DefaultText
              style={{ marginLeft: 5 }}
              fontSize="sm"
              fontWeight="medium"
              color={theme.colors.placeholder}
            >
              Capacity: {data?.capacity}
            </DefaultText>
          </View>

          <TableMoreOptions
            tableData={data}
            handleRelease={async (data: any) => {
              const sectionDoc =
                await repository.sectionTableRepository.findById(
                  data?.sectionRef
                );

              MMKVDB.set("activeTableDineIn", data);

              dineinCart.clearCart();

              const updatedtables = sectionDoc?.tables.map((table: any) => {
                if (table.id === data.id) {
                  table.status = "true";
                  table.openedAt = "";
                  table.waiter = { name: "" };
                  table.waiterRef = "";
                  ``;
                  return table;
                }
                return table;
              });

              await repository.sectionTableRepository.update(data?.sectionRef, {
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

              const splitted = data?.id?.split("-");

              if (splitted[splitted?.length - 1] === "M") {
                await handleSplit(data);
              }

              await queryClient.invalidateQueries("find-section-tables");
            }}
            handleMerge={(data: any) => {
              setTableType("merge");
              setSelectedTable(data);
              setVisibleTableMergeShift(true);
            }}
            handleRestore={async (data: any) => {
              setTableType("restore");
              setSelectedTable(data);

              const sectionDocActive =
                await repository.sectionTableRepository.findById(
                  data?.sectionRef
                );

              const findOtherTable = sectionDocActive?.tables.find(
                (tab) =>
                  tab.parentTable === data?.parentTable &&
                  tab.label !== data?.label
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

              await repository.sectionTableRepository.update(data?.sectionRef, {
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
                source: "local",
              });

              await queryClient.invalidateQueries("find-section-tables");
            }}
            handleSplit={(data: any) => {
              setSelectedTable(data);
              setVisibleTableSplit(true);
            }}
            handleShift={(data: any) => {
              setTableType("shift");
              setSelectedTable(data);
              setVisibleTableMergeShift(true);
            }}
          />
        </View>

        <View style={{ marginTop: 8 }}>
          <DefaultText
            fontSize="2xl"
            fontWeight="medium"
            color={tableData.textColor}
          >
            {data.label}
          </DefaultText>

          <View
            style={{
              marginTop: 5,
              borderRadius: 3,
              paddingVertical: 4,
              paddingHorizontal: 10,
              alignSelf: "flex-start",
              backgroundColor: tableData.bgColor,
            }}
          >
            <DefaultText
              fontSize="lg"
              fontWeight="medium"
              color={tableData.textColor}
            >
              {tableData.tableText}
            </DefaultText>
          </View>
        </View>

        <View
          style={{
            marginTop: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons
              style={{ marginRight: 4 }}
              name="access-time"
              size={14}
              color={theme.colors.otherGrey[200]}
            />

            {data?.openedAt &&
            differenceInMinutes(new Date(), new Date(data?.openedAt)) > -1 &&
            differenceInMinutes(new Date(), new Date(data?.openedAt)) < 60 ? (
              <DefaultText fontSize="sm" color="otherGrey.200">
                {`${differenceInMinutes(
                  new Date(),
                  new Date(data?.openedAt)
                )} ${t("minutes ago")}`}
              </DefaultText>
            ) : data?.openedAt &&
              differenceInMinutes(new Date(), new Date(data?.openedAt)) > 60 &&
              differenceInHours(new Date(), new Date(data?.openedAt)) < 24 ? (
              <DefaultText fontSize="sm" color="otherGrey.200">
                {`${differenceInHours(
                  new Date(),
                  new Date(data?.openedAt)
                )} ${t("hours ago")}`}
              </DefaultText>
            ) : data?.openedAt &&
              differenceInHours(new Date(), new Date(data?.openedAt)) > 24 ? (
              <DefaultText fontSize="sm" color="otherGrey.200">
                {`${differenceInDays(new Date(), new Date(data?.openedAt))} ${t(
                  "days ago"
                )}`}
              </DefaultText>
            ) : (
              <DefaultText fontSize="sm" color="otherGrey.200">
                {t("Not opened yet")}
              </DefaultText>
            )}
          </View>
          <View>
            {data?.status === "seated" && (
              <DefaultText fontSize="sm" color="otherGrey.200">
                No of guest - {data?.noOfGuests}
              </DefaultText>
            )}
          </View>

          {/* <DefaultText
            fontSize="sm"
            fontWeight="medium"
            color={theme.colors.placeholder}
          >
            {data?.merge
              ? `${t("Merged with")} ${"merged table name"}`
              : data?.split
              ? `${t("Split to")} ${"splited table name"}`
              : ""}
          </DefaultText> */}
        </View>
      </TouchableOpacity>

      {visibleTableGuest && (
        <TableGuest
          data={data}
          visible={visibleTableGuest}
          handleDone={() => {
            navigation.navigate("DineInNavigator", {
              screen: "DineinMenuCart",
            });
            setVisibleTableGuest(false);
          }}
          handleClose={() => setVisibleTableGuest(false)}
        />
      )}

      {visibleTableMergeShift && (
        <MergeShiftTableModal
          type={tableType}
          data={selectedTable}
          visible={visibleTableMergeShift}
          handleSubmit={async (selected: any, data: any, type: string) => {
            if (type === "shift") {
              const sectionDocActive =
                await repository.sectionTableRepository.findById(
                  data?.sectionRef
                );

              const updatedtablesActive = sectionDocActive?.tables.map(
                (table) => {
                  if (table.id === data.id) {
                    table.status = "true";
                    table.openedAt = "null";
                    return table;
                  }
                  return table;
                }
              );

              await repository.sectionTableRepository.update(data?.sectionRef, {
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
              });

              await queryClient.invalidateQueries("find-section-tables");

              dineinCart.shiftTable(selected);

              const sectionDoc =
                await repository.sectionTableRepository.findById(
                  selected?.sectionRef
                );

              const updatedtables = sectionDoc?.tables.map((table) => {
                if (table.id === selected.id) {
                  table.status = data?.status;
                  table.openedAt = data?.openedAt;
                  table.noOfGuests = data?.noOfGuests;
                  table.waiter = data.waiter;
                  table.waiterRef = data.waiterRef;
                  return table;
                }
                return table;
              });

              await repository.sectionTableRepository.update(
                selected?.sectionRef,
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

              MMKVDB.set("activeTableDineIn", selected);

              await queryClient.invalidateQueries("find-section-tables");

              navigation?.navigate("MainNavigator", {
                screen: "DineinHome",
              });
            }

            if (type === "merge") {
              const sectionDocActive =
                await repository.sectionTableRepository.findById(
                  data?.sectionRef
                );

              const tablesIds = [data.id, selected.id];

              const updatedtables = sectionDocActive?.tables?.filter(
                (table) => !tablesIds.includes(table.id)
              );

              const mergeTable = {
                capacity: Number(data?.capacity) + Number(selected?.capacity),
                id: `${selected?.id}-${data?.id}-M`,
                label: `${data?.label}-${selected?.label}`,
                openedAt: new Date().toISOString(),
                sectionRef: data?.sectionRef,
                status: "true",
                waiter: { name: "" },
                waiterRef: "",
                childOne: data,
                childTwo: selected,
              };

              updatedtables?.push(mergeTable);

              await repository.sectionTableRepository.update(data?.sectionRef, {
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
                source: "local",
              });

              await queryClient.invalidateQueries("find-section-tables");
            }

            showToast(
              "success",
              type === "merge" ? t("Table merged") : t("Table shifted")
            );
            setVisibleTableMergeShift(false);
          }}
          handleClose={() => setVisibleTableMergeShift(false)}
        />
      )}

      {visibleTableSplit && (
        <SplitTableModal
          data={selectedTable}
          visible={visibleTableSplit}
          handleSubmit={async (
            data: any,
            splitOne: string,
            splitTwo: string
          ) => {
            const sectionDocActive =
              await repository.sectionTableRepository.findById(
                data?.sectionRef
              );

            const updatedtables = sectionDocActive?.tables?.filter(
              (table) => table.id !== data?.id
            );

            const firstHalf = {
              capacity: Number(splitOne),
              id: `${data?.id}-1`,
              label: `${data?.label}-1`,
              openedAt: "",
              sectionRef: data?.sectionRef,
              status: "empty",
              waiter: { name: "" },
              waiterRef: "",
              parentTableRef: data?.id,
              parentTable: data?.label,
              childTable: true,
              parentTableCapacity: data?.capacity,
            };

            const secondHalf = {
              capacity: Number(splitTwo),
              id: `${data?.id}-2`,
              label: `${data?.label}-2`,
              openedAt: "",
              sectionRef: data?.sectionRef,
              status: "empty",
              waiter: { name: "" },
              waiterRef: "",
              parentTableRef: data?.id,
              parentTable: data?.label,
              childTable: true,
              parentTableCapacity: data?.capacity,
            };

            updatedtables?.push(firstHalf, secondHalf);

            await repository.sectionTableRepository.update(data?.sectionRef, {
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
              source: "local",
            });

            await queryClient.invalidateQueries("find-section-tables");

            showToast("success", t("Table splited"));
            setVisibleTableSplit(false);
          }}
          handleClose={() => setVisibleTableSplit(false)}
        />
      )}
    </>
  );
}
