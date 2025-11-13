import { Add, ArrowRight, Remove } from "@mui/icons-material";
import { Box, Card, Typography, useMediaQuery, useTheme } from "@mui/material";
import { t } from "i18next";
import PropTypes from "prop-types";
import { useEffect, useState, type FC } from "react";
import toast from "react-hot-toast";
import useItems from "src/hooks/use-items";
import { Egg } from "src/icons/egg";
import { NonVeg } from "src/icons/non-veg";
import { Veg } from "src/icons/veg";
import cart from "src/utils/cart";
import {
  checkNotBillingProduct,
  getUpdatedProductStock,
} from "src/utils/check-updated-product-stock";
import { trigger } from "src/utils/custom-event";
import { getItemSellingPrice, getItemVAT } from "src/utils/get-price";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { truncateString } from "src/utils/utils";
import { ModifierCustomisationDrawer } from "./modifier-customisation-drawer";
import { ModifierDrawer } from "./modifiers-drawer";
import { ProductDetailsDrawer } from "./product-details-drawer";
import { VariantDrawer } from "./varitant-drawer";
import { useCurrency } from "src/utils/useCurrency";

interface MenuProductItemProps {
  productlist: any;
  length: boolean;
  locationRef: string;
  handleCartItem: any;
  handleCartTotal: any;
}

