import {
  Box,
  Button,
  CardContent,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  SvgIcon,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ChevronDownIcon from "@untitled-ui/icons-react/build/esm/ChevronDown";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import {
  ChangeEvent,
  FC,
  Fragment,
  MouseEvent,
  useCallback,
  useState,
} from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Scrollbar } from "src/components/scrollbar";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import type { Product } from "src/types/product";
import { toFixedNumber } from "src/utils/toFixedNumber";
import * as Yup from "yup";
import { TransformedArrowIcon } from "../TransformedIcons";
import BrandDropdown from "../input/brand-auto-complete";
import CategoryDropdown from "../input/category-auto-complete";
import { ProductStatusChangeModal } from "../modals/product-statusChange-modal";
import TextFieldWrapper from "../text-field-wrapper";
import { useCurrency } from "src/utils/useCurrency";

interface CompositeProductListTableProps {
  origin?: string;
  companyRef?: string;
  companyName?: string;
  industry?: string;
  count?: number;
  items?: Product[];
  onPageChange?: (
    event: MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  page?: number;
  rowsPerPage?: number;
  isLoading?: boolean;
  loaderComponent?: any;
  noDataPlaceholder?: React.ReactElement<any, any>;
}

interface UpdateProduct {
  productNameEn: string;
  productNameAr: string;
  brandRef: string;
  brands: string;
  categoryRef: string;
  category: string;
  sku: string;
  defaultPrice: string;
  status: boolean;
  variants: any[];
}

export const CompositeProductListTable: FC<CompositeProductListTableProps> = (
  props
) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { updateEntity } = useEntity("product");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentProduct, setCurrentProduct] = useState<string | null>(null);
  const [openProductStatusChange, setOpenProductStatusChange] = useState(false);

  const {
    origin,
    companyRef,
    companyName,
    industry,
    count = 0,
    items = [],
    onPageChange = () => {},
    onRowsPerPageChange,
    page = 0,
    rowsPerPage = 0,
    isLoading = false,
    loaderComponent: LoaderComponent,
    noDataPlaceholder,
  } = props;

  const canAccess = usePermissionManager();
  const router = useRouter();
  const currency = useCurrency();

  const isEditable =
    canAccess(MoleculeType["product:update"]) ||
    canAccess(MoleculeType["product:manage"]);

  const initialValues: UpdateProduct = {
    productNameEn: "",
    productNameAr: "",
    brandRef: "",
    brands: "",
    categoryRef: "",
    category: "",
    sku: "",
    variants: [],
    defaultPrice: "",
    status: true,
  };

  const validationSchema = Yup.object({
    productNameEn: Yup.string().required(`${t("Product Name is required")}`),
    brandRef: Yup.string().required(`${t("Brand is required")}`),
    categoryRef: Yup.string().required(`${t("Category is required")}`),
    defaultPrice: Yup.number()
      .typeError(t("Price must be a number"))
      .moreThan(0, t("Price must be greater than 0"))
      .nullable(),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const oldPrice = values.variants[0].price;
      values.variants[0].price = values.defaultPrice;
      const prices = values.variants[0].prices;
      const modifiedPrices = prices.map((p: any) => {
        if (p.price === oldPrice) {
          return {
            ...p,
            price: values.defaultPrice,
          };
        } else {
          return p;
        }
      });

      values.variants[0].prices = modifiedPrices;

      const data = {
        name: {
          en: values?.productNameEn,
          ar: values?.productNameAr,
        },
        brandRef: values?.brandRef,
        brand: {
          name: values?.brands,
        },
        categoryRef: values?.categoryRef,
        category: {
          name: values.category,
        },
        variants: values.variants,
      };

      try {
        if (currentProduct) {
          await updateEntity(currentProduct?.toString(), { ...data });

          toast.success(`${t("Product Updated")}`);
          setCurrentProduct(null);
        }
      } catch (err) {
        toast.error("Something went wrong!");
      }
    },
  });

  const handleProductToggle = useCallback((productId: string): void => {
    setCurrentProduct((prevProductId) => {
      if (prevProductId === productId) {
        return null;
      }

      return productId;
    });
  }, []);

  const handleProductClose = useCallback((): void => {
    setCurrentProduct(null);
  }, []);

  const handleViewMore = (product: any): void => {
    router.push({
      pathname: tijarahPaths.catalogue?.compositeProducts.create,
      query: {
        id: product?._id,
        companyRef: companyRef,
        companyName: companyName,
        industry: industry,
      },
    });
  };

  const handleStatusChange = async (id: string, checked: boolean) => {
    await updateEntity(id, {
      status: checked ? "active" : "inactive",
    });
  };

  const getLocations = (variants: any) => {
    if (variants?.length > 0) {
      if (variants[0].assignedToAll) {
        return "All Locations";
      } else {
        const locations = variants[0].locations.map((location: any) => {
          return location.name;
        });

        let data = locations.slice(0, 2).join(", ");

        return locations?.length >= 3
          ? data + ` +${locations?.length - 2}`
          : data || "NA";
      }
    } else {
      return "NA";
    }
  };

  const getStock = (variants: any) => {
    if (variants?.length > 0) {
      const stockCount = variants.reduce((prev: number, variant: any) => {
        if (
          !variant?.stockConfiguration ||
          variant?.stockConfiguration.length === 0
        )
          return prev;

        let total = 0;

        for (let item of variant.stockConfiguration) {
          if (
            variant.assignedToAll ||
            (variant.locationRefs &&
              variant.locationRefs.includes(item.locationRef))
          ) {
            if (item.tracking) {
              total += item.count;
            }
          }
        }

        return prev + total;
      }, 0);

      return `${stockCount || "-"}`;
    } else {
      return "-";
    }
  };

  const getItemPrice = (variants: Array<any>) => {
    const allPrices: any = variants?.flatMap((variant: any) => variant?.price);
    const sortedPice = allPrices?.sort(
      (p1: any, p2: any) => (p1 || 0) - (p2 || 0)
    );
    const hasZero =
      sortedPice?.findIndex(
        (t: any) => !t || t === null || t == undefined || t == 0
      ) !== -1;
    const filteredArray = sortedPice?.filter((p: any) => p > 0);
    let str = ``;
    if (filteredArray?.length === 1) {
      str += `${currency} ${toFixedNumber(filteredArray[0])}`;
    } else if (filteredArray?.length > 1) {
      str += `${currency} ${toFixedNumber(
        filteredArray[0]
      )} - ${currency} ${toFixedNumber(
        filteredArray[filteredArray.length - 1]
      )}`;
    }

    if (hasZero) {
      if (filteredArray?.length > 0) {
        str += ` , `;
      }
      str += `Custom Price`;
    }

    return str;
  };

  const getProductStatus = (variants: any) => {
    const varList = variants?.filter(
      (variant: any) => variant.status === "active"
    );

    return varList?.length > 0;
  };

  const lng = localStorage.getItem("currentLanguage");

  const getProductNameInitial = (product: any) => {
    const name = product.name.en?.split(" ");

    return name?.length > 1
      ? name[0]?.charAt(0)?.toUpperCase() + name[1]?.charAt(0)?.toUpperCase()
      : name[0]?.charAt(0)?.toUpperCase();
  };

  return (
    <div>
      <Scrollbar>
        <Table sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell width="25%">{t("Product Name")}</TableCell>
              <TableCell>{t("Brand")}</TableCell>
              <TableCell>{t("Locations")}</TableCell>
              <TableCell sx={{ ml: 3 }}>{t("Price")}</TableCell>
              <TableCell sx={{ ml: 3 }}>{t("Stock")}</TableCell>
              <TableCell sx={{ ml: 3 }}>{t("Status")}</TableCell>
              <TableCell align="center">{t("Actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items?.map((product: any) => {
              const isCurrent = product._id === currentProduct;

              return (
                <Fragment key={product._id}>
                  <TableRow hover key={product._id}>
                    <TableCell
                      padding="checkbox"
                      sx={{
                        ...(isCurrent && {
                          position: "relative",
                          "&:after": {
                            position: "absolute",
                            content: '" "',
                            top: 0,
                            left: 0,
                            backgroundColor: "primary.main",
                            width: 3,
                            height: "calc(100% + 1px)",
                          },
                        }),
                      }}
                      width="25%"
                    >
                      <IconButton
                        onClick={() => {
                          if (!isCurrent) {
                            formik.setValues({
                              productNameEn: product?.name?.en,
                              productNameAr: product?.name?.ar,
                              brandRef: product?.brandRef,
                              brands: product?.brand?.name,
                              categoryRef: product?.categoryRef,
                              category: product?.category?.name,
                              sku: product?.variants?.[0]?.sku,
                              variants: product.variants,
                              defaultPrice: product?.variants?.[0]?.price,
                              status: product.status === "active",
                            });
                          }
                          handleProductToggle(product._id);
                        }}
                      >
                        <SvgIcon>
                          {isCurrent ? (
                            <ChevronDownIcon />
                          ) : (
                            <TransformedArrowIcon name="chevron-right" />
                          )}
                        </SvgIcon>
                      </IconButton>
                    </TableCell>
                    <TableCell width="25%">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {product.image ? (
                          <Box
                            sx={{
                              alignItems: "center",
                              backgroundColor: "neutral.50",
                              backgroundImage: `url(${product?.image})`,
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
                              width: 80,
                              height: 80,
                              borderRadius: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: (theme) =>
                                theme.palette.mode === "dark"
                                  ? "#0C935680"
                                  : "#006C3580",
                            }}
                          >
                            <Typography variant="h6" color="#fff">
                              {getProductNameInitial(product)}
                            </Typography>
                          </Box>
                        )}
                        <Box
                          sx={{
                            flex: 1,
                            cursor: "pointer",
                            ml: 2,
                          }}
                        >
                          <Typography variant="subtitle2">
                            {product.name?.[lng] || product.name.en}
                          </Typography>
                          <Typography color="text.secondary" variant="body2">
                            in {product?.category?.name || "NA"}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>{product?.brand?.name || "NA"}</TableCell>
                    <TableCell>{getLocations(product.variants)}</TableCell>

                    <TableCell>
                      {getItemPrice(product.variants) as any}
                    </TableCell>
                    <TableCell>{getStock(product.variants) || "-"}</TableCell>
                    <TableCell>
                      <FormControlLabel
                        sx={{
                          width: "120px",
                          display: "flex",
                          flexDirection: "row",
                        }}
                        control={
                          <Switch
                            checked={product.status === "active"}
                            color="primary"
                            edge="end"
                            name="status"
                            onChange={(e) => {
                              if (!isEditable) {
                                return toast.error(t("You don't have access"));
                              }
                              handleStatusChange(product._id, e.target.checked);
                            }}
                            value={product.status === "active"}
                            sx={{ mr: 0.2 }}
                          />
                        }
                        label={
                          product.status === "active"
                            ? t("Active")
                            : t("Deactivated")
                        }
                      />
                    </TableCell>

                    <TableCell align="right">
                      <IconButton
                        onClick={() => {
                          router.push({
                            pathname:
                              tijarahPaths.catalogue?.compositeProducts.create,
                            query: {
                              id: product?._id,
                              companyRef: companyRef,
                              companyName: companyName,
                              origin: origin,
                              industry: industry,
                            },
                          });
                        }}
                        sx={{ mr: 2 }}
                      >
                        <SvgIcon>
                          <TransformedArrowIcon name="arrow-right" />
                        </SvgIcon>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  {isCurrent && (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        sx={{
                          p: 0,
                          position: "relative",
                          "&:after": {
                            position: "absolute",
                            content: '" "',
                            top: 0,
                            left: 0,
                            backgroundColor: "primary.main",
                            width: 3,
                            height: "calc(100% + 1px)",
                          },
                        }}
                      >
                        <CardContent>
                          <Grid container spacing={3}>
                            <Grid item md={6} xs={12}>
                              <Typography variant="h6">
                                {t("Basic Details")}
                              </Typography>
                              <Divider sx={{ my: 2 }} />
                              <Grid container spacing={3}>
                                <Grid item md={6} xs={12}>
                                  <TextFieldWrapper
                                    disabled={!isEditable}
                                    fullWidth
                                    label={t("Product Name (English)")}
                                    name="productNameEn"
                                    error={Boolean(
                                      formik.touched.productNameEn &&
                                        formik.errors.productNameEn
                                    )}
                                    helperText={
                                      (formik.touched.productNameEn &&
                                        formik.errors.productNameEn) as any
                                    }
                                    onBlur={formik.handleBlur}
                                    onChange={(e) => {
                                      formik.handleChange(e);
                                    }}
                                    required
                                    value={formik.values.productNameEn}
                                  />
                                </Grid>
                                <Grid item md={6} xs={12}>
                                  <BrandDropdown
                                    disabled={!isEditable}
                                    required
                                    error={
                                      formik?.touched?.brandRef &&
                                      formik.errors.brandRef
                                    }
                                    onChange={(id, name) => {
                                      formik.handleChange("brandRef")(id || "");
                                      formik.handleChange("brands")(name || "");
                                    }}
                                    selectedId={formik.values.brandRef}
                                    selectedName={formik.values.brands}
                                    label={t("Brands")}
                                    id="Brands"
                                  />
                                </Grid>
                                <Grid item md={6} xs={12}>
                                  <CategoryDropdown
                                    disabled={!isEditable}
                                    companyRef={companyRef}
                                    required
                                    error={
                                      formik?.touched?.categoryRef &&
                                      formik.errors.categoryRef
                                    }
                                    onChange={(id, name) => {
                                      formik.handleChange("categoryRef")(
                                        id || ""
                                      );
                                      formik.handleChange("category")(
                                        name || ""
                                      );
                                    }}
                                    selectedId={formik?.values?.categoryRef}
                                    label={
                                      user?.company?.industry === "retail" ||
                                      industry === "retail"
                                        ? t("Category")
                                        : t("Reporting Category")
                                    }
                                    id="category"
                                  />
                                </Grid>
                                <Grid item md={6} xs={12}>
                                  <TextField
                                    defaultValue={formik.values.sku}
                                    disabled
                                    fullWidth
                                    label={t("SKU")}
                                    name="sku"
                                  />
                                </Grid>
                              </Grid>
                            </Grid>
                            <Grid item md={6} xs={12}>
                              <Typography variant="h6">
                                {t("Pricing")}
                              </Typography>
                              <Divider sx={{ my: 2 }} />
                              <Grid container spacing={3}>
                                <Grid item md={6} xs={12}>
                                  <TextField
                                    defaultValue={formik.values.defaultPrice}
                                    fullWidth
                                    error={
                                      (formik?.touched?.defaultPrice &&
                                        formik.errors.defaultPrice) as any
                                    }
                                    helperText={
                                      (formik.touched.defaultPrice &&
                                        formik.errors.defaultPrice) as any
                                    }
                                    label={t("Price")}
                                    name="defaultPrice"
                                    onChange={formik.handleChange}
                                    InputProps={{
                                      startAdornment: (
                                        <Typography
                                          color="textSecondary"
                                          variant="body2"
                                          sx={{ mr: 1, mt: 2.4 }}
                                        >
                                          {currency}
                                        </Typography>
                                      ),
                                    }}
                                    disabled
                                  />
                                </Grid>

                                {/* <Grid
                                  item
                                  md={6}
                                  xs={12}
                                  sx={{
                                    alignItems: "center",
                                    display: "flex",
                                  }}
                                >
                                  <FormControlLabel
                                    sx={{
                                      minWidth: "120px",
                                      display: "flex",
                                      flexDirection: "row",
                                    }}
                                    control={
                                      <Switch
                                        checked={getProductStatus(
                                          product.variants
                                        )}
                                        color="primary"
                                        edge="end"
                                        name="status"
                                        onChange={(e) => {
                                          if (product.variants?.length > 1) {
                                            setSelectedProduct(product);
                                            setOpenProductStatusChange(true);
                                          } else {
                                            setSelectedProduct(null);
                                            handleStatusChange(
                                              product?._id,
                                              product?.variants,
                                              e.target.checked
                                            );
                                          }
                                        }}
                                        value={
                                          getProductStatus(product.variants)
                                            ? true
                                            : false
                                        }
                                        sx={{
                                          mr: 0.2,
                                        }}
                                      />
                                    }
                                    label={
                                      getProductStatus(product.variants)
                                        ? t("Active")
                                        : t("Deactivated")
                                    }
                                  />
                                </Grid> */}
                              </Grid>
                            </Grid>
                          </Grid>
                        </CardContent>
                        <Divider />
                        <Stack
                          alignItems="center"
                          direction="row"
                          justifyContent="space-between"
                          sx={{ p: 2 }}
                        >
                          <Stack
                            alignItems="center"
                            direction="row"
                            spacing={2}
                          >
                            <Button
                              onClick={() => {
                                if (isEditable) {
                                  formik.handleSubmit();
                                } else {
                                  toast.error(t("you don't have access"));
                                }
                              }}
                              type="submit"
                              variant="contained"
                            >
                              {t("Update")}
                            </Button>
                            <Button
                              color="inherit"
                              onClick={handleProductClose}
                            >
                              {t("Cancel")}
                            </Button>
                          </Stack>
                          <div>
                            <Button
                              onClick={() => handleViewMore(product)}
                              color="primary"
                              sx={{
                                m: 1,
                                ml: "auto",
                              }}
                            >
                              {t("View More")}
                            </Button>
                          </div>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}

            {isLoading && count == 0 && LoaderComponent && <LoaderComponent />}
          </TableBody>
        </Table>

        {!isLoading && count === 0 && noDataPlaceholder}
      </Scrollbar>
      <TablePagination
        component="div"
        count={count}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      {openProductStatusChange && (
        <ProductStatusChangeModal
          open={openProductStatusChange}
          variants={selectedProduct?.variants || []}
          onChange={async (changedArray) => {
            const data = {
              ...selectedProduct,
              variants: changedArray,
            };

            const status = getProductStatus(changedArray)
              ? "active"
              : "inactive";

            await updateEntity(selectedProduct._id, {
              ...data,
              status: status,
            });
          }}
          handleClose={() => setOpenProductStatusChange(false)}
        />
      )}
    </div>
  );
};

CompositeProductListTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
};
