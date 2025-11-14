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
import { CustomPriceModal } from "./custom-price-modal";
import { useCurrency } from "src/utils/useCurrency";

interface VariantItemModalProps {
  open: boolean;
  handleClose: any;
  productlist: any;
  company: any;
  handleVariantSelect: any;
}

export const VariantItemModal: React.FC<VariantItemModalProps> = ({
  open = false,
  handleClose,
  productlist,
  company,
  handleVariantSelect,
}) => {
  const { device } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();
  const { setScan } = useScanStore();
  const [boxes, setBoxes] = useState<any[]>([]);
  const [crates, setCrates] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(0) as any;
  const [totalPrice, setTotalPrice] = useState("0");
  const [openCustomPriceModal, setOpenCustomPriceModal] = useState(false);
  const [variantData, setVariantData] = useState<any>(null);
  const currency = useCurrency();

  const isSelected = (sku: any) => {
    return sku == selectedVariant?.sku;
  };

  const getVariantPrice = (item: any) => {
    if (selectedVariant?.sku == item?.sku && selectedVariant?.isOpenPrice) {
      return `${currency} ${
        Number(selectedVariant?.sellingPrice)?.toFixed(2) || "0"
      }`;
    } else if (Number(item?.price) > 0) {
      return `${currency} ${Number(item.price)?.toFixed(2)}`;
    } else {
      return t("Custom");
    }
  };

  const getBoxCratePrice = (item: any) => {
    if (selectedVariant?.sku == item?.sku && selectedVariant?.isOpenPrice) {
      return `${currency} ${
        Number(selectedVariant?.sellingPrice)?.toFixed(2) || "0"
      }`;
    } else {
      return `${currency} ${Number(item.price || 0)?.toFixed(2)}`;
    }
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

    if (Number(priceData?.price) > 0) {
      if (variant.unit === "perItem") {
        setQuantity(1);
        setTotalPrice(Number(priceData.price || 0)?.toFixed(2));
      } else {
        setQuantity();
        setTotalPrice(Number(0)?.toFixed(2));
      }
    } else {
      setVariantData({
        ...variant,
        boxSku: "",
        crateSku: "",
        boxRef: "",
        crateRef: "",
      });
      setOpenCustomPriceModal(true);
    }

    setSelectedVariant({
      _id: variant._id,
      image: variant.image,
      name: variant.name,
      type: variant.type || "item",
      sku: variant.sku,
      parentSku: variant?.parentSku || "",
      code: variant?.code || "",
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
      image: "",
      name: variant.name,
      type: item.type,
      sku: item.type === "crate" ? item.crateSku : item.boxSku,
      parentSku: item.productSku,
      boxSku: item.boxSku,
      crateSku: item.type === "crate" ? item.crateSku : "",
      boxRef: item.type === "crate" ? item.boxRef : item._id,
      crateRef: item.type === "crate" ? item._id : "",
      code: variant?.code || "",
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
    if (!productlist?.negativeBilling && selectedVariant.tracking) {
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
      image: selectedVariant.image || productlist.image,
      name: productlist.name,
      categoryRef: productlist.categoryRef || "",
      category: { name: productlist.category.name },
      variantName: selectedVariant.name,
      type: selectedVariant.type,
      sku: selectedVariant.sku,
      parentSku: selectedVariant.parentSku,
      boxSku: selectedVariant.boxSku,
      crateSku: selectedVariant.crateSku,
      boxRef: selectedVariant.boxRef,
      crateRef: selectedVariant.crateRef,
      code: selectedVariant?.code || "",
      qty: Number(quantity),
      hasMultipleVariants: productlist.scan
        ? Boolean(productlist.multiVariants)
        : productlist.variants?.length > 1,
      note: "",
      unit: selectedVariant.unit,
      noOfUnits: selectedVariant.noOfUnits,
      costPrice: selectedVariant?.costPrice || 0,
      price: selectedVariant.sellingPrice,
      tax: selectedVariant.isOpenPrice
        ? Number(selectedVariant.vat)
        : Number(productlist.tax.percentage),
      isOpenPrice: selectedVariant.isOpenPrice || false,
      availability: selectedVariant.availability,
      tracking: selectedVariant.tracking,
      stockCount: selectedVariant?.stockCount || 0,
      modifiers: [],
      channel: productlist?.channel,
      productModifiers: productlist?.modifiers,
    });
  };

  const getBoxesCrates = async () => {
    if (productlist.boxRefs?.length > 0 || productlist.crateRefs?.length > 0) {
      const res = await serviceCaller(`/boxes-crates/product`, {
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

      const boxes = res?.filter(
        (data: any) =>
          data.type === "box" && data.status === "active" && !data.nonSaleable
      );
      const crates = res?.filter(
        (data: any) =>
          data.type === "crate" && data.status === "active" && !data.nonSaleable
      );

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
          code: variant?.code || "",
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
          maxWidth="md"
          open={open}
          onClose={() => {
            handleClose();
            setSelectedVariant(null);
          }}
        >
          {/* header */}
          <Box
            sx={{
              display: "flex",
              p: 2,
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
              {productlist?.name.en}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": {
                  backgroundColor: "action.hover",
                  cursor: "pointer",
                  opacity: 0.5,
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
                  justifyContent: "space-between",
                  alignItems: "center",
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
                              {`${getVariantPrice(priceData)} ${
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
                    {boxes
                      ?.filter((b: any) => !b.nonSaleable)
                      ?.map((box: any) => {
                        const variant: any = productlist?.variants?.find(
                          (variant: any) =>
                            variant.sku === box.productSku &&
                            (variant.assignedToAll ||
                              variant.locationRefs.includes(
                                device?.locationRef
                              ))
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
                              onClick={() =>
                                handleBoxCrateClicked(box, variant)
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
                    {crates
                      ?.filter((c: any) => !c.nonSaleable)
                      ?.map((crate: any) => {
                        const variant: any = productlist?.variants?.find(
                          (variant: any) =>
                            variant.sku === crate.productSku &&
                            (variant.assignedToAll ||
                              variant.locationRefs.includes(
                                device?.locationRef
                              ))
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
                          <Grid
                            item
                            md={6}
                            xs={12}
                            key={crate._id}
                            sx={{ p: 1 }}
                          >
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

              {selectedVariant &&
                (selectedVariant?.unit === "perItem" ? (
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
                ) : (
                  <TextField
                    label={
                      selectedVariant?.unit == "perLitre"
                        ? t("Enter volume")
                        : t("Enter weight")
                    }
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
                      const decimalCheck = value.indexOf(".") !== -1;

                      if (decimalCheck) {
                        const decimalSplit = value.split(".");
                        const decimalLength = decimalSplit[1].length;

                        if (decimalLength > 2 || ascii === 46) {
                          event.preventDefault();
                        } else if (ascii < 48 || ascii > 57) {
                          event.preventDefault();
                        }
                      } else if (value.length > 8 && ascii !== 46) {
                        event.preventDefault();
                      } else if ((ascii < 48 || ascii > 57) && ascii !== 46) {
                        event.preventDefault();
                      }
                    }}
                    sx={{ mt: 2 }}
                  />
                ))}
            </Box>
          </DialogContent>

          <Divider />
          {/* footer */}
          <DialogActions
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "end",
              p: 2,
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
                  } else {
                    if (selectedVariant?.unit == "perLitre") {
                      toast.error(t("Please enter volume in litre"));
                    } else if (selectedVariant?.unit == "perGram") {
                      toast.error(t("Please enter weight in gram"));
                    } else if (selectedVariant?.unit == "perKilogram") {
                      toast.error(t("Please enter weight in kg"));
                    } else if (selectedVariant?.unit == "perMeter") {
                      toast.error(t("Please enter length in meter"));
                    } else if (selectedVariant?.unit == "perCentimeter") {
                      toast.error(t("Please enter length in centimeter"));
                    } else if (selectedVariant?.unit == "perFoot") {
                      toast.error(t("Please enter length in foot"));
                    } else if (selectedVariant?.unit == "perOunce") {
                      toast.error(t("Please enter weight in ounce"));
                    }
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

        <CustomPriceModal
          open={openCustomPriceModal}
          isFromPriceModal={true}
          handleClose={() => {}}
          handlePriceModalClose={(item: any) => {
            if (!item) {
              setSelectedVariant(null);
              setOpenCustomPriceModal(false);
              return;
            }

            if (item.unit == "perItem") {
              setQuantity(1);
            } else {
              setQuantity();
            }
            setTotalPrice(`${item?.sellingPrice || 0}`);
            setSelectedVariant(item);
            setOpenCustomPriceModal(false);
          }}
          productlist={variantData}
          company={company}
        />
      </Box>
    </>
  );
};
