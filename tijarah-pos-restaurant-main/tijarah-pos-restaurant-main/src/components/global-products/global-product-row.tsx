import React, { useContext } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { t } from "../../../i18n";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { useResponsive } from "../../hooks/use-responsiveness";
import { AuthType } from "../../types/auth-types";
import { PRODUCT_PLACEHOLDER } from "../../utils/constants";
import ICONS from "../../utils/icons";
import ItemDivider from "../action-sheet/row-divider";
import CurrencyView from "../modal/currency-view-modal";
import DefaultText from "../text/Text";

export default function GlobalProductRow({
  data,
  handleOnPress,
  handleAddProduct,
}: any) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { wp, hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  if (!data) {
    return <></>;
  }

  return (
    <>
      <TouchableOpacity
        style={{
          paddingVertical: hp("1.8%"),
          paddingHorizontal: hp("2%"),
          flexDirection: "row",
          alignItems: "center",
        }}
        onPress={() => handleOnPress(data)}
      >
        <TouchableOpacity
          style={{ width: "5%", marginRight: wp("1.8%") }}
          onPress={() => {
            handleAddProduct(data);
          }}
          disabled={!authContext.permission["pos:product"]?.import}
        >
          <ICONS.AddCircleIcon
            color={
              authContext.permission["pos:product"]?.import
                ? theme.colors.primary[1000]
                : theme.colors.placeholder
            }
          />
        </TouchableOpacity>

        {twoPaneView ? (
          <>
            <View
              style={{
                width: "40%",
                marginRight: "5%",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: hp("7%"),
                  height: hp("7%"),
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderColor: "#E5E9EC",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: theme.colors.white[1000],
                }}
              >
                <Image
                  key={"product-logo"}
                  resizeMode="stretch"
                  style={{
                    width: hp("7%"),
                    height: hp("7%"),
                    borderRadius: 16,
                  }}
                  source={
                    data?.localImage
                      ? {
                          uri: data.localImage,
                        }
                      : PRODUCT_PLACEHOLDER
                  }
                />
              </View>

              <View style={{ marginHorizontal: wp("1.35%") }}>
                <DefaultText fontSize="lg" fontWeight="normal">
                  {data.name.en}
                </DefaultText>

                <DefaultText
                  style={{ marginTop: 5 }}
                  fontSize="lg"
                  fontWeight="medium"
                >
                  {data.name.ar}
                </DefaultText>
              </View>
            </View>

            <DefaultText
              style={{ width: "20%", textAlign: "right" }}
              fontSize="lg"
            >
              {data.category.name}
            </DefaultText>
          </>
        ) : (
          <View
            style={{
              width: "55%",
              marginLeft: "5%",
              marginRight: "5%",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: hp("6.5%"),
                height: hp("6.5%"),
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: "#E5E9EC",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.colors.white[1000],
              }}
            >
              <Image
                key={"product-logo"}
                resizeMode="stretch"
                style={{
                  width: hp("6.5%"),
                  height: hp("6.5%"),
                  borderRadius: 16,
                }}
                source={
                  data?.localImage
                    ? {
                        uri: data.localImage,
                      }
                    : PRODUCT_PLACEHOLDER
                }
              />
            </View>

            <View style={{ marginHorizontal: wp("1.35%") }}>
              <DefaultText fontSize="lg" fontWeight="normal">
                {isRTL ? data.name.ar : data.name.en}
              </DefaultText>

              <DefaultText
                style={{ marginTop: 5 }}
                fontSize="lg"
                fontWeight="medium"
              >
                {data.category.name}
              </DefaultText>
            </View>
          </View>
        )}

        <View style={{ width: "23%" }}>
          {data.variants?.length > 1 ? (
            <DefaultText
              style={{ textAlign: "right", alignSelf: "flex-end" }}
              fontSize="2xl"
            >
              {`${data.variants.length} ${t("Variants")}`}
            </DefaultText>
          ) : data.variants[0].price ? (
            <View style={{ alignItems: "flex-end" }}>
              <CurrencyView
                amount={(Number(data.variants[0].price) || 0)?.toFixed(2)}
              />
            </View>
          ) : (
            <DefaultText style={{ alignSelf: "flex-end" }} fontSize="2xl">
              {t("Custom")}
            </DefaultText>
          )}
        </View>

        <View
          style={{
            width: "7%",
            marginLeft: wp("2.5%"),
            marginRight: wp("2%"),
            alignItems: isRTL ? "flex-end" : "flex-start",
            transform: [
              {
                rotate: isRTL ? "180deg" : "0deg",
              },
            ],
          }}
        >
          <ICONS.RightArrowBoldIcon />
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
