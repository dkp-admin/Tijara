import { Box, Divider } from "@mui/material";
import {
  ChangeEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useDialog } from "src/hooks/use-dialog";
import { useMounted } from "src/hooks/use-mounted";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import { OrderDrawer } from "src/sections/dashboard/order/order-drawer";
import { OrderListContainer } from "src/sections/dashboard/order/order-list-container";
import { OrderListTable } from "src/sections/dashboard/order/order-list-table";
import type { Page as PageType } from "src/types/page";

interface Filters {
  query?: string;
  method?: string[];
  type?: string[];
  status?: string[];
  discount?: string[];
  startDate?: Date;
  endDate?: Date;
}

type SortDir = "asc" | "desc";

interface OrdersSearchState {
  filters: Filters;
  page: number;
  rowsPerPage: number;
  sortBy?: string;
  sortDir?: SortDir;
}

const useOrdersSearch = () => {
  const [state, setState] = useState<OrdersSearchState>({
    filters: {
      query: undefined,
      method: [],
      type: [],
      status: [],
      discount: [],
      startDate: undefined,
      endDate: undefined,
    },
    page: 0,
    rowsPerPage: 10,
    sortBy: "createdAt",
    sortDir: "desc",
  });

  const handleFiltersChange = useCallback((filters: Filters): void => {
    setState((prevState) => ({
      ...prevState,
      filters,
    }));
  }, []);

  const handleSortChange = useCallback((sortDir: SortDir): void => {
    setState((prevState) => ({
      ...prevState,
      sortDir,
    }));
  }, []);

  const handlePageChange = useCallback(
    (event: MouseEvent<HTMLButtonElement> | null, page: number): void => {
      setState((prevState) => ({
        ...prevState,
        page,
      }));
    },
    []
  );

  const handleRowsPerPageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      setState((prevState) => ({
        ...prevState,
        rowsPerPage: parseInt(event.target.value, 10),
      }));
    },
    []
  );

  return {
    handleFiltersChange,
    handleSortChange,
    handlePageChange,
    handleRowsPerPageChange,
    state,
  };
};

interface OrdersStoreState {
  orders: any[];
  ordersCount: number;
}

const useOrdersStore = (searchState: OrdersSearchState) => {
  const isMounted = useMounted();
  const [state, setState] = useState<OrdersStoreState>({
    orders: [],
    ordersCount: 5,
  });

  const handleOrdersGet = useCallback(async () => {
    try {
      const orderData = [
        {
          id: "1",
          orderID: "#47567478",
          itemName: "Item1, Item2, Item 3, Item1, Item2, Item 3",
          amount: "1000.00",
          time: "10:00AM",
        },
        {
          id: "2",
          orderID: "#8454875",
          itemName: "Item1, Item2, Item 3, Item1, Item2, Item 3",
          amount: "75.00",
          time: "10:00AM",
        },
        {
          id: "3",
          orderID: "#7634458",
          itemName: "Item1, Item2, Item 3, Item1, Item2, Item 3",
          amount: "75.00",
          time: "10:00AM",
        },
        {
          id: "4",
          orderID: "Order ID#",
          itemName: "Item1, Item2, Item 3, Item1, Item2, Item 3",
          amount: "75.00",
          time: "10:00AM",
        },
        {
          id: "5",
          orderID: "Order ID#",
          itemName: "Item1, Item2, Item 3, Item1, Item2, Item 3",
          amount: "75.00",
          time: "10:00AM",
        },
      ];

      if (isMounted()) {
        setState({
          orders: orderData,
          ordersCount: orderData.length,
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [searchState, isMounted]);

  useEffect(
    () => {
      handleOrdersGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchState]
  );

  return {
    ...state,
  };
};

const useCurrentOrder = (orders: any[], orderId?: string): any | undefined => {
  return useMemo((): any | undefined => {
    if (!orderId) {
      return undefined;
    }

    return orders.find((order) => order.id === orderId);
  }, [orders, orderId]);
};

const Page: PageType = () => {
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const ordersSearch = useOrdersSearch();
  const ordersStore = useOrdersStore(ordersSearch.state);
  const dialog = useDialog<string>();
  const currentOrder = useCurrentOrder(ordersStore.orders, dialog.data);

  usePageView();

  const handleOrderOpen = useCallback(
    (orderId: string): void => {
      // Close drawer if is the same order

      if (dialog.open && dialog.data === orderId) {
        dialog.handleClose();
        return;
      }

      dialog.handleOpen(orderId);
    },
    [dialog]
  );
  console.log("fil", ordersSearch.state.filters);

  return (
    <>
      <Box
        ref={rootRef}
        sx={{
          bottom: 20,
          display: "flex",
          left: 0,
          position: "relative",
          overflow: "hidden",
          right: 0,
          top: 0,
        }}
      >
        <OrderListContainer open={dialog.open}>
          {/* <OrderListSearch
              onFiltersChange={ordersSearch.handleFiltersChange}
              onSortChange={ordersSearch.handleSortChange}
              sortBy={ordersSearch.state.sortBy}
              sortDir={ordersSearch.state.sortDir}
            /> */}

          <Divider />

          <OrderListTable
            count={ordersStore.ordersCount}
            items={ordersStore.orders}
            onPageChange={ordersSearch.handlePageChange}
            onRowsPerPageChange={ordersSearch.handleRowsPerPageChange}
            onSelect={handleOrderOpen}
            page={ordersSearch.state.page}
            rowsPerPage={ordersSearch.state.rowsPerPage}
          />
        </OrderListContainer>

        <OrderDrawer
          container={rootRef.current}
          onClose={dialog.handleClose}
          open={dialog.open}
          order={currentOrder}
        />
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
