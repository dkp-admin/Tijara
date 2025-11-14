import { Add, Remove } from "@mui/icons-material";
import {
  Card,
  CardContent,
  Divider,
  Drawer,
  Grid,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import serviceCaller from "src/api/serviceCaller";
import useItems from "src/hooks/use-items";
import cart from "src/utils/cart";
import {
  checkNotBillingProduct,
  getUpdatedProductStock,
} from "src/utils/check-updated-product-stock";
import { getUnitName } from "src/utils/constants";
import { trigger } from "src/utils/custom-event";
import { getItemSellingPrice, getItemVAT } from "src/utils/get-price";
import { trimText } from "src/utils/trim-text";
import { ModifierCustomisationDrawer } from "./modifier-customisation-drawer";
import { ModifierDrawer } from "./modifiers-drawer";
import { useCurrency } from "src/utils/useCurrency";

interface VariantDrawerProps {
  open: boolean;
  handleClose: any;
  productlist: any;
  locationRef: any;
}

export const VariantDrawer: React.FC<VariantDrawerProps> = ({
  open = false,
  handleClose,
  productlist,
  locationRef,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { items } = useItems();
  const sm = useMediaQuery("(max-width:600px)");
  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const [boxes, setBoxes] = useState<any[]>([]);
  const [crates, setCrates] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [openModifierDrawer, setOpenModifierDrawer] = useState<boolean>(false);
  const [openModifierCustomiseDrawer, setOpenModifierCustomiseDrawer] =
    useState<boolean>(false);
  const currency =
    window.localStorage.getItem("onlineOrderingCurrency") || "SAR";

  console.log(currency, "CURRENCY");

  const getVariantPrice = (item: any) => {
    return `${currency} ${Number(item?.price)?.toFixed(2)}`;
  };

  const getBoxCratePrice = (item: any) => {
    return `${currency} ${Number(
      item?.price || item?.prices?.[0]?.price || 0
    )?.toFixed(2)}`;
  };

  const getAvailablityText = (stocks: any) => {
    const available = stocks ? stocks.availability : true;
    const tracking = stocks ? stocks.tracking : false;
    const stockCount = stocks?.count;
    const lowStockAlert = stocks ? stocks.lowStockAlert : false;
    const lowStockCount = stocks?.lowStockCount;

    if (!available || (tracking && stockCount < 1)) {
      return t("Out of Stock");
    } else {
      if (lowStockAlert && stockCount <= lowStockCount) {
        return t("Running Low");
      } else {
        return "";
      }
    }
  };

  const getTextColor = (stocks: any) => {
    const available = stocks ? stocks.availability : true;
    const tracking = stocks ? stocks.tracking : false;
    const stockCount = stocks?.count;
    const lowStockAlert = stocks ? stocks.lowStockAlert : false;
    const lowStockCount = stocks?.lowStockCount;

    if (!available || (tracking && stockCount < 1)) {
      return "error";
    } else {
      if (lowStockAlert && stockCount <= lowStockCount) {
        return "#F58634";
      } else {
        return "";
      }
    }
  };

  const getActiveModifiers = () => {
    const activeModifiers = productlist?.modifiers?.filter(
      (modifier: any) => modifier.status === "active"
    );

    return activeModifiers?.length > 0;
  };

  const handleVariantClicked = (variant: any) => {
    const priceData = variant.prices?.find(
      (price: any) => price?.locationRef === locationRef
    );

    const stockConfig = variant.stockConfiguration?.find(
      (stock: any) => stock?.locationRef === locationRef
    );

    if (checkNotBillingProduct(variant, locationRef, false, false)) {
      toast.error(t("Looks like the item is out of stock"));
      return;
    }

    const variantData = {
      _id: variant._id,
      image: variant.image,
      name: variant.name,
      type: variant.type || "item",
      sku: variant.sku,
      parentSku: variant?.parentSku || "",
      boxSku: "",
      crateSku: "",
      boxRef: "",
      crateRef: "",
      unit: variant?.unit || "perItem",
      unitCount: 1,
      costPrice: priceData?.costPrice || 0,
      price: priceData?.price || variant?.price,
      availability: stockConfig ? stockConfig.availability : true,
      tracking: stockConfig ? stockConfig.tracking : false,
      count: stockConfig?.count ? stockConfig.count : 0,
    };

    if (productlist?.modifiers?.length > 0 && getActiveModifiers()) {
      setSelectedVariant(variantData);
      setOpenModifierDrawer(true);
    } else {
      handleAdd(variantData);
    }
  };

  const handleBoxCrateClicked = (item: any, variant: any) => {
    const priceData = item.prices?.find(
      (price: any) => price?.locationRef === locationRef
    );

    const stockConfig = item?.stockConfiguration?.find(
      (stock: any) => stock?.locationRef === locationRef
    );

    if (item.status === "inactive") {
      toast.error(
        item.type === "box"
          ? t("Box are disabled for billing")
          : t("Crate are disabled for billing")
      );
      return;
    }

    if (item.nonSaleable) {
      toast.error(
        item.type === "box"
          ? t("Box are not for sale")
          : t("Crate are not for sale")
      );
      return;
    }

    if (checkNotBillingProduct(item, locationRef, false, false)) {
      toast.error(t("Looks like the item is out of stock"));
      return;
    }

    const variantData = {
      _id: item._id,
      image: variant.image,
      name: variant.name,
      type: item.type,
      sku: item.type === "crate" ? item.crateSku : item.boxSku,
      parentSku: item?.productSku || "",
      boxSku: item.boxSku,
      crateSku: item.type === "crate" ? item.crateSku : "",
      boxRef: item.type === "crate" ? item.boxRef : item._id,
      crateRef: item.type === "crate" ? item._id : "",
      unit: "perItem",
      unitCount: item.qty,
      costPrice: priceData?.costPrice || item?.costPrice || 0,
      price: priceData?.price || item?.price,
      availability: stockConfig ? stockConfig.availability : true,
      tracking: stockConfig ? stockConfig.tracking : false,
      count: stockConfig?.count ? stockConfig.count : 0,
    };

    if (productlist?.modifiers?.length > 0 && getActiveModifiers()) {
      setSelectedVariant(variantData);
      setOpenModifierDrawer(true);
    } else {
      handleAdd(variantData);
    }
  };

  const handleAdd = (variant: any) => {
    const { _id, contains, categoryRef, category, tax, variants, name } =
      productlist;

    const localItems = cart.getCartItems() || [];
    const idx = localItems.findIndex((item: any) => item.sku === variant.sku);

    if (idx !== -1) {
      const updatedQty = localItems[idx].qty + 1;
      const updatedTotal =
        (localItems[idx].sellingPrice + localItems[idx].vatAmount) * updatedQty;

      cart.updateCartItem(
        idx,
        {
          ...localItems[idx],
          qty: updatedQty,
          total: updatedTotal,
        },
        (updatedItems: any) => {
          trigger("itemUpdated", null, updatedItems, null, null);
        }
      );

      return;
    }

    const item = {
      productRef: _id,
      contains: contains,
      categoryRef: categoryRef || "",
      image: variant.image || productlist.image || "",
      name: { en: name.en, ar: name.ar },
      category: { name: category.name },
      costPrice: variant?.costPrice || 0,
      sellingPrice: getItemSellingPrice(variant?.price, tax.percentage),
      variantNameEn: variant.name.en,
      variantNameAr: variant.name.ar,
      type: variant.type || "item",
      sku: variant.sku,
      parentSku: variant?.parentSku || "",
      boxSku: variant?.boxSku || "",
      crateSku: variant?.crateSku || "",
      boxRef: variant?.boxRef || "",
      crateRef: variant?.crateRef || "",
      vat: Number(tax.percentage),
      vatAmount: getItemVAT(variant?.price, tax.percentage),
      qty: 1,
      hasMultipleVariants: variants.length > 1,
      total: Number(variant?.price),
      unit: variant.unit || "perItem",
      noOfUnits: Number(variant?.unitCount || 1),
      note: "",
      availability: variant.availability,
      tracking: variant.tracking,
      stockCount: variant.count,
      modifiers: [] as any,
      productModifiers: productlist?.modifiers,
    };

    cart.addToCart(item, (items: any) => {
      trigger("itemAdded", null, items, null, null);
    });
  };

  const checkItemUpdate = (type: "increment" | "decrement", sku: string) => {
    const idx = items.findIndex(
      (item: any) => item.productRef === productlist._id && item.sku === sku
    );

    if (idx >= 0) {
      const data = items[idx];
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
          handleUpdateItem(data, idx, quantity);
        }
      } else {
        handleUpdateItem(data, idx, quantity);
      }
    }
  };

  const handleUpdateItem = (data: any, index: any, quantity: number) => {
    const updatedTotal =
      (Number(data.sellingPrice) + Number(data.vatAmount)) * quantity;

    const item = {
      qty: quantity,
      note: "",
      name: data.name,
      unit: data?.unit || "perItem",
      costPrice: data.costPrice,
      sellingPrice: data.sellingPrice,
      vatAmount: data.vatAmount,
      total: updatedTotal,
      productRef: data.productRef,
      categoryRef: data.categoryRef,
      category: { name: data.category.name },
      image: data.image,
      variantNameEn: data.variantNameEn,
      variantNameAr: data.variantNameAr,
      hasMultipleVariants: data.hasMultipleVariants,
      type: data.type,
      sku: data.sku,
      parentSku: data.parentSku,
      boxSku: data.boxSku,
      crateSku: data.crateSku,
      boxRef: data.boxRef,
      crateRef: data.crateRef,
      vat: data.vat,
      noOfUnits: data.noOfUnits,
      isOpenItem: data?.isOpenItem,
      isOpenPrice: data?.isOpenPrice,
      availability: data.availability,
      tracking: data.tracking,
      stockCount: data.stockCount,
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
  };

  const handleModifiers = (
    type: "increment" | "decrement",
    variant: any,
    priceData: any,
    stockConfig: any
  ) => {
    const prod = items.filter(
      (item: any) =>
        item.productRef === productlist?._id && item.sku === variant?.sku
    );

    if (prod?.length > 1 && type === "increment") {
      setSelectedVariant({
        _id: variant._id,
        image: variant.image,
        name: variant.name,
        type: variant.type,
        sku: variant.sku,
        parentSku: variant?.parentSku || "",
        boxSku: variant?.boxSku || "",
        crateSku: variant?.crateSku || "",
        boxRef: variant?.boxRef || "",
        crateRef: variant?.crateRef || "",
        unit: variant?.unit || "perItem",
        unitCount: variant.unitCount || 1,
        costPrice: priceData?.costPrice || 0,
        price: priceData?.price || variant?.price,
        availability: stockConfig ? stockConfig.availability : true,
        tracking: stockConfig ? stockConfig.tracking : false,
        count: stockConfig?.count ? stockConfig.count : 0,
      });

      setOpenModifierCustomiseDrawer(true);
      return;
    }

    checkItemUpdate(type, variant.sku);
  };

  const getQuantity = (sku: string) => {
    const quantity = items
      ?.filter((item: any) => item.sku === sku)
      .reduce((pc: number, item: any) => pc + item?.qty, 0);

    return quantity || 0;
  };

  const showVariants = () => {
    const variants = productlist?.variants?.filter(
      (v: any) =>
        !v?.nonSaleable &&
        v?.unit === "perItem" &&
        v?.prices?.find(
          (p: any) =>
            p?.locationRef === locationRef && Number(p?.price || 0) > 0
        )
    );

    return variants?.length > 0;
  };

  const getBoxesCrates = async () => {
    if (productlist.boxRefs?.length > 0 || productlist.crateRefs?.length > 0) {
      const res = await serviceCaller(`/ordering/boxes-crates`, {
        method: "GET",
        query: {
          _q: "",
          page: 0,
          limit: 100,
          sort: "asc",
          activeTab: "active",
          productRef: productlist._id,
          companyRef: productlist.companyRef,
        },
      });

      const boxes = res?.results?.filter((data: any) => data.type === "box");
      const crates = res?.results?.filter((data: any) => data.type === "crate");

      if (boxes?.length > 0) {
        setBoxes(boxes);
      } else {
        setBoxes([]);
      }

      if (crates?.length > 0) {
        setCrates(crates);
      } else {
        setCrates([]);
      }
    }
  };

  useEffect(() => {
    if (open) {
      getBoxesCrates();
    }
  }, [open]);

  return (
    <>
      <Drawer
        open={open}
        onClose={() => {
          handleClose();
        }}
        anchor="bottom"
        PaperProps={{
          sx: {
            marginLeft: {
              xs: "ovw",
              sm: "ovw",
              md: "10vw",
              lg: "10vw",
            },
            marginRight: {
              xs: "ovw",
              sm: "ovw",
              md: "10vw",
              lg: "10vw",
            },
            maxHeight: {
              xs: "calc(100vh - 10vh)",
              sm: "calc(100vh - 10vh)",
              md: "calc(100vh - 12vh)",
              lg: "calc(100vh - 12vh)",
            },
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          },
        }}
      >
        <Box
          sx={{ width: "auto", p: 2 }}
          role="presentation"
          onClick={handleClose}
          onKeyDown={handleClose}
        >
          <Box
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <XCircle
              fontSize="small"
              onClick={() => {
                handleClose();
              }}
              style={{ cursor: "pointer" }}
            />
          </Box>
        </Box>

        <Box sx={{ flex: 1, pl: "20px" }}>
          <Typography
            variant="h6"
            fontWeight={"normal"}
            style={{
              textTransform: "capitalize",
            }}
          >
            {isRTL ? productlist?.name.ar : productlist?.name.en}
          </Typography>

          <Typography
            variant="h4"
            sx={{ mt: 1 }}
            style={{
              textTransform: "capitalize",
            }}
          >
            {t("Customise as you want")}
          </Typography>
        </Box>

        <Divider sx={{ mt: 1.5 }} />

        <Box
          sx={{ mb: 2 }}
          style={{
            flex: "1 1 auto",
            padding: 3,
            height: "100%",
          }}
        >
          {showVariants() && (
            <>
              <Grid container spacing={2} sx={{ px: 1, mt: 0.25 }}>
                <Grid item md={6} xs={12} sx={{ p: 1 }}>
                  <Box sx={{ p: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ textTransform: "uppercase" }}
                    >
                      {t("Variants")}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 1, px: 1 }}>
                {productlist?.variants.map((variant: any) => {
                  const priceData = variant.prices?.find(
                    (price: any) => price?.locationRef === locationRef
                  );

                  const stockConfig = variant.stockConfiguration?.find(
                    (stock: any) => stock?.locationRef === locationRef
                  );

                  if (
                    variant.unit !== "perItem" ||
                    Number(priceData?.price || 0) === 0
                  ) {
                    return <></>;
                  }

                  return (
                    <Grid item md={6} xs={12} key={variant._id} sx={{ p: 1 }}>
                      <Card sx={{ p: 1, border: "0.25px solid lightgray" }}>
                        <CardContent
                          style={{
                            textAlign: "center",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px",
                          }}
                        >
                          <Box>
                            <Typography
                              variant="body2"
                              align="left"
                              sx={{ textTransform: "capitalize" }}
                            >
                              {productlist?.variants?.length > 1
                                ? isRTL
                                  ? variant.name.ar
                                  : variant.name.en
                                : isRTL
                                ? productlist.name.ar
                                : productlist.name.en}
                            </Typography>

                            <Typography
                              sx={{ mt: 0.5 }}
                              align="left"
                              variant="body2"
                              color="neutral.500"
                            >
                              {`${getVariantPrice(
                                priceData || variant?.price
                              )} ${getUnitName[variant.unit]}`}
                            </Typography>
                          </Box>

                          <Box>
                            {getQuantity(variant.sku) === 0 ? (
                              <Box
                                sx={{
                                  py: 0.9,
                                  width: sm ? 110 : 110,
                                  borderRadius: 1,
                                  minWidth: "30%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  border: checkNotBillingProduct(
                                    variant,
                                    locationRef,
                                    false,
                                    false
                                  )
                                    ? "1px solid grey"
                                    : theme.palette.mode === "dark"
                                    ? "1px solid #0C9356"
                                    : "1px solid #006C35",
                                }}
                                onClick={() => {
                                  handleVariantClicked(variant);
                                }}
                              >
                                <Typography
                                  fontWeight="bold"
                                  color={
                                    checkNotBillingProduct(
                                      variant,
                                      locationRef,
                                      false,
                                      false
                                    )
                                      ? "neutral.400"
                                      : theme.palette.mode === "dark"
                                      ? "#0C9356"
                                      : "#006C35"
                                  }
                                >
                                  {t("Add")}
                                </Typography>
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  py: 0.9,
                                  width: sm ? 110 : 110,
                                  borderRadius: 1,
                                  minWidth: "30%",
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
                                    if (
                                      productlist?.modifiers?.length > 0 &&
                                      getActiveModifiers()
                                    ) {
                                      handleModifiers(
                                        "decrement",
                                        variant,
                                        priceData,
                                        stockConfig
                                      );
                                    } else {
                                      checkItemUpdate("decrement", variant.sku);
                                    }
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
                                    {getQuantity(variant.sku)}
                                  </Typography>
                                </Box>

                                <Box
                                  sx={{
                                    flex: 1,
                                    display: "flex",
                                    justifyContent: "center",
                                  }}
                                  onClick={() => {
                                    if (
                                      productlist?.modifiers?.length > 0 &&
                                      getActiveModifiers()
                                    ) {
                                      handleModifiers(
                                        "increment",
                                        variant,
                                        priceData,
                                        stockConfig
                                      );
                                    } else {
                                      checkItemUpdate("increment", variant.sku);
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
                            )}

                            {productlist?.modifiers?.length > 0 &&
                            getActiveModifiers() ? (
                              <Typography
                                sx={{ fontSize: "12px", mt: 0.5 }}
                                variant="caption"
                              >
                                {t("Customisable")}
                              </Typography>
                            ) : (
                              <></>
                            )}
                          </Box>
                        </CardContent>
                      </Card>

                      {getAvailablityText(stockConfig) && (
                        <Typography
                          sx={{ mt: 1, ml: 2 }}
                          variant="body2"
                          color={getTextColor(stockConfig)}
                        >
                          {getAvailablityText(stockConfig)}
                        </Typography>
                      )}
                    </Grid>
                  );
                })}
              </Grid>
            </>
          )}

          {boxes?.length > 0 && (
            <>
              <Grid container spacing={1} sx={{ mt: 1, px: 1 }}>
                <Grid item md={6} xs={12} sx={{ p: 1 }}>
                  <Box sx={{ p: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ textTransform: "uppercase" }}
                    >
                      {t("Boxes")}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 1, px: 1 }}>
                {boxes?.map((box: any) => {
                  const variant: any = productlist.variants?.find(
                    (variant: any) =>
                      variant.sku === box.productSku &&
                      (variant.assignedToAll ||
                        variant.locationRefs.includes(locationRef))
                  );

                  const priceData = box.prices?.find(
                    (price: any) => price?.locationRef === locationRef
                  );

                  const stockConfig = box?.stockConfiguration?.find(
                    (stock: any) => stock?.locationRef === locationRef
                  );

                  const availableText = getAvailablityText(stockConfig);

                  return (
                    <Grid item md={6} xs={12} key={box._id} sx={{ p: 1 }}>
                      <Card sx={{ p: 1, border: "0.25px solid lightgray" }}>
                        <CardContent
                          style={{
                            textAlign: "center",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px",
                          }}
                        >
                          <Box>
                            <Typography
                              align="left"
                              variant="body2"
                              sx={{ textTransform: "capitalize" }}
                            >
                              {productlist?.variants?.length > 1
                                ? (isRTL
                                    ? trimText(variant?.name?.ar, 25)
                                    : trimText(variant?.name?.en, 25)) +
                                  ` x${box.qty}`
                                : (isRTL
                                    ? trimText(productlist?.name?.ar, 25)
                                    : trimText(productlist?.name?.en, 25)) +
                                  ` x${box.qty}`}
                            </Typography>

                            <Typography
                              sx={{ mt: 0.5 }}
                              align="left"
                              variant="body2"
                              color="neutral.500"
                            >
                              {getBoxCratePrice(priceData || box?.price)}
                            </Typography>
                          </Box>

                          <Box>
                            {getQuantity(box.boxSku) === 0 ? (
                              <Box
                                sx={{
                                  py: 0.9,
                                  width: sm ? 110 : 110,
                                  borderRadius: 1,
                                  minWidth: "30%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  border: checkNotBillingProduct(
                                    box,
                                    locationRef,
                                    false,
                                    false
                                  )
                                    ? "1px solid grey"
                                    : theme.palette.mode === "dark"
                                    ? "1px solid #0C9356"
                                    : "1px solid #006C35",
                                }}
                                onClick={() => {
                                  handleBoxCrateClicked(box, variant);
                                }}
                              >
                                <Typography
                                  fontWeight="bold"
                                  color={
                                    checkNotBillingProduct(
                                      box,
                                      locationRef,
                                      false,
                                      false
                                    )
                                      ? "neutral.400"
                                      : theme.palette.mode === "dark"
                                      ? "#0C9356"
                                      : "#006C35"
                                  }
                                >
                                  {t("Add")}
                                </Typography>
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  py: 0.9,
                                  width: sm ? 110 : 110,
                                  borderRadius: 1,
                                  minWidth: "30%",
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
                                    if (
                                      productlist?.modifiers?.length > 0 &&
                                      getActiveModifiers()
                                    ) {
                                      handleModifiers(
                                        "decrement",
                                        box,
                                        priceData,
                                        stockConfig
                                      );
                                    } else {
                                      checkItemUpdate("decrement", box.boxSku);
                                    }
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
                                    {getQuantity(box.boxSku)}
                                  </Typography>
                                </Box>

                                <Box
                                  sx={{
                                    flex: 1,
                                    display: "flex",
                                    justifyContent: "center",
                                  }}
                                  onClick={() => {
                                    if (
                                      productlist?.modifiers?.length > 0 &&
                                      getActiveModifiers()
                                    ) {
                                      handleModifiers(
                                        "increment",
                                        box,
                                        priceData,
                                        stockConfig
                                      );
                                    } else {
                                      checkItemUpdate("increment", box.boxSku);
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
                            )}

                            {productlist?.modifiers?.length > 0 &&
                            getActiveModifiers() ? (
                              <Typography
                                sx={{ fontSize: "12px", mt: 0.5 }}
                                variant="caption"
                              >
                                {t("Customisable")}
                              </Typography>
                            ) : (
                              <></>
                            )}
                          </Box>
                        </CardContent>
                      </Card>

                      {availableText && (
                        <Typography
                          sx={{ mt: 1, ml: 2 }}
                          variant="body2"
                          color={getTextColor(stockConfig)}
                        >
                          {availableText}
                        </Typography>
                      )}
                    </Grid>
                  );
                })}
              </Grid>
            </>
          )}

          {crates?.length > 0 && (
            <>
              <Grid container spacing={1} sx={{ mt: 1, px: 1 }}>
                <Grid item md={6} xs={12} sx={{ p: 1 }}>
                  <Box sx={{ p: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ textTransform: "uppercase" }}
                    >
                      {t("Crates")}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 1, px: 1 }}>
                {crates?.map((crate: any) => {
                  const variant: any = productlist.variants?.find(
                    (variant: any) =>
                      variant.sku === crate.productSku &&
                      (variant.assignedToAll ||
                        variant.locationRefs.includes(locationRef))
                  );

                  const priceData = crate.prices?.find(
                    (price: any) => price?.locationRef === locationRef
                  );

                  const stockConfig = crate?.stockConfiguration?.find(
                    (stock: any) => stock?.locationRef === locationRef
                  );

                  const availableText = getAvailablityText(stockConfig);

                  return (
                    <Grid item md={6} xs={12} key={crate._id} sx={{ p: 1 }}>
                      <Card sx={{ p: 1, border: "0.25px solid lightgray" }}>
                        <CardContent
                          style={{
                            textAlign: "center",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px",
                          }}
                        >
                          <Box>
                            <Typography
                              align="left"
                              variant="body2"
                              sx={{ textTransform: "capitalize" }}
                            >
                              {productlist?.variants?.length > 1
                                ? (isRTL
                                    ? trimText(variant?.name?.ar, 25)
                                    : trimText(variant?.name?.en, 25)) +
                                  ` x${crate.qty}`
                                : (isRTL
                                    ? trimText(productlist?.name?.ar, 25)
                                    : trimText(productlist?.name?.en, 25)) +
                                  ` x${crate.qty}`}
                            </Typography>

                            <Typography
                              sx={{ mt: 0.5 }}
                              align="left"
                              variant="body2"
                              color="neutral.500"
                            >
                              {getBoxCratePrice(priceData || crate?.price)}
                            </Typography>
                          </Box>

                          <Box>
                            {getQuantity(crate.crateSku) === 0 ? (
                              <Box
                                sx={{
                                  py: 0.9,
                                  width: sm ? 110 : 110,
                                  borderRadius: 1,
                                  minWidth: "30%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  border: checkNotBillingProduct(
                                    crate,
                                    locationRef,
                                    false,
                                    false
                                  )
                                    ? "1px solid grey"
                                    : theme.palette.mode === "dark"
                                    ? "1px solid #0C9356"
                                    : "1px solid #006C35",
                                }}
                                onClick={() => {
                                  handleBoxCrateClicked(crate, variant);
                                }}
                              >
                                <Typography
                                  fontWeight="bold"
                                  color={
                                    checkNotBillingProduct(
                                      crate,
                                      locationRef,
                                      false,
                                      false
                                    )
                                      ? "neutral.400"
                                      : theme.palette.mode === "dark"
                                      ? "#0C9356"
                                      : "#006C35"
                                  }
                                >
                                  {t("Add")}
                                </Typography>
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  py: 0.9,
                                  width: sm ? 110 : 110,
                                  borderRadius: 1,
                                  minWidth: "30%",
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
                                    if (
                                      productlist?.modifiers?.length > 0 &&
                                      getActiveModifiers()
                                    ) {
                                      handleModifiers(
                                        "decrement",
                                        crate,
                                        priceData,
                                        stockConfig
                                      );
                                    } else {
                                      checkItemUpdate(
                                        "decrement",
                                        crate.crateSku
                                      );
                                    }
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
                                    {getQuantity(crate.crateSku)}
                                  </Typography>
                                </Box>

                                <Box
                                  sx={{
                                    flex: 1,
                                    display: "flex",
                                    justifyContent: "center",
                                  }}
                                  onClick={() => {
                                    if (
                                      productlist?.modifiers?.length > 0 &&
                                      getActiveModifiers()
                                    ) {
                                      handleModifiers(
                                        "increment",
                                        crate,
                                        priceData,
                                        stockConfig
                                      );
                                    } else {
                                      checkItemUpdate(
                                        "increment",
                                        crate.crateSku
                                      );
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
                            )}

                            {productlist?.modifiers?.length > 0 &&
                            getActiveModifiers() ? (
                              <Typography
                                sx={{ fontSize: "12px", mt: 0.5 }}
                                variant="caption"
                              >
                                {t("Customisable")}
                              </Typography>
                            ) : (
                              <></>
                            )}
                          </Box>
                        </CardContent>
                      </Card>

                      {availableText && (
                        <Typography
                          sx={{ mt: 1, ml: 2 }}
                          variant="body2"
                          color={getTextColor(stockConfig)}
                        >
                          {availableText}
                        </Typography>
                      )}
                    </Grid>
                  );
                })}
              </Grid>
            </>
          )}
        </Box>
      </Drawer>

      {openModifierDrawer && (
        <ModifierDrawer
          open={openModifierDrawer}
          handleClose={() => {
            setOpenModifierDrawer(false);
          }}
          locationRef={locationRef}
          product={productlist}
          variant={selectedVariant}
        />
      )}

      {openModifierCustomiseDrawer && (
        <ModifierCustomisationDrawer
          open={openModifierCustomiseDrawer}
          handleClose={() => {
            setOpenModifierCustomiseDrawer(false);
          }}
          locationRef={locationRef}
          product={productlist}
          variant={selectedVariant}
        />
      )}
    </>
  );
};
