import {
  Box,
  Card,
  Container,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { format, startOfDay, endOfDay } from "date-fns";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TransformedArrowIcon } from "src/components/TransformedIcons";
import { Seo } from "src/components/seo";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";
import NoPermission from "src/pages/no-permission";
import toast from "react-hot-toast";
import { SubscriptionRowLoading } from "./row-loading";
import { useCurrency } from "src/utils/useCurrency";
import ExportButton from "src/components/custom-button/custom-export-button";
import exportAllReport from "src/utils/export-all-report";
import CustomDateFilter from "src/components/custom-date-filter/custom-date-filter";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";

function InvoicesListTab() {
  const { t } = useTranslation();
  const router = useRouter();

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [filter, setFilter] = useState<any>([]);
  const [startDate, setStartDate] = useState<Date>(startOfDay(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfDay(new Date()));
  const [reset, setReset] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const currency = useCurrency();

  const paymentStatusOptions = [
    { label: t("Paid"), value: "paid" },
    { label: t("Unpaid"), value: "unpaid" },
  ];

  const hardwareOptions = useMemo(() => {
    return [
      { label: t("Yes"), value: "yes" },
      { label: t("No"), value: "no" },
    ];
  }, [t]);

  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["package:read"]);
  const { find, loading, entities } = useEntity("invoice");

  usePageView();

  const handlePageChange = (newPage: number): void => setPage(newPage);

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleQueryChange = (value: string): void => {
    setQueryText(value);
    if (page > 0) setPage(0);
  };

  const handleSortChange = (value: any) => setSort(value);

  const handleFilterChange = (changedFilter: any) => {
    setPage(0);
    setFilter(changedFilter);
  };

  const getQuery = (type = "") => {
    const query: any = {
      page,
      sort,
      limit: rowsPerPage,
      _q: debouncedQuery,
      paymentStatus:
        filter?.paymentStatus?.length > 0 ? filter.paymentStatus[0] : "all",
      ...(filter?.method?.length > 0
        ? { paymentMethod: filter.method[0] }
        : {}),
      ...(filter?.hardware?.length > 0 ? { hardware: filter.hardware[0] } : {}),
    };

    if (startDate && endDate) {
      const fromDate = new Date(startDate);
      fromDate.setHours(0, 0, 0, 0);

      const toDate = new Date(endDate);
      toDate.setHours(23, 59, 59, 999);

      query["dateRange"] = {
        from: fromDate,
        to: toDate,
      };
    }

    return query;
  };

  const tableHeaders = [
    { key: "invoiceNumber", label: t("Invoice #") },
    { key: "companyName", label: t("Company") },
    { key: "amount", label: t("Amount") },
    { key: "invoiceDate", label: t("Issue Date") },
    { key: "dueDate", label: t("Due Date") },
    { key: "paymentStatus", label: t("Status") },
    { key: "paymentMethod", label: t("Payment Method") },
    { key: "action", label: t("Action") },
  ];

  const transformedData = useMemo(() => {
    return (
      entities?.results?.map((d) => ({
        key: d?._id,
        _id: d?._id,
        invoiceNumber: (
          <Typography variant="body2">{d?.invoiceNum || "N/A"}</Typography>
        ),
        companyName: (
          <Typography variant="body2">{d?.company?.name || "N/A"}</Typography>
        ),
        amount: (
          <Typography variant="body2">
            {currency}{" "}
            {d?.billing.total ? `${d.billing.total.toFixed(2)} ` : "N/A"}
          </Typography>
        ),
        invoiceDate: (
          <Typography variant="body2">
            {d?.invoiceDate
              ? format(new Date(d.invoiceDate), "dd/MM/yyyy")
              : "N/A"}
          </Typography>
        ),
        dueDate: (
          <Typography variant="body2">
            {d?.dueDate ? format(new Date(d.dueDate), "dd/MM/yyyy") : "N/A"}
          </Typography>
        ),
        paymentStatus: (
          <Typography
            variant="body2"
            color={
              d?.paymentStatus === "paid"
                ? "success.main"
                : d?.paymentStatus === "pending"
                ? "warning.main"
                : "error.main"
            }
            sx={{ textTransform: "capitalize" }}
          >
            {d?.paymentStatus
              ? t(
                  d.paymentStatus.charAt(0).toUpperCase() +
                    d.paymentStatus.slice(1)
                )
              : "N/A"}
          </Typography>
        ),
        paymentMethod: (
          <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
            {d?.paymentMethod ? t(d.paymentMethod) : "N/A"}
          </Typography>
        ),
        action: (
          <Box sx={{ display: "flex", justifyContent: "end" }}>
            <IconButton
              onClick={() => {
                if (!canUpdate) return toast.error(t("You don't have access"));
                router.push(
                  `${tijarahPaths?.platform?.subscriptions.invoices}/${d?._id}`
                );
              }}
            >
              <TransformedArrowIcon name="arrow-right" />
            </IconButton>
          </Box>
        ),
      })) || []
    );
  }, [entities?.results]);

  useEffect(() => {
    find(getQuery());
  }, [page, sort, debouncedQuery, rowsPerPage, filter, startDate, endDate]);

  if (!canAccess(MoleculeType["package:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Invoices")}`} />
      <Box component="main" sx={{ flexGrow: 1, py: 2, mb: 4 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h4">{t("Invoices")}</Typography>
            </Box>

            <Grid
              container
              spacing={1}
              sx={{ mt: 1, mb: 1 }}
              display={"flex"}
              alignItems="center"
            >
              <Grid
                display={"flex"}
                alignItems="center"
                item
                lg={3}
                md={4}
                sm={6}
                xs={12}
              >
                <CustomDateFilter
                  reset={reset}
                  setReset={(val: any) => setReset(val)}
                  startDate={startDate}
                  setStartDate={(val: any) => {
                    setStartDate(val);
                    setShowButton(true);
                  }}
                  endDate={endDate}
                  setEndDate={(val: any) => {
                    setEndDate(val);
                    setShowButton(true);
                  }}
                />

                <Box style={{ marginLeft: 0 }}>
                  <Tooltip title={t("Reset date")}>
                    <IconButton
                      onClick={() => {
                        setReset(true);
                        setStartDate(startOfDay(new Date()));
                        setEndDate(endOfDay(new Date()));
                        setShowButton(false);
                      }}
                    >
                      <AutorenewRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>

              <Grid
                display={"flex"}
                alignItems="center"
                item
                lg={1}
                md={2}
                sm={1}
                xs={2}
              >
                <Stack alignItems="center" direction="row" spacing={1}>
                  <ExportButton
                    onClick={() => {
                      exportAllReport(
                        "/invoice",
                        getQuery(),
                        "invoices",
                        startDate,
                        endDate
                      );
                    }}
                  />
                </Stack>
              </Grid>
            </Grid>
            <Card>
              <SuperTableHeader
                onQueryChange={handleQueryChange}
                onFiltersChange={handleFilterChange}
                showLocationFilter={false}
                showExpiryFilter={false}
                showPaymentStatusFilter={true}
                showInvoicePaymentMethodFilter={true}
                showHardwareFilter={true}
                searchPlaceholder={t("Search invoices...")}
                onSortChange={handleSortChange}
                sort={sort}
                sortOptions={sortOptions}
                paymentStatusOptions={paymentStatusOptions}
                hardwareOptions={hardwareOptions}
              />
              <SuperTable
                isLoading={loading}
                loaderComponent={SubscriptionRowLoading}
                items={transformedData as any}
                headers={tableHeaders}
                total={entities?.total || 0}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPage={rowsPerPage}
                page={page}
                noDataPlaceholder={
                  <Box sx={{ mt: 6, mb: 4 }}>
                    <NoDataAnimation />
                  </Box>
                }
              />
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

export default InvoicesListTab;
