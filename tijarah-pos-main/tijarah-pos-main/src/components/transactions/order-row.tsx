import { format } from "date-fns";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import i18n, { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import ICONS from "../../utils/icons";
import DefaultText from "../text/Text";

export default function OrderRow({
  data,
  selectedOrder,
  setSelectedOrder,
}: any) {
  const theme = useTheme();

  const isSelected = () => {
    return data._id == selectedOrder;
  };

  const getItemName = () => {
    let name = "";

    if (i18n.currentLocale() == "ar") {
      data?.items?.map((item: any, index: number) => {
        name =
          name + item.name?.ar + `${data.items.length - 1 > index ? ", " : ""}`;
      });
    } else {
      data?.items?.map((item: any, index: number) => {
        name =
          name + item.name?.en + `${data.items.length - 1 > index ? ", " : ""}`;
      });
    }

    return name;
  };

  return (
    <>
      <TouchableOpacity
        style={{
          paddingVertical: 8,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: isSelected()
            ? theme.colors.text.primary
            : theme.colors.white[1000],
        }}
        onPress={() => {
          setSelectedOrder(data);
        }}
      >
        <View
          style={{
            flex: 0.85,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <ICONS.MoneyIcon
            color={
              isSelected()
                ? theme.colors.white[1000]
                : theme.colors.text.primary
            }
          />

          <View style={{ marginLeft: 12 }}>
            <DefaultText
              fontSize="lg"
              fontWeight="medium"
              color={isSelected() ? "white.1000" : "text.primary"}
            >
              {"#" + (data?.orderNum || "")}
            </DefaultText>

            <DefaultText
              noOfLines={1}
              fontSize="md"
              fontWeight="normal"
              color={isSelected() ? "#E5E9EC" : theme.colors.placeholder}
            >
              {getItemName()}
            </DefaultText>
          </View>
        </View>

        <View style={{ alignSelf: "flex-end" }}>
          <DefaultText
            style={{ textAlign: "right" }}
            fontSize="md"
            fontWeight="medium"
            color={isSelected() ? "white.1000" : "text.primary"}
          >
            {`${t("SAR")} ${Number(data.payment.total)?.toFixed(2)}`}
          </DefaultText>

          <DefaultText
            style={{ textAlign: "right" }}
            fontSize="md"
            fontWeight="normal"
            color={isSelected() ? "#E5E9EC" : theme.colors.placeholder}
          >
            {format(new Date(data.createdAt), "hh:mma")}
          </DefaultText>
        </View>
      </TouchableOpacity>

      <View
        style={{
          borderWidth: 0.5,
          marginLeft: 16,
          borderColor: theme.colors.dividerColor.secondary,
        }}
      />
    </>
  );
}
