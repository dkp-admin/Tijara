import CloseIcon from "@mui/icons-material/Close";
import ControlPointRoundedIcon from "@mui/icons-material/ControlPointRounded";
import DeleteOutlineTwoToneIcon from "@mui/icons-material/DeleteOutlineTwoTone";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import { LoadingButton } from "@mui/lab";
import {
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  MenuItem,
  MenuList,
  SvgIcon,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { green } from "@mui/material/colors";
import { useFormik } from "formik";
import * as React from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { CompanyContext } from "src/contexts/company-context";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";
import ProductAutoCompleteDropdown from "../input/product-auto-complete";
import { CollectionRowLoading } from "../locations/collection-row-loading";
import { LocationsRowLoading } from "../locations/locations-row-loading";
import NoDataAnimation from "../widgets/animations/NoDataAnimation";
import { SuperTable } from "../widgets/super-table";
import { SuperTableHeader } from "../widgets/super-table-header";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import ChevronDown from "@untitled-ui/icons-react/build/esm/ChevronDown";
import Plus from "@untitled-ui/icons-react/build/esm/Plus";

interface QuicItemsModalProps {
  open?: boolean;
  handleClose?: () => void;
  modalData?: any;
  filteredVariants?: any;
  companyRef?: string;
  companyName?: string;
  locationRef?: string;
  location?: string;
}

interface AddQuickItemsProps {
  productRefs: string[];
  products: any[];
  productImage: string;
  productNameEn: string;
  productNameAr: string;
  companyRef?: string;
  companyName?: string;
  locationRef?: string;
  location?: string;
  type: string;
}

export const AddQuickItemsModal: React.FC<QuicItemsModalProps> = ({
  open,
  handleClose,
  companyRef,
  companyName,
  locationRef,
  location,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [page, setPage] = useState<number>(0);
  const companyContext = React.useContext<any>(CompanyContext);
  const { user } = useAuth();
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [pageColl, setPageColl] = useState<number>(0);
  const [rowsPerPageColl, setRowsPerPageColl] = useState<number>(10);
  const [queryTextColl, setQueryTextColl] = useState("");
  const [debouncedQueryColl] = useDebounce(queryTextColl, 500);
  const [sortColl, setSortColl] = useState<Sort>(sortOptions[0].value);
  const { find, entities, loading } = useEntity("product");
  const [currentProduct, setCurrentProduct] = useState<string | null>(null);

  const {
    find: findCollection,
    entities: collections,
    loading: loadCollection,
  } = useEntity("collection");

  const {
    find: findMenu,
    entities: menus,
    loading: loadMenus,
  } = useEntity("menu-management");

  const { create: checkQuickItmes } = useEntity("quick-items/check-status");

  const { findOne: company, entity: companyEntity } = useEntity("company");

  const {
    find: findQuickItems,
    entities: quickItems,
    create: createOne,
  } = useEntity("quick-items");

  const queryClient = useQueryClient();

  const { create } = useEntity("quick-items/many");

  const headers = [
    {
      key: "product",
      label: t("Product"),
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
      key: "delete",
      label: "",
    },
  ];

  const collectionHeaders = [
    {
      key: "add",
      label: "",
    },
    {
      key: "collection",
      label: t("Collection"),
    },
  ];

  const menuHeaders = [
    {
      key: "menu",
      label: t("Menu"),
    },
  ];

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleProductToggle = React.useCallback((productId: string): void => {
    setCurrentProduct((prevProductId) => {
      if (prevProductId === productId) {
        return null;
      }

      return productId;
    });
  }, []);

  const handleRowsPerPageChangeColl = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setPageColl(0);
    setRowsPerPageColl(parseInt(event.target.value, 10));
  };

  const handleQueryChangeColl = (value: string): void => {
    if (value != undefined) {
      setQueryTextColl(value);
    }
  };

  const handlePageChangeColl = (newPage: number): void => {
    setPageColl(newPage);
  };

  const handleSortChangeColl = (value: any) => {
    setSortColl(value);
  };

  const initialValues: AddQuickItemsProps = {
    productRefs: [],
    products: [],
    productImage: "",
    productNameEn: "",
    productNameAr: "",
    companyRef: companyRef,
    companyName: companyName,
    locationRef: locationRef,
    location: location,
    type: "product",
  };

  const formik = useFormik({
    initialValues,
    onSubmit: async (values): Promise<void> => {
      const data = {
        products: values.products.map((d: any) => {
          return {
            productRef: d?.productRef,
            product: {
              name: {
                en: d?.product?.name?.en,
                ar: d?.product?.name?.ar,
              },
              image: d?.product?.image,
            },
            companyRef: companyRef,
            company: { name: companyName },
            locationRef: locationRef,
            location: { name: location },
            type: values?.type,
            menuRef: d?.product?.menuRef,
            menu: d?.product?.menu,
          };
        }),
      };

      try {
        await create({ ...data });
        queryClient.invalidateQueries("find-quick-items");
        toast.success(t("New Quick Item Added").toString());
        setCurrentProduct(null);
        formik.resetForm();
        handleClose();
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

  const lng = localStorage.getItem("currentLanguage");

  const transformedData = React.useMemo(() => {
    const arr: any[] = formik.values?.products?.map((d: any, index: number) => {
      return {
        key: d?._id,
        _id: d?._id,
        delete: (
          <IconButton
            onClick={() => {
              const newProductRefs = formik.values.productRefs;
              newProductRefs.splice(index, 1);
              const newProducts = formik.values.products;
              newProducts.splice(index, 1);

              formik.setFieldValue("productRefs", newProductRefs);

              formik.setFieldValue("products", newProducts);
            }}
            sx={{ cursor: "pointer" }}
          >
            <DeleteOutlineTwoToneIcon color="inherit" fontSize="large" />
          </IconButton>
        ),
        product: (
          <Box>
            <Typography>
              {d?.product?.name?.[lng] || d?.product?.name?.en || "-"}
            </Typography>
          </Box>
        ),
        category: (
          <Typography variant="body2">
            {d?.product?.category?.name || "NA"}
          </Typography>
        ),
        brand: (
          <Typography variant="body2">
            {d?.product?.brand?.name || "NA"}
          </Typography>
        ),
        price: (
          <Typography variant="body2">{d?.product?.price || "NA"}</Typography>
        ),
      };
    });

    return arr;
  }, [formik.values.products?.length]);

  const transformedDataCollections = React.useMemo(() => {
    const arr: any[] = collections?.results?.map((d) => {
      const productRefs = quickItems?.results?.map((d: any) => d?.productRef);
      console.log("boolean", productRefs?.includes(d?._id));

      return {
        key: d?._id,
        _id: d?._id,
        add: (
          <IconButton
            disabled={productRefs?.includes(d?._id)}
            onClick={async () => {
              const data = {
                productRef: d?._id.toString(),
                companyRef: companyRef,
                locationRef: locationRef,
              };

              const res = await checkQuickItmes({ ...data });

              if (res.exists) {
                return toast.error(t("Quick Item already exist!"));
              } else {
                const data = {
                  productRef: d?._id,
                  product: {
                    name: {
                      en: d?.name?.en,
                      ar: d?.name?.ar,
                    },
                    image: d?.image,
                  },
                  companyRef: companyRef,
                  company: { name: companyName },
                  locationRef: locationRef,
                  location: { name: location },
                  type: "collection",
                };
                await createOne({ ...data });
                toast.success(t("New Quick Item Added").toString());
                formik.resetForm();
              }
            }}
            sx={{ cursor: "pointer" }}
          >
            <ControlPointRoundedIcon
              color={productRefs?.includes(d?._id) ? "disabled" : "primary"}
              fontSize="large"
            />
          </IconButton>
        ),
        collection: (
          <Box>
            <Typography>{d?.name[lng] || d?.name?.en}</Typography>
          </Box>
        ),
      };
    });

    return arr;
  }, [collections?.results, quickItems?.results]);

  const transformedDataMenus = React.useMemo(() => {
    const arr: any[] = menus?.results?.map((d) => {
      const isCurrentMenu = d._id === currentProduct;

      return {
        key: d?._id,
        _id: d?._id,

        menu: (
          <Box onClick={() => handleProductToggle(d?._id)}>
            <Box
              sx={{
                flexDirection: "row",
                display: "flex",
                alignItems: "center",
              }}
            >
              {isCurrentMenu ? (
                <IconButton>
                  <ChevronDown />
                </IconButton>
              ) : (
                <IconButton>
                  <ChevronRight sx={{ cursor: "pointer" }} />
                </IconButton>
              )}
              <Typography>{d?.orderType?.toUpperCase() || ""}</Typography>
            </Box>
            {isCurrentMenu && (
              <Box sx={{ width: "100%" }}>
                <MenuList sx={{ width: "100%" }}>
                  {d?.products?.map((prod: any) => {
                    const menuDoc = quickItems?.results?.find(
                      (quick) =>
                        quick?.productRef === prod?._id &&
                        quick?.menuRef === d?._id
                    );
                    return (
                      <MenuItem
                        sx={{ margin: 1, width: "100%" }}
                        key={prod?.productRef}
                      >
                        <Box
                          sx={{
                            flexDirection: "row",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <Typography>{prod?.name?.en}</Typography>
                          <IconButton
                            onClick={async (e) => {
                              e.stopPropagation();

                              const data = {
                                productRef: prod?._id.toString(),
                                companyRef: companyRef,
                                locationRef: locationRef,
                                menuRef: d?._id,
                              };

                              const res = await checkQuickItmes({ ...data });

                              if (res.exists) {
                                return toast.error(
                                  t("Quick Item already exist!")
                                );
                              } else {
                                const selectedProducts = {
                                  productRef: prod?._id,
                                  product: {
                                    name: {
                                      en: prod.name?.en,
                                      ar: prod.name?.ar,
                                    },
                                    image: prod?.image,
                                    brand: { name: prod?.brand?.name },
                                    category: { name: prod?.category?.name },
                                    price: prod?.variants?.[0]?.price,
                                    menuRef: d?._id,
                                    menu: d?.orderType,
                                  },
                                };

                                const id = prod._id;

                                formik.setFieldValue("productRefs", [
                                  ...formik.values.productRefs,
                                  id,
                                ]);
                                formik.setFieldValue("products", [
                                  ...formik.values.products,
                                  selectedProducts,
                                ]);
                              }
                            }}
                            disabled={
                              formik?.values?.productRefs?.includes(
                                prod?._id
                              ) || menuDoc
                            }
                            sx={{ color: "#16B264" }}
                          >
                            <Plus />
                          </IconButton>
                        </Box>
                      </MenuItem>
                    );
                  })}
                </MenuList>
              </Box>
            )}
          </Box>
        ),
      };
    });

    return arr;
  }, [menus?.results, quickItems?.results, currentProduct, formik.values]);

  React.useEffect(() => {
    findQuickItems({
      page: 0,
      sort: "asc",
      activeTab: "all",
      limit: 100,
      companyRef: companyRef,
      locationRef: locationRef,
    });
  }, [
    companyRef,
    page,
    sort,
    companyRef,
    debouncedQuery,
    rowsPerPage,
    formik.values.type,
    pageColl,
    sortColl,
    rowsPerPageColl,
    debouncedQueryColl,
  ]);

  React.useEffect(() => {
    if (formik.values.type === "product") {
      find({
        page: debouncedQuery?.length > 0 ? 0 : page,
        sort: sort,
        activeTab: "active",
        limit: rowsPerPage,
        _q: debouncedQuery,
        companyRef: companyRef,
        locationRef: locationRef,
      });
    } else if (formik?.values?.type === "menu") {
      findMenu({
        page: debouncedQueryColl?.length > 0 ? 0 : pageColl,
        sort: sortColl,
        activeTab: "all",
        limit: 100,
        _q: "",
        locationRef,
      });
    } else {
      findCollection({
        page: debouncedQueryColl?.length > 0 ? 0 : pageColl,
        sort: sortColl,
        activeTab: "all",
        limit: rowsPerPageColl,
        _q: debouncedQueryColl,
        companyRef: companyRef,
      });
    }
  }, [
    page,
    sort,
    companyRef,
    debouncedQuery,
    rowsPerPage,
    formik.values.type,
    pageColl,
    sortColl,
    rowsPerPageColl,
    debouncedQueryColl,
    locationRef,
  ]);

  React.useEffect(() => {
    if (
      companyEntity?.industry ||
      user?.company?.industry === "restaurant" ||
      companyContext?.industry === "restaurant"
    ) {
      formik.setFieldValue("type", "menu");
    } else {
      formik.setFieldValue("type", "product");
    }
  }, [user, companyContext, open, companyEntity]);

  React.useEffect(() => {
    if (companyRef && user?.userType === "app:super-admin") {
      company(companyRef?.toString());
    }
  }, [companyRef, user]);

  return (
    <Box>
      <Dialog disableAutoFocus fullWidth maxWidth="md" open={open}>
        {/* header */}
        <Box
          sx={{
            display: "flex",
            p: 2,
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor:
              theme.palette.mode === "light" ? "#fff" : "#111927",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          ></Box>

          <Typography sx={{ ml: 2 }} variant="h6">
            {t("Add Quick Items")}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": {
                backgroundColor: "action.hover",
                cursor: "pointer",
                opacity: 0.5,
              },
            }}
          >
            <CloseIcon
              fontSize="medium"
              onClick={() => {
                formik.resetForm();
                setCurrentProduct(null);
                handleClose();
              }}
            />
          </Box>
        </Box>
        <Divider />
        <DialogContent>
          {companyEntity?.industry !== "restaurant" &&
            user?.company?.industry !== "restaurant" &&
            companyContext?.industry !== "restaurant" && (
              <ToggleButtonGroup
                fullWidth
                exclusive
                sx={{ mt: 2 }}
                color="primary"
                value={formik.values.type}
                aria-label="type"
              >
                <ToggleButton
                  value="product"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    textTransform: "inherit",
                  }}
                  onClick={() => {
                    formik.setFieldValue("type", "product");
                  }}
                >
                  <Typography variant="h6">{t("Product")}</Typography>
                </ToggleButton>

                <ToggleButton
                  value="collection"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    textTransform: "inherit",
                  }}
                  onClick={() => {
                    formik.setFieldValue("type", "collection");
                  }}
                >
                  <Typography variant="h6">{t("Collection")}</Typography>
                </ToggleButton>
              </ToggleButtonGroup>
            )}

          {(companyEntity?.industry === "restaurant" ||
            user?.company?.industry === "restaurant" ||
            companyContext?.industry === "restaurant") && (
            <ToggleButtonGroup
              fullWidth
              exclusive
              sx={{ mt: 2 }}
              color="primary"
              value={"menu"}
              aria-label="type"
            >
              <ToggleButton
                value="menu"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  textTransform: "inherit",
                }}
                onClick={() => {
                  formik.setFieldValue("type", "menu");
                }}
              >
                <Typography variant="h6">{t("Menu")}</Typography>
              </ToggleButton>
            </ToggleButtonGroup>
          )}

          <Box
            sx={{
              backgroundColor:
                theme.palette.mode !== "dark" ? `${green}` : "neutral.900",
              display: "flex",
              alignItems: "center",
              py: 1,
              pl: 1,
              pr: 2,
              mt: 1,
              mb: 1,
            }}
          >
            {formik.values.type !== "menu" && (
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
                  {t("Add Only 50 quick Items")}
                </Typography>
              </Box>
            )}
          </Box>

          <Card>
            {formik.values.type === "product" &&
            user?.company?.industry !== "restaurant" &&
            companyContext?.industry !== "restaurant" ? (
              <Box>
                <Box sx={{ display: "flex", py: 1 }}>
                  <ProductAutoCompleteDropdown
                    locationRef={locationRef}
                    companyRef={companyRef}
                    id="product-single-select"
                    selectedIds={formik.values.productRefs}
                    onChange={(option: any) => {
                      const selectedProducts = {
                        productRef: option?._id,
                        product: {
                          name: {
                            en: option?.name?.en,
                            ar: option?.name?.ar,
                          },
                          image: option?.image,
                          brand: { name: option?.brand?.name },
                          category: { name: option?.category?.name },
                          price: option?.variants?.[0]?.price,
                        },
                      };

                      const id = option?._id;

                      formik.setFieldValue("productRefs", [
                        ...formik.values.productRefs,
                        id,
                      ]);
                      formik.setFieldValue("products", [
                        ...formik.values.products,
                        selectedProducts,
                      ]);
                      // }
                    }}
                  />
                </Box>

                <SuperTable
                  showPagination={false}
                  isLoading={loading}
                  loaderComponent={LocationsRowLoading}
                  items={transformedData}
                  headers={headers}
                  total={entities?.total || 0}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  noDataPlaceholder={
                    <Box sx={{ mt: 6, mb: 4 }}>
                      <NoDataAnimation
                        text={
                          <Typography
                            variant="h6"
                            textAlign="center"
                            sx={{ mt: 2 }}
                          >
                            {t("No Products!")}
                          </Typography>
                        }
                      />
                    </Box>
                  }
                />
              </Box>
            ) : formik.values.type === "collection" &&
              user?.company?.industry !== "restaurant" &&
              companyContext?.industry !== "restaurant" ? (
              <Box>
                <SuperTableHeader
                  showFilter={false}
                  onSortChange={handleSortChangeColl}
                  onQueryChange={handleQueryChangeColl}
                  searchPlaceholder={t("Search with Collection Name")}
                  sort={sortColl}
                  sortOptions={sortOptions}
                />
                <SuperTable
                  isLoading={loadCollection}
                  loaderComponent={CollectionRowLoading}
                  items={transformedDataCollections}
                  headers={collectionHeaders}
                  total={collections?.total || 0}
                  onPageChange={handlePageChangeColl}
                  onRowsPerPageChange={handleRowsPerPageChangeColl}
                  rowsPerPage={rowsPerPageColl}
                  page={pageColl}
                  noDataPlaceholder={
                    <Box sx={{ mt: 6, mb: 4 }}>
                      <NoDataAnimation
                        text={
                          <Typography
                            variant="h6"
                            textAlign="center"
                            sx={{ mt: 2 }}
                          >
                            {t("No Collections!")}
                          </Typography>
                        }
                      />
                    </Box>
                  }
                />
              </Box>
            ) : (
              <></>
            )}
          </Card>
          <Card>
            {formik.values.type === "menu" && (
              <Box>
                <SuperTable
                  isLoading={loadMenus}
                  loaderComponent={CollectionRowLoading}
                  items={transformedDataMenus}
                  headers={menuHeaders}
                  total={menus?.total || 0}
                  onPageChange={handlePageChangeColl}
                  onRowsPerPageChange={handleRowsPerPageChangeColl}
                  rowsPerPage={rowsPerPageColl}
                  page={pageColl}
                  noDataPlaceholder={
                    <Box sx={{ mt: 6, mb: 4 }}>
                      <NoDataAnimation
                        text={
                          <Typography
                            variant="h6"
                            textAlign="center"
                            sx={{ mt: 2 }}
                          >
                            {t("No Menus!")}
                          </Typography>
                        }
                      />
                    </Box>
                  }
                />
              </Box>
            )}
          </Card>
        </DialogContent>

        <Divider />

        <DialogActions
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
            p: 2,
          }}
        >
          <LoadingButton
            disabled={formik.isSubmitting}
            onClick={() => {
              const count = quickItems?.total + formik.values.products?.length;

              if (count <= 50) {
                formik.handleSubmit();
              } else {
                toast.error(t("You can not add more than 50 Quick items"));
              }
            }}
            sx={{ borderRadius: 1 }}
            variant="contained"
          >
            {t("Add")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
