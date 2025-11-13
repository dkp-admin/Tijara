import { useIsFocused } from "@react-navigation/core";
import { endOfDay, format, startOfDay } from "date-fns";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  View,
} from "react-native";
import { useInfiniteQuery } from "react-query";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import CustomHeader from "../../components/common/custom-header";
import SeparatorHorizontalView from "../../components/common/separator-horizontal-view";
import SeparatorVerticalView from "../../components/common/separator-vertical-view";
import EmptyOrLoaderComponent from "../../components/empty";
import Loader from "../../components/loader";
import CreateEditExpensesModal from "../../components/miscellaneous-expenses/create-expenses-modal";
import ExpensesListHeader from "../../components/miscellaneous-expenses/expenses-list-header";
import ExpensesRow from "../../components/miscellaneous-expenses/expenses-row";
import ExpensesTopHeader from "../../components/miscellaneous-expenses/expenses-top-header";
import MiscExpensesFilter from "../../components/miscellaneous-expenses/misc-expenses-filter";
import PermissionPlaceholderComponent from "../../components/permission-placeholder";
import ReportCommonCard from "../../components/reports/report-common-card";
import DefaultText from "../../components/text/Text";
import showToast from "../../components/toast";
import AuthContext from "../../context/auth-context";
import DeviceContext from "../../context/device-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { useFindOne } from "../../hooks/use-find-one";
import { useResponsive } from "../../hooks/use-responsiveness";
import useMiscexpensesStore from "../../store/misc-expenses-filter";
import { AuthType } from "../../types/auth-types";
import { rowsPerPage } from "../../utils/constants";

export const fetchMiscExpensesApi = async (
  pageParam: any,
  companyRef: string,
  locationRef: string,
  userRef: string,
  deviceRef: string,
  queryText: string,
  miscExpensesFilter: any
) => {
  const fromDate = new Date(miscExpensesFilter?.dateRange?.from);
  const toDate = new Date(miscExpensesFilter?.dateRange?.to);

  const paymentMethod =
    miscExpensesFilter?.paymentMethod?.value &&
    miscExpensesFilter?.paymentMethod?.value !== "all"
      ? miscExpensesFilter.paymentMethod.value
      : "";

  const expenseType =
    miscExpensesFilter?.expenseType?.value &&
    miscExpensesFilter?.expenseType?.value !== "all"
      ? miscExpensesFilter.expenseType.value
      : "";

  const status = miscExpensesFilter?.status?.value || "all";

  const response = await serviceCaller(endpoint.miscExpenses.path, {
    method: endpoint.miscExpenses.method,
    query: {
      sort: "desc",
      _q: queryText,
      page: pageParam,
      activeTab: status,
      limit: rowsPerPage,
      companyRef: companyRef,
      locationRef: locationRef,
      // userRef: userRef,
      // deviceRef: deviceRef,
      // expenseType: expenseType,
      transactionType: "debit",
      paymentMethod: paymentMethod,
      dateRange: {
        from: startOfDay(fromDate),
        to: endOfDay(toDate),
      },
    },
  });

  return response;
};

