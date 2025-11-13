import { format } from "date-fns";
import React from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import ItemDivider from "../../../action-sheet/row-divider";
import NoDataPlaceholder from "../../../no-data-placeholder/no-data-placeholder";
import Spacer from "../../../spacer";
import DefaultText from "../../../text/Text";

export default function CheckoutOptions({
  data,
  type,
  sheetRef,
  handleSelected,
}: {
  data: any;
  type: string;
  sheetRef: any;
  handleSelected: any;
}) {
  const theme = useTheme();
  const { hp } = useResponsive();

  const totalAmount = data?.reduce(
    (prev: any, curr: any) => prev + curr?.total,
    0
  );

  const kotOptions = [{ value: t("Repeat"), label: "repeat" }];

  const storedItemOptions = [
    { value: t("Repeat"), label: "repeat" },
    data?.length === 1 && data?.[0]?.void
      ? { value: t("Remove Void"), label: "removeVoid" }
      : { value: t("Void"), label: "void" },
    data?.length === 1 && data?.[0]?.comp
      ? { value: t("Remove Comp"), label: "removeComp" }
      : { value: t("Comp"), label: "comp" },
  ];

  const newItemOptions = [
    { value: t("Edit"), label: "modify" },
    { value: t("Repeat"), label: "repeat" },
    data?.length === 1 && data?.[0]?.comp
      ? { value: t("Remove Comp"), label: "removeComp" }
      : { value: t("Comp"), label: "comp" },
    { value: t("Remove"), label: "remove" },
  ];

  const bothOptions = [
    { value: t("Repeat"), label: "repeat" },
    { value: t("Comp"), label: "comp" },
  ];

  return (
    //@ts-ignore
    <RBSheet
      ref={sheetRef}
      closeOnDragDown={true}
      closeOnPressMask={true}
      animationType="fade"
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
          style={{ marginLeft: hp("2.25%"), marginBottom: hp("1.5%") }}
          fontSize="2xl"
          fontWeight="medium"
        >
          {type === "kot"
            ? "KOT Name"
            : data?.length > 1
            ? `${data?.length} ${t("Items")}`
            : data[0]?.name?.en}
        </DefaultText>

        {(type === "storedItems" || type === "newItems") && (
          <View>
            <DefaultText
              style={{ marginLeft: hp("2.25%"), marginBottom: 2 }}
              fontSize="md"
              color="otherGrey.100"
            >
              {data?.map((op: any) => op?.variantNameEn)?.join(",")}
            </DefaultText>

            {data[0]?.modifiers?.length > 0 && (
              <DefaultText
                style={{ marginLeft: hp("2.25%"), marginBottom: 3 }}
                fontSize="md"
                color="otherGrey.100"
              >
                {data[0]?.modifiers?.map((op: any) => op?.name)?.join(",")}
              </DefaultText>
            )}
          </View>
        )}

        <DefaultText
          style={{ marginLeft: hp("2.25%") }}
          fontSize="md"
          color="otherGrey.100"
        >
          {type === "kot"
            ? `${t("Sent at")} ${format(new Date(), "h:mm a")}`
            : `${t("SAR")} ${totalAmount?.toFixed(2)}`}
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

        <FlatList
          style={{
            marginTop: 5,
            minHeight: hp("60%"),
          }}
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          data={
            type === "kot"
              ? kotOptions
              : type === "both"
              ? bothOptions
              : type === "storedItems"
              ? storedItemOptions
              : newItemOptions
          }
          renderItem={({ item, index }) => {
            if (data?.length > 1 && item.label === "modify") {
              return <></>;
            }

            return (
              <TouchableOpacity
                key={index}
                style={{
                  ...styles.item_row,
                  borderWidth: 0,
                  borderStyle: "dashed",
                  borderColor: theme.colors.dividerColor.main,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  backgroundColor: theme.colors.bgColor,
                }}
                onPress={() => {
                  handleSelected(item.label, data, type);
                }}
              >
                <DefaultText fontWeight="medium" color={"text.primary"}>
                  {item.value}
                </DefaultText>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={() => {
            return (
              <View style={{ marginHorizontal: 16 }}>
                <NoDataPlaceholder
                  title={t("No Options!")}
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
    marginTop: "3%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  textInput: {
    flex: 0.99,
    marginRight: -16,
  },
  item_row: {
    paddingVertical: 18,
    paddingHorizontal: 26,
    flexDirection: "row",
    alignItems: "center",
  },
});
