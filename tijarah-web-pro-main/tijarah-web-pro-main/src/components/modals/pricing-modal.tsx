import {
  Box,
  Button,
  ButtonGroup,
  Card,
  Container,
  Divider,
  Grid,
  Modal,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/system";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import usePackageStore from "src/pages/authentication/package";
import { PricingPlan } from "src/sections/pricing/pricing-plan";

const ChangePricingModal = (props: any) => {
  const { find, entities } = useEntity("package");

  const theme = useTheme();
  const { t } = useTranslation();
  const { selectedPlan: planSelected } = usePackageStore() as any;
  const { openPlanModal, setOpenPlanModal, fromGateway = true } = props;

  usePageView();

  useEffect(() => {
    find({ page: 0, limit: 100000, sort: "desc", activeTab: "active" });
  }, []);

  // Calculate the maximum discount percentage for annually billing cycle
  useEffect(() => {
    if (entities?.results?.length > 0) {
      let maxDiscount = 0;
      entities.results.forEach((plan) => {
        const annualPrice = plan.prices.find(
          (p: { type: string; price: number; discountPercentage: number }) =>
            p.type === "annually"
        );
        if (annualPrice && annualPrice.discountPercentage > maxDiscount) {
          maxDiscount = annualPrice.discountPercentage;
        }
      });
      setMaxAnnualDiscount(maxDiscount);
    }
  }, [entities?.results]);
  const plans = entities?.results || [];

  const [selectedPlan, setSelectedPlan] = useState(planSelected?._id);
  const [selectedHardware, setSelectedHardware] = useState(
    planSelected?.selectedHardware || []
  );
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [billingCycle, setBillingCycle] = useState<
    "monthly" | "quarterly" | "annually"
  >(planSelected?.billingCycle || "quarterly"); // Default to quarterly instead of monthly
  const [maxAnnualDiscount, setMaxAnnualDiscount] = useState<number>(0);

  const handleSelectedHardware = (hardware: any, qty?: number) => {
    setSelectedHardware((prev: any) => {
      const exists = prev.some((hw: any) => hw.key === hardware.key);

      // If qty is provided, update or add with quantity
      if (qty !== undefined) {
        if (qty <= 0) {
          // Remove hardware if quantity is 0 or negative
          return prev.filter((hw: any) => hw.key !== hardware.key);
        }

        if (exists) {
          // Update existing hardware with new quantity
          return prev.map((hw: any) =>
            hw.key === hardware.key ? { ...hw, qty } : hw
          );
        } else {
          // Add new hardware with quantity
          return [...prev, { ...hardware, qty }];
        }
      } else {
        // Original toggle behavior (for checkbox)
        if (exists) {
          return prev.filter((hw: any) => hw.key !== hardware.key);
        } else {
          return [...prev, { ...hardware, qty: 1 }];
        }
      }
    });
  };

  const handleSelectedAddon = (addon: any, pkg?: any) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.key === addon.key);

      // Handle regular addons (non-location/device)
      if (
        exists &&
        addon.key !== "location_addon" &&
        addon.key !== "device_addon"
      ) {
        return prev.filter((a) => a.key !== addon.key);
      }

      // Handle location addon
      if (addon.key === "location_addon" && pkg) {
        const additionalLocations = addon.qty - pkg.locationLimit;
        if (additionalLocations <= 0) {
          return prev.filter((a) => a.key !== "location_addon");
        }
        return [
          ...prev.filter((a) => a.key !== "location_addon"),
          { ...addon, qty: additionalLocations },
        ];
      }

      // Handle device addon
      if (addon.key === "device_addon" && pkg) {
        const additionalDevices = addon.qty - pkg.deviceLimit;
        if (additionalDevices <= 0) {
          return prev.filter((a) => a.key !== "device_addon");
        }
        return [
          ...prev.filter((a) => a.key !== "device_addon"),
          { ...addon, qty: additionalDevices },
        ];
      }

      return [...prev, addon];
    });
  };

  useEffect(() => {
    if (openPlanModal) {
      setSelectedPlan(planSelected?._id);

      // Ensure hardware quantities are properly set
      const hardwareWithQty = (planSelected?.hardwares || []).map((hw: any) => {
        return {
          ...hw,
          qty: hw.qty || 1, // Ensure each hardware has a qty property
        };
      });

      setSelectedHardware(hardwareWithQty);
    }
  }, [openPlanModal, planSelected]);

  return (
    <Modal open={openPlanModal}>
      <Box>
        <Card
          sx={{
            visibility: "visible",
            scrollbarColor: "transpatent",
            position: "fixed ",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "90vw",
              sm: "90vw",
              md: "85vw",
              lg: "85vw",
            },
            bgcolor: "background.paper",
            overflowY: "hidden",
            height: {
              xs: "85vh",
              sm: "85vh",
              md: "95vh",
              lg: "95vh",
            },
            p: 2,
          }}
        >
          <Box
            style={{
              marginTop: 15,
              padding: 10,
              display: "flex",
              zIndex: 999,
              alignItems: "center",
              backgroundColor:
                theme.palette.mode === "light" ? "#fff" : "#111927",
              width: "100%",
              position: "fixed",
              top: 0,
            }}
          >
            <XCircle
              fontSize="small"
              onClick={() => {
                setOpenPlanModal(false);
              }}
              style={{ cursor: "pointer", flex: 0.6 }}
            />

            <Typography
              color={theme.palette.mode === "light" ? "#111927" : "#fff"}
              variant="h5"
              align="left"
              sx={{ flex: 1, paddingLeft: "30px" }}
            >
              {t("Change Plan")}
            </Typography>
          </Box>

          <Box
            style={{
              marginTop: 10,
              marginBottom: 15,
              overflowY: "scroll",
              overflowX: "hidden",
              height: "100%",
              width: "100%",
            }}
          >
            <Box component="main" sx={{ flexGrow: 1, mt: 3, mb: 4 }}>
              <Box
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "neutral.800"
                      : "neutral.50",
                  pb: "20px",
                  pt: "30px",
                }}
              >
                <Container maxWidth="lg">
                  <Box
                    sx={{
                      alignItems: "center",
                      display: "flex",
                      flexDirection: "column",
                      mb: 2.5,
                    }}
                  >
                    <Typography variant="h3">
                      {t("Start today. Boost up your services!")}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mb: 4,
                    }}
                  >
                    <ButtonGroup
                      size="medium"
                      sx={{
                        width: { xs: "100%", sm: "auto" },
                        maxWidth: "350px",
                        display: "flex",
                        justifyContent: "center",
                        backgroundColor: "background.paper",
                        borderRadius: 1,
                        p: 0.5,
                        textTransform: "uppercase",
                      }}
                    >
                      {/* Monthly billing option temporarily disabled
                      <Button
                        variant={
                          billingCycle === "monthly" ? "contained" : "outlined"
                        }
                        onClick={() => setBillingCycle("monthly")}
                        sx={{
                          textTransform: "none",
                          px: 2,
                          minWidth: "auto",
                          width: "auto",
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{t("Monthly")}</Typography>
                      </Button>
                      */}
                      <Button
                        variant={
                          billingCycle === "quarterly"
                            ? "contained"
                            : "outlined"
                        }
                        onClick={() => setBillingCycle("quarterly")}
                        sx={{
                          textTransform: "none",
                          px: 2,
                          minWidth: "auto",
                          width: "auto",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "medium" }}
                        >
                          {t("Quarterly")}
                        </Typography>
                      </Button>
                      <Button
                        variant={
                          billingCycle === "annually" ? "contained" : "outlined"
                        }
                        onClick={() => setBillingCycle("annually")}
                        sx={{
                          textTransform: "none",
                          px: 2,
                          minWidth: "auto",
                          width: "auto",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "medium" }}
                          >
                            {t("Annually")}
                          </Typography>
                          {maxAnnualDiscount > 0 && (
                            <Typography
                              variant="caption"
                              sx={{
                                color:
                                  billingCycle === "annually"
                                    ? "inherit"
                                    : "success.main",
                                fontWeight: "medium",
                              }}
                            >
                              ({t("SAVE")} {maxAnnualDiscount}%)
                            </Typography>
                          )}
                        </Box>
                      </Button>
                    </ButtonGroup>
                  </Box>
                  <Grid container spacing={4}>
                    {plans.map((plan) => {
                      return (
                        <Grid item key={plan._id} xs={12} md={4}>
                          <PricingPlan
                            sx={{
                              height: "100%",
                              mx: "auto",
                            }}
                            packageData={plan}
                            planSelected={plans.find(
                              (p) => p._id === selectedPlan
                            )}
                            selectedPlan={selectedPlan}
                            setSelectedPlan={(planId) => {
                              setSelectedPlan(planId);
                              setSelectedAddons([]);
                              setSelectedHardware([]);
                            }}
                            fromGateway={fromGateway}
                            setOpenPlanModal={setOpenPlanModal}
                            resetHardware={() => setSelectedHardware([])}
                            selectedHardware={selectedHardware}
                            handleSelectedHardware={handleSelectedHardware}
                            handleDefaultSelectedHardware={(data) =>
                              setSelectedHardware(data)
                            }
                            handleSelectedAddon={handleSelectedAddon}
                            selectedAddons={selectedAddons}
                            billingCycle={billingCycle}
                            setBillingCycle={setBillingCycle}
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                </Container>
              </Box>
              <Divider />
            </Box>
          </Box>
        </Card>
      </Box>
    </Modal>
  );
};

export default ChangePricingModal;
