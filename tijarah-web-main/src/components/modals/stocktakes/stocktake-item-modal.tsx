import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Card,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  Radio,
  Stack,
  SvgIcon,
  TableCell,
  Typography,
  useTheme,
} from "@mui/material";
import Image01Icon from "@untitled-ui/icons-react/build/esm/Image01";
import { FormikProps, useFormik } from "formik";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import NewCategoryMultiSelect from "src/components/input/new-category-multiSelect";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { useEntity } from "src/hooks/use-entity";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";
import * as Yup from "yup";
import { StockTakeModalRowLoading } from "./stocktake-row-loading";
import generateUniqueCode from "src/utils/generate-unique-code";
import generateUniqueId from "src/utils/generate-unique-id";

interface StocktakeItemProps {
  from?: string;
  open?: boolean;
  handleClose?: () => void;
  modalData?: any;
  companyRef?: string;
  selectedOption?: string;
  locationRef?: string | string[];
  handleAddEditAction: any;
  id: string;
}

interface StocktakeDataProps {
  assignedToAllCategories: boolean;
  categoryRefs?: string[];
  categories?: string[];
}

const validationSchema = Yup.object({
  assignedToAllCategories: Yup.boolean(),
});

export const StocktakeItemModal = (props: StocktakeItemProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const {
    open,
    modalData,
    handleClose,
    selectedOption,
    companyRef,
    locationRef,
    handleAddEditAction,
    from,
    id,
  } = props;
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedCats, setSelectedCats] = useState([]);
  const [productList, setProductList] = useState([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [catQueryText, setCatQueryText] = useState("");
  const [catDebouncedQuery] = useDebounce(catQueryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [selectedCatIds, setSelectedCatIds] = useState([]);
  const { find, entities, loading } = useEntity("product");
  const { find: findCategory, entities: categories } = useEntity("category");
  const [selectedProductSku, setSelectedProductSku] = useState([]);

  const [option, setOption] = useState("product");

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 25));
  };

  const handleQueryChange = (value: string): void => {
    if (value != undefined) {
      setQueryText(value);
    }
  };
  const handleCatQueryChange = (value: string): void => {
    if (value != undefined) {
      setCatQueryText(value);
    }
  };

  const handleSortChange = (value: any) => {
    setSort(value);
  };

  const lng = localStorage.getItem("currentLanguage");

  const initialValues: StocktakeDataProps = {
    assignedToAllCategories: false,
    categoryRefs: [],
    categories: [],
  };

  const formik: FormikProps<StocktakeDataProps> = useFormik<StocktakeDataProps>(
    {
      initialValues,
      validationSchema,

      onSubmit: async (values) => {
        const data: any[] = [];

        selectedProducts.map((prod: any) => {
          if (option === "perishable" && !prod.batching) {
            return;
          }

          if (prod?.type == "item") {
            data.push({
              id: prod?.id,
              productRef: prod?.productRef,
              batching: prod?.batching || false,
              type: prod?.type,
              name: prod?.name,
              categoryRef: prod?.categoryRef,
              category: prod?.category,
              variant: {
                name: prod?.variant.name,
                sku: prod?.sku,
                stockConfiguration: prod.variant.stockConfiguration,
                sellingPrice: prod.variant.sellingPrice,
                cost: prod.variant.cost,
              },
              sku: prod.sku,
              hasMultipleVariants: prod?.hasMultipleVariants,
            });
          } else if (prod?.type == "box") {
            return;
          } else if (prod?.type == "crate") {
            return;
          }
        });

        try {
          handleAddEditAction([...data], selectedProductIds, option);
          toast.success("Products added");
          handleClose();
        } catch (error) {
          toast.error(error.message);
        }
      },
    }
  );

  const handleSelect = (id: any, data: any) => {
    if (data.type === "box" || data.type === "crate") {
      return toast.error("Can't select box and crate");
    }

    setSelectedProductIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((id) => id !== id);
      } else {
        return [...prev, id];
      }
    });

    setSelectedProducts((prev: any) => {
      if (prev.find((d: any) => d.sku === data.sku)) {
        return prev.filter((d: any) => d.sku !== data.sku);
      } else {
        return [...prev, data];
      }
    });
  };
  const handleCatSelect = (_id: any, data: any) => {
    setSelectedCatIds((prev) => {
      if (prev.includes(_id)) {
        return prev.filter((_id) => _id !== _id);
      } else {
        return [...prev, _id];
      }
    });
  };

  const handleSelectAll = (event: any) => {
    if (event.target.checked) {
      const filteredResults = productList?.filter((product: any) => {
        return product.type !== "box" && product.type !== "crate";
      });

      const allProductIds = filteredResults?.map((product: any) => product.id);

      const newProd = filteredResults?.map((data: any) => {
        return {
          ...data,
        };
      });

      setSelectedProducts([...newProd]);
      setSelectedProductIds(allProductIds);
    } else {
      setSelectedProductIds([]);
      setSelectedProducts([]);
    }
  };
  const handleCatSelectAll = (event: any) => {
    if (event.target.checked) {
      const allCatIds = categories?.results?.map((cat: any) => cat._id);

      setSelectedCatIds(allCatIds);
    } else {
      setSelectedCatIds([]);
    }
  };

  const handleCardClick = (option: any) => {
    setOption(option);
    setSelectedProducts([]);
    setSelectedProductIds([]);
    setSelectedCatIds([]);
  };

  const tableHeaders = [
    {
      key: "add",
      label: (
        <Checkbox
          indeterminate={
            selectedProductIds.length > 0 &&
            selectedProductIds.length < entities?.results?.length
          }
          checked={
            entities?.results?.length > 0 &&
            selectedProductIds.length === entities?.results?.length
          }
          onChange={handleSelectAll}
        />
      ),
    },
    {
      key: "product",
      label: t("Product Name"),
    },
    {
      key: "sku",
      label: t("SKU"),
    },
  ];
  const categoryTableHeaders = [
    {
      key: "add",
      label: (
        <Checkbox
          indeterminate={
            selectedCatIds.length > 0 &&
            selectedCatIds.length < categories?.results?.length
          }
          checked={
            categories?.results?.length > 0 &&
            selectedCatIds.length === categories?.results?.length
          }
          onChange={handleCatSelectAll}
        />
      ),
    },
    {
      key: "product",
      label: t("category Name"),
    },
  ];

  const transformedData = useMemo(() => {
    let arr: any[] = [];
    productList?.map(async (d) => {
      arr.push({
        key: d?.sku,
        _id: d?.sku,
        add: (
          <Checkbox
            checked={selectedProductIds.includes(d?.id)}
            onChange={() => handleSelect(d?.id, d)}
          />
        ),
        product: (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
            }}
          >
            <Typography variant="subtitle2">
              {d?.type === "item" &&
                `${d?.name[lng] || d?.name?.en}, ${
                  d?.variant.name[lng] || d?.variant.name?.en
                }`}
              {d?.type === "box" &&
                `${d?.product?.name[lng] || d?.product?.name?.en}, ${
                  d?.name[lng] || d?.name?.en
                }  [${t("Box")} - ${d?.qty} ${t("Unit(s)")}]`}
              {d?.type === "crate" &&
                `${d?.product?.name[lng] || d?.product?.name?.en}, ${
                  d?.name[lng] || d?.name?.en
                }  [${t("Crate")} - ${d?.qty} ${t("Unit(s)")}]`}
            </Typography>
          </Box>
        ),
        sku: (
          <Typography variant="body2">
            {d?.type === "item" && (d?.sku || "NA")}
            {d?.type === "box" && (d?.boxSku || "NA")}
            {d?.type === "crate" && (d?.crateSku || "NA")}
          </Typography>
        ),
      });
    });

    return arr;
  }, [selectedProducts, option, productList]);

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedItems = transformedData.slice(startIndex, endIndex);

  const categoryTransformedData = useMemo(() => {
    let arr: any[] = [];
    categories?.results?.map(async (d) => {
      arr.push({
        key: d?.sku,
        _id: d?.sku,
        add: (
          <Checkbox
            checked={selectedCatIds.includes(d?._id)}
            onChange={() => handleCatSelect(d?._id, d)}
          />
        ),
        product: (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ textTransform: "capitalize" }}
            >
              {d?.name[lng] || d?.name?.en}
            </Typography>
          </Box>
        ),
      });
    });

    return arr;
  }, [selectedCatIds, option, categories.results]);

  useEffect(() => {
    if (open) {
      formik.resetForm();

      const selectedIds = modalData?.map((d: any) => d?.id);
      setSelectedProductIds(selectedIds?.length > 0 ? selectedIds : []);

      const structuredProducts = modalData?.map((data: any) => ({
        id: data.id,
        productRef: data.productRef,
        type: data.type,
        productName: data.name,
        categoryRef: data.categoryRef,
        categoryName: data.category,
        variant: data.variant,
        sku: data.sku,
        hasMultipleVariants: data.hasMultipleVariants,
        name: data.variant.name,
        stockConfiguration: data.variant.stockConfiguration,
        sellingPrice: data.variant.sellingPrice,
        cost: data.variant.cost,
      }));

      setSelectedProducts(structuredProducts);
    }
  }, [open, modalData]);

  useEffect(() => {
    if (entities?.results?.length > 0) {
      const data: any[] = [];
      entities.results.map((prod: any) => {
        if (option === "perishable" && !prod?.batching) return;
        prod.variants.forEach((variant: any) => {
          data.push({
            id: variant?.sku,
            productRef: prod?._id,
            batching: prod?.batching || false,
            type: variant?.type,
            name: prod?.name,
            categoryRef: prod?.categoryRef,
            category: { name: prod?.category.name },
            variant: {
              name: variant?.name,
              sku: variant?.sku,
              stockConfiguration: variant?.stockConfiguration,
              sellingPrice: variant?.price,
              cost: variant?.costPrice,
            },
            sku: variant.sku,
            hasMultipleVariants: prod?.variants?.length > 1 ? true : false,
          });
        });
      });

      setProductList(data);
    }
  }, [entities?.results, option]);

  useEffect(() => {
    if (companyRef) {
      findCategory({
        page: 0,
        limit: 100,
        _q: catDebouncedQuery || "",
        activeTab: "active",
        sort: "asc",
        companyRef: companyRef,
      });
    }
  }, [companyRef, catDebouncedQuery]);

  const getQuery = (type = "item") => {
    const query: any = {
      page: page,
      sort: sort,
      limit: rowsPerPage,
      activeTab: "all",
      _q: debouncedQuery || "",
      companyRef: companyRef,
      categoryRefs: formik.values?.categoryRefs || [],
      isComposite: false,
      type: "item",
      batching: true,
      locationRef: locationRef,
    };

    return query;
  };

  useEffect(() => {
    if (companyRef && locationRef) {
      find({
        ...getQuery(),
      });
    }
  }, [
    open,
    sort,
    page,
    sort,
    rowsPerPage,
    debouncedQuery,
    formik.values?.categoryRefs,
    companyRef,
    locationRef,
    option,
  ]);

  return (
    <>
      <Dialog fullWidth maxWidth="md" open={open}>
        {/* header */}

        <Box
          sx={{
            display: "flex",
            px: 2,
            mt: 2,
            mb: 2,
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
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ ml: 2 }} variant="h6">
              {t("Add Products")}
            </Typography>
          </Box>

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
            <CloseIcon fontSize="medium" onClick={handleClose} />
          </Box>
        </Box>
        <Divider />

        {/* body */}
        <DialogContent sx={{ px: 0 }}>
          {id == null && (
            <>
              <Grid sx={{ p: 2 }} container spacing={1}>
                <Grid item md={12} xs={12}>
                  <Typography
                    variant="body2"
                    style={{
                      display: "flex",
                      gap: 5,
                      alignItems: "center",
                    }}
                  >
                    {t("Select how you like to add product")}
                  </Typography>
                </Grid>
                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                  <Card
                    sx={{
                      alignItems: "center",
                      cursor: "pointer",
                      display: "flex",
                      p: 0,
                      pr: 2,
                      backgroundColor:
                        option === "category"
                          ? "primary.alpha12"
                          : "transparent",
                      boxShadow:
                        option === "category"
                          ? (theme) => `${theme.palette.primary.main} 0 0 0 1px`
                          : "none",
                    }}
                    onClick={() => handleCardClick("category")}
                    variant="outlined"
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <Radio color="primary" checked={option === "category"} />
                      <div>
                        <Typography variant="subtitle1">
                          {t("Category")}
                        </Typography>
                      </div>
                    </Stack>
                  </Card>

                  <Card
                    sx={{
                      alignItems: "center",
                      cursor: "pointer",
                      display: "flex",
                      p: 0,
                      pr: 2,
                      backgroundColor:
                        option === "product"
                          ? "primary.alpha12"
                          : "transparent",
                      boxShadow:
                        option === "product"
                          ? (theme) => `${theme.palette.primary.main} 0 0 0 1px`
                          : "none",
                    }}
                    onClick={() => handleCardClick("product")}
                    variant="outlined"
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <Radio color="primary" checked={option === "product"} />

                      <Typography variant="subtitle1">
                        {t("Product")}
                      </Typography>
                    </Stack>
                  </Card>
                  <Card
                    sx={{
                      alignItems: "center",
                      cursor: "pointer",
                      display: "flex",
                      p: 0,
                      pr: 2,
                      backgroundColor:
                        option === "perishable"
                          ? "primary.alpha12"
                          : "transparent",
                      boxShadow:
                        option === "perishable"
                          ? (theme) => `${theme.palette.primary.main} 0 0 0 1px`
                          : "none",
                    }}
                    onClick={() => handleCardClick("perishable")}
                    variant="outlined"
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <Radio
                        color="primary"
                        checked={option === "perishable"}
                      />
                      <div>
                        <Typography variant="subtitle1">
                          {t("Perishable")}
                        </Typography>
                      </div>
                    </Stack>
                  </Card>
                </Box>
              </Grid>
            </>
          )}

          {selectedProductIds?.length > 0 && (
            <Grid sx={{ px: 2 }} container spacing={1}>
              <Grid item md={12} xs={12}>
                <Card
                  sx={{
                    alignItems: "center",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "center",
                    borderRadius: 2,
                    p: 1,
                    backgroundColor: "primary.alpha12",
                    boxShadow: (theme) =>
                      `${theme.palette.primary.main} 0 0 0 1px`,
                  }}
                  variant="outlined"
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography sx={{ ml: 2 }} variant="body2">
                      {t(`${selectedProductIds.length} row selected`)}
                    </Typography>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          )}
          <form onSubmit={() => formik.handleSubmit()}>
            <Stack spacing={0}>
              {option === "category" && (
                <Box>
                  <SuperTableHeader
                    isFromGlobalProduct={false}
                    showStatusFilter={false}
                    onQueryChange={handleCatQueryChange}
                    showFilter={false}
                    searchPlaceholder={t("Search with Category Name")}
                    onSortChange={handleSortChange}
                    sort={sort}
                    sortOptions={sortOptions}
                    showSort={false}
                  />
                  <SuperTable
                    isLoading={loading}
                    loaderComponent={StockTakeModalRowLoading}
                    items={categoryTransformedData}
                    headers={categoryTableHeaders}
                    total={categories?.results?.length || 0}
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
                              {t("No Category!")}
                            </Typography>
                          }
                        />
                      </Box>
                    }
                  />
                </Box>
              )}

              {option !== "category" && (
                <Box>
                  <SuperTableHeader
                    isFromGlobalProduct={false}
                    showStatusFilter={false}
                    onQueryChange={handleQueryChange}
                    showFilter={false}
                    searchPlaceholder={t("Search with Product Name / SKU")}
                    onSortChange={handleSortChange}
                    sort={sort}
                    sortOptions={sortOptions}
                    showSort={false}
                  />
                  <SuperTable
                    isLoading={loading}
                    loaderComponent={StockTakeModalRowLoading}
                    items={paginatedItems}
                    headers={tableHeaders}
                    total={productList?.length || 0}
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
                              {t("No Items!")}
                            </Typography>
                          }
                        />
                      </Box>
                    }
                  />
                </Box>
              )}
            </Stack>
          </form>
        </DialogContent>
        <Divider />

        {/* footer */}
        <DialogActions sx={{ px: 2, mb: 1, mt: 1 }}>
          <LoadingButton
            sx={{ borderRadius: 1 }}
            onClick={() => {
              formik.handleSubmit();
            }}
            size="medium"
            variant="contained"
            type="submit"
          >
            {t("Apply Selection")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};
