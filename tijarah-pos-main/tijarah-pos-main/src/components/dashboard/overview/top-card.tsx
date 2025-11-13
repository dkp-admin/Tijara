import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import { t } from "../../../../i18n";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ICONS from "../../../utils/icons";
import CommonCard from "./common-card";
import { debugLog } from "../../../utils/log-patch";

export default function OverviewTopCard({ dashboardStats }: any) {
  const navigation = useNavigation() as any;
  const { wp, hp, twoPaneView } = useResponsive();

  return (
    <View
      style={{
        flexWrap: "wrap",
        flexDirection: twoPaneView ? "row" : "column",
      }}
    >
      <View style={{ width: twoPaneView ? "49%" : "100%" }}>
        <CommonCard
          title={t("TODAY'S SALE")}
          icon={<ICONS.DashSaleIcon />}
          amount={Number(
            (dashboardStats?.netSales || 0) +
              (dashboardStats?.totalVat || 0) +
              (dashboardStats?.chargesWithoutVat || 0) -
              (dashboardStats?.refundedCharges || 0)
          )?.toFixed(2)}
          desc={`${dashboardStats?.totalOrder || 0} ${t("Bills")}`}
          btnTitle={t("View Report")}
          handleBtnTap={() => {
            debugLog(
              "Navigate to Reports",
              { tab: "Overview tab" },
              "dashboard-screen",
              "handleNavigation"
            );
            navigation.navigate("Reports");
          }}
        />
      </View>

      <View
        style={{
          width: twoPaneView ? "49%" : "100%",
          marginTop: twoPaneView ? 0 : hp("2%"),
          marginLeft: twoPaneView ? wp("1.5%") : 0,
        }}
      >
        <CommonCard
          title={t("TODAY'S REFUNDS")}
          icon={<ICONS.DashRefundIcon />}
          amount={Number(
            (dashboardStats?.refundInCash || 0) +
              (dashboardStats?.refundInCard || 0) +
              (dashboardStats?.refundInWallet || 0) +
              (dashboardStats?.refundInCredit || 0)
          )?.toFixed(2)}
          desc={`${Number(
            Number(dashboardStats?.refundCountInCash || 0) +
              Number(dashboardStats?.refundCountInCard || 0) +
              Number(dashboardStats?.refundCountInWallet || 0) +
              Number(dashboardStats?.refundCountInCredit || 0)
          )} ${t("Items")}`}
          btnTitle={t("View Report")}
          handleBtnTap={() => {
            debugLog(
              "Navigate to Reports",
              { tab: "Overview tab" },
              "dashboard-screen",
              "handleNavigation"
            );
            navigation.navigate("Reports");
          }}
        />
      </View>

      {/* <View
        style={{
          width: twoPaneView ? "32%" : "100%",
          marginTop: twoPaneView ? 0 : hp("2%"),
          marginLeft: twoPaneView ? wp("1.5%") : 0,
        }}
      >
        <CommonCard
          title={t("NEW CUSTOMERS TODAY")}
          icon={<ICONS.DashCustomerIcon />}
          subtitle={dashboardStats?.current?.customersToday || 0}
          desc={`${dashboardStats?.current?.oldCustomers || 0} ${t(
            "old customers"
          )}`}
          btnTitle={t("View Details")}
          handleBtnTap={() => {
            debugLog(
              "Navigate to Customers",
              { tab: "Overview tab" },
              "dashboard-screen",
              "handleNavigation"
            );
            navigation.navigate("Customers");
          }}
        />
      </View> */}
    </View>
  );
}
