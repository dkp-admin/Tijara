import { format } from "date-fns";
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import ItemDivider from "../action-sheet/row-divider";
import CurrencyView from "../modal/currency-view-modal";
import DefaultText from "../text/Text";

export default function CustomerRow({ data, handleOnPress }: any) {
  const theme = useTheme();
  const { wp, hp, twoPaneView } = useResponsive();

  const getNameInitials = () => {
    const nameInitial = data.firstName.charAt(0).toUpperCase() + "";

    return `${nameInitial}`;
  };

  if (!data) {
    return <></>;
  }

  return (
    <>
      <TouchableOpacity
        style={{
          paddingVertical: hp("1.5%"),
          paddingHorizontal: hp("2%"),
          flexDirection: "row",
          alignItems: "center",
        }}
        onPress={() => handleOnPress(data)}
      >
        <View
          style={{
            width: twoPaneView ? "25%" : "35%",
            marginRight: "5%",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {data?.profilePicture ? (
            <Image
              key={"customer-pic"}
              resizeMode="contain"
              style={{ width: 42, height: 42 }}
              borderRadius={50}
              source={{ uri: data.profilePicture }}
            />
          ) : (
            <View
              style={{
                width: 42,
                height: 42,
                padding: 8,
                borderRadius: 50,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.colors.primary[300],
              }}
            >
              <DefaultText fontSize="lg" fontWeight="medium" color="white.1000">
                {getNameInitials()}
              </DefaultText>
            </View>
          )}

          <View style={{ marginHorizontal: wp("1%") }}>
            <DefaultText fontSize="lg" fontWeight="medium">
              {`${data.firstName} ${data.lastName}`}
            </DefaultText>

            <DefaultText
              fontSize="sm"
              fontWeight="medium"
              color="otherGrey.100"
            >
              {data.phone}
            </DefaultText>
          </View>
        </View>

        {twoPaneView ? (
          <>
            <View style={{ width: "20%" }}>
              <CurrencyView
                amount={`${Number(data.totalSpend || 0)?.toFixed(2)}` || "0"}
                symbolFontweight="normal"
              />
            </View>

            <View style={{ width: "20%" }}>
              <CurrencyView
                amount={
                  `${Number(data?.totalRefunded || 0)?.toFixed(2)}` || "0"
                }
                symbolFontweight="normal"
              />
            </View>

            <DefaultText style={{ width: "10%" }} fontWeight="normal">
              {data.totalOrders || 0}
            </DefaultText>
          </>
        ) : (
          <View style={{ width: "35%" }}>
            <CurrencyView
              amount={`${Number(data.totalSpend || 0)?.toFixed(2)}` || "0"}
              symbolFontweight="normal"
            />

            <DefaultText style={{ marginTop: 3 }} fontWeight="normal">
              {`${data.totalOrders || 0} ${t("Orders")}`}
            </DefaultText>
          </View>
        )}

        <View
          style={{
            width: twoPaneView ? "20%" : "25%",
            paddingRight: wp("2.5%"),
          }}
        >
          {!isNaN(data.lastOrder) ? (
            <>
              <DefaultText
                style={{ textAlign: "right" }}
                fontSize="lg"
                fontWeight="normal"
                color="otherGrey.100"
              >
                {`${format(new Date(data.lastOrder), "dd/MM/yyyy")},`}
              </DefaultText>

              <DefaultText
                style={{ textAlign: "right" }}
                fontSize="lg"
                fontWeight="normal"
                color="otherGrey.100"
              >
                {format(new Date(data.lastOrder), "h:mm a")}
              </DefaultText>
            </>
          ) : (
            <DefaultText
              style={{ textAlign: "right" }}
              fontSize="lg"
              fontWeight="normal"
              color="otherGrey.100"
            >
              {`NA`}
            </DefaultText>
          )}
        </View>
      </TouchableOpacity>

      <ItemDivider
        style={{
          margin: 0,
          borderWidth: 0,
          borderBottomWidth: 1,
          borderColor: "#E5E9EC",
        }}
      />
    </>
  );
}
