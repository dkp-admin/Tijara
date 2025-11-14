import {
  Box,
  Button,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  TextFieldProps,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import React, { useCallback, useState } from "react";
import { DeleteOutlined } from "@mui/icons-material";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import toast from "react-hot-toast";
import TextFieldWrapper from "../text-field-wrapper";
import { getItemVAT } from "src/utils/get-price";
import { useCurrency } from "src/utils/useCurrency";

export function PurchaseOrderAddCard({
  formik,
  poid,
  onRemoveItem,
  selectedOption,
  selectedLocationFrom,
}: any) {
  const { t } = useTranslation();
  const [openDatePickers, setOpenDatePickers] = useState(
    formik.values.items.map(() => false)
  );
  const currency = useCurrency();

  const lng = localStorage.getItem("currentLanguage");
  const handleProductFieldChange = useCallback(
    (fieldName: string, value: any, index: number) => {
      const currentItem = formik.values.items[index];
      let updatedCost = currentItem.cost;
      let updatedTotal = currentItem.total;
      let updatedOldTotal = currentItem.oldTotal;
      let updatedVatAmount = currentItem.vatAmount;
      let unitcost = Number(currentItem.cost);
      let quantity = Number(currentItem.quantity);
      let vatPercent = Number(currentItem.vat);
      let discountedTotal = 0;
      if (fieldName === "quantity") {
        quantity = Number(value);
        discountedTotal =
          Number(currentItem.oldTotal) * Number(value) -
          Number(currentItem.discount);
      } else if (fieldName === "cost") {
        const unitPrice = Number(value);
        updatedCost = value;
        unitcost = value;
        const vatPercent = Number(currentItem.vat) / 100;
        const vatAmount = toFixedNumber(unitPrice * Number(vatPercent));
        updatedOldTotal = toFixedNumber(unitPrice + Number(vatAmount));
        discountedTotal =
          Number(updatedOldTotal) * Number(currentItem.quantity) -
          Number(currentItem.discount);
      } else if (fieldName === "vat") {
        const unitTotal = toFixedNumber(
          Number(currentItem.total) / Number(currentItem.quantity)
        );
        vatPercent = Number(value);
        const subtotal = toFixedNumber(
          (Number(unitTotal) * 100) / (100 + vatPercent)
        );
        updatedCost = Number(subtotal);
        formik.setFieldValue(`items[${index}].discount`, 0);
      } else if (fieldName === "discount") {
        discountedTotal =
          Number(currentItem.oldTotal) * Number(currentItem.quantity) -
          Number(value);
      }
      updatedTotal =
        discountedTotal > 0
          ? discountedTotal
          : toFixedNumber(Number(updatedOldTotal) * Number(quantity));
      updatedVatAmount = getItemVAT(updatedTotal, vatPercent);
      formik.setFieldValue(`items[${index}].${fieldName}`, value);
      formik.setFieldValue(`items[${index}].total`, updatedTotal);
      formik.setFieldValue(`items[${index}].vatAmount`, updatedVatAmount);
      formik.setFieldValue(`items[${index}].cost`, updatedCost);
      formik.setFieldValue(`items[${index}].oldTotal`, updatedOldTotal);
    },
    [formik.values.items]
  );

  const toggleDatePicker = (index: number) => {
    const updatedOpenDatePickers = [...openDatePickers];
    updatedOpenDatePickers[index] = !updatedOpenDatePickers[index];
    setOpenDatePickers(updatedOpenDatePickers);
  };

  return (
    <TableBody>
      {formik.values.items?.length > 0 ? (
        formik.values.items.map((product: any, idx: any) => {
          const matchingLocationCount = product?.stockConfiguration?.find(
            (config: any) => config?.locationRef === selectedLocationFrom
          );
          return (
            <TableRow key={idx}>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{ textTransform: "capitalize" }}
                >
                  {product?.type === "item" &&
                    `${product?.name[lng] || product?.name?.en} ${
                      product?.hasMultipleVariants
                        ? product?.variant?.name[lng] ||
                          product?.variant?.name?.en
                        : ""
                    }, ${product.sku} ${
                      product.code ? `(${product.code})` : ""
                    }`}
                  {product?.type === "box" &&
                    `${product?.name[lng] || product?.name?.en} ${
                      product?.hasMultipleVariants
                        ? product?.variant?.name[lng] ||
                          product?.variant?.name?.en
                        : ""
                    }  [${t("Box")} - ${product?.unitCount} ${t("Unit(s)")}] ${
                      product.sku
                    } ${product.code ? `(${product.code})` : ""}`}
                  {product?.type === "crate" &&
                    `${product?.name[lng] || product?.name?.en} ${
                      product.hasMultipleVariants
                        ? product?.variant?.name[lng] ||
                          product?.variant?.name?.en
                        : ""
                    }  [${t("Crate")} - ${product?.unitCount} ${t(
                      "Unit(s)"
                    )}] ${product.sku}`}
                </Typography>
              </TableCell>
              {selectedOption == "grn" && (
                <TableCell sx={{ minWidth: "180px" }}>
                  <DatePicker
                    open={openDatePickers[idx]}
                    onOpen={() => toggleDatePicker(idx)}
                    onClose={() => toggleDatePicker(idx)}
                    inputFormat="dd/MM/yyyy"
                    onChange={(date: Date | null): void => {
                      formik.setFieldValue(`items[${idx}].expiry`, date);
                    }}
                    //{/*
                    // @ts-ignore */}
                    InputProps={{ disabled: true }}
                    minDate={new Date()}
                    disablePast
                    value={formik.values?.items[idx]?.expiry}
                    disabled={poid != null}
                    renderInput={(
                      params: JSX.IntrinsicAttributes & TextFieldProps
                    ) => (
                      <div>
                        <TextFieldWrapper
                          required
                          fullWidth
                          onClick={() => toggleDatePicker(idx)}
                          {...params}
                          variant="standard"
                          onBlur={formik.handleBlur(`items[${idx}].expiry`)}
                        />
                        {formik.touched.items &&
                          formik.errors.items &&
                          formik.touched.items?.[idx]?.expiry &&
                          formik.errors.items?.[idx]?.expiry && (
                            <Typography
                              style={{ color: "red", fontSize: "0.8rem" }}
                            >
                              {formik.errors.items[idx].expiry}
                            </Typography>
                          )}
                      </div>
                    )}
                  />
                </TableCell>
              )}

              <TableCell sx={{ width: "80px" }}>
                <TextFieldWrapper
                  fullWidth
                  disabled={selectedOption}
                  variant="standard"
                  name={`items[${idx}].quantity`}
                  value={formik.values.items[idx].quantity}
                  onChange={(e) =>
                    handleProductFieldChange("quantity", e.target.value, idx)
                  }
                  error={Boolean(
                    formik.touched.items &&
                      formik.errors.items &&
                      formik.touched.items?.[idx]?.quantity &&
                      formik.errors.items?.[idx]?.quantity
                  )}
                  helperText={
                    formik.touched.items &&
                    formik.errors.items &&
                    formik.touched.items?.[idx]?.quantity &&
                    formik.errors.items?.[idx]?.quantity
                  }
                  onBlur={formik.handleBlur(`items[${idx}].quantity`)}
                />
              </TableCell>
              {!poid && (
                <TableCell sx={{ width: "80px" }}>
                  <Typography>
                    {matchingLocationCount?.count -
                      formik.values.items[idx].quantity *
                        formik.values.items[idx].unitCount || 0}
                  </Typography>
                </TableCell>
              )}
              <TableCell sx={{ minWidth: "150px" }}>
                <Typography variant="body2">
                  <TextFieldWrapper
                    fullWidth
                    disabled={poid != null}
                    variant="standard"
                    name="cost"
                    value={formik.values.items[idx].cost}
                    onChange={(e) =>
                      handleProductFieldChange("cost", e.target.value, idx)
                    }
                    error={Boolean(
                      formik.touched.items &&
                        formik.errors.items &&
                        formik.touched.items?.[idx]?.cost &&
                        formik.errors.items?.[idx]?.cost
                    )}
                    helperText={
                      formik.touched.items &&
                      formik.errors.items &&
                      formik.touched.items?.[idx]?.cost &&
                      formik.errors.items?.[idx]?.cost
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
                    onBlur={formik.handleBlur(`items[${idx}].cost`)}
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
                  {Number(formik.values.items?.[idx]?.cost) > 9999.99
                    ? `${t("Amount exceeds 4 digits")}`
                    : ""}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ width: "80px" }}>
                  {` ${currency} ${toFixedNumber(
                    formik.values.items[idx].vatAmount
                  )}`}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="body2" sx={{ width: "80px" }}>
                  {`${currency} ${toFixedNumber(
                    formik.values.items[idx].total
                  )}`}
                </Typography>
                {formik.errors.items &&
                  formik.errors.items[idx] &&
                  formik.errors.items[idx].total && (
                    <Typography style={{ color: "red", fontSize: "0.8rem" }}>
                      {formik.errors.items[idx].total}
                    </Typography>
                  )}
              </TableCell>
              {(poid == null || !selectedOption) && (
                <TableCell sx={{ width: "50px" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-around",
                    }}
                  >
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        if (!poid) {
                          onRemoveItem(idx);
                        } else if (
                          !selectedOption &&
                          formik?.values?.items?.length === 1
                        ) {
                          return toast.error(t("Atleast one item is required"));
                        } else {
                          onRemoveItem(idx);
                        }
                      }}
                    >
                      <DeleteOutlined fontSize="medium" color="error" />
                    </Button>
                  </Box>
                </TableCell>
              )}
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
  );
}