const MiscellaneousExpenses = () => {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();
  const isFocused = useIsFocused();
  const isConnected = checkInternet();
  const authContext = useContext<AuthType>(AuthContext);
  const deviceContext = useContext(DeviceContext) as any;
  const { miscExpensesFilter, setMiscExpensesFilter } =
    useMiscexpensesStore() as any;

  const [queryText, setQueryText] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  const [dataUpdatedAt, setdataUpdatedAt] = useState("");
  const [accountingStats, setAccountingStats] = useState<any>(null);
  const [miscExpensesData, setMiscExpensesData] = useState<any>(null);
  const [visibleMiscExpenses, setVisibleMiscExpenses] = useState(false);

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery(
      [
        `find-misc-expenses`,
        authContext,
        deviceContext,
        queryText,
        isFocused,
        isConnected,
        miscExpensesFilter,
      ],
      async ({ pageParam = 0 }) => {
        if (isConnected) {
          return fetchMiscExpensesApi(
            pageParam,
            authContext.user.companyRef,
            authContext.user.locationRef,
            authContext.user._id,
            deviceContext.user.deviceRef,
            queryText,
            miscExpensesFilter
          );
        }
      },
      {
        getNextPageParam: (lastPage, allPages) => {
          const totalRecords = lastPage?.total;
          const currentPageSize = lastPage?.results?.length || 0;
          const nextPage = allPages?.length;
          if (
            currentPageSize < rowsPerPage ||
            currentPageSize === totalRecords
          ) {
            return null; // No more pages to fetch
          }
          return nextPage;
        },
      }
    );

  const miscExpensesList = useMemo(() => {
    if (data?.pages && isConnected) {
      return data?.pages?.map((page: any) => page?.results).flat();
    } else {
      return [];
    }
  }, [data?.pages]);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const topRowData = useMemo(
    () => [
      {
        title: t("TOTAL DEBIT"),
        amount: `${(accountingStats?.totalDebit || 0)?.toFixed(2)}`,
        infoMsg: t(
          "The Total Debit consists of payouts, vendor payments, and other expenses"
        ),
      },
      {
        title: t("EXPECTED PAYMENTS"),
        amount: `${(accountingStats?.outstandingBalance || 0)?.toFixed(2)}`,
        infoMsg: t(
          "Project your financial future with Anticipated Balance and stay in control of your money"
        ),
      },
    ],
    [accountingStats]
  );

  const listHeaderComponent = useMemo(
    () => (
      <>
        <View
          style={{
            marginLeft: hp("4%"),
            marginTop: hp("3%"),
            marginBottom: -hp("1%"),
          }}
        >
          <DefaultText
            fontSize="lg"
            fontWeight="medium"
            color={theme.colors.otherGrey[100]}
          >
            {`${t("Note")}: ${t("Stats last updated on")} ${format(
              dataUpdatedAt ? new Date(dataUpdatedAt) : new Date(),
              "dd/MM/yyyy, h:mm a"
            )}`}
          </DefaultText>
        </View>

        <View
          style={{
            // borderWidth: 1,
            borderRadius: 8,
            marginVertical: hp("3%"),
            marginHorizontal: hp("2%"),
            // borderColor: theme.colors.dividerColor.secondary,
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <View
            style={{
              flexDirection: twoPaneView ? "row" : "column",
            }}
          >
            {topRowData.map((data, index) => {
              return (
                <React.Fragment key={index}>
                  <View style={{ width: twoPaneView ? "50%" : "100%" }}>
                    <ReportCommonCard key={index} data={data} />
                  </View>

                  {index < topRowData.length - 1 &&
                    (twoPaneView ? (
                      <SeparatorVerticalView />
                    ) : (
                      <SeparatorHorizontalView />
                    ))}
                </React.Fragment>
              );
            })}
          </View>
        </View>

        <ExpensesListHeader />
      </>
    ),
    [accountingStats, dataUpdatedAt]
  );

  const listFooterComponent = useMemo(
    () => (
      <View style={{ height: hp("10%"), marginBottom: 16 }}>
        {isFetchingNextPage && (
          <ActivityIndicator
            size={"small"}
            color={theme.colors.primary[1000]}
          />
        )}
      </View>
    ),
    [isFetchingNextPage]
  );

  const emptyComponent = useMemo(() => {
    return (
      <EmptyOrLoaderComponent
        isEmpty={miscExpensesList.length === 0}
        title={t("No Miscellaneous Expenses!")}
        showBtn={authContext.permission["pos:expense"]?.create}
        btnTitle={t("Create miscellaneous expenses")}
        handleOnPress={() => {
          if (!isConnected) {
            showToast(
              "error",
              t("Miscellaneous Expenses can't be created offline")
            );
            return;
          }

          setQueryText("");
          setMiscExpensesData(null);
          setVisibleMiscExpenses(true);
        }}
      />
    );
  }, [miscExpensesList, isConnected, authContext]);

  const renderMiscExpenses = useCallback(({ item }: any) => {
    return (
      <ExpensesRow
        data={item}
        handleOnPress={(data: any) => {
          setMiscExpensesData(data);
          setVisibleMiscExpenses(true);
        }}
      />
    );
  }, []);

  const getExpenseStats = async () => {
    if (isConnected) {
      const fromDate = new Date(miscExpensesFilter?.dateRange?.from);
      const toDate = new Date(miscExpensesFilter?.dateRange?.to);

      try {
        const res = await serviceCaller("/accounting/stats", {
          method: "GET",
          query: {
            page: 0,
            sort: "desc",
            activeTab: "all",
            limit: rowsPerPage,
            companyRef: authContext.user.companyRef,
            locationRef: authContext.user.locationRef,
            dateRange: {
              from: startOfDay(fromDate),
              to: endOfDay(toDate),
            },
          },
        });

        if (res) {
          setdataUpdatedAt(new Date().toISOString());
          setAccountingStats(res);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  useMemo(() => {
    getExpenseStats();
  }, [authContext, miscExpensesFilter]);

  useEffect(() => {
    setQueryText("");

    setMiscExpensesFilter({
      dateRange: {
        from: new Date(),
        to: new Date(),
      },
      paymentMethod: { title: t("All"), value: "all" },
      expenseType: { title: t("All"), value: "all" },
      status: { title: t("All"), value: "all" },
    });
  }, []);

  return (
    <>
      <CustomHeader />

      <View
        style={{
          ...styles.container,
          backgroundColor: theme.colors.bgColor,
        }}
      >
        <ExpensesTopHeader
          queryText={queryText}
          handleQuery={setQueryText}
          handleBtnTap={() => {
            setMiscExpensesData(null);
            setVisibleMiscExpenses(true);
          }}
          handleFilter={() => {
            setOpenFilter(true);
          }}
        />

        <SeparatorHorizontalView />

        {!isConnected ? (
          <PermissionPlaceholderComponent
            title={t("Please connect with internet")}
            marginTop="-20%"
          />
        ) : !authContext.permission["pos:expense"]?.read ? (
          <PermissionPlaceholderComponent
            title={t("You don't have permission to view this screen")}
            marginTop="-15%"
          />
        ) : isLoading ? (
          <View
            style={{
              ...styles.container,
              backgroundColor: theme.colors.white[1000],
            }}
          >
            <Loader style={{ marginTop: hp("30%") }} />
          </View>
        ) : (
          <FlatList
            onEndReached={loadMore}
            onEndReachedThreshold={0.01}
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={Keyboard.dismiss}
            data={miscExpensesList}
            renderItem={renderMiscExpenses}
            ListHeaderComponent={listHeaderComponent}
            ListEmptyComponent={emptyComponent}
            ListFooterComponent={listFooterComponent}
          />
        )}

        {visibleMiscExpenses && (
          <CreateEditExpensesModal
            data={miscExpensesData}
            visible={visibleMiscExpenses}
            handleClose={() => {
              getExpenseStats();
              setVisibleMiscExpenses(false);
            }}
            handleSuccess={() => {
              getExpenseStats();
              setVisibleMiscExpenses(false);
            }}
          />
        )}

        {openFilter && (
          <MiscExpensesFilter
            visible={openFilter}
            handleClose={() => setOpenFilter(false)}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default MiscellaneousExpenses;
