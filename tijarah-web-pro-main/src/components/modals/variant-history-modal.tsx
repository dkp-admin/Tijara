import { Box, SvgIcon, Typography } from "@mui/material";
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
import { HistoryModalRowLoading } from "src/components/history/history-modal-row-loading";
import { Scrollbar } from "src/components/scrollbar";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { Sort } from "src/types/sortoption";
import { adjustmentTypeOptions, sortOptions } from "src/utils/constants";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useDebounce } from "use-debounce";
import { SeverityPill } from "../severity-pill";
import { useCurrency } from "src/utils/useCurrency";
interface HistoryTableCardProps {
  companyRef?: string;
  companyName?: string;
  productData?: any;
  modalData?: any;
  selectedLocationRef?: any;
}

export const StockHistoryModal: FC<HistoryTableCardProps> = ({
  companyRef,
  modalData,
  productData,
  selectedLocationRef,
}) => {
  const { t } = useTranslation();
  const prevDate = new Date();
  prevDate.setMonth(prevDate.getMonth() - 1);
  const lng = localStorage.getItem("currentLanguage");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const currency = useCurrency();
  const [filter, setFilter] = useState<any>([]);
  const [startDate, setStartDate] = useState<Date>(prevDate);
  const [showButton, setShowButton] = useState(false);
  const [endDate, setEndDate] = useState<Date>(new Date());

  const { find, entities, loading } = useEntity("stock-history");

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
      key: "crateBoxName",
      label: t("Crate/Box Name"),
    },
    {
      key: "vendor",
      label: t("Vendor/From Location"),
    },
    {
      key: "packSize",
      label: t("Pack/Size"),
    },
    {
      key: "sku",
      label: t("SKU "),
    },
    {
      key: "totalcost",
      label: t("Total Cost"),
    },
    {
      key: "location",
      label: t("Location"),
    },
    {
      key: "adjustment",
      label: t("Adjustments"),
    },
  ];

  const transformedData = useMemo(() => {
    let arr: any[] = [];
    entities?.results?.map((d) => {
      const arrowIcon =
        d?.action === "received" ||
        d?.action === "received-grn" ||
        d?.action === "restock-return" ? (
          <ArrowUpIcon />
        ) : (
          <ArrowDownIcon />
        );
      const arrowColor =
        d?.action === "received" ||
        d?.action === "received-grn" ||
        d?.action === "restock-return"
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
              {format(new Date(d?.createdAt || 0), "dd MMM")}
            </Typography>
            <Typography align="center" variant="subtitle2">
              {format(new Date(d?.createdAt || 0), "yyyy")}
            </Typography>
            <Typography variant="caption" textAlign="center">
              {format(new Date(d?.createdAt || 0), "h:mm a")}
            </Typography>
          </Box>
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
        vendor: (
          <Typography variant="body2">
            {d?.action === "received-internal" ||
            d?.action === "transfer-internal"
              ? d?.location?.name
              : d?.vendor?.name || "NA"}
          </Typography>
        ),
        sku: (
          <Typography variant="body2">
            {d?.variant?.type === "box" || d?.variant?.type === "crate"
              ? `${d?.sku}`
              : "-"}
          </Typography>
        ),
        packSize: (
          <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
            {d?.variant?.type || "NA"}
          </Typography>
        ),
        totalcost: (
          <Typography variant="body2">
            {d?.price > 0 || d?.variant?.costPrice > 0
              ? `${currency} ${toFixedNumber(
                  (d?.variant?.costPrice || d?.price) *
                    (d?.count > 0 ? d?.count : -d?.count)
                )}`
              : "-"}
          </Typography>
        ),
        location: <Typography variant="body2">{d?.location?.name}</Typography>,

        adjustment: (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "start",
                mb: 1,
              }}
            >
              {d?.action === "transfer" ||
              d?.action === "inventory-re-count" ||
              d?.action === "received-internal" ||
              d?.action === "transfer-internal" ? (
                ""
              ) : (
                <SvgIcon color={arrowColor}>{arrowIcon}</SvgIcon>
              )}
              <Typography variant="body2">
                {d?.count > 0 ? d?.count : -d?.count}{" "}
                {getLabel(
                  d?.action === "received-grn" ? "received" : d?.action
                )}
              </Typography>
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
      page: debouncedQuery?.length > 0 ? 0 : page,
      sort: sort,
      activeTab: "all",
      limit: rowsPerPage,
      _q: debouncedQuery,
      action: filter?.adjustmentType,
      companyRef: companyRef,
      locationRef: selectedLocationRef
        ? selectedLocationRef
        : filter?.location?.[0],
      vendorRef: filter?.vendor,
      productRef: productData?.productId,
      sku: modalData.sku,
    };

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
    companyRef,
    productData?.productId,
  ]);

  return (
    <>
      <Box>
        <SuperTableHeader
          onQueryChange={handleQueryChange}
          onFiltersChange={handleFilterChange}
          showFilter={true}
          companyRef={companyRef}
          showSearch={false}
          showStatusFilter={false}
          showLocationFilter={selectedLocationRef ? false : true}
          showadjustmentTypeFilter
          showVendorFilter
          searchPlaceholder={t("Search with Product Name/ SKU ")}
          onSortChange={handleSortChange}
          sort={sort}
          sortOptions={sortOptions}
        />
        <Scrollbar
          sx={{
            height: {
              lg: "70vh",
              sm: "70vh",
            },
          }}
        >
          <SuperTable
            isLoading={loading}
            loaderComponent={HistoryModalRowLoading}
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
        </Scrollbar>
      </Box>
    </>
  );
};
