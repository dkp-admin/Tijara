import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import Countries from "../../utils/countries.json";
import ICONS from "../../utils/icons";
import ActionSheetHeader from "../action-sheet/action-sheet-header";
import ItemDivider from "../action-sheet/row-divider";
import Input from "../input/input";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import Spacer from "../spacer";
import DefaultText from "../text/Text";

export default function CountrySheet({
  sheetRef,
  selectedCountry,
  handleCountry,
}: {
  sheetRef: any;
  selectedCountry: string;
  handleCountry: any;
}) {
  const theme = useTheme();

  const { wp, hp, twoPaneView } = useResponsive();

  const [query, setQuery] = useState("");

  const filteredData: any = useMemo(() => {
    const transformedData = Countries?.map((d: any) => {
      return d;
    });

    if (transformedData && transformedData?.length > 0) {
      return transformedData?.filter((item: any) =>
        item?.name
          ?.toLocaleLowerCase("en")
          .includes(query.toLocaleLowerCase("en"))
      );
    }
  }, [Countries, query]);

  return (
    //@ts-ignore
    <RBSheet
      ref={sheetRef}
      closeOnDragDown={false}
      closeOnPressMask={true}
      animationType="fade"
      customStyles={{
        container: {
          ...styles.sheet_container,
          minHeight: hp("70%"),
          backgroundColor: theme.colors.white[1000],
        },
        wrapper: {
          marginHorizontal: twoPaneView ? "20%" : "0%",
          backgroundColor: theme.colors.transparentBg,
        },
      }}
    >
      <ActionSheetHeader
        title={t("Select Country")}
        handleLeftBtn={() => sheetRef.current.close()}
      />

      <Input
        leftIcon={
          <ICONS.SearchIcon
            color={
              query.length > 0
                ? theme.colors.primary[1000]
                : theme.colors.dark[600]
            }
          />
        }
        allowClear
        placeholderText={t("Search with country name")}
        values={query}
        handleChange={(val: string) => setQuery(val)}
        containerStyle={{
          height: hp("6.5%"),
          marginTop: hp("2%"),
          borderRadius: 10,
          marginHorizontal: wp("2%"),
          backgroundColor: theme.colors.bgColor,
        }}
        style={{
          ...styles.textInput,
          width: wp("90%"),
          color: theme.colors.text.primary,
        }}
      />

      <FlatList
        style={{
          marginTop: 5,
          minHeight: hp("30%"),
        }}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        data={filteredData}
        renderItem={({ item }) => {
          return (
            <>
              <TouchableOpacity
                key={item.code}
                style={{
                  backgroundColor:
                    item.name == selectedCountry
                      ? theme.colors.primary[100]
                      : "transparent",
                }}
                onPress={() => {
                  handleCountry(item.name);
                  sheetRef.current.close();
                }}
                disabled={item.name == selectedCountry}
              >
                <View style={styles.account_row}>
                  <DefaultText
                    fontWeight={
                      item.name == selectedCountry ? "medium" : "normal"
                    }
                    color={
                      item.name == selectedCountry
                        ? "primary.1000"
                        : "text.primary"
                    }
                  >
                    {item.name}
                  </DefaultText>
                </View>
              </TouchableOpacity>
              <ItemDivider />
            </>
          );
        }}
        ListEmptyComponent={() => {
          return (
            <View style={{ marginHorizontal: 16 }}>
              <NoDataPlaceholder
                title={t("No Countries!")}
                marginTop={hp("10%")}
              />
            </View>
          );
        }}
        ListFooterComponent={() => <Spacer space={hp("18%")} />}
      />
    </RBSheet>
  );
}

const styles = StyleSheet.create({
  sheet_container: {
    elevation: 100,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  textInput: {
    marginRight: -16,
  },
  account_row: {
    paddingVertical: 18,
    paddingHorizontal: 26,
    flexDirection: "row",
    alignItems: "center",
  },
});
