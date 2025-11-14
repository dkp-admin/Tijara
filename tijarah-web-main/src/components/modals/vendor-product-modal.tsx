import { LoadingButton } from "@mui/lab";
import {
  Button,
  Card,
  Checkbox,
  CircularProgress,
  ClickAwayListener,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  OutlinedInput,
  Paper,
  Popper,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  useTheme,
} from "@mui/material";
import SearchMdIcon from "@untitled-ui/icons-react/build/esm/SearchMd";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import * as React from "react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useEntity } from "src/hooks/use-entity";
import { useDebounce } from "use-debounce";
import { useAuth } from "src/hooks/use-auth";
import { Scrollbar } from "../scrollbar";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useQueryClient } from "react-query";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { MoleculeType } from "src/permissionManager";
import TextFieldWrapper from "../text-field-wrapper";
import CloseIcon from "@mui/icons-material/Close";
import { useCurrency } from "src/utils/useCurrency";

interface VendorProductModalProps {
  open?: boolean;
  handleClose?: () => void;
  modalData?: any;
  filteredVariants?: any;
}

interface FeatureProps {
  selectedProducts: any[];
}
type Contact = {
  _id?: string;
  name?: any;
  product: any;
  sku: any;
  hasMultipleVariants: boolean;
};

export const VendorProductModal: React.FC<VendorProductModalProps> = ({
  open,
  handleClose,
  modalData,
  filteredVariants,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const {
    id,
    name: vendorname,
    companyRef,
    companyName,
    origin,
  } = router.query;
  const canAccess = usePermissionManager();

  const canUpdate =
    canAccess(MoleculeType["vendor-product:update"]) ||
    canAccess(MoleculeType["vendor-product:manage"]);
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const searchRef = React.useRef<HTMLDivElement | null>(null);
  const [searchFocused, setSearchFocused] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [debouncedQuery] = useDebounce(searchQuery, 500);
  // const [searchResults, setSearchResults] = React.useState<Contact[]>([]);
  const showSearchResults = !!(searchFocused && searchQuery);
  // const hasSearchResults = searchResults.length > 0;
  const [showError, setShowError] = useState(false);

  const [selectedProducts, setSelectedProducts] =
    React.useState<Contact[]>(null);

  const {
    find: profind,
    entities: productdata,
    loading,
  } = useEntity("product");
  const currency = useCurrency();

  const { create } = useEntity("vendor/add-product");
  const { findOne, updateEntity } = useEntity("vendor-product");
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
  };

  const handleSearchClickAway = React.useCallback((): void => {
    if (showSearchResults) {
      setSearchFocused(false);
    }
  }, [showSearchResults]);

  const handleSearchFocus = React.useCallback((): void => {
    setSearchFocused(true);
  }, []);

  const handleSearchSelect = (product: any, sku: any, selectedVariant: any) => {
    const { _id, name, boxes } = product;

    const isVariantAlreadySelected = formik.values.selectedProducts.some(
      (selectedProduct: any) =>
        selectedProduct.variants.some((variant: any) => variant.sku === sku)
    );

    if (isVariantAlreadySelected) {
      toast(t("Variant is already selected!").toString());

      return;
    }

    const newSelectedProduct = {
      productRef: _id,
      vendorRef: id,
      hasMultipleVariants: product?.variants?.length > 1 ? true : false,
      vendor: { name: vendorname },
      companyRef: companyRef,
      product: name,
      variants: [selectedVariant], // Only the selected variant
      boxes: boxes,
    };

    setSelectedProducts({ ...selectedProducts, ...newSelectedProduct });

    formik.setValues((prevValues: FeatureProps) => ({
      ...prevValues,
      selectedProducts: [...prevValues.selectedProducts, newSelectedProduct],
    }));

    handleSearchClickAway();
  };

  const initialValues: FeatureProps = {
    selectedProducts: [],
  };

  const formik: any = useFormik({
    initialValues,

    onSubmit: async (values): Promise<void> => {
      const data = {
        selectedProducts: values?.selectedProducts?.map((selectedProduct) => {
          return {
            productRef: selectedProduct.productRef,
            hasMultipleVariants: selectedProduct.hasMultipleVariants,
            product: { name: selectedProduct.product },
            companyRef: selectedProduct.companyRef,
            vendor: selectedProduct.vendor,
            vendorRef: selectedProduct.vendorRef,
            boxes: selectedProduct.boxes || [],
            variants: selectedProduct.variants || [],
          };
        }),
      };

      try {
        if (modalData?.itemId) {
          await Promise.all(
            data.selectedProducts.map(async (selectedProduct) => {
              try {
                await updateEntity(modalData.itemId?.toString(), {
                  ...selectedProduct,
                });
                toast.success(t("Vendor Details Updated").toString());
              } catch (updateError) {
                // Handle error for the update operation
                throw updateError; // Rethrow the error to reject the Promise.all
              }
            })
          );

          handleClose();
        } else {
          await Promise.all(
            data.selectedProducts.map(async (selectedProduct) => {
              try {
                await create({ ...selectedProduct });
                await queryClient.invalidateQueries(`find-vendor-product`);

                toast.success(t("New Product Save").toString());
                return;
              } catch (createError) {
                // Handle error for the create operation
                throw createError; // Rethrow the error to reject the Promise.all
              }
            })
          );

          if (data.selectedProducts.length <= 0) {
            toast.error(t("No products added"));
          }

          formik.resetForm();
          setSelectedProducts(null);
          handleClose();
        }
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

  React.useEffect(() => {
    profind({
      page: 0,
      limit: 10,
      activeTab: "all",
      sort: "asc",
      _q: debouncedQuery,
      companyRef: companyRef?.toString(),
    });
  }, [debouncedQuery, companyRef]);

  useEffect(() => {
    if (modalData?.itemId != null) {
      findOne(modalData?.itemId?.toString());
    }
  }, [modalData?.itemId]);

  useEffect(() => {
    if (selectedProducts?.length > 0) {
      const matchingVariant = selectedProducts[
        selectedProducts.length - 1
      ].product.variants.find(
        (variant: any) =>
          variant.sku === selectedProducts[selectedProducts.length - 1].sku
      );

      const matchingBoxes = selectedProducts[
        selectedProducts.length - 1
      ].product.boxes.find(
        (box: any) =>
          box.parentSku === selectedProducts[selectedProducts.length - 1].sku
      );

      formik.setValues({
        vendorRef: id,
        companyRef: companyRef,
        vendor: { name: vendorname },
        product: selectedProducts[selectedProducts.length - 1].product.name,
        productRef: selectedProducts[selectedProducts.length - 1].product._id,
        variants: matchingVariant ? [matchingVariant] : [],
        boxes: matchingBoxes ? [matchingBoxes] : [],
      });
    }
  }, [selectedProducts]);

  useEffect(() => {
    formik.resetForm();
    setSearchQuery("");

    if (modalData) {
      formik.setValues({
        ...formik.values,
        selectedProducts: [
          ...formik.values.selectedProducts,
          {
            vendorRef: modalData.item.vendorRef,
            selectedProduct: modalData.item.selectedProduct,
            vendor: modalData.item.vendor,
            product: modalData.item.product?.name,
            productRef: modalData.item.productRef,
            companyRef: modalData.item.companyRef,
            variants: modalData.item.variants || [],
            boxes: modalData.item.boxes || [],
          },
        ],
      });
    }
  }, [open, modalData]);

  return (
    <Box>
      <Dialog fullWidth maxWidth="md" open={open}>
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
            {modalData ? modalData?.item?.name?.en : t("Add the products")}
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
                setSelectedProducts(null);
                handleClose();
              }}
            />
          </Box>
        </Box>
        <Divider />
        {/* body */}
        <DialogContent>
          <form noValidate onSubmit={formik.handleSubmit}>
            {!modalData && (
              <ClickAwayListener onClickAway={handleSearchClickAway}>
                <Box sx={{ mr: 1 }}>
                  <OutlinedInput
                    fullWidth
                    onChange={handleSearchChange}
                    onFocus={handleSearchFocus}
                    placeholder={t("Search using Product/Variant name/SKU")}
                    ref={searchRef}
                    onKeyPress={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                      }
                    }}
                    startAdornment={
                      <InputAdornment position="start">
                        <SvgIcon>
                          <SearchMdIcon />
                        </SvgIcon>
                      </InputAdornment>
                    }
                    sx={{
                      "&.MuiInputBase-root": {
                        height: 40,
                        minWidth: 260,
                      },
                    }}
                    value={searchQuery}
                  />
                  {showSearchResults && (
                    <Popper
                      anchorEl={searchRef.current}
                      open={searchFocused}
                      placement="bottom-start"
                      sx={{ zIndex: 10000 }}
                    >
                      <Paper
                        elevation={16}
                        sx={{
                          borderColor: "divider",
                          borderStyle: "solid",
                          borderWidth: 1,
                          maxWidth: "1000px",
                          mt: 1,
                          width: "100%",
                        }}
                      >
                        {productdata.results?.length > 0 ? (
                          <>
                            <Box
                              sx={{
                                px: 2,
                                pt: 2,
                              }}
                            >
                              <Typography
                                color="text.secondary"
                                variant="subtitle2"
                              >
                                {t("Products")}
                              </Typography>
                            </Box>
                            <Divider />
                            <Box
                              style={{
                                overflowY: "scroll",
                              }}
                            >
                              {productdata.results?.map((product: any) => (
                                <Grid key={product._id}>
                                  {product.variants.map((variant: any) => {
                                    if (
                                      filteredVariants?.includes(variant?.sku)
                                    ) {
                                      return <></>;
                                    }

                                    return (
                                      <List
                                        key={variant.sku}
                                        style={{
                                          padding: 0,
                                        }}
                                      >
                                        <ListItemButton
                                          key={variant.sku}
                                          onClick={(): void =>
                                            handleSearchSelect(
                                              product,
                                              variant.sku,
                                              variant
                                            )
                                          }
                                        >
                                          <ListItemText
                                            primary={`${product.name.en} ${
                                              product.variants.length > 1
                                                ? variant.name.en
                                                : ""
                                            }`}
                                            secondary={`SKU: ${variant.sku}`}
                                            primaryTypographyProps={{
                                              noWrap: true,
                                              variant: "subtitle2",
                                            }}
                                          />
                                        </ListItemButton>
                                      </List>
                                    );
                                  })}

                                  <Divider />
                                </Grid>
                              ))}
                            </Box>
                          </>
                        ) : (
                          <Box
                            sx={{
                              p: 2,
                              textAlign: "center",
                            }}
                          >
                            {loading ? (
                              <Box
                                sx={{
                                  width: "200px",
                                  height: "50px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <CircularProgress
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                  }}
                                />
                              </Box>
                            ) : (
                              <Box sx={{ textAlign: "center" }}>
                                {" "}
                                <Typography gutterBottom variant="body1">
                                  {t("No result found")}
                                </Typography>
                                <Typography
                                  color="text.secondary"
                                  variant="body2"
                                >
                                  {t(" We couldn't find any matches for")}
                                  &quot;
                                  {searchQuery}&quot;
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        )}
                      </Paper>
                    </Popper>
                  )}
                </Box>
              </ClickAwayListener>
            )}
            {(modalData || selectedProducts) && (
              <Table sx={{ width: "100%" }}>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2">{t("Select")}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {t("Product")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {t("Cost Price")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {t("Selling Price")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{t("Type")}</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formik.values?.selectedProducts?.map(
                    (selectedProduct: any, index: number) => (
                      <React.Fragment key={`selectedProduct_${index}`}>
                        {selectedProduct.variants.map(
                          (variant: any, vIdx: number) => (
                            <TableRow key={`variant_${index}_${vIdx}`}>
                              <TableCell>
                                <Checkbox
                                  checked={variant.status === "active"}
                                  onBlur={formik.handleBlur}
                                  onChange={(e) => {
                                    const updatedSelectedProducts =
                                      formik.values.selectedProducts.map(
                                        (sp: any, spIdx: number) => {
                                          if (spIdx === index) {
                                            const updatedVariants =
                                              sp.variants.map(
                                                (v: any, vIdxInner: number) => {
                                                  if (vIdxInner === vIdx) {
                                                    return {
                                                      ...v,
                                                      status: e.target.checked
                                                        ? "active"
                                                        : "inactive",
                                                    };
                                                  } else {
                                                    return v;
                                                  }
                                                }
                                              );

                                            return {
                                              ...sp,
                                              variants: updatedVariants,
                                            };
                                          } else {
                                            return sp;
                                          }
                                        }
                                      );

                                    formik.setValues({
                                      ...formik.values,
                                      selectedProducts: updatedSelectedProducts,
                                    });
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography
                                  sx={{ textTransform: "capitalize" }}
                                >
                                  {selectedProduct.product?.en}{" "}
                                  {selectedProduct.hasMultipleVariants
                                    ? variant.name.en
                                    : ""}
                                  ,{variant.sku}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ minWidth: "120px" }}>
                                <TextFieldWrapper
                                  variant="standard"
                                  value={variant.costPrice}
                                  error={Boolean(
                                    formik.touched.costPrice &&
                                      formik.errors.costPrice
                                  )}
                                  helperText={
                                    formik.touched.costPrice &&
                                    formik.errors.costPrice
                                  }
                                  onBlur={formik.handleBlur}
                                  onChange={(e): void => {
                                    const updatedSelectedProducts =
                                      formik.values.selectedProducts.map(
                                        (sp: any, spIdx: number) => {
                                          if (spIdx === index) {
                                            const updatedVariants =
                                              sp.variants.map(
                                                (v: any, vIdxInner: number) => {
                                                  if (vIdxInner === vIdx) {
                                                    return {
                                                      ...v,
                                                      costPrice: e.target.value,
                                                    };
                                                  } else {
                                                    return v;
                                                  }
                                                }
                                              );

                                            return {
                                              ...sp,
                                              variants: updatedVariants,
                                            };
                                          } else {
                                            return sp;
                                          }
                                        }
                                      );

                                    formik.setValues({
                                      ...formik.values,
                                      selectedProducts: updatedSelectedProducts,
                                    });
                                  }}
                                  onKeyPress={(event): void => {
                                    const ascii = event.charCode;
                                    const value = (
                                      event.target as HTMLInputElement
                                    ).value;
                                    const decimalCheck =
                                      value.indexOf(".") !== -1;

                                    if (decimalCheck) {
                                      const decimalSplit = value.split(".");
                                      const decimalLength =
                                        decimalSplit[1].length;
                                      if (decimalLength > 1 || ascii === 46) {
                                        event.preventDefault();
                                      } else if (ascii < 48 || ascii > 57) {
                                        event.preventDefault();
                                      }
                                    } else if (
                                      value.length > 7 &&
                                      ascii !== 46
                                    ) {
                                      event.preventDefault();
                                    } else if (
                                      (ascii < 48 || ascii > 57) &&
                                      ascii !== 46
                                    ) {
                                      event.preventDefault();
                                    }
                                  }}
                                  InputProps={{
                                    startAdornment: (
                                      <Typography
                                        color="textSecondary"
                                        variant="body2"
                                        sx={{ mr: 1 }}
                                      >
                                        {currency}
                                      </Typography>
                                    ),
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ minWidth: "120px" }}>
                                {`${currency} ${toFixedNumber(variant.price)}`}
                              </TableCell>
                              <TableCell>
                                <Typography>{t("Item")}</Typography>
                              </TableCell>
                            </TableRow>
                          )
                        )}

                        {selectedProduct.boxes.map(
                          (box: any, boxIdx: number) => (
                            <TableRow key={`box_${index}_${boxIdx}`}>
                              <TableCell>
                                <Checkbox
                                  checked={box.status === "active"}
                                  onBlur={formik.handleBlur}
                                  onChange={(e) => {
                                    const updatedSelectedProducts =
                                      formik.values.selectedProducts.map(
                                        (sp: any, spIdx: number) => {
                                          if (spIdx === index) {
                                            const updatedBoxes = sp.boxes.map(
                                              (b: any, bIdxInner: number) => {
                                                if (bIdxInner === boxIdx) {
                                                  return {
                                                    ...b,
                                                    status: e.target.checked
                                                      ? "active"
                                                      : "inactive",
                                                  };
                                                } else {
                                                  return b;
                                                }
                                              }
                                            );

                                            return {
                                              ...sp,
                                              boxes: updatedBoxes,
                                            };
                                          } else {
                                            return sp;
                                          }
                                        }
                                      );

                                    formik.setValues({
                                      ...formik.values,
                                      selectedProducts: updatedSelectedProducts,
                                    });
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography
                                  sx={{
                                    textTransform: "capitalize",
                                  }}
                                >{`${selectedProduct.product?.en},
                              ${box?.sku}x ${box?.unitCount}  (box)  `}</Typography>
                              </TableCell>
                              <TableCell sx={{ minWidth: "120px" }}>
                                <TextFieldWrapper
                                  variant="standard"
                                  value={box.costPrice}
                                  error={Boolean(
                                    formik.touched.costPrice &&
                                      formik.errors.costPrice
                                  )}
                                  helperText={
                                    formik.touched.costPrice &&
                                    formik.errors.costPrice
                                  }
                                  onBlur={formik.handleBlur}
                                  onChange={(e): void => {
                                    const updatedSelectedProducts =
                                      formik.values.selectedProducts.map(
                                        (sp: any, spIdx: number) => {
                                          if (spIdx === index) {
                                            const updatedBoxes = sp.boxes.map(
                                              (b: any, bIdxInner: number) => {
                                                if (bIdxInner === boxIdx) {
                                                  return {
                                                    ...b,
                                                    costPrice: e.target.value,
                                                  };
                                                } else {
                                                  return b;
                                                }
                                              }
                                            );

                                            return {
                                              ...sp,
                                              boxes: updatedBoxes,
                                            };
                                          } else {
                                            return sp;
                                          }
                                        }
                                      );

                                    formik.setValues({
                                      ...formik.values,
                                      selectedProducts: updatedSelectedProducts,
                                    });
                                  }}
                                  onKeyPress={(event): void => {
                                    const ascii = event.charCode;
                                    const value = (
                                      event.target as HTMLInputElement
                                    ).value;
                                    const decimalCheck =
                                      value.indexOf(".") !== -1;

                                    if (decimalCheck) {
                                      const decimalSplit = value.split(".");
                                      const decimalLength =
                                        decimalSplit[1].length;
                                      if (decimalLength > 1 || ascii === 46) {
                                        event.preventDefault();
                                      } else if (ascii < 48 || ascii > 57) {
                                        event.preventDefault();
                                      }
                                    } else if (
                                      value.length > 7 &&
                                      ascii !== 46
                                    ) {
                                      event.preventDefault();
                                    } else if (
                                      (ascii < 48 || ascii > 57) &&
                                      ascii !== 46
                                    ) {
                                      event.preventDefault();
                                    }
                                  }}
                                  InputProps={{
                                    startAdornment: (
                                      <Typography
                                        color="textSecondary"
                                        variant="body2"
                                        sx={{ mr: 1 }}
                                      >
                                        {currency}
                                      </Typography>
                                    ),
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                {`${currency} ${toFixedNumber(box.price)}`}
                              </TableCell>
                              <TableCell>
                                <Typography
                                  sx={{ textTransform: "capitalize" }}
                                >
                                  {box.type}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </React.Fragment>
                    )
                  )}
                </TableBody>
              </Table>
            )}
          </form>
        </DialogContent>
        <Divider />
        {/* footer */}
        <DialogActions
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "end",
          }}
        >
          <LoadingButton
            sx={{ borderRadius: 1 }}
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              if (!canUpdate) {
                return toast.error(t("You don't have access"));
              }
              setShowError(true);
              formik.handleSubmit();
            }}
            loading={formik.isSubmitting}
            variant="contained"
          >
            {modalData != null ? t("Update") : t("Done")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
