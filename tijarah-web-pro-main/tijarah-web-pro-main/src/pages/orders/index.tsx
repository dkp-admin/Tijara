import { Box, Divider, Stack, Typography } from "@mui/material";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import LocationAutoCompleteDropdown from "src/components/input/location-singleSelect";
import { SalesReportRowLoading } from "src/components/reports/row-loading/sales-row-loading";
import { SalesReportTopCard } from "src/components/reports/sales-topcard";
import { Seo } from "src/components/seo";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useDialog } from "src/hooks/use-dialog";
import { useEntity } from "src/hooks/use-entity";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { useFindOne } from "src/hooks/use-find-one";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import UpgradePackage from "src/pages/upgrade-package";
import { MoleculeType } from "src/permissionManager";
import { OrderDrawer } from "src/sections/dashboard/order/order-drawer";
import { OrderListContainer } from "src/sections/dashboard/order/order-list-container";
import { OrderListSearch } from "src/sections/dashboard/order/order-list-search";
import { OrderListTable } from "src/sections/dashboard/order/order-list-table";
import type { Page as PageType } from "src/types/page";
import { Sort } from "src/types/sortoption";
import { USER_TYPES, sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";

const Orders: PageType = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { userType } = useUserType();
  const { canAccessModule } = useFeatureModuleManager();
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
  const canAccess = usePermissionManager();

  const userIsAdmin =
    user.userType === USER_TYPES.ADMIN ||
    user.userType === USER_TYPES.SUPERADMIN;

  const { find, entities, loading } = useEntity("order");

  const {
    findOne: findStats,
    entity: orderStats,
    loading: statsLoading,
  } = useFindOne("report/sales/stats"); // USE QUEST FOR STATS

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

      // if (dialog.open) {
      //   dialog.handleClose();
      //   setCurrentOrder(null);
      //   return;
      // }

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

    query["companyRef"] = user?.company?._id;

    if (locationRef !== "all") {
      query["locationRef"] = locationRef;
    }

    if (filter?.method?.length > 0) {
      query["paymentMethod"] = filter.method[0];
    }

    if (filter?.type?.length > 0) {
      query["paymentType"] = filter.type[0];
    }

    if (filter?.zatcaStatus?.length > 0) {
      query["zatcaStatus"] = filter.zatcaStatus[0];
    }

    if (filter?.discount?.length > 0) {
      query["discount"] = filter.discount[0];
    }

    if (filter?.orderType?.length > 0) {
      query["orderType"] = filter.orderType[0];
    }

    if (filter?.source?.length > 0) {
      if (filter.source[0] === "online") {
        query["onlineOrdering"] = true;
      } else if (filter.source[0] === "qr") {
        query["qrOrdering"] = true;
      }
    }

    if (filter?.orderStatus?.length > 0) {
      query["orderStatus"] = filter.orderStatus[0];
    }

    if (filter?.driver?.length > 0) {
      query["driverRef"] = filter?.driver[0];
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
    if (locationRef) {
      setPage(0);
    }
  }, [locationRef]);

  useEffect(() => {
    find({ ...getQuery() });
  }, [sort, rowsPerPage, page, locationRef, filter]);

  useEffect(() => {
    findStats({ ...getQuery() });
  }, [locationRef]);

  if (!canAccessModule("orders")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["order:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Orders")}`} />
      <Box
        component="main"
        ref={rootRef}
        sx={{
          display: "flex",
          flex: "1 1 auto",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
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
            <Box sx={{ p: 3 }}>
              <Stack
                alignItems="flex-start"
                direction="row"
                justifyContent="space-between"
                spacing={4}
              >
                <Typography variant="h4">{t("Orders")}</Typography>
              </Stack>
            </Box>

            <Box sx={{ mx: 3, mb: 3 }}>
              {userIsAdmin ? (
                <Box sx={{ mb: 3, ml: 0.5, width: "290px", display: "flex" }}>
                  <LocationAutoCompleteDropdown
                    showAllLocation
                    required={false}
                    companyRef={user.company?._id}
                    onChange={(id, name, data) => {
                      setLocationRef(id || "");
                    }}
                    selectedId={locationRef as string}
                    label={t("Location")}
                    id="location"
                  />
                </Box>
              ) : (
                <Box sx={{ mb: 3, ml: 0.5, width: "290px", display: "flex" }}>
                  <LocationAutoCompleteDropdown
                    disabled={false}
                    required={false}
                    companyRef={user.company?._id}
                    onChange={(id, name, data) => {
                      setLocationRef(id || "");
                    }}
                    selectedId={locationRef as string}
                    label={t("Location")}
                    id="location"
                  />
                </Box>
              )}

              <SalesReportTopCard
                drawerOpen={dialog.open}
                orderStats={orderStats}
                loading={statsLoading}
              />
            </Box>

            <OrderListSearch
              showDriverFilter={true}
              companyRef={user?.company?._id as string}
              locationRef={locationRef as string}
              showDeviceFilter={true}
              showZatcaFilter={user.company.configuration.enableZatca}
              industry={user.company.industry}
              isLoading={loading}
              count={entities?.total || 0}
              onSortChange={handleSortChange}
              onFiltersChange={handleFilterChange}
              sortBy={sort}
              queryObj={() => getQuery()}
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
            companyName={user.company.name.en}
            companyRef={user.company._id}
            container={rootRef.current}
            onClose={() => {
              dialog.handleClose();
              setCurrentOrder(null);
            }}
            open={dialog.open}
            order={currentOrder}
          />
        </Box>
      </Box>
    </>
  );
};

Orders.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Orders;
