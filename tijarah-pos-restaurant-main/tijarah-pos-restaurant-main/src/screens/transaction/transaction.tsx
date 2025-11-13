import { useIsFocused } from "@react-navigation/core";
import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import { useInfiniteQuery, useQueryClient } from "react-query";

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
import repository from "../../db/repository";
import { Order } from "../../db/schema/order";
import { useResponsive } from "../../hooks/use-responsiveness";
import useTransactionStore from "../../store/transaction-filter";
import { rowsPerPage } from "../../utils/constants";

const TransactionSideMenu = lazy(
  () => import("../../components/transactions/side-menu")
);

const convertToSectionedList = (orders: Order[]) => {
  // Prepare the data for SectionList
  const sectionListData: { header: string; data: Order[] }[] = [];

  // Custom logic to group orders by the createdAt date
  orders.forEach((order: Order) => {
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

          query.createdAt = {
            operator: "Between",
            start: startDate,
            end: endDate,
          };
        }

        if (transactionFilter?.discount?.value === "yes") {
          query.appliedDiscount = true;
        }

        if (transactionFilter?.transactionType?.value === "refunds") {
          query.refunds = { operator: "Raw" };
        }

        if (
          transactionFilter?.orderType?.value !== undefined &&
          transactionFilter?.orderType?.value !== "all"
        ) {
          query.orderType = {
            operator: "ILike",
            value: transactionFilter.orderType.value,
          };
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
          query.orderStatus = {
            operator: "ILike",
            value: transactionFilter.orderStatus.value,
          };
        }

        if (
          transactionFilter?.paymentMethod?.value &&
          transactionFilter?.paymentMethod?.value !== "all"
        ) {
          query.paymentMethod = {
            operator: "Like",
            value: transactionFilter.paymentMethod.value,
          };
        }

        const [orders, total] = await repository.orderRepository.findAndCount({
          take: rowsPerPage,
          skip: rowsPerPage * (pageParam - 1),
          where: {
            orderNum: { operator: "ILike", value: queryText },
            ...query,
          },
        });

        return {
          orders,
          total,
          pageParam,
        };
      },
      {
        getNextPageParam: (lastPage) => {
          if (lastPage) {
            const nextPage = (lastPage?.pageParam || 0) + 1;
            const totalPages = Math.ceil((lastPage?.total || 0) / rowsPerPage);
            return nextPage <= totalPages ? nextPage : undefined;
          } else {
            return null;
          }
        },
      }
    );

  const ordersList = data?.pages?.flatMap((page) => page?.orders || []) || [];

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
                setActiveTab(tab);
              }}
            />

            {activeTab == 0 ? (
              <Payments
                data={selectedOrder}
                origin="transactions"
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
