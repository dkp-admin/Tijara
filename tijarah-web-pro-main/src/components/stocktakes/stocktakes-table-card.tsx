import { Box, Card, IconButton, SvgIcon, Typography } from "@mui/material";
import ChevronRightIcon from "@untitled-ui/icons-react/build/esm/ChevronRight";
import { ChangeEvent, FC, Key, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { StocktakesRowLoading } from "src/components/stocktakes/stocktakes-row-loading";
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
import { StocktakesHeader } from "./stocktakes-list-header";
import { StocktakesTable } from "./stocktakes-table";

interface StocktakesTableCardProps {
  origin?: string;
  companyRef?: string;
  companyName?: string;
}

export const StocktakesTableCard: FC<StocktakesTableCardProps> = (props) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
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

  const { find, updateEntity, loading, entities } = useEntity("stocktakes");

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
      label: t("Close"),
      value: "close",
    },
    {
      label: t("Pending Approval"),
      value: "pendingApproval",
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
      key: "createdAt",
      label: t("Created At"),
    },
    {
      key: "orderId",
      label: t("Stocktakes ID"),
    },
    {
      key: "location",
      label: t("Location"),
    },
    {
      key: "createdBy",
      label: t("CreatedBy"),
    },
    {
      key: "approvedBy",
      label: t("Approved By"),
    },
    {
      key: "lastUpdated",
      label: t("Last Updated"),
    },
    {
      key: "reason",
      label: t("Reason"),
    },
    {
      key: "status",
      label: t("Status"),
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
        overdue: "error",
        pendingApproval: "warning",
      };

      const status = d.status;

      const statusColor = statusColorsMap[status];

      const moreOptions = [
        {
          name: t("View"),
          path: "/inventory-management/stocktakes/create",
          query: {
            id: d?._id,
            companyRef: companyRef,
            companyName: companyName,
            origin: origin,
          },
        },
        {
          name: t("Duplicate"),
          path: "/inventory-management/stocktakes/create",
          query: {
            newid: d?._id,
            companyRef: companyRef,
            companyName: companyName,
            origin: origin,
          },
        },
      ];

      arr.push({
        key: d._id,
        _id: d?._id,

        createdAt: (
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
              {format(new Date(d?.createdAt), "dd/MM/yyyy")}
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
                    tijarahPaths?.inventoryManagement?.stocktakes?.create,
                  query: {
                    id: d?._id,
                    companyRef: companyRef,
                    companyName: companyName,
                    origin: origin,
                  },
                });
              }}
            >
              <Typography color={"primary"}>{d?.orderNum || "-"}</Typography>
            </IconButton>
          </Box>
        ),

        location: (
          <Typography variant="body2">{d?.location?.name || "-"}</Typography>
        ),
        createdBy: (
          <Typography variant="body2">{d?.staff?.name || "-"}</Typography>
        ),
        approvedBy: (
          <Typography variant="body2">{d?.approvedBy?.name || "-"}</Typography>
        ),
        lastUpdated: (
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
              {format(new Date(d?.updatedAt), "dd/MM/yyyy")}
            </Typography>

            <Typography variant="caption" textAlign="center">
              {format(new Date(d?.updatedAt), "h:mm a")}
            </Typography>
          </Box>
        ),
        reason: <Typography variant="body2">{d?.reason || "-"}</Typography>,
        status: (
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

  return (
    <>
      <Card>
        <StocktakesHeader
          currentTab={getTab(Screens.poGrn)}
          onQueryChange={handleQueryChange}
          onFiltersChange={handleFilterChange}
          companyRef={companyRef}
          showLocationFilter
          showStatusFilter={false}
          searchPlaceholder={t("Search with stocktakes ID")}
          onSortChange={handleSortChange}
          onTabChange={handleTabChange}
          sort={sort}
          sortOptions={sortOptions}
          tabs={tabs}
        />

        <StocktakesTable
          isLoading={loading}
          loaderComponent={StocktakesRowLoading}
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
                    {t("No Stocktake Order!")}
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
