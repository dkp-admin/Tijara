import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ItemDivider from "../../action-sheet/row-divider";
import DefaultText from "../../text/Text";

export default function BillingCustomerRow({ data, handleOnPress }: any) {
  const theme = useTheme();
  const { hp } = useResponsive();

  const getNameInitials = () => {
    const firstNameInitial = data.firstName.charAt(0).toUpperCase() + "";

    return `${firstNameInitial}`;
  };

  if (!data) {
    return;
  }

  return (
    <>
      <TouchableOpacity
        style={{
          paddingVertical: 10,
          paddingLeft: hp("2%"),
          paddingRight: hp("1.75%"),
          flexDirection: "row",
          alignItems: "center",
        }}
        onPress={() => handleOnPress(data)}
      >
        <View
          style={{
            marginRight: "3%",
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

          <View style={{ marginHorizontal: hp("1.5%") }}>
            <DefaultText fontSize="lg" fontWeight="medium" noOfLines={1}>
              {`${data.firstName} ${data.lastName}`}
            </DefaultText>

            <DefaultText fontSize="md" color="otherGrey.100">
              {data.phone}
            </DefaultText>
          </View>
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
  ) as any;
}
