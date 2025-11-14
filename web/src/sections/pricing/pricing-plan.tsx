import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Card,
  Divider,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckIcon from "@untitled-ui/icons-react/build/esm/Check";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import { useRouter } from "next/router";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
  type FC,
} from "react";
import { useTranslation } from "react-i18next";
import { HardwareInfoModal } from "src/components/modals/hardware-info-modal";
import { PackageListModal } from "src/components/modals/package-list-view-modal";
import { useAuth } from "src/hooks/use-auth";
import usePackageStore from "src/pages/authentication/package";
import { tijarahPaths } from "src/paths";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

interface PricingPlanProps {
  sx: {};
  packageData: {
    _id: string;
    name: { en: string; ar: string };
    tag: string;
    prices: {
      type: string;
      price: number;
      discountPercentage: number;
      _id: string;
    }[];
    modules: {
      key: string;
      name: string;
      subModules: [{ key: string; name: string }];
    }[];
    addons: {
      key: string;
      name: string;
      tag?: string;
      prices: {
        type: string;
        price: number;
        discountPercentage: number;
        _id: string;
      }[];
      _id: string;
    }[];
    trialDays: number;
    locationLimit: number;
    deviceLimit: number;
    status: string;
    hardwares: {
      name: { en: string; ar: string };
      price: number;
      defaultSelected: boolean;
      key: string;
      infoText: string;
      tag: string;
      imageUrl: string;
    }[];
    createdAt: string;
    updatedAt: string;
    description?: { en: string; ar: string };
  };
  selectedHardware: any[];
  selectedAddons: any[];
  handleSelectedHardware: (hardware: any, qty?: number) => void;
  handleSelectedAddon: (addon: any, pkg?: any) => void;
  resetHardware: () => void;
  planSelected: any;
  selectedPlan: string;
  setSelectedPlan: (planId: string) => void;
  fromGateway?: boolean;
  setOpenPlanModal?: (open: boolean) => void;
  handleDefaultSelectedHardware?: (hardware: any[]) => void;
  setBillingCycle?: Dispatch<
    SetStateAction<"monthly" | "quarterly" | "annually">
  >;
  billingCycle?: string;
}

