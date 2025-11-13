import { useIsFocused } from "@react-navigation/core";
import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import { useInfiniteQuery, useQueryClient } from "react-query";
import { Between, ILike, Like, Raw } from "typeorm";
import { t } from "../../../i18n";
import TabButton from "../../components/buttons/tab-button";
import CustomHeader from "../../components/common/custom-header";
import SeparatorVerticalView from "../../components/common/separator-vertical-view";
import Loader from "../../components/loader";
import TransactionHeader from "../../components/transactions/header";
import IssueRefundItemModal from "../../components/transactions/issue-refund/issue-refund-item";
import Payments from "../../components/transactions/payments/payments";
import Refunds from "../../components/transactions/refunds/refunds";
import TransactionFilter from "../../components/transactions/transaction-filter";
import TransactionHeaderModal from "../../components/transactions/transaction-header-modal";
import { useTheme } from "../../context/theme-context";
import { OrderModel } from "../../database/order/order";
import { useResponsive } from "../../hooks/use-responsiveness";
import useTransactionStore from "../../store/transaction-filter";
import { PROVIDER_NAME, rowsPerPage } from "../../utils/constants";
import { repo } from "../../utils/createDatabaseConnection";
import { debugLog } from "../../utils/log-patch";

const TransactionSideMenu = lazy(
  () => import("../../components/transactions/side-menu")
);

const convertToSectionedList = (orders: OrderModel[]) => {
  // Prepare the data for SectionList
  const sectionListData: { header: string; data: OrderModel[] }[] = [];

  // Custom logic to group orders by the createdAt date
  orders.forEach((order: OrderModel) => {
    const createdAtDate = order.createdAt.toDateString();

    // Find if the header already exists in the sectionListData
    const existingHeaderIndex = sectionListData.findIndex(
      (item) => item.header === createdAtDate
    );

    if (existingHeaderIndex !== -1) {
      // If the header exists, push the order to its data array
      sectionListData[existingHeaderIndex].data.push(order);
    } else {
      // If the header doesn't exist, create a new section with the order
      sectionListData.push({ header: createdAtDate, data: [order] });
    }
  });

  return sectionListData;
};

