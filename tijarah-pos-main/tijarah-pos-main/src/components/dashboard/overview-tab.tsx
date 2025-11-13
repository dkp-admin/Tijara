import { useNavigation } from "@react-navigation/native";
import { endOfDay, format, startOfDay } from "date-fns";
import React, { useContext, useEffect } from "react";
import { View } from "react-native";
import { t } from "../../../i18n";
import AuthContext from "../../context/auth-context";
import DeviceContext from "../../context/device-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { useFindOne } from "../../hooks/use-find-one";
import { useResponsive } from "../../hooks/use-responsiveness";
import { AuthType } from "../../types/auth-types";
import { debugLog, infoLog } from "../../utils/log-patch";
import Loader from "../loader";
import PermissionPlaceholderComponent from "../permission-placeholder";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import OrdeerTypeCard from "./overview/order-type";
import OverviewTopCard from "./overview/top-card";
import TopCategories from "./overview/top-categories";
import TopSellingProducts from "./overview/top-selling-products";
import TransactionMode from "./overview/transaction-mode";

const prevDate = new Date();
prevDate.setMonth(prevDate.getMonth() - 1);

export default function OverviewTab() {
  const theme = useTheme();
  const isConnected = checkInternet();
  const navigation = useNavigation() as any;
  const { hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);
  const deviceContext = useContext(DeviceContext) as any;

  const {
    findOne: findOverviewStats,
    entity: dashboardStats,
    loading: loadingStats,
    dataUpdatedAt,
  } = useFindOne("report/sale-summary"); // dash/merchant/stats

  const {
    findOne: findOverview,
    entity: dashboard,
    loading: loadingDashboard,
  } = useFindOne("dash");

  useEffect(() => {
    (async () => {
      if (isConnected) {
        findOverviewStats({
          companyRef: deviceContext?.user?.companyRef,
          locationRef: deviceContext?.user?.locationRef,
          dateRange: {
            from: startOfDay(new Date()),
            to: endOfDay(new Date()),
          },
        });

        findOverview({
          companyRef: deviceContext?.user?.companyRef,
          locationRef: deviceContext?.user?.locationRef,
          dateRange: {
            from: startOfDay(prevDate),
            to: endOfDay(new Date()),
          },
        });
      }
    })();
  }, []);

  if (!isConnected || !authContext.permission["pos:dashboard"]?.read) {
    let text = "";

    if (!isConnected) {
      infoLog(
        "Internet not connected",
        { tab: "Overview tab" },
        "dashboard-screen",
        "handleInternet"
      );
      text = t("Dashboard is only available when you're online");
    } else {
      infoLog(
        "Permission denied to view this screen",
        { tab: "Overview tab" },
        "dashboard-screen",
        "handlePermission"
      );
      text = t("You don't have permission to view this screen");
    }

    return <PermissionPlaceholderComponent title={text} />;
  }

  if (loadingStats || loadingDashboard) {
    return <Loader style={{ marginTop: hp("30%") }} />;
  }

  return (
    <>
      <View style={{ marginLeft: 16, marginBottom: hp("2%") }}>
        <DefaultText
          style={{ width: "90%" }}
          fontSize="lg"
          fontWeight="medium"
          color={theme.colors.otherGrey[100]}
        >
          {`${t("Note")}: ${t("Last updated on")} ${format(
            new Date(dataUpdatedAt),
            "dd/MM/yyyy, h:mm a"
          )}`}
        </DefaultText>
      </View>

      <OverviewTopCard dashboardStats={dashboardStats} />

      <Spacer space={hp("2.5%")} />

      {/* <CurrentMonthEarningsCard
        monthlyEarnings={dashboard?.monthlyEarning || []}
      /> */}

      <Spacer space={hp("2.5%")} />

      {twoPaneView ? (
        <View>
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1 }}>
              <TransactionMode
                transactionData={dashboardStats} // {dashboard?.transactionByMode || []}
                handleBtnTap={() => {}}
              />
            </View>

            <Spacer space={hp("2.5%")} />

            <View style={{ flex: 1 }}>
              <TopCategories
                title={t("TOP CATEGORIES")}
                categoryData={dashboard?.topCategories}
              />
            </View>
          </View>

          <Spacer space={hp("4%")} />

          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1 }}>
              <OrdeerTypeCard data={dashboardStats} />
            </View>

            <Spacer space={hp("2.5%")} />

            <View style={{ flex: 1.5 }}>
              <TopSellingProducts
                productsData={dashboard?.topProducts || []}
                handleViewAll={() => {
                  debugLog(
                    "Navigate to Catalogue",
                    { tab: "Overview tab" },
                    "dashboard-screen",
                    "handleNavigation"
                  );
                  navigation.navigate("Catalogue");
                }}
              />
            </View>
          </View>
        </View>
      ) : (
        <React.Fragment>
          <TransactionMode
            transactionData={dashboardStats} // {dashboard?.transactionByMode || []}
            handleBtnTap={() => {}}
          />

          <Spacer space={hp("2.5%")} />

          <TopCategories
            title={t("TOP CATEGORIES")}
            categoryData={dashboard?.topCategories}
          />

          <Spacer space={hp("2.5%")} />

          <OrdeerTypeCard data={dashboardStats} />

          <Spacer space={hp("2.5%")} />

          <TopSellingProducts
            productsData={dashboard?.topProducts || []}
            handleViewAll={() => {
              debugLog(
                "Navigate to Catalogue",
                { tab: "Overview tab" },
                "dashboard-screen",
                "handleNavigation"
              );
              navigation.navigate("Catalogue");
            }}
          />
        </React.Fragment>
      )}
    </>
  );
}
