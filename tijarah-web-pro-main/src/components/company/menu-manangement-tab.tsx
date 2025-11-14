import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  SvgIcon,
  Switch,
  Typography,
} from "@mui/material";
import Download01Icon from "@untitled-ui/icons-react/build/esm/Download01";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { useRouter } from "next/router";
import { ChangeEvent, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { CompanyContext } from "src/contexts/company-context";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { usePageView } from "src/hooks/use-page-view";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import useExportAll from "src/utils/export-all";
import { LocationsTableCard } from "../locations/locations-table-card";
import withPermission from "../permissionManager/restrict-page";
import ExportButton from "../custom-button/custom-export-button";
import { SuperTableHeader } from "../widgets/super-table-header";
import { SuperTable } from "../widgets/super-table";
import { sortOptions } from "src/utils/constants";
import { Sort } from "src/types/sortoption";
import { useEntity } from "src/hooks/use-entity";
import { RouterLink } from "../router-link";
import ArrowRightIcon from "@untitled-ui/icons-react/build/esm/ArrowRight";
import { MenuRowLoading } from "../menu-management/menu-management-row-loading";
import NoDataAnimation from "../widgets/animations/NoDataAnimation";
import { useDebounce } from "use-debounce";

function MenuManagementTab({ origin = "company" }) {
  const [isCancelAllClicked] = useState(false);
  const { t } = useTranslation();
  const companyContext = useContext<any>(CompanyContext);
  const router = useRouter();
  const companyRef = companyContext?._id;
  const { exportCsv } = useExportAll({ companyRef });
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [queryText, setQueryText] = useState<string>("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const canAccess = usePermissionManager();
  console.log("origin", origin);

  const canCreate =
    canAccess(MoleculeType["location:create"]) ||
    canAccess(MoleculeType["location:manage"]);

  const { find, updateEntity, loading, entities } =
    useEntity("menu-management");

  const handleQueryChange = (value: string): void => {
    if (value != undefined) {
      setQueryText(value);
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

  const handleStatusChange = async (id: string, checked: boolean) => {
    await updateEntity(id, {
      status: checked ? "active" : "inactive",
    });
  };

  const transformedData = useMemo(() => {
    let arr: any[] = [];

    entities?.results?.map((d: any) => {
      const productCount = d?.products?.length;

      arr.push({
        key: d?._id,
        _id: d?._id,
        location: (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
            }}>
            <Box sx={{ ml: 1, textAlign: "start" }}>
              <Typography color="inherit" variant="subtitle2">
                {d?.location?.name}
              </Typography>
            </Box>
          </Box>
        ),
        orderType: (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
            }}>
            <Box sx={{ ml: 1, textAlign: "start" }}>
              <Typography color="inherit" variant="subtitle2">
                {d?.orderType}
              </Typography>
            </Box>
          </Box>
        ),
        productCount: (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
            }}>
            <Box sx={{ ml: 1, textAlign: "start" }}>
              <Typography color="inherit" variant="subtitle2">
                {productCount}
              </Typography>
            </Box>
          </Box>
        ),
        categoryCount: (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
            }}>
            <Box sx={{ ml: 1, textAlign: "start" }}>
              <Typography color="inherit" variant="subtitle2">
                {d?.categories.length}
              </Typography>
            </Box>
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
                checked={d?.status === "active" ? true : false}
                color="primary"
                edge="end"
                name="status"
                onChange={(e) => {
                  handleStatusChange(d?._id, e.target.checked);
                }}
                value={d?.status === "active" ? true : false}
                sx={{
                  mr: 0.2,
                }}
              />
            }
            label={d?.status === "active" ? t("Active") : t("Deactivated")}
          />
        ),
        action: (
          <Box
            sx={{
              display: "flex",
              justifyContent: "end",
            }}>
            <IconButton
              onClick={() => {
                router.push({
                  pathname: tijarahPaths?.catalogue?.menu?.create,
                  query: {
                    id: d?._id,
                    companyRef: companyContext?._id,
                    companyName: companyContext?.name?.en,
                    origin: origin,
                  },
                });
              }}
              sx={{ mr: 1.5 }}>
              <SvgIcon>
                <ArrowRightIcon />
              </SvgIcon>
            </IconButton>
          </Box>
        ),
      });
    });

    return arr;
  }, [entities?.results]);

  const tableHeaders = [
    {
      key: "location",
      label: t("Location"),
    },
    {
      key: "orderType",
      label: t("Order type"),
    },
    {
      key: "productCount",
      label: t("Product count"),
    },
    {
      key: "categoryCount",
      label: t("Category count"),
    },

    {
      key: "action",
      label: t("Action"),
    },
  ];

  useEffect(() => {
    if (companyContext?._id) {
      find({
        page: page,
        sort: sort,
        activeTab: "all",
        limit: rowsPerPage,
        _q: debouncedQuery,
        companyRef: companyContext?._id?.toString(),
      });
    }
  }, [page, sort, debouncedQuery, rowsPerPage, companyContext]);

  usePageView();

  return (
    <>
      <Card sx={{ my: 4 }}>
        <CardContent>
          <Grid container>
            <Grid xs={12} md={8}>
              <Stack spacing={1}>
                <Typography variant="h6">{t("Create Menu")}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {t("Menu can be managed here")}
                </Typography>
              </Stack>
            </Grid>
            <Grid xs={12} md={4}>
              <Stack
                alignItems="center"
                justifyContent="flex-end"
                direction="row"
                spacing={3}>
                {/* <ExportButton
                  onClick={(type: string) => {
                    exportCsv("/export/location", type, "location");
                  }}
                /> */}
                <Button
                  onClick={() => {
                    if (!canCreate) {
                      return toast.error(t("You don't have access"));
                    }
                    router.push({
                      pathname: tijarahPaths?.catalogue.menu.create,
                      query: {
                        companyRef: companyContext?._id,
                        companyName: companyContext?.name?.en,
                        origin: origin,
                      },
                    });
                  }}
                  startIcon={
                    <SvgIcon>
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained">
                  {t("Create")}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>

        <Divider />
        <Divider />

        <Box>
          <SuperTableHeader
            onQueryChange={handleQueryChange}
            onFiltersChange={() => {}}
            showStatusFilter={false}
            searchPlaceholder={t("Search using locations and order type")}
            onSortChange={handleSortChange}
            sort={sort}
            sortOptions={sortOptions}
          />

          <SuperTable
            isLoading={loading}
            loaderComponent={MenuRowLoading}
            items={transformedData}
            headers={tableHeaders}
            total={entities?.total || 0}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPage={rowsPerPage}
            page={page}
            noDataPlaceholder={
              <Box sx={{ mt: 6, mb: 4 }}>
                <NoDataAnimation
                  text={
                    <Typography variant="h6" textAlign="center" sx={{ mt: 2 }}>
                      {t("No Menu!")}
                    </Typography>
                  }
                />
              </Box>
            }
          />
        </Box>
      </Card>
    </>
  );
}

export default withPermission(MenuManagementTab, MoleculeType["location:read"]);
