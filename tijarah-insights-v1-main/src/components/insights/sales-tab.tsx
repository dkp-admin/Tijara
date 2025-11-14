import { endOfDay, format, startOfDay } from "date-fns";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useAuth } from "../../hooks/use-auth";
import { useFindOne } from "../../hooks/use-find-one";
import { useResponsive } from "../../hooks/use-responsiveness";
import ICONS from "../../utils/icons";
import { getAmount } from "../modal/currency-view-modal";
import Spacer from "../spacer";
import DefaultText, { getOriginalSize } from "../text/Text";
import FinancialCard from "./common/financials-card";
import { getComparisionText } from "./date-range-filter";
import CategoryChartCard from "./sales/category-chart-card";
import Earnings from "./sales/earnings";
import GrossSalesCard from "./sales/gross-sales-card";
import OrdeerTypeCard from "./sales/order-type";
import ProductChartCard from "./sales/product-chart-card";
import ProductsSoldCard from "./sales/product-sold-card";
import SalesEarningsCard, { getDayCompareText } from "./sales/sales-earnings";
import TransactionMode from "./sales/transaction-mode";
import LoadingRect from "./skeleton-loader/skeleton-loader";

const getGrossProfit = (data: any, salesSummary: any) => {
  return salesSummary?.netSales > 0
    ? salesSummary?.netSales - data?.netCost || 0
    : data?.netCost || 0;
};

const getMarginPercent = (data: any, salesSummary: any) => {
  const netProfit =
    salesSummary?.netSales > 0
      ? salesSummary?.netSales - data?.netCost || 0
      : data?.netCost || 0;
  const netMargin = (netProfit * 100) / salesSummary?.netSales;
  const percent = (netMargin || 0).toFixed(0);

  return percent === "Infinity" ? "-" : `${Number(percent || 0)}%`;
};

