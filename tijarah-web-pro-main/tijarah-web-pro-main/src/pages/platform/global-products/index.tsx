import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Link,
  Menu,
  MenuItem,
  Stack,
  SvgIcon,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import Download01Icon from "@untitled-ui/icons-react/build/esm/Download01";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import Upload01Icon from "@untitled-ui/icons-react/build/esm/Upload01";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ExportButton from "src/components/custom-button/custom-export-button";
import ImportMessage from "src/components/import-message";
import { GlobalProductsRowLoading } from "src/components/modals/platform/global-products/global-product-row-loading";
import withPermission from "src/components/permissionManager/restrict-page";
import { GlobalProductListSearch } from "src/components/platform/product/global-product-list-search";
import { GlobalProductListTable } from "src/components/platform/product/global-products-list-table";
import { Seo } from "src/components/seo";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import withDashboardLayout from "src/components/withDashboardLayout/withDashboardLayout";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import useImport from "src/hooks/useImport";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { green } from "src/theme/colors";
import type { Page as PageType } from "src/types/page";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import useExportProduct from "src/utils/export-product";
import { useDebounce } from "use-debounce";
import NoPermission from "src/pages/no-permission";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import { ImportExportModal } from "src/components/modals/inport-export-modal";
import { useAuth } from "src/hooks/use-auth";

