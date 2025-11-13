import React, { useContext } from "react";
import { TouchableOpacity, View } from "react-native";
import { t } from "../../../../i18n";
import { useResponsive } from "../../../hooks/use-responsiveness";
import Label from "../../text/label";
import DefaultText from "../../text/Text";
import { AuthType } from "../../../types/auth-types";
import AuthContext from "../../../context/auth-context";

export default function PrinterHeader({ handleAdd }: any) {
  const { wp, hp } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  return (
    <>
      <View
        style={{
          marginBottom: 6,
          marginTop: hp("2.5%"),
          marginHorizontal: hp("2%"),
          flexDirection: "row",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <Label>{t("OUTLET DETAILS")}</Label>

        <TouchableOpacity
          style={{ marginRight: wp("1.25%") }}
          onPress={() => {
            handleAdd();
          }}
          disabled={!authContext.permission["pos:printer"]?.create}
        >
          <DefaultText
            fontSize="2xl"
            fontWeight="medium"
            color={
              authContext.permission["pos:printer"]?.create
                ? "primary.1000"
                : "otherGrey.200"
            }
          >
            {t("ADD A PRINTER")}
          </DefaultText>
        </TouchableOpacity>
      </View>
    </>
  );
}
