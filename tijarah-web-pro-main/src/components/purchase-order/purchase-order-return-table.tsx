import { DeleteOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  TextField,
  TextFieldProps,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toFixedNumber } from "src/utils/toFixedNumber";
import TaxDropdown from "../input/tax-auto-complete";
import TextFieldWrapper from "../text-field-wrapper";
import NoDataAnimation from "../widgets/animations/NoDataAnimation";
import { SuperTable } from "../widgets/super-table";
import { PurchaseOrderRowLoading } from "./purchase-order-row-loading";
import { useCurrency } from "src/utils/useCurrency";

export function PurchaseOrderReturnTable({
  formik,
  poid,
  onRemoveItem,
  selectedOption,
}: any) {
  const { t } = useTranslation();
  const [isCancelAllClicked] = useState(false);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [openDatePickers, setOpenDatePickers] = useState(
    formik.values.items.map(() => false)
  );
  const currency = useCurrency();

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const tableHeaders = [
    {
      key: "product",
      label: t("Product"),
    },
    {
      key: "unitcost",
      label: t("unit cost"),
    },
    {
      key: "returnQty",
      label: t("return Qty."),
    },
    {
      key: "discount",
      label: t("Total Discount"),
    },
    {
      key: "vat",
      label: t("Total VAT %"),
    },
    {
      key: "vatamount",
      label: t("VAT Amount"),
    },
    {
      key: "total",
      label: t("Total"),
    },
  ];

  if (selectedOption === "grn") {
    tableHeaders.push({
      key: "expiry",
      label: t("Expiry"),
    });
  }

  if (poid == null) {
    tableHeaders.push({
      key: "action",
      label: t("Action"),
    });
  }

  const lng = localStorage.getItem("currentLanguage");

  const transformedData = useMemo(() => {
    const arr: any[] = formik.values.items?.map((product: any, idx: any) => {
      return {
        key: idx,
        id: idx,
        product: (
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
        ),
        expiry: selectedOption === "grn" && (
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
            renderInput={(params: JSX.IntrinsicAttributes & TextFieldProps) => (
              <div>
                <TextField
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
        ),
        unitcost: (
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
        ),
        returnQty: (
          <Typography variant="body2" sx={{ width: "80px" }}>
            {` ${formik.values.items[idx].returnQty}`}
          </Typography>
        ),
        discount: (
          <Typography variant="body2">
            <TextField
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
        ),
        vat: (
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
        ),
        vatamount: (
          <Typography variant="body2" sx={{ width: "80px" }}>
            {` ${currency} ${toFixedNumber(
              formik.values.items[idx].vatAmount
            )}`}
          </Typography>
        ),
        total: (
          <>
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
          </>
        ),
        action: poid == null && (
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
        ),
      };
    });

    return arr;
  }, [formik]);

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedItems = transformedData?.slice(startIndex, endIndex);

  const handleProductFieldChange = useCallback(
    (fieldName: string, value: any, index: number) => {
      const currentItem = formik.values.items[index];
      let updatedCost = currentItem.cost;
      let updatedTotal = currentItem.total;
      let updatedOldTotal = currentItem.oldTotal;
      let updatedVatAmount = currentItem.vatAmount;

      if (fieldName === "quantity") {
        const unitcost = Number(updatedCost);

        const quantity = Number(value);
        const vatPercent = Number(currentItem.vat) / 100;
        const vatAmount = toFixedNumber(unitcost * vatPercent);
        updatedVatAmount = toFixedNumber(Number(vatAmount) * quantity);

        updatedTotal = toFixedNumber(
          (unitcost + Number(vatAmount)) * Number(quantity)
        );
      } else if (fieldName === "cost") {
        const unitPrice = Number(value);
        const vatPercent = Number(currentItem.vat) / 100;
        const vatAmount = toFixedNumber(unitPrice * vatPercent);
        updatedCost = value;
        updatedVatAmount = toFixedNumber(
          Number(vatAmount) * Number(currentItem.quantity)
        );
        updatedTotal = toFixedNumber(
          (unitPrice + Number(vatAmount)) * Number(currentItem.quantity)
        );
        updatedOldTotal = toFixedNumber(unitPrice + Number(vatAmount));
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
        const vatAmount = toFixedNumber(
          total - (total * 100) / (100 + vatPercent)
        );
        updatedVatAmount = toFixedNumber(vatAmount);
        updatedTotal = toFixedNumber(total);
      }

      formik.setFieldValue(`items[${index}].${fieldName}`, value);
      formik.setFieldValue(`items[${index}].total`, updatedTotal);
      formik.setFieldValue(`items[${index}].vatAmount`, updatedVatAmount);
      formik.setFieldValue(`items[${index}].cost`, updatedCost);
      formik.setFieldValue(`items[${index}].oldTotal`, updatedOldTotal);
    },
    [formik.values.items]
  );

  return (
    <SuperTable
      isLoading={false}
      loaderComponent={PurchaseOrderRowLoading}
      items={paginatedItems}
      headers={tableHeaders}
      total={formik.values.items?.length || 0}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
      rowsPerPage={rowsPerPage}
      page={page}
      isCancelAllClicked={isCancelAllClicked}
      noDataPlaceholder={
        <Box sx={{ mt: 6, mb: 4 }}>
          <NoDataAnimation
            text={
              <Typography variant="h6" textAlign="center" sx={{ mt: 2 }}>
                {t("Currently, there are no Product added")}
              </Typography>
            }
          />
        </Box>
      }
    />
  );
}
