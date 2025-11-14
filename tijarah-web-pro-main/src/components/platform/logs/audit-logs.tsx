import { Box, Button, Card, Container, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { format } from "date-fns";
import Head from "next/head";
import { ChangeEvent, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LogsRowLoading } from "src/components/logs/logs-row-loading";
import AuditLogModal from "src/components/modals/audit-logs-modal";
import { LogModal } from "src/components/modals/log-resp";
import { SeverityPill } from "src/components/severity-pill";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { CompanyContext } from "src/contexts/company-context";
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

const AuditLogs: PageType = () => {
  const { t } = useTranslation();
  const { find, entities, loading } = useEntity("audit-log");

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [showResp, setShowResp] = useState(false);
  const [resp, setResp] = useState(JSON.stringify({ success: 1 }));
  const companyContext = useContext<any>(CompanyContext);

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
      key: "userName",
      label: t("User Name"),
    },
    {
      key: "userType",
      label: t("User Type"),
    },
    {
      key: "companyName",
      label: t("Company Name"),
    },
    {
      key: "date",
      label: t("Date"),
    },
    {
      key: "recordName",
      label: t("Record Name"),
    },
    {
      key: "entityName",
      label: t("Entity Name"),
    },
    {
      key: "updatedFields",
      label: t("Updated Fields"),
    },
  ];

  useEffect(() => {
    find({
      page: page,
      sort: sort,
      limit: rowsPerPage,
      _q: debouncedQuery,
      companyRef: companyContext._id ? companyContext._id : "",
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
        date: (
          <Typography variant="body2">
            {d?.lastUpdatedAt
              ? format(new Date(d?.lastUpdatedAt), "dd/MM/yyyy, h:mma")
              : format(new Date(), "dd/MM/yyyy, h:mma")}
          </Typography>
        ),
        userName: d?.lastUpdatedBy?.name || "N/A",
        userType: d?.lastUpdatedBy?.type || "N/A",
        companyName: d?.company?.name || "N/A",
        recordName: d?.recordName?.en || "N/A",
        entityName: d?.entityName || "N/A",
        updatedFields: (
          <Button
            onClick={() => {
              showResponse(d?.updatedFields);
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
      <AuditLogModal
        data={resp}
        open={showResp}
        handleClose={() => setShowResp(!showResp)}
      />

      <Head>
        <title>{t("Audit Logs | Tijarah")}</title>
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
                <Typography variant="h4">{t("Audit Logs")}</Typography>
                <Stack alignItems="center" direction="row" spacing={1}></Stack>
              </Stack>
            </Stack>

            <Card>
              <SuperTableHeader
                onQueryChange={handleQueryChange}
                showFilter={false}
                searchPlaceholder={t(
                  "Search with Company name, Entity name and User name"
                )}
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

AuditLogs.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AuditLogs;
