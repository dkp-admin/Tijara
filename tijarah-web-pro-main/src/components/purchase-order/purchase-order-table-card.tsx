import { Box, Card, IconButton, SvgIcon, Typography } from "@mui/material";
import ChevronRightIcon from "@untitled-ui/icons-react/build/esm/ChevronRight";
import { ChangeEvent, FC, Key, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { PurchaseOrderRowLoading } from "src/components/purchase-order/purchase-order-row-loading";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { PoGrnTable } from "src/components/purchase-order/pogrn-list-table";
import { PoGrnHeader } from "src/components/purchase-order/pogrn-list-header";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";
import { SeverityPill } from "../severity-pill";
import useActiveTabs from "src/utils/use-active-tabs";
import { Screens } from "src/utils/screens-names";
import router from "next/router";
import { tijarahPaths } from "src/paths";
import { ActionDropdown } from "src/components/po-action-dropdown";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useQueryClient } from "react-query";
import { useCurrency } from "src/utils/useCurrency";

interface CaustomerTableCardProps {
  origin?: string;
  companyRef?: string;
  companyName?: string;
  industry?: string;
  isSaptco?: boolean;
}

export const PurchaseOrderTableCard: FC<CaustomerTableCardProps> = (props) => {
  const { t } = useTranslation();
  const currency = useCurrency();
  const queryClient = useQueryClient();
  const { companyRef, companyName, industry, origin, isSaptco } = props;
  const { changeTab, getTab } = useActiveTabs();
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [filter, setFilter] = useState<any>([]);

  const { find, loading, entities, refetch } = useEntity("purchase-order");

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleTabChange = (value: string): void => {
    changeTab(value, Screens.poGrn);
    setPage(0);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  usePageView();

  const handleQueryChange = (value: string): void => {
    if (value != undefined) {
      setQueryText(value);
      if (page > 0) {
        setPage(0);
      }
    }
  };

  const handleSortChange = (value: any) => {
    setSort(value);
  };

  const handleFilterChange = (changedFilter: any) => {
    setPage(0);
    setFilter(changedFilter);
  };

  const tabs = [
    {
      label: t("All"),
      value: "all",
    },

    {
      label: t("Open"),
      value: "open",
    },
    {
      label: t("Overdue"),
      value: "overdue",
    },
    {
      label: t("Partially Received"),
      value: "partiallyReceived",
    },

    {
      label: t("Completed"),
      value: "completed",
    },
    {
      label: t("Cancelled"),
      value: "cancelled",
    },
    {
      label: t("Return"),
      value: "return",
    },
  ];

  const tableHeaders = [
    {
      key: "orderDate",
      label: t("Order Date"),
    },
    {
      key: "orderId",
      label: t("Order ID"),
    },
    {
      key: "orderType",
      label: t("Order Type"),
    },
    {
      key: "shipTo",
      label: t("Ship To Location"),
    },
    {
      key: "vendor",
      label: t("Vendor"),
    },
    {
      key: "quantity",
      label: t("Total items"),
    },
    {
      key: "subtotal",
      label: t("Amount"),
    },
    {
      key: "vendorPayment",
      label: t("Vendor Payment"),
    },
    {
      key: "deliveryStatus",
      label: t("Delivery Status"),
    },
    {
      key: "action",
      label: t(""),
    },
  ];

  const transformedData = useMemo(() => {
    let arr: any[] = [];
    entities?.results?.map((d) => {
      const paymentstatusText =
        d.billing.paymentStatus === "partiallyPaid"
          ? "partially Paid"
          : d.billing.paymentStatus;

      const paymentstatusColor =
        d.billing.paymentStatus === "paid" ? "success" : "error";

      const statusColorsMap: any = {
        completed: "success",
        open: "info",
        cancelled: "warning",
        overdue: "error",
        partiallyReceived: "warning",
      };

      const status = d.status;

      const statusColor = statusColorsMap[status];

      const moreOptionsWithDuplicate = [
        {
          name: t("View"),
          path: "/inventory-management/purchase-order/create-po",
          query: {
            id: d?._id,
            companyRef: companyRef,
            companyName: companyName,
            origin: origin,
            industry: industry,
            isReturn: d?.type === "return" ? true : false,
          },
        },
        {
          name: t("Duplicate"),
          path: "/inventory-management/purchase-order/create-po",
          query: {
            newid: d?._id,
            companyRef: companyRef,
            companyName: companyName,
            origin: origin,
            industry: industry,
            isReturn: false,
          },
        },
      ];

      const moreOptions = [
        {
          name: t("View"),
          path: "/inventory-management/purchase-order/create-po",
          query: {
            id: d?._id,
            companyRef: companyRef,
            companyName: companyName,
            origin: origin,
            industry: industry,
            isReturn: d?.type === "return" ? true : false,
          },
        },
      ];

      arr.push({
        key: d._id,
        _id: d?._id,

        orderDate: (
          <Box
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "neutral.800" : "neutral.200",
              borderRadius: 2,
              maxWidth: "fit-content",
              p: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <Typography align="center" variant="subtitle2">
              {format(new Date(d?.orderDate), "MMM")}
            </Typography>
            <Typography align="center" variant="h6">
              {format(new Date(d?.orderDate), "dd")}
            </Typography>
            <Typography variant="caption" textAlign="center">
              {format(new Date(d?.orderDate), "h:mm a")}
            </Typography>
          </Box>
        ),
        orderId: (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <IconButton
              onClick={() => {
                router.push({
                  pathname:
                    tijarahPaths?.inventoryManagement?.purchaseOrder?.createpo,
                  query: {
                    id: d?._id,
                    companyRef: companyRef,
                    companyName: companyName,
                    origin: origin,
                    industry: industry,
                    isReturn: d?.type === "return" ? true : false,
                    isSaptco: isSaptco,
                  },
                });
              }}
            >
              <Typography color={"primary"}>{d?.orderNum}</Typography>
            </IconButton>
          </Box>
        ),
        orderType: (
          <>
            <Typography variant="body2" style={{ textTransform: "uppercase" }}>
              {d?.type || "NA"}
            </Typography>
          </>
        ),
        shipTo: (
          <Typography variant="body2">{d?.shipTo?.name?.en || "-"}</Typography>
        ),
        vendor: (
          <Typography variant="body2">{d?.vendor?.name || "-"}</Typography>
        ),
        quantity: (
          <Typography variant="body2">{d?.items?.length || 0}</Typography>
        ),
        subtotal: (
          <Typography variant="body2">{`${currency} ${
            toFixedNumber(d?.billing.total) || 0
          }`}</Typography>
        ),
        vendorPayment: (
          <Typography
            variant="body2"
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <SeverityPill color={paymentstatusColor}>
              {paymentstatusText}
            </SeverityPill>
          </Typography>
        ),
        deliveryStatus: (
          <Typography variant="body2">
            <SeverityPill color={statusColor}> {status}</SeverityPill>
          </Typography>
        ),
        action: (
          <Typography sx={{ textAlign: "center" }}>
            <ActionDropdown
              dropdownData={
                d?.type === "return" ? moreOptions : moreOptionsWithDuplicate
              }
              item={d}
            />
          </Typography>
        ),
      });
    });

    return arr;
  }, [entities?.results, changeTab]);

  useEffect(() => {
    changeTab("all", Screens.poGrn);
  }, []);

  useEffect(() => {
    find({
      page: page,
      sort: sort,
      activeTab: getTab(Screens.poGrn) == "all" ? "all" : getTab(Screens.poGrn),
      locationRef: filter?.location || [],
      vendorRef: filter?.vendor || [],
      limit: rowsPerPage,
      _q: debouncedQuery,
      companyRef: companyRef,
      type: filter?.orderType,
      paymentStatus: filter?.paymentStatus,
    });
  }, [
    page,
    sort,
    debouncedQuery,
    getTab(Screens.poGrn),
    companyRef,
    rowsPerPage,
    filter,
  ]);

  useEffect(() => {
    queryClient.invalidateQueries("find-product");
  }, []);

  useEffect(() => {
    const shouldReload = localStorage.getItem("shouldReload") === "true";

    if (shouldReload) {
      localStorage.removeItem("shouldReload");
      refetch();
    }
  }, []);

  return (
    <>
      <Card>
        <PoGrnHeader
          currentTab={getTab(Screens.poGrn)}
          onQueryChange={handleQueryChange}
          onFiltersChange={handleFilterChange}
          companyRef={companyRef}
          showLocationFilter
          showVendorFilter
          showPaymentStatusFilter
          showPoOrderTypeFilter
          showStatusFilter={false}
          searchPlaceholder={t("Search with orderID or Vendor")}
          onSortChange={handleSortChange}
          onTabChange={handleTabChange}
          sort={sort}
          sortOptions={sortOptions}
          tabs={tabs}
        />

        <PoGrnTable
          isLoading={loading}
          loaderComponent={PurchaseOrderRowLoading}
          items={transformedData}
          headers={tableHeaders}
          total={entities?.total || 0}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPage={rowsPerPage}
          page={page}
          isCancelAllClicked={isCancelAllClicked}
          noDataPlaceholder={
            <Box sx={{ mt: 6, mb: 4 }}>
              <NoDataAnimation
                text={
                  <Typography variant="h6" textAlign="center" sx={{ mt: 2 }}>
                    {t("No Purchase Order!")}
                  </Typography>
                }
              />
            </Box>
          }
        />
      </Card>
    </>
  );
};
