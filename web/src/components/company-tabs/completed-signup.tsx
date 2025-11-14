import {
  Box,
  Card,
  Container,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { TransformedArrowIcon } from "src/components/TransformedIcons";
import { CompanyRowLoading } from "src/components/company/company-row-loading";
import ConfirmationDialog from "src/components/confirmation-dialog";
import { Seo } from "src/components/seo";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";

function CompletedSignupTab({ origin = "company" }) {
  const { t } = useTranslation();

  const router = useRouter();

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [filter, setFilter] = useState<any>([]);
  const [showDialogCustomerEvent, setShowDialogCustomerEvent] = useState(false);
  const [companyId, setCompanyId] = useState<any>("");

  const canAccess = usePermissionManager();

  const canUpdate = canAccess(MoleculeType["company:update"]);

  const { find, updateEntity, loading, entities } = useEntity("company");

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

  const handleStatusChange = async (id: string, checked: boolean) => {
    await updateEntity(id, {
      status: checked ? "active" : "inactive",
    });
  };

  const handleFilterChange = (changedFilter: any) => {
    setPage(0);
    setFilter(changedFilter);
  };

  const tableHeaders = [
    {
      key: "companyName",
      label: t("Company"),
    },
    {
      key: "businessType",
      label: t("Business Type"),
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
      key: "status",
      label: t("Status"),
    },
    {
      key: "action",
      label: t("Action"),
    },
  ];

  const lng = localStorage.getItem("currentLanguage");

  const transformedData = useMemo(() => {
    const arr: any[] = [];

    entities?.results?.map((d) => {
      arr.push({
        key: d?._id,
        _id: d?._id,
        companyName: (
          <Typography
            color="primary"
            sx={{
              minWidth: "150px",
              "&:hover": {
                cursor: "pointer",
              },
            }}
            onClick={() => {
              if (!canUpdate) {
                return toast.error(t("You don't have access"));
              }
              router.push({
                pathname: `${tijarahPaths?.platform?.companies}/${d?._id}`,
              });
            }}
          >
            {d?.name[lng] || d?.name?.en}
          </Typography>
        ),
        businessType: (
          <Typography variant="body2">{d?.businessType || "N/A"}</Typography>
        ),
        phone: <Typography variant="body2">{d?.phone || "N/A"}</Typography>,
        email: <Typography variant="body2">{d?.email || "N/A"}</Typography>,
        subscriptionExpiry: (
          <Typography variant="body2">
            {d?.subscriptionEndDate
              ? format(new Date(d?.subscriptionEndDate), "dd/MM/yyyy")
              : "N/A"}
          </Typography>
        ),
        status: (
          <FormControlLabel
            sx={{
              width: "120px",
              display: "flex",
              flexDirection: "row",
            }}
            control={
              <Switch
                checked={d?.status === "active" ? true : false}
                color="primary"
                edge="end"
                name="status"
                onChange={(e) => {
                  if (!canUpdate) {
                    return toast.error(t("You don't have access"));
                  }
                  if (d.status === "active") {
                    setShowDialogCustomerEvent(true);
                    setCompanyId(d._id);
                  } else {
                    handleStatusChange(d?._id, e.target.checked);
                  }
                }}
                value={d?.status === "active" ? true : false}
                sx={{
                  mr: 0.2,
                }}
              />
            }
            color={
              d?.status == "active"
                ? "success.main"
                : d?.status == "partiallyActive"
                ? "warning.main"
                : "error.main"
            }
            label={
              d?.status === "active"
                ? t("Active")
                : d?.status === "partiallyActive"
                ? t("Partially Active")
                : t("Deactivated")
            }
          />
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
                if (!canUpdate) {
                  return toast.error(t("You don't have access"));
                }
                router.push({
                  pathname: `${tijarahPaths?.platform?.companies}/${d?._id}`,
                });
              }}
              sx={{ mr: 1.5 }}
            >
              <TransformedArrowIcon name={"arrow-right"} />
            </IconButton>
          </Box>
        ),
      });
    });

    return arr;
  }, [entities?.results]);

  useEffect(() => {
    find({
      page: page,
      sort: sort,
      activeTab: filter?.status?.length > 0 ? filter?.status[0] : "all",
      limit: rowsPerPage,
      _q: debouncedQuery,
      subscription: filter?.expiry?.length > 0 ? filter?.expiry[0] : "all",
      nielsenReportEnabled:
        filter?.nielsen?.length > 0 ? filter?.nielsen[0] : "",
      zatcaEnabled:
        filter?.zatcaEnabled?.length > 0 ? filter?.zatcaEnabled[0] : "",
      businessTypeRefs:
        filter?.businessType?.length > 0 ? filter?.businessType : "",
    });
  }, [page, sort, debouncedQuery, rowsPerPage, filter]);

  if (!canAccess(MoleculeType["company:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Companies")}`} />
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
                <Typography variant="h4">{t("Companies")}</Typography>
                <Stack alignItems="center" direction="row" spacing={1}>
                  {/* <Button
                    disabled
                    color="inherit"
                    size="small"
                    startIcon={
                      <SvgIcon>
                        <Download01Icon />
                      </SvgIcon>
                    }>
                    {t("Export All")}
                  </Button> */}
                </Stack>
              </Stack>
            </Stack>
            <Card>
              <SuperTableHeader
                onQueryChange={handleQueryChange}
                onFiltersChange={handleFilterChange}
                showBusinessTypeFilter
                showLocationFilter={false}
                showExpiryFilter={true}
                showNielsenFilter={true}
                showZatcaFilter={true}
                searchPlaceholder={t(
                  "Search with Company Name / Phone / Email"
                )}
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
              <ConfirmationDialog
                show={showDialogCustomerEvent}
                toggle={() =>
                  setShowDialogCustomerEvent(!showDialogCustomerEvent)
                }
                onOk={(e: any) => {
                  handleStatusChange(companyId, e.target.checked);
                  setShowDialogCustomerEvent(false);
                }}
                okButtonText={`${t("Yes")}, ${t("Deactivate")}`}
                cancelButtonText={t("Cancel")}
                title={t("Confirmation")}
                text={t(
                  "Before deactivating this company, please be aware that all active locations, devices and users will be decativated. Do you still wish to proceed with deactivation?"
                )}
              />
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

CompletedSignupTab.getLayout = (page: any) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default CompletedSignupTab;
