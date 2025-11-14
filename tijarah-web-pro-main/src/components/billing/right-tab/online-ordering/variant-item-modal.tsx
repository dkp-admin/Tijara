import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import {
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  TextField,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import serviceCaller from "src/api/serviceCaller";
import { useAuth } from "src/hooks/use-auth";
import useScanStore from "src/store/scan-store";
import {
  checkNotBillingProduct,
  getUpdatedProductStock,
} from "src/utils/check-updated-product-stock";
import { getUnitName } from "src/utils/constants";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { trimText } from "src/utils/trim-text";
import { useCurrency } from "src/utils/useCurrency";

interface VariantItemModalProps {
  open: boolean;
  handleClose: any;
  productlist: any;
  negativeBilling: boolean;
  handleVariantSelect: any;
}

export const VariantItemModal: React.FC<VariantItemModalProps> = ({
  open = false,
  handleClose,
  productlist,
  negativeBilling,
  handleVariantSelect,
}) => {
  const theme = useTheme();
  const { device } = useAuth();
  const { t } = useTranslation();
  const { setScan } = useScanStore();

  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";
  const currency = useCurrency();
  const [boxes, setBoxes] = useState<any[]>([]);
  const [crates, setCrates] = useState<any[]>([]);
  const [totalPrice, setTotalPrice] = useState("0");
  const [quantity, setQuantity] = useState(0) as any;
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);

  const isSelected = (sku: string) => {
    return sku == selectedVariant?.sku;
  };

  const getVariantPrice = (item: any, sku: string) => {
    if (selectedVariant?.sku == sku) {
      return `${currency} ${
        Number(selectedVariant?.sellingPrice)?.toFixed(2) || "0"
      }`;
    } else {
      return `${currency} ${Number(item.price)?.toFixed(2)}`;
    }
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
      (price: any) => price?.locationRef === device?.locationRef
    );

    const stockConfig = variant.stockConfiguration?.find(
      (stock: any) => stock?.locationRef === device?.locationRef
    );

    if (
      checkNotBillingProduct(
        variant,
        device?.locationRef,
        Boolean(productlist?.negativeBilling),
        productlist?.scan
      )
    ) {
      toast.error(t("Looks like the item is out of stock"));
      return;
    }

    setQuantity(1);
    setTotalPrice(Number(priceData.price || 0)?.toFixed(2));

    setSelectedVariant({
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
      unit: variant.unit,
      noOfUnits: 1,
      costPrice: priceData?.costPrice || 0,
      sellingPrice: priceData?.price,
      availability: stockConfig ? stockConfig.availability : true,
      tracking: stockConfig ? stockConfig.tracking : false,
      stockCount: stockConfig?.count ? stockConfig.count : 0,
    });
  };

  const handleBoxCrateClicked = (item: any, variant: any) => {
    const priceData = item.prices?.find(
      (price: any) => price?.locationRef === device?.locationRef
    );

    const stockConfig = item?.stockConfiguration?.find(
      (stock: any) => stock?.locationRef === device?.locationRef
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

    if (
      checkNotBillingProduct(
        item,
        device?.locationRef,
        Boolean(productlist?.negativeBilling),
        productlist?.scan
      )
    ) {
      toast.error(t("Looks like the item is out of stock"));
      return;
    }

    setQuantity(1);
    setTotalPrice(Number(priceData?.price || item?.price || 0)?.toFixed(2));

    setSelectedVariant({
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
      noOfUnits: item.qty,
      costPrice: priceData?.costPrice || item?.costPrice || 0,
      sellingPrice: priceData?.price || item?.price,
      availability: stockConfig ? stockConfig.availability : true,
      tracking: stockConfig ? stockConfig.tracking : false,
      stockCount: stockConfig?.count ? stockConfig.count : 0,
    });
  };

  const handleSelectVariant = () => {
    if (!negativeBilling && selectedVariant.tracking) {
      const stockCount = getUpdatedProductStock(
        Number(selectedVariant?.stockCount),
        selectedVariant?.type,
        selectedVariant?.sku,
        Number(quantity),
        false
      );

      if (stockCount < 0) {
        toast.error(t("Looks like the item is out of stock"));
        return;
      }
    }

    handleVariantSelect({
      _id: productlist._id,
      name: productlist.name,
      categoryRef: productlist.categoryRef || "",
      variantName: selectedVariant.name,
      type: selectedVariant.type,
      sku: selectedVariant.sku,
      parentSku: selectedVariant.parentSku,
      boxSku: selectedVariant.boxSku,
      crateSku: selectedVariant.crateSku,
      boxRef: selectedVariant.boxRef,
      crateRef: selectedVariant.crateRef,
      qty: Number(quantity),
      unit: selectedVariant.unit,
      unitCount: selectedVariant.noOfUnits || 1,
      hasMultipleVariants: productlist.variants?.length > 1,
      price: selectedVariant.sellingPrice,
      tax: Number(productlist.tax.percentage),
      productModifiers: productlist?.modifiers,
    });
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
      setTotalPrice("0");
      setQuantity(0);

      const variant = productlist.variants[0];

      const priceData = variant.prices?.find(
        (price: any) => price?.locationRef === device?.locationRef
      );

      const stockConfig = variant.stockConfiguration?.find(
        (stock: any) => stock?.locationRef === device?.locationRef
      );

      if (productlist?.variants?.length == 1 && priceData?.price) {
        setSelectedVariant({
          _id: variant._id,
          image: variant.image || productlist.image || "",
          name: variant.name,
          type: variant.type || "item",
          sku: variant.sku,
          parentSku: variant?.parentSku || "",
          boxSku: variant?.boxSku || "",
          crateSku: variant?.crateSku || "",
          boxRef: variant?.boxRef || "",
          crateRef: variant?.crateRef || "",
          unit: variant.unit,
          noOfUnits: 1,
          costPrice: priceData?.costPrice || 0,
          sellingPrice: priceData?.price,
          availability: stockConfig ? stockConfig.availability : true,
          tracking: stockConfig ? stockConfig.tracking : false,
          stockCount: stockConfig?.count ? stockConfig.count : 0,
        });
        setQuantity(1);
        setTotalPrice(priceData?.price?.toFixed(2));
      } else {
        setSelectedVariant(null);
      }

      getBoxesCrates();
    }
  }, [open]);

  return (
    <>
      <Box>
        <Dialog
          fullWidth
          open={open}
          maxWidth="md"
          onClose={() => {
            handleClose();
            setSelectedVariant(null);
          }}
        >
          {/* header */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor:
                theme.palette.mode === "light" ? "#fff" : "#111927",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            ></Box>

            <Typography sx={{ ml: 2 }} variant="h6">
              {isRTL ? productlist?.name.ar : productlist?.name.en}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": {
                  opacity: 0.5,
                  cursor: "pointer",
                  backgroundColor: "action.hover",
                },
              }}
            >
              <CloseIcon
                fontSize="medium"
                onClick={() => {
                  handleClose();
                  setSelectedVariant(null);
                }}
              />
            </Box>
          </Box>

          <Divider />

          {/* body */}
          <DialogContent>
            <Box>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="body2" sx={{ textTransform: "uppercase" }}>
                  {t(" Variants")}
                  {productlist?.variants?.length > 1
                    ? ` - ${t("Choose One")}`
                    : ""}
                </Typography>

                <Typography
                  variant="h5"
                  sx={{ textTransform: "uppercase", textAlign: "right" }}
                >
                  {`${currency} ${toFixedNumber(totalPrice || "0")}`}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item md={6} xs={12}>
                  <Box>
                    {productlist?.modifiers?.length > 0 &&
                      getActiveModifiers() && (
                        <Typography sx={{ ml: 0.25, fontSize: "11px" }}>
                          {t("Customisable")}
                        </Typography>
                      )}
                  </Box>
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 1, px: 1, mt: 2 }}>
                {productlist?.variants
                  ?.filter((variant: any) => !variant.nonSaleable)
                  ?.map((variant: any) => {
                    const priceData = variant.prices?.find(
                      (price: any) => price?.locationRef === device?.locationRef
                    );

                    const stockConfig = variant.stockConfiguration?.find(
                      (stock: any) => stock?.locationRef === device?.locationRef
                    );

                    return (
                      <Grid item md={6} xs={12} key={variant._id} sx={{ p: 1 }}>
                        <Card
                          sx={{
                            p: 1,
                            border: isSelected(variant.sku)
                              ? theme.palette.mode === "dark"
                                ? "1px solid #0C9356"
                                : "1px solid #006C35"
                              : "1px solid transparent",
                            "&:hover": {
                              backgroundColor: "action.hover",
                              cursor: "pointer",
                              opacity: 0.5,
                            },
                            borderRadius: 1,
                          }}
                          onClick={() => handleVariantClicked(variant)}
                        >
                          <CardContent
                            style={{
                              textAlign: "center",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "12px",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ textTransform: "capitalize" }}
                            >
                              {productlist?.variants?.length > 1
                                ? trimText(variant.name.en, 25)
                                : trimText(productlist.name.en, 25)}
                            </Typography>

                            <Typography variant="body2">
                              {`${getVariantPrice(priceData, variant.sku)} ${
                                getUnitName[variant.unit]
                              }`}
                            </Typography>
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

              {boxes?.length > 0 && !productlist?.scan && (
                <>
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    <Grid item md={6} xs={12}>
                      <Box sx={{ p: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ textTransform: "uppercase" }}
                        >
                          {t(" Boxes")}
                          {boxes?.length > 1 ? ` - ${t("Choose One")}` : ""}
                        </Typography>

                        {productlist?.modifiers?.length > 0 &&
                          getActiveModifiers() && (
                            <Typography sx={{ ml: 0.25, fontSize: "11px" }}>
                              {t("Customisable")}
                            </Typography>
                          )}
                      </Box>
                    </Grid>
                  </Grid>

                  <Grid container spacing={2} sx={{ mb: 1, px: 1 }}>
                    {boxes?.map((box: any) => {
                      const variant: any = productlist.variants?.find(
                        (variant: any) =>
                          variant.sku === box.productSku &&
                          (variant.assignedToAll ||
                            variant.locationRefs.includes(device?.locationRef))
                      );

                      const priceData = box.prices?.find(
                        (price: any) =>
                          price?.locationRef === device?.locationRef
                      );

                      const stockConfig = box?.stockConfiguration?.find(
                        (stock: any) =>
                          stock?.locationRef === device?.locationRef
                      );

                      const availableText = getAvailablityText(stockConfig);

                      return (
                        <Grid item md={6} xs={12} key={box._id} sx={{ p: 1 }}>
                          <Card
                            sx={{
                              p: 1,
                              border: isSelected(box.boxSku)
                                ? theme.palette.mode === "dark"
                                  ? "1px solid #0C9356"
                                  : "1px solid #006C35"
                                : "1px solid transparent",
                            }}
                            onClick={() => handleBoxCrateClicked(box, variant)}
                          >
                            <CardContent
                              style={{
                                textAlign: "center",
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "12px",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ textTransform: "capitalize" }}
                              >
                                {productlist?.variants?.length > 1
                                  ? trimText(variant?.name?.en, 25) +
                                    ` x${box.qty}`
                                  : trimText(productlist?.name?.en, 25) +
                                    ` x${box.qty}`}
                              </Typography>
                              <Typography variant="body2">
                                {getBoxCratePrice(priceData || box?.price)}
                              </Typography>
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

              {crates?.length > 0 && !productlist?.scan && (
                <>
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    <Grid item md={6} xs={12}>
                      <Box sx={{ p: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ textTransform: "uppercase" }}
                        >
                          {t(" Crates")}
                          {crates?.length > 1 ? ` - ${t("Choose One")}` : ""}
                        </Typography>

                        {productlist?.modifiers?.length > 0 &&
                          getActiveModifiers() && (
                            <Typography sx={{ ml: 0.25, fontSize: "11px" }}>
                              {t("Customisable")}
                            </Typography>
                          )}
                      </Box>
                    </Grid>
                  </Grid>

                  <Grid container spacing={2} sx={{ mb: 1, px: 1 }}>
                    {crates?.map((crate: any) => {
                      const variant: any = productlist.variants?.find(
                        (variant: any) =>
                          variant.sku === crate.productSku &&
                          (variant.assignedToAll ||
                            variant.locationRefs.includes(device?.locationRef))
                      );

                      const priceData = crate.prices?.find(
                        (price: any) =>
                          price?.locationRef === device?.locationRef
                      );

                      const stockConfig = crate?.stockConfiguration?.find(
                        (stock: any) =>
                          stock?.locationRef === device?.locationRef
                      );

                      const availableText = getAvailablityText(stockConfig);

                      return (
                        <Grid item md={6} xs={12} key={crate._id} sx={{ p: 1 }}>
                          <Card
                            sx={{
                              p: 1,
                              border: isSelected(crate.crateSku)
                                ? theme.palette.mode === "dark"
                                  ? "1px solid #0C9356"
                                  : "1px solid #006C35"
                                : "1px solid transparent",
                            }}
                            onClick={() =>
                              handleBoxCrateClicked(crate, variant)
                            }
                          >
                            <CardContent
                              style={{
                                textAlign: "center",
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "12px",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ textTransform: "capitalize" }}
                              >
                                {productlist?.variants?.length > 1
                                  ? trimText(variant?.name?.en, 25) +
                                    ` x${crate.qty}`
                                  : trimText(productlist?.name?.en, 25) +
                                    ` x${crate.qty}`}
                              </Typography>
                              <Typography variant="body2">
                                {getBoxCratePrice(priceData || crate?.price)}
                              </Typography>
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

              {selectedVariant && (
                <TextField
                  label={t("Enter Quantity")}
                  value={quantity}
                  onChange={(e) => {
                    const price =
                      Number(e.target.value) *
                      Number(selectedVariant?.sellingPrice);

                    setQuantity(e.target.value);
                    setTotalPrice(price?.toFixed(2));
                  }}
                  fullWidth
                  onFocus={() => setScan(true)}
                  onBlur={() => setScan(false)}
                  onKeyPress={(event): void => {
                    const ascii = event.charCode;
                    const value = (event.target as HTMLInputElement).value;

                    if (ascii >= 48 && ascii <= 57) {
                      if (value.length > 8) {
                        event.preventDefault();
                      }
                    } else {
                      event.preventDefault();
                    }
                  }}
                  sx={{ mt: 2 }}
                />
              )}
            </Box>
          </DialogContent>

          <Divider />

          {/* footer */}
          <DialogActions
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "end",
            }}
          >
            <LoadingButton
              onClick={(e) => {
                e.preventDefault();

                if (!selectedVariant) {
                  toast.error(t("Please select variant"));
                  return;
                }

                if (quantity > 0) {
                  handleSelectVariant();
                } else {
                  if (Number(quantity) == 0) {
                    toast.error(t("Entered value must be greater than 0"));
                  }
                }
              }}
              sx={{ borderRadius: 1 }}
              variant="contained"
              type="submit"
            >
              {t("Add")}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};
