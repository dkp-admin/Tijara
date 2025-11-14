import { Box, Card, Divider, Modal, Typography } from "@mui/material";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { HistoryModalRowLoading } from "src/components/history/history-modal-row-loading";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { Sort } from "src/types/sortoption";
import { format } from "date-fns";
import { sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { Scrollbar } from "src/components/scrollbar";

interface BatchHistoryTableCardProps {
  companyRef?: string;
  companyName?: string;
  modalData?: any;
  selectedLocationRef?: any;
}

export const BatchHistoryModal: FC<BatchHistoryTableCardProps> = ({
  modalData,
  companyRef,
  selectedLocationRef,
}) => {
  const { t } = useTranslation();

  const prevDate = new Date();
  prevDate.setMonth(prevDate.getMonth() - 1);

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);

  const [filter, setFilter] = useState<any>([]);

  const { find, entities, loading } = useEntity("batch");

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
    setFilter(changedFilter);
  };

  const tableHeaders = [
    {
      key: "datetime",
      label: t("Batch"),
    },
    {
      key: "vendor",
      label: t("Vendor"),
    },
    {
      key: "location",
      label: t("Location"),
    },
    {
      key: "receivedqty",
      label: t("Received Qty."),
    },
    {
      key: "batchtransfer",
      label: t("Batch Transfer"),
    },
    {
      key: "availableqty",
      label: t("Available Qty."),
    },
  ];

  const transformedData = useMemo(() => {
    let arr: any[] = [];
    entities?.results?.map((d) => {
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
            <Typography align="center" variant="subtitle2">
              {format(new Date(d?.expiry || 0), "dd MMM yyyy")}
            </Typography>
          </Box>
        ),
        location: <Typography variant="body2">{d?.location?.name}</Typography>,

        vendor: (
          <Typography variant="body2">{d?.vendor?.name || "NA"}</Typography>
        ),
        receivedqty: (
          <Typography variant="body2">{d?.received || 0}</Typography>
        ),
        batchtransfer: (
          <Typography variant="body2">{d?.transfer || 0}</Typography>
        ),

        availableqty: (
          <Typography variant="body2">{d?.available || 0}</Typography>
        ),
      });
    });

    return arr;
  }, [entities.results]);

  const getQuery = () => {
    const query: any = {
      page: debouncedQuery?.length > 0 ? 0 : page,
      sort: sort,
      activeTab: filter?.batch?.length > 0 ? filter?.batch[0] : "available",
      limit: rowsPerPage,
      _q: debouncedQuery,
      sku: modalData?.sku,
      companyRef: companyRef,
      VendorRef: filter?.vendorRef,
      locationRef: selectedLocationRef
        ? selectedLocationRef
        : filter?.location?.[0],
      vendorRef: filter?.vendor,
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
    modalData?.sku,
    companyRef,
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
          showBatchFilter
          searchPlaceholder={t("Search with Vendor Name ")}
          onSortChange={handleSortChange}
          sort={sort}
          sortOptions={sortOptions}
        />
        <Scrollbar
          sx={{
            height: {
              lg: "80vh",
              sm: "90vh",
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
                      {t("No Batch History!")}
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
