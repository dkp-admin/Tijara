import {
  Box,
  Card,
  FormControlLabel,
  IconButton,
  Switch,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { TransformedArrowIcon } from "src/components/TransformedIcons";
import { PaymentTypesRowLoading } from "src/components/payment-types/payment-types-row-loading";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { useRouter } from "next/router";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";

interface PaymentTypesProps {
  _id: string;
  name: {
    en: string;
    ar: string;
  };
  status: string;
}

export const PaymentTypesTableCard: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);

  const canAccess = usePermissionManager();

  const canUpdate = canAccess(MoleculeType["payment-type:update"]);

  const [filter, setFilter] = useState<any>([]);

  const { find, updateEntity, loading, entities } = useEntity("payment-type");

  usePageView();

  const handlePageChange = useCallback((newPage: number): void => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setRowsPerPage(parseInt(event.target.value, 10));
    },
    []
  );

  const handleQueryChange = useCallback((value: string): void => {
    setQueryText(value);
    setPage(0);
  }, []);

  const handleSortChange = useCallback((value: string): void => {
    setSort(value as Sort);
  }, []);

  const handleFilterChange = useCallback((value: any): void => {
    setFilter(value);
    setPage(0);
  }, []);

  const handleStatusChange = useCallback(
    async (id: string, checked: boolean): Promise<void> => {
      const newStatus = checked ? "active" : "inactive";
      await updateEntity(id, { status: newStatus });
    },
    []
  );

  useEffect(() => {
    find({
      page: page,
      limit: rowsPerPage,
      _q: debouncedQuery,
      sort: sort,
      activeTab: filter?.status?.length > 0 ? filter?.status[0] : "all",
    });
  }, [page, rowsPerPage, debouncedQuery, sort, filter?.activeTab]);

  const tableHeaders = useMemo(
    () => [
      {
        key: "name",
        label: t("Payment Type Name"),
        sortable: true,
      },
      {
        key: "status",
        label: t("Status"),
        sortable: true,
      },
      {
        key: "action",
        label: t("Actions"),
        sortable: false,
      },
    ],
    []
  );

  const transformedData = useMemo(() => {
    return entities?.results?.map((paymentType: PaymentTypesProps) => ({
      _id: paymentType._id,
      disableCheckbox: false,
      industry: null as any,
      name: (
        <Box>
          <Typography variant="subtitle2">
            {paymentType.name?.en || "-"}
          </Typography>
        </Box>
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
              checked={paymentType.status === "active" ? true : false}
              color="primary"
              edge="end"
              name="status"
              onChange={(e) => {
                if (!canUpdate) {
                  return toast.error(t("You don't have access"));
                }
                handleStatusChange(paymentType._id, e.target.checked);
              }}
              value={paymentType.status === "active" ? true : false}
              sx={{
                mr: 0.2,
              }}
            />
          }
          label={
            paymentType.status === "active" ? t("Active") : t("Deactivated")
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
            onClick={(e) => {
              router.push({
                pathname: tijarahPaths?.platform?.paymentTypes?.create,
                query: {
                  id: paymentType._id,
                },
              });
            }}
            sx={{ mr: 1.5 }}
          >
            <TransformedArrowIcon name="arrow-right" />
          </IconButton>
        </Box>
      ),
    }));
  }, [entities?.results, canUpdate, handleStatusChange, router, t]);

  return (
    <Card>
      <SuperTableHeader
        showStatusFilter
        onQueryChange={handleQueryChange}
        onFiltersChange={handleFilterChange}
        searchPlaceholder={t("Search payment types...")}
        onSortChange={handleSortChange}
        sort={sort}
        sortOptions={sortOptions}
      />

      <SuperTable
        isLoading={loading}
        loaderComponent={PaymentTypesRowLoading}
        items={transformedData as any}
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
                  {t("No Payment Types!")}
                </Typography>
              }
            />
          </Box>
        }
      />
    </Card>
  );
};
