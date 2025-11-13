import {
  ArrowForward,
  BreakfastDiningOutlined,
  CallOutlined,
  Clear,
  DeliveryDiningOutlined,
  LocationCityOutlined,
  RestaurantMenu,
} from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Button,
  Card,
  Container,
  Fab,
  IconButton,
  Input,
  Link,
  ListItemText,
  Menu as MaterialMenu,
  MenuItem,
  MenuList,
  Stack,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchMdIcon from "@untitled-ui/icons-react/build/esm/SearchMd";
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
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CustomerAuthModal } from "src/components/menu/customer-auth-modal";
import { MenuProductItem } from "src/components/menu/menu-product-item";
import { Seo } from "src/components/seo";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import LoaderAnimation from "src/components/widgets/animations/loader";
import RestaurantClosedAnimation from "src/components/widgets/animations/restaurant-closed";
import { FRONTEND_URL } from "src/config";
import { CartContextProvider } from "src/contexts/cart-context";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { UserCircle } from "src/icons/user-circle";
import cart from "src/utils/cart";
import { trigger } from "src/utils/custom-event";
import { useDebounce } from "use-debounce";

const MenuRestaurant = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user, customer } = useAuth();
  const searchParams = useSearchParams();
  const { findOne: findMenu, entity: menu } = useEntity("menu-management/menu");
  const { findOne, entity } = useEntity("ordering/menu-config");
  const currency = window.localStorage.getItem("onlineOrderingCurrency");
  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const [groupedData, setgroupedData] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalItem, setTotalItem] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [openCustomerAuthModal, setOpenCustomerAuthModal] =
    useState<boolean>(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [showSearch, setShowSearch] = useState(false);
  const [showOrderType, setShowOrderType] = useState(false);
  const [orderType, setOrderType] = useState<"pickup" | "delivery">(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (searchParams.get("locationRef") && orderType) {
      findMenu(
        `?_q=${debouncedQuery}&orderType=${orderType}&locationRef=${searchParams.get(
          "locationRef"
        )}&companyRef=${searchParams.get("companyRef")}`
      );
    }
  }, [
    searchParams.get("locationRef"),
    searchParams.get("companyRef"),
    debouncedQuery,
    orderType,
  ]);

  useEffect(() => {
    window.localStorage.setItem("industry", "restaurant");
    window.localStorage.setItem("qrOrdering", "false");
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get("locationRef") && searchParams.get("companyRef")) {
      findOne(
        `?locationRef=${searchParams.get(
          "locationRef"
        )}&companyRef=${searchParams.get("companyRef")}`
      );
    }
  }, [searchParams.get("locationRef"), , searchParams.get("companyRef")]);

  const groupByMenu = () => {
    if (!menu?.results) {
      setLoading(false);
    }

    return menu?.results?.products?.reduce((product: any, item: any) => {
      const categoryRef = item.categoryRef;
      const category = menu?.results?.categories?.find(
        (category: any) => category.categoryRef === categoryRef
      );

      if (!product[categoryRef]) {
        product[categoryRef] = {
          category: {
            name: {
              en: category?.name?.en || item.name.en,
              ar: category?.name?.ar || item.name.ar,
            },
          },
          products: [],
        };
      }

      product[categoryRef].products.push(item);

      return product;
    }, {});
  };

  useEffect(() => {
    const data = groupByMenu();
    setgroupedData(data as any);
    localStorage.setItem("menuRef", menu?.results?._id);
  }, [menu?.results]);

  useEffect(() => {
    if (groupedData && Object.values(groupedData)?.length > 0) {
      setLoading(false);
    }
  }, [groupedData]);

  useEffect(() => {
    if (entity) {
      setLoading(false);
    }
  }, [entity]);

  const sm = useMediaQuery("(max-width:600px)");
  const md = useMediaQuery("(max-width:900px)");
  const lg = useMediaQuery("(max-width:1200px)");
  const xl = useMediaQuery("(max-width:1400px)");
  const xxl = useMediaQuery("(max-width:1400px)");

  const totalProducts = (products: any[]) => {
    let count = 0;

    products?.map((product: any) => {
      const variants = product?.variants?.filter(
        (v: any) =>
          !v?.nonSaleable &&
          v?.unit === "perItem" &&
          v?.prices?.find(
            (p: any) =>
              p?.locationRef === searchParams.get("locationRef") &&
              Number(p?.price || 0) > 0
          )
      );

      if (
        variants?.length > 0 ||
        product?.boxRefs?.length > 0 ||
        product?.crateRefs?.length > 0
      ) {
        count += 1;
      }
    });

    return count;
  };

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

  const handleSmoothScroll = (id: any) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleQueryChange = (event: any): void => {
    event.preventDefault();
    if (event?.target?.value !== undefined) {
      setQueryText(event?.target?.value?.trimStart() as string);
    }
  };

  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  useEffect(() => {
    window.localStorage.setItem("industry", "restaurant");

    const data = JSON.parse(window.localStorage.getItem("checkoutCart"));

    setOrderType(data?.deliveryType || "");

    const itemsArray = cart.getCartItems();

    if (itemsArray?.length > 0) {
      cart.clearCart();
      cart.addItemsToCart(itemsArray, (itm: any) => {
        trigger("itemAdded", null, itm, null, null);
      });
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate the scroll position
      const threshold = -10;
      const card = document.querySelector(".MuiCard-root");
      if (!card) return;

      const cardRect = card.getBoundingClientRect();
      const isBelowThreshold = cardRect.top <= threshold;

      // Update state to show/hide below text
      setShowOrderType(isBelowThreshold);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <Seo title={t("Restaurant Menu")} />

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "neutral.800" : "neutral.50",
            mb: "120px",
            mt: "40px",
          }}
        >
          <Container maxWidth="md">
            {restaurantOpen && groupedData && menu?.results && (
              <div>
                <Fab
                  onClick={handleClick}
                  sx={{
                    position: "fixed",
                    bottom: totalItem > 0 && totalAmount > 0 ? "12%" : "3%",
                    right: sm
                      ? "8%"
                      : md
                      ? "10%"
                      : lg
                      ? "12%"
                      : xl
                      ? "16%"
                      : xxl
                      ? "20%"
                      : "28%",
                    height: "80px",
                    width: "80px",
                    backgroundColor: "#000",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "100%",
                    cursor: "pointer",
                  }}
                  color="primary"
                  aria-label="add"
                >
                  <RestaurantMenu />
                  <Typography
                    fontSize="14px"
                    sx={{ mt: 0.5, fontWeight: "bold" }}
                  >
                    {t("MENU")}
                  </Typography>
                </Fab>
                <MaterialMenu
                  anchorEl={anchorEl}
                  open={open}
                  id="basic-menu"
                  onClose={handleClose}
                  onClick={handleClose}
                  PaperProps={{
                    elevation: 5,
                    sx: {
                      filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.2))",
                    },
                  }}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "top" }}
                >
                  <MenuList sx={{ minWidth: 300, maxWidth: "100%" }}>
                    {groupedData &&
                      Object.values(groupedData)?.map((mod: any, i: number) => {
                        const productCount = totalProducts(mod?.products);

                        if (productCount === 0) {
                          return;
                        }

                        return (
                          <Link
                            key={i}
                            sx={{ width: "100%" }}
                            href={`#menu-${i}`}
                            color="inherit"
                            style={{ textDecoration: "none" }}
                            onClick={() => handleSmoothScroll(`menu-${i}`)}
                          >
                            <MenuItem>
                              <ListItemText>
                                {`${
                                  isRTL
                                    ? mod?.category?.name?.ar
                                    : mod?.category?.name?.en
                                } (${productCount})`}
                              </ListItemText>
                            </MenuItem>
                          </Link>
                        );
                      })}
                  </MenuList>
                </MaterialMenu>
              </div>
            )}

            {restaurantOpen && totalItem > 0 && totalAmount > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Fab
                  onClick={() => {
                    if (
                      user?._id &&
                      customer?.companyRef === searchParams.get("companyRef") &&
                      customer?.locationRefs?.[0] ===
                        searchParams.get("locationRef")
                    ) {
                      if (user?.userType !== "app:customer") {
                        return toast.error(
                          t("Merchant users can't place orders")
                        );
                      }

                      router.push(
                        `${FRONTEND_URL}/cart?locationRef=${searchParams.get(
                          "locationRef"
                        )}&companyRef=${searchParams.get("companyRef")}`
                      );
                    } else {
                      setOpenCustomerAuthModal(true);
                    }
                  }}
                  sx={{
                    position: "fixed",
                    bottom: "3%",
                    height: "65px",
                    width: { xs: "90%", sm: "90%", md: "50%", lg: "50%" },
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "10px",
                    cursor: "pointer",
                    background:
                      theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
                  }}
                  color="primary"
                  aria-label="cart"
                >
                  <Box
                    sx={{
                      pl: 2,
                      pr: 2,
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography
                        align="left"
                        fontSize="14px"
                        sx={{ textTransform: "initial" }}
                      >
                        {`${totalItem} ${t(
                          "Items"
                        )} | ${currency} ${totalAmount?.toFixed(2)}`}
                      </Typography>

                      <Typography
                        align="left"
                        fontSize="14px"
                        sx={{ mt: 0.25, textTransform: "initial" }}
                      >
                        {t("Extra charges may apply")}
                      </Typography>
                    </Box>

                    <Typography
                      align="right"
                      fontSize="14px"
                      sx={{ fontWeight: "bold", textTransform: "initial" }}
                    >
                      {t("View Cart")}
                    </Typography>
                  </Box>
                </Fab>
              </div>
            )}

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
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "neutral.800" : "neutral.50",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ maxWidth: "80%", cursor: "pointer" }}>
                  <Link
                    color="textPrimary"
                    component="a"
                    sx={{
                      alignItems: "flex-start",
                      display: "flex",
                    }}
                    onClick={() => {
                      router.back();
                    }}
                  >
                    {isRTL ? (
                      <ArrowForward
                        fontSize="medium"
                        sx={{ mr: 1, fontSize: 22 }}
                      />
                    ) : (
                      <ArrowBackIcon
                        fontSize="medium"
                        sx={{ mr: 1, fontSize: 22 }}
                      />
                    )}

                    <Stack>
                      <Typography variant="h6">
                        {isRTL
                          ? entity?.company?.name?.ar
                          : entity?.company?.name?.en}
                      </Typography>

                      {showOrderType && (
                        <Typography
                          sx={{ mt: 0.5, textTransform: "capitalize" }}
                          variant="subtitle2"
                          color="text.secondary"
                        >
                          {orderType}
                        </Typography>
                      )}
                    </Stack>
                  </Link>
                </Box>

                <Box
                  sx={{
                    top: -8,
                    right: 0,
                    position: "absolute",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <SvgIcon style={{ width: 22, height: 22, marginRight: 12 }}>
                    <SearchMdIcon onClick={() => setShowSearch(!showSearch)} />
                  </SvgIcon>

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
                        marginTop: 5,
                        marginRight: 8,
                      }}
                    >
                      <UserCircle />
                    </SvgIcon>
                  </Box>
                </Box>
              </Box>

              {showSearch && restaurantOpen && (
                <Stack
                  alignItems="center"
                  component="form"
                  direction="row"
                  onSubmit={handleQueryChange}
                  spacing={1}
                  sx={{ mt: 1, width: "100%" }}
                >
                  <Stack
                    alignItems="center"
                    component="form"
                    direction="row"
                    spacing={2}
                    sx={{
                      px: 2,
                      py: 1.25,
                      width: "85%",
                      borderRadius: 1,
                      bgcolor: "background.paper",
                    }}
                  >
                    <SvgIcon>
                      <SearchMdIcon />
                    </SvgIcon>

                    <Input
                      disableUnderline
                      fullWidth
                      value={queryText}
                      placeholder={t("Search item with name")}
                      sx={{ flexGrow: 1 }}
                      onChange={(e) => {
                        handleQueryChange(e);
                      }}
                      onKeyPress={handleKeyPress}
                    />
                    {queryText && (
                      <IconButton
                        sx={{ width: 27, height: 27, bgcolor: "neutral.300" }}
                        onClick={() => setQueryText("")}
                      >
                        <Clear
                          sx={{ width: 18, height: 18 }}
                          fontSize="small"
                        />
                      </IconButton>
                    )}
                  </Stack>

                  <Button
                    sx={{
                      color:
                        theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
                    }}
                    variant="text"
                    onClick={() => {
                      setQueryText("");
                      setShowSearch(false);
                    }}
                  >
                    {t("Cancel")}
                  </Button>
                </Stack>
              )}
            </Box>

            {!loading ? (
              <>
                <Box
                  sx={{
                    mt: -1,
                    pt: {
                      xs: showSearch ? 12 : 4,
                      sm: showSearch ? 12 : 4,
                      md: showSearch ? 14 : 5,
                      lg: showSearch ? 14 : 5,
                    },
                    pb: 10,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Card
                    sx={{
                      mb: 3,
                      px: 2,
                      py: 1.5,
                      borderRadius: 2,
                      backgroundColor: "background.paper",
                      boxShadow: (theme: any) =>
                        `${theme.palette.neutral[100]} 0 0 0 1px`,
                    }}
                  >
                    <Typography variant="h5">
                      {isRTL ? entity?.name?.ar : entity?.name?.en}
                    </Typography>

                    <Stack sx={{ mt: 1.25 }} spacing={1} direction="row">
                      {orderType === "pickup" ? (
                        <BreakfastDiningOutlined
                          sx={{
                            width: 20,
                            height: 20,
                            color:
                              theme.palette.mode === "dark"
                                ? "#0C9356"
                                : "#006C35",
                          }}
                        />
                      ) : (
                        <DeliveryDiningOutlined
                          sx={{
                            width: 23,
                            height: 23,
                            color:
                              theme.palette.mode === "dark"
                                ? "#0C9356"
                                : "#006C35",
                          }}
                        />
                      )}

                      <Typography
                        sx={{ textTransform: "capitalize" }}
                        variant="h6"
                        color={
                          theme.palette.mode === "dark" ? "#0C9356" : "#006C35"
                        }
                      >
                        {orderType}
                      </Typography>
                    </Stack>

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
                        {entity?.address}
                      </Typography>
                    </Stack>
                  </Card>

                  {!restaurantOpen ? (
                    <Box sx={{ mt: "8vh" }}>
                      <RestaurantClosedAnimation />
                    </Box>
                  ) : groupedData && Object.values(groupedData)?.length > 0 ? (
                    Object.values(groupedData)?.map((itm: any, i: any) => {
                      const productCount = totalProducts(itm?.products);

                      if (productCount === 0) {
                        return;
                      }

                      return (
                        <React.Fragment key={i}>
                          <span
                            id={`menu-${i}`}
                            style={{ marginTop: "-70px" }}
                          />
                          <Box
                            sx={{
                              mt: "70px",
                              mb: 2.5,
                              ml: -2,
                              mr: -2,
                              bgcolor: "background.paper",
                            }}
                          >
                            <Box
                              sx={{
                                top: showSearch ? "130px" : "70px",
                                position: "sticky",
                                bgcolor: "background.paper",
                                backdropFilter: "blur(6px)",
                              }}
                            >
                              <Typography
                                sx={{ px: 1.75, pb: 1, pt: 1.5 }}
                                variant="h5"
                              >
                                {isRTL
                                  ? itm?.category?.name?.ar
                                  : itm?.category?.name?.en}{" "}
                                ({productCount})
                              </Typography>
                            </Box>

                            {itm?.products?.map((prod: any, index: any) => {
                              return (
                                <Box key={index}>
                                  <CartContextProvider>
                                    <MenuProductItem
                                      length={
                                        itm?.products?.length - 1 === index
                                      }
                                      productlist={prod}
                                      locationRef={searchParams.get(
                                        "locationRef"
                                      )}
                                      handleCartItem={(item: number) =>
                                        setTotalItem(item)
                                      }
                                      handleCartTotal={(total: number) =>
                                        setTotalAmount(total)
                                      }
                                    />
                                  </CartContextProvider>
                                </Box>
                              );
                            })}
                          </Box>
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <Box sx={{ mt: 12, mb: 4 }}>
                      <NoDataAnimation
                        text={
                          <Typography
                            variant="h6"
                            textAlign="center"
                            sx={{ mt: 2 }}
                          >
                            {t("No Products!")}
                          </Typography>
                        }
                      />
                    </Box>
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

      {openCustomerAuthModal && (
        <CustomerAuthModal
          open={openCustomerAuthModal}
          locationRef={searchParams.get("locationRef")}
          handleClose={() => {
            setOpenCustomerAuthModal(false);
          }}
          handleSuccess={() => {
            router.push(
              `${FRONTEND_URL}/cart?locationRef=${searchParams.get(
                "locationRef"
              )}&companyRef=${searchParams.get("companyRef")}`
            );
            setOpenCustomerAuthModal(false);
          }}
        />
      )}
    </>
  );
};

export default MenuRestaurant;
