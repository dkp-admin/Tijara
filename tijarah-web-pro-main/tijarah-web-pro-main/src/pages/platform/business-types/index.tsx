import {
  Box,
  Button,
  Card,
  Container,
  FormControlLabel,
  IconButton,
  Stack,
  SvgIcon,
  Switch,
  Typography,
} from "@mui/material";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { TransformedArrowIcon } from "src/components/TransformedIcons";
import { BusinessTypesRowLoading } from "src/components/business-types/business-types-row-loading";
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
import type { Page as PageType } from "src/types/page";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";

interface statusFilter {
  status?: string[];
}

const BusinessTypes: PageType = () => {
  const { t } = useTranslation();

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);

  const canAccess = usePermissionManager();

  const canUpdate = canAccess(MoleculeType["business-type:update"]);
  const canCreate = canAccess(MoleculeType["business-type:create"]);
  const router = useRouter();

  const [filter, setFilter] = useState<any>([]);

  const { find, updateEntity, loading, entities } = useEntity("business-type");

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
    setFilter(changedFilter);
  };

  const tableHeaders = [
    {
      key: "businessType",
      label: t("Business Type"),
    },
    {
      key: "industry",
      label: t("Industry"),
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
    let arr: any[] = [];
    entities?.results?.map((d: any) => {
      arr.push({
        key: d?._id,
        _id: d?._id,
        businessType: (
          <Typography color="inherit" variant="subtitle2">
            {d?.name[lng] || d?.name?.en}
          </Typography>
        ),
        industry: (
          <Typography variant="body2">{d?.industry || "NA"}</Typography>
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
            }}
          >
            <IconButton
              onClick={() => {
                router.push({
                  pathname: tijarahPaths?.platform?.businessTypes?.create,
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

  useEffect(() => {
    find({
      page: page,
      sort: sort,
      activeTab: filter?.status?.length > 0 ? filter?.status[0] : "all",
      limit: rowsPerPage,
      _q: debouncedQuery,
      industry: filter?.industry?.length > 0 ? filter?.industry[0] : "",
    });
  }, [page, sort, debouncedQuery, rowsPerPage, filter]);

  if (!canAccess(MoleculeType["business-type:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Business Types")}`} />
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
                <Typography variant="h4">{t("Business Types")}</Typography>

                {/* <Stack alignItems="center" direction="row" spacing={1}>
                  <Button
                    color="inherit"
                    size="small"
                    startIcon={
                      <SvgIcon>
                        <Download01Icon />
                      </SvgIcon>
                    }
                    onClick={() => exportAll("/export/business-type")}>
                    {t("Export All")}
                  </Button>
                </Stack> */}
              </Stack>
              <Stack alignItems="center" direction="row" spacing={3}>
                <Button
                  onClick={() => {
                    if (!canCreate) {
                      return toast.error(t("You don't have access"));
                    }
                    router.push({
                      pathname: tijarahPaths?.platform?.businessTypes?.create,
                    });
                  }}
                  startIcon={
                    <SvgIcon>
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                >
                  {t("Create")}
                </Button>
              </Stack>
            </Stack>
            <Card>
              <SuperTableHeader
                showIndustryFilter
                onQueryChange={handleQueryChange}
                onFiltersChange={handleFilterChange}
                searchPlaceholder={t("Search with Business Type")}
                onSortChange={handleSortChange}
                sort={sort}
                sortOptions={sortOptions}
              />

              <SuperTable
                isLoading={loading}
                loaderComponent={BusinessTypesRowLoading}
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
                          {t("No Business Types!")}
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

BusinessTypes.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default BusinessTypes;
