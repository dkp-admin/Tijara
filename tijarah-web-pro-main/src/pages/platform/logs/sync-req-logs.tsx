import { Box, Button, Card, Container, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { format } from "date-fns";
import Head from "next/head";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LogsRowLoading } from "src/components/logs/logs-row-loading";
import { LogModal } from "src/components/modals/log-resp";
import { SeverityPill } from "src/components/severity-pill";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import type { Page as PageType } from "src/types/page";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";

const entityNames: any = {
  product: "Product",
  category: "Category",
  customer: "Customer",
  "business-detail": "Business Detail",
  order: "Order",
  "global-product": "Global Product",
  "cash-drawer-txn": "Cash Drawer Transaction",
  coupon: "Discount",
  tax: "VAT",
  brand: "Brand",
};

const SyncReqLogs: PageType = () => {
  const { t } = useTranslation();
  const { find, entities, loading } = useEntity("platform-logs");
  console.log("TEST");

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [showResp, setShowResp] = useState(false);
  const [resp, setResp] = useState(JSON.stringify({ success: 1 }));

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

  const tableHeaders = [
    {
      key: "method",
      label: t("Method"),
    },
    {
      key: "entity",
      label: t("Entity"),
    },
    {
      key: "status",
      label: t("Status"),
    },
    {
      key: "type",
      label: t("Type"),
    },
    {
      key: "date",
      label: t("Date"),
    },
    {
      key: "response",
      label: t("Response"),
    },
  ];

  useEffect(() => {
    find({
      page: page,
      sort: sort,
      limit: rowsPerPage,
      _q: debouncedQuery,
    });
  }, [page, sort, debouncedQuery, rowsPerPage]);

  const showResponse = (response: string) => {
    setResp(response);
    setShowResp(true);
  };

  const transformedData = useMemo(() => {
    let arr: any[] = [];

    entities?.results?.map((d) => {
      arr.push({
        key: d._id,
        _id: d?._id,
        method: (
          <Typography color="text.secondary" variant="caption">
            {d.method || "POST"}
          </Typography>
        ),
        entity: entityNames[d?.entity],
        type: d?.type || "Push",

        status: (
          <SeverityPill color={d?.status === "success" ? "success" : "error"}>
            {d.status}
          </SeverityPill>
        ),
        date: (
          <Typography variant="body2">
            {d?.date
              ? format(new Date(d?.date), "dd/MM/yyyy, HH:mm")
              : format(new Date(), "dd/MM/yyyy | HH:mm")}
          </Typography>
        ),
        response: (
          <Button
            onClick={() => {
              showResponse(d?.response);
            }}
          >
            View
          </Button>
        ),
      });
    });

    return arr;
  }, [entities?.results]);

  return (
    <>
      <LogModal
        data={resp}
        open={showResp}
        handleClose={() => setShowResp(!showResp)}
      />

      <Head>
        <title>{t("Request Logs | Tijarah")}</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
          mb: 4,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">{t("Request Logs")}</Typography>
                <Stack alignItems="center" direction="row" spacing={1}></Stack>
              </Stack>
            </Stack>

            {/* <Logs logs={entities} /> */}
            <Card>
              <SuperTableHeader
                onQueryChange={handleQueryChange}
                showFilter={false}
                searchPlaceholder={t("Search with Entity name")}
                onSortChange={handleSortChange}
                sort={sort}
                sortOptions={sortOptions}
              />

              <SuperTable
                isLoading={loading}
                loaderComponent={LogsRowLoading}
                items={transformedData}
                headers={tableHeaders}
                total={entities?.total || 0}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPage={rowsPerPage}
                page={page}
                isCancelAllClicked={false}
                noDataPlaceholder={
                  <Box sx={{ mt: 6, mb: 4 }}>
                    <NoDataAnimation
                      text={
                        <Typography
                          variant="h6"
                          textAlign="center"
                          sx={{ mt: 2 }}
                        >
                          {t("No Logs!")}
                        </Typography>
                      }
                    />
                  </Box>
                }
              />
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

SyncReqLogs.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default SyncReqLogs;
