import AddTaskIcon from "@mui/icons-material/AddTask";
import ClearIcon from "@mui/icons-material/Clear";
import ControlPointRoundedIcon from "@mui/icons-material/ControlPointRounded";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import {
  Box,
  Card,
  Container,
  Divider,
  IconButton,
  Stack,
  SvgIcon,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import Image01Icon from "@untitled-ui/icons-react/build/esm/Image01";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { TransformedArrowIcon } from "src/components/TransformedIcons";
import { GlobalProductsRowLoading } from "src/components/modals/platform/global-products/global-product-row-loading";
import { SingleProductImportModal } from "src/components/modals/singleProductImport-modal";
import { RouterLink } from "src/components/router-link";
import { Seo } from "src/components/seo";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { useGlobalProduct } from "src/hooks/use-global-check";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import UpgradePackage from "src/pages/upgrade-package";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { green } from "src/theme/colors";
import type { Page as PageType } from "src/types/page";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useDebounce } from "use-debounce";
import { useCurrency } from "src/utils/useCurrency";

const Page: PageType = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useAuth();
  const { canAccessModule } = useFeatureModuleManager();
  const { find, loading, entities } = useEntity("global-products");
  const {
    find: findUpdate,
    updateEntity,
    loading: loadingUpdate,
    deleteEntity,
    entities: entitiesUpdate,
  } = useEntity("updated-product");
  const { isAlreadyImported } = useGlobalProduct();
  const [productData, setProductData] = useState<any>(null);
  const [openImportProductModal, setOpenImportProductModal] = useState(false);
  const [page, setPage] = useState<number>(0);
  const [pageUpdate, setPageUpdate] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [rowsPerPageUpdate, setRowsPerPageUpdate] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [isNewUpdated, setIsNewUpdated] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [queryTextUpdate, setQueryTextUpdate] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [debouncedQueryUpdate] = useDebounce(queryTextUpdate, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [sortUpdate, setSortUpdate] = useState<Sort>(sortOptions[0].value);
  const [filter, setFilter] = useState<any>([]);
  const [filterUpdate, setFilterUpdate] = useState<any>([]);
  const [tabValue, setTabValue] = useState(0);
  const currency = useCurrency();

  const canAccess = usePermissionManager();

  const canImport = canAccess(MoleculeType["global-product:import"]);
  const handleChange = (event: any, newValue: any) => {
    setTabValue(newValue);
  };

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };
  const handlePageChangeUpdate = (newPage: number): void => {
    setPageUpdate(newPage);
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

  usePageView();

  const handleQueryChange = (value: string): void => {
    if (value != undefined) {
      setQueryText(value);
    }
  };
  const handleQueryChangeUpdate = (value: string): void => {
    if (value != undefined) {
      setQueryTextUpdate(value);
    }
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

  const tableHeaders = [
    {
      key: "add",
      label: "",
    },
    {
      key: "product",
      label: t("Product Name"),
    },
    {
      key: "brand",
      label: t("Brand"),
    },
    {
      key: "category",
      label: t("Category"),
    },
    {
      key: "price",
      label: t("Price"),
    },
    {
      key: "costPrice",
      label: t("Cost Price"),
    },
    {
      key: "action",
      label: t("Action"),
    },
  ];

  const getItemPrice = (variants: Array<any>) => {
    const allPrices: any = variants.flatMap((variant: any) => variant.price);
    const sortedPice = allPrices.sort(
      (p1: any, p2: any) => (p1 || 0) - (p2 || 0)
    );
    const hasZero =
      sortedPice.findIndex(
        (t: any) => !t || t === null || t == undefined || t == 0
      ) !== -1;
    const filteredArray = sortedPice.filter((p: any) => p > 0);
    let str = ``;
    if (filteredArray.length === 1) {
      str += `${currency} ${toFixedNumber(filteredArray[0])}`;
    } else if (filteredArray.length > 1) {
      str += `${currency} ${toFixedNumber(
        filteredArray[0]
      )} - ${currency} ${toFixedNumber(
        filteredArray[filteredArray.length - 1]
      )}`;
    }

    if (hasZero) {
      if (filteredArray.length > 0) {
        str += ` , `;
      }
      str += `Custom Price`;
    }

    return str;
  };

  const getItemPevPrice = (variants: Array<any>) => {
    const allPrices: any = variants.flatMap((variant: any) => variant.oldPrice);
    const sortedPice = allPrices.sort(
      (p1: any, p2: any) => (p1 || 0) - (p2 || 0)
    );
    const hasZero =
      sortedPice.findIndex(
        (t: any) => !t || t === null || t == undefined || t == 0
      ) !== -1;
    const filteredArray = sortedPice.filter((p: any) => p > 0);
    let str = ``;
    if (filteredArray.length === 1) {
      str += `${currency} ${toFixedNumber(filteredArray[0])}`;
    } else if (filteredArray.length > 1) {
      str += `${currency} ${toFixedNumber(
        filteredArray[0]
      )} - ${currency} ${toFixedNumber(
        filteredArray[filteredArray.length - 1]
      )}`;
    }

    if (hasZero) {
      if (filteredArray.length > 0) {
        str += ` , `;
      }
      str += ``;
    }

    return str;
  };

  const getItemCostPrice = (variants: Array<any>) => {
    const allPrices: any = variants.flatMap(
      (variant: any) => variant.costPrice
    );
    const sortedPice = allPrices.sort(
      (p1: any, p2: any) => (p1 || 0) - (p2 || 0)
    );
    const hasZero =
      sortedPice.findIndex(
        (t: any) => !t || t === null || t == undefined || t == 0
      ) !== -1;
    const filteredArray = sortedPice.filter((p: any) => p > 0);
    let str = ``;
    if (filteredArray.length === 1) {
      str += `${currency} ${toFixedNumber(filteredArray[0])}`;
    } else if (filteredArray.length > 1) {
      str += `${currency} ${toFixedNumber(
        filteredArray[0]
      )} - ${currency} ${toFixedNumber(
        filteredArray[filteredArray.length - 1]
      )}`;
    }

    if (hasZero) {
      if (filteredArray.length > 0) {
        str += ` , `;
      }
      str += `Custom Price`;
    }

    return str;
  };

  const getItemPevCostPrice = (variants: Array<any>) => {
    const allPrices: any = variants.flatMap(
      (variant: any) => variant.oldCostPrice
    );
    const sortedPice = allPrices.sort(
      (p1: any, p2: any) => (p1 || 0) - (p2 || 0)
    );
    const hasZero =
      sortedPice.findIndex(
        (t: any) => !t || t === null || t == undefined || t == 0
      ) !== -1;
    const filteredArray = sortedPice.filter((p: any) => p > 0);
    let str = ``;
    if (filteredArray.length === 1) {
      str += `${currency} ${toFixedNumber(filteredArray[0])}`;
    } else if (filteredArray.length > 1) {
      str += `${currency} ${toFixedNumber(
        filteredArray[0]
      )} - ${currency} ${toFixedNumber(
        filteredArray[filteredArray.length - 1]
      )}`;
    }

    if (hasZero) {
      if (filteredArray.length > 0) {
        str += ` , `;
      }
      str += ``;
    }

    return str;
  };

  const transformedData = useMemo(() => {
    let arr: any[] = [];
    entities?.results?.map(async (d) => {
      arr.push({
        key: d?._id,
        _id: d?._id,
        add: (
          <IconButton
            onClick={async () => {
              if (!canImport) {
                return toast.error(t("You don't have access"));
              }
              const res: any = await isAlreadyImported(d?._id);
              if (res?.exists) {
                toast.error("Already Imported");
                return;
              }
              setProductData(d);
              setOpenImportProductModal(true);
            }}
            sx={{ ml: 0.7, mr: -4, cursor: "pointer" }}
          >
            <ControlPointRoundedIcon color="primary" fontSize="large" />
          </IconButton>
        ),
        product: (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
            }}
          >
            {d?.image ? (
              <Box
                sx={{
                  alignItems: "center",
                  backgroundColor: "neutral.50",
                  backgroundImage: `url(${d.image})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  borderRadius: 1,
                  display: "flex",
                  height: 80,
                  justifyContent: "center",
                  overflow: "hidden",
                  width: 80,
                }}
              />
            ) : (
              <Box
                sx={{
                  alignItems: "center",
                  backgroundColor: "neutral.50",
                  borderRadius: 1,
                  display: "flex",
                  height: 80,
                  justifyContent: "center",
                  width: 80,
                }}
              >
                <SvgIcon>
                  <Image01Icon />
                </SvgIcon>
              </Box>
            )}
            <Box
              sx={{
                cursor: "pointer",
                ml: 2,
              }}
            >
              <Typography variant="subtitle2">{d?.name?.en}</Typography>
            </Box>
          </Box>
        ),
        brand: (
          <Typography variant="body2">{d?.brand?.name || "NA"}</Typography>
        ),
        category: (
          <Typography variant="body2">{d?.category?.name || "NA"}</Typography>
        ),
        price: (
          <>
            <Typography variant="body2">{getItemPrice(d?.variants)}</Typography>
            <Typography
              variant="body2"
              style={{ textDecoration: "line-through" }}
            >
              {getItemPevPrice(d?.variants)}
            </Typography>
          </>
        ),
        costPrice: (
          <>
            <Typography variant="body2">
              {getItemCostPrice(d?.variants)}
            </Typography>
            <Typography
              variant="body2"
              style={{ textDecoration: "line-through" }}
            >
              {getItemPevCostPrice(d?.variants)}
            </Typography>
          </>
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
              href={`${tijarahPaths?.catalogue?.globalProducts?.view}?id=${d?._id}&type=global-products`}
            >
              <SvgIcon>
                <TransformedArrowIcon name="arrow-right" />
              </SvgIcon>
            </IconButton>
          </Box>
        ),
      });
    });

    return arr;
  }, [entities?.results]);

  const transformedDataNew = useMemo(() => {
    let arr: any[] = [];
    entitiesUpdate?.results?.map(async (d) => {
      arr.push({
        key: d?._id,
        _id: d?._id,
        add: (
          <Box sx={{ display: "flex", gap: 4 }}>
            <IconButton
              onClick={async () => {
                if (!canImport) {
                  return toast.error(t("You don't have access"));
                }
                const res: any = await isAlreadyImported(d?._id);
                console.log(res);

                if (res?.exists) {
                  toast.error("Already Imported");
                  return;
                }
                setProductData(d);
                setIsNewUpdated(true);
                setOpenImportProductModal(true);
              }}
              sx={{ ml: 0.7, mr: -4, cursor: "pointer" }}
            >
              <AddTaskIcon color="primary" fontSize="large" />
            </IconButton>
            <IconButton
              onClick={async () => {
                if (!canImport) {
                  return toast.error(t("You don't have access"));
                }
                const data = {
                  rejectedCompanyRef: user?.companyRef,
                };

                try {
                  await updateEntity(d?._id, { ...data });
                  toast.success(t("Removed").toString());
                } catch (err) {
                  toast.error(err.message);
                }
              }}
              sx={{ ml: 0.7, mr: -4, cursor: "pointer" }}
            >
              <ClearIcon color="error" fontSize="large" />
            </IconButton>
          </Box>
        ),

        product: (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
            }}
          >
            {d?.image ? (
              <Box
                sx={{
                  alignItems: "center",
                  backgroundColor: "neutral.50",
                  backgroundImage: `url(${d.image})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  borderRadius: 1,
                  display: "flex",
                  height: 80,
                  justifyContent: "center",
                  overflow: "hidden",
                  width: 80,
                }}
              />
            ) : (
              <Box
                sx={{
                  alignItems: "center",
                  backgroundColor: "neutral.50",
                  borderRadius: 1,
                  display: "flex",
                  height: 80,
                  justifyContent: "center",
                  width: 80,
                }}
              >
                <SvgIcon>
                  <Image01Icon />
                </SvgIcon>
              </Box>
            )}
            <Box
              sx={{
                cursor: "pointer",
                ml: 2,
              }}
            >
              <Typography variant="subtitle2">{d?.name?.en}</Typography>
            </Box>
          </Box>
        ),
        brand: (
          <Typography variant="body2">{d?.brand?.name || "NA"}</Typography>
        ),
        category: (
          <Typography variant="body2">{d?.category?.name || "NA"}</Typography>
        ),

        price: (
          <>
            <Typography variant="body2">{getItemPrice(d?.variants)}</Typography>
            <Typography
              variant="body2"
              style={{ textDecoration: "line-through" }}
            >
              {getItemPevPrice(d?.variants)}
            </Typography>
          </>
        ),
        costPrice: (
          <>
            <Typography variant="body2">
              {getItemCostPrice(d?.variants)}
            </Typography>
            <Typography
              variant="body2"
              style={{ textDecoration: "line-through" }}
            >
              {getItemPevCostPrice(d?.variants)}
            </Typography>
          </>
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
              href={`${tijarahPaths?.catalogue?.globalProducts?.view}?id=${d?._id}&type=updated-product`}
            >
              <SvgIcon>
                <TransformedArrowIcon name="arrow-right" />
              </SvgIcon>
            </IconButton>
          </Box>
        ),
      });
    });

    return arr;
  }, [entitiesUpdate?.results]);

  useEffect(() => {
    find({
      page: page,
      sort: sort,
      activeTab: "active",
      limit: rowsPerPage,
      _q: debouncedQuery,
      businessTypeRefs: [user?.company?.businessTypeRef],
    });
  }, [page, sort, debouncedQuery, rowsPerPage, filter]);

  useEffect(() => {
    findUpdate({
      page: pageUpdate,
      sort: sortUpdate,
      activeTab: "all",
      limit: rowsPerPageUpdate,
      _q: debouncedQueryUpdate,
      businessTypeRefs: [user?.company?.businessTypeRef],
      updatedBy: "SUPER_ADMIN",
      companyRef: user?.company?._id,
    });
  }, [
    pageUpdate,
    sortUpdate,
    debouncedQueryUpdate,
    rowsPerPageUpdate,
    filterUpdate,
  ]);

  if (!canAccessModule("global_products")) {
    return <UpgradePackage />;
  }

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
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            py: 2,
          }}
        >
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">{t("Global Products")}</Typography>
              </Stack>
            </Stack>
            <Box
              sx={{
                backgroundColor:
                  theme.palette.mode !== "dark"
                    ? `${green.light}`
                    : "neutral.900",
                display: "flex",
                alignItems: "center",
                py: 1,
                pl: 2.5,
                pr: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                <SvgIcon fontSize="small">
                  <InfoTwoToneIcon color="primary" />
                </SvgIcon>
                <Box sx={{ display: "flex", alignItems: "center" }}>
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
                </Box>
                <Typography
                  variant="body2"
                  color="gray"
                  sx={{ fontSize: "13px", pl: 0.5 }}
                >
                  {t(
                    "These are the products on Tijarah platform and not your product inventory. You can add products from the list to your product offerings."
                  )}
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
                <Tab label="New/Updated" />
              </Tabs>
              <Divider />
            </div>

            {tabValue === 0 && (
              <Card>
                <SuperTableHeader
                  onQueryChange={handleQueryChange}
                  onFiltersChange={handleFilterChange}
                  showFilter={false}
                  searchPlaceholder={t("Search with Product Name/SKU")}
                  onSortChange={handleSortChange}
                  sort={sort}
                  sortOptions={sortOptions}
                />

                <SuperTable
                  isLoading={loading}
                  loaderComponent={GlobalProductsRowLoading}
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
                <SuperTableHeader
                  onQueryChange={handleQueryChangeUpdate}
                  onFiltersChange={handleFilterChangeUpdate}
                  showFilter={false}
                  searchPlaceholder={t("Search with Product Name/SKU")}
                  onSortChange={handleSortChangeUpdate}
                  sort={sortUpdate}
                  sortOptions={sortOptions}
                />

                <SuperTable
                  isLoading={loadingUpdate}
                  loaderComponent={GlobalProductsRowLoading}
                  items={transformedDataNew}
                  headers={tableHeaders}
                  total={entitiesUpdate?.total || 0}
                  onPageChange={handlePageChangeUpdate}
                  onRowsPerPageChange={handleRowsPerPageChangeUpdate}
                  rowsPerPage={rowsPerPageUpdate}
                  page={pageUpdate}
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
                            {t("No Global Products!")}
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

      <SingleProductImportModal
        companyRef={user?.company?._id}
        companyName={user?.company?.name?.en}
        product={productData}
        isNewUpdated={isNewUpdated}
        open={openImportProductModal}
        handleClose={() => {
          setOpenImportProductModal(false);
          setIsNewUpdated(false);
        }}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
