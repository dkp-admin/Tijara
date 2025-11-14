import { DeleteOutlined } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toFixedNumber } from "src/utils/toFixedNumber";
import TextFieldWrapper from "../text-field-wrapper";
import NoDataAnimation from "../widgets/animations/NoDataAnimation";
import { SuperTable } from "../widgets/super-table";

import { PurchaseOrderRowLoading } from "../purchase-order/purchase-order-row-loading";
import { useCurrency } from "src/utils/useCurrency";

export function CompositeProductAddCard({
  formik,
  poid,
  onRemoveItem,
  costSellingPrice,
}: any) {
  const { t } = useTranslation();
  const [isCancelAllClicked] = useState(false);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
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
      key: "quantity",
      label: t("Quantity"),
    },
    {
      key: "costPrice",
      label: t("Cost Price"),
    },
    {
      key: "sellingPrice",
      label: t("Selling Price"),
    },
  ];

  if (poid == null) {
    tableHeaders.push({
      key: "action",
      label: t("Action"),
    });
  }

  const lng = localStorage.getItem("currentLanguage");

  const transformedData = useMemo(() => {
    const arr: any[] = formik.values.productsItems?.map(
      (product: any, idx: any) => {
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

          quantity: (
            <TextFieldWrapper
              fullWidth
              disabled={poid != null}
              variant="standard"
              name={`productsItems[${idx}].quantity`}
              value={formik.values.productsItems[idx].quantity}
              onChange={(e) =>
                handleProductFieldChange("quantity", e.target.value, idx)
              }
              error={Boolean(
                formik.touched.productsItems &&
                  formik.errors.productsItems &&
                  formik.touched.productsItems?.[idx]?.quantity &&
                  formik.errors.productsItems?.[idx]?.quantity
              )}
              helperText={
                formik.touched.productsItems &&
                formik.errors.productsItems &&
                formik.touched.productsItems?.[idx]?.quantity &&
                formik.errors.productsItems?.[idx]?.quantity
              }
              onBlur={formik.handleBlur(`productsItems[${idx}].quantity`)}
              onKeyPress={(event): void => {
                const ascii = event.charCode;
                const value = (event.target as HTMLInputElement).value;

                if (ascii >= 48 && ascii <= 57) {
                  if (value.length > 8) {
                    event.preventDefault();
                  }
                } else {
                  event.preventDefault();
                }
              }}
            />
          ),

          costPrice: (
            <Typography variant="body2" sx={{ width: "80px" }}>
              {` ${currency} ${toFixedNumber(
                formik.values.productsItems[idx].cost *
                  formik.values.productsItems[idx].quantity
              )}`}
            </Typography>
          ),
          sellingPrice: (
            <>
              <Typography variant="body2" sx={{ width: "80px" }}>
                {`${currency} ${toFixedNumber(
                  formik.values.productsItems[idx].sellingPrice *
                    formik.values.productsItems[idx].quantity
                )}`}
              </Typography>
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
      }
    );

    return arr;
  }, [formik]);

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedItems = transformedData?.slice(startIndex, endIndex);

  const handleProductFieldChange = useCallback(
    (fieldName: string, value: any, index: number) => {
      const currentItem = formik.values.productsItems[index];
      let quantity = Number(currentItem.quantity);
      if (fieldName === "quantity") {
        quantity = Number(value);
      }

      formik.setFieldValue(`productsItems[${index}].${fieldName}`, value);
    },
    [formik.values.productsItems]
  );

  return (
    <SuperTable
      isLoading={false}
      loaderComponent={PurchaseOrderRowLoading}
      items={paginatedItems}
      headers={tableHeaders}
      total={formik.values.productsItems?.length || 0}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
      rowsPerPage={rowsPerPage}
      page={page}
      isCancelAllClicked={isCancelAllClicked}
      costSellingPrice={costSellingPrice}
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
