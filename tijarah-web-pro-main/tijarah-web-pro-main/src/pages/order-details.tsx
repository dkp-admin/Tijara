import {
  ArrowForward,
  Call,
  Check,
  LocationOn,
  Schedule,
  WarningAmber,
} from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Card,
  Container,
  Divider,
  Fab,
  Grid,
  Link,
  Stack,
  Step,
  StepConnector,
  StepLabel,
  Stepper,
  Typography,
  stepConnectorClasses,
  useTheme,
} from "@mui/material";
import { StepIconProps } from "@mui/material/StepIcon";
import { styled } from "@mui/material/styles";
import {
  format,
  getHours,
  getMinutes,
  getSeconds,
  setHours,
  setMinutes,
} from "date-fns";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ConfirmationDialog from "src/components/confirmation-dialog";
import { Seo } from "src/components/seo";
import LoaderAnimation from "src/components/widgets/animations/loader";
import { FRONTEND_URL } from "src/config";
import { useEntity } from "src/hooks/use-entity";
import { useCurrency } from "src/utils/useCurrency";

const CustomStepConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderLeftWidth: 2,
      borderLeftStyle: "dashed",
      borderLeftColor: "#006C35",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderLeftWidth: 2,
      borderLeftStyle: "dashed",
      borderLeftColor: "#006C35",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    marginLeft: 4.5,
    borderLeftWidth: 2,
    borderLeftStyle: "dashed",
    borderLeftColor: "lightGrey",
  },
}));

const CustomStepIconRoot = styled("div")<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor:
    theme.palette.mode === "dark" ? theme.palette.grey[700] : "#ccc",
  color: "#fff",
  width: 35,
  height: 35,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  ...(ownerState.active && {
    color: "#fff",
    background: theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
  }),
  ...(ownerState.completed && {
    color: "#fff",
    background: theme.palette.mode === "dark" ? "#0C935680" : "#006C3580",
  }),
}));

function CustomStepIcon(props: StepIconProps) {
  const { active, completed, className } = props;

  const icons: { [index: string]: React.ReactElement } = {
    1: <Schedule sx={{ width: 20, height: 20 }} />,
    2: <Schedule sx={{ width: 20, height: 20 }} />,
    3: <Schedule sx={{ width: 20, height: 20 }} />,
    4: <Schedule sx={{ width: 20, height: 20 }} />,
  };

  return (
    <CustomStepIconRoot
      sx={{ fontSize: "16px", fontWeight: "bold" }}
      ownerState={{ completed, active }}
      className={className}
    >
      {completed ? (
        <Check />
      ) : active ? (
        icons[String(props.icon)]
      ) : (
        String(props.icon)
      )}
    </CustomStepIconRoot>
  );
}

