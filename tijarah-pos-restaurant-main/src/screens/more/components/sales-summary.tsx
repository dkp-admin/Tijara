import React, { useContext, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { useInfiniteQuery } from "react-query";
import { t } from "../../../../i18n";
import serviceCaller from "../../../api";
import { PrimaryButton } from "../../../components/buttons/primary-button";
import CurrencyView from "../../../components/modal/currency-view-modal";
import SendTransactionReceiptModal from "../../../components/reports/send-receipt/send-receipt";
import DefaultText from "../../../components/text/Text";
import AuthContext from "../../../context/auth-context";
import DeviceContext from "../../../context/device-context";
import { useTheme } from "../../../context/theme-context";
import { checkInternet } from "../../../hooks/check-internet";
import usePrinterStatus from "../../../hooks/use-printer-status";
import { useResponsive } from "../../../hooks/use-responsiveness";
import useReportStore from "../../../store/report-filter";
import { useDashboardData } from "../../../utils/get-sales-summary-data";
import ICONS from "../../../utils/icons";
import { printReceipt } from "../../../utils/print-sales-summary";
import SalesSummaryListComponent from "./sales-summary-list-component";
import SalesSummaryTopCards from "./sales-summary-top-cards";
import useCommonApis from "../../../hooks/useCommonApis";
import { endOfDay, format, startOfDay } from "date-fns";
import ReportsNavHeader from "../../../components/reports/reports-navigation-header";
import ReportFilter from "../../../components/reports/report-filter";
import { currencyValue } from "../../../utils/get-value-currency";
import Loader from "../../../components/loader";

const SalesSummaryReports = ({ menu = "sales" }: any) => {
  const authContext = useContext(AuthContext);
  const { reportFilter } = useReportStore() as any;
  const { twoPaneView, hp, wp } = useResponsive();
  const { businessData, billingSettings } = useCommonApis();
  const deviceContext = useContext(DeviceContext);
  const { isConnected: isPrinterConnected } = usePrinterStatus();
  const [showSendReceipt, setShowSendReceipt] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const isConnected = checkInternet();
  const theme = useTheme();

  const fetchSalesSummary = async () => {
    try {
      const res = await serviceCaller("/report/sale-summary", {
        method: "GET",
        query: {
          page: 0,
          desc: "",
          activeTab: "",
          limit: 10,
          companyRef: authContext.user.companyRef,
          locationRef: authContext?.user?.locationRef,
          dateRange: {
            from: reportFilter.dateRange?.from || startOfDay(new Date()),
            to: reportFilter.dateRange?.endDate || endOfDay(new Date()),
          },
        },
      });

      return res;
    } catch (err: any) {
      throw err; // Re-throw the error for useInfiniteQuery to handle
    }
  };

  const {
    data: salesData,
    isLoading,
    dataUpdatedAt,
    error,
    refetch,
  } = useInfiniteQuery(
    [`find-sales-summary`, authContext, reportFilter, menu],
    async ({}) => {
      if (isConnected) {
        return await fetchSalesSummary();
      }
    }
  );

  const data: any = useMemo(() => {
    if (salesData?.pages && isConnected) {
      return { ...salesData?.pages?.map((page: any) => page).flat()[0] };
    } else {
      return {};
    }
  }, [salesData?.pages, isConnected]);

  const { topCardData, orderDetailItems, orderTypesData, chargesData } =
    useDashboardData(data);

  const getReportNote = useMemo(() => {
    const businessHour =
      businessData?.location?.businessClosureSetting?.businessTime;
    const endStartReporting =
      businessData?.location?.businessClosureSetting?.endStartReporting;

    if (businessHour && !reportFilter?.reportingHours?._id) {
      return `${t(
        "The report being shown is based on location business hours"
      )}`;
    } else if (endStartReporting && !reportFilter?.reportingHours?._id) {
      return `${t(
        "The report being shown is based on End at business day settings"
      )}`;
    } else if (reportFilter?.reportingHours?._id) {
      return `${t("The report being shown is based on Reporting hours")}`;
    } else {
      return `${t(
        "The report being shown is based on Company time zone (12:00 - 11:59)"
      )}`;
    }
  }, [businessData]);

  const getDateRange = useMemo(() => {
    if (reportFilter?.dateRange) {
      return `${reportFilter.dateRange.showStartDate} - ${reportFilter.dateRange.showEndDate}`;
    } else {
      return `${format(new Date(), "MMM d, `yy")} - ${format(
        new Date(),
        "MMM d, `yy"
      )}`;
    }
  }, [reportFilter]);

  useEffect(() => {
    if (menu === "sales") {
      refetch();
    }
  }, [menu, authContext, reportFilter]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bgColor }}>
        <Loader style={{ marginTop: hp("35%") }} />
      </View>
    );
  }

  if (error || !isConnected || !salesData) {
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          height: hp("80%"),
          flex: 0.75,

          backgroundColor: theme.colors.bgColor,
        }}
      >
        <DefaultText style={{ fontSize: 24 }}>
          {t(
            "We're having trouble reaching our servers, Please check your internet connection"
          )}
        </DefaultText>
      </View>
    );
  }

  return (
    <>
      {isLoading ? (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            flex: 0.75,
            flexDirection: "row",
          }}
        >
          <ActivityIndicator size={40} />
        </View>
      ) : (
        <ScrollView
          style={{
            flex: twoPaneView ? 0.75 : 1,
            width: "100%",
            backgroundColor: theme.colors.bgColor,
          }}
        >
          <View>
            {!twoPaneView && (
              <ReportsNavHeader
                title={t("Sales summary")}
                dateRange={getDateRange}
                selectedMenu={menu}
                handleFilterTap={() => setOpenFilter(true)}
              />
            )}
            <View
              style={{
                marginLeft: hp("4%"),
                marginTop: hp("3%"),
                marginBottom: -hp("1%"),
              }}
            >
              <DefaultText
                style={{ marginRight: "2%" }}
                fontSize="lg"
                fontWeight="medium"
                color={theme.colors.otherGrey[100]}
              >
                {`${t("Note")}: ${getReportNote}. ${t(
                  "Stats last updated on"
                )} ${format(new Date(dataUpdatedAt), "dd/MM/yyyy, h:mm a")}.`}
              </DefaultText>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 12,
                marginBottom: 8,
                justifyContent: "flex-end",
                marginHorizontal: 10,
              }}
            >
              <PrimaryButton
                reverse
                style={{
                  borderRadius: 10,
                  marginLeft: twoPaneView ? hp("2.5%") : hp("0.5%"),
                  paddingVertical: twoPaneView ? hp("2%") : hp("1.5%"),
                  paddingHorizontal: twoPaneView ? wp("2.15%") : wp("1%"),
                  backgroundColor: !twoPaneView
                    ? "transparent"
                    : isPrinterConnected
                    ? theme.colors.primary[200]
                    : theme.colors.dividerColor.main,
                }}
                textStyle={{
                  fontSize: 16,
                  fontWeight: theme.fontWeights.normal,
                  fontFamily: theme.fonts.circulatStd,
                  color: !twoPaneView
                    ? "transparent"
                    : isPrinterConnected
                    ? theme.colors.primary[1000]
                    : theme.colors.otherGrey[200],
                }}
                title={twoPaneView ? t("Print") : ""}
                leftIcon={
                  !twoPaneView && (
                    <ICONS.PrinterOrderIcon
                      color={
                        isPrinterConnected
                          ? theme.colors.primary[1000]
                          : theme.colors.otherGrey[200]
                      }
                    />
                  )
                }
                onPress={async () => {
                  try {
                    await printReceipt(
                      data,
                      reportFilter,
                      authContext,
                      deviceContext,
                      billingSettings
                    );
                  } catch (error) {
                    console.log(error);
                  }
                }}
                disabled={!isPrinterConnected}
              />

              <PrimaryButton
                reverse
                style={{
                  borderRadius: 10,
                  marginLeft: twoPaneView ? hp("2.5%") : hp("0.5%"),
                  paddingVertical: twoPaneView ? hp("2%") : 0,
                  paddingHorizontal: twoPaneView ? wp("2.15%") : 0,
                  backgroundColor: theme.colors.primary[200],
                }}
                textStyle={{
                  fontSize: 16,
                  fontWeight: theme.fontWeights.normal,
                  fontFamily: theme.fonts.circulatStd,
                  color: theme.colors.primary[1000],
                }}
                title={twoPaneView ? t("Send") : ""}
                onPress={() => {
                  setShowSendReceipt(true);
                }}
                leftIcon={
                  !twoPaneView && (
                    <ICONS.SendOrderIcon color={theme.colors.primary[1000]} />
                  )
                }
              />
            </View>
            <View
              style={{
                flexDirection: twoPaneView ? "row" : "column",
                flexWrap: "wrap",
                gap: 10,
                padding: 10,
                justifyContent: "space-between",
              }}
            >
              {topCardData.map((card: any) => {
                return (
                  <SalesSummaryTopCards
                    key={card?.title}
                    title={card?.title?.toUpperCase()}
                    bottomCount={card?.bottomCount}
                    bottomText={card?.bottomText}
                    topAmount={card?.topAmount}
                    Icon={card?.icon}
                  />
                );
              })}
            </View>
            <View
              style={{
                flexDirection: twoPaneView ? "row" : "column",
                gap: 10,
                padding: 5,
              }}
            >
              <View style={style.cards}>
                <DefaultText style={{ fontSize: 20, fontWeight: "medium" }}>
                  Order Details
                </DefaultText>
                {orderDetailItems.map((item) => {
                  return (
                    <SalesSummaryListComponent
                      key={item.label}
                      label={item.label}
                      value={item.value}
                    />
                  );
                })}
              </View>
              <View style={style.cards}>
                <DefaultText style={{ fontSize: 20, fontWeight: "medium" }}>
                  Transaction Details
                </DefaultText>
                {data?.txnStats
                  ?.map((stats: any) => {
                    return {
                      label: stats?.paymentName.toUpperCase(),
                      value: (
                        <CurrencyView
                          amount={currencyValue(stats?.balanceAmount || 0)}
                        />
                      ),
                      count: stats?.noOfPayments,
                    };
                  })
                  .map((item: any) => {
                    return (
                      <SalesSummaryListComponent
                        key={item.label}
                        label={item.label}
                        value={item.value}
                        count={item.count}
                      />
                    );
                  })}
              </View>
            </View>
            <View
              style={{
                flexDirection: twoPaneView ? "row" : "column",
                gap: 10,
                padding: 5,
                justifyContent: "flex-start",
              }}
            >
              <View style={style.cards}>
                <DefaultText style={{ fontSize: 20 }}>
                  Refund Details
                </DefaultText>
                {[...(data?.refundData || [])]
                  ?.map((refu: any) => {
                    return {
                      label: refu?.refundType || "",
                      value: (
                        <CurrencyView
                          amount={Number(refu?.totalRefund || 0).toFixed(2)}
                        />
                      ),
                      count: refu?.refundCount || 0,
                    };
                  })
                  .map((item: any) => {
                    return (
                      <SalesSummaryListComponent
                        key={item.label}
                        label={item?.label}
                        value={item.value}
                        count={item.count}
                      />
                    );
                  })}
              </View>
              <View style={style.cards}>
                <DefaultText style={{ fontSize: 20, fontWeight: "medium" }}>
                  Order Type
                </DefaultText>
                {orderTypesData.map((item: any) => {
                  return (
                    <SalesSummaryListComponent
                      label={item.label}
                      value={item.value}
                      count={item.count}
                      key={item.label}
                    />
                  );
                })}
              </View>
            </View>
            <View
              style={{
                flexDirection: twoPaneView ? "row" : "column",
                gap: 10,
                padding: 5,
                justifyContent: "flex-start",
              }}
            >
              <View style={style.cards}>
                <DefaultText style={{ fontSize: 20, fontWeight: "medium" }}>
                  Custom Charges
                </DefaultText>
                {chargesData.map((item: any) => {
                  return (
                    <SalesSummaryListComponent
                      key={item.label}
                      label={item.label}
                      value={item.value}
                      count={item.count}
                    />
                  );
                })}
              </View>
              <View
                style={{
                  gap: 20,
                  padding: 20,
                  flex: 1,
                }}
              ></View>
            </View>
          </View>
        </ScrollView>
      )}
      {showSendReceipt && (
        <SendTransactionReceiptModal
          salesSummary={data}
          dateRange={{
            from: reportFilter.dateRange?.from || startOfDay(new Date()),
            to: reportFilter.dateRange?.endDate || endOfDay(new Date()),
          }}
          visible={showSendReceipt}
          handleClose={() => {
            setShowSendReceipt(false);
          }}
        />
      )}
      <ReportFilter
        reportType={menu}
        visible={openFilter}
        handleClose={() => setOpenFilter(false)}
      />
    </>
  );
};

const style = StyleSheet.create({
  cards: {
    flexDirection: "column",
    gap: 20,
    padding: 20,

    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ededed",
  },
});

export default SalesSummaryReports;
