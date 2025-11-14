import { ArrowForward, BookOnline, OfflinePin } from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Card,
  Container,
  Fab,
  Grid,
  Link,
  SvgIcon,
  Typography,
  useTheme,
} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import { t } from "i18next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Seo } from "src/components/seo";
import LoaderAnimation from "src/components/widgets/animations/loader";
import { FRONTEND_URL } from "src/config";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { ArrowRight as ArrowRightIcon } from "src/icons/arrow-right";
import { UserCircle } from "src/icons/user-circle";
import cart from "src/utils/cart";
import { ChannelsName } from "src/utils/constants";
import { getStartEndOfDay } from "src/utils/date";
import generateRandomCode from "src/utils/generateRandomCode";
import { useCurrency } from "src/utils/useCurrency";

const Payment = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user, customer } = useAuth();
  const { locationRef, companyRef } = router.query as any;
  const { find: findCharges, entities: charges } = useEntity("custom-charge");

  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const {
    findOne: findMenuLocation,
    entity: menuLocation,
    loading: loader,
  } = useEntity("ordering/menu-config");
  const { create } = useEntity("ordering/order");

  const [qrOrdering, setQrOrdering] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [paymentType, setPaymentType] = useState<"offline" | "online">(null);
  const { startOfDay, endOfDay } = getStartEndOfDay();
  const currency = window.localStorage.getItem("onlineOrderingCurrency");

  const handleOrderComplete = async () => {
    const items = cart.getCartItems().map((item: any) => {
      return {
        productRef: item.productRef,
        categoryRef: item.categoryRef,
        image: item.image,
        name: item.name,
        contains: item.contains,
        category: { name: item.category.name },
        costPrice: item.costPrice,
        price: item.sellingPrice,
        variant: {
          name: { en: item.variantNameEn, ar: item.variantNameAr },
          type: item.type,
          sku: item.sku,
          parentSku: item.parentSku,
          boxSku: item.boxSku,
          crateSku: item.crateSku,
          boxRef: item.boxRef ? item.boxRef : null,
          crateRef: item.crateRef ? item.crateRef : null,
          unit: item.unit,
          unitCount: item.noOfUnits,
        },
        quantity: item.qty,
        hasMultipleVariants: item.hasMultipleVariants,
        note: "",
        stock: {
          availability: item.availability,
          tracking: item.tracking,
          count: item.stockCount,
        },
        billing: {
          subTotal: item.sellingPrice,
          vat: item.vatAmount,
          vatPercenatge: item.vat,
          total: item.total,
        },
        modifiers: item.modifiers,
      };
    });

    const dataObj = {
      userRef: user._id,
      customerRef: customer._id,
      startOfDay,
      endOfDay,
      qrOrdering: qrOrdering,
      onlineOrdering: !qrOrdering,
      industry: menuLocation?.industry,
      charges: charges.results.map((charge) => charge?._id) || [],
      customer:
        checkoutData?.deliveryType === "Pickup"
          ? { name: customer.name, vat: customer.vat, phone: customer.phone }
          : {
              name: customer.name,
              vat: customer.vat,
              phone: customer.phone,
              address: {
                _id: checkoutData?.address?._id,
                fullAddress: checkoutData?.address?.fullAddress,
                coordinates: checkoutData?.address?.coordinates,
                houseFlatBlock: checkoutData?.address?.houseFlatBlock,
                apartmentArea: checkoutData?.address?.apartmentArea,
                directionToReach: checkoutData?.address?.directionToReach,
                type: checkoutData?.address?.type,
                otherName: checkoutData?.address?.name,
                receiverName: checkoutData?.address?.receiverName,
                receiverPhone: checkoutData?.address?.receiverPhone,
              },
            },
      companyRef: companyRef || customer?.companyRef,
      company: {
        name: menuLocation?.company?.name?.en || customer.company.name,
        logo: menuLocation?.company?.logo || "",
      },
      locationRef: locationRef || customer?.locationRefs?.[0],
      location: {
        name: menuLocation?.name?.en,
        phone: menuLocation?.phone,
        address: menuLocation?.address,
        coordinates: menuLocation?.qrOrderingConfiguration?.coordinates,
      },
      orderNum: generateRandomCode(6),
      orderType: ChannelsName[checkoutData?.deliveryType],
      orderStatus: "open",
      specialInstructions: checkoutData?.specialInstructions,
      items: items,
      deletedItems: [] as any,
      discount: checkoutData?.cart?.discountCode,
      payment: {
        paymentType: paymentType,
        paymentStatus: paymentType === "online" ? "paid" : "unpaid",
        total: checkoutData?.cart?.total,
        vat: checkoutData?.cart?.vatAmount,
        vatPercentage: (
          (checkoutData?.cart?.vatAmount * 100) /
          checkoutData?.cart?.total
        ).toFixed(0),
        subTotal: checkoutData?.cart?.subTotal,
        discount: checkoutData?.cart?.discount,
        discountPercentage: checkoutData?.cart?.discountPercentage,
        discountCode: checkoutData?.cart?.discountCode,
        vatWithoutDiscount: checkoutData?.cart?.vatWithoutDiscount,
        subTotalWithoutDiscount: checkoutData?.cart?.subTotalWithoutDiscount,
        breakup:
          paymentType === "online"
            ? [
                {
                  name: paymentData?.cardType,
                  total: Number(paymentData?.amount?.toFixed(2)),
                  refId: paymentData?.transactionNumber,
                  providerName: paymentData?.providerName,
                  createdAt: new Date(),
                  change: Number(0?.toFixed(2)),
                },
              ]
            : [],
      },
      receivedAt: new Date().toISOString(),
      currency,
    };

    setLoading(true);

    try {
      const res = await create({ ...dataObj });

      if (res) {
        window.localStorage.setItem("orderPlacedData", JSON.stringify(res));

        cart.clearCart();

        // Replace the current page's location with the new URL
        window.location.replace(
          `${FRONTEND_URL}/order-placed?orderId=${res?._id}`
        );

        // Disable the browser's back functionality
        window.addEventListener("popstate", function (event) {
          window.location.replace(
            `${FRONTEND_URL}/order-placed?orderId=${res?._id}`
          );
          window.location.replace(
            `${FRONTEND_URL}/order-placed?orderId=${res?._id}`
          );
          window.location.replace(
            `${FRONTEND_URL}/order-placed?orderId=${res?._id}`
          );
        });
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const qrOrdering = window.localStorage.getItem("qrOrdering");
    const data = JSON.parse(window.localStorage.getItem("checkoutCart"));
    setCheckoutData(data);
    setQrOrdering(qrOrdering === "true");
    findMenuLocation(
      `?locationRef=${
        locationRef || customer?.locationRefs?.[0]
      }&companyRef=${companyRef}`
    );
  }, [locationRef, companyRef]);

  useEffect(() => {
    findCharges({
      page: 0,
      sort: "asc",
      activeTab: "active",
      limit: 100,
      _q: "",
      companyRef: companyRef || customer?.companyRef,
      applyAutoChargeOnOrders: true,
      channel: checkoutData?.deliveryType,
    });
  }, [companyRef, checkoutData]);

  return (
    <>
      <Seo title={t("Payment")} />
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
                  <Typography variant="subtitle2">{t("Cart")}</Typography>
                </Link>
              </Box>

              <Box sx={{ pr: "23%" }}>
                <Typography variant="h5" align="center">
                  {t("Payment")}
                </Typography>
              </Box>

              <Box
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  router.push(
                    `${FRONTEND_URL}/customer-account?locationRef=${locationRef}`
                  );
                }}
              >
                <SvgIcon
                  style={{
                    width: 27,
                    height: 27,
                    marginTop: 5,
                    marginRight: 8,
                  }}
                >
                  <UserCircle />
                </SvgIcon>
              </Box>
            </Box>

            {loader ? (
              <Box sx={{ mt: "35vh" }}>
                <LoaderAnimation />
              </Box>
            ) : (
              <Box
                sx={{
                  pt: { xs: 4, sm: 4, md: 5.5, lg: 5.5 },
                  pb: 10,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Grid container spacing={3}>
                  <Grid item md={12} xs={12}>
                    <Typography
                      align="left"
                      fontSize="16px"
                      variant="body2"
                      sx={{ mt: 1, ml: 1 }}
                      style={{
                        gap: 5,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {t("How would you like to make the payment?")}
                    </Typography>
                  </Grid>

                  {(qrOrdering
                    ? menuLocation?.qrOrderingConfiguration?.paymentOptions ===
                        "all" ||
                      menuLocation?.qrOrderingConfiguration?.paymentOptions ===
                        "offline"
                    : menuLocation?.qrOrderingConfiguration?.paymentOptions ===
                        "all" ||
                      menuLocation?.qrOrderingConfiguration?.paymentOptions ===
                        "offline") && (
                    <Grid item md={12} xs={12}>
                      <Card
                        sx={{
                          px: 2,
                          py: 1.5,
                          display: "flex",
                          alignItems: "center",
                          borderRadius: 2,
                          backgroundColor:
                            paymentType === "offline"
                              ? theme.palette.mode === "dark"
                                ? "#0C93561A"
                                : "#006C351A"
                              : "background.paper",
                          boxShadow:
                            paymentType === "offline"
                              ? theme.palette.mode === "dark"
                                ? "#0C9356 0 0 0 1px"
                                : `#006C35 0 0 0 1px`
                              : (theme) =>
                                  `${theme.palette.neutral[100]} 0 0 0 1px`,
                        }}
                        onClick={() => setPaymentType("offline")}
                        variant="outlined"
                      >
                        <Box sx={{ width: "100%" }}>
                          <Box
                            sx={{
                              my: -0.5,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <OfflinePin
                                sx={{
                                  mr: 1,
                                  color:
                                    theme.palette.mode === "dark"
                                      ? "#0C9356"
                                      : "#006C35",
                                }}
                              />

                              <Typography variant="subtitle1">
                                {t("Offline")}
                              </Typography>
                            </Box>

                            <Checkbox
                              icon={
                                <CheckBoxOutlineBlankIcon fontSize="small" />
                              }
                              checkedIcon={
                                <CheckBoxIcon
                                  fontSize="small"
                                  sx={{
                                    color:
                                      theme.palette.mode === "dark"
                                        ? "#0C9356"
                                        : "#006C35",
                                  }}
                                />
                              }
                              style={{ marginRight: -8 }}
                              checked={paymentType === "offline"}
                            />
                          </Box>

                          <Typography
                            sx={{ mt: 0.5 }}
                            variant="body2"
                            color="text.secondary"
                          >
                            {t("offline payment description")}
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>
                  )}

                  {(qrOrdering
                    ? menuLocation?.qrOrderingConfiguration?.paymentOptions ===
                        "all" ||
                      menuLocation?.qrOrderingConfiguration?.paymentOptions ===
                        "online"
                    : menuLocation?.qrOrderingConfiguration?.paymentOptions ===
                        "all" ||
                      menuLocation?.qrOrderingConfiguration?.paymentOptions ===
                        "online") && (
                    <Grid item md={12} xs={12}>
                      <Card
                        sx={{
                          px: 2,
                          py: 1.5,
                          display: "flex",
                          alignItems: "center",
                          borderRadius: 2,
                          backgroundColor:
                            paymentType === "online"
                              ? theme.palette.mode === "dark"
                                ? "#0C93561A"
                                : "#006C351A"
                              : "background.paper",
                          boxShadow:
                            paymentType === "online"
                              ? theme.palette.mode === "dark"
                                ? "#0C9356 0 0 0 1px"
                                : `#006C35 0 0 0 1px`
                              : (theme) =>
                                  `${theme.palette.neutral[100]} 0 0 0 1px`,
                        }}
                        onClick={() => {
                          // setPaymentType("online");
                          return toast.success(t("Coming Soon"));
                        }}
                        variant="outlined"
                      >
                        <Box sx={{ width: "100%" }}>
                          <Box
                            sx={{
                              my: -0.5,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <BookOnline
                                sx={{
                                  mr: 1,
                                  color:
                                    theme.palette.mode === "dark"
                                      ? "#0C9356"
                                      : "#006C35",
                                }}
                              />

                              <Typography variant="subtitle1">
                                {t("Online")}
                              </Typography>
                            </Box>

                            <Checkbox
                              icon={
                                <CheckBoxOutlineBlankIcon fontSize="small" />
                              }
                              checkedIcon={
                                <CheckBoxIcon
                                  fontSize="small"
                                  sx={{
                                    color:
                                      theme.palette.mode === "dark"
                                        ? "#0C9356"
                                        : "#006C35",
                                  }}
                                />
                              }
                              style={{ marginRight: -8 }}
                              checked={paymentType === "online"}
                            />
                          </Box>

                          <Typography
                            sx={{ mt: 0.5 }}
                            variant="body2"
                            color="text.secondary"
                          >
                            {t("online payment description")}
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>
                  )}
                </Grid>

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
                      "&:hover": {
                        backgroundColor: "background.paper",
                      },
                    }}
                    aria-label="cart"
                  >
                    <Box
                      sx={{
                        px: 2.5,
                        pb: -1,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            align="left"
                            fontSize="18px"
                            variant="h6"
                            color={
                              theme.palette.mode === "dark" ? "#fff" : "#000"
                            }
                          >
                            {cart.getCartItems()?.length}
                          </Typography>

                          <Typography
                            align="left"
                            fontSize="18px"
                            variant="body1"
                            color={
                              theme.palette.mode === "dark" ? "#fff" : "#000"
                            }
                            sx={{ ml: 1, textTransform: "initial" }}
                          >
                            {t("Items")}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            mt: 0.5,
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "baseline",
                          }}
                        >
                          <Typography
                            align="left"
                            fontSize="16px"
                            variant="body1"
                            color={
                              theme.palette.mode === "dark" ? "#fff" : "#000"
                            }
                            sx={{ textTransform: "initial" }}
                          >
                            {currency}
                          </Typography>

                          <Typography
                            align="left"
                            fontSize="20px"
                            variant="h6"
                            color={
                              theme.palette.mode === "dark" ? "#fff" : "#000"
                            }
                            sx={{ ml: 1 }}
                          >
                            {(checkoutData?.cart?.total || 0)?.toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>

                      <LoadingButton
                        sx={{
                          px: 4.5,
                          py: 1.75,
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "#0C9356"
                              : "#006C35",
                        }}
                        type="submit"
                        loading={loading}
                        variant="contained"
                        onClick={() => {
                          if (
                            !qrOrdering &&
                            !menuLocation?.qrOrderingConfiguration
                              ?.onlineOrdering
                          ) {
                            return toast.error(
                              t("Sorry we are not accepting online order")
                            );
                          }

                          if (
                            qrOrdering &&
                            !menuLocation?.qrOrderingConfiguration?.qrOrdering
                          ) {
                            return toast.error(
                              t("Sorry we are not accepting qr order")
                            );
                          }

                          handleOrderComplete();
                        }}
                        endIcon={
                          isRTL ? (
                            <ArrowBackIcon fontSize="small" />
                          ) : (
                            <ArrowRightIcon fontSize="small" />
                          )
                        }
                        disabled={!paymentType}
                      >
                        {paymentType === "online"
                          ? t("Pay & Order")
                          : t("Place Order")}
                      </LoadingButton>
                    </Box>
                  </Fab>
                </div>
              </Box>
            )}
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default Payment;
