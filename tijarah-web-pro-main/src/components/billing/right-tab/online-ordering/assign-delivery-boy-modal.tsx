import { LoadingButton } from "@mui/lab";
import {
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Switch,
  TextField,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import PhoneInput from "src/components/phone-input";
import { useEntity } from "src/hooks/use-entity";
import i18n from "src/i18n";
import parsePhoneNumber from "src/utils/parse-phone-number";
import * as Yup from "yup";
import DeliveryBoyDropdown from "./delivery-boy-singleSelect";
import useScanStore from "src/store/scan-store";
import CloseIcon from "@mui/icons-material/Close";

interface AssignDeliveryProps {
  open: boolean;
  order: any;
  device: any;
  handleSuccess: any;
  handleClose: () => void;
}

interface AssignDeliveryFormikProps {
  other: boolean;
  deliveryBoyRef: string;
  deliveryBoyName: string;
  deliveryBoyPhone: string;
}

const validationSchema = Yup.object({
  deliveryBoyRef: Yup.string().when("other", {
    is: true,
    then: Yup.string().optional(),
    otherwise: Yup.string().required(i18n.t("Please Select Delivery Boy")),
  }),
  deliveryBoyName: Yup.string().when("other", {
    is: false,
    then: Yup.string().optional(),
    otherwise: Yup.string()
      .required(i18n.t("Name is required"))
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        i18n.t("Enter valid name")
      )
      .max(60, i18n.t("Name must not be greater than 60 characters")),
  }),
  deliveryBoyPhone: Yup.string().when("other", {
    is: false,
    then: Yup.string().optional(),
    otherwise: Yup.string()
      .required(i18n.t("Phone Number is required"))
      .min(9, i18n.t("Phone Number should be minimum 9 digits"))
      .max(12, i18n.t("Phone Number should not be maximum 12 digits")),
  }),
});