const Page: PageType = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { exportCsv } = useExportProduct({});
  const [showDialogCustomerEvent, setShowDialogCustomerEvent] = useState(false);
  const [importEntity, setImportEntity] = useState("");
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [sortUpdate, setSortUpdate] = useState<Sort>(sortOptions[0].value);
  const [queryText, setQueryText] = useState("");
  const [queryTextUpdate, setQueryTextUpdate] = useState("");
  const [page, setPage] = useState<number>(0);
  const [pageUpdate, setPageUpdate] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [rowsPerPageUpdate, setRowsPerPageUpdate] = useState<number>(10);
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [debouncedQueryUpdate] = useDebounce(queryTextUpdate, 500);
  const theme = useTheme();
  const [openImportExportModal, setOpenImportExportModal] = useState(false);

  const canAccess = usePermissionManager();

  const canCreate = canAccess(MoleculeType["global-product:create"]);
  const canImport = canAccess(MoleculeType["global-product:import"]);

  const router = useRouter();

  const [filter, setFilter] = useState<any>([]);
  const [filterUpdate, setFilterUpdate] = useState<any>([]);

  const { importCsv, response } = useImport({ importEntity });

  const { find, updateEntity, loading, entities } =
    useEntity("global-products");
  const {
    find: findUpdate,
    loading: loadingUpdate,
    entities: entitiesUpdate,
  } = useEntity("updated-product");

  usePageView();

  const [tabValue, setTabValue] = useState(0);

  const handleChange = (event: any, newValue: any) => {
    setTabValue(newValue);
  };

  const [actions, setActions] = useState<null | HTMLElement>(null);
  const [actionsExport, setActionsExport] = useState<null | HTMLElement>(null);
  const handleActionsClick = (event: React.MouseEvent<HTMLElement>) => {
    setActions(event.currentTarget);
  };
  const handleExportActionsClick = (event: React.MouseEvent<HTMLElement>) => {
    setActionsExport(event.currentTarget);
  };

  const handleActionsClose = () => {
    setActions(null);
  };
  const handleExportActionsClose = () => {
    setActionsExport(null);
  };

  const handleImport = (entity: string) => {
    if (!canImport) {
      return toast.error(t("You don't have access"));
    }

    switch (entity) {
      case "globalProducts":
        setImportEntity("globalProducts");
        break;
      case "boxes":
        setImportEntity("boxes");
        break;
      default:
        setImportEntity("");
        break;
    }

    document.getElementById("fileInput").click();
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };
  const handleRowsPerPageChangeUpdate = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPageUpdate(0);
    setRowsPerPageUpdate(parseInt(event.target.value, 10));
  };

  const handleQueryChange = (value: string): void => {
    if (value != undefined) {
      setQueryText(value);
      if (page > 0) {
        setPage(0);
      }
    }
  };
  const handleQueryChangeUpdate = (value: string): void => {
    if (value != undefined) {
      setQueryTextUpdate(value);
      if (page > 0) {
        setPageUpdate(0);
      }
    }
  };

  const handlePageChange = (event: any, newPage: number): void => {
    setPage(newPage);
  };
  const handlePageChangeUpdate = (event: any, newPage: number): void => {
    setPageUpdate(newPage);
  };

  const handleSortChange = (value: any) => {
    setSort(value);
  };
  const handleSortChangeUpdate = (value: any) => {
    setSortUpdate(value);
  };

  const handleFilterChange = (changedFilter: any) => {
    setPage(0);
    setFilter(changedFilter);
  };
  const handleFilterChangeUpdate = (changedFilter: any) => {
    setPageUpdate(0);
    setFilterUpdate(changedFilter);
  };

  useEffect(() => {
    find({
      page: page,
      sort: sort,
      activeTab: filter?.status?.length > 0 ? filter.status[0] : "all",
      update: filter?.update?.[0],
      limit: rowsPerPage,
      _q: debouncedQuery,
      categoryRefs: filter?.category,
      businessTypeRefs: filter?.businessType,
      brandRefs: filter?.brand,
    });
  }, [page, sort, debouncedQuery, rowsPerPage, filter]);
  useEffect(() => {
    findUpdate({
      page: pageUpdate,
      sort: sortUpdate,
      activeTab:
        filterUpdate?.status?.length > 0 ? filterUpdate.status[0] : "all",
      limit: rowsPerPageUpdate,
      _q: debouncedQueryUpdate,
      categoryRefs: filterUpdate?.category,
      businessTypeRefs: filterUpdate?.businessType,
      brandRefs: filterUpdate?.brand,
      updatedBy: "ADMIN",
    });
  }, [
    pageUpdate,
    sortUpdate,
    debouncedQueryUpdate,
    rowsPerPageUpdate,
    filterUpdate,
  ]);

  if (!canAccess(MoleculeType["global-product:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Global Products")}`} />
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
                  <Typography variant="h4">{t("Global Products")}</Typography>
                  <Button
                    variant="text"
                    color="inherit"
                    endIcon={<ArrowDropDownIcon fontSize="small" />}
                    onClick={handleActionsClick}
                    sx={{ m: 1 }}
                    data-testid="add"
                  >
                    {t("Import")}
                  </Button>
                  <Button
                    variant="text"
                    color="inherit"
                    endIcon={<ArrowDropDownIcon fontSize="small" />}
                    onClick={handleExportActionsClick}
                    sx={{ m: 1 }}
                    data-testid="add"
                  >
                    {t("Export")}
                  </Button>

                  <Menu
                    anchorEl={actions}
                    keepMounted
                    open={Boolean(actions)}
                    onClose={handleActionsClose}
                  >
                    <MenuItem sx={{ px: 4, py: 0.5 }}>
                      <Button
                        sx={{
                          width: 150,
                        }}
                        color="inherit"
                        size="small"
                        onClick={() => handleImport("globalProducts")}
                        startIcon={
                          <SvgIcon>
                            <Upload01Icon />
                          </SvgIcon>
                        }
                      >
                        {t("Products")}
                      </Button>
                    </MenuItem>
                    <MenuItem sx={{ px: 4, py: 0.5 }}>
                      <Button
                        sx={{
                          width: 150,
                        }}
                        color="inherit"
                        size="small"
                        onClick={() => handleImport("boxes")}
                        startIcon={
                          <SvgIcon>
                            <Upload01Icon />
                          </SvgIcon>
                        }
                      >
                        {t("Boxes")}
                      </Button>
                    </MenuItem>

                    <input
                      accept=".xlsx"
                      type={"file"}
                      id="fileInput"
                      onChange={async (e) => {
                        try {
                          setOpenImportExportModal(true);
                          await importCsv(e.target.files[0]);
                        } catch (error) {
                          console.log(error);
                          toast.error(`${t("Something went wrong")}`);
                        }
                      }}
                      style={{ display: "none" }}
                    />
                  </Menu>
                  <Menu
                    anchorEl={actionsExport}
                    keepMounted
                    open={Boolean(actionsExport)}
                    onClose={handleExportActionsClose}
                  >
                    <MenuItem sx={{ px: 4, py: 0.5 }}>
                      <ExportButton
                        onClick={(type: string) => {
                          exportCsv(
                            "/export/global-product",
                            type,
                            "global-products"
                          );
                        }}
                        title={"Products"}
                      />
                    </MenuItem>
                    <MenuItem sx={{ px: 4, py: 0.5 }}>
                      <ExportButton
                        onClick={(type: string) => {
                          exportCsv("/export/boxes", type, "boxes");
                        }}
                        title={"Boxes"}
                      />
                    </MenuItem>
                  </Menu>
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
                    if (!canCreate) {
                      return toast.error("You don't have access");
                    }
                    router.push({
                      pathname: tijarahPaths?.platform?.globalProducts?.create,
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
                    {t("Create")}
                  </Typography>
                </Button>
              </Stack>
            </Stack>
            <Box
              sx={{
                backgroundColor:
                  theme.palette.mode !== "dark"
                    ? `${green.light}`
                    : "neutral.900",
                py: 1,
                pl: 2.5,
                pr: 2,
                display: "flex",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <SvgIcon fontSize="small">
                  <InfoTwoToneIcon color="primary" />
                </SvgIcon>
                <Typography
                  variant="body2"
                  color="gray"
                  sx={{
                    fontSize: "13px",
                    fontWeight: "bold",
                    pl: 0.7,
                  }}
                >
                  {t("Note: ")}
                </Typography>

                <Typography
                  variant="body2"
                  color="gray"
                  sx={{ fontSize: "13px", pl: 0.5 }}
                >
                  {t(
                    " You can import upto 15000 Global Products at a time. Only .xlsx files can be imported, here you can"
                  )}
                  <Link
                    target="_blank"
                    href="https://docs.google.com/spreadsheets/d/1GxjatmNy8o8JnqX37FdFk42GPzp1oI_oLYuF5_AkDSw/edit?usp=sharing"
                    variant="body2"
                    color="InfoText"
                    sx={{ fontSize: "13px", pl: 0.5, diaplay: "inline" }}
                  >
                    {t("download")}
                  </Link>

                  {t(" the sample File")}
                </Typography>
              </Box>
            </Box>
            <div>
              <Tabs
                value={tabValue}
                onChange={handleChange}
                aria-label="Global Product"
                sx={{ px: 1 }}
              >
                <Tab label="All" />
                <Tab label="Merchant Updated" />
              </Tabs>
              <Divider />
            </div>
            {tabValue === 0 && (
              <Card>
                <GlobalProductListSearch
                  onQueryChange={handleQueryChange}
                  onFiltersChange={handleFilterChange}
                  searchPlaceholder={t("Search with global products/SKU")}
                  onSortChange={handleSortChange}
                  showBusinessTypeFilter={true}
                  showUpdateFilter={true}
                  sort={sort}
                  sortOptions={sortOptions}
                />

                <GlobalProductListTable
                  isLoading={loading}
                  loaderComponent={GlobalProductsRowLoading}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  page={page}
                  tabIndex={tabValue}
                  items={entities?.results}
                  count={entities?.total || 0}
                  rowsPerPage={rowsPerPage}
                  noDataPlaceholder={
                    <Box sx={{ mt: 6, mb: 4 }}>
                      <NoDataAnimation
                        text={
                          <Typography
                            variant="h6"
                            textAlign="center"
                            sx={{ mt: 2 }}
                          >
                            {t("No Global Products!")}
                          </Typography>
                        }
                      />
                    </Box>
                  }
                />
              </Card>
            )}
            {tabValue === 1 && (
              <Card>
                <GlobalProductListSearch
                  onQueryChange={handleQueryChangeUpdate}
                  onFiltersChange={handleFilterChangeUpdate}
                  searchPlaceholder={t("Search with global products/SKU")}
                  onSortChange={handleSortChangeUpdate}
                  sort={sortUpdate}
                  showBusinessTypeFilter={false}
                  showUpdateFilter={false}
                  sortOptions={sortOptions}
                />

                <GlobalProductListTable
                  isLoading={loadingUpdate}
                  loaderComponent={GlobalProductsRowLoading}
                  onPageChange={handlePageChangeUpdate}
                  onRowsPerPageChange={handleRowsPerPageChangeUpdate}
                  page={pageUpdate}
                  tabIndex={tabValue}
                  items={entitiesUpdate?.results}
                  count={entitiesUpdate?.total || 0}
                  rowsPerPage={rowsPerPageUpdate}
                  noDataPlaceholder={
                    <Box sx={{ mt: 6, mb: 4 }}>
                      <NoDataAnimation
                        text={
                          <Typography
                            variant="h6"
                            textAlign="center"
                            sx={{ mt: 2 }}
                          >
                            {t("No Updated Products!")}
                          </Typography>
                        }
                      />
                    </Box>
                  }
                />
              </Card>
            )}
          </Stack>
        </Container>
      </Box>
      {response && (
        <ImportMessage
          show={showDialogCustomerEvent}
          toggle={() => setShowDialogCustomerEvent(!showDialogCustomerEvent)}
          cancelButtonText={t("Cancel")}
          title={t("Import Message")}
          response={response}
          importEntity={importEntity}
        />
      )}
      <ImportExportModal
        open={openImportExportModal}
        handleClose={() => {
          setOpenImportExportModal(false);
          if (response?.status == true) {
            router.reload();
          }
        }}
        response={response}
        importEntity={importEntity}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
