import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import {
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  TextFieldProps,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { FormikProps, useFormik } from "formik";
import * as React from "react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { EventNames } from "src/types/customer";
import * as Yup from "yup";
import TextFieldWrapper from "../text-field-wrapper";

interface CustomerEventModalProps {
  open?: boolean;
  isFromService?: boolean;
  handleClose?: () => void;
  modalData?: any;
  onSuccess?: any;
}

interface FeatureProps {
  name?: string;
  date?: Date;
  type?: any;
}

export const CustomerEventModal: React.FC<CustomerEventModalProps> = ({
  open,
  isFromService = false,
  handleClose,
  modalData,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = React.useState(false);
  const theme = useTheme();

  const formik: FormikProps<FeatureProps> = useFormik<FeatureProps>({
    initialValues: {
      name: "",
      date: null,
      type: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .matches(
          /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
          t("Enter valid event name")
        )
        .required(t("Event is required")),
      date: Yup.date()
        .required(t("Date is required"))
        .typeError(t("Date is required")),
    }),
    onSubmit: async (values) => {
      try {
        onSuccess({
          ...values,
          name: values.name.trim(),
          date: values.date,
          type: modalData?.type || EventNames.other,
        });
        handleClose();
      } catch (error) {
        toast.error(error.message);
      }
    },
  });
  console.log("formik.values", formik.values);
  console.log("formik.errors", formik.errors);

  useEffect(() => {
    formik.resetForm();

    if (modalData?.name) {
      setIsEditing(true);
      formik.setFieldValue("name", modalData.name);
      formik.setFieldValue("date", modalData.date);
      formik.setFieldValue("type", modalData.type);
    } else setIsEditing(false);
  }, [open, modalData]);

  return (
    <Box>
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
            {t("Special Event")}
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
          <form noValidate onSubmit={formik.handleSubmit}>
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}>
                <TextFieldWrapper
                  disabled={isEditing}
                  fullWidth
                  label={t("Event")}
                  name="name"
                  sx={{ flexGrow: 1 }}
                  error={Boolean(formik.touched.name && formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  onBlur={formik.handleBlur}
                  onChange={(e) => {
                    formik.handleChange(e);
                  }}
                  required
                  value={formik.values.name}
                />
              </Box>

              <Box sx={{ mt: 3 }}>
                <DatePicker
                  label="Date"
                  inputFormat="dd/MM/yyyy"
                  onChange={(date: Date | null): void => {
                    formik.setFieldValue("date", date);
                  }}
                  maxDate={new Date()}
                  value={formik.values.date}
                  renderInput={(
                    params: JSX.IntrinsicAttributes & TextFieldProps
                  ) => (
                    <TextFieldWrapper
                      required
                      fullWidth
                      {...params}
                      error={Boolean(formik.touched.date && formik.errors.date)}
                      onBlur={formik.handleBlur("date")}
                    />
                  )}
                />
              </Box>
            </Box>
          </form>
        </DialogContent>
        <Divider />
        {/* footer */}
        <DialogActions
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
            p: 2,
          }}>
          <LoadingButton
            onClick={() => {
              formik.handleSubmit();
            }}
            sx={{ borderRadius: 1 }}
            loading={formik.isSubmitting}
            size="medium"
            variant="contained"
            type="submit">
            {!isEditing ? t("Add") : t("Update")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
