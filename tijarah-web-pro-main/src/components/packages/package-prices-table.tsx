import { DeleteOutlined } from "@mui/icons-material";
import { Box, Button, TextField, Typography } from "@mui/material";
import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import NoDataAnimation from "../widgets/animations/NoDataAnimation";
import { SuperTable } from "../widgets/super-table";

export const PackagePricesTable = ({ formik }: any) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handlePriceInput = (value: string, index: number, field: string) => {
    // Allow empty input or valid decimal numbers with up to 2 decimal places
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      const updatedPrices = [...formik.values.prices];
      updatedPrices[index][field] = value === "" ? "" : Number(value); // Convert to number for Formik
      formik.setFieldValue("prices", updatedPrices);

      // Mark the field as touched to trigger validation
      formik.setFieldTouched(`prices[${index}].${field}`, true, false);
    }
  };

  const tableHeaders = [
    { key: "type", label: t("Type") },
    { key: "price", label: t("Price") },
    { key: "discountPercentage", label: t("Discount %") },
    { key: "actions", label: t("Actions") },
  ];

  const transformedData = formik.values.prices.map(
    (price: any, index: number) => ({
      key: index,
      id: index,
      type: (
        <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
          {price.type}
        </Typography>
      ),
      price: (
        <TextField
          fullWidth
          variant="standard"
          type="text"
          value={price.price ?? ""} // Use nullish coalescing to handle undefined
          onChange={(e) => handlePriceInput(e.target.value, index, "price")}
          onBlur={() => formik.setFieldTouched(`prices[${index}].price`, true)} // Trigger touched on blur
          error={
            formik.touched.prices?.[index]?.price &&
            Boolean(formik.errors.prices?.[index]?.price)
          }
          helperText={
            formik.touched.prices?.[index]?.price &&
            formik.errors.prices?.[index]?.price
              ? String(formik.errors.prices[index].price)
              : ""
          }
          inputProps={{
            pattern: "[0-9]*.?[0-9]{0,2}",
            inputMode: "decimal",
          }}
        />
      ),
      discountPercentage: (
        <TextField
          fullWidth
          variant="standard"
          type="text"
          value={price.discountPercentage ?? ""}
          onChange={(e) =>
            handlePriceInput(e.target.value, index, "discountPercentage")
          }
          onBlur={() =>
            formik.setFieldTouched(`prices[${index}].discountPercentage`, true)
          }
          error={
            formik.touched.prices?.[index]?.discountPercentage &&
            Boolean(formik.errors.prices?.[index]?.discountPercentage)
          }
          helperText={
            formik.touched.prices?.[index]?.discountPercentage &&
            formik.errors.prices?.[index]?.discountPercentage
              ? String(formik.errors.prices[index].discountPercentage)
              : ""
          }
          inputProps={{
            pattern: "[0-9]*.?[0-9]{0,2}",
            inputMode: "decimal",
            min: 0,
            max: 100,
          }}
        />
      ),
      actions: (
        <Box display="flex" justifyContent="center">
          <Button
            onClick={() => {
              const updatedPrices = formik.values.prices.filter(
                (_: any, idx: number) => idx !== index,
              );
              formik.setFieldValue("prices", updatedPrices);
            }}
          >
            <DeleteOutlined fontSize="medium" color="error" />
          </Button>
        </Box>
      ),
    }),
  );

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedItems = transformedData.slice(startIndex, endIndex);

  return (
    <Box>
      <SuperTable
        isLoading={false}
        items={paginatedItems}
        headers={tableHeaders}
        total={formik.values.prices.length}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPage={rowsPerPage}
        page={page}
        noDataPlaceholder={
          <Box sx={{ mt: 6, mb: 4 }}>
            <NoDataAnimation
              text={
                <Typography variant="h6" textAlign="center" sx={{ mt: 2 }}>
                  {t("Currently, there are no prices added")}
                </Typography>
              }
            />
          </Box>
        }
      />
    </Box>
  );
};
