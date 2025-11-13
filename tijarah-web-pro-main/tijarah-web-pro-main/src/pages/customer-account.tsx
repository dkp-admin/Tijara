import {
  ArrowBackIos,
  ArrowForward,
  CallOutlined,
  Cancel,
  CheckCircle,
  Schedule,
} from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Card,
  Container,
  Link,
  Stack,
  SvgIcon,
  Typography,
  useTheme,
} from "@mui/material";
import {
  format,
  getHours,
  getMinutes,
  getSeconds,
  setHours,
  setMinutes,
} from "date-fns";
import { t } from "i18next";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import ConfirmationDialog from "src/components/confirmation-dialog";
import { CustomerAuthModal } from "src/components/menu/customer-auth-modal";
import { Seo } from "src/components/seo";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import LoaderAnimation from "src/components/widgets/animations/loader";
import { FRONTEND_URL } from "src/config";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { LanguageSwitch } from "src/layouts/dashboard/language-switch";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

const CustomerAccount = () => {
  const theme = useTheme();
  const router = useRouter();
  const scrollPosition = useRef(0);
  const { user, customer } = useAuth();
  const searchParams = useSearchParams();
  const currency = useCurrency();

  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const { find, entities, updateEntity } = useEntity("ordering/order");
  const { findOne, entity } = useEntity("ordering/menu-config");

  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [cancelBtnTap, setCancelBtnTap] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [showDialogCancel, setShowDialogCancel] = useState(false);
  const [openCustomerAuthModal, setOpenCustomerAuthModal] =
    useState<boolean>(false);

  const orderStatusName = (orderType: string, orderStatus: string) => {
    if (orderStatus === "open") {
      return t("Open");
    } else if (orderStatus === "inprocess") {
      return t("Inprocess");
    } else if (orderStatus === "ready") {
      return orderType === "Pickup" ? t("Ready") : t("On the way");
    } else if (orderStatus === "completed") {
      return t("Delivered");
    } else {
      return t("Cancelled");
    }
  };

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
      const res = await updateEntity(orderId, {
        createdAt: new Date().toISOString(),
        orderStatus: "cancelled",
        cancelledBy: "customer",
      });

      if (res) {
        toast.success(t("Order cancelled successfully"));
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      setCancelBtnTap(false);
    }
  };

  useEffect(() => {
    if (page === 0 && customer?.companyRef && searchParams.get("locationRef")) {
      findOne(
        `?locationRef=${searchParams.get("locationRef")}&companyRef=${
          customer?.companyRef
        }`
      );
    }

    if (customer?.companyRef && searchParams.get("locationRef")) {
      find({
        _q: "",
        limit: 5,
        page: page,
        sort: "desc",
        customerRef: customer?._id,
        companyRef: customer?.companyRef,
        locationRef: searchParams.get("locationRef"),
      });
    }
  }, [page, customer, searchParams.get("locationRef")]);

  useEffect(() => {
    if (entities?.results?.length > 0) {
      setLoading(false);
      setOrders((prevOrders) => [...prevOrders, ...entities?.results]);
    } else if (entities.total === 0) {
      setLoading(false);
    }
  }, [entities?.results]);

  const handleViewMore = () => {
    scrollPosition.current = window.scrollY;
    setPage((prevPage) => prevPage + 1);
  };

  useEffect(() => {
    window.scrollTo(0, scrollPosition.current);
  }, [orders]);

  return (
    <>
      <Seo title={t("Customer Account")} />

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "neutral.800" : "neutral.50",
            mb: "100px",
            mt: "40px",
          }}
        >
          <Container maxWidth="md">
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
                  theme.palette.mode === "dark" ? "neutral.800" : "neutral.50",
              }}
            >
              <Box sx={{ maxWidth: 60, cursor: "pointer" }}>
                <Link
                  color="textPrimary"
                  component="a"
                  sx={{
                    alignItems: "center",
                    display: "flex",
                  }}
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

              <Typography variant="h5" align="center">
                {t("My Account")}
              </Typography>

              <Box sx={{ mb: -1.5 }}>
                <LanguageSwitch />
              </Box>
            </Box>

            {user?._id && customer?._id ? (
              <Box
                sx={{
                  pt: { xs: 4, sm: 4, md: 5.5, lg: 5.5 },
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Card
                  sx={{
                    mt: 0.5,
                    mb: 3,
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    backgroundColor: "background.paper",
                    boxShadow: (theme: any) =>
                      `${theme.palette.neutral[100]} 0 0 0 1px`,
                  }}
                >
                  <Typography variant="h5">{customer?.name}</Typography>

                  <Stack sx={{ mt: 1.25 }} spacing={1} direction="row">
                    <CallOutlined
                      sx={{
                        width: 20,
                        height: 20,
                        color: theme.palette.text.secondary,
                      }}
                    />

                    <Typography variant="h6" color="text.secondary">
                      {customer?.phone}
                    </Typography>
                  </Stack>
                </Card>

                <Typography
                  sx={{ mt: 1.5 }}
                  fontWeight="600"
                  variant="subtitle2"
                  color="text.secondary"
                >
                  {t("PAST ORDERS")}
                </Typography>

                {loading && !cancelBtnTap ? (
                  <Box sx={{ mt: "25vh" }}>
                    <LoaderAnimation />
                  </Box>
                ) : (
                  <Box>
                    {orders?.length > 0 ? (
                      <Box
                        sx={{
                          mt: 1,
                          px: 2,
                          mx: -2,
                          pt: 3,
                          pb: 0.5,
                          background:
                            theme.palette.mode !== "dark" ? `#fff` : "#111927",
                        }}
                      >
                        {orders?.map((order: any) => {
                          const onTheWay =
                            order?.orderType === "Delivery" &&
                            order?.orderStatus === "ready";

                          return (
                            <Box
                              key={order._id}
                              sx={{
                                mb: 3,
                                borderBottom:
                                  theme.palette.mode === "light"
                                    ? "2px solid #000"
                                    : "2px solid #fff",
                              }}
                            >
                              <Box
                                sx={{ cursor: "pointer" }}
                                onClick={() => {
                                  router.push(
                                    `${FRONTEND_URL}/order-details?orderId=${
                                      order._id
                                    }&customer=${true}`
                                  );
                                }}
                              >
                                <Stack
                                  flexDirection="row"
                                  alignItems="flex-start"
                                  justifyContent="space-between"
                                >
                                  <Typography variant="h6">
                                    {order.company.name}
                                  </Typography>

                                  <Stack
                                    spacing={0.75}
                                    direction="row"
                                    alignItems="center"
                                  >
                                    <Typography
                                      fontSize="14px"
                                      fontWeight="600"
                                      variant="subtitle2"
                                    >
                                      {orderStatusName(
                                        order.orderType,
                                        order.orderStatus
                                      )}
                                    </Typography>

                                    {order.orderStatus === "completed" ? (
                                      <CheckCircle
                                        style={{ width: 17, height: 17 }}
                                        color="primary"
                                      />
                                    ) : order.orderStatus === "cancelled" ? (
                                      <Cancel
                                        style={{ width: 17, height: 17 }}
                                        color="error"
                                      />
                                    ) : (
                                      <Schedule
                                        style={{ width: 17, height: 17 }}
                                        color="inherit"
                                      />
                                    )}
                                  </Stack>
                                </Stack>

                                <Typography
                                  sx={{ mt: 1 }}
                                  fontSize="14px"
                                  variant="subtitle1"
                                  color="text.secondary"
                                >
                                  {order.location.name}
                                </Typography>

                                <Stack
                                  spacing={1}
                                  direction="row"
                                  alignItems="center"
                                >
                                  <Typography
                                    sx={{ mt: 1 }}
                                    fontSize="15px"
                                    fontWeight="600"
                                    variant="subtitle1"
                                    color="text.secondary"
                                  >
                                    {`${currency} ${toFixedNumber(
                                      order.payment.total
                                    )}`}
                                  </Typography>

                                  <SvgIcon
                                    style={{
                                      width: 16,
                                      height: 16,
                                      marginTop: 7,
                                    }}
                                  >
                                    {isRTL ? (
                                      <ArrowBackIos />
                                    ) : (
                                      <ArrowForwardIos />
                                    )}
                                  </SvgIcon>
                                </Stack>

                                <Typography
                                  sx={{ mt: 1 }}
                                  fontSize="12px"
                                  variant="subtitle1"
                                  color="text.secondary"
                                >
                                  {format(
                                    new Date(order.createdAt),
                                    "MMM d, yyyy, h:mm a"
                                  )}
                                </Typography>
                              </Box>

                              <Box sx={{ mb: 2.5 }}>
                                {order.orderStatus !== "completed" &&
                                  order.orderStatus !== "cancelled" && (
                                    <Stack
                                      spacing={2}
                                      direction="row"
                                      sx={{ mt: 2, mb: 2 }}
                                    >
                                      <LoadingButton
                                        sx={{ width: "50%" }}
                                        type="submit"
                                        variant="outlined"
                                        onClick={() => {
                                          if (
                                            order?.driver?.phone ||
                                            order?.location?.phone
                                          ) {
                                            window.open(
                                              `tel:${
                                                order.orderType ===
                                                  "Delivery" &&
                                                order.orderStatus === "ready"
                                                  ? order.driver.phone
                                                  : order.location.phone
                                              }`
                                            );
                                          }
                                        }}
                                      >
                                        {t("Call")}
                                      </LoadingButton>

                                      {order.orderStatus !== "completed" &&
                                        order.orderStatus !== "cancelled" &&
                                        !onTheWay &&
                                        showCancelButton(order?.createdAt) && (
                                          <LoadingButton
                                            sx={{ width: "50%" }}
                                            color="error"
                                            type="submit"
                                            variant="outlined"
                                            onClick={() => {
                                              setOrderId(order._id);
                                              setShowDialogCancel(true);
                                            }}
                                          >
                                            {t("Cancel")}
                                          </LoadingButton>
                                        )}
                                    </Stack>
                                  )}
                              </Box>
                            </Box>
                          );
                        })}

                        {entities?.total > orders?.length && (
                          <LoadingButton
                            sx={{
                              px: 0,
                              py: 1,
                              mt: -1,
                              color:
                                theme.palette.mode === "dark"
                                  ? "#0C9356"
                                  : "#006C35",
                            }}
                            type="submit"
                            loading={loading}
                            variant="text"
                            onClick={handleViewMore}
                          >
                            {t("View More Orders")}
                          </LoadingButton>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ mt: 8, mb: 4 }}>
                        <NoDataAnimation
                          text={
                            <Typography
                              variant="h6"
                              textAlign="center"
                              sx={{ mt: 2 }}
                            >
                              {t("No Orders!")}
                            </Typography>
                          }
                        />
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ pb: 10, pt: "35vh" }}>
                <Typography variant="h6" align="center">
                  {t("Please login to continue")}
                </Typography>

                <LoadingButton
                  sx={{
                    mt: 3,
                    px: 4.5,
                    py: 1.75,
                    width: "100%",
                    bgcolor:
                      theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
                  }}
                  type="submit"
                  variant="contained"
                  onClick={() => {
                    setOpenCustomerAuthModal(true);
                  }}
                >
                  {t("Login")}
                </LoadingButton>
              </Box>
            )}
          </Container>
        </Box>
      </Box>

      <ConfirmationDialog
        show={showDialogCancel}
        toggle={() => setShowDialogCancel(!showDialogCancel)}
        onOk={() => {
          setLoading(true);
          setCancelBtnTap(true);
          handleCancelOrder();
          setShowDialogCancel(false);
        }}
        okButtonText={`${t("Yes")}, ${t("Cancel")}`}
        cancelButtonText={t("No")}
        title={t("Cancel?")}
        text={t("Do you want to cancel this order?")}
      />

      {openCustomerAuthModal && (
        <CustomerAuthModal
          open={openCustomerAuthModal}
          locationRef={searchParams.get("locationRef")}
          handleClose={() => {
            setOpenCustomerAuthModal(false);
          }}
          handleSuccess={() => {
            setOpenCustomerAuthModal(false);
          }}
        />
      )}
    </>
  );
};

export default CustomerAccount;
