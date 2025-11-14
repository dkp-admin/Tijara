import { format } from "date-fns";
import React from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { useCurrency } from "../../../store/get-currency";
import ICONS from "../../../utils/icons";
import ItemDivider from "../../action-sheet/row-divider";
import Input from "../../input/input";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import Spacer from "../../spacer";
import DefaultText from "../../text/Text";

export default function BatchesInputSheet({
  batches = true,
  sheetRef,
  options,
  values,
  handleSelected,
  label,
  searchText,
  inputValue = "",
  searchable,
  onSearch,
}: {
  batches?: boolean;
  sheetRef: any;
  options: any[];
  values: any;
  handleSelected: any;
  label: string;
  searchText?: string;
  inputValue?: string;
  searchable?: boolean;
  onSearch: any;
}) {
  const theme = useTheme();
  const { currency } = useCurrency();
  const { hp } = useResponsive();

  const getListValue = (data: any) => {
    const boxName = data.type === "box" ? `, Box ${data.units} Units` : "";

    const costPrice = data?.costPrice
      ? `, ${currency} ${Number(data.costPrice)?.toFixed(2)}`
      : "";

    return `${data.name}${boxName}, ${data.sku}${costPrice}`;
  };

  return (
    //@ts-ignore
    <RBSheet
      ref={sheetRef}
      closeOnDragDown={true}
      closeOnPressMask={true}
      animationType="fade"
      onClose={() => {
        onSearch("");
      }}
      customStyles={{
        container: {
          ...styles.card_view,
          minHeight: hp("75%"),
          backgroundColor: theme.colors.bgColor,
        },
        wrapper: {
          backgroundColor: theme.colors.transparentBg,
        },
      }}
    >
      <View>
        <DefaultText
          style={{ marginLeft: hp("2.25%") }}
          fontSize="2xl"
          fontWeight="medium"
        >
          {label}
        </DefaultText>

        <Spacer space={10} />

        <ItemDivider
          style={{
            margin: 0,
            borderWidth: 0,
            borderBottomWidth: 1,
            borderTop: 10,
          }}
        />

        {searchable && (
          <Input
            leftIcon={
              <ICONS.SearchIcon
                color={
                  inputValue?.length > 0
                    ? theme.colors.primary[1000]
                    : theme.colors.dark[600]
                }
              />
            }
            placeholderText={searchText}
            values={inputValue}
            handleChange={(val: string) => onSearch(val)}
            containerStyle={{
              height: hp("7%"),
              marginTop: hp("2%"),
              borderRadius: 10,
              marginHorizontal: hp("2.25%"),
              backgroundColor: theme.colors.bgColor2,
            }}
            style={{
              ...styles.textInput,
              color: theme.colors.text.primary,
            }}
          />
        )}

        <FlatList
          style={{
            marginTop: 5,
            minHeight: hp("60%"),
          }}
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          data={options}
          renderItem={({ item }) => {
            return (
              <>
                <TouchableOpacity
                  key={item._id}
                  style={{
                    ...styles.item_row,
                    backgroundColor:
                      values?._id === item._id
                        ? theme.colors.primary[100]
                        : theme.colors.bgColor,
                  }}
                  onPress={() => {
                    handleSelected(item);
                  }}
                >
                  <DefaultText
                    fontWeight={values?._id === item._id ? "medium" : "normal"}
                    color={
                      values?._id === item._id ? "primary.1000" : "text.primary"
                    }
                  >
                    {batches
                      ? `${t("Batch")}: ${format(
                          item?.expiry ? new Date(item?.expiry) : new Date(),
                          "dd/MM/yyyy"
                        )}, ${t("Quantity")}: ${item?.available || 0}`
                      : getListValue(item)}
                  </DefaultText>
                </TouchableOpacity>

                <ItemDivider
                  style={{
                    margin: 0,
                    borderWidth: 0,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                  }}
                />
              </>
            );
          }}
          ListEmptyComponent={() => {
            return (
              <View style={{ marginHorizontal: 16 }}>
                <NoDataPlaceholder
                  title={batches ? t("No Batches!") : t("No Receiving Items")}
                  marginTop={hp("20%")}
                />
              </View>
            );
          }}
          ListFooterComponent={() => <Spacer space={hp("18%")} />}
        />
      </View>
    </RBSheet>
  );
}

const styles = StyleSheet.create({
  card_view: {
    elevation: 100,
    marginTop: "3%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  textInput: {
    marginRight: -16,
  },
  item_row: {
    paddingVertical: 18,
    paddingHorizontal: 26,
    flexDirection: "row",
    alignItems: "center",
  },
});
