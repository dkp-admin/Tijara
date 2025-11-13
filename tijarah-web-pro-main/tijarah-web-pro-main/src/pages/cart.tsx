import {
  Add,
  ArrowDropDown,
  ArrowForward,
  ChevronLeft,
  ChevronRight,
  Remove,
} from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Fab,
  Grid,
  IconButton,
  Link,
  SvgIcon,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import { GoogleMap, Polygon, useLoadScript } from "@react-google-maps/api";
import Edit02Icon from "@untitled-ui/icons-react/build/esm/Edit02";
import InfoCircle from "@untitled-ui/icons-react/build/esm/InfoCircle";
import { t } from "i18next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import serviceCaller from "src/api/serviceCaller";
import ConfirmationDialog from "src/components/confirmation-dialog";
import { CartCustomizeRepeatDrawer } from "src/components/menu/cart-customize-repeat-drawer";
import { CartModifierDrawer } from "src/components/menu/cart-modifiers-drawer";
import { LocationConfirmation } from "src/components/menu/location-confirmation";
import { CustomerNameAddModal } from "src/components/modals/add-customer-name-modal";
import { Seo } from "src/components/seo";
import EmptyCartAnimation from "src/components/widgets/animations/empty-cart";
import { DEFAULT_LAT_LNG, FRONTEND_URL, GMAP_KEY } from "src/config";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { ArrowRight as ArrowRightIcon } from "src/icons/arrow-right";
import { UserCircle } from "src/icons/user-circle";
import cart from "src/utils/cart";
import { getUpdatedProductStock } from "src/utils/check-updated-product-stock";
import { trigger } from "src/utils/custom-event";
import { trimText } from "src/utils/trim-text";
import { useCurrency } from "src/utils/useCurrency";

const currentDate = new Date();

// Set the time to the start of the day
const startOfDay = new Date(
  Date.UTC(
    currentDate.getUTCFullYear(),
    currentDate.getUTCMonth(),
    currentDate.getUTCDate()
  )
);

// Set the time to the end of the day
const endOfDay = new Date(
  Date.UTC(
    currentDate.getUTCFullYear(),
    currentDate.getUTCMonth(),
    currentDate.getUTCDate(),
    23,
    59,
    59,
    999
  )
);

