import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  IconButton,
  MenuItem,
  Modal,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/system";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useFormik } from "formik";
import { t } from "i18next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useEntity } from "src/hooks/use-entity";
import { getBilling } from "src/utils/get-billing";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";
import * as Yup from "yup";

interface QuantityInputProps {
  label: string;
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
}

const QuantityInput: React.FC<QuantityInputProps> = ({
  value,
  onChange,
  min = 0,
  max,
}) => {
  const handleIncrement = () => {
    const newValue = value + 1;
    if (max === undefined || newValue <= max) {
      onChange(newValue);
    }
  };

  const handleDecrement = () => {
    const newValue = value - 1;
    if (newValue >= min) {
      onChange(newValue);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        height: 48,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        mt: 1,
      }}
    >
      <IconButton
        onClick={handleDecrement}
        disabled={value <= min}
        size="small"
        sx={{ ml: 1 }}
      >
        <RemoveIcon />
      </IconButton>
      <Typography
        variant="body1"
        sx={{
          flex: 1,
          textAlign: "center",
          fontWeight: "medium",
        }}
      >
        {value}
      </Typography>
      <IconButton
        onClick={handleIncrement}
        disabled={max !== undefined && value >= max}
        size="small"
        sx={{ mr: 1 }}
      >
        <AddIcon />
      </IconButton>
    </Box>
  );
};

interface Price {
  type: string;
  billingCycle: string;
  price: number;
  discountedPrice: number;
  discountPercentage: number;
}

interface Hardware {
  key: string;
  name: { en: string; ar: string };
  price: number;
  qty?: number;
}

interface Addon {
  key: string;
  name: string;
  subModules: {
    key: string;
    name: string;
  }[];
  prices: Price[];
  qty?: number;
}

interface FormValues {
  billingCycle: string;
  addons: Array<{
    key: string;
    quantity?: number;
    name: string;
    subModules: Array<{
      key: string;
      name: string;
    }>;
    prices: Price[];
    qty?: number;
    [key: string]: any;
  }>;
  hardwares: Array<Hardware>;
}

interface MerchantSubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  subscription: any;
}

