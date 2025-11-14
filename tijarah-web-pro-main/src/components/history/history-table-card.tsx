import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import {
  Box,
  Card,
  IconButton,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
} from "@mui/material";

import ArrowDownIcon from "@untitled-ui/icons-react/build/esm/ArrowDown";
import ArrowUpIcon from "@untitled-ui/icons-react/build/esm/ArrowUp";
import { format } from "date-fns";
import {
  ChangeEvent,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { InventoryHistoryModalRowLoading } from "src/components/history/inventory-history-modal-row-loading";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import { Sort } from "src/types/sortoption";
import { adjustmentTypeOptions, sortOptions } from "src/utils/constants";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";
import { useDebounce } from "use-debounce";
import CustomDateFilter from "../custom-date-filter/custom-date-filter";
import { SeverityPill } from "../severity-pill";

interface CaustomerTableCardProps {
  companyRef?: string;
  companyName?: string;
  origin?: string;
}

export const HistoryTableCard: FC<CaustomerTableCardProps> = (props) => {
  const { t } = useTranslation();
  const { companyRef, companyName } = props;
  const { userType } = useUserType();
  const lng = localStorage.getItem("currentLanguage");
  const prevDate = new Date();
  prevDate.setMonth(prevDate.getMonth() - 1);

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);

  const [filter, setFilter] = useState<any>([]);
  const [startDate, setStartDate] = useState<Date>(prevDate);
  const [showButton, setShowButton] = useState(false);
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [reset, setReset] = useState(false);

  const { find, entities, loading } = useEntity("stock-history");

  const currency = useCurrency();

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
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

    if (changedFilter.adjustmentType.includes("received")) {
      if (!changedFilter.adjustmentType.includes("received-grn")) {
        changedFilter.adjustmentType.push("received-grn");
      }
    } else {
      const index = changedFilter.adjustmentType.indexOf("received-grn");
      if (index > -1) {
        changedFilter.adjustmentType.splice(index, 1);
      }
    }

    setFilter(changedFilter);
  };

  const handleStartDateChange = useCallback(
    (date: Date | null): void => {
      setPage(0);
      setShowButton(true);
      if (date) {
        setStartDate(date);
      }

      // Prevent end date to be before start date
      if (endDate && date && date > endDate) {
        setEndDate(date);
      }
    },
    [endDate]
  );

  const handleEndDateChange = useCallback(
    (date: Date | null): void => {
      setPage(0);
      setShowButton(true);
      if (date) {
        setEndDate(date);
      }

      // Prevent start date to be after end date
      if (startDate && date && date < startDate) {
        setStartDate(date);
      }
    },
    [startDate]
  );

  const tableHeaders = [
    {
      key: "datetime",
      label: t("Date Time"),
    },

    {
      key: "product",
      label: t("Product"),
    },
    {
      key: "crateBoxName",
      label: t("Crate/Box Name"),
    },
    {
      key: "sku",
      label: t("SKU"),
    },
    {
      key: "packSize",
      label: t("Pack/Size"),
    },
    {
      key: "type",
      label: t("Type"),
    },
    {
      key: "vendor",
      label: t("Vendor/From Location"),
    },
    {
      key: "totalcost",
      label: t("Total Cost"),
    },
    {
      key: "location",
      label: t("Location/To Location"),
    },
    {
      key: "adjustment",
      label: t("Adjustment"),
    },
  ];

  const transformedData = useMemo(() => {
    let arr: any[] = [];
    entities?.results?.map((d) => {
      const arrowIcon =
        d?.action === "received" ||
        d?.action === "received-grn" ||
        d?.action === "inventory-re-count" ||
        d?.action === "received-internal" ? (
          <ArrowUpIcon />
        ) : (
          <ArrowDownIcon />
        );
      const arrowColor =
        d?.action === "received" ||
        d?.action === "received-grn" ||
        d?.action === "inventory-re-count" ||
        d?.action === "received-internal"
          ? "success"
          : "error";

      const getLabel = (value: string) => {
        const option = adjustmentTypeOptions.find(
          (option) => option.value === value
        );
        return option ? option.label : value;
      };

      arr.push({
        key: d._id,
        _id: d?._id,
        datetime: (
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
            <Typography align="center" variant="h6">
              {format(new Date(d?.createdAt), "dd MMM")}
            </Typography>
            <Typography align="center" variant="subtitle2">
              {format(new Date(d?.createdAt), "yyyy")}
            </Typography>
            <Typography variant="caption" textAlign="center">
              {format(new Date(d?.createdAt), "h:mm a")}
            </Typography>
          </Box>
        ),
        product: (
          <Typography
            variant="body2"
            sx={{ minWidth: "110px", textTransform: "capitalize" }}
          >
            {d?.product?.name[lng] || d?.product?.name?.en}{" "}
            {d?.hasMultipleVariants
              ? d?.variant?.name[lng] || d?.variant?.name?.en
              : ""}{" "}
            {d?.type == "box" || d?.type == "crate" ? `x ${d?.unit}` : ""}
          </Typography>
        ),
        crateBoxName: (
          <Typography
            variant="body2"
            sx={{ minWidth: "110px", textTransform: "capitalize" }}
          >
            {d?.variant?.type == "box" || d?.variant?.type == "crate"
              ? d?.variant?.name[lng] || d?.variant?.name?.en
              : "-"}{" "}
          </Typography>
        ),
        sku: <Typography variant="body2">{d?.sku || "NA"}</Typography>,
        packSize: (
          <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
            {d?.variant?.type || "NA"}
          </Typography>
        ),
        type: (
          <Typography variant="body2">
            {d.action === "return-po"
              ? "PO Return"
              : d.action === "received-grn"
              ? "PO & GRN"
              : d?.action === "received-internal" ||
                d?.action === "transfer-internal"
              ? "Internal Transfer"
              : "Stock Update"}
          </Typography>
        ),
        vendor: (
          <Typography variant="body2">
            {d?.action === "received-internal" ? d?.locationFrom?.name : ""}
            {d?.action === "transfer-internal" ? d?.location?.name : ""}
            {d?.action !== "received-internal" ||
            d?.action !== "transfer-internal"
              ? d?.vendor?.name
              : "NA"}
          </Typography>
        ),
        totalcost: (
          <Typography variant="body2">
            {d?.price > 0
              ? `${currency + " "}${toFixedNumber(
                  d?.price * (d?.count > 0 ? d?.count : -d?.count)
                )}`
              : "-"}
          </Typography>
        ),
        location: (
          <Typography variant="body2">
            {d?.action === "received-internal" ? d?.location?.name : ""}
            {d?.action === "transfer-internal" ? d?.locationTo?.name : ""}
            {d?.action !== "received-internal" &&
            d?.action !== "transfer-internal"
              ? d?.location?.name
              : ""}
          </Typography>
        ),
        adjustment: (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "end",
              }}
            >
              {d?.action !== "inventory-re-count" && (
                <SvgIcon color={arrowColor}>{arrowIcon}</SvgIcon>
              )}

              {d?.action !== "received-internal" &&
                d?.action !== "transfer-internal" && (
                  <Typography variant="body2">
                    {`${d?.count} ${getLabel(
                      d?.action === "received-grn" ? "received" : d?.action
                    )}`}
                  </Typography>
                )}

              {(d?.action === "received-internal" ||
                d?.action === "transfer-internal") && (
                <Typography variant="body2">
                  {`${d?.count} ${getLabel(
                    d?.action === "transfer-internal"
                      ? "internal-transfer"
                      : "Internal Received"
                  )}`}
                </Typography>
              )}
            </Box>
            <Box>
              {Boolean(d.auto) && (
                <SeverityPill color="info">{t("Auto")}</SeverityPill>
              )}
            </Box>
          </>
        ),
      });
    });

    return arr;
  }, [entities.results]);

  const getQuery = () => {
    const query: any = {
      page: page,
      sort: sort,

      locationRef: filter?.location?.[0] || [],
      vendorRef: filter?.vendor || [],
      limit: rowsPerPage,
      _q: debouncedQuery,
      action: filter?.adjustmentType,
      companyRef: companyRef,
    };

    if (startDate && endDate) {
      const fromDate = new Date(startDate);
      fromDate.setHours(0, 0, 0, 0);

      const toDate = new Date(endDate);
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
  }, [
    sort,
    rowsPerPage,
    page,
    debouncedQuery,
    filter,
    startDate,
    companyRef,
    endDate,
  ]);

  return (
    <>
      <Box>
        <Stack
          spacing={2}
          sx={{ mt: 1, mb: 1 }}
          alignItems="center"
          direction="row"
          flexWrap="wrap"
        >
          <Typography variant="h6">{t("Date Range")}</Typography>

          <CustomDateFilter
            reset={reset}
            setReset={(val: any) => setReset(val)}
            startDate={startDate}
            setStartDate={(val: any) => {
              console.log(val, "sdjhsjdsjdhj");

              setStartDate(val);
            }}
            endDate={endDate}
            setEndDate={(val: any) => {
              setEndDate(val);
            }}
          />

          <Box>
            <Tooltip title={t("Reset date")}>
              <IconButton
                onClick={() => {
                  setReset(true);
                  setStartDate(prevDate);
                  setEndDate(new Date());
                  setShowButton(false);
                }}
              >
                <AutorenewRoundedIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Stack alignItems="center" direction="row" spacing={1}>
            {/* <ExportButton
              disabled={true}
              onClick={(type: string) => {
                exportCsv("/export/histoy", type);
              }}
            /> */}
          </Stack>
        </Stack>
      </Box>

      <Card>
        <SuperTableHeader
          onQueryChange={handleQueryChange}
          onFiltersChange={handleFilterChange}
          showFilter={true}
          companyRef={companyRef}
          showStatusFilter={false}
          showLocationFilter
          showadjustmentTypeFilter
          showVendorFilter
          searchPlaceholder={t("Search with Product Name/ SKU ")}
          onSortChange={handleSortChange}
          sort={sort}
          sortOptions={sortOptions}
        />

        <SuperTable
          isLoading={loading}
          loaderComponent={InventoryHistoryModalRowLoading}
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
                    {t("No History Report!")}
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
