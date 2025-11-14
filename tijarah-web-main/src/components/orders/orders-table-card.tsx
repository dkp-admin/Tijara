import { Box, Card, Divider, Stack, Typography } from "@mui/material";
import {
  ChangeEvent,
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import LocationAutoCompleteDropdown from "src/components/input/location-singleSelect";
import { SalesReportRowLoading } from "src/components/reports/row-loading/sales-row-loading";
import { SalesReportTopCard } from "src/components/reports/sales-topcard";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { useDialog } from "src/hooks/use-dialog";
import { useEntity } from "src/hooks/use-entity";
import { useFindOne } from "src/hooks/use-find-one";
import { usePageView } from "src/hooks/use-page-view";
import { OrderDrawer } from "src/sections/dashboard/order/order-drawer";
import { OrderListContainer } from "src/sections/dashboard/order/order-list-container";
import { OrderListSearch } from "src/sections/dashboard/order/order-list-search";
import { OrderListTable } from "src/sections/dashboard/order/order-list-table";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";

interface OrdersTableCardProps {
  companyRef?: string;
}

export const OrdersTableCard: FC<OrdersTableCardProps> = (props) => {
  const { t } = useTranslation();
  const { companyRef } = props;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const dialog = useDialog<any>();

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [locationRef, setLocationRef] = useState("all");
  const [filter, setFilter] = useState<any>([]);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);

  const { find, entities, loading } = useEntity("order");

  const { findOne: findStats, entity: orderStats } =
    useFindOne("report/order/stats");

  const handlePageChange = (event: any, newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleSortChange = (value: any) => {
    setSort(value);
  };

  const handleFilterChange = (changedFilter: any) => {
    setPage(0);
    setFilter(changedFilter);
  };

  usePageView();

  const handleOrderOpen = useCallback(
    (order: any): void => {
      // Close drawer if is order details open

      if (dialog.open && dialog?.data?._id === order?._id) {
        dialog.handleClose();
        setCurrentOrder(null);
        return;
      }

      setCurrentOrder(order);

      dialog.handleOpen(order);
    },
    [dialog]
  );

  const getQuery = () => {
    const query: any = {
      page: debouncedQuery?.length > 0 ? 0 : page,
      sort: sort,
      activeTab: "all",
      limit: rowsPerPage,
      _q: filter?.query || "",
      companyRef: companyRef,
    };

    if (locationRef !== "all") {
      query["locationRef"] = locationRef;
    }

    if (filter?.method?.length > 0) {
      query["paymentMethod"] = filter.method[0];
    }

    if (filter?.type?.length > 0) {
      query["paymentType"] = filter.type[0];
    }

    if (filter?.discount?.length > 0) {
      query["discount"] = filter.discount[0];
    }

    if (filter?.startDate && filter?.endDate) {
      const fromDate = new Date(filter?.startDate);
      fromDate.setHours(0, 0, 0, 0);

      const toDate = new Date(filter?.endDate);
      toDate.setHours(23, 59, 0, 0);

      query["dateRange"] = {
        from: fromDate,
        to: toDate,
      };
    } else {
      const prevDate = new Date();
      prevDate.setMonth(prevDate.getMonth() - 1);

      const fromDate = new Date(prevDate);
      fromDate.setHours(0, 0, 0, 0);

      const toDate = new Date();
      toDate.setHours(23, 59, 0, 0);

      query["dateRange"] = {
        from: fromDate,
        to: toDate,
      };
    }

    return query;
  };

  useEffect(() => {
    find({ ...getQuery() });
  }, [sort, rowsPerPage, page, companyRef, locationRef, filter]);

  useEffect(() => {
    findStats({ ...getQuery() });
  }, [sort, rowsPerPage, page, companyRef, locationRef]);

  return (
    <>
      {/* <Card
        ref={rootRef}
        sx={{
          display: "flex",
          flex: "1 1 auto",
          overflow: "hidden",
          position: "relative",
        }}> */}
      <Card
        ref={rootRef}
        sx={{
          bottom: 20,
          display: "flex",
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      >
        <OrderListContainer open={dialog.open}>
          <Box sx={{ pt: 3, mx: 3, mb: 5 }}>
            <Box sx={{ mb: 3, ml: 0.5, width: "290px", display: "flex" }}>
              <LocationAutoCompleteDropdown
                required={false}
                companyRef={companyRef}
                onChange={(id) => {
                  if (id) {
                    setLocationRef(id || "");
                  }
                }}
                selectedId={locationRef as string}
                label={t("Location")}
                id="location"
              />
            </Box>

            <SalesReportTopCard
              drawerOpen={dialog.open}
              orderStats={orderStats}
            />
          </Box>

          <OrderListSearch
            isLoading={loading}
            count={entities?.total || 0}
            onSortChange={handleSortChange}
            onFiltersChange={handleFilterChange}
            sortBy={sort}
            queryObj={getQuery()}
          />

          <Divider />

          <OrderListTable
            isLoading={loading}
            loaderComponent={SalesReportRowLoading}
            items={entities?.results || []}
            count={entities?.total || 0}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onSelect={handleOrderOpen}
            page={page}
            rowsPerPage={rowsPerPage}
            noDataPlaceholder={
              <Box sx={{ mt: 6, mb: 4 }}>
                <NoDataAnimation
                  text={
                    <Typography variant="h6" textAlign="center" sx={{ mt: 2 }}>
                      {t("No Orders!")}
                    </Typography>
                  }
                />
              </Box>
            }
          />
        </OrderListContainer>

        <OrderDrawer
          container={rootRef.current}
          onClose={dialog.handleClose}
          open={dialog.open}
          order={currentOrder}
          companyRef={companyRef}
        />
      </Card>
      {/* </Card> */}
    </>
  );
};