const OrderPlaced = () => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const currency = window.localStorage.getItem("onlineOrderingCurrency");
  const [showDialogCancel, setShowDialogCancel] = useState(false);

  const {
    findOne: findOrder,
    entity: order,
    loading,
    updateEntity,
  } = useEntity("ordering/order");
  const { findOne, entity } = useEntity("ordering/menu-config");

  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const getActiveStep = () => {
    if (order?.orderStatus === "open") {
      return 0;
    } else if (order?.orderStatus === "inprocess") {
      return 1;
    } else if (order?.orderStatus === "ready") {
      return 2;
    } else if (
      order?.orderStatus === "completed" ||
      order?.orderStatus === "cancelled"
    ) {
      return 4;
    }
  };

  const orderStatusData = [
    {
      key: "open",
      title: t("Order Placed"),
      description: order?.createdAt
        ? format(new Date(order.createdAt), "do MMMM yyyy, h:mm a")
        : "",
    },
    {
      key: "inprocess",
      title: t("Inprocess"),
      description:
        order?.orderStatus === "inprocess" && order?.updatedAt
          ? format(new Date(order.updatedAt), "do MMMM yyyy, h:mm a")
          : "",
    },
    {
      key: "ready",
      title:
        order?.orderType === "Delivery" ? t("On the way") : t("Order Ready"),
      description:
        order?.orderType === "Delivery" && order?.orderStatus === "ready"
          ? `${t("Order has been assigned to")} ${order?.driver?.name} (${
              order?.driver?.phone
            })`
          : "",
    },
    {
      key: "completed",
      title:
        order?.orderStatus === "cancelled" ? t("Cancelled") : t("Delivered"),
      description:
        (order?.orderStatus === "completed" ||
          order?.orderStatus === "cancelled") &&
        order?.updatedAt
          ? format(new Date(order.updatedAt), "do MMMM yyyy, h:mm a")
          : "",
    },
  ];

  const showCancelButton = (createdAt: string) => {
    const currentDate = new Date();
    const lastScheduleEnd = new Date(createdAt);
    const schedule = entity?.qrOrderingConfiguration?.schedule || [];

    const openingTime = new Date(schedule[schedule?.length - 1]?.startTime);
    const closingTime = new Date(schedule[schedule?.length - 1]?.endTime);

    const [openingHours, openingMinutes] = [
      getHours(openingTime),
      getMinutes(openingTime),
    ];

    const [closingHours, closingMinutes, closingSeconds] = [
      getHours(closingTime),
      getMinutes(closingTime),
      getSeconds(closingTime),
    ];

    const restaurantOpening = setHours(
      setMinutes(currentDate, openingMinutes),
      openingHours
    );
    const restaurantClosing = setHours(
      setMinutes(currentDate, closingMinutes),
      closingHours
    );

    if (restaurantClosing < restaurantOpening) {
      lastScheduleEnd.setDate(lastScheduleEnd.getDate() + 1);
    }

    lastScheduleEnd.setHours(closingHours);
    lastScheduleEnd.setMinutes(closingMinutes);
    lastScheduleEnd.setSeconds(closingSeconds);

    return lastScheduleEnd > currentDate;
  };

  const handleCancelOrder = async () => {
    try {
      const res = await updateEntity(order?._id, {
        createdAt: new Date().toISOString(),
        orderStatus: "cancelled",
        cancelledBy: "customer",
      });

      if (res) {
        toast.success(t("Order cancelled successfully"));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getTotalQuantity = () => {
    const quantity = order?.items?.reduce(
      (prev: any, cur: any) => prev + Number(cur.quantity),
      0
    );

    return quantity || 0;
  };

  const getItemName = (data: any) => {
    let units = "";

    if (data.variant.type === "box") {
      units = `, (${t("Box")} - ${data.variant.unitCount} ${t("Units")})`;
    }

    if (data.variant.type === "crate") {
      units = `, (${t("Crate")} - ${data.variant.unitCount} ${t("Units")})`;
    }

    const variantNameEn = data.hasMultipleVariants
      ? ` - ${data.variant.name.en}`
      : "";
    const variantNameAr = data.hasMultipleVariants
      ? ` - ${data.variant.name.ar}`
      : "";

    if (isRTL) {
      return `${data.name.ar}${variantNameAr}${units}`;
    } else {
      return `${data.name.en}${variantNameEn}${units}`;
    }
  };

  const getModifierName = (data: any) => {
    let name = "";

    data?.modifiers?.map((mod: any) => {
      name += `${name === "" ? "" : ", "}${mod.optionName}`;
    });

    return name;
  };

  useEffect(() => {
    const data = JSON.parse(window.localStorage.getItem("orderPlacedData"));
    findOrder(searchParams.get("orderId") || data?._id);
  }, [searchParams.get("orderId")]);

  useEffect(() => {
    if (order?.companyRef && order?.locationRef) {
      findOne(
        `?locationRef=${order?.locationRef}&companyRef=${order?.companyRef}`
      );
    }
  }, [order]);

  return (
    <>
      <Seo title={t("Order Details")} />

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "neutral.800" : "neutral.50",
            mb: searchParams.get("customer") === "true" ? "50px" : "100px",
            mt: "40px",
          }}
        >
          <Container maxWidth="md">
            {searchParams.get("customer") === "true" && (
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  pt: 2.5,
                  pb: 1.5,
                  px: { xs: 1.5, sm: 1.5, md: "9%", lg: "23%" },
                  flex: "0 0 auto",
                  position: "fixed",
                  cursor: "pointer",
                  width: "100%",
                  zIndex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "neutral.800"
                      : "neutral.50",
                }}
              >
                <Box sx={{ maxWidth: 60, cursor: "pointer" }}>
                  <Link
                    color="textPrimary"
                    component="a"
                    sx={{ alignItems: "center", display: "flex" }}
                    onClick={() => {
                      router.back();
                    }}
                  >
                    {isRTL ? (
                      <ArrowForward
                        fontSize="small"
                        sx={{ mr: 1, color: "#6B7280" }}
                      />
                    ) : (
                      <ArrowBackIcon
                        fontSize="small"
                        sx={{ mr: 1, color: "#6B7280" }}
                      />
                    )}
                  </Link>
                </Box>

                <Typography sx={{ pr: 5 }} variant="h5" align="center">
                  {t("Order Details")}
                </Typography>

                <Typography>{""}</Typography>
              </Box>
            )}

            {loading ? (
              <Box sx={{ mt: "35vh" }}>
                <LoaderAnimation />
              </Box>
            ) : (
              <Box
                sx={{
                  pb: 5,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    mt: searchParams.get("customer") === "true" ? 3 : 2,
                    px: 2.5,
                    py: 2.5,
                    borderRadius: 2,
                    bgcolor: "background.paper",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {order?.company?.logo && (
                      <Box
                        sx={{
                          mr: 1.5,
                          width: 70,
                          height: 70,
                          borderRadius: 1,
                          display: "flex",
                          overflow: "hidden",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundColor: "neutral.50",
                          backgroundImage: `url(${order.company.logo})`,
                        }}
                      />
                    )}

                    <Box>
                      <Typography
                        align="left"
                        fontSize="17px"
                        variant="body1"
                        sx={{
                          fontWeight: "bold",
                        }}
                      >
                        {order?.location?.name}
                      </Typography>

                      <Typography align="left" fontSize="14px" variant="body2">
                        {order?.location?.phone}
                      </Typography>

                      <Typography align="left" fontSize="14px" variant="body2">
                        {order?.location?.address}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ mt: 1.5 }} />

                  <Typography align="left" variant="h6" sx={{ mt: 2 }}>
                    {order?.orderType === "Delivery"
                      ? t("Delivery Order")
                      : t("Pickup Order")}
                  </Typography>

                  {order?.orderStatus === "completed" ||
                  order?.orderStatus === "cancelled" ? (
                    <Stack
                      sx={{ mt: 2 }}
                      spacing={1}
                      direction="row"
                      alignItems="center"
                    >
                      {order?.orderStatus === "completed" ? (
                        <Check
                          color="primary"
                          style={{ width: 25, height: 25 }}
                        />
                      ) : (
                        <WarningAmber
                          color="error"
                          style={{ width: 22, height: 22 }}
                        />
                      )}

                      <Typography
                        fontSize="15px"
                        variant="subtitle2"
                        color="text.secondary"
                      >
                        {`${
                          order?.orderStatus === "completed"
                            ? t("Delivered on")
                            : t("Cancelled on")
                        } ${format(
                          new Date(order.updatedAt),
                          "MMMM d, yyyy, h:mm a"
                        )}`}
                      </Typography>
                    </Stack>
                  ) : order?.orderStatus !== "completed" &&
                    order?.orderStatus !== "cancelled" ? (
                    <Stepper
                      sx={{
                        mt: 2,
                        "& .MuiStepLabel-iconContainer": {
                          pr: 2,
                        },
                      }}
                      activeStep={getActiveStep()}
                      orientation="vertical"
                      connector={<CustomStepConnector />}
                    >
                      {orderStatusData.map((order) => {
                        return (
                          <Step key={order.key}>
                            <StepLabel StepIconComponent={CustomStepIcon}>
                              <Typography variant="subtitle1">
                                {order.title}
                              </Typography>

                              <Typography
                                fontSize="13px"
                                color="text.secondary"
                                variant="body2"
                              >
                                {order.description}
                              </Typography>
                            </StepLabel>
                          </Step>
                        );
                      })}
                    </Stepper>
                  ) : (
                    <></>
                  )}

                  {order?.orderStatus !== "completed" &&
                    order?.orderStatus !== "cancelled" && (
                      <Grid container spacing={3} sx={{ mt: 0 }}>
                        <Grid
                          item
                          md={
                            order?.qrOrdering ||
                            order?.orderType === "Delivery" ||
                            !order?.location?.address
                              ? 12
                              : 6
                          }
                          xs={
                            order?.qrOrdering ||
                            order?.orderType === "Delivery" ||
                            !order?.location?.address
                              ? 12
                              : 6
                          }
                        >
                          <Card
                            sx={{
                              py: 1,
                              borderRadius: 1,
                              display: "flex",
                              alignItems: "center",
                              backgroundColor:
                                order?.driver?.phone || order?.location?.phone
                                  ? theme.palette.mode === "dark"
                                    ? "#0C93561A"
                                    : "#006C351A"
                                  : "lightGrey",
                              boxShadow:
                                order?.driver?.phone || order?.location?.phone
                                  ? theme.palette.mode === "dark"
                                    ? "#0C9356 0 0 0 1px"
                                    : "#006C35 0 0 0 1px"
                                  : "lightGrey 0 0 0 1px",
                            }}
                            onClick={() => {
                              if (
                                order?.driver?.phone ||
                                order?.location?.phone
                              ) {
                                window.location.href = `tel:${
                                  order?.orderType === "Delivery" &&
                                  order?.orderStatus === "ready"
                                    ? order?.driver?.phone
                                    : order?.location?.phone
                                }`;
                              }
                            }}
                            variant="outlined"
                          >
                            <Box
                              sx={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Call
                                sx={{
                                  mr: 1,
                                  color:
                                    order?.driver?.phone ||
                                    order?.location?.phone
                                      ? theme.palette.mode === "dark"
                                        ? "#0C9356"
                                        : "#006C35"
                                      : "neutral.400",
                                }}
                              />

                              <Typography
                                variant="subtitle1"
                                color={
                                  order?.driver?.phone || order?.location?.phone
                                    ? "neutral.900"
                                    : "neutral.500"
                                }
                              >
                                {t("Call")}
                              </Typography>
                            </Box>
                          </Card>
                        </Grid>

                        {order?.onlineOrdering &&
                          order?.orderType !== "Delivery" &&
                          order?.location?.address && (
                            <Grid item md={6} xs={6}>
                              <Card
                                sx={{
                                  py: 1,
                                  borderRadius: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  backgroundColor:
                                    theme.palette.mode === "dark"
                                      ? "#0C93561A"
                                      : "#006C351A",
                                  boxShadow:
                                    theme.palette.mode === "dark"
                                      ? "#0C9356 0 0 0 1px"
                                      : "#006C35 0 0 0 1px",
                                }}
                                onClick={() => {
                                  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                                    `${order?.location?.coordinates?.lat},${order?.location?.coordinates?.lng}`
                                  )}&travelmode=driving`;

                                  // Open the URL in the Maps app or a browser
                                  window.open(mapsUrl, "_blank");
                                }}
                                variant="outlined"
                              >
                                <Box
                                  sx={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <LocationOn
                                    sx={{
                                      mr: 1,
                                      color:
                                        theme.palette.mode === "dark"
                                          ? "#0C9356"
                                          : "#006C35",
                                    }}
                                  />

                                  <Typography variant="subtitle1">
                                    {t("Direction")}
                                  </Typography>
                                </Box>
                              </Card>
                            </Grid>
                          )}
                      </Grid>
                    )}

                  {(order?.orderType === "Delivery" &&
                  order?.orderStatus === "ready"
                    ? false
                    : true) &&
                    order?.orderStatus !== "completed" &&
                    order?.orderStatus !== "cancelled" &&
                    showCancelButton(order?.createdAt) && (
                      <LoadingButton
                        sx={{ mt: 3, width: "100%" }}
                        color="error"
                        type="submit"
                        variant="outlined"
                        onClick={() => {
                          setShowDialogCancel(true);
                        }}
                      >
                        {t("Cancel Order")}
                      </LoadingButton>
                    )}
                </Box>

                <Box
                  sx={{
                    mt: 4,
                    px: 2.5,
                    py: 2.5,
                    borderRadius: 2,
                    bgcolor: "background.paper",
                  }}
                >
                  <Typography
                    align="left"
                    fontSize="17px"
                    variant="body1"
                    sx={{
                      fontWeight: "bold",
                    }}
                  >
                    {t("Order Details")}
                  </Typography>

                  <Divider sx={{ mt: 1.5 }} />

                  <Box
                    sx={{
                      pt: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      align="left"
                      fontSize="15px"
                      variant="subtitle2"
                    >
                      {`${t("Order")} #`}
                    </Typography>

                    <Typography align="right" fontSize="15px" variant="h6">
                      {order?.orderNum}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      pt: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      align="left"
                      fontSize="15px"
                      variant="subtitle2"
                    >
                      {`${t("Token")} #`}
                    </Typography>

                    <Typography align="right" fontSize="15px" variant="h6">
                      {order?.tokenNumber || "-"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      pt: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      align="left"
                      fontSize="15px"
                      variant="subtitle2"
                    >
                      {t("Date")}
                    </Typography>

                    <Typography align="right" fontSize="15px" variant="h6">
                      {order?.createdAt
                        ? format(
                            new Date(order.createdAt),
                            "do MMM, yyyy, h:mm a"
                          )
                        : ""}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      pt: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      align="left"
                      fontSize="15px"
                      variant="subtitle2"
                    >
                      {t("Payment")}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Typography align="right" fontSize="15px" variant="h6">
                        {order?.payment?.paymentType === "offline"
                          ? "Offline"
                          : "Online"}
                      </Typography>

                      <Typography
                        sx={{ ml: 1 }}
                        align="right"
                        fontSize="15px"
                        variant="h6"
                        color={
                          order?.payment?.paymentStatus === "unpaid"
                            ? "error.main"
                            : "#006C35"
                        }
                      >
                        {order?.payment?.paymentStatus === "unpaid"
                          ? "(Due)"
                          : "(Paid)"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      pt: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      align="left"
                      fontSize="15px"
                      variant="subtitle2"
                    >
                      {t("Name")}
                    </Typography>

                    <Typography align="right" fontSize="15px" variant="h6">
                      {order?.customer?.address?.type === "Friends and Family"
                        ? order?.customer?.address?.receiverName ||
                          order?.customer?.name
                        : order?.customer?.name}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      pt: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      align="left"
                      fontSize="15px"
                      variant="subtitle2"
                    >
                      {t("Phone")}
                    </Typography>

                    <Typography align="right" fontSize="15px" variant="h6">
                      {order?.customer?.address?.type === "Friends and Family"
                        ? order?.customer?.address?.receiverPhone ||
                          order?.customer?.phone
                        : order?.customer?.phone}
                    </Typography>
                  </Box>

                  {order?.orderType === "Delivery" && (
                    <Box
                      sx={{
                        pt: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        align="left"
                        fontSize="15px"
                        variant="subtitle2"
                      >
                        {t("Address")}
                      </Typography>

                      <Typography align="right" fontSize="15px" variant="h6">
                        {order?.customer?.address?.houseFlatBlock +
                          `${
                            order?.customer?.address?.apartmentArea
                              ? `, ${order?.customer?.address?.apartmentArea}`
                              : ""
                          }` +
                          `${
                            order?.customer?.address?.directionToReach
                              ? `, ${order?.customer?.address?.directionToReach}`
                              : ""
                          }`}
                      </Typography>
                    </Box>
                  )}

                  {order?.specialInstructions && (
                    <Box
                      sx={{
                        pt: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        align="left"
                        fontSize="15px"
                        variant="subtitle2"
                      >
                        {t("Special Instructions")}
                      </Typography>

                      <Typography align="right" fontSize="15px" variant="h6">
                        {order.specialInstructions || "-"}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box
                  sx={{
                    mt: 4,
                    px: 2.5,
                    py: 2.5,
                    borderRadius: 2,
                    bgcolor: "background.paper",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      align="left"
                      fontSize="15px"
                      variant="subtitle2"
                    >
                      {t("Item Total")}
                    </Typography>

                    <Typography
                      align="right"
                      fontSize="16px"
                      variant="subtitle2"
                    >
                      {`${currency} ${(
                        order?.payment?.subTotalWithoutDiscount || 0
                      )?.toFixed(2)}`}
                    </Typography>
                  </Box>

                  {order?.payment?.discountAmount > 0 && (
                    <Box
                      sx={{
                        pt: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography
                          align="left"
                          fontSize="15px"
                          variant="subtitle2"
                        >
                          {t("Discount")}
                        </Typography>

                        <Typography
                          align="left"
                          fontSize="15px"
                          color="error.main"
                          variant="subtitle2"
                        >
                          {order?.payment?.discountCode}
                        </Typography>
                      </Box>

                      <Typography
                        align="right"
                        fontSize="16px"
                        color="#006C35"
                        variant="subtitle2"
                      >
                        {`- ${currency} ${(
                          order?.payment?.discountAmount || 0
                        )?.toFixed(2)}`}
                      </Typography>
                    </Box>
                  )}

                  <Divider sx={{ mt: 2 }} />

                  <Box
                    sx={{
                      pt: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      align="left"
                      fontSize="15px"
                      variant="subtitle2"
                    >
                      {t("Sub Total")}
                    </Typography>

                    <Typography
                      align="right"
                      fontSize="16px"
                      variant="subtitle2"
                    >
                      {`${currency} ${(order?.payment?.subTotal || 0)?.toFixed(
                        2
                      )}`}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      pt: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      align="left"
                      fontSize="15px"
                      variant="subtitle2"
                    >
                      {t("Taxes")}
                    </Typography>

                    <Typography
                      align="right"
                      fontSize="16px"
                      variant="subtitle2"
                    >
                      {`+ ${currency} ${(
                        order?.payment?.vatAmount || 0
                      )?.toFixed(2)}`}
                    </Typography>
                  </Box>

                  {order?.payment?.charges?.map((charge: any) => {
                    return (
                      <Box
                        key={charge?.chargeId}
                        sx={{
                          pt: 1.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          align="left"
                          fontSize="15px"
                          variant="subtitle2"
                        >
                          {isRTL ? charge?.name?.ar : charge?.name?.en}
                        </Typography>

                        <Typography
                          align="right"
                          fontSize="16px"
                          variant="subtitle2"
                        >
                          {`+ ${currency} ${(
                            charge?.total - charge?.vat
                          )?.toFixed(2)}`}
                        </Typography>
                      </Box>
                    );
                  })}

                  <Divider sx={{ mt: 2 }} />

                  <Box
                    sx={{
                      pt: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      align="left"
                      fontSize="17px"
                      variant="subtitle2"
                    >
                      {t("Total Amount")}
                    </Typography>

                    <Typography
                      align="right"
                      fontSize="18px"
                      variant="subtitle2"
                    >
                      {`${currency} ${(order?.payment?.total || 0)?.toFixed(
                        2
                      )}`}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    mt: 4,
                    px: 2.5,
                    py: 2.5,
                    borderRadius: 2,
                    bgcolor: "background.paper",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      align="left"
                      fontSize="17px"
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                      }}
                    >
                      {t("Items")}
                    </Typography>

                    <Typography
                      align="left"
                      fontSize="17px"
                      variant="body2"
                      sx={{ fontWeight: "bold" }}
                    >
                      {`${getTotalQuantity()} ${t("Qty")}`}
                    </Typography>
                  </Box>

                  <Divider sx={{ mt: 1.5 }} />

                  {order?.items?.map((item: any) => {
                    return (
                      <Box
                        key={item.productRef}
                        sx={{
                          pt: 1.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box>
                          <Typography
                            align="left"
                            fontSize="15px"
                            variant="subtitle2"
                          >
                            {getItemName(item)}
                          </Typography>
                          <Typography
                            align="left"
                            fontSize="15px"
                            variant="subtitle2"
                            color="neutral.600"
                          >
                            {` x ${item.quantity}`}
                          </Typography>
                          <Typography
                            align="left"
                            fontSize="13px"
                            variant="subtitle2"
                            color="neutral.500"
                          >
                            {getModifierName(item)}
                          </Typography>
                        </Box>

                        {item?.isFree ? (
                          <Box>
                            <Typography
                              align="right"
                              fontSize="16px"
                              variant="subtitle2"
                            >
                              {"FREE"}
                            </Typography>
                            <del>
                              <Typography
                                align="right"
                                fontSize="16px"
                                variant="subtitle2"
                              >
                                {`${currency} ${Number(
                                  item.billing.total
                                )?.toFixed(2)}`}
                              </Typography>
                            </del>
                          </Box>
                        ) : item?.isQtyFree ? (
                          <Box>
                            <Typography
                              align="right"
                              fontSize="16px"
                              variant="subtitle2"
                            >
                              {`${currency} ${Number(
                                item.billing.total -
                                  item?.billing?.discountAmount
                              )?.toFixed(2)}`}
                            </Typography>
                            <del>
                              <Typography
                                align="right"
                                fontSize="16px"
                                variant="subtitle2"
                              >
                                {`${currency} ${Number(
                                  item.billing.total
                                )?.toFixed(2)}`}
                              </Typography>
                            </del>
                          </Box>
                        ) : (
                          <Typography
                            align="right"
                            fontSize="16px"
                            variant="subtitle2"
                          >
                            {`${currency} ${Number(item.billing.total)?.toFixed(
                              2
                            )}`}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>

                {searchParams.get("customer") !== "true" && (
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
                              theme.palette.mode === "dark"
                                ? "#0C9356"
                                : "#006C35",
                          }}
                          type="submit"
                          variant="contained"
                          onClick={() => {
                            const data =
                              window.localStorage.getItem("industry");
                            const qrOrdering =
                              window.localStorage.getItem("qrOrdering");

                            // Replace the current page's location with the new URL
                            window.location.replace(
                              data === "restaurant"
                                ? qrOrdering === "true"
                                  ? `${FRONTEND_URL}/qr-ordering-restaurant?locationRef=${order?.locationRef}&companyRef=${order?.companyRef}`
                                  : `${FRONTEND_URL}/online-ordering-restaurant?locationRef=${order?.locationRef}&companyRef=${order?.companyRef}`
                                : qrOrdering === "true"
                                ? `${FRONTEND_URL}/qr-ordering-retail?locationRef=${order?.locationRef}&companyRef=${order?.companyRef}`
                                : `${FRONTEND_URL}/online-ordering-retail?locationRef=${order?.locationRef}&companyRef=${order?.companyRef}`
                            );

                            // Disable the browser's back functionality
                            window.addEventListener(
                              "popstate",
                              function (event) {
                                window.location.replace(
                                  data === "restaurant"
                                    ? qrOrdering === "true"
                                      ? `${FRONTEND_URL}/qr-ordering-restaurant?locationRef=${
                                          order?.locationRef
                                        }&companyRef=${
                                          order?.companyRef
                                        }&qrOrdering=${true}`
                                      : `${FRONTEND_URL}/online-ordering-restaurant?locationRef=${order?.locationRef}&companyRef=${order?.companyRef}`
                                    : qrOrdering === "true"
                                    ? `${FRONTEND_URL}/qr-ordering-retail?locationRef=${
                                        order?.locationRef
                                      }&companyRef=${
                                        order?.companyRef
                                      }&qrOrdering=${true}`
                                    : `${FRONTEND_URL}/online-ordering-retail?locationRef=${order?.locationRef}&companyRef=${order?.companyRef}`
                                );
                              }
                            );
                          }}
                        >
                          {t("Go Back")}
                        </LoadingButton>
                      </Box>
                    </Fab>
                  </div>
                )}
              </Box>
            )}
          </Container>
        </Box>
      </Box>

      <ConfirmationDialog
        show={showDialogCancel}
        toggle={() => setShowDialogCancel(!showDialogCancel)}
        onOk={() => {
          handleCancelOrder();
          setShowDialogCancel(false);
        }}
        okButtonText={`${t("Yes")}, ${t("Cancel")}`}
        cancelButtonText={t("No")}
        title={t("Cancel?")}
        text={t("Do you want to cancel this order?")}
      />
    </>
  );
};

export default OrderPlaced;
