import {
  BreakfastDiningTwoTone,
  CallOutlined,
  DeliveryDiningTwoTone,
  LocationCityOutlined,
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Card,
  Container,
  Fab,
  Grid,
  Stack,
  SvgIcon,
  Typography,
  useTheme,
} from "@mui/material";
import {
  getHours,
  getMinutes,
  isWithinInterval,
  setHours,
  setMinutes,
} from "date-fns";
import { t } from "i18next";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Seo } from "src/components/seo";
import LoaderAnimation from "src/components/widgets/animations/loader";
import RestaurantClosedAnimation from "src/components/widgets/animations/restaurant-closed";
import { FRONTEND_URL } from "src/config";
import { useEntity } from "src/hooks/use-entity";
import { UserCircle } from "src/icons/user-circle";
import cart from "src/utils/cart";
import { trimText } from "src/utils/trim-text";

const RestaurantDelivery = () => {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { findOne, entity, loading } = useEntity("ordering/menu-config");

  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");

  useEffect(() => {
    if (searchParams.get("locationRef") && searchParams.get("companyRef")) {
      findOne(
        `?locationRef=${searchParams.get(
          "locationRef"
        )}&companyRef=${searchParams.get("companyRef")}`
      );
    }
  }, [searchParams.get("locationRef"), searchParams.get("companyRef")]);

  const restaurantOpen = useMemo(() => {
    if (
      entity?.qrOrderingConfiguration?.onlineOrdering &&
      entity?.qrOrderingConfiguration?.schedule
    ) {
      for (const schedule of entity.qrOrderingConfiguration.schedule) {
        const now = new Date();

        const openingTime = new Date(schedule.startTime);
        const openingHours = getHours(openingTime);
        const openingMinutes = getMinutes(openingTime);

        const closingTime = new Date(schedule.endTime);
        const closingHours = getHours(closingTime);
        const closingMinutes = getMinutes(closingTime);

        const restaurantOpening = setHours(
          setMinutes(now, openingMinutes),
          openingHours
        );
        const restaurantClosing = setHours(
          setMinutes(now, closingMinutes),
          closingHours
        );

        // Check if closing time is before opening time, if so, it means the restaurant opens on one day and closes on the next day
        if (restaurantClosing < restaurantOpening) {
          // Adjust closing time to the next day
          restaurantClosing.setDate(restaurantClosing.getDate() + 1);
        }

        // Now check if the current time falls within the interval
        const isRestaurantOpen = isWithinInterval(now, {
          start: restaurantOpening,
          end: restaurantClosing,
        });

        if (isRestaurantOpen) {
          return isRestaurantOpen;
        }
      }

      return false;
    } else {
      return false;
    }
  }, [entity]);

  useEffect(() => {
    window.localStorage.setItem("industry", "restaurant");
    window.localStorage.setItem("qrOrdering", "false");

    const data = JSON.parse(window.localStorage.getItem("checkoutCart"));

    setOrderType(
      data?.deliveryType ||
        entity?.qrOrderingConfiguration?.deliveryType === "all"
        ? "pickup"
        : "delivery"
    );
  }, []);

  useEffect(() => {
    if (entity) {
      window.localStorage.setItem("onlineOrderingCurrency", entity?.currency);
    }
  }, [entity]);

  return (
    <>
      <Seo title={t("Online Ordering Restaurant")} />

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "neutral.800" : "neutral.50",
            mb: "120px",
            mt: "50px",
          }}
        >
          <Container maxWidth="md">
            {restaurantOpen && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Fab
                  sx={{
                    position: "fixed",
                    bottom: "0%",
                    height: "90px",
                    width: {
                      xs: "100%",
                      sm: "100%",
                      md: "50%",
                      lg: "50%",
                    },
                    borderRadius: 0,
                    alignItems: "flex-start",
                    backgroundColor: "background.paper",
                  }}
                  aria-label="order-placed"
                >
                  <Box
                    sx={{
                      px: 2.5,
                      pb: -1,
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <LoadingButton
                      sx={{
                        px: 4.5,
                        py: 1.75,
                        width: "100%",
                        bgcolor:
                          theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
                      }}
                      type="submit"
                      variant="contained"
                      onClick={() => {
                        window.localStorage.setItem(
                          "checkoutCart",
                          JSON.stringify({
                            cart: null,
                            address: null,
                            deliveryType: orderType,
                            specialInstructions: "",
                          })
                        );

                        router.push(
                          `${FRONTEND_URL}/menu-restaurant?locationRef=${searchParams.get(
                            "locationRef"
                          )}&companyRef=${searchParams.get("companyRef")}`
                        );
                      }}
                    >
                      {t("Continue")}
                    </LoadingButton>
                  </Box>
                </Fab>
              </div>
            )}

            {entity && (
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  pt: 3,
                  pb: 1.5,
                  px: { xs: 1.5, sm: 1.5, md: "9%", lg: "23%" },
                  flex: "0 0 auto",
                  position: "fixed",
                  width: "100%",
                  zIndex: 999,
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "neutral.800"
                      : "neutral.50",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h3">
                    {isRTL
                      ? entity?.company?.name?.ar
                      : entity?.company?.name?.en}
                  </Typography>

                  <Box
                    sx={{ cursor: "pointer" }}
                    onClick={() => {
                      router.push(
                        `${FRONTEND_URL}/customer-account?locationRef=${searchParams.get(
                          "locationRef"
                        )}`
                      );
                    }}
                  >
                    <SvgIcon
                      style={{
                        width: 27,
                        height: 27,
                        marginRight: 8,
                        marginBottom: -9,
                      }}
                    >
                      <UserCircle />
                    </SvgIcon>
                  </Box>
                </Box>
              </Box>
            )}

            {!loading ? (
              <>
                <Box
                  sx={{
                    pt: { xs: 4, sm: 4, md: 5, lg: 5 },
                    pb: 10,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Card
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderRadius: 2,
                      backgroundColor: "background.paper",
                      boxShadow: (theme) =>
                        `${theme.palette.neutral[100]} 0 0 0 1px`,
                    }}
                  >
                    <Typography variant="h5">
                      {isRTL ? entity?.name?.ar : entity?.name?.en}
                    </Typography>

                    <Stack sx={{ my: 1.25 }} spacing={1} direction="row">
                      <CallOutlined
                        sx={{
                          width: 20,
                          height: 20,
                          color: theme.palette.text.secondary,
                        }}
                      />

                      <Typography variant="h6" color="text.secondary">
                        {entity?.phone}
                      </Typography>
                    </Stack>

                    <Stack spacing={1} direction="row">
                      <LocationCityOutlined
                        sx={{
                          width: 20,
                          height: 20,
                          color: theme.palette.text.secondary,
                        }}
                      />

                      <Typography variant="subtitle1" color="text.secondary">
                        {trimText(entity?.address || "", 80)}
                      </Typography>
                    </Stack>
                  </Card>

                  {!restaurantOpen ? (
                    <Box sx={{ mt: "10vh" }}>
                      <RestaurantClosedAnimation />
                    </Box>
                  ) : (
                    <Grid container spacing={2} sx={{ mb: 2.5 }}>
                      <Grid item md={12} xs={12}>
                        <Typography
                          align="center"
                          fontSize="16px"
                          variant="body2"
                          sx={{
                            mt: 5,
                            ml: 1,
                            fontWeight: "bold",
                          }}
                          style={{
                            gap: 5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {t("Choose your delivery type")}
                        </Typography>
                      </Grid>

                      {(entity?.qrOrderingConfiguration?.deliveryType ===
                        "all" ||
                        entity?.qrOrderingConfiguration?.deliveryType ===
                          "pickup") && (
                        <Grid item md={12} xs={12}>
                          <Card
                            sx={{
                              px: 2,
                              py: 1.5,
                              display: "flex",
                              alignItems: "center",
                              borderRadius: 2,
                              backgroundColor:
                                orderType === "pickup"
                                  ? theme.palette.mode === "dark"
                                    ? "#0C93561A"
                                    : "#006C351A"
                                  : "background.paper",
                              boxShadow:
                                orderType === "pickup"
                                  ? theme.palette.mode === "dark"
                                    ? "#0C9356 0 0 0 2px"
                                    : "#006C35 0 0 0 2px"
                                  : (theme) =>
                                      `${theme.palette.neutral[100]} 0 0 0 2px`,
                            }}
                            onClick={() => {
                              if (
                                !entity?.pickupDeliveryConfiguration?.pickup
                              ) {
                                return toast.error(
                                  t("Sorry we are not accepting pickup order")
                                );
                              }

                              cart.clearCart();
                              setOrderType("pickup");
                            }}
                            variant="outlined"
                          >
                            <Box sx={{ width: "100%" }}>
                              <BreakfastDiningTwoTone
                                sx={{
                                  mt: -0.5,
                                  ml: -1,
                                  width: 50,
                                  height: 40,
                                  color:
                                    orderType === "delivery"
                                      ? theme.palette.neutral[500]
                                      : theme.palette.mode === "dark"
                                      ? "#0C9356"
                                      : "#006C35",
                                }}
                              />

                              <Typography variant="h5">
                                {t("Self Pickup")}
                              </Typography>

                              <Typography
                                sx={{ mt: 2 }}
                                variant="body2"
                                color="text.secondary"
                              >
                                {t("pickup description")}
                              </Typography>
                            </Box>
                          </Card>
                        </Grid>
                      )}

                      {(entity?.qrOrderingConfiguration?.deliveryType ===
                        "all" ||
                        entity?.qrOrderingConfiguration?.deliveryType ===
                          "delivery") && (
                        <Grid item md={12} xs={12} sx={{ mt: 1 }}>
                          <Card
                            sx={{
                              px: 2,
                              py: 1.5,
                              display: "flex",
                              alignItems: "center",
                              borderRadius: 2,
                              backgroundColor:
                                orderType === "delivery"
                                  ? theme.palette.mode === "dark"
                                    ? "#0C93561A"
                                    : "#006C351A"
                                  : "background.paper",
                              boxShadow:
                                orderType === "delivery"
                                  ? theme.palette.mode === "dark"
                                    ? "#0C9356 0 0 0 2px"
                                    : "#006C35 0 0 0 2px"
                                  : (theme) =>
                                      `${theme.palette.neutral[100]} 0 0 0 2px`,
                            }}
                            onClick={() => {
                              if (
                                !entity?.pickupDeliveryConfiguration?.delivery
                              ) {
                                return toast.error(
                                  t("Sorry we are not accepting delivery order")
                                );
                              }

                              cart.clearCart();
                              setOrderType("delivery");
                            }}
                            variant="outlined"
                          >
                            <Box sx={{ width: "100%" }}>
                              <DeliveryDiningTwoTone
                                sx={{
                                  mt: -0.5,
                                  ml: -0.5,
                                  width: 50,
                                  height: 50,
                                  color:
                                    orderType === "pickup"
                                      ? theme.palette.neutral[500]
                                      : theme.palette.mode === "dark"
                                      ? "#0C9356"
                                      : "#006C35",
                                }}
                              />

                              <Typography variant="h5">
                                {t("Delivery")}
                              </Typography>

                              <Typography
                                sx={{ mt: 2 }}
                                variant="body2"
                                color="text.secondary"
                              >
                                {t("delivery description")}
                              </Typography>
                            </Box>
                          </Card>
                        </Grid>
                      )}
                    </Grid>
                  )}
                </Box>
              </>
            ) : (
              <Box sx={{ mt: "35vh" }}>
                <LoaderAnimation />
              </Box>
            )}
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default RestaurantDelivery;
