import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { LoadingButton } from "@mui/lab";
import {
  Card,
  FormControl,
  FormHelperText,
  FormLabel,
  Modal,
  Typography,
  useTheme,
} from "@mui/material";
import { Box } from "@mui/system";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { format, subDays } from "date-fns";
import { useFormik } from "formik";
import { t } from "i18next";
import { MuiOtpInput } from "mui-one-time-password-input";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PropertyList } from "src/components/property-list";
import { PropertyListItem } from "src/components/property-list-item";
import { CompanyContext } from "src/contexts/company-context";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import i18n from "src/i18n";
import * as Yup from "yup";

interface ZatcaModalProps {
  open: boolean;
  handleClose: any;
  data: any;
  companyContextLocal?: any;
}

interface Values {
  code: string;
}

const initialValues: Values = {
  code: "",
};

const validationSchema = Yup.object({
  code: Yup.string().min(6).max(6).required("Code is required"),
});

export const ZatcaModal: React.FC<ZatcaModalProps> = ({
  open = false,
  handleClose,
  data,
  companyContextLocal = {},
}) => {
  const theme = useTheme();

  const { create: verifyOtpZatca } = useEntity("zatca");

  const [zatcaVerified, setZatcaVerified] = useState<boolean>(false);

  const companyContext = useContext(CompanyContext) as any;

  const { findOne: findOneLocation, entity } = useEntity("location");

  useEffect(() => {
    if (data?.locationRef && open) {
      setZatcaVerified(false);
      formik.resetForm();
      findOneLocation(data?.locationRef);
    }
  }, [open]);

  const { user } = useAuth();

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnBlur: false,
    onSubmit: async (values, helpers) => {
      try {
        const obj = {
          egs: {
            uuid: data?.zatcaConfiguration?.zatcaId,
            custom_id: data?.deviceCode,
            model: data?.metadata?.model,
            CRN_number: companyContext?.commercialRegistrationNumber?.docNumber,
            VAT_name: data?.company?.name,
            VAT_number:
              companyContext?.vat?.docNumber ||
              companyContextLocal?.vat?.docNumber ||
              user?.company?.vat?.docNumber,
            solution_name: "Tijarah360",
            location: {
              city: entity?.address?.city,
              city_subdivision: entity?.address?.address2,
              street: entity?.address?.address2,
              plot_identification: "0000",
              building: "0000",
              postal_zone: entity?.address?.postalCode,
            },
            branch_name: entity?.name?.en,
            branch_industry: companyContext?.businessType,
          },
          otp: values?.code,
        };

        await verifyOtpZatca({ ...obj });

        toast.success("Zatca successfully enabled");

        setZatcaVerified(true);
      } catch (error) {
        toast.error(error.error.message);
      }
    },
  });

  const isRTL = i18n.language == "ar" || i18n.language == "ur";

  return (
    <>
      <Modal
        open={open}
        onClose={() => {
          setZatcaVerified(false);
          formik.resetForm();
          handleClose();
        }}>
        <Card
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "95vw",
              sm: "80vw",
              md: "50vw",
              lg: "40vw",
            },

            maxHeight: "90%",
            bgcolor: theme.palette.mode !== "dark" ? `#f8f9fa` : "#0B0F19",
            overflow: "inherit",
            display: "flex",
            flexDirection: "column",
            p: 4,
            justifyContent: zatcaVerified ? "flex-start" : "center",
          }}>
          <Box style={{ width: "100%", display: "flex" }}>
            <XCircle
              fontSize="small"
              onClick={handleClose}
              style={{ cursor: "pointer" }}
            />

            {!zatcaVerified ? (
              <Box style={{ flex: 1 }}>
                <Typography variant="h5" align="center" sx={{ mr: 4 }}>
                  {t("Enable Zatca")}
                </Typography>
              </Box>
            ) : (
              <Box style={{ flex: 1 }}>
                <Typography variant="h5" align="center" sx={{ mr: 4 }}>
                  {t("Zatca Verified")}
                </Typography>
              </Box>
            )}
          </Box>
          {!zatcaVerified ? (
            <Box sx={{ mt: 3 }}>
              <Box
                sx={{
                  alignItems: "center",
                  display: "flex",
                  justifyContent: "space-between",
                }}>
                <Typography variant="h6">{t("Device details")}</Typography>
              </Box>
              <Box
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  mt: 3,
                }}>
                <PropertyList>
                  <PropertyListItem
                    align="horizontal"
                    divider
                    label={t("Common Name")}
                    value={data?.deviceCode}
                  />
                  <PropertyListItem
                    align="horizontal"
                    divider
                    label={t("UUID")}
                    value={data?.zatcaConfiguration?.zatcaId}
                  />
                  <PropertyListItem
                    align="horizontal"
                    divider
                    label={t("Location")}
                    value={isRTL ? entity?.name?.ar : entity?.name?.en}
                  />
                  <PropertyListItem
                    align="horizontal"
                    divider
                    label={t("Tax Payer")}
                    value={data?.company?.name}
                  />
                  <PropertyListItem
                    align="horizontal"
                    divider
                    label={t("VAT")}
                    value={
                      companyContext?.vat?.docNumber ||
                      companyContextLocal?.vat?.docNumber ||
                      user?.company?.vat?.docNumber
                    }
                  />
                  <PropertyListItem
                    align="horizontal"
                    divider
                    label={t("Commercial Registration Number")}
                    value={entity?.commercialRegistrationNumber?.docNumber}
                  />
                  {/* <PropertyListItem
                    align="horizontal"
                    divider
                    label={t("Expiration Date")}
                    value={format(subDays(new Date(), 5), "dd/MM/yyyy")}
                  /> */}
                </PropertyList>
              </Box>
              <form noValidate onSubmit={formik.handleSubmit}>
                <FormControl
                  error={!!(formik.touched.code && formik.errors.code)}>
                  <FormLabel
                    sx={{
                      display: "block",
                      mb: 2,
                      mt: 2,
                    }}>
                    {t("Code")}
                  </FormLabel>
                  <MuiOtpInput
                    length={6}
                    onBlur={() => formik.handleBlur("code")}
                    onChange={(value) => formik.setFieldValue("code", value)}
                    onFocus={() => formik.setFieldTouched("code")}
                    sx={{
                      "& .MuiFilledInput-input": {
                        p: "14px",
                      },
                    }}
                    value={formik.values.code}
                  />
                  {!!(formik.touched.code && formik.errors.code) && (
                    <FormHelperText>{formik.errors.code}</FormHelperText>
                  )}
                </FormControl>

                <LoadingButton
                  fullWidth
                  loading={formik.isSubmitting}
                  size="large"
                  sx={{ mt: 4 }}
                  type="submit"
                  variant="contained"
                  disabled={formik.isSubmitting}>
                  {t("Verify")}
                </LoadingButton>
              </form>
              <Typography variant="caption">
                Note: All the e-invoices will be submitted to ZATCA
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                flexDirection: "column",
                my: 5,
              }}>
              <CheckCircleIcon
                sx={{
                  height: 100,
                  width: 100,
                  fill: theme.palette.primary.main,
                }}
              />
              <Typography sx={{ textAlign: "center", mt: 2 }}>
                {t("Zatca successfully enabled for this device.")}
              </Typography>
            </Box>
          )}
        </Card>
      </Modal>
    </>
  );
};
