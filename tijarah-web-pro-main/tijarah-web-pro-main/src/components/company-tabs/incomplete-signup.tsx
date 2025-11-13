import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import {
  Box,
  Button,
  Card,
  Container,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { endOfDay, format, startOfDay } from "date-fns";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CompanyRowLoading } from "src/components/company/company-row-loading";
import { Seo } from "src/components/seo";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import { MoleculeType } from "src/permissionManager";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";
import CustomDateFilter from "../custom-date-filter/custom-date-filter";
import SubscriptionModal from "./subscription-modal";

function IncompleteSignupTab({ origin = "company" }) {
  const { t } = useTranslation();

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [filter, setFilter] = useState<any>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<any>();
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [reset, setReset] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const canAccess = usePermissionManager();

  const { find, loading, entities } = useEntity("user/find-by-onboarding");

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
    setFilter(changedFilter);
  };

  const tableHeaders = [
    {
      key: "userName",
      label: t("User Name"),
    },
    {
      key: "phone",
      label: t("Phone"),
    },
    {
      key: "email",
      label: t("Email"),
    },
    {
      key: "subscriptionExpiry",
      label: t("Subscription Expiry"),
    },
    {
      key: "action",
      label: "",
    },
  ];

  const lng = localStorage.getItem("currentLanguage");

  const transformedData = useMemo(() => {
    const arr: any[] = [];

    entities?.results?.map((d) => {
      arr.push({
        key: d?._id,
        _id: d?._id,
        userName: (
          <Typography
            color="primary"
            sx={{
              minWidth: "150px",
            }}
          >
            {d?.name[lng] || d?.name}
          </Typography>
        ),
        phone: <Typography variant="body2">{d?.phone || "N/A"}</Typography>,
        email: <Typography variant="body2">{d?.email || "N/A"}</Typography>,
        subscriptionExpiry: (
          <Typography variant="body2">
            {d?.subscription?.subscriptionEndDate
              ? format(
                  new Date(d?.subscription?.subscriptionEndDate),
                  "dd/MM/yyyy"
                )
              : "N/A"}
          </Typography>
        ),
        action: (
          <Button
            onClick={() => {
              setModalData(d?.subscription);
              setShowModal(true);
            }}
          >
            {"View"}
          </Button>
        ),
      });
    });

    return arr;
  }, [entities?.results]);

  const getQuery = () => {
    const query: any = {
      page: page,
      sort: sort,
      activeTab: filter?.status?.length > 0 ? filter?.status[0] : "all",
      limit: rowsPerPage,
      _q: debouncedQuery,
      packageName: filter?.package?.length > 0 ? filter?.package[0] : "",
      paymentStatus:
        filter?.paymentStatus?.length > 0 ? filter?.paymentStatus[0] : "",
      onboarded: false,
    };

    if (startDate && endDate) {
      query["dateRange"] = {
        from: startOfDay(startDate),
        to: endOfDay(endDate),
      };
    }

    return query;
  };

  useEffect(() => {
    find({
      ...getQuery(),
    });
  }, [page, sort, debouncedQuery, rowsPerPage, filter, startDate, endDate]);

  if (!canAccess(MoleculeType["company:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Incomplete Signups")}`} />
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
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">{t("Incomplete Signups")}</Typography>
              </Stack>
            </Stack>

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
                        setStartDate(new Date());
                        setEndDate(new Date());
                        setShowButton(false);
                      }}
                    >
                      <AutorenewRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Stack>
            </Box>
            <Card>
              <SuperTableHeader
                showPackageNameFilter={true}
                showPaymentStatusFilter={true}
                showStatusFilter={false}
                onQueryChange={handleQueryChange}
                onFiltersChange={handleFilterChange}
                searchPlaceholder={t("Search with User Name / Phone ")}
                onSortChange={handleSortChange}
                sort={sort}
                sortOptions={sortOptions}
              />

              <SuperTable
                isLoading={loading}
                loaderComponent={CompanyRowLoading}
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
                          {t("No Companies!")}
                        </Typography>
                      }
                    />
                  </Box>
                }
              />
            </Card>
            <SubscriptionModal
              open={showModal}
              data={modalData}
              handleClose={(val: any) => {
                setShowModal(val);
              }}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
}

IncompleteSignupTab.getLayout = (page: any) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default IncompleteSignupTab;
