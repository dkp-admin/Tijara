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
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { FormikProps, useFormik } from "formik";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { useEntity } from "src/hooks/use-entity";
import useScanStore from "src/store/scan-store";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import generateUniqueId from "src/utils/generate-unique-id";
import { useDebounce } from "use-debounce";
import * as Yup from "yup";
import { StockTakeModalRowLoading } from "../stocktakes/stocktake-row-loading";

interface VolumetricPricingItemProps {
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

export const VolumetricPricingItemModal = (
  props: VolumetricPricingItemProps
) => {
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
  const { find, entities, loading } = useEntity("product/search-variants");
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  console.log("selc id", selectedProductIds);

  // const [productList, setProductList] = useState([]);

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const { scan, setScan } = useScanStore();

  const [selectedProducts, setSelectedProducts] = useState([]);

  console.log("sleele", selectedProducts);

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
          if (prod?.type == "item") {
            data.push({
              id: prod?._id,
              productRef: prod?.productRef,
              type: prod?.type,
              name: prod?.name,
              product: prod?.product,
              categoryRef: prod?.categoryRef,
              category: { name: prod?.category?.name },
              priceTable: [
                {
                  id: generateUniqueId(8),
                  startQty: null,
                  endQty: null,
                  customPrice: null,
                  type: "amount",
                  value: null,
                },
              ],
              sku: prod.sku,
              sellingPrice: prod.price,
            });
          } else if (prod?.type == "box") {
            data.push({
              id: prod?._id,
              productRef: prod?.product?.productRef,
              type: prod?.type,
              name: prod?.name,
              product: prod?.product,
              categoryRef: prod?.product?.categoryRef,
              category: { name: prod?.product?.category?.name },
              priceTable: [
                {
                  id: generateUniqueId(8),
                  startQty: null,
                  endQty: null,
                  customPrice: null,
                  type: "amount",
                  value: null,
                },
              ],
              sku: prod.boxSku,
              sellingPrice: prod.price,
              qty: prod?.qty,
            });
          } else if (prod?.type == "crate") {
            data.push({
              id: prod?._id,
              productRef: prod?.product?.productRef,
              type: prod?.type,
              name: prod?.name,
              product: prod?.product,
              categoryRef: prod?.product?.categoryRef,
              category: { name: prod?.product?.category?.name },
              priceTable: [
                {
                  id: generateUniqueId(8),
                  startQty: null,
                  endQty: null,
                  customPrice: null,
                  type: "amount",
                  value: null,
                },
              ],
              sku: prod.boxSku,
              sellingPrice: prod.price,
              qty: prod?.qty,
            });
          }
        });
        console.log("data", data);
        // const newData = new Set(...data);
        // console.log("newewen", newData);

        try {
          handleAddEditAction([...data], selectedProductIds);
          toast.success("Products added");
          handleClose();
        } catch (error) {
          toast.error(error.message);
        }
      },
    }
  );

  const handleSelect = (id: any, data: any) => {
    console.log("id", id);
    console.log("datassss", data);

    setSelectedProductIds((prev) => {
      return prev.includes(id)
        ? prev.filter((_id) => _id !== id)
        : [...prev, id];
    });

    setSelectedProducts((prev: any) => {
      return selectedProductIds.includes(data?.sku)
        ? prev.filter((d: any) => {
            return d?.sku != data?.sku;
          })
        : [...prev, data];
    });
  };

  const handleSelectAll = (event: any) => {
    if (event.target.checked) {
      const allProductIds = entities.results?.map(
        (product: any) => product._id
      );

      const newProd = entities.results?.map((data: any) => {
        return {
          ...data,
          priceTable: data?.priceTable?.map((d: any) => {
            return {
              id: generateUniqueId(8),
              startQty: 10,
              endQty: 20,
              customPrice: 5,
              type: "percentage",
              value: 5,
            };
          }),
        };
      });

      setSelectedProducts([...newProd]);
      setSelectedProductIds(allProductIds);
    } else {
      setSelectedProductIds([]);
      setSelectedProducts([]);
    }
  };

  // useEffect(() => {
  //   if (entities?.results?.length > 0) {
  //     const data: any[] = [];

  //     entities.results.map((prod: any) => {
  //       if (prod?.type == "item") {
  //         data.push({
  //           productRef: prod?.productRef,
  //           type: prod?.type,
  //           name: prod?.name,
  //           product: prod?.product,
  //           categoryRef: prod?.categoryRef,
  //           category: { name: prod?.category?.name },
  //           priceTable: [
  //             {
  //               id: generateUniqueId(8),
  //               startQty: null,
  //               endQty: null,
  //               customPrice: null,
  //               type: "amount",
  //               value: null,
  //             },
  //           ],
  //           sku: prod.sku,
  //           sellingPrice: prod.price,
  //         });
  //       } else if (prod?.type == "box") {
  //         data.push({
  //           productRef: prod?.product?.productRef,
  //           type: prod?.type,
  //           name: prod?.name,
  //           product: prod?.product,
  //           categoryRef: prod?.product?.categoryRef,
  //           category: { name: prod?.product?.category?.name },
  //           priceTable: [
  //             {
  //               id: generateUniqueId(8),
  //               startQty: null,
  //               endQty: null,
  //               customPrice: null,
  //               type: "amount",
  //               value: null,
  //             },
  //           ],
  //           sku: prod.boxSku,
  //           sellingPrice: prod.price,
  //           qty: prod?.qty,
  //         });
  //       } else if (prod?.type == "crate") {
  //         data.push({
  //           productRef: prod?.product?.productRef,
  //           type: prod?.type,
  //           name: prod?.name,
  //           product: prod?.product,
  //           categoryRef: prod?.product?.categoryRef,
  //           category: { name: prod?.product?.category?.name },
  //           priceTable: [
  //             {
  //               id: generateUniqueId(8),
  //               startQty: null,
  //               endQty: null,
  //               customPrice: null,
  //               type: "amount",
  //               value: null,
  //             },
  //           ],
  //           sku: prod.boxSku,
  //           sellingPrice: prod.price,
  //           qty: prod?.qty,
  //         });
  //       }
  //     });

  //     // setProductList(data);
  //   }
  // }, [entities?.results]);

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

  const lng = localStorage.getItem("currentLanguage");

  const transformedData = useMemo(() => {
    let arr: any[] = [];
    entities?.results?.map(async (d: any) => {
      arr.push({
        key: d?._id,
        _id: d?._id,
        add: (
          <Checkbox
            checked={selectedProductIds.includes(d?._id)}
            onChange={() => handleSelect(d?._id, d)}
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
              {d?.type === "item" && `${d?.productName?.en}, ${d?.name?.en}`}
              {d?.type === "box" &&
                `${d?.product?.name?.en}, ${d?.name[lng]}  [${t("Box")} - ${
                  d?.qty
                } ${t("Unit(s)")}]`}
              {d?.type === "crate" &&
                `${d?.product?.name?.en}, ${d?.name[lng]}  [${t("Crate")} - ${
                  d?.qty
                } ${t("Unit(s)")}]`}
            </Typography>
          </Box>
        ),
        sku: (
          <Typography variant="body2">
            {d?.sku || d?.boxSku || d?.crateSku}
          </Typography>
        ),
      });
    });

    return arr;
  }, [entities?.results, selectedProductIds]);

  useEffect(() => {
    if (open) {
      formik.resetForm();
      const selectedIds = modalData?.map((d: any) => d?.id);
      setSelectedProductIds(selectedIds?.length > 0 ? selectedIds : []);
      setSelectedProducts([...modalData]);
    }
  }, [open, modalData]);

  useEffect(() => {
    const query: any = {
      page: page,
      sort: sort,
      limit: rowsPerPage,
      activeTab: "all",
      _q: debouncedQuery || "",
      companyRef: companyRef,
      locationRefs: locationRef,
      type: "volume",
    };

    if (companyRef && locationRef) {
      find({
        ...query,
      });
    }
  }, [
    page,
    open,
    sort,
    rowsPerPage,
    debouncedQuery,
    formik.values?.categoryRefs,
    companyRef,
    locationRef,
  ]);

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="md"
        open={open}
        onClose={() => {
          formik.resetForm();
          handleClose();
        }}
      >
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
                />
                <SuperTable
                  isLoading={loading}
                  loaderComponent={StockTakeModalRowLoading}
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
                            {t("No Products!")}
                          </Typography>
                        }
                      />
                    </Box>
                  }
                />
              </Box>
            </Stack>
          </form>
        </DialogContent>
        <Divider />

        {/* footer */}
        <DialogActions sx={{ px: 2, mb: 1, mt: 1 }}>
          <LoadingButton
            sx={{ borderRadius: 1 }}
            onClick={(e) => {
              e.preventDefault();
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
