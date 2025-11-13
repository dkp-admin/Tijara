import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import { t } from "../../../i18n";
import CustomHeader from "../../components/common/custom-header";
import DineinTableMenu from "../../components/dienin/dinein-table-menu";
import PermissionPlaceholderComponent from "../../components/permission-placeholder";
import AuthContext from "../../context/auth-context";
import { DineInCartContextProvider } from "../../context/dinein-cart-context";
import { useTheme } from "../../context/theme-context";
import { AuthType } from "../../types/auth-types";

const DineinComponent = () => {
  return (
    <View style={styles.container}>
      <DineinTableMenu />
    </View>
  );
};

const DineinHome = () => {
  const theme = useTheme();
  const authContext = useContext<AuthType>(AuthContext);

  if (!authContext.permission["pos:section-table"]?.read) {
    return (
      <PermissionPlaceholderComponent
        title={t("You don't have permission to view this screen")}
        marginTop="-5%"
      />
    );
  }

  return (
    <DineInCartContextProvider>
      <CustomHeader />

      <View
        style={{
          ...styles.container,
          backgroundColor: theme.colors.bgColor,
        }}
      >
        <DineinComponent />
      </View>
    </DineInCartContextProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row" },
});

export default DineinHome;
