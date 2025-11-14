import { LoadingButton } from "@mui/lab";
import {
  Autocomplete,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  MenuItem,
  Modal,
  Stack,
  SvgIcon,
  TextField,
  Tooltip,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import countries from "src/utils/countries.json";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import PhoneInput from "src/components/phone-input";
import { ProfileChooser } from "src/components/profile-chooser";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import i18n from "src/i18n";
import { MoleculeType } from "src/permissionManager";
import parsePhoneNumber from "src/utils/parse-phone-number";
import { Screens } from "src/utils/screens-names";
import useActiveTabs from "src/utils/use-active-tabs";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import * as Yup from "yup";
import TextFieldWrapper from "src/components/text-field-wrapper";
import CloseIcon from "@mui/icons-material/Close";

interface VendorCreateModalProps {
  open: boolean;
  handleClose: any;
}
interface VendorOverview {
  image?: string;
  company?: string;
  locationRefs?: string[];
  companyRef?: string;
  locations?: string[];
  fullName: string;
  tags?: string;
  website?: string;
  contactName?: string;
  orderEmail?: string;
  phone?: string;
  email?: string;
  vendorAverageFulfilment?: string;
  averageShippingDay?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  city?: string;
  state?: string;
  country?: string;
  note?: string;
  vatNumber?: string;
  status?: boolean;
}

const validationSchema = Yup.object({
  fullName: Yup.string()
    .max(60, i18n.t("Vendor/Company Name should not exceed 60 letters"))
    .matches(
      /^[a-zA-Z0-9].*[a-zA-Z0-9]$/,
      i18n.t("Enter valid vendor/company name")
    )
    .required(`${i18n.t("Vendor/Company Name is required")}`),
  contactName: Yup.string()
    .max(60, i18n.t("Contact Name should not exceed 60 letters"))
    .matches(/^[a-zA-Z0-9].*[a-zA-Z0-9]$/, i18n.t("Enter valid contact name"))
    .required(`${i18n.t("Contact Name is required")}`),
  phone: Yup.string()
    .min(9, `${i18n.t("Phone Number should be minimum 9 digits")}`)
    .max(12, i18n.t("Phone Number should be maximum 12 digits"))
    .required(`${i18n.t("Phone is required")}`),

  email: Yup.string()
    .email(`${i18n.t("Must be a valid email")}`)
    .max(255)
    .required(`${i18n.t("Contact Person Email is required")}`),
  orderEmail: Yup.string()
    .email(`${i18n.t("Must be a valid email")}`)
    .max(255)
    .required(`${i18n.t("Order email is required")}`),
});

export const VendorCreateModal: React.FC<VendorCreateModalProps> = ({
  open,
  handleClose,
}) => {
  const { t } = useTranslation();

  const theme = useTheme();
  const router = useRouter();
  const { id, companyRef, companyName, origin } = router.query;
  const [country, setCountry] = useState("+966");
  const [showError, setShowError] = useState(false);
  const { changeTab } = useActiveTabs();
  const canAccess = usePermissionManager();

  const canUpdate =
    canAccess(MoleculeType["vendor:update"]) ||
    canAccess(MoleculeType["vendor:manage"]);

  const { findOne, create, updateEntity, entity, loading } =
    useEntity("vendor");

  const handleChangeCountry = (event: any) => {
    setCountry(event.target.value);
  };

  const initialValues: VendorOverview = {
    company: "",
    locationRefs: [],
    locations: [],
    companyRef: "",
    image: "",
    fullName: "",
    tags: "",
    website: "",
    contactName: "",
    orderEmail: "",
    phone: "",
    email: "",
    vendorAverageFulfilment: "",
    averageShippingDay: "",
    addressLine1: "",
    addressLine2: "",
    postalCode: "",
    city: "",
    state: "",
    country: "Saudi Arabia",
    note: "",
    vatNumber: "",
    status: true,
  };

  const formik: any = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const data = {
        image: values.image,
        companyRef: companyRef,
        name: values.fullName,
        tags: values.tags,
        website: values.website,
        contactName: values.contactName,
        email: values.email,
        phone: parsePhoneNumber(country, values.phone),
        orderEmail: values.orderEmail,
        vendorAverageFulfilment: values.vendorAverageFulfilment,
        averageShippingDay: values.averageShippingDay,
        address: {
          address1: values.addressLine1,
          address2: values.addressLine2,
          postalCode: values.postalCode,
          city: values.city,
          country: values.country,
          state: values.state,
        },
        note: values.note,
        vat: {
          docNumber: values.vatNumber,
        },
        status: values.status ? "active" : "inactive",
      };

      try {
        await create({ ...data });
        toast.success(t("New Vendor Created").toString());

        handleClose();
      } catch (err) {
        toast.error(err.message);
        handleClose();
      }
    },
  });

  return (
    <>
      <Box>
        <Dialog
          open={open}
          onClose={() => {
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
              {t("Create Vendor")}
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
            <Box>
              <Stack spacing={1} sx={{ mb: 1 }}>
                <Grid container>
                  <Grid item md={12} xs={12}>
                    <Box sx={{ mt: 2 }}>
                      <TextFieldWrapper
                        inputProps={{ style: { textTransform: "capitalize" } }}
                        error={
                          !!(formik.touched.fullName && formik.errors.fullName)
                        }
                        fullWidth
                        helperText={
                          formik.touched.fullName && formik.errors.fullName
                        }
                        label={t("Vendor/Company Name")}
                        name="fullName"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.fullName}
                        required
                      />
                    </Box>
                  </Grid>

                  <Grid item md={12} xs={12}>
                    <Box sx={{ mt: 2 }}>
                      <TextFieldWrapper
                        inputProps={{ style: { textTransform: "capitalize" } }}
                        error={
                          !!(
                            formik.touched.contactName &&
                            formik.errors.contactName
                          )
                        }
                        fullWidth
                        helperText={
                          formik.touched.contactName &&
                          formik.errors.contactName
                        }
                        label={t("Contact Name")}
                        name="contactName"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.contactName}
                        required
                      />
                    </Box>
                  </Grid>
                  <Grid item md={12} xs={12}>
                    <Box sx={{ mt: 2 }}>
                      <TextFieldWrapper
                        error={!!(formik.touched.email && formik.errors.email)}
                        fullWidth
                        helperText={formik.touched.email && formik.errors.email}
                        label={t("Contact Person Email")}
                        name="email"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        type="email"
                        value={formik.values.email}
                        required
                      />
                    </Box>
                  </Grid>
                  <Grid item md={12} xs={12}>
                    <Box sx={{ mt: 2 }}>
                      <PhoneInput
                        touched={formik.touched.phone}
                        error={formik.errors.phone}
                        value={formik.values.phone}
                        onBlur={formik.handleBlur("phone")}
                        country={country}
                        handleChangeCountry={handleChangeCountry}
                        onChange={formik.handleChange("phone")}
                        style={{ mt: "-16px", mb: "-8px" }}
                        required={true}
                        label={t("Phone Number")}
                      />
                    </Box>
                  </Grid>
                  <Grid item md={12} xs={12}>
                    <Box sx={{ mt: 2 }}>
                      <TextFieldWrapper
                        error={
                          !!(
                            formik.touched.orderEmail &&
                            formik.errors.orderEmail
                          )
                        }
                        fullWidth
                        helperText={
                          formik.touched.orderEmail && formik.errors.orderEmail
                        }
                        label={t("Order Email Address")}
                        name="orderEmail"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        type="email"
                        required
                        value={formik.values.orderEmail}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
            </Box>
          </DialogContent>

          <Divider />
          <DialogActions
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "end",
              p: 2,
            }}>
            <LoadingButton
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                if (!canUpdate) {
                  return toast.error(t("You don't have access"));
                }
                setShowError(true);
                formik.handleSubmit();
              }}
              loading={formik.isSubmitting}
              sx={{ m: 1 }}
              variant="contained">
              {t("Create")}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};
