import { LoadingButton } from "@mui/lab";
import { Button, Card, Divider, TextField } from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import { FormikProps, useFormik } from "formik";
import * as React from "react";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import * as Yup from "yup";
import TextFieldWrapper from "../text-field-wrapper";

interface PurchaseOrderModalProps {
  open?: boolean;
  isFromService?: boolean;
  handleClose?: () => void;
  modalData?: any;
  onSuccess?: any;
}

interface FeatureProps {
  name?: string;
}

export const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({
  open,
  isFromService = false,
  handleClose,
  modalData,
  onSuccess,
}) => {
  const { t } = useTranslation();

  const formik: FormikProps<FeatureProps> = useFormik<FeatureProps>({
    initialValues: {
      name: "",
    },

    onSubmit: async (values) => {
      try {
        onSuccess({ ...values, id: modalData.id });
        handleClose();
      } catch (error) {
        toast.error(error.message);
      }
    },

    validationSchema: Yup.object({
      name: Yup.string().required(t("Product is required")),
    }),
  });

  useEffect(() => {
    formik.resetForm();

    updateData();
  }, [open]);

  const updateData = () => {
    if (modalData?.id != null) {
      formik.setFieldValue("event", modalData.event);
    }
  };

  return (
    <Box>
      <Modal
        open={open}
        onClose={() => {
          formik.resetForm();
          handleClose();
        }}
      >
        <form noValidate onSubmit={formik.handleSubmit}>
          <Card
            sx={{
              p: 4,
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: {
                xs: "90vw",
                sm: "70vw",
                md: "50vw",
              },
              overflow: "auto",
              bgcolor: "background.paper",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box style={{ width: "100%", display: "flex" }}>
              <XCircle
                fontSize="small"
                onClick={handleClose}
                style={{ cursor: "pointer" }}
              />

              <Box style={{ flex: 1 }}>
                <Typography variant="h5" align="center" sx={{ mr: 4, mb: 3 }}>
                  {t("Add Product")}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 1 }} />

            <Box>
              <Box
                sx={{
                  mt: 3,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <TextFieldWrapper
                  fullWidth
                  label={t("Product")}
                  name="name"
                  sx={{ flexGrow: 1 }}
                  error={Boolean(formik.touched.name && formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required
                  value={formik.values.name}
                />
              </Box>
              <Box
                sx={{
                  mt: 3,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <TextFieldWrapper
                  fullWidth
                  label={t("Name")}
                  name="name"
                  sx={{ flexGrow: 1 }}
                  error={Boolean(formik.touched.name && formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required
                  value={formik.values.name}
                />
              </Box>
              <Box
                sx={{
                  mt: 3,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <TextFieldWrapper
                  fullWidth
                  label={t("Category")}
                  name="cat"
                  sx={{ flexGrow: 1 }}
                  error={Boolean(formik.touched.name && formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required
                  value={formik.values.name}
                />
              </Box>
              <Box
                sx={{
                  mt: 3,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <TextFieldWrapper
                  fullWidth
                  label={t("Location")}
                  name="name"
                  sx={{ flexGrow: 1 }}
                  error={Boolean(formik.touched.name && formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required
                  value={formik.values.name}
                />
              </Box>
            </Box>

            <Box
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button onClick={handleClose} variant="outlined" sx={{ mr: 3 }}>
                {t("Cancel")}
              </Button>

              <LoadingButton
                loading={formik.isSubmitting}
                size="large"
                variant="contained"
                type="submit"
              >
                {modalData?.id != null ? t("Update") : t("Add")}
              </LoadingButton>
            </Box>
          </Card>
        </form>
      </Modal>
    </Box>
  );
};