const Cart = () => {
  const theme = useTheme();
  const router = useRouter();
  const { customer } = useAuth();
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GMAP_KEY,
    libraries: ["places"],
  });
  const { locationRef, companyRef } = router.query as any;
  const currency = window.localStorage.getItem("onlineOrderingCurrency");

  const { find: findAddress, entities: address } =
    useEntity("ordering/address");

  const { find: findCharges, entities: charges } = useEntity("custom-charge");

  const { findOne: findMenuLocation, entity: menuLocation } = useEntity(
    "ordering/menu-config"
  );

  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const [items, setItems] = useState<any[]>([]);
  const [qrOrdering, setQrOrdering] = useState(false);
  const [industry, setIndustry] = useState<"retail" | "restaurant">(null);
  const [orderType, setOrderType] = useState<"pickup" | "delivery">(null);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [cartData, setCartData] = useState<any>(null);
  const [addressData, setAddressData] = useState<any>(null);
  const [showDlievryRangeDialog, setShowDlievryRangeDialog] = useState(false);
  const [openLocationConfirmation, setOpenLocationConfirmation] =
    useState(false);
  const [openCustomerNameModal, setOpenCustomerNameModal] = useState(false);
  const [productData, setProductData] = useState<any>(null);
  const [openModifierDrawer, setOpenModifierDrawer] = useState<boolean>(false);
  const [openCustomizeRepeatDrawer, setOpenCustomizeRepeatDrawer] =
    useState<boolean>(false);

  const sm = useMediaQuery("(max-width:600px)");

  const discountCodeSaved = localStorage.getItem("discountCode");

  const getItemName = (data: any) => {
    let units = "";

    if (data.type === "box") {
      units = `, (${t("Box")} - ${data.noOfUnits} ${t("Units")})`;
    }

    if (data.type === "crate") {
      units = `, (${t("Crate")} - ${data.noOfUnits} ${t("Units")})`;
    }

    const variantNameEn = data.hasMultipleVariants
      ? ` - ${data.variantNameEn}`
      : "";
    const variantNameAr = data.hasMultipleVariants
      ? ` - ${data.variantNameAr}`
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

  const checkItemUpdate = (type: "increment" | "decrement", index: number) => {
    const data = items[index];
    const quantity = type === "increment" ? data.qty + 1 : data.qty - 1;

    if (data.tracking) {
      const stockCount = getUpdatedProductStock(
        data.stockCount,
        data.type,
        data.sku,
        quantity - data.qty,
        false
      );

      if (stockCount < 0) {
        toast.error(t("Looks like the item is out of stock"));
      } else {
        handleUpdateItem(data, index, quantity);
      }
    } else {
      handleUpdateItem(data, index, quantity);
    }
  };

  const handleUpdateItem = (data: any, index: any, quantity: number) => {
    const updatedTotal =
      (Number(data.sellingPrice) + Number(data.vatAmount)) * quantity;

    const item = {
      ...data,
      qty: quantity,
      total: updatedTotal,
    };

    if (quantity === 0) {
      cart.removeFromCart(index, (removedItems: any) => {
        trigger("itemRemoved", null, removedItems, null, null);
      });
    } else {
      cart.updateCartItem(index, item, (updatedItems: any) => {
        trigger("itemUpdated", null, updatedItems, null, null);
      });
    }

    setItems(cart.getCartItems());
  };

  const getCartDataFromAPI = async (
    showToast: boolean = false,
    discount: string = "apply"
  ) => {
    const data = items.map((item: any) => {
      return {
        productRef: item.productRef,
        variant: {
          sku: item.sku,
          type: item.type,
          boxSku: item?.boxSku || "",
          crateSku: item?.crateSku || "",
          boxRef: item?.boxRef ? item.boxRef : null,
          crateRef: item?.crateRef ? item.crateRef : null,
        },
        quantity: item.qty,
        modifiers: item.modifiers?.map((modifier: any) => {
          return {
            modifierRef: modifier.modifierRef,
            modifier: modifier.name,
            optionId: modifier.optionId,
            optionName: modifier.optionName,
          };
        }),
        categoryRef: item.categoryRef,
      };
    });

    try {
      const res = await serviceCaller("/ordering/billing", {
        method: "POST",
        body: {
          items: data,
          companyRef: companyRef || customer?.companyRef,
          locationRef: locationRef || customer?.locationRefs?.[0],
          discount: discount === "apply" ? discountCode : "",
          charges: charges.results.map((charge) => charge?._id) || [],
          startOfDay,
          endOfDay,
          customerRef: customer?._id,
          menuRef: localStorage.getItem("menuRef"),
        },
      });

      const billingDetails = res;

      setCartData(billingDetails);

      if (showToast) {
        if (
          billingDetails?.discount > 0 ||
          billingDetails?.freeItemDiscount > 0
        ) {
          if (discount === "apply") {
            toast.success(t("Discount applied successfully"));
          } else if (discount === "remove") {
            setDiscountCode("");
            localStorage.setItem("discountCode", "");
            toast.success(t("Discount removed successfully"));
          } else {
            toast.error("Please enter a valid discount code");
          }
        } else if (discount === "remove") {
          setDiscountCode("");
          localStorage.setItem("discountCode", "");
          toast.success(t("Discount removed successfully"));
        } else {
          setDiscountCode("");
          localStorage.setItem("discountCode", "");
          toast.error("Please enter a valid discount code");
        }
      }
    } catch (error: any) {
      console.log(error, "ASD:SDLKJAS");
      if (showToast) {
        if (error.code === "INVALID COUPON") {
          setDiscountCode("");
          localStorage.setItem("discountCode", "");
          toast.error(t("Please enter a valid discount code"));
        } else if (error.code === "INVALID DISCOUNT") {
          setDiscountCode("");
          localStorage.setItem("discountCode", "");
          toast.error(t("Please enter a valid promotion code"));
        } else {
          toast.error(error.message);
        }
      }
    }
  };

  const getPolygonCoords = () => {
    const coordinates =
      menuLocation?.qrOrderingConfiguration?.geofencing?.features?.[0]?.geometry
        ?.coordinates;

    if (coordinates?.length > 0) {
      return coordinates.map((coord: any) => {
        return { lat: coord[1], lng: coord[0] };
      });
    } else {
      return [];
    }
  };

  const checkDeliverable = (address: any) => {
    if (address?._id) {
      const isInsidePolygon = isCoordinateInPolygon(address?.coordinates);
      setShowDlievryRangeDialog(!isInsidePolygon);
    }
  };

  const isCoordinateInPolygon = (coordinates: any) => {
    if (!isLoaded || !window.google || !window.google?.maps) {
      console.log(t("Google Maps API is not loaded"));
      return false;
    }

    try {
      const google = window.google;

      const polygonPaths = getPolygonCoords();
      const polygon = new google.maps.Polygon({ paths: polygonPaths });

      const point = new google.maps.LatLng(coordinates.lat, coordinates.lng);

      const isInPolygon = google.maps.geometry.poly.containsLocation(
        point,
        polygon
      );

      return isInPolygon;
    } catch (error) {
      console.log("Error in isPointInPolygon:", error);
      return false;
    }
  };

  useEffect(() => {
    const industry: any = window.localStorage.getItem("industry");
    const qrOrdering = window.localStorage.getItem("qrOrdering");
    const data = JSON.parse(window.localStorage.getItem("checkoutCart"));
    setIndustry(industry || "");
    setQrOrdering(qrOrdering === "true");
    setOrderType(data?.deliveryType || "");
    // setDiscountCode(data?.cart?.discountCode || "");
    if (locationRef && companyRef) {
      findMenuLocation(
        `?locationRef=${
          locationRef || customer?.locationRefs?.[0]
        }&companyRef=${companyRef}`
      );
    }

    if (customer?._id) {
      findAddress({ customerRef: customer._id });
    }

    if (industry === "restaurant" && data?.deliveryType === "delivery") {
      checkDeliverable(addressData);
    }
  }, [locationRef, companyRef, customer]);

  useEffect(() => {
    if (cartData?.discountCode && cartData?.appliedPromotions?.length > 0) {
      const prodSpecificProm = cartData?.appliedPromotions?.filter(
        (promotion: any) => promotion.type === "specific"
      );

      let prodPromotion = prodSpecificProm?.length > 0;

      for (let index = 0; index < prodSpecificProm?.length; index++) {
        const data = items?.find(
          (item: any) => item.productRef === prodSpecificProm[index]?.productRef
        );

        if (!data) {
          prodPromotion = true;
        } else {
          prodPromotion = false;
          return;
        }
      }

      if (prodPromotion) {
        setDiscountCode("");
        getCartDataFromAPI(true, "remove");
      }
    }
  }, [cartData, items]);

  useEffect(() => {
    const itemsArray = cart.getCartItems();

    if (itemsArray?.length > 0) {
      cart.clearCart();
      cart.addItemsToCart(itemsArray, (itm: any) => {
        trigger("itemAdded", null, itm, null, null);
      });
      setItems(cart.getCartItems());
    }
  }, []);

  useEffect(() => {
    findCharges({
      page: 0,
      sort: "asc",
      activeTab: "active",
      limit: 100,
      _q: "",
      companyRef: companyRef,
      applyAutoChargeOnOrders: true,
      channel: orderType,
      locationRef: locationRef || customer?.locationRefs?.[0],
    });
  }, [companyRef, orderType, locationRef, customer]);

  useEffect(() => {
    if (items?.length > 0) {
      getCartDataFromAPI();
    }
  }, [items, charges]);

  useEffect(() => {
    const data = JSON.parse(window.localStorage.getItem("addressData"));

    if (data?._id) {
      setAddressData(data);
    } else if (address?.results?.length > 0) {
      setAddressData(address?.results?.[0]);
    }
  }, [address?.results]);

  useEffect(() => {
    if (discountCodeSaved !== "") {
      setDiscountCode(discountCodeSaved);
    }
  }, [discountCodeSaved]);

  const requestLocationPermission = async () => {
    try {
      // First check if the browser supports geolocation
      if (!navigator.geolocation) {
        toast.error(t("Geolocation is not supported by your browser"));
        return false;
      }

      // Check if permissions API is supported
      if (navigator.permissions && navigator.permissions.query) {
        const permission = await navigator.permissions.query({
          name: "geolocation",
        });

        if (permission.state === "denied") {
          // Show instructions for enabling location in browser settings
          const message = `${t("Location access was previously denied")}. ${t(
            "Please enable location access in your browser settings:"
          )}`;

          toast.error(message, {
            duration: 6000, // Show for longer since there's more text
          });
          return false;
        }
      }

      // Request location
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            localStorage.setItem(
              "currentLocationUser",
              JSON.stringify(position)
            );
            resolve(true);
          },
          (error) => {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                toast.error(t("Location permission was denied"));
                break;
              case error.POSITION_UNAVAILABLE:
                toast.error(t("Location information is unavailable"));
                break;
              case error.TIMEOUT:
                toast.error(t("Location request timed out"));
                break;
              default:
                toast.error(t("An unknown error occurred getting location"));
            }
            resolve(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      });
    } catch (error) {
      console.error("Error requesting location:", error);
      toast.error(t("An error occurred while requesting location"));
      return false;
    }
  };

  return (
    <>
      <Seo title={t("Cart")} />
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
                pb: 1,
                px: { xs: 1.5, sm: 1.5, md: "9%", lg: "23%" },
                flex: "0 0 auto",
                position: "fixed",
                cursor: "pointer",
                width: "100%",
                zIndex: 999,
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
                  <Typography variant="subtitle2">{t("Menu")}</Typography>
                </Link>
              </Box>

              <Box sx={{ pr: "5%" }}>
                <Typography variant="h5" align="center">
                  {t("Cart")}
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

            <Box
              sx={{
                pt: { xs: 5, sm: 5, md: 5.5, lg: 5.5 },
                pb: 10,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {isLoaded && (
                <GoogleMap
                  zoom={12}
                  center={
                    addressData?._id
                      ? {
                          lat: addressData?.coordinates?.lat,
                          lng: addressData?.coordinates?.lng,
                        }
                      : DEFAULT_LAT_LNG
                  }
                >
                  <Polygon
                    paths={getPolygonCoords()}
                    options={{
                      fillColor: "#FF0000",
                      fillOpacity: 0.35,
                      strokeColor: "#FF0000",
                      strokeOpacity: 0.8,
                      strokeWeight: 2,
                    }}
                  />
                </GoogleMap>
              )}

              {items?.length > 0 ? (
                <>
                  <Box
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: "background.paper",
                    }}
                  >
                    {items?.map((itm: any, i: any) => {
                      return (
                        <Box key={i}>
                          <Box
                            sx={{
                              px: 1.5,
                              py: 1.75,
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box
                              sx={{
                                width: "45%",
                                textTransform: "initial",
                              }}
                            >
                              <Typography
                                align="left"
                                fontSize="14px"
                                sx={{ textTransform: "initial" }}
                              >
                                {getItemName(itm)}
                              </Typography>

                              {itm?.modifiers?.length > 0 && (
                                <Typography
                                  align="left"
                                  fontSize="14px"
                                  color="text.secondary"
                                  sx={{ textTransform: "initial" }}
                                >
                                  {trimText(getModifierName(itm), 20)}
                                </Typography>
                              )}

                              {itm?.modifiers?.length > 0 && (
                                <Card
                                  sx={{
                                    mt: 1,
                                    display: "inline-block",
                                    alignItems: "center",
                                    borderRadius: 0,
                                    borderColor: "transparent",
                                  }}
                                  onClick={() => {
                                    setProductData({
                                      data: itm,
                                      index: i,
                                      isAdd: false,
                                    });
                                    setOpenModifierDrawer(true);
                                  }}
                                  variant="outlined"
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <Typography
                                      fontSize="12px"
                                      variant="subtitle1"
                                      color="neutral.500"
                                    >
                                      {t("Customize")}
                                    </Typography>

                                    <ArrowDropDown
                                      fontSize="small"
                                      sx={{
                                        ml: 0.5,
                                        mr: -0.6,
                                        color: (theme) =>
                                          theme.palette.neutral[500],
                                      }}
                                    />
                                  </Box>
                                </Card>
                              )}
                            </Box>

                            <Box
                              sx={{
                                width: "70%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                              }}
                            >
                              <Box
                                sx={{
                                  py: 0.5,
                                  width: sm ? 100 : 100,
                                  borderRadius: 1,
                                  minWidth: "25%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  border:
                                    theme.palette.mode === "dark"
                                      ? "1px solid #0C9356"
                                      : "1px solid #006C35",
                                }}
                              >
                                <Box
                                  sx={{
                                    flex: 1,
                                    display: "flex",
                                    justifyContent: "center",
                                  }}
                                  onClick={() => {
                                    checkItemUpdate("decrement", i);
                                  }}
                                >
                                  <Remove
                                    sx={{
                                      color:
                                        theme.palette.mode === "dark"
                                          ? "#0C9356"
                                          : "#006C35",
                                    }}
                                  />
                                </Box>

                                <Box
                                  sx={{
                                    flex: 1,
                                    display: "flex",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Typography
                                    fontWeight={"bold"}
                                    color={
                                      theme.palette.mode === "dark"
                                        ? "#0C9356"
                                        : "#006C35"
                                    }
                                  >
                                    {itm.qty}
                                  </Typography>
                                </Box>

                                <Box
                                  sx={{
                                    flex: 1,
                                    display: "flex",
                                    justifyContent: "center",
                                  }}
                                  onClick={() => {
                                    if (itm?.modifiers?.length > 0) {
                                      setProductData({
                                        data: itm,
                                        index: i,
                                        isAdd: true,
                                      });
                                      setOpenCustomizeRepeatDrawer(true);
                                    } else {
                                      checkItemUpdate("increment", i);
                                    }
                                  }}
                                >
                                  <Add
                                    sx={{
                                      color:
                                        theme.palette.mode === "dark"
                                          ? "#0C9356"
                                          : "#006C35",
                                    }}
                                  />
                                </Box>
                              </Box>

                              <Box sx={{ ml: 2, width: "30%" }}>
                                <Typography
                                  align="right"
                                  fontSize="14px"
                                  sx={{
                                    textTransform: "initial",
                                  }}
                                >
                                  {currency}
                                </Typography>

                                <Typography
                                  align="right"
                                  fontSize="14px"
                                  sx={{
                                    fontWeight: "bold",
                                    textTransform: "initial",
                                  }}
                                >
                                  {itm.total?.toFixed(2)}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>

                          {items?.length - 1 !== i && <Divider />}
                        </Box>
                      );
                    })}

                    {cartData?.freeItems?.map((itm: any, i: any) => {
                      return (
                        <Box key={i}>
                          <Box
                            sx={{
                              px: 1.5,
                              py: 1.75,
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box
                              sx={{
                                width: "45%",
                                textTransform: "initial",
                              }}
                            >
                              <Typography
                                align="left"
                                fontSize="14px"
                                sx={{ textTransform: "initial" }}
                              >
                                {getItemName(itm)}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                width: "70%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                              }}
                            >
                              <Box
                                sx={{
                                  py: 0.5,
                                  width: sm ? 100 : 100,
                                  borderRadius: 1,
                                  minWidth: "25%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  border: "1px solid #006C35",
                                }}
                              >
                                <Box
                                  sx={{
                                    flex: 1,
                                    display: "flex",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Typography
                                    fontWeight={"bold"}
                                    color="#006C35"
                                  >
                                    {itm.qty}
                                  </Typography>
                                </Box>
                              </Box>

                              <Box sx={{ ml: 2, width: "30%" }}>
                                <Typography
                                  align="right"
                                  fontSize="14px"
                                  sx={{
                                    fontWeight: "bold",
                                    textTransform: "initial",
                                  }}
                                >
                                  {itm?.isQtyFree
                                    ? Number(
                                        itm.total - itm.discountAmount
                                      ).toFixed(2)
                                    : "FREE"}
                                </Typography>

                                <del>
                                  <Typography
                                    align="right"
                                    fontSize="14px"
                                    sx={{
                                      textTransform: "initial",
                                    }}
                                  >
                                    {currency}
                                  </Typography>
                                  <Typography
                                    align="right"
                                    fontSize="14px"
                                    sx={{
                                      fontWeight: "bold",
                                      textTransform: "initial",
                                    }}
                                  >
                                    {itm.total?.toFixed(2)}
                                  </Typography>
                                </del>
                              </Box>
                            </Box>
                          </Box>

                          {items?.length - 1 !== i && <Divider />}
                        </Box>
                      );
                    })}
                  </Box>

                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    name="specialInstructions"
                    sx={{ mt: 1.5, bgcolor: "background.paper" }}
                    label={t("Special Instructions")}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    value={specialInstructions}
                  />

                  {industry !== "restaurant" && !qrOrdering && (
                    <Grid container spacing={1.5}>
                      <Grid item md={12} xs={12}>
                        <Typography
                          align="left"
                          fontSize="16px"
                          variant="body2"
                          sx={{
                            mt: 4,
                            ml: 1,
                            fontWeight: "bold",
                          }}
                          style={{
                            gap: 5,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {t("Delivery Type")}
                        </Typography>
                      </Grid>

                      {(menuLocation?.qrOrderingConfiguration?.deliveryType ===
                        "all" ||
                        menuLocation?.qrOrderingConfiguration?.deliveryType ===
                          "pickup") && (
                        <Grid item md={6} xs={6}>
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
                                    ? "#0C9356 0 0 0 1px"
                                    : "#006C35 0 0 0 1px"
                                  : (theme) =>
                                      `${theme.palette.neutral[100]} 0 0 0 1px`,
                            }}
                            onClick={() => {
                              if (
                                !menuLocation?.pickupDeliveryConfiguration
                                  ?.pickup
                              ) {
                                return toast.error(
                                  t("Sorry we are not accepting pickup order")
                                );
                              }

                              setOrderType("pickup");
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
                                <Typography variant="subtitle1">
                                  {t("Self Pickup")}
                                </Typography>

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
                                  checked={orderType === "pickup"}
                                />
                              </Box>

                              <Typography
                                sx={{ mt: 0.5 }}
                                variant="body2"
                                color="text.secondary"
                              >
                                {t("pickup description")}
                              </Typography>
                            </Box>
                          </Card>
                        </Grid>
                      )}

                      {(menuLocation?.qrOrderingConfiguration?.deliveryType ===
                        "all" ||
                        menuLocation?.qrOrderingConfiguration?.deliveryType ===
                          "delivery") && (
                        <Grid item md={6} xs={6}>
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
                                    ? "#0C9356 0 0 0 1px"
                                    : "#006C35 0 0 0 1px"
                                  : (theme) =>
                                      `${theme.palette.neutral[100]} 0 0 0 1px`,
                            }}
                            onClick={() => {
                              if (
                                !menuLocation?.pickupDeliveryConfiguration
                                  ?.delivery
                              ) {
                                return toast.error(
                                  t("Sorry we are not accepting delivery order")
                                );
                              }

                              checkDeliverable(addressData);
                              setOrderType("delivery");
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
                                <Typography variant="subtitle1">
                                  {t("Delivery")}
                                </Typography>

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
                                  checked={orderType === "delivery"}
                                />
                              </Box>

                              <Typography
                                sx={{ mt: 0.5 }}
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
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                      }}
                    >
                      {t("Personal Details")}
                    </Typography>

                    <Divider sx={{ mt: 1.5 }} />

                    {customer?.name && (
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

                        {customer.name === customer.phone ? (
                          <Button
                            sx={{
                              mr: -2,
                              flex: 1,
                              height: 27,
                              color:
                                theme.palette.mode === "dark"
                                  ? "#0C9356"
                                  : "#006C35",
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                            variant="text"
                            onClick={() => {
                              window.localStorage.setItem(
                                "checkoutCart",
                                JSON.stringify({
                                  cart: cartData,
                                  address: addressData,
                                  deliveryType: orderType,
                                  specialInstructions: specialInstructions,
                                })
                              );
                              setOpenCustomerNameModal(true);
                            }}
                          >
                            {t("Add Name")}
                          </Button>
                        ) : (
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography
                              align="right"
                              fontSize="15px"
                              variant="h6"
                            >
                              {customer.name}
                            </Typography>

                            <IconButton
                              sx={{
                                ml: 2,
                                width: "18px",
                                height: "18px",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                window.localStorage.setItem(
                                  "checkoutCart",
                                  JSON.stringify({
                                    cart: cartData,
                                    address: addressData,
                                    deliveryType: orderType,
                                    specialInstructions: specialInstructions,
                                  })
                                );
                                setOpenCustomerNameModal(true);
                              }}
                            >
                              <SvgIcon>
                                <Edit02Icon fontSize="small" />
                              </SvgIcon>
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    )}

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
                        {customer?.phone || "-"}
                      </Typography>
                    </Box>

                    {orderType === "delivery" && (
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

                        {addressData?._id ? (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                            onClick={() => {
                              window.localStorage.setItem(
                                "checkoutCart",
                                JSON.stringify({
                                  cart: cartData,
                                  address: addressData,
                                  deliveryType: orderType,
                                  specialInstructions: specialInstructions,
                                })
                              );

                              router.push(
                                `${FRONTEND_URL}/addresses?locationRef=${locationRef}`
                              );
                            }}
                          >
                            <Typography
                              align="right"
                              fontSize="15px"
                              variant="h6"
                              sx={{ width: "70%" }}
                            >
                              {addressData?.fullAddress}
                            </Typography>

                            {isRTL ? (
                              <ChevronLeft
                                sx={{
                                  ml: 2,
                                  mr: -1,
                                  color:
                                    theme.palette.mode === "dark"
                                      ? "#0C9356"
                                      : "#006C35",
                                }}
                              />
                            ) : (
                              <ChevronRight
                                sx={{
                                  ml: 2,
                                  mr: -1,
                                  color:
                                    theme.palette.mode === "dark"
                                      ? "#0C9356"
                                      : "#006C35",
                                }}
                              />
                            )}
                          </Box>
                        ) : (
                          <Button
                            sx={{
                              mr: -2,
                              flex: 1,
                              height: 27,
                              color:
                                theme.palette.mode === "dark"
                                  ? "#0C9356"
                                  : "#006C35",
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                            variant="text"
                            onClick={() => {
                              if (customer.name === customer.phone) {
                                toast.error(t("Please add name"));
                                return;
                              }

                              window.localStorage.setItem(
                                "checkoutCart",
                                JSON.stringify({
                                  cart: cartData,
                                  address: addressData,
                                  deliveryType: orderType,
                                  specialInstructions: specialInstructions,
                                })
                              );

                              setOpenLocationConfirmation(true);
                            }}
                          >
                            {t("Add Address")}
                          </Button>
                        )}
                      </Box>
                    )}
                  </Box>

                  <Box
                    sx={{
                      mt: 4,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <TextField
                      fullWidth
                      name="discount"
                      sx={{ borderRadius: 1, bgcolor: "background.paper" }}
                      label={t("Discount code")}
                      onChange={(e) => {
                        localStorage.setItem(
                          "discountCode",
                          e.target.value.replace(/\s/g, "")
                        );
                        setDiscountCode(e.target.value.replace(/\s/g, ""));
                      }}
                      value={discountCode}
                      disabled={cartData?.discountCode}
                    />

                    <Button
                      sx={{ pl: 3 }}
                      variant="text"
                      onClick={() => {
                        if (cartData?.discountCode) {
                          localStorage.setItem("discountCode", "");
                          getCartDataFromAPI(true, "remove");
                        } else {
                          getCartDataFromAPI(true, "apply");
                        }
                      }}
                      color={cartData?.discountCode ? "error" : "primary"}
                      disabled={!discountCode}
                    >
                      {cartData?.discountCode ? t("Remove") : t("Apply")}
                    </Button>
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
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        align="left"
                        fontSize="17px"
                        variant="body2"
                        sx={{ fontWeight: "bold" }}
                      >
                        {t("Bill Details")}
                      </Typography>

                      <Tooltip
                        sx={{ ml: 1 }}
                        title={t("online_ordering_bill_details_info_msg")}
                      >
                        <SvgIcon color="primary">
                          <InfoCircle />
                        </SvgIcon>
                      </Tooltip>
                    </Box>

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
                        {t("Item Total")}
                      </Typography>

                      <Typography
                        align="right"
                        fontSize="16px"
                        variant="subtitle2"
                      >
                        {`${currency} ${(
                          cartData?.subTotalWithoutDiscount || 0
                        )?.toFixed(2)}`}
                      </Typography>
                    </Box>

                    {cartData?.discountCode && (
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
                            {cartData?.discountCode}
                          </Typography>
                        </Box>

                        <Typography
                          align="right"
                          fontSize="16px"
                          color={
                            theme.palette.mode === "dark"
                              ? "#0C9356"
                              : "#006C35"
                          }
                          variant="subtitle2"
                        >
                          {`- ${currency} ${(cartData?.discount || 0)?.toFixed(
                            2
                          )}`}
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
                        {`${currency} ${(cartData?.subTotal || 0)?.toFixed(2)}`}
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
                        {`+ ${currency} ${(cartData?.vatAmount || 0)?.toFixed(
                          2
                        )}`}
                      </Typography>
                    </Box>

                    {cartData?.appliedCharges?.map((charge: any) => {
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
                        pt: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography align="left" fontSize="20px" variant="h6">
                        {t("To Pay")}
                      </Typography>

                      <Typography align="right" fontSize="20px" variant="h6">
                        {`${currency} ${(cartData?.total || 0)?.toFixed(2)}`}
                      </Typography>
                    </Box>
                  </Box>

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
                              {(items?.length || 0) +
                                (cartData?.freeItems?.length || 0)}
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
                              {(cartData?.total || 0)?.toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>

                        <LoadingButton
                          sx={{
                            px: 4.5,
                            py: 1.75,
                            background:
                              theme.palette.mode === "dark"
                                ? "#0C9356"
                                : "#006C35",
                          }}
                          type="submit"
                          loading={false}
                          variant="contained"
                          onClick={async () => {
                            const locationGranted =
                              await requestLocationPermission();

                            if (!locationGranted) {
                              return;
                            }

                            navigator.geolocation.getCurrentPosition(
                              (loc: any) =>
                                localStorage.setItem(
                                  "currentLocationUser",
                                  JSON.stringify(loc)
                                )
                            );

                            const currentLoc = JSON.parse(
                              window.localStorage.getItem("currentLocationUser")
                            );

                            if (!currentLoc) {
                              return toast.error(
                                t(
                                  "Please allow location permission to continue"
                                )
                              );
                            }

                            let userCoords = {
                              lng: currentLoc?.coords?.longitude,
                              lat: currentLoc?.coords?.latitude,
                            };

                            if (
                              !isCoordinateInPolygon(
                                addressData?.coordinates
                              ) &&
                              orderType === "delivery" &&
                              menuLocation?.qrOrderingConfiguration
                                ?.enableGeofencingOnlineOrdering
                            ) {
                              return toast.error(
                                t("Sorry we are not available in your area.")
                              );
                            }

                            if (
                              !isCoordinateInPolygon(userCoords) &&
                              orderType === "pickup" &&
                              menuLocation?.qrOrderingConfiguration
                                ?.enableGeofencingOnlineOrdering
                            ) {
                              return toast.error(
                                t("Sorry we are not available in your area.")
                              );
                            }

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

                            if (!orderType) {
                              toast.error(t("Please select delivery type"));
                              return;
                            }

                            if (customer?.name === customer?.phone) {
                              toast.error(t("Please add name"));
                              return;
                            }

                            if (orderType === "delivery" && !addressData?._id) {
                              toast.error(
                                t("Please select address for delivery order")
                              );
                              return;
                            }

                            if (
                              orderType === "delivery" &&
                              !isCoordinateInPolygon(
                                addressData?.coordinates
                              ) &&
                              menuLocation?.qrOrderingConfiguration
                                ?.enableGeofencingOnlineOrdering
                            ) {
                              toast.error(
                                `${t(
                                  "Selected address is not deliverable"
                                )}. ${t("Please update or change the address")}`
                              );
                              return;
                            }

                            if (!cartData || cartData?.total === 0) {
                              toast.error(
                                t("Billing amount must be greater than 0")
                              );
                              return;
                            }

                            localStorage.removeItem("discountCode");

                            window.localStorage.setItem(
                              "checkoutCart",
                              JSON.stringify({
                                cart: cartData,
                                address: addressData,
                                deliveryType: orderType,
                                specialInstructions: specialInstructions,
                              })
                            );

                            router.push(
                              `${FRONTEND_URL}/payment?locationRef=${locationRef}&companyRef=${companyRef}`
                            );
                          }}
                          endIcon={
                            isRTL ? (
                              <ArrowBackIcon fontSize="small" />
                            ) : (
                              <ArrowRightIcon fontSize="small" />
                            )
                          }
                        >
                          {t("Place Order")}
                        </LoadingButton>
                      </Box>
                    </Fab>
                  </div>
                </>
              ) : (
                <Box sx={{ mt: 1, mb: 4 }}>
                  <EmptyCartAnimation
                    text={
                      <Typography
                        variant="h5"
                        textAlign="center"
                        sx={{ mt: 1 }}
                      >
                        {t("No Items!")}
                      </Typography>
                    }
                  />
                </Box>
              )}
            </Box>
          </Container>
        </Box>
      </Box>

      {openCustomizeRepeatDrawer && (
        <CartCustomizeRepeatDrawer
          open={openCustomizeRepeatDrawer}
          handleClose={() => {
            setProductData(null);
            setOpenCustomizeRepeatDrawer(false);
          }}
          handleChoose={() => {
            setItems(cart.getCartItems());
            setOpenCustomizeRepeatDrawer(false);
            getCartDataFromAPI();
            setProductData(null);
          }}
          handleRepeatLast={() => {
            checkItemUpdate("increment", productData?.index);
            setOpenCustomizeRepeatDrawer(false);
            setProductData(null);
          }}
          product={productData}
        />
      )}

      {openModifierDrawer && (
        <CartModifierDrawer
          open={openModifierDrawer}
          handleClose={() => {
            setProductData(null);
            setOpenModifierDrawer(false);
          }}
          handleSuccess={() => {
            setItems(cart.getCartItems());
            setOpenModifierDrawer(false);
            getCartDataFromAPI();
            setProductData(null);
          }}
          product={productData}
        />
      )}

      {openCustomerNameModal && (
        <CustomerNameAddModal
          customerRef={customer._id}
          customerName={customer.name === customer.phone ? "" : customer.name}
          open={openCustomerNameModal}
          handleClose={() => {
            setOpenCustomerNameModal(false);
          }}
        />
      )}

      {openLocationConfirmation && (
        <LocationConfirmation
          data={{ id: "", locationRef: locationRef }}
          open={openLocationConfirmation}
          handleClose={() => {
            setOpenLocationConfirmation(false);
          }}
          handleSuccess={() => {
            const data = JSON.parse(window.localStorage.getItem("addressData"));
            setAddressData(data);
            setOpenLocationConfirmation(false);
          }}
        />
      )}

      <ConfirmationDialog
        show={showDlievryRangeDialog}
        toggle={() => setShowDlievryRangeDialog(!showDlievryRangeDialog)}
        onOk={() => {
          setShowDlievryRangeDialog(false);
        }}
        okButtonPrimaryColor
        okButtonText={t("OK")}
        title={t("Order delivery range!")}
        text={t(
          "We apologize, but it seems that your location is currently out of our delivery range. We're continuously expanding our service areas, so please check back in the future. Thank you for your understanding."
        )}
      />
    </>
  );
};

export default Cart;
