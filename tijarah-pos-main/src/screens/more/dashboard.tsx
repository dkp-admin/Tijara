import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import CustomHeader from "../../components/common/custom-header";
import DashboardHeaderView from "../../components/dashboard/header-view";
import OverviewTab from "../../components/dashboard/overview-tab";
import ProductsTab from "../../components/dashboard/products-tab";
import SalesTab from "../../components/dashboard/sales-tab.tsx";
import Spacer from "../../components/spacer";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import { debugLog } from "../../utils/log-patch";

const Dashboard = () => {
  const theme = useTheme();
  const { hp } = useResponsive();

  const [activeTab, setActiveTab] = useState(0);

  const showActiveDashboard = useMemo(() => {
    if (activeTab === 0) {
      debugLog(
        "Overview dashbaord",
        {},
        "dashboard-screen",
        "changeTabFunction"
      );
      return <OverviewTab />;
    } else if (activeTab === 1) {
      debugLog("Sales dashboard", {}, "dashboard-screen", "changeTabFunction");
      return <SalesTab />;
    } else if (activeTab === 2) {
      debugLog(
        "Products dashboard",
        {},
        "dashboard-screen",
        "changeTabFunction"
      );
      return <ProductsTab />;
    }
  }, [activeTab]);

  return (
    <>
      <CustomHeader />

      <View
        style={{ ...styles.container, backgroundColor: theme.colors.bgColor }}
      >
        <DashboardHeaderView
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <ScrollView
          contentContainerStyle={{ padding: hp("3%") }}
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
        >
          {showActiveDashboard}

          <Spacer space={hp("12%")} />
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Dashboard;
