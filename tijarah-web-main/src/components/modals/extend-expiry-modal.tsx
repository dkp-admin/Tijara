import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Modal,
  Stack,
  TextFieldProps,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/system";
import { DatePicker } from "@mui/x-date-pickers";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useFormik } from "formik";
import { useContext, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { CompanyContext } from "src/contexts/company-context";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import * as Yup from "yup";
import TextFieldWrapper from "../text-field-wrapper";

const validationSchema = Yup.object({
  subscriptionEndDate: Yup.date()
    .required("New end date is required")
    .min(new Date(), "New end date must be in the future"),
});

interface Props {
  openExtendModal: boolean;
  setOpenExtendModal: (open: boolean) => void;
  subscription: any;
}

export default function ExtendExpiryModal({
  openExtendModal,
  setOpenExtendModal,
  subscription,
}: Props) {
  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";
  const { updateEntity } = useEntity("subscription/expiry");

  const theme = useTheme();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  usePageView();

  const formik = useFormik({
    initialValues: {
      subscriptionEndDate: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await updateEntity(subscription?._id, {
          subscriptionEndDate: values.subscriptionEndDate,
        });
        queryClient.invalidateQueries("find-one-subscription/ownerRef");
        toast.success("Subscription expiry extended successfully");
        setOpenExtendModal(false);
      } catch (error) {
        console.error("Error extending subscription:", error);
        toast.error("Failed to extend subscription");
      }
    },
  });

  return (
    <Modal open={openExtendModal}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Card
          sx={{
            width: { xs: "95%", sm: "85%", md: "600px", lg: "700px" },
            maxHeight: "95vh",
            overflowY: "auto",
            borderRadius: 3,
            boxShadow: 4,
            bgcolor: "background.paper",
            p: 4,
            direction: isRTL ? "rtl" : "ltr",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
              borderBottom: `1px solid ${theme.palette.divider}`,
              pb: 2,
            }}
          >
            <Typography variant="h5" fontWeight="700">
              {t("Extend Subscription Expiry")}
            </Typography>
            <XCircle
              fontSize="medium"
              onClick={() => setOpenExtendModal(false)}
            />
          </Box>

          <Container disableGutters>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="600" mb={1.5}>
                {t("Current Subscription Details")}
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  <strong>{t("Package:")}</strong>
                  {isRTL
                    ? subscription?.package?.en || "N/A"
                    : subscription?.package?.ar || "N/A"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>{t("Billing Cycle:")}</strong>{" "}
                  {subscription?.billingCycle || "N/A"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>{t("Subscription End Date:")}</strong>{" "}
                  {subscription?.subscriptionEndDate
                    ? new Date(
                        subscription.subscriptionEndDate
                      ).toLocaleDateString()
                    : "N/A"}
                </Typography>
              </Stack>
            </Box>

            <Divider sx={{ my: 2 }} />

            <form onSubmit={formik.handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="600" mb={1.5}>
                  {t("Extend Subscription")}
                </Typography>
                <DatePicker
                  //@ts-ignore
                  inputProps={{ disabled: true }}
                  label="Subscription Expiry"
                  inputFormat="dd/MM/yyyy"
                  onChange={(date: Date): void => {
                    formik.setFieldValue("subscriptionEndDate", date);
                  }}
                  minDate={new Date()}
                  disablePast
                  value={formik.values.subscriptionEndDate}
                  renderInput={(
                    params: JSX.IntrinsicAttributes & TextFieldProps
                  ) => (
                    <TextFieldWrapper
                      required
                      fullWidth
                      {...params}
                      error={Boolean(
                        formik.touched.subscriptionEndDate &&
                          formik.errors.subscriptionEndDate
                      )}
                      helperText={
                        (formik.touched.subscriptionEndDate &&
                          formik.errors.subscriptionEndDate) as any
                      }
                      onBlur={formik.handleBlur("subscriptionEndDate")}
                    />
                  )}
                />
                {formik.values.subscriptionEndDate && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t("New Subscription End Date:")}</strong>{" "}
                    {new Date(
                      formik.values.subscriptionEndDate
                    ).toLocaleDateString()}
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setOpenExtendModal(false)}
                  sx={{ textTransform: "none", px: 3, py: 0.75 }}
                >
                  {t("Cancel")}
                </Button>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  sx={{ textTransform: "none", px: 3, py: 0.75 }}
                  loading={formik.isSubmitting}
                  disabled={!formik.isValid || !formik.dirty}
                >
                  {t("Extend Subscription")}
                </LoadingButton>
              </Box>
            </form>
          </Container>
        </Card>
      </Box>
    </Modal>
  );
}
