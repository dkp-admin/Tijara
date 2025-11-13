import React, { Suspense, lazy, useContext, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { t } from "../../../i18n";
import SeparatorVerticalView from "../../components/common/separator-vertical-view";
import Loader from "../../components/loader";
import PermissionPlaceholderComponent from "../../components/permission-placeholder";
import AuthContext from "../../context/auth-context";
import { DineInCartContextProvider } from "../../context/dinein-cart-context";
import { useTheme } from "../../context/theme-context";
import useMenuStore from "../../store/menu-filter-store";
import { AuthType } from "../../types/auth-types";

const DineinMenu = lazy(() => import("../../components/dienin/dinein-menu"));
const DineinCart = lazy(() => import("../../components/dienin/dinein-cart"));

const DineinMenuCart = () => {
  const theme = useTheme();
  const { setCategoryId } = useMenuStore();
  const authContext = useContext<AuthType>(AuthContext);

  useEffect(() => {
    setCategoryId("all");
  }, []);

  if (!authContext.permission["pos:menu"]?.read) {
    return (
      <PermissionPlaceholderComponent
        title={t("You don't have permission to view this screen")}
        marginTop="-15%"
      />
    );
  }

  return (
    <DineInCartContextProvider>
      <View
        style={{
          ...styles.container,
          backgroundColor: theme.colors.bgColor,
        }}
      >
        <View style={{ flex: 0.7 }}>
          <Suspense fallback={<Loader />}>
            <DineinMenu />
          </Suspense>
        </View>

        <SeparatorVerticalView />

        <View style={{ flex: 0.3 }}>
          <Suspense fallback={<Loader />}>
            <DineinCart />
          </Suspense>
        </View>
      </View>
    </DineInCartContextProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row" },
});

export default DineinMenuCart;
