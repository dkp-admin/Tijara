import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  Container,
  IconButton,
  Link,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { format } from "date-fns";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TransformedArrowIcon } from "src/components/TransformedIcons";
import { AccountingTopCard } from "src/components/accounting/accounting-topCard";
import ExportButton from "src/components/custom-button/custom-export-button";
import CustomDateFilter from "src/components/custom-date-filter/custom-date-filter";
import { ExpenseRowLoading } from "src/components/expense/expense-row-loading";
import LocationAutoCompleteDropdown from "src/components/input/location-singleSelect";
import { Seo } from "src/components/seo";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { useFindOne } from "src/hooks/use-find-one";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import useImport from "src/hooks/useImport";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import UpgradePackage from "src/pages/upgrade-package";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import { Sort } from "src/types/sortoption";
import { USER_TYPES, sortOptions } from "src/utils/constants";
import useExportAll from "src/utils/export-all";
import exportAllReport from "src/utils/export-all-report";
import { useDebounce } from "use-debounce";
import { useCurrency } from "src/utils/useCurrency";

const Accounting: PageType = () => {
  usePageView();
  const { exportCsv } = useExportAll({});
  let importEntity = "brand";
  const { user } = useAuth();
  const { userType } = useUserType();
  const { canAccessModule } = useFeatureModuleManager();
  const currency = useCurrency();
  const [locationRef, setLocationRef] = useState("all");
  const newLocationRef = user.locationRef;
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const breadcrumbs = [
    <Link
      underline="hover"
      key="1"
      color="inherit"
      onClick={() => {
        router.push({
          pathname: tijarahPaths.dashboard.salesDashboard,
        });
      }}
    >
      <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
    </Link>,
    <Link underline="hover" key="2" color="inherit" href="#">
      {t("Accounting")}
    </Link>,
  ];
  const [showDialogCustomerEvent, setShowDialogCustomerEvent] = useState(false);
  const [openImportExportModal, setOpenImportExportModal] = useState(false);
  const [isCancelAllClicked] = useState(false);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [queryText, setQueryText] = useState<string>("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [filter, setFilter] = useState<any>([]);
  const { importCsv, response } = useImport({ importEntity });

  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["acounting:update"]);
  const canCreate = canAccess(MoleculeType["accounting:create"]);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [showButton, setShowButton] = useState(false);
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [reset, setReset] = useState(false);

  const { find, loading, entities } = useEntity("accounting");

  const {
    findOne: findStats,
    entity: accountingStats,
    newDateAndTime,
    loading: statsLoading,
  } = useFindOne("accounting/stats");

  const handleQueryChange = (value: string): void => {
    if (value != undefined) {
      setQueryText(value);
      if (page > 0) {
        setPage(0);
      }
    }
  };

  const handleSortChange = (value: any): void => {
    setSort(value);
  };

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterChange = (changedFilter: any) => {
    setPage(0);
    setFilter(changedFilter);
  };

  const lng = localStorage.getItem("currentLanguage");

  const getAmount = (payments: any[]) => {
    let totalAmount = payments.reduce(
      (acc, current) => acc + current.amount,
      0
    );

    return totalAmount;
  };

  const getPaymentMethod = (payments: any[]) => {
    const paymentMethodsStr: string = payments
      .map((method) => method.paymentMethod)
      .join(", ");

    return paymentMethodsStr;
  };

  const transformedData = useMemo(() => {
    let arr: any[] = [];

    entities?.results?.map((d: any) => {
      arr.push({
        key: d?._id,
        _id: d?._id,
        name: (
          <Box sx={{ ml: 1, textAlign: "start", textTransform: "capitalize" }}>
            <Typography color="inherit" variant="subtitle2">
              {d?.deviceRef
                ? `${d?.name?.en} (${d?.device?.deviceCode})`
                : `${d?.name?.en} ${
                    d?.poRef ? `(${d?.referenceNumber})` : ""
                  }` || "-"}
            </Typography>
          </Box>
        ),
        transactionType: (
          <Box>
            <Typography
              sx={{ textTransform: "capitalize" }}
              color="inherit"
              variant="subtitle2"
            >
              {d?.transactionType || "-"}
            </Typography>
          </Box>
        ),
        reason: (
          <Box>
            <Typography
              sx={{ textTransform: "capitalize" }}
              color="inherit"
              variant="subtitle2"
            >
              {d?.reason || "-"}
            </Typography>
          </Box>
        ),
        amount: (
          <Box>
            <Typography
              sx={{ textTransform: "capitalize" }}
              color="inherit"
              variant="subtitle2"
            >
              {d?.transactions?.length > 0
                ? `${currency} ${d?.transactions?.reduce((acc: any, t: any) => {
                    return acc + t?.amount;
                  }, 0)}`
                : "-"}
            </Typography>
          </Box>
        ),

        paymentMethod: (
          <Box>
            <Typography
              sx={{ textTransform: "capitalize" }}
              color="inherit"
              variant="subtitle2"
            >
              {getPaymentMethod(d?.transactions) || "-"}
            </Typography>
          </Box>
        ),
        location: (
          <Box>
            <Typography color="inherit" variant="subtitle2">
              {d?.location?.name || "-"}
            </Typography>
          </Box>
        ),
        user: (
          <Box>
            <Typography color="inherit" variant="subtitle2">
              {d?.user?.name ? `${d?.user?.name}` : "-"}
            </Typography>
          </Box>
        ),
        date: (
          <Box>
            <Typography color="inherit" variant="subtitle2">
              {d?.status == "to_be_paid" || d?.status == "to_be_received"
                ? "-"
                : d?.paymentDate
                ? format(new Date(d?.paymentDate), "dd/MM/yyyy")
                : format(new Date(d?.date), "dd/MM/yyyy")}
            </Typography>
          </Box>
        ),
        status: (
          <Box>
            <Typography
              style={{ textTransform: "capitalize" }}
              color="inherit"
              variant="subtitle2"
            >
              {d?.status == "to_be_paid"
                ? "To Be Paid"
                : d?.status == "to_be_received"
                ? "To Be Received"
                : d?.status}
            </Typography>
          </Box>
        ),
        dueOn: (
          <Box>
            <Typography color="inherit" variant="subtitle2">
              {d?.status == "paid" || d?.status == "received"
                ? "-"
                : format(new Date(d?.date), "dd/MM/yyyy")}
            </Typography>
          </Box>
        ),

        action: (
          <Box
            sx={{
              display: "flex",
              justifyContent: "end",
            }}
          >
            <IconButton
              onClick={() => {
                router.push({
                  pathname: tijarahPaths?.accounting.accounting?.create,
                  query: {
                    id: d?._id,
                  },
                });
              }}
              sx={{ mr: 1.5 }}
            >
              <TransformedArrowIcon name="arrow-right" />
            </IconButton>
          </Box>
        ),
      });
    });

    return arr;
  }, [entities?.results]);

  const tableHeaders = [
    {
      key: "name",
      label: t("Name"),
    },
    {
      key: "transactionType",
      label: t("Transaction Type"),
    },
    {
      key: "reason",
      label: t("Reason"),
    },
    {
      key: "amount",
      label: t("Amount"),
    },
    {
      key: "paymentMethod",
      label: t("Payment Method "),
    },
    {
      key: "location",
      label: t("Location"),
    },
    {
      key: "user",
      label: t("User"),
    },
    {
      key: "date",
      label: t("Payment Date"),
    },
    {
      key: "status",
      label: t("Status"),
    },
    {
      key: "dueOn",
      label: t("Due Date"),
    },
    {
      key: "action",
      label: t("Action"),
    },
  ];

  useEffect(() => {
    if (response) {
      setShowDialogCustomerEvent(true);
    }
  }, [response]);

  const getQuery = (type = "") => {
    const query: any = {
      page: page,
      sort: sort,
      activeTab: filter?.status?.length > 0 ? filter?.status[0] : "all",
      limit: rowsPerPage,
      _q: debouncedQuery,
      companyRef: user?.company?._id,
    };

    if (locationRef !== "all" && locationRef) {
      query["locationRef"] = locationRef;
    }

    if (filter?.user?.length > 0) {
      query["userRef"] = filter.user[0];
    }
    if (filter?.device?.length > 0) {
      query["deviceRef"] = filter.device[0];
    }
    if (filter?.expenseType?.length > 0) {
      query["expenseType"] = filter.expenseType[0];
    }
    if (filter?.method?.length > 0) {
      query["paymentMethod"] = filter.method[0];
    }

    if (filter?.accountingStatusType?.length > 0) {
      query["status"] = filter.accountingStatusType[0];
    }

    if (filter?.transactionType?.length > 0) {
      query["transactionType"] = filter.transactionType[0];
    }

    if (startDate && endDate) {
      const fromDate = new Date(startDate);
      fromDate.setHours(0, 0, 0, 0);

      const toDate = new Date(endDate);
      toDate.setHours(23, 59, 0, 0);

      // query["paymentDate"] = {
      //   from: fromDate,
      //   to: toDate,
      // };
      query["dateRange"] = {
        from: fromDate,
        to: toDate,
      };
    }
    return query;
  };

  useEffect(() => {
    findStats({ ...getQuery() });
  }, [
    sort,
    rowsPerPage,
    user?.company?._id,
    locationRef,
    newLocationRef,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    find({
      ...getQuery(),
    });
  }, [
    page,
    sort,
    debouncedQuery,
    rowsPerPage,
    filter,
    locationRef,
    startDate,
    endDate,
  ]);

  if (!canAccessModule("accounting")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["accounting:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Accounting")}`} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
          mb: 4,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack
              direction="row"
              justifyContent="space-between"
              flexWrap={"wrap"}
              spacing={4}
            >
              <Stack spacing={1}>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <Typography variant="h4">{t("Accounting")}</Typography>
                </Stack>

                <Stack>
                  <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    aria-label="breadcrumb"
                  >
                    {breadcrumbs}
                  </Breadcrumbs>
                </Stack>
              </Stack>
              <Stack
                display={"flex"}
                alignItems="center"
                justifyContent={"flex-end"}
                direction="row"
                sx={{
                  width: {
                    xs: "100%",
                    md: "auto",
                  },
                }}
                spacing={3}
              >
                <Button
                  onClick={() => {
                    // if (!canCreate) {
                    //   return toast.error(t("You don't have access"));
                    // }
                    router.push({
                      pathname: tijarahPaths?.accounting.accounting?.create,
                    });
                  }}
                  sx={{
                    pr: {
                      xs: 0,
                      md: 4,
                    },
                    pl: {
                      xs: 1,
                      md: 4,
                    },
                  }}
                  startIcon={
                    <SvgIcon>
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                >
                  <Typography
                    sx={{
                      display: {
                        xs: "none",
                        md: "inline",
                      },
                    }}
                  >
                    {t("Add Transaction")}
                  </Typography>
                </Button>
              </Stack>
            </Stack>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ width: "290px", mr: 1 }}>
                <LocationAutoCompleteDropdown
                  showAllLocation
                  required={false}
                  companyRef={user?.company?._id}
                  onChange={(id) => {
                    setLocationRef(id || "");
                  }}
                  selectedId={locationRef as string}
                  label={t("Location")}
                  id="location"
                />
              </Box>

              <Box>
                <Stack
                  spacing={2}
                  alignItems="center"
                  direction="row"
                  flexWrap="wrap"
                >
                  <CustomDateFilter
                    reset={reset}
                    setReset={(val: any) => setReset(val)}
                    startDate={startDate}
                    setStartDate={(val: any) => {
                      setStartDate(val);
                    }}
                    endDate={endDate}
                    setEndDate={(val: any) => {
                      setEndDate(val);
                    }}
                  />
                  <Tooltip
                    title={t(
                      "Data is being generated on the basis of transaction created at date"
                    )}
                  >
                    <SvgIcon color="primary">
                      <InfoCircleIcon />
                    </SvgIcon>
                  </Tooltip>

                  <Box>
                    <Tooltip title={t("Reset date")}>
                      <IconButton
                        onClick={() => {
                          setReset(true);
                          setStartDate(new Date());
                          setEndDate(new Date());
                          setShowButton(false);
                        }}
                      >
                        <AutorenewRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Stack alignItems="center" direction="row" spacing={1}>
                    <ExportButton
                      onClick={(type: string) => {
                        exportAllReport(
                          "/export/accounting",
                          getQuery(type),
                          "accounting",
                          startDate,
                          endDate
                        );
                      }}
                    />
                  </Stack>
                </Stack>
              </Box>
            </Box>

            <Box>
              <AccountingTopCard
                accountingStats={accountingStats}
                loading={false}
              />
            </Box>

            <Card>
              <Box>
                <SuperTableHeader
                  showAccountingPaymentStatus={true}
                  showTransactionTypeFilter
                  showStatusFilter={false}
                  companyRef={user?.company?._id}
                  locationRef={locationRef}
                  //   showExpenseTypeFilter
                  fromMiscExpense={true}
                  showPaymentMethodFilter
                  showUserFilter
                  showDeviceFilter
                  //   showStatusFilter={false}
                  onQueryChange={handleQueryChange}
                  onFiltersChange={handleFilterChange}
                  searchPlaceholder={t("Search with expenses/deposits")}
                  onSortChange={handleSortChange}
                  sort={sort}
                  sortOptions={sortOptions}
                />

                <SuperTable
                  isLoading={loading}
                  loaderComponent={ExpenseRowLoading}
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
                          <Typography
                            variant="h6"
                            textAlign="center"
                            sx={{ mt: 2 }}
                          >
                            {t("No Transaction!")}
                          </Typography>
                        }
                      />
                    </Box>
                  }
                />
              </Box>
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Accounting.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Accounting;
