import { useNavigation } from "@react-navigation/core";
import { default as React, useContext, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { t } from "../../../i18n";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import useMiscexpensesStore from "../../store/misc-expenses-filter";
import { AuthType } from "../../types/auth-types";
import ICONS from "../../utils/icons";
import { debugLog } from "../../utils/log-patch";
import { PrimaryButton } from "../buttons/primary-button";
import Input from "../input/input";
import DefaultText from "../text/Text";
import showToast from "../toast";

export default function ExpensesTopHeader({
  queryText,
  handleQuery,
  handleBtnTap,
  handleFilter,
}: {
  queryText: string;
  handleQuery: any;
  handleBtnTap: any;
  handleFilter: any;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const isConnected = checkInternet();
  const navigation = useNavigation() as any;
  const { wp, hp, twoPaneView } = useResponsive();
  const { miscExpensesFilter } = useMiscexpensesStore();
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

          <DefaultText fontWeight="medium">
            {t("MISCELLANEOUS EXPENSES")}
          </DefaultText>
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
                opacity: authContext.permission["pos:expense"]?.read ? 1 : 0.25,
                backgroundColor: authContext.permission["pos:expense"]?.read
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
                allowClear={queryText}
                style={{ flex: 0.975 }}
                placeholderText={t("Search with miscellaneous expenses")}
                values={queryText}
                handleChange={(val: any) => handleQuery(val)}
                disabled={!authContext.permission["pos:expense"]?.read}
              />
            </View>

            <PrimaryButton
              style={{
                marginTop: 5,
                marginLeft: -hp("1.5%"),
                paddingVertical: hp("1%"),
                backgroundColor: "transparent",
              }}
              title={""}
              leftIcon={
                <ICONS.AddCircleIcon
                  color={
                    authContext.permission["pos:expense"]?.create
                      ? theme.colors.primary[1000]
                      : theme.colors.placeholder
                  }
                />
              }
              onPress={() => {
                if (!isConnected) {
                  debugLog(
                    "Miscellaneous Expenses can't be created offline",
                    {},
                    "discounts-screen",
                    "handleOnPressHeader"
                  );
                  showToast(
                    "error",
                    t("Miscellaneous Expenses can't be created offline")
                  );
                }

                handleBtnTap();
              }}
              disabled={!authContext.permission["pos:expense"]?.create}
            />

            <TouchableOpacity
              style={{ marginLeft: -hp("2.5%"), marginRight: 8 }}
              onPress={() => handleFilter()}
            >
              {Object.keys(miscExpensesFilter).length > 0 ? (
                <ICONS.FilterAppliedIcon />
              ) : (
                <ICONS.FilterSquareIcon />
              )}
            </TouchableOpacity>
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
                handleQuery("");
                setShowTextInput(!showTextInput);
              }}
              disabled={!authContext.permission["pos:expense"]?.read}
            >
              <ICONS.SearchPrimaryIcon
                color={
                  authContext.permission["pos:expense"]?.read
                    ? theme.colors.primary[1000]
                    : theme.colors.placeholder
                }
              />
            </TouchableOpacity>

            <PrimaryButton
              style={{
                marginTop: 5,
                marginLeft: -hp("1.5%"),
                paddingVertical: hp("1%"),
                backgroundColor: "transparent",
              }}
              title={""}
              leftIcon={
                <ICONS.AddCircleIcon
                  color={
                    authContext.permission["pos:expense"]?.create
                      ? theme.colors.primary[1000]
                      : theme.colors.placeholder
                  }
                />
              }
              onPress={() => {
                if (!isConnected) {
                  debugLog(
                    "Miscellaneous Expenses can't be created offline",
                    {},
                    "discounts-screen",
                    "handleOnPressHeader"
                  );
                  showToast(
                    "error",
                    t("Miscellaneous Expenses can't be created offline")
                  );
                }

                handleBtnTap();
              }}
              disabled={!authContext.permission["pos:expense"]?.create}
            />

            <TouchableOpacity
              style={{ marginLeft: -hp("2.5%"), marginRight: 8 }}
              onPress={() => handleFilter()}
            >
              {Object.keys(miscExpensesFilter).length > 0 ? (
                <ICONS.FilterAppliedIcon />
              ) : (
                <ICONS.FilterSquareIcon />
              )}
            </TouchableOpacity>
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
          allowClear={queryText}
          style={{ flex: 0.985 }}
          placeholderText={t("Search with miscellaneous expenses")}
          values={queryText}
          handleChange={(val: any) => handleQuery(val)}
        />
      )}
    </>
  );
}