export const AssignDeliveryModal: React.FC<AssignDeliveryProps> = ({
  open,
  order,
  device,
  handleSuccess,
  handleClose,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { setScan } = useScanStore();

  const { create } = useEntity("ordering/driver/assign-driver");
  const { updateEntity } = useEntity("ordering/order");

  const [country, setCountry] = useState("+966");

  const initialValues: AssignDeliveryFormikProps = {
    other: false,
    deliveryBoyRef: "",
    deliveryBoyName: "",
    deliveryBoyPhone: "",
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      try {
        if (values?.other) {
          const data = {
            role: { name: "" },
            roleRef: "",
            userType: "app:driver",
            companyRef: device?.companyRef,
            company: {
              name: device?.company?.name,
            },
            location: {
              name: device?.location?.name,
            },
            locationRef: device?.locationRef,
            name: values.deliveryBoyName.trim(),
            email: "",
            profilePicture: "",
            phone: parsePhoneNumber(country, values.deliveryBoyPhone),
            pin: "",
            status: "active",
          };

          const res = await create({ ...data });

          if (res) {
            await updateEntity(order?._id, {
              orderStatus: "ready",
              driverRef: res._id,
              driver: {
                name: res.name,
                phone: res.phone,
              },
            });
            toast.success(t("Delivery boy created and assigned to order"));
            handleSuccess();
          }
        } else {
          await updateEntity(order?._id, {
            orderStatus: "ready",
            driverRef: values.deliveryBoyRef,
            driver: {
              name: values.deliveryBoyName,
              phone: values.deliveryBoyPhone,
            },
          });
          toast.success(t("Delivery boy assigned to order"));
          handleSuccess();
        }
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

  const handleChangeCountry = (event: any) => {
    setCountry(event.target.value);
  };

  useEffect(() => {
    formik.resetForm();

    if (open && order?.driverRef) {
      formik.setFieldValue("deliveryBoyRef", order?.driverRef || "");
      formik.setFieldValue("deliveryBoyName", order?.driver?.name || "");
      formik.setFieldValue("deliveryBoyPhone", order?.driver?.phone || "");
    }
  }, [open]);

  return (
    <Box>
      <Dialog fullWidth maxWidth="sm" open={open}>
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
            {t("Delivery Boy")}
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

        {/* body */}
        <Divider />
        <DialogContent>
          <form noValidate onSubmit={formik.handleSubmit}>
            <Box component="main" sx={{ flexGrow: 1 }}>
              <DeliveryBoyDropdown
                required={!formik.values.other}
                id="deliveryBoyRef"
                device={device}
                selectedId={formik.values.deliveryBoyRef}
                error={
                  formik.touched.deliveryBoyRef && formik.errors.deliveryBoyRef
                }
                onChange={(id, data) => {
                  if (id) {
                    formik.handleChange("deliveryBoyRef")(id);
                    formik.handleChange("deliveryBoyName")(data?.name);
                    formik.handleChange("deliveryBoyPhone")(data?.phone);
                  } else {
                    formik.setFieldValue("deliveryBoyRef", "");
                    formik.setFieldValue("deliveryBoyName", "");
                    formik.setFieldValue("deliveryBoyPhone", "");
                  }
                }}
                disabled={formik.values.other}
              />

              <Box
                sx={{
                  mt: 3,
                  display: "flex",
                  paddingLeft: "8px",
                  borderRadius: "8px",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: `1px solid ${
                    theme.palette.mode !== "dark" ? "#E5E7EB" : "#2D3748"
                  }`,
                }}>
                <Typography
                  fontSize="14px"
                  variant="subtitle2"
                  color="text.secondary">
                  {t("Assign Other Delivery Boy")}
                </Typography>

                <Box
                  sx={{
                    p: 0.75,
                    display: "flex",
                    alignItems: "center",
                  }}>
                  <Switch
                    color="primary"
                    edge="end"
                    name="other"
                    checked={formik.values.other}
                    onChange={(e) => {
                      formik.handleChange(e);
                      formik.setFieldValue("deliveryBoyRef", "");
                      formik.setFieldValue("deliveryBoyName", "");
                      formik.setFieldValue("deliveryBoyPhone", "");
                    }}
                    sx={{ mr: 0.25 }}
                  />
                </Box>
              </Box>

              {formik.values.other && (
                <Box>
                  <TextField
                    required
                    fullWidth
                    sx={{ mt: 2.75 }}
                    inputProps={{ style: { textTransform: "capitalize" } }}
                    error={Boolean(
                      formik.touched.deliveryBoyName &&
                        formik.errors.deliveryBoyName
                    )}
                    helperText={
                      (formik.touched.deliveryBoyName &&
                        formik.errors.deliveryBoyName) as any
                    }
                    label={t("Name")}
                    name="deliveryBoyName"
                    onFocus={() => setScan(true)}
                    onBlur={() => {
                      setScan(false);
                      formik.handleBlur("deliveryBoyName");
                    }}
                    onChange={formik.handleChange}
                    value={formik.values.deliveryBoyName}
                  />

                  <Box sx={{ mt: 1 }}>
                    <PhoneInput
                      required
                      country={country}
                      label={t("Phone Number")}
                      onFocus={() => setScan(true)}
                      handleChangeCountry={handleChangeCountry}
                      touched={formik.touched.deliveryBoyPhone}
                      error={formik.errors.deliveryBoyPhone}
                      value={formik.values.deliveryBoyPhone}
                      onBlur={() => {
                        setScan(false);
                        formik.handleBlur("deliveryBoyPhone");
                      }}
                      onChange={formik.handleChange("deliveryBoyPhone")}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          </form>
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
            sx={{
              borderRadius: 1,
            }}
            type="submit"
            variant="contained"
            loading={formik.isSubmitting}
            onClick={() => formik.handleSubmit()}>
            {order?.driverRef ? t("Change") : t("Assign")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
