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
import { format } from "date-fns";
import { DeleteOutlined } from "@mui/icons-material";
import ChevronDownIcon from "@untitled-ui/icons-react/build/esm/ChevronDown";
import ChevronRightIcon from "@untitled-ui/icons-react/build/esm/ChevronRight";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import Image01Icon from "@untitled-ui/icons-react/build/esm/Image01";
import { useFormik } from "formik";
import router from "next/router";
import PropTypes from "prop-types";
import {
  ChangeEvent,
  FC,
  Fragment,
  MouseEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { TransformedArrowIcon } from "src/components/TransformedIcons";
import BrandDropdown from "src/components/input/brand-auto-complete";
import GlobalCategoriesDropdown from "src/components/input/global-category-auto-complete";
import { GlobalProductStatusChangeModal } from "src/components/modals/platform/global-products/globalProduct-statusChange-modal";
import { RouterLink } from "src/components/router-link";
import { Scrollbar } from "src/components/scrollbar";
import { useEntity } from "src/hooks/use-entity";
import { tijarahPaths } from "src/paths";
import type { Product } from "src/types/product";
import { toFixedNumber } from "src/utils/toFixedNumber";
import * as Yup from "yup";
import ArrowRightIcon from "@untitled-ui/icons-react/build/esm/ArrowRight";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { MoleculeType } from "src/permissionManager";
import { SuperAdminGlobalProduct } from "src/components/modals/superAdminglobalProduct-modal";
import { SeverityPill } from "src/components/severity-pill";
import { useQueryClient } from "react-query";
import { useCurrency } from "src/utils/useCurrency";

interface GlobalProductListTableProps {
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
  tabIndex?: any;
}

interface UpdateGlobalProduct {
  productNameEn: string;
  productNameAr: string;
  brandRef: string;
  brands: string;
  globalCategories: string;
  globalCategoriesRef: string;
  sku: string;
  defaultPrice: string;
  productStatus: boolean;
  variants: any[];
}

export const GlobalProductListTable: FC<GlobalProductListTableProps> = (
  props
) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const lng = localStorage.getItem("currentLanguage");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isClicked, setIsClicked] = useState(false);
  const [openProductStatusChange, setOpenProductStatusChange] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<string | null>(null);
  const [productData, setProductData] = useState<any>(null);
  const [superAdminGlobalProductModal, setSuperAdminGlobalProductModal] =
    useState(false);
  const { updateEntity } = useEntity("global-products");
  const { updateEntity: updateEntityNotify } = useEntity(
    "global-products/notify"
  );
  const { deleteEntity } = useEntity("updated-product");
  const canAccess = usePermissionManager();
  const editable =
    canAccess(MoleculeType["global-product:update"]) ||
    canAccess(MoleculeType["global-product:manage"]);
  const currency = useCurrency();

  const {
    count = 0,
    items = [],
    onPageChange = () => {},
    onRowsPerPageChange,
    page = 0,
    rowsPerPage = 0,
    isLoading = false,
    loaderComponent: LoaderComponent,
    noDataPlaceholder,
    tabIndex,
  } = props;

  const initialValues: UpdateGlobalProduct = {
    productNameEn: "",
    productNameAr: "",
    brandRef: "",
    brands: "",
    globalCategories: "",
    globalCategoriesRef: "",
    sku: "",
    variants: [],
    defaultPrice: "",
    productStatus: true,
  };

  const validationSchema = Yup.object({
    productNameEn: Yup.string().required(`${t("Product Name is required")}`),
    brandRef: Yup.string().required(`${t("Brand is required")}`),
    globalCategoriesRef: Yup.string().required(`${t("Category is required")}`),
    defaultPrice: Yup.number()
      .typeError(t("Price must be a number"))
      .moreThan(0, t("Price must be greater than 0"))
      .nullable(),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      values.variants[0].price = values.defaultPrice;

      const data = {
        name: {
          en: values?.productNameEn,
          ar: values?.productNameAr,
        },
        status: getProductStatus(values.variants) ? "active" : "inactive",
        brand: {
          name: values?.brands,
        },
        variants: values.variants,
        brandRef: values?.brandRef,
        categoryRef: values?.globalCategoriesRef,
        category: {
          name: values.globalCategories,
        },
      };

      try {
        if (currentProduct) {
          await updateEntity(currentProduct?.toString(), { ...data });
          toast.success(`${t("Product Updated")}`);
          setCurrentProduct(null);
          return;
        }
      } catch (err) {
        toast.error("Something went wrong!");
      }
    },
  });

  const canEditPrice = (px: any) => {
    if (px.length > 1) {
      return true;
    } else if (!editable) {
      return true;
    } else {
      return false;
    }
  };

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
    router.push(
      `${tijarahPaths.platform?.globalProducts?.create}?id=${product?._id}`
    );
  };

  const handleStatusChange = async (
    id: string,
    variants: any[],
    checked: boolean
  ) => {
    const variantsList = variants;
    variantsList[0].status = checked ? "active" : "inactive";

    const status = getProductStatus(variantsList) ? "active" : "inactive";

    await updateEntity(id, {
      status: status,
      variants: variantsList,
    });
  };

  const getItemPrice = (variants: Array<any>) => {
    const allPrices = variants.flatMap((variant: any) => variant.price);
    const sortedPice = allPrices.sort((p1, p2) => (p1 || 0) - (p2 || 0));
    const hasZero =
      sortedPice.findIndex(
        (t) => !t || t === null || t == undefined || t == 0
      ) !== -1;
    const filteredArray = sortedPice.filter((p) => p > 0);
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
    const allPrices = variants.flatMap((variant: any) => variant.oldPrice);
    const sortedPice = allPrices.sort((p1, p2) => (p1 || 0) - (p2 || 0));
    const hasZero =
      sortedPice.findIndex(
        (t) => !t || t === null || t == undefined || t == 0
      ) !== -1;
    const filteredArray = sortedPice.filter((p) => p > 0);
    let str = ``;
    if (filteredArray.length === 1) {
      str += `${toFixedNumber(filteredArray[0])}`;
    } else if (filteredArray.length > 1) {
      str += `${toFixedNumber(filteredArray[0])} - ${toFixedNumber(
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
    const allPrices = variants.flatMap((variant: any) => variant.costPrice);
    const sortedPice = allPrices.sort((p1, p2) => (p1 || 0) - (p2 || 0));
    const hasZero =
      sortedPice.findIndex(
        (t) => !t || t === null || t == undefined || t == 0
      ) !== -1;
    const filteredArray = sortedPice.filter((p) => p > 0);
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
    const allPrices = variants.flatMap((variant: any) => variant.oldCostPrice);
    const sortedPice = allPrices.sort((p1, p2) => (p1 || 0) - (p2 || 0));
    const hasZero =
      sortedPice.findIndex(
        (t) => !t || t === null || t == undefined || t == 0
      ) !== -1;
    const filteredArray = sortedPice.filter((p) => p > 0);
    let str = ``;
    if (filteredArray.length === 1) {
      str += `${toFixedNumber(filteredArray[0])}`;
    } else if (filteredArray.length > 1) {
      str += `${toFixedNumber(filteredArray[0])} - ${currency} ${toFixedNumber(
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

  const getProductStatus = (variants: any) => {
    const varList = variants?.filter(
      (variant: any) => variant.status === "active"
    );

    return varList?.length > 0;
  };

  const handleNotificationClick = async (id: string, product: any[]) => {
    try {
      await updateEntityNotify(id, {
        notify: true,
        pushed: true,
        pushedDate: new Date(),
        updatedBy: "SUPER_ADMIN",
      });
      queryClient.invalidateQueries("find-global-products");
      toast("Notify sent to merchant");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsClicked(false);
    }
  };

  const handleDeleteUpdatedProdut = async (id: any) => {
    try {
      await deleteEntity(id);
      toast.success(t("Removed").toString());
    } catch (err) {
      toast.error(err.message);
    }
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
              <TableCell>{t("Selling Price")}</TableCell>
              <TableCell>{t("Cost Price")}</TableCell>
              {tabIndex === 0 && <TableCell>{t("Type")}</TableCell>}
              {tabIndex === 1 && <TableCell>{t("Merchant")}</TableCell>}
              {tabIndex === 0 && <TableCell>{t("Pushed")}</TableCell>}
              <TableCell>{t("Status")}</TableCell>
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
                              variants: product.variants,
                              globalCategories: product?.category?.name,
                              globalCategoriesRef: product?.categoryRef,
                              sku: product?.variants?.[0]?.sku,
                              defaultPrice: product?.variants?.[0]?.price,
                              productStatus: true,
                            });
                          }
                          handleProductToggle(product._id);
                        }}
                      >
                        {tabIndex != 1 && (
                          <SvgIcon>
                            {isCurrent ? (
                              <ChevronDownIcon />
                            ) : (
                              <TransformedArrowIcon name={"chevron-right"} />
                            )}
                          </SvgIcon>
                        )}
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
                        {product?.image ? (
                          <Box
                            sx={{
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "neutral.50",
                              backgroundImage: `url(${product?.image})`,
                              backgroundSize: "cover",
                              borderRadius: 1,
                              height: 80,
                              width: 80,
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              alignItems: "center",
                              backgroundColor: "neutral.50",
                              justifyContent: "center",
                              borderRadius: 1,
                              display: "flex",
                              height: 80,
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
                            flex: 1,
                            cursor: "pointer",
                            ml: 2,
                          }}
                        >
                          <Typography variant="subtitle2">
                            {product?.name?.[lng] || product?.name?.en}
                          </Typography>
                          <Typography color="text.secondary" variant="body2">
                            {` ${"in"} ${product.category?.name || "NA"}`}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>{product?.brand?.name || "NA"}</TableCell>

                    <TableCell>
                      {getItemPrice(product?.variants)}{" "}
                      {
                        <Typography style={{ textDecoration: "line-through" }}>
                          {getItemPevPrice(product?.variants)}{" "}
                        </Typography>
                      }
                    </TableCell>

                    <TableCell>
                      {getItemCostPrice(product?.variants)}{" "}
                      <Typography style={{ textDecoration: "line-through" }}>
                        {getItemPevCostPrice(product?.variants)}{" "}
                      </Typography>
                    </TableCell>
                    {tabIndex === 0 && (
                      <TableCell>
                        {product?.type === "UPDATED"
                          ? "Updated"
                          : "Newly Added"}
                      </TableCell>
                    )}
                    {tabIndex === 0 && (
                      <TableCell>
                        {" "}
                        <Typography variant="body2">
                          <Typography>
                            {" "}
                            {format(
                              new Date(product?.updatedAt),
                              "dd/MM/yyyy, h:mma"
                            )}
                          </Typography>

                          {!product?.pushed && (
                            <SeverityPill>
                              <Typography
                                onClick={() => {
                                  if (!editable) {
                                    return toast.error(
                                      t("You don't have access")
                                    );
                                  }
                                  if (isClicked) {
                                    return;
                                  }
                                  setIsClicked(true);
                                  setTimeout(() => {
                                    setSelectedProduct(null);
                                    handleNotificationClick(
                                      product?._id,
                                      product
                                    );
                                  }, 100);
                                }}
                                style={{
                                  cursor: "pointer",
                                  display: isClicked ? "none" : null,
                                }}
                              >
                                {"NOTIFY"}
                              </Typography>
                            </SeverityPill>
                          )}
                        </Typography>
                      </TableCell>
                    )}

                    {tabIndex === 1 && (
                      <TableCell>
                        <Typography variant="body2">
                          {product?.company?.name || "Company Name"}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell>
                      <FormControlLabel
                        sx={{
                          width: "120px",
                          display: "flex",
                          flexDirection: "row",
                        }}
                        control={
                          <Switch
                            checked={getProductStatus(product.variants)}
                            color="primary"
                            edge="end"
                            name="productStatus"
                            onChange={(e) => {
                              if (!editable) {
                                return toast.error(t("You don't have access"));
                              }

                              if (product.variants?.length > 1) {
                                setSelectedProduct(product);
                                setOpenProductStatusChange(true);
                                return;
                              }
                              setSelectedProduct(null);
                              handleStatusChange(
                                product?._id,
                                product?.variants,
                                e.target.checked
                              );
                            }}
                            value={getProductStatus(product.variants)}
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
                    </TableCell>

                    <TableCell align="right">
                      <Box style={{ display: "flex", flexDirection: "row" }}>
                        {tabIndex === 0 && (
                          <IconButton
                            component={RouterLink}
                            href={`${tijarahPaths.platform.globalProducts.create}?id=${product?._id}&type=global-products`}
                            sx={{ mr: 2 }}
                          >
                            <TransformedArrowIcon name={"arrow-right"} />
                          </IconButton>
                        )}

                        {tabIndex === 1 && (
                          <IconButton
                            component={RouterLink}
                            href={`${tijarahPaths.platform.globalProducts.create}?newid=${product?._id}&type=updated-product`}
                            sx={{ mr: 2 }}
                          >
                            <TransformedArrowIcon name={"arrow-right"} />
                          </IconButton>
                        )}

                        {tabIndex === 1 && (
                          <IconButton
                            onClick={(e) => {
                              handleDeleteUpdatedProdut(product?._id);
                            }}
                            sx={{ mr: 2 }}
                          >
                            <DeleteOutlined fontSize="medium" color={"error"} />
                          </IconButton>
                        )}
                      </Box>
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
                              <Grid container spacing={5}>
                                <Grid item md={6} xs={12}>
                                  <TextField
                                    disabled={!editable}
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
                                    disabled={!editable}
                                    required
                                    error={
                                      formik?.touched?.brandRef &&
                                      formik.errors.brandRef
                                    }
                                    onChange={(id, name) => {
                                      formik.handleChange("brandRef")(id || "");
                                      formik.handleChange("brands")(name || "");
                                    }}
                                    selectedId={formik?.values?.brandRef}
                                    selectedName={formik.values.brands}
                                    label={t("Brands")}
                                    id="brandRef"
                                  />
                                </Grid>
                                <Grid item md={6} xs={12}>
                                  <GlobalCategoriesDropdown
                                    disabled={!editable}
                                    required
                                    error={
                                      formik?.touched?.globalCategoriesRef &&
                                      formik?.errors?.globalCategoriesRef
                                    }
                                    onChange={(id, name) => {
                                      formik.handleChange(
                                        "globalCategoriesRef"
                                      )(id || "");
                                      formik.handleChange("globalCategories")(
                                        name || ""
                                      );
                                    }}
                                    selectedId={
                                      formik?.values?.globalCategoriesRef
                                    }
                                    label={t("Global Categories")}
                                    id="globalCategoriesRef"
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
                                    disabled
                                    defaultValue={formik.values.defaultPrice}
                                    fullWidth
                                    label={t("Price")}
                                    error={
                                      (formik?.touched?.defaultPrice &&
                                        formik.errors.defaultPrice) as any
                                    }
                                    helperText={
                                      (formik.touched.defaultPrice &&
                                        formik.errors.defaultPrice) as any
                                    }
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
                                  />
                                </Grid>

                                <Grid
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
                                      width: "120px",
                                      display: "flex",
                                      flexDirection: "row",
                                    }}
                                    control={
                                      <Switch
                                        disabled={!editable}
                                        checked={getProductStatus(
                                          product.variants
                                        )}
                                        color="primary"
                                        edge="end"
                                        name="productStatus"
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
                                </Grid>
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
                                if (!editable) {
                                  return toast.error(
                                    t("You don't have access")
                                  );
                                }
                                formik.handleSubmit();
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

      <GlobalProductStatusChangeModal
        open={openProductStatusChange}
        variants={selectedProduct?.variants || []}
        onChange={async (changedArray) => {
          const data = {
            ...selectedProduct,
            variants: changedArray,
          };

          const status = getProductStatus(changedArray) ? "active" : "inactive";

          await updateEntity(selectedProduct._id, { ...data, status: status });
        }}
        handleClose={() => setOpenProductStatusChange(false)}
      />

      <SuperAdminGlobalProduct
        product={productData}
        open={superAdminGlobalProductModal}
        handleClose={() => setSuperAdminGlobalProductModal(false)}
      />
    </div>
  );
};

GlobalProductListTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
};
