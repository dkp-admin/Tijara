import { LoadingButton } from "@mui/lab";
import {
  Card,
  Divider,
  MenuItem,
  Switch,
  TextField,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import i18n from "src/i18n";
import { MoleculeType } from "src/permissionManager";
import * as Yup from "yup";

interface OrderSettingsProps {
  open: boolean;
  data: any;
  handleSuccess: any;
  handleClose: () => void;
}

interface OrderSettingsFormikProps {
  pickup: boolean;
  delivery: boolean;
  pickupOffTill: string;
  deliveryOffTill: string;
  pickupNextAvailable: Date;
  deliveryNextAvailable: Date;
}

const pickupDeliveryTypeOptions = [
  // {
  //   label: i18n.t("2 Hours"),
  //   value: "2",
  // },
  // {
  //   label: i18n.t("4 Hours"),
  //   value: "4",
  // },
  // {
  //   label: i18n.t("Next Day Begin"),
  //   value: "nextDayBegin",
  // },
  {
    label: i18n.t("Manual Change"),
    value: "manualChange",
  },
  // {
  //   label: i18n.t("Custom"),
  //   value: "custom",
  // },
];

const initialValues: OrderSettingsFormikProps = {
  pickup: false,
  delivery: false,
  pickupOffTill: "manualChange",
  deliveryOffTill: "manualChange",
  pickupNextAvailable: null,
  deliveryNextAvailable: null,
};

const validationSchema = Yup.object({
  pickupOffTill: Yup.string().when("pickup", {
    is: true,
    then: Yup.string().optional(),
    otherwise: Yup.string().required(i18n.t("Please Select Pickup Off Till")),
  }),
  deliveryOffTill: Yup.string().when("delivery", {
    is: true,
    then: Yup.string().optional(),
    otherwise: Yup.string().required(i18n.t("Please Select Delivery Off Till")),
  }),
  pickupNextAvailable: Yup.date().when(["pickup", "pickupOffTill"], {
    is: (pickup: boolean, pickupOffTill: string) =>
      !pickup && pickupOffTill === "custom",
    then: Yup.date()
      .required(i18n.t("Pickup Next Available is required"))
      .typeError(i18n.t("Pickup Next Available is required"))
      .nullable(),
    otherwise: Yup.date().optional().nullable(),
  }),
  deliveryNextAvailable: Yup.date().when(["delivery", "deliveryOffTill"], {
    is: (delivery: boolean, deliveryOffTill: string) =>
      !delivery && deliveryOffTill === "custom",
    then: Yup.date()
      .required(i18n.t("Delivery Next Available is required"))
      .typeError(i18n.t("Delivery Next Available is required"))
      .nullable(),
    otherwise: Yup.date().optional().nullable(),
  }),
});

export const OnlineOrderSettingModal: React.FC<OrderSettingsProps> = ({
  open,
  data,
  handleSuccess,
  handleClose,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["location:update"]);

  const { updateEntity } = useEntity("ordering/menu-config");

  const [openPickupDatePicker, setOpenPickupDatePicker] = useState(false);
  const [openDeliveryDatePicker, setOpenDeliveryDatePicker] = useState(false);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      try {
        await updateEntity(data?._id, {
          pickup: values.pickup,
          delivery: values.delivery,
          pickupOffTill: values.pickup ? "" : values.pickupOffTill,
          deliveryOffTill: values.delivery ? "" : values.deliveryOffTill,
          pickupNextAvailable: values.pickup ? "" : values.pickupNextAvailable,
          deliveryNextAvailable: values.delivery
            ? ""
            : values.deliveryNextAvailable,
        });
        toast.success(t("Online order setting configuration updated"));
        handleSuccess();
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

  useEffect(() => {
    formik.resetForm();

    if (data?.pickupDeliveryConfiguration) {
      formik.setValues({
        pickup: data.pickupDeliveryConfiguration.pickup,
        delivery: data.pickupDeliveryConfiguration.delivery,
        pickupOffTill:
          data.pickupDeliveryConfiguration?.pickupOffTill || "manualChange",
        deliveryOffTill:
          data.pickupDeliveryConfiguration?.deliveryOffTill || "manualChange",
        pickupNextAvailable:
          data.pickupDeliveryConfiguration.pickupNextAvailable,
        deliveryNextAvailable:
          data.pickupDeliveryConfiguration.deliveryNextAvailable,
      });
    }
  }, [open, data]);

  return (
    <Box>
      <Modal open={open}>
        <Card
          sx={{
            visibility: "visible",
            scrollbarColor: "transparent",
            scrollBehavior: "auto",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "100vw",
              sm: "100vw",
              md: "40vw",
              lg: "40vw",
            },
            maxHeight: {
              xs: "100vh",
              sm: "100vh",
              md: "90vh",
              lg: "90vh",
            },
            borderRadius: {
              xs: "0px",
              sm: "0px",
              md: "20px",
              lg: "20px",
            },
            bgcolor: "background.paper",
            py: 2,
          }}
        >
          <Box
            sx={{
              pl: 2.5,
              pr: 2.5,
              pb: 1.5,
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1,
              flex: "0 0 auto",
              position: "fixed",
              background: theme.palette.mode !== "dark" ? `#fff` : "#111927",
            }}
          >
            <Box
              style={{
                marginTop: 15,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-evenly",
              }}
            >
              <XCircle
                fontSize="small"
                onClick={handleClose}
                style={{ cursor: "pointer" }}
              />

              <Box style={{ flex: 1 }}>
                <Typography variant="h5" align="center" sx={{ ml: 4 }}>
                  {t("Online Order Settings")}
                </Typography>
              </Box>

              <LoadingButton
                sx={{
                  mr: -1,
                  height: 25,
                  fontSize: "18px",
                  color: theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
                }}
                size="large"
                type="submit"
                variant="text"
                loading={formik.isSubmitting}
                onClick={() => {
                  if (!canUpdate) {
                    return toast.error(t("You don't have access"));
                  }
                  formik.handleSubmit();
                }}
              >
                {t("Update")}
              </LoadingButton>
            </Box>
          </Box>

          <Divider sx={{ mt: 5 }} />

          <Box
            sx={{
              px: 3,
              pt: 4,
              pb: 3,
              maxHeight: "auto",
              width: "100%",
              flex: "1 1 auto",
              overflow: "scroll",
              overflowX: "hidden",
            }}
          >
            <form noValidate onSubmit={formik.handleSubmit}>
              <Box component="main" sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    paddingLeft: "8px",
                    borderRadius: "8px",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: `1px solid ${
                      theme.palette.mode !== "dark" ? "#E5E7EB" : "#2D3748"
                    }`,
                  }}
                >
                  <Typography
                    fontSize="14px"
                    variant="subtitle2"
                    color="text.secondary"
                  >
                    {t("Pickup Order")}
                  </Typography>

                  <Box
                    sx={{
                      p: 0.75,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Switch
                      edge="end"
                      name="pickup"
                      color="primary"
                      checked={formik.values.pickup}
                      onChange={(e) => {
                        formik.handleChange(e);
                      }}
                      sx={{ mr: 0.25 }}
                    />
                  </Box>
                </Box>

                {!formik.values.pickup && (
                  <Box sx={{ mt: 3 }}>
                    <TextField
                      select
                      required
                      fullWidth
                      name="pickupOffTill"
                      label={t("Pickup Off Till")}
                      onBlur={formik.handleBlur}
                      onChange={(e) => {
                        formik.setFieldValue("pickupNextAvailable", null);
                        formik.setFieldValue("pickupOffTill", e.target.value);
                      }}
                      value={formik.values.pickupOffTill}
                      error={Boolean(
                        formik.touched.pickupOffTill &&
                          formik.errors.pickupOffTill
                      )}
                      helperText={
                        (formik.touched.pickupOffTill &&
                          formik.errors.pickupOffTill) as any
                      }
                    >
                      {pickupDeliveryTypeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>

                    {formik.values.pickupOffTill === "custom" && (
                      <Box sx={{ mt: 3 }}>
                        {/* tslint:disable */}
                        <DateTimePicker
                          open={openPickupDatePicker}
                          onOpen={() => setOpenPickupDatePicker(true)}
                          onClose={() => setOpenPickupDatePicker(false)}
                          minDateTime={new Date()}
                          label={t("Pickup Next Available")}
                          inputFormat="MMM d, yyyy, hh:mm a" //{/*
                          // @ts-ignore */}
                          inputProps={{ disabled: true }}
                          disablePast
                          onChange={(date) => {
                            formik.setFieldValue("pickupNextAvailable", date);
                          }}
                          value={formik.values.pickupNextAvailable}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              name="pickupNextAvailable"
                              error={Boolean(
                                formik.touched.pickupNextAvailable &&
                                  formik.errors.pickupNextAvailable
                              )}
                              helperText={
                                (formik.touched.pickupNextAvailable &&
                                  formik.errors.pickupNextAvailable) as any
                              }
                              onBlur={formik.handleBlur}
                              onClick={() =>
                                setOpenPickupDatePicker(!openPickupDatePicker)
                              }
                              required={
                                formik.values.pickupOffTill === "custom"
                              }
                            />
                          )}
                        />
                      </Box>
                    )}
                  </Box>
                )}

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
                  }}
                >
                  <Typography
                    fontSize="14px"
                    variant="subtitle2"
                    color="text.secondary"
                  >
                    {t("Delivery Order")}
                  </Typography>

                  <Box
                    sx={{
                      p: 0.75,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Switch
                      edge="end"
                      name="delivery"
                      color="primary"
                      checked={formik.values.delivery}
                      onChange={(e) => {
                        formik.handleChange(e);
                      }}
                      sx={{ mr: 0.25 }}
                    />
                  </Box>
                </Box>

                {!formik.values.delivery && (
                  <Box sx={{ mt: 3 }}>
                    <TextField
                      select
                      required
                      fullWidth
                      name="deliveryOffTill"
                      label={t("Delivery Off Till")}
                      onBlur={formik.handleBlur}
                      onChange={(e) => {
                        formik.setFieldValue("deliveryNextAvailable", null);
                        formik.setFieldValue("deliveryOffTill", e.target.value);
                      }}
                      value={formik.values.deliveryOffTill}
                      error={Boolean(
                        formik.touched.deliveryOffTill &&
                          formik.errors.deliveryOffTill
                      )}
                      helperText={
                        (formik.touched.deliveryOffTill &&
                          formik.errors.deliveryOffTill) as any
                      }
                    >
                      {pickupDeliveryTypeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>

                    {formik.values.deliveryOffTill === "custom" && (
                      <Box sx={{ mt: 3 }}>
                        {/* tslint:disable */}
                        <DateTimePicker
                          open={openDeliveryDatePicker}
                          onOpen={() => setOpenDeliveryDatePicker(true)}
                          onClose={() => setOpenDeliveryDatePicker(false)}
                          minDateTime={new Date()}
                          label={t("Delivery Next Available")}
                          inputFormat="MMM d, yyyy, hh:mm a" //{/*
                          // @ts-ignore */}
                          inputProps={{ disabled: true }}
                          disablePast
                          onChange={(date) => {
                            formik.setFieldValue("deliveryNextAvailable", date);
                          }}
                          value={formik.values.deliveryNextAvailable}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              name="deliveryNextAvailable"
                              error={Boolean(
                                formik.touched.deliveryNextAvailable &&
                                  formik.errors.deliveryNextAvailable
                              )}
                              helperText={
                                (formik.touched.deliveryNextAvailable &&
                                  formik.errors.deliveryNextAvailable) as any
                              }
                              onBlur={formik.handleBlur}
                              onClick={() =>
                                setOpenDeliveryDatePicker(
                                  !openDeliveryDatePicker
                                )
                              }
                              required={
                                formik.values.deliveryOffTill === "custom"
                              }
                            />
                          )}
                        />
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </form>
          </Box>
        </Card>
      </Modal>
    </Box>
  );
};