export const MenuProductItem: FC<MenuProductItemProps> = (props) => {
  const theme = useTheme();
  const currency = window.localStorage.getItem("onlineOrderingCurrency");

  const { productlist, length, locationRef, handleCartItem, handleCartTotal } =
    props;
  const { items, totalItem, totalAmount } = useItems();

  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [openDetailsDrawer, setOpenDetailsDrawer] = useState<boolean>(false);
  const [openModifierDrawer, setOpenModifierDrawer] = useState<boolean>(false);
  const [openModifierCustomiseDrawer, setOpenModifierCustomiseDrawer] =
    useState<boolean>(false);

  const getAvailablityText = () => {
    const stocks = productlist.variants[0].stockConfiguration?.find(
      (stock: any) => stock?.locationRef === locationRef
    );
    const available = stocks ? stocks.availability : true;
    const tracking = stocks ? stocks.tracking : false;
    const stockCount = stocks?.count;
    const lowStockAlert = stocks ? stocks.lowStockAlert : false;
    const lowStockCount = stocks?.lowStockCount;

    if (!available || (tracking && stockCount <= 0)) {
      return t("Out of Stock");
    } else {
      if (lowStockAlert && stockCount <= lowStockCount) {
        return t("Running Low");
      } else {
        return "";
      }
    }
  };

  const getTextColor = () => {
    const stocks = productlist.variants[0].stockConfiguration?.find(
      (stock: any) => stock?.locationRef === locationRef
    );
    const available = stocks ? stocks.availability : true;
    const tracking = stocks ? stocks.tracking : false;
    const stockCount = stocks?.count;
    const lowStockAlert = stocks ? stocks.lowStockAlert : false;
    const lowStockCount = stocks?.lowStockCount;

    if (!available || (tracking && stockCount <= 0)) {
      return "error";
    } else {
      if (lowStockAlert && stockCount <= lowStockCount) {
        return "#F58634";
      } else {
        return "";
      }
    }
  };

  const displayVariantPrice = () => {
    const variants = getVariants();
    const boxes = productlist?.boxRefs;
    const crates = productlist?.crateRefs;

    if (variants && variants?.length > 0) {
      if (
        variants?.length === 1 &&
        boxes?.length === 0 &&
        crates?.length === 0
      ) {
        const priceData = variants[0]?.prices?.find(
          (p: any) => p?.locationRef === locationRef
        );

        return `${currency} ${toFixedNumber(
          priceData?.price || variants[0]?.price
        )}`;
      } else {
        return `${variants?.length + boxes?.length + crates?.length} ${t(
          "Variants"
        )}`;
      }
    } else {
      return `${variants?.length + boxes?.length + crates?.length} ${t(
        "Variants"
      )}`;
    }
  };

  const handleAdd = () => {
    const {
      _id,
      contains,
      categoryRef,
      category,
      tax,
      variants,
      boxRefs,
      crateRefs,
      name,
      modifiers,
    } = productlist;

    const variant = variants[0];

    const priceData = variant.prices?.find(
      (price: any) => price?.locationRef === locationRef
    );

    const stockConfig = variant.stockConfiguration?.find(
      (stock: any) => stock?.locationRef === locationRef
    );

    if (variants?.length > 1 || boxRefs?.length > 0 || crateRefs?.length > 0) {
      setOpenDrawer(true);
    } else if (modifiers?.length > 0 && getActiveModifiers()) {
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
        unitCount: 1,
        costPrice: priceData?.costPrice || 0,
        price: priceData?.price || variant?.price,
        availability: stockConfig ? stockConfig.availability : true,
        tracking: stockConfig ? stockConfig.tracking : false,
        count: stockConfig?.count ? stockConfig.count : 0,
      });
      setOpenModifierDrawer(true);
    } else {
      if (checkNotBillingProduct(variant, locationRef, false)) {
        toast.error(t("Looks like the item is out of stock"));
        return;
      }

      const localItems = cart.getCartItems() || [];
      const idx = localItems.findIndex((item: any) => item.sku === variant.sku);

      if (idx !== -1) {
        const updatedQty = localItems[idx].qty + 1;
        const updatedTotal =
          (localItems[idx].sellingPrice + localItems[idx].vatAmount) *
          updatedQty;

        cart.updateCartItem(
          idx,
          {
            ...localItems[idx],
            qty: updatedQty,
            total: updatedTotal,
            availability: stockConfig ? stockConfig.availability : true,
            tracking: stockConfig ? stockConfig.tracking : false,
            stockCount: stockConfig ? stockConfig.count : 0,
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
        costPrice: priceData?.costPrice || variant?.costPrice || 0,
        sellingPrice: getItemSellingPrice(
          variant.type === "box" || variant.type === "crate"
            ? priceData?.price || variant.price
            : priceData.price,
          tax.percentage
        ),
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
        vatAmount: getItemVAT(
          variant.type === "box" || variant.type === "crate"
            ? priceData?.price || variant.price
            : priceData.price,
          tax.percentage
        ),
        qty: 1,
        hasMultipleVariants: variants.length > 1,
        itemSubTotal: getItemSellingPrice(
          variant.type === "box" || variant.type === "crate"
            ? priceData?.price || variant.price
            : priceData.price,
          tax.percentage
        ),
        itemVAT: getItemVAT(
          variant.type === "box" || variant.type === "crate"
            ? priceData?.price || variant.price
            : priceData.price,
          tax.percentage
        ),
        total:
          variant.type === "box" || variant.type === "crate"
            ? Number(priceData?.price) || Number(variant.price)
            : Number(priceData.price),
        unit: variant.unit || "perItem",
        noOfUnits: Number(variant?.unitCount || 1),
        note: "",
        availability: stockConfig ? stockConfig.availability : true,
        tracking: stockConfig ? stockConfig.tracking : false,
        stockCount: stockConfig?.count ? stockConfig.count : 0,
        modifiers: [] as any,
        productModifiers: modifiers,
      };

      cart.addToCart(item, (items: any) => {
        trigger("itemAdded", null, items, null, null);
      });
    }
  };

  const checkNotBillingProductRow = () => {
    if (productlist.variants?.length > 1) {
      return false;
    } else {
      const stocks = productlist.variants[0].stockConfiguration?.find(
        (stock: any) => stock?.locationRef === locationRef
      );

      const available = stocks ? stocks.availability : true;
      const tracking = stocks ? stocks.tracking : false;
      const stockCount = stocks?.count;

      if (available && tracking) {
        return stockCount <= 0;
      } else {
        return !available;
      }
    }
  };

  const checkItemUpdate = (type: "increment" | "decrement") => {
    if (
      productlist?.variants?.length > 1 ||
      productlist?.boxRefs?.length > 0 ||
      productlist?.crateRefs?.length > 0
    ) {
      setOpenDrawer(true);
      return;
    } else if (productlist?.modifiers?.length > 0 && getActiveModifiers()) {
      const variant = productlist?.variants[0];

      const priceData = variant.prices?.find(
        (price: any) => price?.locationRef === locationRef
      );

      const stockConfig = variant.stockConfiguration?.find(
        (stock: any) => stock?.locationRef === locationRef
      );

      const prod = items.filter(
        (item: any) =>
          item.productRef === productlist?._id && item.sku === variant?.sku
      );

      if (prod?.length > 1 || type === "increment") {
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
          unitCount: 1,
          costPrice: priceData?.costPrice || 0,
          price: priceData?.price || variant?.price,
          availability: stockConfig ? stockConfig.availability : true,
          tracking: stockConfig ? stockConfig.tracking : false,
          count: stockConfig?.count ? stockConfig.count : 0,
        });
        setOpenModifierCustomiseDrawer(true);
        return;
      }
    }

    const idx = items.findIndex(
      (item: any) => item.productRef === productlist._id
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
  };

  const getQuantity = () => {
    const quantity = items
      ?.filter((prod: any) => prod.productRef === productlist?._id)
      .reduce((pc: number, item: any) => pc + item?.qty, 0);

    return quantity || 0;
  };

  const showProducts = () => {
    const variants = productlist?.variants?.filter(
      (v: any) =>
        !v?.nonSaleable &&
        v?.unit === "perItem" &&
        v?.prices?.find(
          (p: any) =>
            p?.locationRef === locationRef && Number(p?.price || 0) > 0
        )
    );

    const boxes = productlist?.boxRefs;
    const crates = productlist?.crateRefs;

    return variants?.length > 0 || boxes?.length > 0 || crates?.length > 0;
  };

  const getVariants = () => {
    const variants = productlist?.variants?.filter(
      (v: any) =>
        !v?.nonSaleable &&
        v?.unit === "perItem" &&
        v?.prices?.find(
          (p: any) =>
            p?.locationRef === locationRef && Number(p?.price || 0) > 0
        )
    );

    return variants;
  };

  const getActiveModifiers = () => {
    const activeModifiers = productlist?.modifiers?.filter(
      (modifier: any) => modifier.status === "active"
    );

    return activeModifiers?.length > 0;
  };

  useEffect(() => {
    handleCartItem(totalItem);
  }, [totalItem]);

  useEffect(() => {
    handleCartTotal(totalAmount);
  }, [totalAmount]);

  const sm = useMediaQuery("(max-width:600px)");

  if (!showProducts()) {
    return <></>;
  }

  return (
    <Box
      sx={{
        px: 1.75,
        py: 1.75,
        display: "flex",
        justifyContent: "space-between",
        borderBottom: length ? "none" : "1px solid #ededed",
      }}
    >
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <Box sx={{ flex: 1, mr: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {productlist?.contains === "egg" ? (
                <Egg />
              ) : productlist?.contains === "non-veg" ? (
                <NonVeg />
              ) : productlist?.contains === "veg" ? (
                <Veg />
              ) : (
                <></>
              )}

              {productlist?.bestSeller && (
                <Typography
                  sx={{
                    ml: productlist?.contains ? 0.5 : 0,
                    mt: -0.6,
                    fontSize: 15,
                  }}
                  variant="subtitle1"
                  color="error.main"
                >
                  {t("Bestseller")}
                </Typography>
              )}
            </Box>

            <Typography variant="h6">
              {isRTL ? productlist.name.ar : productlist?.name?.en}
            </Typography>

            <Typography sx={{ mt: 1 }} variant="subtitle1">
              {displayVariantPrice()}
            </Typography>

            {productlist?.description?.length > 0 && (
              <Typography
                sx={{ mt: 1 }}
                fontSize="14px"
                variant="body2"
                color="text.secondary"
              >
                {showFullDescription || productlist?.description?.length <= 50
                  ? productlist?.description
                  : `${truncateString(productlist?.description, 50)}`}
                {!showFullDescription &&
                  productlist?.description?.length > 50 && (
                    <button
                      onClick={() => {
                        setShowFullDescription(!showFullDescription);
                      }}
                      style={{
                        border: "none",
                        cursor: "pointer",
                        background: "none",
                        fontSize: "14px",
                        fontWeight: "bold",
                      }}
                    >
                      {t("read more")}
                    </button>
                  )}
              </Typography>
            )}

            {productlist.variants.length === 1 && getAvailablityText() && (
              <Typography variant="body2" color={getTextColor()}>
                {getAvailablityText()}
              </Typography>
            )}

            {(productlist?.nutritionalInformation?.calorieCount !== null ||
              productlist?.nutritionalInformation?.contains?.length > 0 ||
              productlist?.nutritionalInformation?.preference?.length > 0) && (
              <Card
                sx={{
                  mt: 2,
                  px: 1.5,
                  py: 0.5,
                  display: "inline-block",
                  alignItems: "center",
                  borderRadius: 10,
                  borderColor: (theme) => theme.palette.neutral[300],
                }}
                onClick={() => setOpenDetailsDrawer(true)}
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
                    {t("More Details")}
                  </Typography>

                  <ArrowRight
                    fontSize="small"
                    sx={{
                      ml: 0.5,
                      mr: -0.6,
                      color: (theme) => theme.palette.neutral[500],
                    }}
                  />
                </Box>
              </Card>
            )}
          </Box>
        </Box>
      </Box>

      <Box>
        {productlist.image && (
          <Box
            sx={{
              alignItems: "center",
              backgroundColor: "neutral.50",
              backgroundImage: `url(${productlist.image})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              borderRadius: 1,
              display: "flex",
              height: sm ? 100 : 100,
              justifyContent: "center",
              overflow: "hidden",
              width: sm ? 100 : 100,
            }}
            onClick={() => setOpenDetailsDrawer(true)}
          />
        )}

        {getQuantity() === 0 ? (
          <Box
            sx={{
              mt: productlist.image ? 1.25 : 0,
              mb: 0.5,
              py: 0.8,
              borderRadius: 1,
              width: sm ? 100 : 100,
              minWidth: "35%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: checkNotBillingProductRow()
                ? "1px solid grey"
                : theme.palette.mode === "dark"
                ? "1px solid #0C9356"
                : "1px solid #006C35",
            }}
            onClick={() => {
              if (checkNotBillingProductRow()) {
                toast.error(t("Looks like the item is out of stock"));
                return;
              }

              handleAdd();
            }}
          >
            <Typography
              fontWeight="bold"
              color={
                checkNotBillingProductRow()
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
              mt: productlist.image ? 1.25 : 0,
              mb: 0.5,
              py: 0.8,
              width: sm ? 100 : 100,
              borderRadius: 1,
              minWidth: "35%",
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
              sx={{ flex: 1, display: "flex", justifyContent: "center" }}
              onClick={() => {
                checkItemUpdate("decrement");
              }}
            >
              <Remove
                sx={{
                  color: theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
                }}
              />
            </Box>

            <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <Typography
                fontWeight={"bold"}
                color={theme.palette.mode === "dark" ? "#0C9356" : "#006C35"}
              >
                {getQuantity()}
              </Typography>
            </Box>

            <Box
              sx={{ flex: 1, display: "flex", justifyContent: "center" }}
              onClick={() => {
                checkItemUpdate("increment");
              }}
            >
              <Add
                sx={{
                  color: theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
                }}
              />
            </Box>
          </Box>
        )}

        <Box
          sx={{
            mt: -0.5,
            mb: -0.6,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {getVariants()?.length > 1 ||
          productlist?.boxRefs?.length > 0 ||
          productlist?.crateRefs?.length > 0 ? (
            <Typography sx={{ fontSize: "12px", mt: 1 }} variant="caption">
              *
              {getVariants()?.length +
                productlist?.boxRefs?.length +
                productlist?.crateRefs?.length}{" "}
              {t("Variants")}
            </Typography>
          ) : productlist?.modifiers?.length > 0 && getActiveModifiers() ? (
            <Typography sx={{ fontSize: "12px", mt: 0.5 }} variant="caption">
              {t("Customisable")}
            </Typography>
          ) : (
            <></>
          )}
        </Box>
      </Box>

      {openDrawer && (
        <VariantDrawer
          open={openDrawer}
          handleClose={() => {
            setOpenDrawer(false);
          }}
          locationRef={locationRef}
          productlist={productlist}
        />
      )}

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

      {openDetailsDrawer && (
        <ProductDetailsDrawer
          open={openDetailsDrawer}
          handleClose={() => {
            setOpenDetailsDrawer(false);
          }}
          productlist={productlist}
          locationRef={locationRef}
        />
      )}
    </Box>
  );
};

MenuProductItem.propTypes = {
  // @ts-ignore
  productlist: PropTypes.object,
};
