import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TextFieldProps } from "@mui/material";
import React from "react";
import TextFieldWrapper from "src/components/text-field-wrapper";

const DatePickerStocks = ({
  formik,
  stockDetail,
  createNew,
  productData,
}: any) => {
  const [openDatePickerExpiry, setOpenDatePickerExpiry] = React.useState(false);
  return (
    <DatePicker
      open={openDatePickerExpiry}
      onOpen={() => setOpenDatePickerExpiry(true)}
      onClose={() => setOpenDatePickerExpiry(false)}
      label={`Expiry Date`}
      inputFormat="dd/MM/yyyy"
      onChange={(date: Date | null): void => {
        const updatedStock = [...formik.values.stocks];
        const stockIndex = updatedStock.findIndex(
          (item) => item.locationRef === stockDetail.locationRef
        );

        if (stockIndex !== -1) {
          updatedStock[stockIndex].expiry = date;
          formik.setFieldValue("stocks", updatedStock);
        }
      }}
      //{/*
      // @ts-ignore */}
      inputProps={{ disabled: true }}
      minDate={new Date()}
      disablePast
      value={stockDetail.expiry}
      renderInput={(params: JSX.IntrinsicAttributes & TextFieldProps) => (
        <TextFieldWrapper
          required={
            createNew && stockDetail.tracking && productData.enabledBatching
          }
          fullWidth
          onClick={() => setOpenDatePickerExpiry(!openDatePickerExpiry)}
          {...params}
          error={Boolean(formik.touched.expiry && formik.errors.expiry)}
          helperText={(formik.touched.expiry && formik.errors.expiry) as any}
          onBlur={formik.handleBlur("expiry")}
        />
      )}
    />
  );
};

export default DatePickerStocks;
