import React, { useContext } from "react";
import { Dimensions, View } from "react-native";
import { t } from "../../../i18n";
import { checkInternet } from "../../hooks/check-internet";
import PermissionPlaceholderComponent from "../permission-placeholder";
import DefaultText from "../text/Text";
import AuthContext from "../../context/auth-context";
import { AuthType } from "../../types/auth-types";
import { infoLog } from "../../utils/log-patch";

export default function ProductsTab() {
  const isConnected = checkInternet();
  const authContext = useContext<AuthType>(AuthContext);

  if (!isConnected || !authContext.permission["pos:dashboard"]?.read) {
    let text = "";

    if (!isConnected) {
      infoLog(
        "Internet not connected",
        { tab: "Products tab" },
        "dashboard-screen",
        "handleInternet"
      );
      text = t("Dashboard is only available when you're online");
    } else {
      infoLog(
        "Permission denied to view this screen",
        { tab: "Products tab" },
        "dashboard-screen",
        "handlePermission"
      );
      text = t("You don't have permission to view this screen");
    }

    return <PermissionPlaceholderComponent title={text} />;
  }

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        height: Dimensions.get("window").height * 0.65,
      }}
    >
      <DefaultText fontSize="4xl" fontWeight="medium">
        {`${t("Coming Soon")}...`}
      </DefaultText>
    </View>
  );
}
