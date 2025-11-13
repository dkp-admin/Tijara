import React from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import ICONS from "../../utils/icons";
import Input from "../input/input";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import ItemDivider from "./row-divider";

export default function SelectInputSheet({
  isCollection = false,
  sheetRef,
  options,
  values,
  setSelected,
  label,
  searchText,
  inputValue,
  searchable,
  onSearch,
}: any) {
  const theme = useTheme();

  const { hp } = useResponsive();

  const checkKey = (item: any) => {
    let keyPresent = false;

    values?.map((val: any) => {
      if (val.key == item.key) {
        keyPresent = true;
        return;
      }
    });

    return keyPresent;
  };

  const isSelected = (item: any) => {
    return isCollection ? checkKey(item) : values?.key == item.key;
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
          marginTop: "3%",
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
          renderItem={({ item, index }) => {
            return (
              <>
                <TouchableOpacity
                  key={index}
                  style={{
                    ...styles.driver_row,
                    backgroundColor: isSelected(item)
                      ? theme.colors.primary[100]
                      : theme.colors.bgColor,
                  }}
                  onPress={() => {
                    setSelected(item);
                  }}
                >
                  <DefaultText
                    fontWeight={isSelected(item) ? "medium" : "normal"}
                    color={isSelected(item) ? "primary.1000" : "text.primary"}
                  >
                    {item.value}
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
                  title={t("No Data!")}
                  marginTop={hp("10%")}
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
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  textInput: {
    marginRight: -16,
  },
  driver_row: {
    paddingVertical: 18,
    paddingHorizontal: 26,
    flexDirection: "row",
    alignItems: "center",
  },
});
