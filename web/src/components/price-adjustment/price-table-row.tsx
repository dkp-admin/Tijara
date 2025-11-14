import { DeleteOutlined } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  TableRow,
  TableCell,
  Typography,
  TextField,
  Box,
  Button,
  TextFieldProps,
} from "@mui/material";
import { t } from "i18next";
import React, { useState } from "react";
import { toFixedNumber } from "src/utils/toFixedNumber";
import TaxDropdown from "src/components/input/tax-auto-complete";
import { useCurrency } from "src/utils/useCurrency";

type PriceTableRowMemoProps = {
  product: any;
  idx: number;
  handleProductFieldChange: (
    fieldName: string,
    value: any,
    index: number
  ) => void;
  lng: any;
  formik: any;
  onRemoveItem: any;
  handleOpenModal: any;
};

export const PriceTableRowMemo = React.memo(
  ({
    product,
    idx,
    handleProductFieldChange,
    lng,
    formik,
    onRemoveItem,
    handleOpenModal,
  }: PriceTableRowMemoProps) => {
    const currency = useCurrency();

    return (
      <TableRow key={idx}>
        <TableCell sx={{ width: "20%" }}>
          <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
            {product?.type === "item" &&
              `${product?.name[lng] || product?.name?.en} ${
                product.hasMultipleVariants
                  ? product?.variant?.name[lng] || product?.variant?.name?.en
                  : ""
              }, ${product.sku}`}
            {product?.type === "box" &&
              `${product?.name[lng] || product?.name?.en} ${
                product.hasMultipleVariants
                  ? product?.variant?.name[lng] || product?.variant?.name?.en
                  : ""
              }  [${t("Box")} - ${product?.unitCount} ${t("Unit(s)")}] ${
                product.sku
              }`}
          </Typography>
        </TableCell>
        <TableCell sx={{ width: "20%" }}>
          <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
            {product?.unit || "perUnit"}
          </Typography>
        </TableCell>
        <TableCell sx={{ width: "20%" }}>
          <Typography variant="body2">
            <TextField
              fullWidth
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
              onBlur={formik.handleBlur(`items[${idx}].cost`)}
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
                } else if (value.length > 9 && ascii !== 46) {
                  event.preventDefault();
                } else if ((ascii < 48 || ascii > 57) && ascii !== 46) {
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
          </Typography>
        </TableCell>
        <TableCell sx={{ width: "20%" }}>
          <Typography variant="body2">
            <TextField
              fullWidth
              variant="standard"
              name="price"
              value={formik.values.items[idx].price}
              onChange={(e) =>
                handleProductFieldChange("price", e.target.value, idx)
              }
              error={Boolean(
                formik.touched.items &&
                  formik.errors.items &&
                  formik.touched.items?.[idx]?.price &&
                  formik.errors.items?.[idx]?.price
              )}
              helperText={
                formik.touched.items &&
                formik.errors.items &&
                formik.touched.items?.[idx]?.cost &&
                formik.errors.items?.[idx]?.cost
              }
              onBlur={formik.handleBlur(`items[${idx}].cost`)}
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
                } else if (value.length > 9 && ascii !== 46) {
                  event.preventDefault();
                } else if ((ascii < 48 || ascii > 57) && ascii !== 46) {
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
          </Typography>
        </TableCell>
        <TableCell sx={{ width: "20%" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-around",
            }}
          >
            <Button
              onClick={() => {
                handleOpenModal();
              }}
            >
              {t("Edit specific location")}
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                onRemoveItem(idx);
                console.log(idx);
              }}
            >
              <DeleteOutlined fontSize="medium" color="error" />
            </Button>
          </Box>
        </TableCell>
      </TableRow>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.product === nextProps.product &&
      prevProps.formik.errors?.items?.[prevProps.idx] ===
        nextProps.formik.errors?.items?.[nextProps.idx] &&
      prevProps.idx === nextProps.idx
    );
  }
);
