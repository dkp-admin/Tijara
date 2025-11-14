import { Add, Remove } from "@mui/icons-material";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { LoadingButton } from "@mui/lab";
import { Checkbox, Divider, Drawer, Radio, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Egg } from "src/icons/egg";
import { NonVeg } from "src/icons/non-veg";
import { Veg } from "src/icons/veg";
import cart from "src/utils/cart";
import { checkNotBillingProduct } from "src/utils/check-updated-product-stock";
import { trigger } from "src/utils/custom-event";
import { getItemSellingPrice, getItemVAT } from "src/utils/get-price";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

interface ModifierDrawerProps {
  open: boolean;
  handleClose: any;
  product: any;
  variant: any;
  locationRef: any;
}

export const ModifierDrawer: React.FC<ModifierDrawerProps> = ({
  open = false,
  handleClose,
  product,
  variant,
  locationRef,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const currency =
    window.localStorage.getItem("onlineOrderingCurrency") || "SAR";
  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const [quantity, setQuantity] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedModifier, setSelectedModifier] = useState<any>([]);

  const updateTotalPrice = () => {
    const price = selectedModifier?.reduce(
      (pc: number, item: any) => pc + item?.total,
      0
    );

    const productPrice = variant?.price || 0;

    setTotalPrice((productPrice + price) * quantity);
  };

  const checkModifierSelect = (modifier: any, option: any) => {
    const modIndex = selectedModifier?.findIndex(
      (item: any) => item.modifierRef === modifier.modifierRef
    );

    const index = selectedModifier?.findIndex(
      (item: any) =>
        item.modifierRef === modifier.modifierRef &&
        item.optionId === option._id
    );

    if (
      modIndex === -1 &&
      modifier.min > 0 &&
      modifier.default === option._id
    ) {
      updateModifier(modifier, option);
    }

    return modIndex === -1 && modifier.min > 0
      ? modifier.default === option._id
      : index !== -1;
  };

  const maxModifierSelected = (modifier: any, option: any) => {
    if (
      (modifier.min === 0 && modifier.max === 0) ||
      (modifier.min === 1 && modifier.max === 1)
    ) {
      return false;
    }

    const data = selectedModifier?.filter(
      (item: any) => item.modifierRef === modifier.modifierRef
    );

    if (checkModifierSelect(modifier, option)) {
      return false;
    }

    return data?.length === modifier.max;
  };

  const updateModifier = (modifier: any, option: any) => {
    let data;

    const index = selectedModifier?.findIndex((item: any) =>
      modifier.min === 1 && modifier.max === 1
        ? item.modifierRef === modifier.modifierRef
        : item.modifierRef === modifier.modifierRef &&
          item.optionId === option._id
    );

    if (modifier.min === 1 && modifier.max === 1 && index !== -1) {
      selectedModifier[index] = {
        modifierRef: modifier.modifierRef,
        name: modifier.name,
        optionId: option._id,
        optionName: option.name,
        contains: option.contains,
        discount: 0,
        discountPercentage: 0,
        vatAmount: getItemVAT(option.price, option.tax.percentage),
        vatPercentage: option.tax.percentage,
        subTotal: getItemSellingPrice(option.price, option.tax.percentage),
        total: option.price,
      };
      setSelectedModifier([...selectedModifier]);
    } else if (index !== -1) {
      data = [...selectedModifier];
      data.splice(index, 1);
      setSelectedModifier(data);
    } else {
      data = {
        modifierRef: modifier.modifierRef,
        name: modifier.name,
        optionId: option._id,
        optionName: option.name,
        contains: option.contains,
        discount: 0,
        discountPercentage: 0,
        vatAmount: getItemVAT(option.price, option.tax.percentage),
        vatPercentage: option.tax.percentage,
        subTotal: getItemSellingPrice(option.price, option.tax.percentage),
        total: option.price,
      };
      setSelectedModifier([...selectedModifier, data]);
    }
  };

  const checkModifierSelected = () => {
    const activeModifiers = product?.modifiers?.filter(
      (o: any) => o?.status === "active"
    );

    for (let i = 0; i < activeModifiers?.length; i++) {
      const modifier = selectedModifier?.filter(
        (item: any) => item.modifierRef === activeModifiers[i].modifierRef
      );

      if (
        activeModifiers[i].min !== 0 &&
        activeModifiers[i].min > (modifier?.length || 0)
      ) {
        toast.error(
          `${t("Please select")} ${product?.modifiers[i].name} ${t(
            "minimum"
          )} ${product?.modifiers[i].min}`
        );
        return true;
      }
    }

    return false;
  };

  const sameModifierCheck = (prod: any) => {
    let sameModifier = false;

    for (let i = 0; i < prod?.modifiers?.length; i++) {
      const index = selectedModifier?.findIndex(
        (item: any) =>
          item.modifierRef === prod?.modifiers[i].modifierRef &&
          item.optionId === prod?.modifiers[i].optionId
      );

      if (index !== -1) {
        sameModifier = true;
      } else {
        sameModifier = false;
        return false;
      }
    }

    return sameModifier;
  };

  const handleAdd = () => {
    if (checkModifierSelected()) {
      return;
    }

    const { _id, categoryRef, category, tax, name, modifiers } = product;

    if (checkNotBillingProduct(variant, locationRef, false)) {
      toast.error(t("Looks like the item is out of stock"));
      return;
    }

    const localItems = cart.getCartItems() || [];
    const idx = localItems.findIndex((item: any) => item.sku === variant.sku);

    if (idx !== -1 && sameModifierCheck(localItems[idx])) {
      const updatedQty = localItems[idx].qty + quantity;
      const updatedTotal = localItems[idx].total + totalPrice;

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

      handleClose();
      return;
    }

    const subTotal = selectedModifier?.reduce(
      (pc: number, item: any) => pc + item?.subTotal,
      0
    );

    const vatAmount = selectedModifier?.reduce(
      (pc: number, item: any) => pc + item?.vatAmount,
      0
    );

    const item = {
      productRef: _id,
      categoryRef: categoryRef || "",
      image: variant.image || product.image || "",
      name: { en: name.en, ar: name.ar },
      category: { name: category.name },
      costPrice: variant?.costPrice,
      sellingPrice:
        getItemSellingPrice(variant.price, tax.percentage) + subTotal,
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
      vatAmount: getItemVAT(variant.price, tax.percentage) + vatAmount,
      qty: quantity,
      hasMultipleVariants: product.variants.length > 1,
      itemSubTotal: getItemSellingPrice(variant.price, tax.percentage),
      itemVAT: getItemVAT(variant.price, tax.percentage),
      total: totalPrice,
      unit: variant.unit || "perItem",
      noOfUnits: Number(variant?.unitCount || 1),
      note: "",
      availability: variant.availability,
      tracking: variant.tracking,
      stockCount: variant.count,
      modifiers: selectedModifier,
      productModifiers: modifiers,
    };

    cart.addToCart(item, (items: any) => {
      trigger("itemAdded", null, items, null, null);
    });

    handleClose();
  };

  useEffect(() => {
    if (open) {
      setQuantity(1);
      setSelectedModifier([]);
    }
  }, [open]);

  useEffect(() => {
    updateTotalPrice();
  }, [quantity, selectedModifier]);

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
          sx={{
            pt: 2,
            pb: 1,
            px: "15px",
            zIndex: 999,
            width: { xs: "100%", md: "80%" },
            // width: "auto",
            display: "flex",
            flex: "0 0 auto",
            position: "fixed",
            alignItems: "center",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            justifyContent: "space-between",
            backgroundColor: "background.paper",
          }}
          role="presentation"
          onClick={handleClose}
          onKeyDown={handleClose}
        >
          <Box sx={{ pr: "15px" }}>
            <Typography
              variant="h6"
              fontWeight={"normal"}
              style={{
                textTransform: "capitalize",
              }}
            >
              {isRTL ? product?.name.ar : product?.name.en}
            </Typography>

            <Typography
              variant="h5"
              sx={{ mt: 1 }}
              style={{
                textTransform: "capitalize",
              }}
            >
              {t("Customise as per your taste")}
            </Typography>
          </Box>

          <Box
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
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

        <Divider sx={{ mt: 10 }} />

        <Box
          sx={{
            height: "100%",
            flex: "1 1 auto",
            overflow: "scroll",
            overflowX: "hidden",
          }}
        >
          <Box
            sx={{
              background: (theme) =>
                theme.palette.mode !== "dark"
                  ? theme.palette.grey[50]
                  : "#111927",
            }}
            style={{
              padding: 3,
              paddingBottom: "30px",
            }}
          >
            {product?.modifiers?.map((modifier: any) => {
              if (modifier.status === "inactive") {
                return <></>;
              }

              return (
                <Box key={modifier.modifierRef} sx={{ mb: 2, px: "15px" }}>
                  <Box sx={{ pt: 2, pb: 1.5 }}>
                    <Typography variant="h5">{modifier.name}</Typography>

                    {modifier.min === 1 && modifier.max === 1 ? (
                      <Typography
                        sx={{ mt: 1 }}
                        variant="subtitle2"
                        color="text.secondary"
                      >
                        {`${t("Select any")} ${modifier.max}`}
                      </Typography>
                    ) : modifier.max > 0 ? (
                      <Typography
                        sx={{ mt: 1 }}
                        variant="subtitle2"
                        color="text.secondary"
                      >
                        {`${t("Select upto")} ${modifier.max}`}
                      </Typography>
                    ) : modifier.min > 0 ? (
                      <Typography
                        sx={{ mt: 1 }}
                        variant="subtitle2"
                        color="text.secondary"
                      >
                        {`${t("Select minimum")} ${modifier.max}`}
                      </Typography>
                    ) : (
                      <></>
                    )}
                  </Box>

                  <Box
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: "background.paper",
                    }}
                  >
                    {modifier.values?.map((option: any) => {
                      if (modifier?.excluded?.includes(option._id)) {
                        return <></>;
                      }

                      return (
                        <Box
                          key={option._id}
                          sx={{
                            px: "15px",
                            py: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            opacity: option.status === "inactive" ? 0.5 : 1,
                          }}
                          onClick={() => {
                            if (option.status === "inactive") {
                              toast.error(t("This option has been sold out"));
                            } else if (!maxModifierSelected(modifier, option)) {
                              updateModifier(modifier, option);
                            } else {
                              toast.error(
                                t(
                                  "Already selected maximum options for this modifier"
                                )
                              );
                            }
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box sx={{ mt: 1.25 }}>
                              {option.contains === "egg" ? (
                                <Egg />
                              ) : option.contains === "non-veg" ? (
                                <NonVeg />
                              ) : (
                                <Veg />
                              )}
                            </Box>

                            <Typography
                              variant="body2"
                              align="left"
                              sx={{ ml: 1 }}
                            >
                              {option.name}
                            </Typography>
                          </Box>

                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography align="left" variant="body2">
                              {`${currency} ${toFixedNumber(option.price)}`}
                            </Typography>

                            {modifier.min === 1 && modifier.max === 1 ? (
                              <Radio
                                style={{
                                  marginRight: -8,
                                  color: checkModifierSelect(modifier, option)
                                    ? theme.palette.mode === "dark"
                                      ? "#0C9356"
                                      : "#006C35"
                                    : "",
                                }}
                                checked={checkModifierSelect(modifier, option)}
                              />
                            ) : (
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
                                checked={checkModifierSelect(modifier, option)}
                              />
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        <Box role="presentation" sx={{ px: "15px", py: "18px", width: "auto" }}>
          <Box
            style={{
              gap: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                py: 1,
                borderRadius: 1,
                minWidth: { xs: "25%", md: "15%" },
                display: "flex",
                alignItems: "center",
                border:
                  theme.palette.mode === "dark"
                    ? "1px solid #0C9356"
                    : "1px solid #006C35",
                justifyContent: "space-between",
              }}
            >
              <Box
                sx={{ flex: 1, display: "flex", justifyContent: "center" }}
                onClick={() => {
                  if (quantity - 1 === 0) {
                    handleClose();
                    return;
                  }
                  setQuantity(quantity - 1);
                }}
              >
                <Remove
                  sx={{
                    color:
                      theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
                  }}
                />
              </Box>

              <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <Typography
                  fontWeight={"bold"}
                  color={theme.palette.mode === "dark" ? "#0C9356" : "#006C35"}
                >
                  {quantity}
                </Typography>
              </Box>

              <Box
                sx={{ flex: 1, display: "flex", justifyContent: "center" }}
                onClick={() => {
                  setQuantity(quantity + 1);
                }}
              >
                <Add
                  sx={{
                    color:
                      theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
                  }}
                />
              </Box>
            </Box>

            <LoadingButton
              type="submit"
              variant="contained"
              sx={{
                py: 1.25,
                width: { xs: "100%", md: "30%" },
                borderRadius: 1,
                background:
                  theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
              }}
              onClick={() => {
                handleAdd();
              }}
            >
              {`${t("Add Item")} | ${currency} ${toFixedNumber(totalPrice)}`}
            </LoadingButton>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};
