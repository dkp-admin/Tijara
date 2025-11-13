import { endOfDay, format, startOfDay } from "date-fns";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useAuth } from "../../hooks/use-auth";
import { useFindOne } from "../../hooks/use-find-one";
import { useResponsive } from "../../hooks/use-responsiveness";
import ICONS from "../../utils/icons";
import Spacer from "../spacer";
import DefaultText, { getOriginalSize } from "../text/Text";
import FinancialCard from "./common/financials-card";
import VendorChartCard from "./others/vendor-chart-card";
import VendorOrderCard from "./others/vendor-order-card";
import VendorProfitsCard from "./others/vendor-profits-card";
import LoadingRect from "./skeleton-loader/skeleton-loader";

export default function OthersTab({
  apiCall = false,
  locationRef,
  dateRange,
}: {
  apiCall: boolean;
  locationRef: string;
  dateRange: any;
}) {
  const theme = useTheme();
  const { hp } = useResponsive();
  const { user } = useAuth();

  const [activeOrdersTab, setActiveOrdersTab] = useState(0);
  const [activeProditsTab, setActiveProditsTab] = useState(0);

  const {
    findOne: findOtherStats,
    entity: otherStats,
    loading: loadingOtherStats,
    dataUpdatedAt,
  } = useFindOne("dash/other/stats");

  const {
    findOne: findVendorOrderStats,
    entity: vendorOrderStats,
    loading: loadingVendorOrderStats,
  } = useFindOne("dash/other/vendor-order/stats");

  const {
    findOne: findVendorOrders,
    entity: vendorOrders,
    loading: loadingVendorOrders,
  } = useFindOne("dash/other/vendor-order");

  const {
    findOne: findVendorProfits,
    entity: vendorProfits,
    loading: loadingVendorProfits,
  } = useFindOne("dash/other/vendor-profit");

  useEffect(() => {
    const query: any = {
      companyRef: user?.companyRef,
      dateRange: {
        from: startOfDay(dateRange?.from),
        to: endOfDay(dateRange?.to),
      },
    };

    if (locationRef && locationRef !== "all") {
      query["locationRef"] = locationRef;
    }

    findOtherStats(query);
    findVendorOrderStats(query);
  }, [user, locationRef, dateRange]);

  useEffect(() => {
    if (vendorOrderStats) {
      const query: any = {
        companyRef: user?.companyRef,
        dateRange: {
          from: startOfDay(dateRange?.from),
          to: endOfDay(dateRange?.to),
        },
        type: activeOrdersTab === 0 ? "" : "most",
      };

      if (locationRef && locationRef !== "all") {
        query["locationRef"] = locationRef;
      }

      findVendorOrders(query);
    }
  }, [user, locationRef, dateRange, activeOrdersTab, vendorOrderStats]);

  useEffect(() => {
    if (apiCall && vendorOrders) {
      const query: any = {
        companyRef: user?.companyRef,
        dateRange: {
          from: startOfDay(dateRange?.from),
          to: endOfDay(dateRange?.to),
        },
        type: activeProditsTab === 0 ? "most" : "least",
      };

      if (locationRef && locationRef !== "all") {
        query["locationRef"] = locationRef;
      }

      findVendorProfits(query);
    }
  }, [user, apiCall, locationRef, dateRange, activeProditsTab, vendorOrders]);

  return (
    <View>
      <View
        style={{
          marginLeft: getOriginalSize(16),
          marginTop: getOriginalSize(8),
        }}
      >
        {otherStats ? (
          <DefaultText
            fontSize="lg"
            fontWeight="bold"
            color={theme.colors.otherGrey[100]}
          >
            {`${t("Note")}: ${t("Last updated on")} ${format(
              new Date(dataUpdatedAt),
              "d/MM/yyyy, h:mm a"
            )}`}
          </DefaultText>
        ) : (
          <LoadingRect
            width={getOriginalSize(250)}
            height={getOriginalSize(20)}
          />
        )}
      </View>

      <View style={styles.grossSalesView}>
        <View style={{ flex: 1 }}>
          <FinancialCard
            title={t("Active Locations")}
            infoTextMsg={t("info_locations_stats_in_others")}
            icon={
              <ICONS.LocationTickIcon
                width={getOriginalSize(26)}
                height={getOriginalSize(24)}
              />
            }
            textValue={`${otherStats?.location || 0}`}
            isDescription={true}
            descriptionIcon={
              <ICONS.MonitorMobileIcon
                width={getOriginalSize(14)}
                height={getOriginalSize(14)}
              />
            }
            description={`${otherStats?.device || 0} ${t("Devices")}`}
            loading={loadingOtherStats || !otherStats}
          />
        </View>

        <Spacer space={getOriginalSize(14)} />

        <View style={{ flex: 1 }}>
          <FinancialCard
            title={t("Active Products")}
            infoTextMsg={t("info_products_stats_in_others")}
            icon={
              <ICONS.ActiveProductsIcon
                width={getOriginalSize(26)}
                height={getOriginalSize(24)}
              />
            }
            textValue={`${otherStats?.productCount || 0}`}
            isDescription={true}
            descriptionIcon={
              <ICONS.CategoriesIcon
                width={getOriginalSize(14)}
                height={getOriginalSize(14)}
              />
            }
            description={`${otherStats?.category || 0} ${t("Categories")}`}
            loading={loadingOtherStats || !otherStats}
          />
        </View>
      </View>

      <View style={styles.grossSalesView}>
        <View style={{ flex: 1 }}>
          <FinancialCard
            title={t("Cashiers")}
            infoTextMsg={t("info_cashiers_stats_in_others")}
            icon={
              <ICONS.CashiersIcon
                width={getOriginalSize(26)}
                height={getOriginalSize(24)}
              />
            }
            textValue={`${otherStats?.cashier || 0}`}
            loading={loadingOtherStats || !otherStats}
          />
        </View>

        <Spacer space={getOriginalSize(14)} />

        <View style={{ flex: 1 }}>
          <FinancialCard
            title={t("Managers")}
            infoTextMsg={t("info_managers_stats_in_others")}
            icon={
              <ICONS.ManagersIcon
                width={getOriginalSize(26)}
                height={getOriginalSize(24)}
              />
            }
            textValue={`${otherStats?.manager || 0}`}
            loading={loadingOtherStats || !otherStats}
          />
        </View>
      </View>

      <View style={styles.grossSalesView}>
        <View style={{ flex: 1 }}>
          <FinancialCard
            title={t("Vendors")}
            infoTextMsg={t("info_vendors_stats_in_others")}
            icon={
              <ICONS.VendorsIcon
                width={getOriginalSize(26)}
                height={getOriginalSize(24)}
              />
            }
            textValue={`${otherStats?.vendor || 0}`}
            loading={loadingOtherStats || !otherStats}
          />
        </View>

        <Spacer space={getOriginalSize(14)} />

        <View style={{ flex: 1 }}></View>
      </View>

      <DefaultText
        style={{
          marginTop: hp("4%"),
          marginLeft: getOriginalSize(16),
          marginBottom: -getOriginalSize(4),
        }}
        fontWeight="bold"
      >
        {t("Vendor Orders")}
      </DefaultText>

      <View style={styles.grossSalesView}>
        <View style={{ flex: 1 }}>
          <FinancialCard
            title={t("Payments Done")}
            icon={
              <ICONS.MoneyIcon
                width={getOriginalSize(26)}
                height={getOriginalSize(24)}
              />
            }
            amount={Number(vendorOrderStats?.paid || 0).toFixed(2)}
            isDescription={true}
            descriptionIcon={
              <ICONS.BillIcon
                width={getOriginalSize(14)}
                height={getOriginalSize(14)}
              />
            }
            description={`${vendorOrderStats?.paidCount || 0} ${t("Orders")}`}
            loading={loadingVendorOrderStats || !vendorOrderStats}
          />
        </View>

        <Spacer space={getOriginalSize(14)} />

        <View style={{ flex: 1 }}>
          <FinancialCard
            title={t("Payments Pending")}
            icon={
              <ICONS.MoneyTimeIcon
                width={getOriginalSize(26)}
                height={getOriginalSize(24)}
              />
            }
            amount={Number(vendorOrderStats?.unpaid || 0).toFixed(2)}
            isDescription={true}
            descriptionIcon={
              <ICONS.BillIcon
                width={getOriginalSize(14)}
                height={getOriginalSize(14)}
              />
            }
            description={`${vendorOrderStats?.unpaidCount || 0} ${t("Orders")}`}
            loading={loadingVendorOrderStats || !vendorOrderStats}
          />
        </View>
      </View>

      <VendorChartCard
        activeTab={activeOrdersTab}
        setActiveTab={setActiveOrdersTab}
        data={vendorOrders || []}
        loading={loadingVendorOrders || !vendorOrders}
      />

      <Spacer space={getOriginalSize(12)} />

      <VendorOrderCard
        subtitle={activeOrdersTab === 0 ? t("Most Orders") : t("Least Orders")}
        vendorOrders={
          loadingVendorOrders || !vendorOrders
            ? [1, 2, 3, 4, 5]
            : vendorOrders?.slice(0, 5) || []
        }
        loading={loadingVendorOrders || !vendorOrders}
      />

      <Spacer space={getOriginalSize(12)} />

      <VendorProfitsCard
        activeTab={activeProditsTab}
        setActiveTab={setActiveProditsTab}
        vendorProfits={vendorProfits || []}
        loading={loadingVendorProfits || !vendorProfits}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grossSalesView: {
    marginTop: getOriginalSize(16),
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
