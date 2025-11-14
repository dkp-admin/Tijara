import { LoadingButton } from "@mui/lab";
import { Card, TextField, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { FormikProps, useFormik } from "formik";
import * as React from "react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import i18n from "src/i18n";
import * as Yup from "yup";

interface CustomerEventModalProps {
  open: boolean;
  customerRef: string;
  customerName: string;
  handleClose: () => void;
}

interface CustomerProps {
  fullName: string;
}

const validationSchema = Yup.object({
  fullName: Yup.string()
    .matches(
      /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
      i18n.t("Enter valid name")
    )
    .required(`${i18n.t("Full Name is required")}`)
    .max(60, i18n.t("Full name must not be greater than 60 characters")),
});

export const CustomerNameAddModal: React.FC<CustomerEventModalProps> = ({
  open,
  customerRef,
  customerName,
  handleClose,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { updateCustomer } = useAuth();

  const { updateEntity } = useEntity("customer");

  const initialValues: CustomerProps = {
    fullName: "",
  };

  const formik: FormikProps<CustomerProps> = useFormik<CustomerProps>({
    initialValues,
    validationSchema,

    onSubmit: async (values) => {
      try {
        const res = await updateEntity(customerRef?.toString(), {
          name: values.fullName.trim(),
        });

        if (res) {
          const accessToken = window.localStorage.getItem("accessToken");
          const user = JSON.parse(window.localStorage.getItem("user"));
          const customer = JSON.parse(window.localStorage.getItem("customer"));

          localStorage.setItem(
            "customer",
            JSON.stringify({ ...customer, name: values.fullName })
          );

          await updateCustomer({
            user: user,
            customer: JSON.stringify({ ...customer, name: values.fullName }),
            token: accessToken,
          });

          toast.success(t("Name Updated"));
          handleClose();
        }
      } catch (error) {
        toast.error(error.message);
      }
    },
  });

  useEffect(() => {
    formik.resetForm();

    if (customerName) {
      formik.setValues({ fullName: customerName });
    }
  }, [open, customerName]);

  return (
    <Box>
      <Modal
        open={open}
        onClose={() => {
          formik.resetForm();
          handleClose();
        }}
      >
        <Card
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "90vw",
              sm: "70vw",
              md: "55vw",
              lg: "40vw",
            },
            bgcolor: "background.paper",
            overflow: "auto",
            p: 3,
          }}
        >
          <Box style={{ width: "100%", display: "flex" }}>
            <XCircle
              fontSize="small"
              onClick={handleClose}
              style={{ cursor: "pointer" }}
            />

            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" align="center" sx={{ mr: 1 }}>
                {customerName ? t("Edit Full Name") : t("Add Full Name")}
              </Typography>
            </Box>
          </Box>

          <form noValidate onSubmit={formik.handleSubmit}>
            <TextField
              sx={{ mt: 5 }}
              inputProps={{
                style: { textTransform: "capitalize" },
              }}
              fullWidth
              label={t("Full Name")}
              name="fullName"
              error={Boolean(formik.touched.fullName && formik.errors.fullName)}
              helperText={
                (formik.touched.fullName && formik.errors.fullName) as any
              }
              onBlur={formik.handleBlur}
              onChange={(e) => {
                formik.handleChange(e);
              }}
              required
              value={formik.values.fullName}
            />
          </form>

          <Box
            sx={{
              pt: 4,
              display: "flex",
              justifyContent: "flex-end",
              background: theme.palette.mode !== "dark" ? `#fff` : "#111927",
            }}
          >
            <LoadingButton
              type="submit"
              variant="contained"
              loading={formik.isSubmitting}
              onClick={() => {
                formik.handleSubmit();
              }}
            >
              {t("Submit")}
            </LoadingButton>
          </Box>
        </Card>
      </Modal>
    </Box>
  );
};
