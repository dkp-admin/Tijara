import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Card,
  Checkbox,
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
import { DateTime } from "luxon";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { CompanyContext } from "src/contexts/company-context";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { getBillingSuperAdmin } from "src/utils/get-billing-super-admin";
import { useCurrency } from "src/utils/useCurrency";
import * as Yup from "yup";

// Validation schema
const validationSchema = Yup.object({
  paymentStatus: Yup.string().required("Payment status is required"),
});

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

// Types
interface Price {
  _id?: string;
  type: string;
  price: number;
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

interface Plan {
  _id: string;
  name: { en: string; ar: string };
  prices: Price[];
  hardwares: Hardware[];
  addons: Addon[];
  locationLimit: number;
  deviceLimit: number;
}

const AccountSubscriptionModal = ({
  openSubModal,
  setOpenSubModal,
  subscription,
}: any) => {
  const lng = localStorage.getItem("currentLanguage");
  const currency = useCurrency();
  const companyContext = useContext<any>(CompanyContext);

  const isRTL = lng === "ar" || lng === "ur";
  const { find, entities } = useEntity<any>("package");
  const { updateEntity } = useEntity<any>("subscription");
  const { findOne, entity } = useEntity<any>("subscription/ownerRef");
  const queryClient = useQueryClient();

  const theme = useTheme();
  const { t } = useTranslation();
  const [currentPlan, setCurrentPlan] = useState<Plan | undefined>(undefined);
  const [currentLocationLimit, setCurrentLocationLimit] = useState<number>(1);
  const [currentDeviceLimit, setCurrentDeviceLimit] = useState<number>(1);

  usePageView();

  const formik = useFormik({
    initialValues: {
      package: entity?.packageRef || "",
      billingCycle: entity?.billingCycle || "monthly",
      hardwares: entity?.hardwares,
      addons: entity?.addons || [],
      paymentStatus: entity?.paymentStatus || "unpaid",
      renewPackage: entity?.isTrial || false,
      subscriptionEndDate: entity?.subscriptionEndDate || "",
      locationLimit: entity?.currentLocationLimit || currentLocationLimit,
      deviceLimit: entity?.currentDeviceLimit || currentDeviceLimit,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      const locationAddon = values.addons.find(
        (addon: Addon) => addon.key === "location_addon"
      );
      const deviceAddon = values.addons.find(
        (addon: Addon) => addon.key === "device_addon"
      );

      const subscriptionData = {
        package: values.package,
        billingCycle: values.billingCycle,
        hardwares: values.hardwares,
        addons: values.addons,
        paymentStatus: values.paymentStatus,
        renewPackage: values.renewPackage,
        subscriptionEndDate: values.subscriptionEndDate,
        newLocationLimit: currentLocationLimit + (locationAddon?.qty || 0),
        newDeviceLimit: currentDeviceLimit + (deviceAddon?.qty || 0),
      };

      const refToUse = subscription?.ownerRef || companyContext?.ownerRef;

      try {
        await updateEntity(refToUse, subscriptionData);
        queryClient.invalidateQueries("find-one-subscription/ownerRef");
        toast.success("Subscription updated successfully");
        setOpenSubModal(false);
      } catch (error) {
        console.error("Error updating subscription:", error);
        toast.error("Failed to update subscription");
      }
    },
  });

  useEffect(() => {
    find({ page: 0, limit: 100000, sort: "desc", activeTab: "active" });
    if (subscription?.ownerRef) {
      findOne(subscription?.ownerRef);
    }
  }, [subscription]);

  useEffect(() => {
    if (entity?.packageRef && entities?.results) {
      const selectedPlan = entities.results.find(
        (pkg: Plan) => pkg._id === entity.packageRef
      );
      setCurrentPlan(selectedPlan);

      if (entity.currentLocationLimit) {
        setCurrentLocationLimit(entity.currentLocationLimit);
      }
      if (entity.currentDeviceLimit) {
        setCurrentDeviceLimit(entity.currentDeviceLimit);
      }

      if (entity.isTrial) {
        formik.setFieldValue("renewPackage", true);
      }
    }
  }, [entity, entities]);

  const billing = getBillingSuperAdmin({
    currentLocationLimit: entity?.currentLocationLimit || 1,
    currentDeviceLimit: entity?.currentDeviceLimit || 1,
    currentAddons: entity?.addons || [],
    currentHardwares: entity?.hardwares || [],
    subscriptionEndDate: entity?.subscriptionEndDate || "",
    billingCycle: formik.values.billingCycle,
    newLocationLimit:
      (entity?.currentLocationLimit || 1) +
      (formik.values.addons.find(
        (addon: Addon) => addon.key === "location_addon"
      )?.qty || 0),
    newDeviceLimit:
      (entity?.currentDeviceLimit || 1) +
      (formik.values.addons.find((addon: Addon) => addon.key === "device_addon")
        ?.qty || 0),
    newAddons: formik.values.addons.filter(
      (addon: Addon) =>
        addon.key !== "location_addon" && addon.key !== "device_addon"
    ),
    newHardwares: formik.values.hardwares,
    packageAddons: currentPlan?.addons || [],
    packageHardwares: currentPlan?.hardwares || [],
    packagePrices: currentPlan?.prices || [],
    currentPackageRef: entity?.packageRef,
    newPackageRef: formik.values.package,
    renewPackage: formik.values.renewPackage,
    isTrial: entity?.isTrial || false,
  });

  const showBillingSummary = formik.values.renewPackage || billing.total > 0;

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

  const handleSelectedHardware = (hardware: Hardware, qty: number = 1) => {
    const filteredHardwares = formik.values.hardwares.filter((hw: Hardware) =>
      currentPlan?.hardwares.some((planHw) => planHw.key === hw.key)
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

  const handleSelectedAddon = (addon: Addon) => {
    const addonExists = formik.values.addons.some(
      (a: Addon) => a.key === addon.key
    );

    if (!addonExists) {
      formik.setFieldValue("addons", [...formik.values.addons, addon]);
    }

    if (addonExists) {
      const addonIndex = formik.values.addons.findIndex(
        (a: Addon) => a.key === addon.key
      );
      formik.setFieldValue("addons", [
        ...formik.values.addons.slice(0, addonIndex),
        ...formik.values.addons.slice(addonIndex + 1),
      ]);
    }
  };

  const handlePackageChange = (e: any) => {
    const packageId = e.target.value;
    formik.setFieldValue("package", packageId);
    const selectedPlan = entities?.results?.find(
      (pkg: Plan) => pkg._id === packageId
    );
    if (selectedPlan) {
      setCurrentPlan(selectedPlan);
      formik.setFieldValue("addons", []);
      formik.setFieldValue("hardwares", []);
      formik.setFieldValue(
        "billingCycle",
        selectedPlan.prices[0]?.type || "monthly"
      );

      setCurrentLocationLimit(selectedPlan.locationLimit || 1);
      setCurrentDeviceLimit(selectedPlan.deviceLimit || 1);
      formik.setFieldValue("locationLimit", selectedPlan.locationLimit || 1);
      formik.setFieldValue("deviceLimit", selectedPlan.deviceLimit || 1);
    }
  };

  const hasLocationAddon = currentPlan?.addons?.some(
    (addon: any) => addon.key === "location_addon"
  );

  const hasDeviceAddon = currentPlan?.addons?.some(
    (addon: any) => addon.key === "device_addon"
  );

  const handleLocationChange = (newValue: number) => {
    if (hasLocationAddon) {
      const locationAddon = currentPlan?.addons?.find(
        (addon: any) => addon.key === "location_addon"
      );
      const currentAddons = [...formik.values.addons];
      const locationAddonIndex = currentAddons.findIndex(
        (addon) => addon.key === "location_addon"
      );
      const additionalQty = newValue;

      if (additionalQty > 0) {
        if (locationAddonIndex >= 0) {
          currentAddons[locationAddonIndex] = {
            ...locationAddon,
            qty: additionalQty,
          };
        } else {
          currentAddons.push({
            ...locationAddon,
            qty: additionalQty,
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
      const deviceAddon = currentPlan?.addons?.find(
        (addon: any) => addon.key === "device_addon"
      );
      const currentAddons = [...formik.values.addons];
      const deviceAddonIndex = currentAddons.findIndex(
        (addon) => addon.key === "device_addon"
      );
      const additionalQty = newValue;

      if (additionalQty > 0) {
        if (deviceAddonIndex >= 0) {
          currentAddons[deviceAddonIndex] = {
            ...deviceAddon,
            qty: additionalQty,
          };
        } else {
          currentAddons.push({
            ...deviceAddon,
            qty: additionalQty,
          });
        }
      } else if (deviceAddonIndex >= 0) {
        currentAddons.splice(deviceAddonIndex, 1);
      }

      formik.setFieldValue("addons", currentAddons);
    }
  };

  return (
    <Modal open={openSubModal}>
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
              {t("Manage Subscription")}
            </Typography>
            <XCircle fontSize="medium" onClick={() => setOpenSubModal(false)} />
          </Box>

          <Container disableGutters>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="600" mb={1.5}>
                {t("Current Subscription")}
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  <strong>{t("Package:")}</strong>{" "}
                  {isRTL
                    ? entity?.package?.ar || "N/A"
                    : entity?.package?.en || "N/A"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>{t("Billing Cycle:")}</strong>{" "}
                  {entity?.billingCycle || "N/A"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>{t("End Date:")}</strong>{" "}
                  {DateTime.fromISO(entity?.subscriptionEndDate).toFormat(
                    "dd/MM/yyyy hh:mm a"
                  ) || "N/A"}
                </Typography>
              </Stack>
            </Box>

            <Divider sx={{ my: 2 }} />

            <form onSubmit={formik.handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="600" mb={1.5}>
                  {t("Change Package")}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Box sx={{ width: "100%" }}>
                    <TextField
                      fullWidth
                      label={t("Select Package")}
                      name="package"
                      value={formik.values.package || ""}
                      onChange={handlePackageChange}
                      select
                      required
                    >
                      {entities?.results?.map((plan: Plan) => (
                        <MenuItem key={plan._id} value={plan._id}>
                          {isRTL ? plan.name.ar : plan.name.en}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
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
                      {currentPlan?.prices?.map((price) => (
                        <MenuItem key={price._id} value={price.type}>
                          {price.type} - {currency} {price.price}{" "}
                          {price.discountPercentage > 0 &&
                            `(${price.discountPercentage}% off)`}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Stack>
              </Box>

              {currentPlan?.addons?.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="600" mb={1.5}>
                    {t("Addons")}
                  </Typography>
                  <Stack spacing={1}>
                    {currentPlan?.addons
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
                        const isChecked = formik.values.addons.some(
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
                              {addon.name} - {currency} {addonPrice.toFixed(2)}
                            </Typography>
                            <Switch
                              checked={isChecked}
                              onChange={() => handleSelectedAddon(addon)}
                              size="small"
                            />
                          </Box>
                        );
                      })}
                  </Stack>
                </Box>
              )}

              {currentPlan?.hardwares?.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="600" mb={1.5}>
                    {t("Hardware Options")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {t("Select hardware items for your subscription")}
                  </Typography>
                  <Stack spacing={2}>
                    {currentPlan?.hardwares.map((hw) => {
                      const currentQty =
                        entity?.hardwares?.find(
                          (h: Hardware) =>
                            h.key === hw.key &&
                            currentPlan?._id === formik.values.package
                        )?.qty || 0;

                      const incrementalQty =
                        formik.values.hardwares.find(
                          (h: Hardware) =>
                            h.key === hw.key &&
                            currentPlan?._id === formik.values.package
                        )?.qty || 0;

                      return (
                        <Box
                          key={hw.key}
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
                              {isRTL ? hw.name.ar : hw.name.en}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {currency} {hw.price}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {t("Current Quantity")}: {currentQty}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {t("Additional Quantity")}: {incrementalQty}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <QuantityInput
                              label={t("Quantity")}
                              value={incrementalQty}
                              onChange={(newValue) =>
                                handleSelectedHardware(hw, newValue)
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

              {hasLocationAddon && (
                <Box sx={{ mb: 3 }}>
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
                        (addon: Addon) => addon.key === "location_addon"
                      )?.qty || 0}
                    </Typography>
                  </Box>
                  <QuantityInput
                    label={t("Number of Locations")}
                    value={
                      formik.values.addons.find(
                        (addon: Addon) => addon.key === "location_addon"
                      )?.qty || 0
                    }
                    onChange={handleLocationChange}
                    min={0}
                  />
                </Box>
              )}

              {hasDeviceAddon && (
                <Box sx={{ mb: 3 }}>
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
                        (addon: Addon) => addon.key === "device_addon"
                      )?.qty || 0}
                    </Typography>
                  </Box>
                  <QuantityInput
                    label={t("Number of Devices")}
                    value={
                      formik.values.addons.find(
                        (addon: Addon) => addon.key === "device_addon"
                      )?.qty || 0
                    }
                    onChange={handleDeviceChange}
                    min={0}
                  />
                </Box>
              )}

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="600" mb={1.5}>
                  {t("Renewal Option")}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    borderRadius: 1,
                    minHeight: 56,
                  }}
                >
                  <Checkbox
                    checked={formik.values.renewPackage || false}
                    onChange={(e) => {
                      if (!entity?.isTrial) {
                        formik.setFieldValue("renewPackage", e.target.checked);
                      }
                    }}
                    size="small"
                    disabled={entity?.isTrial}
                  />
                  <Typography variant="body2">
                    {t("Renew package with these changes")}
                  </Typography>
                </Box>
                {entity?.isTrial && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    {t(
                      "Package renewal is required when converting from a trial subscription"
                    )}
                  </Typography>
                )}
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="600" mb={1.5}>
                  {t("Payment Status")}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    borderRadius: 1,
                    minHeight: 56,
                  }}
                >
                  <Checkbox
                    name="paymentStatus"
                    checked={formik.values.paymentStatus === "paid"}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "paymentStatus",
                        e.target.checked ? "paid" : "unpaid"
                      )
                    }
                    size="small"
                  />
                  <Typography variant="body2">
                    {t("Mark Payment as Completed")}
                  </Typography>
                </Box>
              </Box>

              {showBillingSummary && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="600" mb={1.5}>
                    {t("Billing Summary")}
                  </Typography>
                  <Stack spacing={1} sx={{ p: 2, borderRadius: 1 }}>
                    {billing.items.map((item) => (
                      <Box
                        key={item.name}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2">{t(item.name)}</Typography>
                        <Typography variant="body2">
                          {currency} {item.amount.toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                    <Divider />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="600">
                        {t("Subtotal")}
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="600">
                        {currency} {billing.total.toFixed(2)}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                  >
                    {formik.values.renewPackage
                      ? t(
                          "Note: When renewing your package, full charges will be applied without proration. Hardware charges are always applied in full."
                        )
                      : t(
                          "Note: Charges for package, addons, locations, and devices are prorated based on the remaining days until your subscription end date. Hardware charges are applied in full."
                        )}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  sx={{ textTransform: "none", px: 3, py: 0.75 }}
                  loading={formik.isSubmitting}
                  disabled={formik.isSubmitting || billing.total <= 0}
                >
                  {t("Update Subscription")}
                </LoadingButton>
              </Box>
            </form>
          </Container>
        </Card>
      </Box>
    </Modal>
  );
};

export default AccountSubscriptionModal;
