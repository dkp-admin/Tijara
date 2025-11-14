import { Feather } from "@expo/vector-icons";
import React, { useRef } from "react";
import { TouchableOpacity } from "react-native";
import { Menu, MenuItem } from "react-native-material-menu";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import ItemDivider from "../../../action-sheet/row-divider";
import DefaultText from "../../../text/Text";

export default function TableMoreOptions({
  tableData,
  handleMerge,
  handleSplit,
  handleShift,
  handleRestore,
  handleRelease,
}: {
  tableData: any;
  handleMerge: any;
  handleSplit: any;
  handleShift: any;
  handleRestore: any;
  handleRelease: any;
}) {
  const theme = useTheme();
  const menu = useRef<any>();
  const { hp } = useResponsive();

  const splitted = tableData?.id?.split("-");

  return (
    <Menu
      ref={menu}
      style={{
        borderRadius: 16,
        height: tableData?.childTable
          ? hp("12%")
          : !tableData?.childTable && tableData?.status === "seated"
          ? hp("13%")
          : !tableData?.childTable && splitted[splitted?.length - 1] === "M"
          ? hp("19%")
          : hp("25%"),
        marginTop: hp("3.75%"),
        justifyContent: "flex-end",
        backgroundColor: theme.colors.white[1000],
      }}
      anchor={
        <TouchableOpacity
          style={{ paddingLeft: hp("1%") }}
          onPress={() => {
            menu.current.show();
          }}
        >
          <Feather
            name="more-vertical"
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
      }
      onRequestClose={() => {
        menu.current.hide();
      }}
    >
      {tableData?.status !== "seated" && (
        <MenuItem
          style={{
            height: hp("6%"),
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
          onPress={() => {
            if (tableData?.childTable) {
              handleRestore(tableData);
              menu.current.hide();
            } else {
              handleMerge(tableData);
              menu.current.hide();
            }
          }}
        >
          <DefaultText fontSize="md" fontWeight="medium">
            {tableData?.childTable ? t("Restore") : t("Merge")}
          </DefaultText>
        </MenuItem>
      )}

      {!tableData?.childTable && tableData?.status !== "seated" && (
        <ItemDivider
          style={{
            margin: 0,
            borderWidth: 0,
            borderBottomWidth: 1.5,
            borderColor: "#E5E9EC",
          }}
        />
      )}

      {!tableData?.childTable &&
        tableData?.status !== "seated" &&
        splitted[splitted?.length - 1] !== "M" && (
          <MenuItem
            style={{ height: hp("6%") }}
            onPress={() => {
              handleSplit(tableData);
              menu.current.hide();
            }}
          >
            <DefaultText fontSize="md" fontWeight="medium">
              {t("Split")}
            </DefaultText>
          </MenuItem>
        )}

      <ItemDivider
        style={{
          margin: 0,
          borderWidth: 0,
          borderBottomWidth: 1.5,
          borderColor: "#E5E9EC",
        }}
      />

      <MenuItem
        style={{
          height: hp("6%"),
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        }}
        onPress={() => {
          handleShift(tableData);
          menu.current.hide();
        }}
      >
        <DefaultText fontSize="md" fontWeight="medium">
          {t("Shift")}
        </DefaultText>
      </MenuItem>
      <ItemDivider
        style={{
          margin: 0,
          borderWidth: 0,
          borderBottomWidth: 1.5,
          borderColor: "#E5E9EC",
        }}
      />

      <MenuItem
        style={{
          height: hp("6%"),
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        }}
        onPress={() => {
          handleRelease(tableData);
          menu.current.hide();
        }}
      >
        <DefaultText fontSize="md" fontWeight="medium">
          {t("Release")}
        </DefaultText>
      </MenuItem>
    </Menu>
  );
}
