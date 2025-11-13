import { default as React, useContext, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import ICONS from "../../utils/icons";
import { PrimaryButton } from "../buttons/primary-button";
import Input from "../input/input";
import DefaultText from "../text/Text";
import showToast from "../toast";
import AuthContext from "../../context/auth-context";
import { AuthType } from "../../types/auth-types";
import { checkDirection } from "../../hooks/check-direction";
import { useNavigation } from "@react-navigation/core";

export default function DiscountTopHeader({
  queryText,
  setQueryText,
  handleBtnTap,
}: any) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const isConnected = checkInternet();
  const navigation = useNavigation() as any;
  const { wp, hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  const [showTextInput, setShowTextInput] = useState(false);

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme.colors.white[1000],
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingTop: hp("2.5%"),
            flex: twoPaneView ? 0.25 : 0.5,
            marginBottom: hp("1.75%"),
            paddingHorizontal: hp("2%"),
          }}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <View
            style={{
              marginRight: 10,
              transform: [
                {
                  rotate: isRTL ? "180deg" : "0deg",
                },
              ],
            }}
          >
            <ICONS.ArrowLeftIcon />
          </View>

          <DefaultText fontWeight="medium">{t("DISCOUNTS")}</DefaultText>
        </TouchableOpacity>

        {twoPaneView ? (
          <View
            style={{
              flex: 0.75,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingLeft: wp("1.75%"),
              paddingRight: wp("0.75%"),
              paddingVertical: hp("0.5%"),
            }}
          >
            <View
              style={{
                flex: 0.95,
                borderRadius: 16,
                paddingLeft: wp("1.5"),
                flexDirection: "row",
                alignItems: "center",
                opacity: authContext.permission["pos:coupon"]?.read ? 1 : 0.25,
                backgroundColor: authContext.permission["pos:coupon"]?.read
                  ? "#8A959E1A"
                  : theme.colors.placeholder,
              }}
            >
              <ICONS.SearchPrimaryIcon />

              <Input
                containerStyle={{
                  borderWidth: 0,
                  height: hp("7.25%"),
                  marginLeft: wp("0.5%"),
                  backgroundColor: "transparent",
                }}
                allowClear={authContext.permission["pos:coupon"]?.read}
                style={{ flex: 0.975 }}
                placeholderText={t("Search discounts")}
                values={queryText}
                handleChange={(val: any) => setQueryText(val)}
                disabled={!authContext.permission["pos:coupon"]?.read}
              />
            </View>

            <PrimaryButton
              style={{ backgroundColor: "transparent" }}
              textStyle={{
                fontSize: 20,
                fontWeight: theme.fontWeights.medium,
                color: authContext.permission["pos:coupon"]?.create
                  ? theme.colors.primary[1000]
                  : theme.colors.placeholder,
                fontFamily: theme.fonts.circulatStd,
              }}
              title={t("Create a discount")}
              onPress={() => {
                if (isConnected) {
                  handleBtnTap();
                } else {
                  showToast("error", t("Discount can't be created offline"));
                }
              }}
              disabled={!authContext.permission["pos:coupon"]?.create}
            />
          </View>
        ) : (
          <View
            style={{
              flex: 0.5,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingLeft: wp("1.75%"),
              paddingRight: wp("1%"),
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setQueryText("");
                setShowTextInput(!showTextInput);
              }}
              disabled={!authContext.permission["pos:coupon"]?.read}
            >
              <ICONS.SearchPrimaryIcon
                color={
                  authContext.permission["pos:coupon"]?.read
                    ? theme.colors.primary[1000]
                    : theme.colors.placeholder
                }
              />
            </TouchableOpacity>

            <PrimaryButton
              style={{
                paddingVertical: hp("1%"),
                backgroundColor: "transparent",
              }}
              title={""}
              leftIcon={
                <ICONS.AddCircleIcon
                  color={
                    authContext.permission["pos:coupon"]?.create
                      ? theme.colors.primary[1000]
                      : theme.colors.placeholder
                  }
                />
              }
              onPress={() => {
                if (isConnected) {
                  handleBtnTap();
                } else {
                  showToast("error", t("Discount can't be created offline"));
                }
              }}
              disabled={!authContext.permission["pos:coupon"]?.create}
            />
          </View>
        )}
      </View>

      {showTextInput && (
        <Input
          containerStyle={{
            height: hp("6%"),
            marginTop: hp("0.5%"),
            marginBottom: hp("1%"),
            marginHorizontal: hp("2%"),
            backgroundColor: "#8A959E1A",
          }}
          allowClear
          style={{ flex: 0.985 }}
          placeholderText={t("Search discounts")}
          values={queryText}
          handleChange={(val: any) => setQueryText(val)}
        />
      )}
    </>
  );
}
