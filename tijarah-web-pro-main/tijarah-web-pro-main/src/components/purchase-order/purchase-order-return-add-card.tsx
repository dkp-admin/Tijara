import { DeleteOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  TableCell,
  TextField,
  TextFieldProps,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toFixedNumber } from "src/utils/toFixedNumber";
import NoDataAnimation from "../widgets/animations/NoDataAnimation";
import { SuperTable } from "../widgets/super-table";
import { PurchaseOrderAddCartRowLoading } from "./purchase-order-add-cart-row-loading";
import { getItemVAT } from "src/utils/get-price";
import { useCurrency } from "src/utils/useCurrency";

export function PurchaseOrderReturnAddCard({
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
    formik.values.returnItems.map(() => false)
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

  const lng = localStorage.getItem("currentLanguage");

  const handleProductFieldChange = useCallback(
    (fieldName: string, value: any, index: number) => {
      const currentItem = formik.values.returnItems[index];
      let updatedCost = currentItem.cost;
      console.log("updatedCost", updatedCost);

      let updatedTotal = currentItem.total;
      console.log("updatedTotal", updatedTotal);
      let updatedOldTotal = currentItem.oldTotal;
      console.log("updatedOldTotal", updatedOldTotal);
      let updatedVatAmount = currentItem.vatAmount;
      console.log("updatedVatAmount", updatedVatAmount);
      let unitcost = Number(currentItem.cost);
      let returnQty = Number(currentItem.returnQty);
      let vatPercent = Number(currentItem.vat);
      console.log("vatPercent", vatPercent);
      let discountedTotal = 0;
      if (fieldName === "returnQty") {
        returnQty = Number(value);
        console.log("returnQty", returnQty);
      } else if (fieldName === "cost") {
        const unitPrice = Number(value);
        updatedCost = value;
        unitcost = value;
        const vatPercent = Number(currentItem.vat) / 100;
        const vatAmount = toFixedNumber(unitPrice * Number(vatPercent));
        updatedOldTotal = toFixedNumber(unitPrice + Number(vatAmount));
      } else if (fieldName === "vat") {
        const unitTotal = toFixedNumber(
          Number(currentItem.total) / Number(currentItem.returnQty)
        );
        vatPercent = Number(value);
        const subtotal = toFixedNumber(
          (Number(unitTotal) * 100) / (100 + vatPercent)
        );
        updatedCost = Number(subtotal);
      } else if (fieldName === "discount") {
        discountedTotal =
          Number(currentItem.oldTotal) * Number(currentItem.returnQty) -
          Number(value);
      }
      updatedTotal =
        discountedTotal > 0
          ? discountedTotal
          : toFixedNumber(Number(updatedOldTotal) * Number(returnQty));
      updatedVatAmount = getItemVAT(updatedTotal, vatPercent);
      formik.setFieldValue(`returnItems[${index}].${fieldName}`, value);
      formik.setFieldValue(`returnItems[${index}].total`, updatedTotal);
      formik.setFieldValue(`returnItems[${index}].vatAmount`, updatedVatAmount);
      formik.setFieldValue(`returnItems[${index}].cost`, updatedCost);
      formik.setFieldValue(`returnItems[${index}].oldTotal`, updatedOldTotal);
    },
    [formik.values.returnItems]
  );

  const toggleDatePicker = (index: number) => {
    const updatedOpenDatePickers = [...openDatePickers];
    updatedOpenDatePickers[index] = !updatedOpenDatePickers[index];
    setOpenDatePickers(updatedOpenDatePickers);
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
      key: "received",
      label: t("received"),
    },
    {
      key: "returnQuantity",
      label: t("Return Qty"),
    },
    {
      key: "discount",
      label: t("total discount"),
    },
    {
      key: "vat",
      label: t("total vat %"),
    },
    {
      key: "vatamount",
      label: t("vat amount"),
    },
    {
      key: "total",
      label: t("total"),
    },
  ];

  if (poid == null) {
    tableHeaders.push({
      key: "action",
      label: t("Action"),
    });
  }

  if (selectedOption === "grn") {
    tableHeaders.splice(1, 0, {
      key: "date",
      label: t("date"),
    });
  }

  const transformedData = useMemo(() => {
    let arr: any[] = [];
    formik.values?.returnItems?.map((product: any, idx: any) => {
      arr.push({
        key: idx,
        id: idx,
        product: (
          <>
            <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
              {product?.type === "item" &&
                `${product?.name[lng] || product?.name?.en} ${
                  product.hasMultipleVariants
                    ? product?.variant?.name[lng] || product?.variant?.name?.en
                    : ""
                }, ${product.sku} ${product.code ? `(${product.code})` : ""}`}
              {product?.type === "box" &&
                `${product?.name[lng] || product?.name?.en} ${
                  product.hasMultipleVariants
                    ? product?.variant?.name[lng] || product?.variant?.name?.en
                    : ""
                }  [${t("Box")} - ${product?.unitCount} ${t("Unit(s)")}] ${
                  product.sku
                } ${product.code ? `(${product.code})` : ""}`}
              {product?.type === "crate" &&
                `${product?.name[lng] || product?.name?.en} ${
                  product.hasMultipleVariants
                    ? product?.variant?.name[lng] || product?.variant?.name?.en
                    : ""
                }  [${t("Crate")} - ${product?.unitCount} ${t("Unit(s)")}] ${
                  product.sku
                } ${product.code ? `(${product.code})` : ""}`}
            </Typography>
          </>
        ),
        date: selectedOption === "grn" && (
          <DatePicker
            open={openDatePickers[idx]}
            onOpen={() => toggleDatePicker(idx)}
            onClose={() => toggleDatePicker(idx)}
            inputFormat="dd/MM/yyyy"
            onChange={(date: Date | null): void => {
              formik.setFieldValue(`returnItems[${idx}].expiry`, date);
            }}
            //{/*
            // @ts-ignore */}
            InputProps={{ disabled: true }}
            minDate={new Date()}
            disablePast
            value={formik.values?.returnItems[idx]?.expiry}
            disabled={poid != null}
            renderInput={(params: JSX.IntrinsicAttributes & TextFieldProps) => (
              <div>
                <TextField
                  required
                  fullWidth
                  onClick={() => toggleDatePicker(idx)}
                  {...params}
                  inputProps={{ ...params.inputProps, readOnly: true }}
                  variant="standard"
                  onBlur={formik.handleBlur(`returnItems[${idx}].expiry`)}
                />
                {formik.touched.returnItems &&
                  formik.errors.returnItems &&
                  formik.touched.returnItems?.[idx]?.expiry &&
                  formik.errors.returnItems?.[idx]?.expiry && (
                    <Typography style={{ color: "red", fontSize: "0.8rem" }}>
                      {formik.errors.returnItems[idx].expiry}
                    </Typography>
                  )}
              </div>
            )}
          />
        ),
        unitcost: (
          <Typography variant="body2" sx={{ width: "80px" }}>
            {` ${currency} ${toFixedNumber(
              formik.values.returnItems[idx].cost
            )}`}
          </Typography>
        ),
        received: (
          <Typography variant="body2" sx={{ width: "80px" }}>
            {formik.values.returnItems[idx].received}
          </Typography>
        ),
        returnQuantity: (
          <TextField
            fullWidth
            disabled={poid != null}
            variant="standard"
            name={`returnItems[${idx}].returnQty`}
            value={formik.values.returnItems[idx].returnQty}
            onChange={(e) =>
              handleProductFieldChange("returnQty", e.target.value, idx)
            }
            error={Boolean(
              formik.touched.returnItems &&
                formik.errors.returnItems &&
                formik.touched.returnItems?.[idx]?.returnQty &&
                formik.errors.returnItems?.[idx]?.returnQty
            )}
            helperText={
              formik.touched.returnItems &&
              formik.errors.returnItems &&
              formik.touched.returnItems?.[idx]?.returnQty &&
              formik.errors.returnItems?.[idx]?.returnQty
            }
            onBlur={formik.handleBlur(`returnItems[${idx}].returnQty`)}
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
        ),
        discount: (
          <Typography variant="body2" sx={{ width: "80px" }}>
            {` ${currency} ${toFixedNumber(
              formik.values.returnItems[idx].discount
            )}`}
          </Typography>
        ),
        vat: (
          <Typography variant="body2" sx={{ width: "80px" }}>
            {formik.values.returnItems[idx].vat}%
          </Typography>
        ),
        vatamount: (
          <Typography variant="body2" sx={{ width: "80px" }}>
            {` ${currency} ${toFixedNumber(
              formik.values.returnItems[idx].vatAmount
            )}`}
          </Typography>
        ),
        total: (
          <>
            <Typography variant="body2" sx={{ width: "80px" }}>
              {`${currency} ${toFixedNumber(
                formik.values.returnItems[idx].total
              )}`}
            </Typography>
            {formik.errors.returnItems &&
              formik.errors.returnItems[idx] &&
              formik.errors.returnItems[idx].total && (
                <Typography style={{ color: "red", fontSize: "0.8rem" }}>
                  {formik.errors.returnItems[idx].total}
                </Typography>
              )}
          </>
        ),
        action: poid == null && (
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
        ),
      });
    });

    return arr;
  }, [formik]);

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedItems = transformedData.slice(startIndex, endIndex);

  useEffect(() => {
    if (formik.errors.returnItems && formik.errors.returnItems.length > 0) {
      const firstErrorIndex = formik.errors.returnItems.findIndex(
        (error: any) => {
          for (const key in error) {
            if (typeof error[key] === "string") {
              return true;
            }
          }
          return false;
        }
      );

      const errorPageIndex = Math.floor(firstErrorIndex / rowsPerPage);
      setPage(errorPageIndex);
    }
  }, [formik.errors.returnItems, rowsPerPage]);

  return (
    <>
      <Card>
        <SuperTable
          isLoading={false}
          loaderComponent={PurchaseOrderAddCartRowLoading}
          items={paginatedItems}
          headers={tableHeaders}
          total={formik.values?.returnItems?.length || 0}
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
      </Card>
    </>
  );
}
