import { useIsFocused } from "@react-navigation/core";
import React, {
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import { useInfiniteQuery, useQueryClient } from "react-query";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import TabButton from "../../components/buttons/tab-button";
import CustomHeader from "../../components/common/custom-header";
import SeparatorVerticalView from "../../components/common/separator-vertical-view";
import Loader from "../../components/loader";
import DefaultText from "../../components/text/Text";
import TransactionHeader from "../../components/transactions/header";
import IssueRefundItemModalOrders from "../../components/transactions/issue-refund/issue-refund-item-all-orders";
import PaymentsOrders from "../../components/transactions/payments/payments-orders";
import RefundsOrders from "../../components/transactions/refunds/refund-orders";
import TransactionSideMenu from "../../components/transactions/side-menu";
import TransactionFilter from "../../components/transactions/transaction-filter";
import TransactionHeaderModalOrders from "../../components/transactions/transaction-header-modal-orders";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";

import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import useTransactionStore from "../../store/transaction-filter";
import { AuthType } from "../../types/auth-types";
import { rowsPerPage } from "../../utils/constants";
import PullProductsModal from "./pull-products-modal";
import { Order } from "../../db/schema/order";

export const fetchOrdersFromServer = async (
  pageParam: any,
  companyRef: any,
  activeTab: string,
  queryText: string
) => {
  try {
    const response = await serviceCaller(endpoint.orders.path, {
      method: endpoint.orders.method,
      query: {
        sort: "desc",
        _q: queryText,
        page: pageParam - 1,
        limit: 50,
        activeTab: activeTab,
        companyRef: companyRef,
      },
    });

    return response;
  } catch (error) {}
};

const convertToSectionedList = (orders: Order[]) => {
  // Prepare the data for SectionList
  if (orders?.length > 0) {
    const sectionListData: { header: string; data: Order[] }[] = [];

    // Custom logic to group orders by the createdAt date
    orders.forEach((order: Order) => {
      const createdAtDate = new Date(order?.createdAt)?.toDateString();

      // Find if the header already exists in the sectionListData
      const existingHeaderIndex = sectionListData?.findIndex(
        (item) => item?.header === createdAtDate
      );

      if (existingHeaderIndex !== -1) {
        // If the header exists, push the order to its data array
        sectionListData[existingHeaderIndex]?.data?.push(order);
      } else {
        // If the header doesn't exist, create a new section with the order
        sectionListData.push({ header: createdAtDate, data: [order] });
      }
    });

    return sectionListData;
  }
};

const AllOrders = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const focused = useIsFocused();
  const { twoPaneView } = useResponsive();
  const { transactionFilter, setTransactionFilter } =
    useTransactionStore() as any;
  const [queryText, setQueryText] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null) as any;
  const [openFilter, setOpenFilter] = useState(false);
  const [visiblePullModal, setVisiblePullModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [openIssueRefund, setOpenIssueRefund] = useState(false);
  const [openTransactionHeader, setOpenTransactionHeader] = useState(false);
  const isConnected = checkInternet();
  const authContext = useContext<AuthType>(AuthContext);

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery(
      [`find-order`, transactionFilter, queryText, focused],
      async ({ pageParam = 1 }) => {
        if (isConnected) {
          return fetchOrdersFromServer(
            pageParam,
            authContext?.user?.companyRef,
            "all",
            queryText
          );
        }
      },
      {
        getNextPageParam: (lastPage, allPages) => {
          if (lastPage) {
            const totalRecords = lastPage[1];
            const currentPageSize = lastPage[0]?.length || 0;
            const nextPage = allPages.length + 1;
            if (
              currentPageSize < rowsPerPage ||
              currentPageSize === totalRecords
            ) {
              return null; // No more pages to fetch
            }
            return nextPage;
          }
        },
      }
    );

  const ordersList =
    data?.pages[0]?.results?.flatMap((page: any) => page || []) || [];

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    if (ordersList?.length > 0) {
      if (!twoPaneView) {
        setSelectedOrder(null);
        setOpenTransactionHeader(false);
      } else {
        setSelectedOrder(ordersList?.[0]);
      }
    } else {
      setSelectedOrder(null);
      setOpenTransactionHeader(false);
    }
  }, [twoPaneView]);

  useEffect(() => {
    return () => {
      setTransactionFilter({});
    };
  }, []);

  useEffect(() => {
    if (selectedOrder != null) {
      setActiveTab(0);
    }
  }, [selectedOrder]);

  const renderRight = useMemo(
    () =>
      twoPaneView ? (
        <>
          {isLoading || ordersList?.length > 0 || queryText !== "" ? (
            <>
              <SeparatorVerticalView />

              <View
                style={{
                  width: "70%",
                  height: "100%",
                  backgroundColor: theme.colors.white[1000],
                }}
              >
                <TransactionHeader
                  order={selectedOrder}
                  selectedOrder={selectedOrder?._id}
                  amount={
                    (selectedOrder as any)?.payment?.total?.toFixed(2) || "0"
                  }
                  handleIssueRefund={() => setOpenIssueRefund(true)}
                  origin="all-orders"
                />

                <TabButton
                  tabs={[t("Payments"), t("Refunds")]}
                  activeTab={activeTab}
                  onChange={(tab: any) => {
                    setActiveTab(tab);
                  }}
                />

                {activeTab == 0 ? (
                  <PaymentsOrders
                    data={selectedOrder}
                    setSelectedOrder={setSelectedOrder}
                    origin="all-orders"
                  />
                ) : (
                  <RefundsOrders origin="all-orders" data={selectedOrder} />
                )}
              </View>

              {openFilter && (
                <TransactionFilter
                  visible={openFilter}
                  handleClose={() => setOpenFilter(false)}
                />
              )}

              {openIssueRefund && (
                <IssueRefundItemModalOrders
                  data={selectedOrder}
                  visible={openIssueRefund}
                  handleIssueRefund={(data: any) => {
                    setSelectedOrder(data);
                    setOpenIssueRefund(false);
                  }}
                  handleClose={() => {
                    setOpenIssueRefund(false);
                  }}
                />
              )}
            </>
          ) : (
            <>
              <View
                style={{
                  width: "70%",
                  height: "100%",
                  backgroundColor: theme.colors.white[1000],
                }}
              >
                <TransactionHeader
                  order={selectedOrder}
                  selectedOrder={selectedOrder?._id}
                  amount={
                    (selectedOrder as any)?.payment?.total?.toFixed(2) || "0"
                  }
                  handleIssueRefund={() => setOpenIssueRefund(true)}
                  origin="all-orders"
                />
                <View
                  style={{
                    ...styles.container,
                    backgroundColor: theme.colors.bgColor,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <DefaultText style={{ fontSize: 24 }}>
                    {t(
                      "We're having trouble reaching our servers, Please check your internet connection"
                    )}
                  </DefaultText>
                </View>
              </View>
            </>
          )}
        </>
      ) : (
        <>
          {openFilter && (
            <TransactionFilter
              visible={openFilter}
              handleClose={() => setOpenFilter(false)}
            />
          )}

          {openTransactionHeader && (
            <TransactionHeaderModalOrders
              orderData={selectedOrder}
              setSelectedOrder={setSelectedOrder}
              totalAmount={(selectedOrder as any)?.payment?.total?.toFixed(2)}
              visible={openTransactionHeader}
              handleClose={() => {
                setSelectedOrder(null);
                setOpenTransactionHeader(false);
              }}
            />
          )}
        </>
      ),
    [
      openIssueRefund,
      openTransactionHeader,
      openFilter,
      selectedOrder,
      twoPaneView,
      activeTab,
      openIssueRefund,
      openTransactionHeader,
      openFilter,
      isLoading,
    ]
  );

  const renderLeft = useMemo(
    () => (
      <Suspense fallback={<Loader />}>
        <TransactionSideMenu
          origin="all-orders"
          filter={transactionFilter}
          loadMore={loadMore}
          orderData={convertToSectionedList(ordersList) || []}
          loading={isLoading}
          queryText={queryText}
          setQueryText={setQueryText}
          selectedOrder={selectedOrder}
          setSelectedOrder={(val: any) => {
            if (!twoPaneView) {
              setSelectedOrder(val);
              setOpenTransactionHeader(true);
            } else {
              setSelectedOrder(val);
            }
            Keyboard.dismiss();
          }}
          isFetchingNextPage={isFetchingNextPage}
          handleFilterBtnTap={() => setOpenFilter(true)}
        />
      </Suspense>
    ),
    [
      transactionFilter,
      ordersList,
      selectedOrder,
      twoPaneView,
      queryText,
      isLoading,
      isFetchingNextPage,
      focused,
    ]
  );

  useEffect(() => {
    if (isConnected) {
      setVisiblePullModal(true);
    }
  }, [isConnected]);

  return (
    <>
      <CustomHeader />

      <View
        style={{ ...styles.container, backgroundColor: theme.colors.bgColor }}
      >
        {renderLeft}
        {renderRight}

        {visiblePullModal && (
          <PullProductsModal
            visible={visiblePullModal}
            handleClose={() => setVisiblePullModal(false)}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
});

export default AllOrders;