export const MerchantSubscriptionModal = ({
  open,
  onClose,
  subscription,
}: MerchantSubscriptionModalProps) => {
  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";
  const { findOne, entity: packageData } = useEntity("package");
  const router = useRouter();
  const currency = useCurrency();

  useEffect(() => {
    if (subscription?.packageRef) {
      findOne(subscription?.packageRef);
    }
  }, [subscription]);

  const getPriceInfo = (pricesArray: Price[] = [], billingCycle: string) => {
    const priceObj = pricesArray.find((p) => p.type === billingCycle) || {
      price: 0,
      discountPercentage: 0,
    };
    const originalPrice = priceObj.price;
    const discountedPrice =
      originalPrice * (1 - (priceObj.discountPercentage || 0) / 100);
    return { originalPrice, discountedPrice };
  };

  const getAnnualDiscountPercentage = () => {
    if (packageData?.prices && packageData.prices.length > 0) {
      const annualPrice = packageData.prices.find(
        (p: any) => p.type === "annually"
      );
      return annualPrice?.discountPercentage || 0;
    }
    return 0;
  };

  const annualDiscountPercentage = getAnnualDiscountPercentage();

  const formik = useFormik<FormValues>({
    initialValues: {
      billingCycle: subscription?.billingCycle || "quarterly",
      addons: subscription?.addons || [],
      hardwares: subscription?.hardwares || [],
    },
    validationSchema: Yup.object({
      billingCycle: Yup.string().required(t("Select a billing cycle")),
    }),
    enableReinitialize: true,
    onSubmit: (values: FormValues) => {
      const locationAddon = values.addons.find(
        (addon) => addon.key === "location_addon"
      );
      const deviceAddon = values.addons.find(
        (addon) => addon.key === "device_addon"
      );

      const updateData = {
        billingCycle: values.billingCycle,
        addons: values.addons,
        hardwares: values.hardwares,
        subscriptionRef: subscription?._id,
        ownerRef: subscription?.ownerRef,
        packageRef: subscription?.packageRef,
        newLocationLimit: currentLocationLimit,
        newDeviceLimit: currentDeviceLimit,
        isTrialConversion: subscription?.isTrial || false,
        renewPackage: subscription?.isTrial || false,
      };

      localStorage.setItem(
        "subscriptionUpdateData",
        JSON.stringify(updateData)
      );

      router.push("/payment-gateway/subscription-update");
    },
  });

  const locationAddon = formik.values.addons.find(
    (addon) => addon.key === "location_addon"
  );
  const deviceAddon = formik.values.addons.find(
    (addon) => addon.key === "device_addon"
  );

  const currentLocationLimit =
    packageData?.locationLimit + locationAddon?.qty || 1;

  const currentDeviceLimit = packageData?.deviceLimit + deviceAddon?.qty || 1;

  const billing = getBilling({
    currentLocationLimit: currentLocationLimit,
    currentDeviceLimit: currentDeviceLimit,
    currentAddons: subscription?.addons || [],
    currentHardwares: subscription?.hardwares || [],
    subscriptionEndDate: subscription?.subscriptionEndDate,
    newHardwares: formik.values.hardwares,
    newAddons: formik.values.addons,
    packageAddons: packageData?.addons || [],
    packageHardwares: packageData?.hardwares || [],
    packagePrices: packageData?.prices || [],
    isTrialConversion: subscription?.isTrial || false,
    renewPackage: subscription?.isTrial || false,
    billingCycle: formik.values.billingCycle,
  });

  // Always show billing summary for trial conversions, or when there are charges
  const showBillingSummary = subscription?.isTrial || billing.total > 0;

  const hasLocationAddon = packageData?.addons?.some(
    (addon: any) => addon.key === "location_addon"
  );
  const hasDeviceAddon = packageData?.addons?.some(
    (addon: any) => addon.key === "device_addon"
  );

  const handleSelectedAddon = (addon: Addon) => {
    if (!formik.values.addons.some((a: Addon) => a.key === addon.key)) {
      const updatedAddons = [...formik.values.addons, addon];
      formik.setFieldValue("addons", updatedAddons);
    }
  };

  const handleLocationChange = (newValue: number) => {
    if (hasLocationAddon) {
      const locationAddon = packageData?.addons?.find(
        (addon: any) => addon.key === "location_addon"
      );
      const currentAddons = [...formik.values.addons];
      const locationAddonIndex = currentAddons.findIndex(
        (addon) => addon.key === "location_addon"
      );
      const incrementalQty = newValue;

      if (incrementalQty > 0) {
        if (locationAddonIndex >= 0) {
          currentAddons[locationAddonIndex] = {
            ...locationAddon,
            qty: incrementalQty,
          };
        } else {
          currentAddons.push({
            ...locationAddon,
            qty: incrementalQty,
          });
        }
      } else if (locationAddonIndex >= 0) {
        currentAddons.splice(locationAddonIndex, 1);
      }

      formik.setFieldValue("addons", currentAddons);
    }
  };

  const handleDeviceChange = (newValue: number) => {
    if (hasDeviceAddon) {
      const deviceAddon = packageData?.addons?.find(
        (addon: any) => addon.key === "device_addon"
      );
      const currentAddons = [...formik.values.addons];
      const deviceAddonIndex = currentAddons.findIndex(
        (addon) => addon.key === "device_addon"
      );
      // newValue is the incremental quantity (additional devices)
      const incrementalQty = newValue;

      if (incrementalQty > 0) {
        if (deviceAddonIndex >= 0) {
          currentAddons[deviceAddonIndex] = {
            ...deviceAddon,
            qty: incrementalQty,
          };
        } else {
          currentAddons.push({
            ...deviceAddon,
            qty: incrementalQty,
          });
        }
      } else if (deviceAddonIndex >= 0) {
        currentAddons.splice(deviceAddonIndex, 1);
      }

      formik.setFieldValue("addons", currentAddons);
    }
  };

  const handleHardwareChange = (hardware: Hardware, qty: number = 1) => {
    const filteredHardwares = formik.values.hardwares.filter((_: Hardware) =>
      packageData?.hardwares.some((planHw: any) => planHw.key === hardware.key)
    );

    const currentHardwares = [...filteredHardwares];
    const hardwareIndex = currentHardwares.findIndex(
      (hw) => hw.key === hardware.key
    );

    if (qty > 0) {
      if (hardwareIndex >= 0) {
        currentHardwares[hardwareIndex] = {
          ...hardware,
          qty: qty,
        };
      } else {
        currentHardwares.push({
          ...hardware,
          qty: qty,
        });
      }
    } else if (hardwareIndex >= 0) {
      currentHardwares.splice(hardwareIndex, 1);
    }

    formik.setFieldValue("hardwares", currentHardwares);
  };

  const theme = useTheme();

  return (
    <Modal open={open}>
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
            width: { xs: "95%", sm: "85%", md: "800px", lg: "900px" },
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
              {t("Update Subscription")}
            </Typography>
            <XCircle cursor={"pointer"} fontSize="medium" onClick={onClose} />
          </Box>

          <Container disableGutters>
            <form onSubmit={formik.handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="600" mb={1.5}>
                  {t("Current Subscription")}
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t("Package:")}</strong>{" "}
                    {isRTL
                      ? packageData?.name?.ar ||
                        subscription?.package?.ar ||
                        "N/A"
                      : packageData?.name?.en ||
                        subscription?.package?.en ||
                        "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t("Billing Cycle:")}</strong>{" "}
                    {t(subscription?.billingCycle || "N/A")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t("Current Locations:")}</strong>{" "}
                    {currentLocationLimit}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t("Current Devices:")}</strong>{" "}
                    {currentDeviceLimit}
                  </Typography>
                </Stack>
              </Box>

              {subscription?.isTrial && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="600" mb={1.5}>
                    {t("Select Billing Cycle")}
                  </Typography>
                  <Box sx={{ width: "100%" }}>
                    <TextField
                      fullWidth
                      label={t("Billing Cycle")}
                      name="billingCycle"
                      value={formik.values.billingCycle}
                      onChange={formik.handleChange}
                      select
                      required
                    >
                      <MenuItem value="quarterly">{t("Quarterly")}</MenuItem>
                      <MenuItem value="annually">
                        {t("Annually")}
                        {annualDiscountPercentage > 0 && (
                          <Typography
                            component="span"
                            variant="caption"
                            color="success.main"
                            sx={{ ml: 1, fontWeight: "medium" }}
                          >
                            ({t("SAVE")} {annualDiscountPercentage}%)
                          </Typography>
                        )}
                      </MenuItem>
                    </TextField>
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    {t(
                      "Note: Changing the billing cycle will update all prices accordingly."
                    )}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {packageData?.addons?.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="600" mb={1.5}>
                    {t("Addons")}
                  </Typography>
                  <Stack spacing={1}>
                    {packageData?.addons
                      .filter(
                        (addon: any) =>
                          addon.key !== "location_addon" &&
                          addon.key !== "device_addon"
                      )
                      .map((addon: any) => {
                        const addonPrice = getPriceInfo(
                          addon.prices,
                          formik.values.billingCycle
                        ).discountedPrice;
                        const isChecked =
                          subscription?.addons?.some(
                            (a: Addon) => a.key === addon.key
                          ) ||
                          formik.values.addons.some(
                            (a: Addon) => a.key === addon.key
                          );
                        return (
                          <Box
                            key={addon.key}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              p: 2,
                              borderRadius: 1,
                              minHeight: 56,
                            }}
                          >
                            <Typography variant="body2">
                              {addon.name} - {currency} {addonPrice}
                            </Typography>
                            <Switch
                              checked={isChecked}
                              onChange={() => {
                                const isInOriginalSubscription =
                                  subscription?.addons?.some(
                                    (a: Addon) => a.key === addon.key
                                  );

                                if (!isInOriginalSubscription) {
                                  const updatedAddons = isChecked
                                    ? formik.values.addons.filter(
                                        (a) => a.key !== addon.key
                                      )
                                    : [...formik.values.addons, addon];
                                  formik.setFieldValue("addons", updatedAddons);
                                } else {
                                  handleSelectedAddon(addon);
                                }
                              }}
                              size="small"
                              disabled={subscription?.addons?.some(
                                (a: Addon) => a.key === addon.key
                              )}
                            />
                          </Box>
                        );
                      })}
                  </Stack>
                </Box>
              )}

              <Box sx={{ mb: 3 }}>
                {hasLocationAddon && (
                  <>
                    <Typography variant="subtitle1" fontWeight="600" mb={1.5}>
                      {t("Locations")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {t("Current Locations:")} {currentLocationLimit}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t("Additional Locations:")}{" "}
                        {formik.values.addons.find(
                          (addon) => addon.key === "location_addon"
                        )?.qty || 0}
                      </Typography>
                    </Box>
                    <QuantityInput
                      label={t("Additional Locations")}
                      value={
                        formik.values.addons.find(
                          (addon) => addon.key === "location_addon"
                        )?.qty || 0
                      }
                      onChange={handleLocationChange}
                      min={0}
                    />
                  </>
                )}
              </Box>

              <Box sx={{ mb: 3 }}>
                {hasDeviceAddon && (
                  <>
                    <Typography variant="subtitle1" fontWeight="600" mb={1.5}>
                      {t("Devices")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {t("Current Devices:")} {currentDeviceLimit}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t("Additional Devices:")}{" "}
                        {formik.values.addons.find(
                          (addon) => addon.key === "device_addon"
                        )?.qty || 0}
                      </Typography>
                    </Box>
                    <QuantityInput
                      label={t("Additional Devices")}
                      value={
                        formik.values.addons.find(
                          (addon) => addon.key === "device_addon"
                        )?.qty || 0
                      }
                      onChange={handleDeviceChange}
                      min={0}
                    />
                  </>
                )}
              </Box>

              {packageData?.hardwares?.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="600" mb={1.5}>
                    {t("Hardware Options")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {t("Select hardware items for your subscription")}
                  </Typography>
                  <Stack spacing={2}>
                    {packageData.hardwares.map((hardware: Hardware) => {
                      const originalQty =
                        subscription?.hardwares?.find(
                          (hw: any) => hw.key === hardware.key
                        )?.qty || 0;

                      const incrementalQty =
                        formik.values.hardwares.find(
                          (hw) => hw.key === hardware.key
                        )?.qty || 0;

                      return (
                        <Box
                          key={hardware.key}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                          }}
                        >
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {isRTL ? hardware.name.ar : hardware.name.en}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {currency} {hardware.price}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {t("Current Units")}: {originalQty}
                              </Typography>
                              {incrementalQty > 0 && (
                                <Typography
                                  variant="body2"
                                  color="primary"
                                  fontWeight="medium"
                                >
                                  {t("Additional Units")}: +{incrementalQty}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <QuantityInput
                              label={t("Additional Units")}
                              value={incrementalQty}
                              onChange={(newValue) =>
                                handleHardwareChange(hardware, newValue)
                              }
                              min={0}
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              )}

              {showBillingSummary && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="600" mb={1.5}>
                    {t("Billing Summary")}
                  </Typography>
                  <Stack spacing={1} sx={{ p: 2, borderRadius: 1 }}>
                    {billing.items.map((item) => {
                      const isHardware = item.name.includes("units");
                      const isLocationAddon =
                        item.name === "Additional Locations";
                      const isDeviceAddon = item.name === "Additional Devices";

                      let displayName = t(item.name);

                      // For hardware items
                      if (isHardware) {
                        if (subscription?.isTrial) {
                          displayName = displayName.replace(
                            /\((\d+) units\)/,
                            "($1 units)"
                          );
                        } else {
                          displayName = displayName.replace(
                            /\((\d+) units\)/,
                            "(+$1)"
                          );
                        }
                      }

                      // For location and device addons
                      if (isLocationAddon || isDeviceAddon) {
                        const locationQty = subscription?.isTrial
                          ? formik.values.addons.find(
                              (addon) => addon.key === "location_addon"
                            )?.qty || 0
                          : (formik.values.addons.find(
                              (addon) => addon.key === "location_addon"
                            )?.qty || 0) -
                              subscription?.addons.find(
                                (addon: any) => addon.key === "location_addon"
                              )?.qty || 0;

                        const deviceQty = subscription?.isTrial
                          ? formik.values.addons.find(
                              (addon) => addon.key === "device_addon"
                            )?.qty || 0
                          : (formik.values.addons.find(
                              (addon) => addon.key === "device_addon"
                            )?.qty || 0) -
                            (subscription?.addons.find(
                              (addon: any) => addon.key === "device_addon"
                            )?.qty || 0);

                        if (
                          !subscription?.isTrial &&
                          ((isLocationAddon && locationQty === 0) ||
                            (isDeviceAddon && deviceQty === 0))
                        ) {
                          return null;
                        }
                        displayName = isLocationAddon
                          ? `${t("Additional Locations")} (+${locationQty})`
                          : `${t("Additional Devices")} (+${deviceQty})`;
                      }

                      return (
                        <Box
                          key={item.name}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2">{displayName}</Typography>
                          <Typography variant="body2">
                            {currency} {toFixedNumber(item.amount)}
                          </Typography>
                        </Box>
                      );
                    })}
                    <Divider />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="600">
                        {t("Total Additional Charges")}
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="600">
                        {currency} {toFixedNumber(billing.total)}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                  >
                    {subscription?.isTrial
                      ? t(
                          "Note: As you are converting from a trial, full charges for the selected billing cycle will apply. This includes the package amount, all locations, devices, addons, and hardware."
                        )
                      : t(
                          "Note: All charges are calculated on a prorated basis based on the remaining days until your subscription end date"
                        )}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  border: "1px solid green",
                  p: 2,
                  mb: 2,
                  borderRadius: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {t("Additional Payment")}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "primary.dark" }}
                >
                  {currency} {toFixedNumber(billing.total)}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 3,
                }}
              >
                <Button onClick={onClose}>{t("Cancel")}</Button>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  sx={{ textTransform: "none", px: 3, py: 0.75 }}
                  loading={formik.isSubmitting}
                  disabled={
                    formik.isSubmitting ||
                    (!subscription?.isTrial && billing.total <= 0)
                  }
                >
                  {t("Continue to Payment")}
                </LoadingButton>
              </Box>
            </form>
          </Container>
        </Card>
      </Box>
    </Modal>
  );
};

export default MerchantSubscriptionModal;
