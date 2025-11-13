import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import { DatePicker } from "@mui/x-date-pickers";
import { MuiTextFieldProps } from "@mui/x-date-pickers/internals";
import { FormikProps, useFormik } from "formik";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import i18n from "src/i18n";
import * as Yup from "yup";

interface PaymentDateProps {
  paymentDate: Date;
}

const validationSchema = Yup.object({});

export const PaymentDateModal = (props: any) => {
  const { t } = useTranslation();

  const { open, modalData, handleClose, handleUpdate } = props;
  console.log("modal data", modalData);

  const theme = useTheme();

  const initialValues: PaymentDateProps = {
    paymentDate: null,
  };

  const formik: FormikProps<PaymentDateProps> = useFormik<PaymentDateProps>({
    initialValues,
    validationSchema,

    onSubmit: async (values) => {
      const data = {
        paymentDate: new Date(values.paymentDate),
      };

      try {
        await handleUpdate(formik.values.paymentDate);
        toast.success("Paymet date added!");
        handleClose();
      } catch (error) {
        toast.error(error.message);
      }
    },
  });

  useEffect(() => {
    if (open) {
      formik.resetForm();

      formik.setFieldValue("paymentDate", modalData?.paymentDate || null);
    }
  }, [open]);

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="sm"
        open={open}
        onClose={() => {
          formik.resetForm();
          handleClose();
        }}>
        {/* header */}

        <Box
          sx={{
            display: "flex",
            p: 2,
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor:
              theme.palette.mode === "light" ? "#fff" : "#111927",
          }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}></Box>

          <Typography sx={{ ml: 2 }} variant="h6">
            {t("Add Payment Date")}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": {
                backgroundColor: "action.hover",
                cursor: "pointer",
                opacity: 0.5,
              },
            }}>
            <CloseIcon fontSize="medium" onClick={handleClose} />
          </Box>
        </Box>

        <Divider />

        {/* body */}
        <DialogContent>
          <form onSubmit={() => formik.handleSubmit()}>
            <Stack spacing={2}>
              <Box>
                <DatePicker
                  //{/*
                  // @ts-ignore */}
                  inputProps={{ disabled: true }}
                  label={t("Payment Date")}
                  inputFormat="dd/MM/yyyy"
                  onChange={(date: Date | null): void => {
                    formik.setFieldValue("paymentDate", date);
                  }}
                  disableFuture
                  value={formik.values.paymentDate || null}
                  renderInput={(
                    params: JSX.IntrinsicAttributes & MuiTextFieldProps
                  ) => (
                    <TextField
                      disabled
                      required
                      fullWidth
                      {...params}
                      helperText={
                        (formik.touched.paymentDate &&
                          formik.errors.paymentDate) as any
                      }
                      error={Boolean(
                        formik.touched.paymentDate && formik.errors.paymentDate
                      )}
                      onBlur={formik.handleBlur("paymentDate")}
                    />
                  )}
                />
              </Box>
            </Stack>
          </form>
        </DialogContent>

        <Divider />
        {/* footer */}

        <DialogActions sx={{ p: 2 }}>
          <LoadingButton
            sx={{ borderRadius: 1 }}
            onClick={() => {
              if (!formik.values.paymentDate) {
                return toast.error(t("Add Payment date"));
              }
              formik.handleSubmit();
            }}
            size="medium"
            variant="contained"
            type="submit">
            {t("Submit")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};
