import {
  Avatar,
  Box,
  Button,
  Card,
  Container,
  FormControlLabel,
  Grid,
  IconButton,
  SvgIcon,
  Switch,
  Typography,
} from "@mui/material";
import ArrowRightIcon from "@untitled-ui/icons-react/build/esm/ArrowRight";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BrandsRowLoading } from "src/components/brands/brands-row-loading";
import { RouterLink } from "src/components/router-link";
import { Seo } from "src/components/seo";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import { tijarahPaths } from "src/paths";
import type { Page as PageType } from "src/types/page";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import UpgradePackage from "src/pages/upgrade-package";

const Brands: PageType = () => {
  const { t } = useTranslation();

  const [isCancelAllClicked] = useState(false);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [queryText, setQueryText] = useState<string>("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const { find, updateEntity, loading, entities } = useEntity("brands");

  usePageView();

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
      arr.push({
        key: d?._id,
        _id: d?._id,
        brand: (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
            }}
          >
            <Avatar
              src={d?.logo || ""}
              sx={{
                height: 42,
                width: 42,
              }}
            />
            <Box sx={{ ml: 1, textAlign: "start" }}>
              <Typography color="inherit" variant="subtitle2">
                {d?.name?.en}
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
            }}
          >
            <IconButton
              component={RouterLink}
              sx={{ mr: 1.5 }}
              href={`${tijarahPaths?.catalogue?.brands?.create}?id=${d?._id}`}
            >
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
      key: "brand",
      label: t("Brand"),
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

  useEffect(() => {
    find({
      page: page,
      sort: sort,
      activeTab: "all",
      limit: rowsPerPage,
      _q: debouncedQuery,
    });
  }, [page, sort, debouncedQuery, rowsPerPage]);

  return (
    <>
      <Seo title={`${t("Brands")}`} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 4,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item>
                <Typography variant="h4">{t("Brands")}</Typography>
              </Grid>
              {/* <Restricted permission={MoleculeType["coupon:create"]}> */}
              <Grid item>
                <Button
                  component={RouterLink}
                  href={tijarahPaths?.catalogue?.brands?.create}
                  startIcon={
                    <SvgIcon>
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                >
                  {t("Create")}
                </Button>
              </Grid>
              {/* </Restricted> */}
            </Grid>
          </Box>
          <Card>
            <Box>
              <SuperTableHeader
                onQueryChange={handleQueryChange}
                onFiltersChange={() => {}}
                showLocationFilter
                searchPlaceholder={t("Search using Brands")}
                onSortChange={handleSortChange}
                sort={sort}
                sortOptions={sortOptions}
              />

              <SuperTable
                isLoading={loading}
                loaderComponent={BrandsRowLoading}
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
                          {t("No Brands!")}
                        </Typography>
                      }
                    />
                  </Box>
                }
              />
            </Box>
          </Card>
        </Container>
      </Box>
    </>
  );
};

Brands.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Brands;
