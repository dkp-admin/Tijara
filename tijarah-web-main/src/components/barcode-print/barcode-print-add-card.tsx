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
import React, { useState } from "react";
import TaxDropdown from "src/components/input/tax-auto-complete";
import { DeleteOutlined } from "@mui/icons-material";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { items } from "src/api/file-manager/data";
import toast from "react-hot-toast";

export function BarcodePrintAddCard({
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

  const lng = localStorage.getItem("currentLanguage");
  const handleProductFieldChange = (
    fieldName: string,
    value: any,
    index: number
  ) => {
    const currentItem = formik.values.items[index];
    let updatedCost = currentItem.cost;
    let updatedTotal = currentItem.total;
    let updatedVatAmount = currentItem.vatAmount;
    let updatedOldTotal = currentItem.oldTotal;

    if (fieldName === "quantity") {
      const total = Number(currentItem.oldTotal) * Number(value);
      const vatPercent = Number(currentItem.vat);
      const vatAmount = total - (total * 100) / (100 + vatPercent);

      updatedVatAmount = toFixedNumber(vatAmount);
      updatedTotal = toFixedNumber(total);
    } else if (fieldName === "cost") {
      const unitPrice = Number(value);
      const vatPercent = Number(currentItem.vat) / 100;
      const vatAmount = unitPrice * vatPercent;

      updatedCost = value;
      updatedVatAmount = toFixedNumber(
        vatAmount * Number(currentItem.quantity)
      );
      updatedTotal = toFixedNumber(
        (unitPrice + vatAmount) * Number(currentItem.quantity)
      );
      updatedOldTotal = toFixedNumber(unitPrice + vatAmount);
    } else if (fieldName === "vat") {
      const unitTotal =
        Number(currentItem.total) / Number(currentItem.quantity);
      const vatPercent = Number(value);
      const subtotal = (unitTotal * 100) / (100 + vatPercent);

      updatedVatAmount = toFixedNumber(
        (unitTotal - subtotal) * Number(currentItem.quantity)
      );
      updatedCost = toFixedNumber(subtotal);
    } else if (fieldName === "discount") {
      const total =
        Number(currentItem.oldTotal) * Number(currentItem.quantity) -
        Number(value);
      const vatPercent = Number(currentItem.vat);
      const vatAmount = total - (total * 100) / (100 + vatPercent);

      updatedVatAmount = toFixedNumber(vatAmount);
      updatedTotal = toFixedNumber(total);
    }

    formik.setFieldValue(`items[${index}].${fieldName}`, value);
    formik.setFieldValue(`items[${index}].total`, updatedTotal);
    formik.setFieldValue(`items[${index}].vatAmount`, updatedVatAmount);
    formik.setFieldValue(`items[${index}].cost`, updatedCost);
    formik.setFieldValue(`items[${index}].oldTotal`, updatedOldTotal);
  };

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
              <TableCell sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                    }, ${product.sku}`}
                  {product?.type === "box" &&
                    `${product?.name[lng] || product?.name?.en} ${
                      product?.hasMultipleVariants
                        ? product?.variant?.name[lng] ||
                          product?.variant?.name?.en
                        : ""
                    }  [${t("Box")} - ${product?.unitCount} ${t("Unit(s)")}] ${
                      product.sku
                    }`}
                </Typography>
                {formik.values.items[idx].batching && (
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
                    renderInput={(
                      params: JSX.IntrinsicAttributes & TextFieldProps
                    ) => (
                      <div>
                        <TextField
                          required
                          fullWidth
                          sx={{ maxWidth: "130px" }}
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
                )}
              </TableCell>

              <TableCell sx={{ width: "80px" }}>
                <TextField
                  type="number"
                  fullWidth
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
