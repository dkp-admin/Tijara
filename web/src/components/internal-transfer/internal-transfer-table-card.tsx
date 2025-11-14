import { Box, Card, IconButton, SvgIcon, Typography } from "@mui/material";
import ChevronRightIcon from "@untitled-ui/icons-react/build/esm/ChevronRight";
import { ChangeEvent, FC, Key, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { InternalTransferRowLoading } from "src/components/internal-transfer/internal-transfer-row-loading";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { InternalTransferTable } from "src/components/internal-transfer/internal-transfer-list-table";
import { InternalTransferHeader } from "src/components/internal-transfer/internal-transfer-list-header";
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
import { useCurrency } from "src/utils/useCurrency";

interface InternalTransferTableCardProps {
  origin?: string;
  companyRef?: string;
  companyName?: string;
}

export const InternalTransferTableCard: FC<InternalTransferTableCardProps> = (
  props
) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { companyRef, companyName, origin } = props;
  const { changeTab, getTab } = useActiveTabs();
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [filter, setFilter] = useState<any>([]);
  const [id, setId] = useState();

  const { find, updateEntity, loading, entities } =
    useEntity("internal-transfer");

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleTabChange = (value: string): void => {
    changeTab(value, Screens.internalTransfer);
    setPage(0);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  usePageView();

  const currency = useCurrency();

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
      label: t("Pending"),
      value: "pending",
    },

    {
      label: t("Open"),
      value: "open",
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
      key: "shipFrom",
      label: t("Ship From Location"),
    },
    {
      key: "shipTo",
      label: t("Ship To Location"),
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
      const statusColorsMap: any = {
        completed: "success",
        open: "info",
        cancelled: "warning",
        pending: "error",
        partiallyReceived: "warning",
      };

      const status = d.deliveryStatus;

      const statusColor = statusColorsMap[status];

      const moreOptions = [
        {
          name: t("View"),
          path: "/inventory-management/internal-transfer/create",
          query: {
            id: d?._id,
            companyRef: companyRef,
            companyName: companyName,
            origin: origin,
          },
        },
        // {
        //   name: t("Duplicate"),
        //   path: "/inventory-management/internal-transfer/create",
        //   query: {
        //     newid: d?._id,
        //     companyRef: companyRef,
        //     companyName: companyName,
        //     origin: origin,
        //   },
        // },
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
              {format(new Date(d?.createdAt), "MMM")}
            </Typography>
            <Typography align="center" variant="h6">
              {format(new Date(d?.createdAt), "dd")}
            </Typography>
            <Typography variant="caption" textAlign="center">
              {format(new Date(d?.createdAt), "h:mm a")}
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
                    tijarahPaths?.inventoryManagement?.internalTransfer?.create,
                  query: {
                    id: d?._id,
                    companyRef: companyRef,
                    companyName: companyName,
                    origin: origin,
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
              {d?.orderType || "NA"}
            </Typography>
          </>
        ),
        shipFrom: (
          <Typography variant="body2">
            {d?.shipFrom?.name?.en || "-"}
          </Typography>
        ),
        shipTo: (
          <Typography variant="body2">{d?.shipTo?.name?.en || "-"}</Typography>
        ),
        quantity: (
          <Typography variant="body2">{d?.items.length || 0}</Typography>
        ),
        subtotal: (
          <Typography variant="body2">{`${currency} ${
            toFixedNumber(d?.billing?.total) || 0
          }`}</Typography>
        ),
        deliveryStatus: (
          <Typography variant="body2">
            <SeverityPill color={statusColor}> {status}</SeverityPill>
          </Typography>
        ),
        action: (
          <Typography sx={{ textAlign: "center" }}>
            <ActionDropdown dropdownData={moreOptions} item={d} />
          </Typography>
        ),
      });
    });

    return arr;
  }, [entities?.results, changeTab]);

  useEffect(() => {
    changeTab("all", Screens.internalTransfer);
  }, []);

  useEffect(() => {
    find({
      page: page,
      sort: sort,
      activeTab:
        getTab(Screens.internalTransfer) == "all"
          ? "all"
          : getTab(Screens.internalTransfer),
      shipFromRef: filter?.location?.[0] || [],
      shipToRef: filter?.locationto?.[0] || [],
      vendorRef: filter?.vendor || [],
      limit: rowsPerPage,
      _q: debouncedQuery,
      companyRef: companyRef,
      locationRef: user?.company?._id || "",
      orderType: filter?.transferType?.[0],
      paymentStatus: filter?.paymentStatus,
    });
  }, [
    page,
    sort,
    debouncedQuery,
    getTab(Screens.internalTransfer),
    companyRef,
    rowsPerPage,
    filter,
  ]);

  return (
    <>
      <Card>
        <InternalTransferHeader
          currentTab={getTab(Screens.internalTransfer)}
          onQueryChange={handleQueryChange}
          onFiltersChange={handleFilterChange}
          companyRef={companyRef}
          showtransferTypeFilter
          showLocationFilter
          showFromLocationFilter
          showStatusFilter={false}
          searchPlaceholder={t("Search with orderID ")}
          onSortChange={handleSortChange}
          onTabChange={handleTabChange}
          sort={sort}
          sortOptions={sortOptions}
          tabs={tabs}
        />

        <InternalTransferTable
          isLoading={loading}
          loaderComponent={InternalTransferRowLoading}
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
                    {t("No Transfer!")}
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
