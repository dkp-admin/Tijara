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
import { ChangeEvent, useEffect, useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { TransformedArrowIcon } from "src/components/TransformedIcons";
import ConfirmationDialog from "src/components/confirmation-dialog";
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
import { SubscriptionRowLoading } from "./row-loading";
import { useQueryClient } from "react-query";

function SubscriptionsListTab() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const router = useRouter();

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [filter, setFilter] = useState<any>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<any>("");

  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["subscription:update"]);
  const { find, loading, entities } = useEntity("subscription");
  const { updateEntity: updateStatus } = useEntity("subscription/status");
  const { find: findPackages, entities: packagesData } = useEntity("package");

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

  const handleStatusChange = async (id: string, checked: boolean) => {
    await updateStatus(id, { status: checked ? "active" : "inactive" });
    queryClient.invalidateQueries("find-subscription");
  };

  const handleFilterChange = (changedFilter: any) => {
    setPage(0);
    setFilter(changedFilter);
  };

  const tableHeaders = [
    { key: "companyName", label: t("Company") },
    { key: "package", label: t("Package") },
    { key: "startDate", label: t("Start Date") },
    { key: "endDate", label: t("End Date") },
    { key: "status", label: t("Status") },
    { key: "paymentStatus", label: t("Payment") },
    { key: "action", label: t("Action") },
  ];

  const transformedData = useMemo(() => {
    return (
      entities?.results?.map((d) => ({
        key: d?._id,
        _id: d?._id,
        companyName: (
          <Typography variant="body2">{d?.company?.name || "N/A"}</Typography>
        ),
        package: (
          <Typography variant="body2">{d?.package?.en || "N/A"}</Typography>
        ),
        startDate: (
          <Typography variant="body2">
            {d?.subscriptionStartDate
              ? format(new Date(d.subscriptionStartDate), "dd/MM/yyyy")
              : "N/A"}
          </Typography>
        ),
        endDate: (
          <Typography variant="body2">
            {d?.subscriptionEndDate
              ? format(new Date(d.subscriptionEndDate), "dd/MM/yyyy")
              : "N/A"}
          </Typography>
        ),
        status: (
          <FormControlLabel
            sx={{ width: "120px", display: "flex", flexDirection: "row" }}
            control={
              <Switch
                checked={d?.status === "active"}
                onChange={(e) => {
                  if (!canUpdate)
                    return toast.error(t("You don't have access"));
                  if (d.status === "active") {
                    setShowDialog(true);
                    setSubscriptionId(d._id);
                  } else {
                    handleStatusChange(d._id, e.target.checked);
                  }
                }}
                color="primary"
              />
            }
            label={d?.status === "active" ? t("Active") : t("Inactive")}
          />
        ),
        paymentStatus: (
          <Typography
            variant="body2"
            color={
              d?.isTrial
                ? "warning.main"
                : d?.paymentStatus === "paid"
                ? "success.main"
                : "error.main"
            }
            sx={{ textTransform: "capitalize" }}
          >
            {d?.isTrial
              ? t("Trial")
              : `${t(d?.paymentStatus || "N/A") || "N/A"}`}
          </Typography>
        ),
        action: (
          <Box sx={{ display: "flex", justifyContent: "end" }}>
            <IconButton
              onClick={() => {
                if (!canUpdate) return toast.error(t("You don't have access"));
                router.push(
                  `${tijarahPaths?.platform?.subscriptions.index}/${d?._id}`
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
    findPackages({
      activeTab: "active",
      limit: 100,
      page: 0,
      sort: "desc",
    });
  }, []);

  const paymentStatusOptions = [
    { label: t("Paid"), value: "paid" },
    { label: t("Unpaid"), value: "unpaid" },
    { label: t("Trial"), value: "trial" },
  ];

  useEffect(() => {
    find({
      page,
      sort,
      limit: rowsPerPage,
      _q: debouncedQuery,
      activeTab: filter?.status?.length > 0 ? filter.status[0] : "all",
      packageRef: filter?.package?.length > 0 ? filter.package[0] : undefined,
      paymentStatus:
        filter?.paymentStatus?.length > 0 ? filter.paymentStatus[0] : undefined,
    });
  }, [page, sort, debouncedQuery, rowsPerPage, filter]);

  if (!canAccess(MoleculeType["package:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Subscriptions")}`} />
      <Box component="main" sx={{ flexGrow: 1, py: 2, mb: 4 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Typography variant="h4">{t("Subscriptions")}</Typography>
            <Card>
              <SuperTableHeader
                onQueryChange={handleQueryChange}
                onFiltersChange={handleFilterChange}
                showLocationFilter={false}
                showExpiryFilter={false}
                showPackageNameFilter={true}
                showPaymentStatusFilter={true}
                searchPlaceholder={t("Search subscriptions...")}
                onSortChange={handleSortChange}
                sort={sort}
                sortOptions={sortOptions}
                packageOptions={
                  packagesData?.results?.map((pkg) => ({
                    label: pkg.name.en,
                    value: pkg._id,
                  })) || []
                }
                paymentStatusOptions={paymentStatusOptions}
              />
              <SuperTable
                isLoading={loading}
                items={transformedData as any}
                headers={tableHeaders}
                loaderComponent={SubscriptionRowLoading}
                total={entities?.total || 0}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPage={rowsPerPage}
                page={page}
                noDataPlaceholder={<NoDataAnimation />}
              />
              <ConfirmationDialog
                show={showDialog}
                toggle={() => setShowDialog(!showDialog)}
                onOk={(e: any) => {
                  handleStatusChange(subscriptionId, false);
                  setShowDialog(false);
                }}
                okButtonText={`${t("Yes")}, ${t("Deactivate")}`}
                cancelButtonText={t("Cancel")}
                title={t("Confirmation")}
                text={t(
                  "Are you sure you want to deactivate this subscription?"
                )}
              />
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

export default SubscriptionsListTab;
