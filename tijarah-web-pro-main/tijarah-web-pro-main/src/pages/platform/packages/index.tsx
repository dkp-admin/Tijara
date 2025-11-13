import ReorderRoundedIcon from "@mui/icons-material/ReorderRounded";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { TransformedArrowIcon } from "src/components/TransformedIcons";
import { PackagesRowLoading } from "src/components/packages/packages-row-loading";
import { Seo } from "src/components/seo";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
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
import { useCurrency } from "src/utils/useCurrency";
import { useDebounce } from "use-debounce";

interface PackagePrice {
  type: "monthly" | "quarterly" | "annually";
  price: number;
}

interface Package {
  _id: string;
  name: {
    en: string;
    ar: string;
  };
  prices: PackagePrice[];
  modules: { key: string; name: string }[];
  status: string;
  sortOrder: number; // Added sortOrder to the interface
}

interface PackageSortOrder {
  _id: string;
  sortOrder: number;
}

const Packages: PageType = () => {
  const { t } = useTranslation();
  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [filter, setFilter] = useState<any>([]);

  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["package:update"]);
  const canCreate = canAccess(MoleculeType["package:create"]);
  const router = useRouter();
  const currency = useCurrency();

  const { find, updateEntity, loading, entities } = useEntity("package");

  usePageView();

  const handleQueryChange = (value: string): void => {
    if (value !== undefined) {
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

  const handlePageChange = (_event: any, newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !canUpdate) {
      if (!canUpdate) {
        toast.error(t("You don't have access"));
      }
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) {
      return;
    }

    const reorderedPackages = [...entities.results];
    const [draggedItem] = reorderedPackages.splice(sourceIndex, 1);
    reorderedPackages.splice(destinationIndex, 0, draggedItem);

    const updatedPackages = reorderedPackages.map(
      (pkg: Package, index: number) => ({
        _id: pkg._id,
        sortOrder: index,
      })
    );

    try {
      await updateEntity("sort-orders", {
        packages: updatedPackages,
      });

      find({
        page,
        sort,
        activeTab: filter?.status?.length > 0 ? filter?.status[0] : "all",
        limit: rowsPerPage,
        _q: debouncedQuery,
      });
    } catch (error) {
      toast.error(t("Failed to update sort order"));
    }
  };

  useEffect(() => {
    find({
      page: page,
      sort: sort,
      activeTab: filter?.status?.length > 0 ? filter?.status[0] : "all",
      limit: rowsPerPage,
      _q: debouncedQuery,
    });
  }, [page, sort, debouncedQuery, rowsPerPage, filter]);

  if (!canAccess(MoleculeType["package:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Packages")}`} />
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
                <Typography variant="h4">{t("Packages")}</Typography>
              </Stack>
              <Stack alignItems="center" direction="row" spacing={3}>
                <Button
                  onClick={() => {
                    if (!canCreate) {
                      return toast.error(t("You don't have access"));
                    }
                    router.push({
                      pathname: tijarahPaths?.platform?.packages?.create,
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
                onQueryChange={handleQueryChange}
                onFiltersChange={handleFilterChange}
                searchPlaceholder={t("Search with Package Name")}
                onSortChange={handleSortChange}
                sort={sort}
                sortOptions={sortOptions}
                showSort={false}
              />

              <DragDropContext onDragEnd={handleDragEnd}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell></TableCell>
                        <TableCell>{t("Package Name")}</TableCell>
                        {/* <TableCell>{t("Monthly Price")}</TableCell> */}
                        <TableCell>{t("Quarterly Price")}</TableCell>
                        <TableCell>{t("Annual Price")}</TableCell>
                        <TableCell>{t("Modules")}</TableCell>
                        <TableCell>{t("Status")}</TableCell>
                        <TableCell>{t("Action")}</TableCell>
                      </TableRow>
                    </TableHead>

                    <Droppable droppableId="packagesDroppable">
                      {(provided) => (
                        <TableBody
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {loading ? (
                            <TableRow>
                              <TableCell colSpan={8}>
                                <PackagesRowLoading />
                              </TableCell>
                            </TableRow>
                          ) : entities?.results?.length > 0 ? (
                            entities.results.map(
                              (pkg: Package, idx: number) => (
                                <Draggable
                                  key={pkg._id}
                                  draggableId={pkg._id}
                                  index={idx}
                                >
                                  {(provided, snapshot) => (
                                    <TableRow
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={{
                                        ...provided.draggableProps.style,
                                        background: snapshot.isDragging
                                          ? "rgba(245,245,245, 0.75)"
                                          : "none",
                                      }}
                                    >
                                      <TableCell>
                                        <IconButton sx={{ mr: 0.7, ml: -1 }}>
                                          <SvgIcon>
                                            <ReorderRoundedIcon fontSize="small" />
                                          </SvgIcon>
                                        </IconButton>
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="subtitle2">
                                          {isRTL ? pkg.name.ar : pkg.name.en}
                                        </Typography>
                                      </TableCell>
                                      {/* Monthly price temporarily disabled
                                      <TableCell>
                                        <Typography variant="body2">
                                          {pkg.prices.find(
                                            (p) => p.type === "monthly"
                                          )?.price
                                            ? `${
                                                pkg.prices.find(
                                                  (p) => p.type === "monthly"
                                                )?.price
                                              } ${currency}`
                                            : "NA"}
                                        </Typography>
                                      </TableCell>
                                      */}
                                      <TableCell>
                                        <Typography variant="body2">
                                          {pkg.prices.find(
                                            (p) => p.type === "quarterly"
                                          )?.price
                                            ? `${
                                                pkg.prices.find(
                                                  (p) => p.type === "quarterly"
                                                )?.price
                                              } ${currency}`
                                            : "NA"}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body2">
                                          {pkg.prices.find(
                                            (p) => p.type === "annually"
                                          )?.price
                                            ? `${
                                                pkg.prices.find(
                                                  (p) => p.type === "annually"
                                                )?.price
                                              } ${currency}`
                                            : "NA"}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body2">
                                          {pkg.modules
                                            .map((module) => module.name)
                                            .join(", ") || "NA"}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <FormControlLabel
                                          sx={{
                                            width: "120px",
                                            display: "flex",
                                            flexDirection: "row",
                                          }}
                                          control={
                                            <Switch
                                              checked={pkg.status === "active"}
                                              color="primary"
                                              edge="end"
                                              name="status"
                                              onChange={(e) => {
                                                if (!canUpdate) {
                                                  return toast.error(
                                                    t("You don't have access")
                                                  );
                                                }
                                                handleStatusChange(
                                                  pkg._id,
                                                  e.target.checked
                                                );
                                              }}
                                              sx={{ mr: 0.2 }}
                                            />
                                          }
                                          label={
                                            pkg.status === "active"
                                              ? t("Active")
                                              : t("Deactivated")
                                          }
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            justifyContent: "end",
                                          }}
                                        >
                                          <IconButton
                                            onClick={() => {
                                              router.push({
                                                pathname:
                                                  tijarahPaths?.platform
                                                    ?.packages?.create,
                                                query: { id: pkg._id },
                                              });
                                            }}
                                            sx={{ mr: 1.5 }}
                                          >
                                            <TransformedArrowIcon name="arrow-right" />
                                          </IconButton>
                                        </Box>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </Draggable>
                              )
                            )
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={8}
                                sx={{ py: 3 }}
                                style={{ textAlign: "center" }}
                              >
                                <NoDataAnimation />
                              </TableCell>
                            </TableRow>
                          )}
                          {provided.placeholder}
                        </TableBody>
                      )}
                    </Droppable>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={entities?.total || 0}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[5, 10, 25]}
                />
              </DragDropContext>
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Packages.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Packages;