export const PricingPlan: FC<PricingPlanProps> = (props) => {
  const { user } = useAuth();
  const router = useRouter();
  const [openHardwareInfoModal, setOpenHardwareInfoModal] = useState(false);
  const [selectedHw, setSelectedHw] = useState<any>();
  const [openPackageListModal, setOpenPackageListModal] = useState(false);
  const {
    packageData,
    selectedHardware,
    selectedAddons,
    handleSelectedHardware,
    handleSelectedAddon,
    resetHardware,
    sx,
    selectedPlan,
    setSelectedPlan,
    fromGateway,
    setOpenPlanModal,
    handleDefaultSelectedHardware,
  } = props;

  const { t } = useTranslation();
  const { logout } = useAuth();
  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";
  const { setSelectedPlan: _setSelectedPlan } = usePackageStore() as any;
  const [showAllHardwares, setShowAllHardwares] = useState(false);
  const [showAllAddons, setSHowAllAddons] = useState(false);
  const { billingCycle } = props;
  const [isDefaultSet, setIsDefaultSet] = useState(false);
  const [locationLimitCounter, setLocationLimitCounter] = useState(0);
  const [deviceLimitCounter, setDeviceLimitCounter] = useState(0);
  const currency = useCurrency();

  const {
    _id: planId,
    name,
    prices,
    description = { en: "", ar: "" },
    modules = [],
    addons = [],
    hardwares,
    locationLimit,
    deviceLimit,
    tag,
  } = packageData;

  const getPriceInfo = (type: string) => {
    const priceObj = prices.find((p) => p.type === type);
    if (!priceObj) return { originalPrice: 0, discountedPrice: 0 };

    const originalPrice = priceObj.price;
    const discountedPrice =
      originalPrice * (1 - (priceObj.discountPercentage || 0) / 100);
    return { originalPrice, discountedPrice };
  };

  const monthlyInfo = getPriceInfo("monthly");
  const quarterlyInfo = getPriceInfo("quarterly");
  const annualInfo = getPriceInfo("annually");

  const getCurrentPriceInfo = () => {
    switch (billingCycle) {
      case "quarterly":
        return quarterlyInfo;
      case "annually":
        return annualInfo;
      default:
        return monthlyInfo;
    }
  };

  const currentPriceInfo = getCurrentPriceInfo();
  const priceToShow = currentPriceInfo.discountedPrice;

  useEffect(() => {
    if (
      planId === selectedPlan &&
      handleDefaultSelectedHardware &&
      !isDefaultSet
    ) {
      const defaultHardware = hardwares
        .filter((h) => h.defaultSelected)
        .map((hardware) => ({
          ...hardware,
          qty: 1,
          planId,
        }));
      handleDefaultSelectedHardware(defaultHardware);
      setIsDefaultSet(true);
    }
    if (planId !== selectedPlan) {
      setIsDefaultSet(false);
    }
  }, [
    selectedPlan,
    planId,
    hardwares,
    handleDefaultSelectedHardware,
    isDefaultSet,
  ]);

  const getAddonPrice = (addon: any) => {
    const priceObj = addon?.prices?.find((p: any) => p.type === billingCycle);
    if (!priceObj) return 0;

    if (addon.key === "location_addon") {
      return priceObj.price * addon.qty;
    }
    if (addon.key === "device_addon") {
      return priceObj.price * addon.qty;
    }
    return priceObj.price;
  };

  useEffect(() => {
    setDeviceLimitCounter(deviceLimit);
    setLocationLimitCounter(locationLimit);
  }, [locationLimit, deviceLimit]);

  const addonMap = Object.fromEntries(
    addons.map((addon) => [addon.key, addon])
  );
  const locationAddon = addonMap["location_addon"];
  const deviceAddon = addonMap["device_addon"];

  return (
    <>
      <Card
        onClick={() => {
          if (planId !== selectedPlan) {
            resetHardware();
            setSelectedPlan(planId);
            // No need to set billing cycle here as it's controlled by the parent
          }
        }}
        sx={{
          display: "flex",
          border: planId === selectedPlan ? "1.5px solid green" : "0px",
          flexDirection: "column",
          cursor: "pointer",
          position: "relative",
          overflow: "visible",
          ...sx,
        }}
      >
        {tag && (
          <Box
            sx={{
              position: "absolute",
              top: -12,
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "#16B364",
              color: "white",
              borderRadius: "20px",
              padding: "4px 16px",
              zIndex: 1,
              fontWeight: "bold",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
              }}
            >
              {t(tag)}
            </Typography>
          </Box>
        )}

        <Box sx={{ px: 3, pt: 2.5 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            {currentPriceInfo.originalPrice >
            currentPriceInfo.discountedPrice ? (
              <>
                <Box sx={{ display: "flex", alignItems: "baseline" }}>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{
                      textDecoration: "line-through",
                      mr: 1,
                      fontSize: { xs: "1rem", sm: "1.2rem" },
                    }}
                  >
                    {currency} {currentPriceInfo.originalPrice.toFixed(2)}
                  </Typography>
                  <Typography
                    variant="h4"
                    color="text.primary"
                    sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
                  >
                    {currency} {priceToShow.toFixed(2)}
                  </Typography>
                </Box>
              </>
            ) : (
              <Typography
                variant="h4"
                sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
              >
                {currency} {priceToShow.toFixed(2)}
              </Typography>
            )}
            <Typography
              color="text.secondary"
              sx={{ my: 1 }}
              variant="subtitle2"
            >
              {t("Billed")} {billingCycle}
            </Typography>
          </Box>
          <Typography sx={{}} variant="h6">
            {name && (isRTL ? name.ar : name.en)}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1.25 }} variant="body2">
            {description &&
              (isRTL
                ? description.ar.slice(0, 70)
                : description.en.slice(0, 70))}
          </Typography>
        </Box>

        <Divider sx={{ mt: 1 }} />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            px: 3,
            mt: 1.5,
          }}
        >
          <Stack spacing={1} sx={{ mb: 1 }}>
            {modules?.slice(0, 3)?.map((module: any) => (
              <Stack
                alignItems="center"
                direction="row"
                spacing={1}
                key={module.key}
                sx={{ alignItems: "center", display: "flex" }}
              >
                <SvgIcon color="success">
                  <CheckIcon />
                </SvgIcon>
                <Typography sx={{ fontWeight: 500 }} variant="body2">
                  {isRTL ? module.name : module.name}
                </Typography>
              </Stack>
            ))}
            <Button
              sx={{
                width: "fit-content",
                alignSelf: "center",
                textAlign: "center",
              }}
              onClick={() => {
                setOpenPackageListModal(true);
              }}
            >
              {t("View details")}
            </Button>
            {openPackageListModal && (
              <PackageListModal
                modalData={modules}
                description={packageData?.description}
                name={name}
                modalImage={undefined}
                open={openPackageListModal}
                handleClose={() => {
                  setOpenPackageListModal(false);
                }}
              />
            )}
            <Divider />
          </Stack>

          {addons.filter(
            (addon) =>
              addon.key !== "location_addon" && addon.key !== "device_addon"
          ).length > 0 && (
            <>
              <Box>
                <Typography sx={{ mt: 1 }} variant="h6">
                  {isRTL ? `${"الإضافات"}:` : `${t("Addons")}:`}
                </Typography>
              </Box>

              <Stack spacing={0} sx={{ mt: 1 }}>
                {(showAllAddons
                  ? addons.filter(
                      (addon) =>
                        addon.key !== "location_addon" &&
                        addon.key !== "device_addon"
                    )
                  : addons
                      .filter(
                        (addon) =>
                          addon.key !== "location_addon" &&
                          addon.key !== "device_addon"
                      )
                      .slice(0, 3)
                ).map((addon) => (
                  <Box
                    key={addon.key}
                    sx={{
                      alignItems: "flex-start",
                      width: "100%",
                      display: "flex",
                      gap: "10px",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "flex-start",
                        textWrap: "wrap",
                        textAlign: "left",
                      }}
                    >
                      <Checkbox
                        disabled={selectedPlan !== planId}
                        checked={
                          planId === selectedPlan &&
                          selectedAddons.some((a) => a.key === addon.key)
                        }
                        onChange={() => handleSelectedAddon(addon, packageData)}
                        style={{ paddingTop: 0, paddingLeft: 0 }}
                      />
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography sx={{ fontWeight: 500 }} variant="body2">
                          {addon.name}
                        </Typography>
                        {addon.tag === "restaurant" && (
                          <Tooltip title={t("Restaurant")}>
                            <SvgIcon
                              color="primary"
                              fontSize="small"
                              sx={{
                                cursor: "pointer",
                                ml: 0.5,
                                fontSize: "0.875rem",
                                position: "relative",
                                top: "-1px",
                                "&:hover": {
                                  opacity: 0.7,
                                },
                              }}
                            >
                              <InfoCircleIcon />
                            </SvgIcon>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                    <Typography
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        fontWeight: 500,
                        textWrap: "nowrap",
                        textAlign: "right",
                      }}
                      variant="body2"
                    >
                      {`${currency} ${getAddonPrice(addon)}`}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              {addons.filter(
                (addon) =>
                  addon.key !== "location_addon" && addon.key !== "device_addon"
              ).length > 3 && (
                <Button
                  sx={{
                    width: "fit-content",
                    alignSelf: "center",
                    textAlign: "center",
                    my: 1,
                  }}
                  onClick={() => setSHowAllAddons(!showAllAddons)}
                >
                  {showAllAddons ? t("Show Less") : t("Show More")}
                </Button>
              )}
              <Divider />
            </>
          )}

          {hardwares?.length > 0 && (
            <Box>
              <Typography sx={{ mt: 1 }} variant="h6">
                {isRTL ? `${"المعدات"}:` : `${t("Hardwares")}:`}
              </Typography>
            </Box>
          )}
          <Stack spacing={0} sx={{ flexGrow: 1, mt: 1 }}>
            {(showAllHardwares ? hardwares : hardwares.slice(0, 3)).map(
              (hardware) => (
                <Box
                  key={hardware.key}
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flex: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography sx={{ fontWeight: 500 }} variant="body2">
                        {isRTL ? hardware.name.ar : hardware.name.en}
                      </Typography>
                      {(hardware?.infoText || hardware?.imageUrl) && (
                        <SvgIcon
                          color="primary"
                          fontSize="small"
                          sx={{
                            cursor: "pointer",
                            ml: 0.5,
                            "&:hover": {
                              opacity: 0.7,
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenHardwareInfoModal(true);
                            setSelectedHw(hardware);
                          }}
                        >
                          <InfoCircleIcon />
                        </SvgIcon>
                      )}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <ButtonGroup
                      size="small"
                      aria-label="small outlined button group"
                      sx={{
                        "& .MuiButton-root": { minWidth: "32px", px: 0.5 },
                      }}
                    >
                      <Button
                        disabled={selectedPlan !== planId}
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentHw = selectedHardware.find(
                            (h) => h.key === hardware.key && h.planId === planId
                          );
                          const currentQty = currentHw?.qty || 0;
                          if (currentQty > 0) {
                            handleSelectedHardware(
                              { ...hardware, planId },
                              currentQty - 1
                            );
                          }
                        }}
                      >
                        -
                      </Button>
                      <Button
                        sx={{
                          fontSize: "12px",
                          minWidth: "28px",
                        }}
                        disabled
                      >
                        <Typography variant="body2" color="text.primary">
                          {selectedHardware.find(
                            (h) => h.key === hardware.key && h.planId === planId
                          )?.qty || 0}
                        </Typography>
                      </Button>
                      <Button
                        disabled={selectedPlan !== planId}
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentHw = selectedHardware.find(
                            (h) => h.key === hardware.key && h.planId === planId
                          );
                          const currentQty = currentHw?.qty || 0;
                          handleSelectedHardware(
                            { ...hardware, planId },
                            currentQty + 1
                          );
                        }}
                      >
                        +
                      </Button>
                    </ButtonGroup>
                    <Typography
                      sx={{
                        fontWeight: 500,
                        minWidth: 60,
                        textAlign: "right",
                      }}
                      variant="body2"
                    >
                      {`${currency} ${hardware.price}`}
                    </Typography>
                  </Box>
                </Box>
              )
            )}
            {hardwares.length > 3 && (
              <Button
                sx={{
                  width: "fit-content",
                  alignSelf: "center",
                  textAlign: "center",
                  mt: 1,
                }}
                onClick={() => setShowAllHardwares(!showAllHardwares)}
              >
                {showAllHardwares ? t("Show Less") : t("Show More")}
              </Button>
            )}
          </Stack>

          <Box>
            <Stack spacing={2} sx={{ flexGrow: 1, mt: 2 }}>
              <Stack justifyContent="center" sx={{ ml: 2 }} spacing={1}>
                <Typography sx={{ fontWeight: 500 }} variant="body2">
                  {`${t("Software Package")}: ${currency} ${Number(
                    priceToShow.toFixed(2)
                  )}`}
                </Typography>
                <Typography sx={{ fontWeight: 500 }} variant="body2">
                  {`${t("Addons")}: ${currency} ${
                    planId === selectedPlan
                      ? selectedAddons
                          .reduce((pv, cv) => pv + getAddonPrice(cv), 0)
                          .toFixed(2)
                      : 0
                  }`}
                </Typography>
                <Typography sx={{ fontWeight: 500 }} variant="body2">
                  {`${t("Hardware")}: ${currency} ${
                    planId === selectedPlan
                      ? selectedHardware
                          .filter((hw) => hw.planId === planId)
                          .reduce((pv, cv) => pv + cv.price * (cv.qty || 1), 0)
                          .toFixed(2)
                      : 0
                  }`}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              mt: 2,
              p: 2,
              borderRadius: 1,
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle2" color="text.primary">
                {t("No. of locations")}
              </Typography>
              <Typography
                variant="h6"
                color="primary.main"
                sx={{ fontWeight: 600 }}
              >
                {locationAddon ? (
                  <ButtonGroup
                    size="small"
                    aria-label="small outlined button group"
                  >
                    <Button
                      disabled={
                        locationLimitCounter <= 1 || selectedPlan !== planId
                      }
                      onClick={() => {
                        setLocationLimitCounter((counter: any) => counter - 1);
                        handleSelectedAddon(
                          {
                            ...locationAddon,
                            qty: locationLimitCounter - 1,
                          },
                          packageData
                        );
                      }}
                    >
                      -
                    </Button>
                    <Button sx={{ fontSize: "14px" }} disabled>
                      <Typography variant="body2" color="text.primary">
                        {locationLimitCounter}
                      </Typography>
                    </Button>
                    <Button
                      disabled={
                        locationLimitCounter >= 20 || selectedPlan !== planId
                      }
                      onClick={() => {
                        setLocationLimitCounter((counter) => counter + 1);
                        handleSelectedAddon(
                          {
                            ...locationAddon,
                            qty: locationLimitCounter + 1,
                          },
                          packageData
                        );
                      }}
                    >
                      +
                    </Button>
                  </ButtonGroup>
                ) : (
                  locationLimit
                )}
              </Typography>
            </Box>
            <Divider flexItem />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle2" color="text.primary">
                {t("No. of devices")}
              </Typography>
              <Typography
                variant="h6"
                color="primary.main"
                sx={{ fontWeight: 600 }}
              >
                {deviceAddon ? (
                  <ButtonGroup
                    size="small"
                    aria-label="small outlined button group"
                  >
                    <Button
                      disabled={
                        deviceLimitCounter <= 1 || selectedPlan !== planId
                      }
                      onClick={() => {
                        setDeviceLimitCounter((counter: any) => counter - 1);
                        handleSelectedAddon(
                          {
                            ...deviceAddon,
                            qty: deviceLimitCounter - 1,
                          },
                          packageData
                        );
                      }}
                    >
                      -
                    </Button>
                    <Button sx={{ fontSize: "14px" }} disabled>
                      <Typography variant="body2" color="text.primary">
                        {deviceLimitCounter}
                      </Typography>
                    </Button>
                    <Button
                      disabled={
                        deviceLimitCounter >= 20 || selectedPlan !== planId
                      }
                      onClick={() => {
                        setDeviceLimitCounter((counter) => counter + 1);
                        handleSelectedAddon(
                          {
                            ...deviceAddon,
                            qty: deviceLimitCounter + 1,
                          },
                          packageData
                        );
                      }}
                    >
                      +
                    </Button>
                  </ButtonGroup>
                ) : (
                  deviceLimit
                )}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              mt: 2,
              mb: 2,
            }}
          >
            {planId === selectedPlan &&
              locationLimitCounter > locationLimit && (
                <Box
                  sx={{
                    mb: 2,
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" color="text.primary">
                    {t(
                      "Note: When adding extra locations, please consider adding devices as well."
                    )}
                  </Typography>
                </Box>
              )}
            <Button
              disabled={planId !== selectedPlan}
              onClick={() => {
                if (fromGateway) {
                  setOpenPlanModal(false);
                }
                _setSelectedPlan({
                  ...packageData,
                  billingCycle,
                  hardwares: selectedHardware.filter(
                    (hw) => hw.planId === planId
                  ),
                  addons: selectedAddons,
                });
                if (user) {
                  router.push(tijarahPaths.authentication.paymentGateway);
                  return;
                }
                router.push({ pathname: tijarahPaths.authentication.register });
              }}
              variant={planId === "light" ? "contained" : "outlined"}
            >
              {t("Continue")}
            </Button>
            {planId === selectedPlan && (
              <Box sx={{ mt: 2, display: "flex" }}>
                <Typography variant="caption">
                  {`${t(
                    "You can continue with amount of"
                  )} ${currency} ${toFixedNumber(
                    Number(priceToShow) +
                      selectedHardware
                        .filter((hw) => hw.planId === planId)
                        .reduce((pv, cv) => pv + cv.price * (cv.qty || 1), 0) +
                      selectedAddons.reduce(
                        (pv, cv) => pv + getAddonPrice(cv),
                        0
                      )
                  )}`}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Card>
      {openHardwareInfoModal && (
        <HardwareInfoModal
          hardware={selectedHw}
          open={openHardwareInfoModal}
          handleClose={() => {
            setOpenHardwareInfoModal(false);
          }}
        />
      )}
      {openPackageListModal && (
        <PackageListModal
          modalData={modules}
          name={name}
          modalImage={undefined}
          description={description}
          open={openPackageListModal}
          handleClose={() => {
            setOpenPackageListModal(false);
          }}
        />
      )}
    </>
  );
};
