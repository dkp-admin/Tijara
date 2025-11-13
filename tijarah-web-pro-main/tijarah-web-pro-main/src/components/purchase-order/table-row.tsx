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
import TextFieldWrapper from "../text-field-wrapper";
import { useCurrency } from "src/utils/useCurrency";

type TableRowMemoProps = {
  product: any;
  idx: number;
  handleProductFieldChange: (
    fieldName: string,
    value: any,
    index: number
  ) => void;
  poid: any;
  lng: any;
  selectedOption: any;
  formik: any;
  onRemoveItem: any;
  openDatePicker: boolean;
  setOpenDatePicker: (value: boolean) => void;
};

export const TableRowMemo = React.memo(
  ({
    product,
    idx,
    handleProductFieldChange,
    poid,
    lng,
    selectedOption,
    formik,
    onRemoveItem,
  }: TableRowMemoProps) => {
    const currency = useCurrency();

    const [openDatePickers, setOpenDatePickers] = useState(false);

    return (
      <TableRow
        key={idx}
        sx={{
          background: formik.errors?.items?.[idx] ? "#bf121214" : "",
        }}
      >
        <TableCell>
          <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
            {/* {console.log("product", selectedOption)} */}
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
        {selectedOption == "grn" && (
          <TableCell sx={{ minWidth: "180px" }}>
            <DatePicker
              open={openDatePickers}
              onOpen={() => setOpenDatePickers(true)}
              onClose={() => setOpenDatePickers(false)}
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
                    onClick={() => setOpenDatePickers(true)}
                    {...params}
                    inputProps={{ ...params.inputProps, readOnly: true }}
                    variant="standard"
                    onBlur={formik.handleBlur(`items[${idx}].expiry`)}
                  />
                  {formik.touched.items &&
                    formik.errors.items &&
                    formik.touched.items?.[idx]?.expiry &&
                    formik.errors.items?.[idx]?.expiry && (
                      <Typography style={{ color: "red", fontSize: "0.8rem" }}>
                        {formik.errors.items[idx].expiry}
                      </Typography>
                    )}
                </div>
              )}
            />
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
        <TableCell sx={{ width: "80px" }}>
          <TextFieldWrapper
            fullWidth
            disabled={poid != null}
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
              } else if (value.length > 7 && ascii !== 46) {
                event.preventDefault();
              } else if ((ascii < 48 || ascii > 57) && ascii !== 46) {
                event.preventDefault();
              }
            }}
          />
        </TableCell>

        <TableCell sx={{ width: "140px" }}>
          <Typography variant="body2">
            <TextFieldWrapper
              fullWidth
              disabled={poid != null}
              variant="standard"
              name="discount"
              value={formik.values.items[idx].discount}
              onChange={(e) =>
                handleProductFieldChange("discount", e.target.value, idx)
              }
              error={
                formik.touched.items &&
                formik.errors.items &&
                formik.touched.items?.[idx]?.discount &&
                formik.errors.items?.[idx]?.discount
              }
              helperText={
                formik.touched.items &&
                formik.errors.items &&
                formik.touched.items?.[idx]?.discount &&
                formik.errors.items?.[idx]?.discount
              }
              onBlur={formik.handleBlur(`items[${idx}].discount`)}
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
                } else if (value.length > 7 && ascii !== 46) {
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
        <TableCell sx={{ width: "120px" }}>
          <Typography variant="body2">
            <TaxDropdown
              required
              disabled={poid != null}
              error={
                formik.touched.items?.[idx]?.vatRef &&
                formik.errors.items?.[idx]?.vatRef
              }
              onChange={(id, vat) => {
                if (id && vat >= 0) {
                  handleProductFieldChange("vatRef", id, idx);
                  handleProductFieldChange("vat", vat, idx);
                }
              }}
              variant={"standard"}
              selectedId={formik.values.items[idx].vatRef}
              label=""
              id={`vatRef-${idx}`}
            />
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
            {`${currency} ${toFixedNumber(formik.values.items[idx].total)}`}
          </Typography>
          {formik.errors.items &&
            formik.errors.items[idx] &&
            formik.errors.items[idx].total && (
              <Typography style={{ color: "red", fontSize: "0.8rem" }}>
                {formik.errors.items[idx].total}
              </Typography>
            )}
        </TableCell>
        {poid == null && (
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
                  onRemoveItem(idx);
                }}
              >
                <DeleteOutlined fontSize="medium" color="error" />
              </Button>
            </Box>
          </TableCell>
        )}
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
