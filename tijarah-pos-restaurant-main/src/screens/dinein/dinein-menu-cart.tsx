import React, { Suspense, lazy, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import SeparatorVerticalView from "../../components/common/separator-vertical-view";
import Loader from "../../components/loader";
import { DineInCartContextProvider } from "../../context/dinein-cart-context";
import { useTheme } from "../../context/theme-context";
import useMenuStore from "../../store/menu-filter-store";

const DineinMenu = lazy(() => import("../../components/dienin/dinein-menu"));
const DineinCart = lazy(() => import("../../components/dienin/dinein-cart"));

const DineinMenuCart = () => {
  const theme = useTheme();
  const { setCategoryId } = useMenuStore();

  useEffect(() => {
    setCategoryId("all");
  }, []);

  // if (authContext.permission["pos:menu"]?.read) {
  //   return (
  //     <PermissionPlaceholderComponent
  //       title={t("You don't have permission to view this screen")}
  //       marginTop="-15%"
  //     />
  //   );
  // }

  return (
    <>
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

        <DineInCartContextProvider>
          <View style={{ flex: 0.3 }}>
            <Suspense fallback={<Loader />}>
              <DineinCart />
            </Suspense>
          </View>
        </DineInCartContextProvider>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row" },
});

export default DineinMenuCart;