const Transaction = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const focused = useIsFocused();
  const { twoPaneView } = useResponsive();
  const { transactionFilter, setTransactionFilter } =
    useTransactionStore() as any;
  const [queryText, setQueryText] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null) as any;
  const [openFilter, setOpenFilter] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [openIssueRefund, setOpenIssueRefund] = useState(false);
  const [openTransactionHeader, setOpenTransactionHeader] = useState(false);

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery(
      [`find-order`, transactionFilter, queryText, focused],
      async ({ pageParam = 1 }) => {
        const query: any = {};

        if (
          transactionFilter?.dateRange?.from &&
          transactionFilter?.dateRange?.to
        ) {
          const startDate = new Date(transactionFilter?.dateRange?.from);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(transactionFilter?.dateRange?.to);
          endDate.setHours(23, 59, 0, 0);

          query.createdAt = Between(startDate, endDate);
        }

        if (transactionFilter?.discount?.value === "yes") {
          query.appliedDiscount = true;
        }

        if (transactionFilter?.transactionType?.value === "refunds") {
          query.refunds = Raw(
            (alias: any) => `${alias} != '' AND ${alias} != '[]'`
          );
        }

        if (
          transactionFilter?.orderType?.value !== undefined &&
          transactionFilter?.orderType?.value !== "all"
        ) {
          query.orderType = ILike(`%${transactionFilter.orderType.value}%`);
        }

        if (
          transactionFilter?.source?.value !== undefined &&
          transactionFilter?.source?.value !== "all"
        ) {
          if (transactionFilter?.source?.value === "online") {
            query.onlineOrdering = true;
          } else if (transactionFilter?.source?.value === "qr") {
            query.qrOrdering = true;
          }
        }

        if (
          transactionFilter?.orderStatus?.value !== undefined &&
          transactionFilter?.orderStatus?.value !== "all"
        ) {
          query.orderStatus = ILike(`%${transactionFilter.orderStatus.value}%`);
        }

        if (
          transactionFilter?.paymentMethod?.value === PROVIDER_NAME.CASH ||
          transactionFilter?.paymentMethod?.value === PROVIDER_NAME.CARD ||
          transactionFilter?.paymentMethod?.value === PROVIDER_NAME.WALLET ||
          transactionFilter?.paymentMethod?.value === PROVIDER_NAME.CREDIT
        ) {
          query.payment = Like(`%${transactionFilter.paymentMethod.value}%`);
        }

        const orders = await repo.order.findAndCount({
          take: rowsPerPage,
          skip: rowsPerPage * (pageParam - 1),
          where: {
            orderNum: ILike(`%${queryText}%`),
            ...query,
          },
          order: {
            createdAt: "DESC",
          },
        });

        debugLog("Orders fetched from db", {}, "orders-screen", "fetchOrders");

        return orders;
      },
      {
        getNextPageParam: (lastPage, allPages) => {
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
        },
      }
    );

  const ordersList = data?.pages?.flatMap((page) => page[0] || []) || [];

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // useMemo(() => {
  //   const handleKeyDown = (keyEvent: any) => {
  //     const { pressedKey, keyCode } = keyEvent;
  //     if (keyCode === 66) {
  //       const trimmedQueryText = queryRef.current.queryText.replaceAll(" ", "");
  //       const finalText = trimmedQueryText.replace(
  //         /[\u0000-\u001F\u007F-\u009F]/g,
  //         ""
  //       );
  //       if (finalText === "" || !finalText) return;
  //       setQueryText(finalText);

  //       queryRef.current.queryText = "";
  //     } else {
  //       queryRef.current.queryText += pressedKey;
  //     }
  //   };
  //   KeyEvent.onKeyDownListener(handleKeyDown);
  //   return () => {
  //     KeyEvent.removeKeyDownListener();
  //   };
  // }, []);

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
      queryClient.removeQueries(`find-order`);
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
              amount={(selectedOrder as any)?.payment?.total?.toFixed(2) || "0"}
              handleIssueRefund={() => setOpenIssueRefund(true)}
            />

            <TabButton
              tabs={[t("Payments"), t("Refunds")]}
              activeTab={activeTab}
              onChange={(tab: any) => {
                debugLog(
                  tab === 0 ? "Payments" : "Refunds",
                  {},
                  "orders-screen",
                  "tabSelection"
                );
                setActiveTab(tab);
              }}
            />

            {activeTab == 0 ? (
              <Payments
                data={selectedOrder}
                setSelectedOrder={setSelectedOrder}
              />
            ) : (
              <Refunds data={selectedOrder} />
            )}
          </View>

          {openFilter && (
            <TransactionFilter
              visible={openFilter}
              handleClose={() => setOpenFilter(false)}
            />
          )}

          {openIssueRefund && (
            <IssueRefundItemModal
              data={selectedOrder}
              visible={openIssueRefund}
              handleIssueRefund={(data: any) => {
                setSelectedOrder(data);
                setOpenIssueRefund(false);
              }}
              handleClose={() => {
                debugLog(
                  "Issue refund modal closed",
                  {},
                  "orders-screen",
                  "handleCloseFunction"
                );
                setOpenIssueRefund(false);
              }}
            />
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
            <TransactionHeaderModal
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
    ]
  );

  const renderLeft = useMemo(
    () => (
      <Suspense fallback={<Loader />}>
        <TransactionSideMenu
          filter={transactionFilter}
          loadMore={loadMore}
          orderData={convertToSectionedList(ordersList) || []}
          loading={isLoading}
          queryText={queryText}
          setQueryText={setQueryText}
          selectedOrder={selectedOrder}
          setSelectedOrder={(val: any) => {
            debugLog(
              "Selected order",
              val,
              "orders-screen",
              "selectedOrderFromSideMenu"
            );

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

  return (
    <>
      <CustomHeader />

      <View
        style={{ ...styles.container, backgroundColor: theme.colors.bgColor }}
      >
        {renderLeft}
        {renderRight}
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

export default Transaction;