export default function SalesTab({
  activeDateTab,
  locationRef,
  dateRange,
  prevDate,
}: {
  activeDateTab: number;
  locationRef: string;
  dateRange: any;
  prevDate: any;
}) {
  const theme = useTheme();
  const { hp } = useResponsive();
  const { user } = useAuth();

  const [activeProductTab, setActiveProductTab] = useState(0);
  const [activeCategoryTab, setActiveCategoryTab] = useState(0);

  const {
    findOne: findSalesSummary,
    entity: salesSummaryData,
    loading: loadingSales,
  } = useFindOne("report/sale-summary");

  const {
    findOne: findVATSales,
    entity: vatSalesData,
    loading: loadingVAT,
  } = useFindOne("report/vat/stats");

  const {
    findOne: findStats,
    entity: statsData,
    loading: loadingStats,
    dataUpdatedAt,
  } = useFindOne("dash/merchant/stats");

  const {
    findOne: findAnalytics,
    entity: analyticsData,
    loading: loadingAnalytics,
  } = useFindOne("dash");

  useEffect(() => {
    const query: any = {
      companyRef: user?.companyRef,
      type: "comparison",
      dateRange: {
        from: startOfDay(dateRange?.from),
        to: endOfDay(dateRange?.to),
        prevFrom: startOfDay(prevDate?.from),
        prevTo: endOfDay(prevDate?.to),
      },
    };

    if (locationRef && locationRef !== "all") {
      query["locationRef"] = locationRef;
    }

    findStats(query);
  }, [user, locationRef, dateRange, prevDate]);

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

    findAnalytics(query);
    findSalesSummary(query);
    findVATSales({ ...query, page: 0, sort: "desc", limit: 10 });
  }, [user, locationRef, dateRange]);
  console.log("gfhgfghfh", analyticsData?.topCategories);

  return (
    <View>
      <View
        style={{
          marginLeft: getOriginalSize(16),
          marginTop: getOriginalSize(8),
          marginBottom: getOriginalSize(8),
        }}
      >
        {statsData ? (
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

      <SalesEarningsCard
        activeDateTab={activeDateTab}
        endDate={dateRange.to}
        prevNetSales={statsData?.prev?.sales || 0}
        currentMetSales={
          (salesSummaryData?.netSales || 0) +
          (salesSummaryData?.totalVat || 0) +
          (salesSummaryData?.chargesWithoutVat || 0) -
          (salesSummaryData?.refundedCharges || 0)
        }
        totalOrders={salesSummaryData?.totalOrder || 0} //{statsData?.current?.orderToday || 0}
        earningData={analyticsData?.revenueAndBills || []}
        loading={loadingSales || !salesSummaryData} //{loadingStats || !statsData || !analyticsData}
      />

      <View style={styles.grossSalesView}>
        <View style={{ flex: 1 }}>
          <GrossSalesCard
            title={t("Net Profit")}
            infoTextMsg={t("info_net_profit_stats_in_sales")}
            amount={getGrossProfit(
              {
                netCost:
                  Number(vatSalesData?.costPrice || 0) +
                  Number(vatSalesData?.vatOnPurchase || 0),
              },
              {
                netSales:
                  Number(salesSummaryData?.netSales || 0) +
                  Number(salesSummaryData?.chargesWithoutVat || 0) -
                  Number(salesSummaryData?.refundedCharges || 0) +
                  Number(salesSummaryData?.refundedVatOnCharge || 0),
              }
            )?.toFixed(2)}
            // {getGrossProfit(
            //   statsData?.current,
            //   salesSummaryData
            // )?.toFixed(2)}
            subTitle1={getMarginPercent(statsData?.current, salesSummaryData)}
            subTitle2={
              getMarginPercent(statsData?.current, salesSummaryData) === "-"
                ? ""
                : t("Margin")
            }
            prev={getGrossProfit(statsData?.prev, salesSummaryData)}
            current={getGrossProfit(statsData?.current, salesSummaryData)}
            desc1={`${t("vs")}. ${t("SAR")} ${getAmount(
              getGrossProfit(statsData?.prev, salesSummaryData)
            )}`}
            desc2={getDayCompareText(activeDateTab, dateRange.to)}
            loading={
              loadingSales || loadingVAT || !salesSummaryData || !vatSalesData
            } //{loadingStats || !statsData}
          />
        </View>

        <Spacer space={getOriginalSize(16)} />

        <View style={{ flex: 1 }}>
          <GrossSalesCard
            title={t("Discount Given")}
            infoTextMsg={t("info_discount_given_stats_in_sales")}
            amount={Number(salesSummaryData?.discount || 0)?.toFixed(2)} //{Number(statsData?.current?.discount || 0)?.toFixed(2)}
            subTitle1={""}
            subTitle2={""}
            prev={statsData?.current?.discount || 0}
            current={statsData?.prev?.discount || 0}
            desc1={`${t("vs")}. ${t("SAR")} ${getAmount(
              statsData?.prev?.discount || 0
            )}`}
            desc2={getDayCompareText(activeDateTab, dateRange.to)}
            loading={loadingSales || !salesSummaryData} //{loadingStats || !statsData}
          />
        </View>
      </View>

      <View style={styles.grossSalesView}>
        <View style={{ flex: 1 }}>
          <FinancialCard
            title={t("VAT Collected")}
            icon={
              <ICONS.MoneyReceivedIcon
                width={getOriginalSize(26)}
                height={getOriginalSize(24)}
              />
            }
            amount={Number(
              (salesSummaryData?.totalVat || 0) -
                (salesSummaryData?.refundedVatOnCharge || 0)
            )?.toFixed(2)} //{Number(statsData?.current?.vatCollected || 0)?.toFixed(2)}
            isPercent={false} //{true}
            prev={statsData?.prev?.vatCollected || 0}
            current={statsData?.current?.vatCollected || 0}
            percentText={getComparisionText(activeDateTab, dateRange.to)}
            loading={loadingSales || !salesSummaryData} //{loadingStats || !statsData}
          />
        </View>

        <Spacer space={getOriginalSize(16)} />

        <View style={{ flex: 1 }}>
          <FinancialCard
            title={t("Amount Refunded")}
            icon={
              <ICONS.MoneySendIcon
                width={getOriginalSize(26)}
                height={getOriginalSize(24)}
              />
            }
            amount={Number(
              (salesSummaryData?.refundInCash || 0) +
                (salesSummaryData?.refundInCard || 0) +
                (salesSummaryData?.refundInWallet || 0) +
                (salesSummaryData?.refundInCredit || 0)
            )?.toFixed(2)}
            // {Number(
            //   statsData?.current?.refundedAmountToday || 0
            // )?.toFixed(2)}
            isPercent={false} //{true}
            prev={statsData?.prev?.refundedAmountToday || 0}
            current={statsData?.current?.refundedAmountToday || 0}
            percentText={getComparisionText(activeDateTab, dateRange.to)}
            loading={loadingSales || !salesSummaryData} //{loadingStats || !statsData}
          />
        </View>
      </View>

      {/* <ProductsSoldCard
        current={statsData?.current?.productSold || 0}
        prev={statsData?.prev?.productSold || 0}
        loading={loadingStats || !statsData}
        percentText={getComparisionText(activeDateTab, dateRange.to)}
      /> */}

      {/* <View style={styles.grossSalesView}>
        <View style={{ flex: 1 }}>
          <FinancialCard
            title={t("New Customers")}
            icon={
              <ICONS.NewCustomerIcon
                width={getOriginalSize(26)}
                height={getOriginalSize(24)}
              />
            }
            textValue={`${statsData?.current?.customersToday || 0}`}
            isPercent={false} //{true}
            prev={statsData?.prev?.customersToday || 0}
            current={statsData?.current?.customersToday || 0}
            percentText={getComparisionText(activeDateTab, dateRange.to)}
            loading={loadingStats || !statsData}
          />
        </View>

        <Spacer space={getOriginalSize(16)} />

        <View style={{ flex: 1 }}>
          <FinancialCard
            title={t("Old Customers")}
            icon={
              <ICONS.ReturningCustomerIcon
                width={getOriginalSize(26)}
                height={getOriginalSize(24)}
              />
            }
            textValue={`${statsData?.current?.oldCustomers || 0}`}
            isPercent={false} //{true}
            prev={statsData?.prev?.oldCustomers || 0}
            current={statsData?.current?.oldCustomers || 0}
            percentText={getComparisionText(activeDateTab, dateRange.to)}
            loading={loadingStats || !statsData}
          />
        </View>
      </View> */}

      <DefaultText
        style={{ marginTop: hp("5%"), marginLeft: getOriginalSize(16) }}
        fontWeight="bold"
      >
        {t("Analytics")}
      </DefaultText>

      <Spacer space={getOriginalSize(12)} />

      <TransactionMode
        transactionData={salesSummaryData}
        loading={loadingSales || !salesSummaryData}
      />

      <Spacer space={getOriginalSize(12)} />

      <OrdeerTypeCard
        analyticsData={salesSummaryData}
        loading={loadingSales || !salesSummaryData}
      />

      <Spacer space={getOriginalSize(12)} />

      <ProductChartCard
        activeTab={activeProductTab}
        setActiveTab={setActiveProductTab}
        products={analyticsData?.topProducts || []}
        loading={loadingAnalytics || !analyticsData}
      />

      <Spacer space={getOriginalSize(12)} />

      <CategoryChartCard
        activeTab={activeCategoryTab}
        setActiveTab={setActiveCategoryTab}
        data={analyticsData?.topCategories || []}
        loading={loadingAnalytics || !analyticsData}
      />

      {/* <Spacer space={getOriginalSize(12)} />

      <Earnings
        monthlyEarning={analyticsData?.monthlyEarning || []}
        loading={loadingAnalytics || !analyticsData}
      /> */}
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
