import {
  Box,
  Button,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { UNIT_VALUES } from "src/utils/constants";
import TextFieldWrapper from "../text-field-wrapper";
import { DeleteOutlined } from "@mui/icons-material";
import { useCurrency } from "src/utils/useCurrency";

export function PriceList({ formik, onRemoveItem, selectedLocation }: any) {
  const { t } = useTranslation();
  const [openPriceUpdateModal, setOpenPriceUpdateModal] = useState(false);
  const [idx, setIdx] = useState(null);
  const router = useRouter();
  const { id, companyRef, companyName, origin } = router.query;
  const currency = useCurrency();

  const lng = localStorage.getItem("currentLanguage");
  const handleProductFieldChange = useCallback(
    (fieldName: string, value: any, index: number) => {
      const currentItem = formik.values.products[index];

      let updatedCost = currentItem.sellingPrice;
      let updatedPrice = currentItem.price;

      if (fieldName === "price") {
        updatedPrice = value === "" || value === 0 ? 0 : Number(value);
      } else if (fieldName === "sellingPrice") {
        updatedCost = value === "" || value === 0 ? 0 : value;
      }

      formik.setFieldValue(`products[${index}].sellingPrice`, updatedCost);
      formik.setFieldValue(`products[${index}].price`, updatedPrice);
    },
    [formik.values.products]
  );

  const handleProductPriceFieldChange = useCallback(
    (
      fieldName: string,
      value: any,
      productIndex: number,
      priceIndex: number
    ) => {
      formik.setFieldValue(
        `products[${productIndex}].prices[${priceIndex}].${fieldName}`,
        value
      );
    },
    [formik.values.products]
  );

  return (
    <>
      <TableBody>
        {formik.values.products?.length > 0 ? (
          formik.values?.products?.map((product: any, index: any) => {
            return (
              <TableRow key={product.sku}>
                <TableCell sx={{ width: "25%" }}>
                  <Typography
                    variant="body2"
                    sx={{ textTransform: "capitalize" }}
                  >
                    {id
                      ? product?.name
                      : product?.type === "item" &&
                        `${product?.name[lng] || product?.name?.en} ${
                          product.hasMultipleVariants
                            ? product?.variant?.name[lng] ||
                              product?.variant?.name?.en
                            : ""
                        }, ${product.sku}`}
                    {product?.type === "box" &&
                      `${product?.name[lng] || product?.name?.en} ${
                        product.hasMultipleVariants
                          ? product?.variant?.name[lng] ||
                            product?.variant?.name?.en
                          : ""
                      }  [${t("Box")} - ${product?.unitCount} ${t(
                        "Unit(s)"
                      )}] ${product.sku}`}
                  </Typography>
                </TableCell>
                <TableCell sx={{ width: "25%" }}>
                  <Typography
                    variant="body2"
                    sx={{ textTransform: "capitalize" }}
                  >
                    {UNIT_VALUES[product?.unit] || "NA"}
                  </Typography>
                </TableCell>
                <TableCell sx={{ width: "25%" }}>
                  <Typography variant="body2">
                    <TextFieldWrapper
                      fullWidth
                      variant="standard"
                      name="price"
                      disabled={Boolean(id)}
                      value={formik.values?.products?.[index]?.price || 0}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        if (!/[^0-9.]/.test(inputValue)) {
                          handleProductFieldChange("price", inputValue, index);
                        }
                      }}
                      onPaste={(e) => {
                        const pastedData = e.clipboardData.getData("Text");
                        if (/[^0-9.]/.test(pastedData)) {
                          e.preventDefault();
                        }
                      }}
                      error={Boolean(
                        formik.touched.products &&
                          formik.errors.products &&
                          formik.touched.products?.[index]?.price &&
                          formik.errors.products?.[index]?.price
                      )}
                      helperText={
                        formik.touched.products &&
                        formik.errors.products &&
                        formik.touched.products?.[index]?.price &&
                        formik.errors.products?.[index]?.price
                      }
                      onKeyPress={(event): void => {
                        const ascii = event.charCode;
                        const value = (event.target as HTMLInputElement).value;
                        const decimalCheck = value.indexOf(".") !== -1;

                        if (decimalCheck) {
                          const decimalSplit = value.split(".");
                          const decimalLength = decimalSplit[1].length;
                          if (decimalLength > 1 || ascii === 46) {
                            event.preventDefault();
                          } else if (ascii < 48 || ascii > 57) {
                            event.preventDefault();
                          }
                        } else if (value.length > 5 && ascii !== 46) {
                          event.preventDefault();
                        } else if ((ascii < 48 || ascii > 57) && ascii !== 46) {
                          event.preventDefault();
                        }
                      }}
                      // onBlur={formik.handleBlur(`products[${index}].price`)}
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
                  </Typography>
                  <Typography variant="body2" color={"#ff9100"}>
                    {Number(formik.values.products?.[index]?.price) > 9999.99
                      ? `${t("Amount exceeds 4 digits")}`
                      : ""}
                  </Typography>
                </TableCell>
                <TableCell sx={{ width: "25%" }}>
                  <Typography variant="body2">
                    <TextFieldWrapper
                      fullWidth
                      variant="standard"
                      name="sellingPrice"
                      disabled={Boolean(id)}
                      value={
                        formik.values?.products?.[index]?.sellingPrice || 0
                      }
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        if (!/[^0-9.]/.test(inputValue)) {
                          handleProductFieldChange(
                            "sellingPrice",
                            inputValue,
                            index
                          );
                        }
                      }}
                      onPaste={(e) => {
                        const pastedData = e.clipboardData.getData("Text");
                        if (/[^0-9.]/.test(pastedData)) {
                          e.preventDefault();
                        }
                      }}
                      error={Boolean(
                        formik.touched.products &&
                          formik.errors.products &&
                          formik.touched.products?.[index]?.sellingPrice &&
                          formik.errors.products?.[index]?.sellingPrice
                      )}
                      helperText={
                        formik.touched.products &&
                        formik.errors.products &&
                        formik.touched.products?.[index]?.sellingPrice &&
                        formik.errors.products?.[index]?.sellingPrice
                      }
                      onKeyPress={(event): void => {
                        const ascii = event.charCode;
                        const value = (event.target as HTMLInputElement).value;
                        const decimalCheck = value.indexOf(".") !== -1;

                        if (decimalCheck) {
                          const decimalSplit = value.split(".");
                          const decimalLength = decimalSplit[1].length;
                          if (decimalLength > 1 || ascii === 46) {
                            event.preventDefault();
                          } else if (ascii < 48 || ascii > 57) {
                            event.preventDefault();
                          }
                        } else if (value.length > 5 && ascii !== 46) {
                          event.preventDefault();
                        } else if ((ascii < 48 || ascii > 57) && ascii !== 46) {
                          event.preventDefault();
                        }
                      }}
                      // onBlur={formik.handleBlur(
                      //   `products[${index}].sellingPrice`
                      // )}
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
                  </Typography>
                  <Typography variant="body2" color={"#ff9100"}>
                    {Number(formik.values.products?.[index]?.sellingPrice) >
                    9999.99
                      ? `${t("Amount exceeds 4 digits")}`
                      : ""}
                  </Typography>
                </TableCell>

                {product?.prices?.map((price: any, priceIndex: number) => {
                  if (
                    selectedLocation.some(
                      (loc: any) => loc.id === price.locationRef
                    )
                  ) {
                    return (
                      <TableCell sx={{ width: "15%" }} key={price.locationRef}>
                        <TextFieldWrapper
                          fullWidth
                          variant="standard"
                          name={`prices.${index}.price`}
                          disabled={Boolean(id)}
                          value={price.price}
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            if (!/[^0-9.]/.test(inputValue)) {
                              handleProductPriceFieldChange(
                                "price",
                                inputValue,
                                index,
                                priceIndex
                              );
                            }
                          }}
                          onPaste={(e) => {
                            const pastedData = e.clipboardData.getData("Text");
                            if (/[^0-9.]/.test(pastedData)) {
                              e.preventDefault();
                            }
                          }}
                          error={Boolean(
                            formik.touched.products &&
                              formik.errors.products &&
                              formik.touched.products?.[index]?.sellingPrice &&
                              formik.errors.products?.[index]?.sellingPrice
                          )}
                          helperText={
                            formik.touched.products &&
                            formik.errors.products &&
                            formik.touched.products?.[index]?.sellingPrice &&
                            formik.errors.products?.[index]?.sellingPrice
                          }
                          onKeyPress={(event): void => {
                            const ascii = event.charCode;
                            const value = (event.target as HTMLInputElement)
                              .value;
                            const decimalCheck = value.indexOf(".") !== -1;

                            if (decimalCheck) {
                              const decimalSplit = value.split(".");
                              const decimalLength = decimalSplit[1].length;
                              if (decimalLength > 1 || ascii === 46) {
                                event.preventDefault();
                              } else if (ascii < 48 || ascii > 57) {
                                event.preventDefault();
                              }
                            } else if (value.length > 5 && ascii !== 46) {
                              event.preventDefault();
                            } else if (
                              (ascii < 48 || ascii > 57) &&
                              ascii !== 46
                            ) {
                              event.preventDefault();
                            }
                          }}
                          // onBlur={formik.handleBlur(
                          //   `products[${index}].sellingPrice`
                          // )}
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
                    );
                  }
                  return null;
                })}

                <TableCell sx={{ width: "20%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-around",
                    }}
                  >
                    {id == null && (
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          onRemoveItem(index);
                        }}
                      >
                        <DeleteOutlined fontSize="medium" color="error" />
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={8} style={{ textAlign: "center" }}>
              {t("Currently, there are no Product added")}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </>
  );
}
