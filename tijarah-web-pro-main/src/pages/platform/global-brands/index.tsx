import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import {
  Avatar,
  Box,
  Button,
  Card,
  Container,
  FormControlLabel,
  IconButton,
  Link,
  Stack,
  SvgIcon,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import Upload01Icon from "@untitled-ui/icons-react/build/esm/Upload01";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { TransformedArrowIcon } from "src/components/TransformedIcons";
import { BrandsRowLoading } from "src/components/brands/brands-row-loading";
import ExportButton from "src/components/custom-button/custom-export-button";
import ImportMessage from "src/components/import-message";
import { ImportExportModal } from "src/components/modals/inport-export-modal";
import { Seo } from "src/components/seo";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import useImport from "src/hooks/useImport";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { green } from "src/theme/colors";
import type { Page as PageType } from "src/types/page";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import useExportAll from "src/utils/export-all";
import { useDebounce } from "use-debounce";

const GlobalBrands: PageType = () => {
  usePageView();
  const { exportCsv } = useExportAll({});
  let importEntity = "brand";

  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
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
  const canUpdate = canAccess(MoleculeType["brand:update"]);
  const canCreate = canAccess(MoleculeType["brand:create"]);
  const canImport = canAccess(MoleculeType["brand:import"]);

  const { find, updateEntity, loading, entities } = useEntity("brands");

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

  const handleStatusChange = async (id: string, checked: boolean) => {
    await updateEntity(id, {
      status: checked ? "active" : "inactive",
    });
  };

  const handleFilterChange = (changedFilter: any) => {
    setPage(0);
    setFilter(changedFilter);
  };

  const lng = localStorage.getItem("currentLanguage");

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
              minWidth: "180px",
            }}
          >
            <Avatar
              src={d?.image || ""}
              sx={{
                height: 42,
                width: 42,
              }}
            />
            <Box sx={{ ml: 1, textAlign: "start" }}>
              <Typography color="inherit" variant="subtitle2">
                {d?.name?.[lng] || d?.name?.en}
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
                  pathname: tijarahPaths?.platform?.globalBrands?.create,
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
  }, [entities]);

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
    if (response) {
      setShowDialogCustomerEvent(true);
    }
  }, [response]);

  useEffect(() => {
    find({
      page: page,
      sort: sort,
      activeTab: filter?.status?.length > 0 ? filter?.status[0] : "all",
      limit: rowsPerPage,
      _q: debouncedQuery,
    });
  }, [page, sort, debouncedQuery, rowsPerPage, filter]);

  if (!canAccess(MoleculeType["brand:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Global Brands")}`} />
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
                <Stack alignItems="center" direction="row" spacing={1}>
                  <Typography variant="h4">{t("Global Brands")}</Typography>

                  <ExportButton
                    onClick={(type: string) => {
                      exportCsv("/export/brand", type, "brand");
                    }}
                  />
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
                  <Button
                    onClick={() => {
                      if (!canImport) {
                        return toast.error("You don't have access");
                      }
                      document.getElementById("fileInput").click();
                    }}
                    color="inherit"
                    size="small"
                    startIcon={
                      <SvgIcon>
                        <Upload01Icon />
                      </SvgIcon>
                    }
                  >
                    {t("Import Global Brands")}
                  </Button>
                </Stack>
              </Stack>
              <Stack alignItems="center" direction="row" spacing={3}>
                <Button
                  onClick={() => {
                    if (!canCreate) {
                      return toast.error(t("You don't have access"));
                    }
                    router.push({
                      pathname: tijarahPaths?.platform?.globalBrands?.create,
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
                    " You can import upto 15000 Brands at a time. Only .xlsx files can be imported, here you can "
                  )}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  flexDirection: "row",
                }}
              >
                <Link
                  target="_blank"
                  href="https://docs.google.com/spreadsheets/d/1vUmPp8fLjIc4mCTm9FodWuskMx1kkVRkkCOfy3pxgMM/edit?usp=sharing"
                  variant="body2"
                  color="InfoText"
                  sx={{ fontSize: "13px", pl: 0.5 }}
                >
                  {t("download")}
                </Link>
                <Typography
                  variant="body2"
                  color="gray"
                  sx={{ fontSize: "13px", pl: 0.5 }}
                >
                  {t("the sample File")}
                </Typography>
              </Box>
            </Box>
            <Card>
              <Box>
                <SuperTableHeader
                  onQueryChange={handleQueryChange}
                  onFiltersChange={handleFilterChange}
                  searchPlaceholder={t("Search with brand name")}
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
                            {t("No Global Brands!")}
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

GlobalBrands.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default GlobalBrands;
