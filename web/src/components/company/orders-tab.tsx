import { Box, Card, Divider, Typography } from "@mui/material";
import {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { CompanyContext } from "src/contexts/company-context";
import { useAuth } from "src/hooks/use-auth";
import { useDialog } from "src/hooks/use-dialog";
import { useEntity } from "src/hooks/use-entity";
import { useFindOne } from "src/hooks/use-find-one";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import { MoleculeType } from "src/permissionManager";
import { OrderDrawer } from "src/sections/dashboard/order/order-drawer";
import { OrderListContainer } from "src/sections/dashboard/order/order-list-container";
import { OrderListSearch } from "src/sections/dashboard/order/order-list-search";
import { OrderListTable } from "src/sections/dashboard/order/order-list-table";
import type { Page as PageType } from "src/types/page";
import { Sort } from "src/types/sortoption";
import { USER_TYPES, sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";
import LocationAutoCompleteDropdown from "../input/location-singleSelect";
import withPermission from "../permissionManager/restrict-page";
import { SalesReportRowLoading } from "../reports/row-loading/sales-row-loading";
import { SalesReportTopCard } from "../reports/sales-topcard";
import NoDataAnimation from "../widgets/animations/NoDataAnimation";
import { AuthContext } from "src/contexts/auth/jwt-context";

const OrdersTab: PageType = (props) => {
  const { t } = useTranslation();
  const companyContext = useContext<any>(CompanyContext);
  const { user } = useAuth();

  usePageView();

  const rootRef = useRef<HTMLDivElement | null>(null);
  const dialog = useDialog<any>();

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);

  const [locationRef, setLocationRef] = useState("all");
  const { userType } = useUserType();
  const [filter, setFilter] = useState<any>([]);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);

  const { find, entities, loading } = useEntity("order");

  const authContext = useContext(AuthContext) as any;

  const { findOne: findStats, entity: orderStats } =
    useFindOne("report/sales/stats"); // USE QUEST FOR ORDER STATS

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
      setCurrentOrder(order);

      dialog.handleOpen(order);
    },
    [dialog]
  );

  const getQuery = (type = "") => {
    const query: any = {
      page: debouncedQuery?.length > 0 ? 0 : page,
      sort: sort,
      activeTab: "all",
      limit: rowsPerPage,
      _q: filter?.query || "",
    };

    if (userType == USER_TYPES.SUPERADMIN) {
      if (companyContext?._id) {
        query["companyRef"] = companyContext._id;
      }
    } else {
      query["companyRef"] = user.company._id;
    }

    if (locationRef !== "all") {
      query["locationRef"] = locationRef;
    }

    if (filter?.method?.length > 0) {
      query["paymentMethod"] = filter.method[0];
    }

    if (filter?.zatcaStatus?.length > 0) {
      query["zatcaStatus"] = filter.zatcaStatus[0];
    }

    if (filter?.type?.length > 0) {
      query["paymentType"] = filter.type[0];
    }

    if (filter?.discount?.length > 0) {
      query["discount"] = filter.discount[0];
    }

    if (filter?.orderType?.length > 0) {
      query["orderType"] = filter.orderType[0];
    }

    if (filter?.orderStatus?.length > 0) {
      query["qrOrdering"] = true;
      query["orderStatus"] = filter.orderStatus[0];
    }

    if (filter?.driver?.length > 0) {
      query["driverRef"] = filter?.driver[0];
    }

    if (filter?.device?.length > 0) {
      query["deviceRef"] = filter?.device[0];
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

      const fromDate = new Date(new Date());
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
    if (companyContext._id) find({ ...getQuery() });
  }, [sort, rowsPerPage, page, locationRef, filter, companyContext]);

  useEffect(() => {
    if (companyContext._id) findStats({ ...getQuery() });
  }, [locationRef, companyContext]);

  return (
    <>
      <Box component="main" ref={rootRef}>
        <Card
          ref={rootRef}
          sx={{
            display: "flex",
            my: 4,
          }}
        >
          <OrderListContainer open={dialog.open}>
            <Box sx={{ pt: 3, mx: 3, mb: 5 }}>
              <Box sx={{ mb: 3, ml: 0.5, width: "290px", display: "flex" }}>
                <LocationAutoCompleteDropdown
                  required={false}
                  companyRef={companyContext?._id}
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
              companyRef={companyContext?._id}
              locationRef={locationRef}
              showDriverFilter={true}
              showDeviceFilter
              showZatcaFilter={companyContext?.configuration?.enableZatca}
              industry={companyContext?.industry}
              isLoading={loading}
              count={entities?.total || 0}
              onSortChange={handleSortChange}
              onFiltersChange={handleFilterChange}
              sortBy={sort}
              queryObj={() => getQuery()}
              showOrderZatcaStatus={
                authContext.user?.company?.configuration?.enableZatca ||
                companyContext?.configuration?.enableZatca
              }
            />

            <Divider />

            <OrderListTable
              currentOrderId={currentOrder?._id || ""}
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
                      <Typography
                        variant="h6"
                        textAlign="center"
                        sx={{ mt: 2 }}
                      >
                        {t("No Orders!")}
                      </Typography>
                    }
                  />
                </Box>
              }
            />
          </OrderListContainer>

          <OrderDrawer
            companyRef={companyContext?._id}
            companyName={companyContext?.name?.en}
            container={rootRef.current}
            onClose={() => {
              dialog.handleClose();
              setCurrentOrder(null);
            }}
            open={dialog.open}
            order={currentOrder}
            companyContext={companyContext}
          />
        </Card>
      </Box>
    </>
  );
};

export default withPermission(OrdersTab, MoleculeType["order:read"]);
