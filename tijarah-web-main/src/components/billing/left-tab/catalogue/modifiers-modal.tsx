import { Add, Remove } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  Modal,
  Radio,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
// import useItems from "src/hooks/use-items";
import { Egg } from "src/icons/egg";
import { NonVeg } from "src/icons/non-veg";
import { Veg } from "src/icons/veg";
// import useCartStore from "src/store/cart-item";
// import { autoApplyCustomCharges } from "src/utils/auto-apply-custom-charge";
import cart from "src/utils/cart";
import { trigger } from "src/utils/custom-event";
import { getItemSellingPrice, getItemVAT } from "src/utils/get-price";
import { toFixedNumber } from "src/utils/toFixedNumber";
import CloseIcon from "@mui/icons-material/Close";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useCurrency } from "src/utils/useCurrency";

interface ModifierModalProps {
  data: any;
  open: boolean;
  handleClose: any;
  handleSuccess: any;
}

export const ModifiersModal: React.FC<ModifierModalProps> = ({
  data,
  open = false,
  handleClose,
  handleSuccess,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // const { customCharges } = useCartStore();
  // const { totalCharges, chargesApplied, totalAmount, subTotalWithoutDiscount } =
  //   useItems();

  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";
  const currency = useCurrency();
  const [quantity, setQuantity] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedModifier, setSelectedModifier] = useState<any>([]);

  const updateTotalPrice = () => {
    const price = selectedModifier?.reduce(
      (pc: number, item: any) => pc + item?.total,
      0
    );

    const productPrice = data?.itemSubTotal + data?.itemVAT;

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
    for (let i = 0; i < data?.productModifiers?.length; i++) {
      const modifier = selectedModifier?.filter(
        (item: any) =>
          item.modifierRef === data?.productModifiers[i].modifierRef
      );

      if (
        data?.productModifiers[i].min !== 0 &&
        data?.productModifiers[i].min > (modifier?.length || 0)
      ) {
        toast.error(
          `${t("Please select")} ${data?.productModifiers[i].name} ${t(
            "minimum"
          )} ${data?.productModifiers[i].min}`
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

    const localItems = cart.getCartItems() || [];
    const idx = localItems.findIndex(
      (item: any) => data.sellingPrice && item.sku === data.sku
    );
    const isSpecialItem =
      data?.name?.en === "Open Item" ||
      data.unit !== "perItem" ||
      data?.isOpenPrice;

    if (idx !== -1 && !isSpecialItem && sameModifierCheck(localItems[idx])) {
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

      // autoApplyCustomCharges(
      //   totalPrice + totalAmount - totalCharges + totalCharges,
      //   customCharges,
      //   chargesApplied,
      //   localItems[idx].sellingPrice * quantity + subTotalWithoutDiscount
      // );

      handleSuccess();
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
      ...data,
      qty: quantity,
      sellingPrice: data?.itemSubTotal + subTotal,
      vatAmount: data?.itemVAT + vatAmount,
      total: totalPrice,
      modifiers: selectedModifier,
      productModifiers: data?.productModifiers,
    };

    cart.addToCart(item, (items: any) => {
      trigger("itemAdded", null, items, null, null);
    });

    // autoApplyCustomCharges(
    //   item.total + totalAmount - totalCharges + totalCharges,
    //   customCharges,
    //   chargesApplied,
    //   item.sellingPrice * quantity + subTotalWithoutDiscount
    // );

    handleSuccess();
  };

  useEffect(() => {
    if (open) {
      setQuantity(data?.qty || 1);
      setSelectedModifier([]);
    }
  }, [open]);

  useEffect(() => {
    updateTotalPrice();
  }, [quantity, selectedModifier]);

  return (
    <>
      <Box>
        <Dialog
          fullWidth
          fullScreen={isMobile ? true : false}
          maxWidth="md"
          open={open}
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
              {isRTL
                ? data?.hasMultipleVariants
                  ? `${data?.name?.ar}, ${data.variantNameAr}`
                  : data?.name?.ar
                : data?.hasMultipleVariants
                ? `${data?.name?.en}, ${data?.variantNameEn}`
                : data?.name?.en}
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
                }}
              />
            </Box>
          </Box>

          <Divider />
          {/* body */}
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="h6" style={{ textTransform: "capitalize" }}>
              {t("Customise as per your taste")}
            </Typography>

            {data?.productModifiers?.map((modifier: any) => {
              if (modifier.status === "inactive") {
                return <Fragment key={modifier.modifierRef}></Fragment>;
              }

              return (
                <Fragment key={modifier.modifierRef}>
                  <Box sx={{ mt: 3, mb: 1.25 }}>
                    <Typography variant="subtitle1">{modifier.name}</Typography>

                    {modifier.min === 1 && modifier.max === 1 ? (
                      <Typography variant="body2" color="text.secondary">
                        {`${t("Select any")} ${modifier.max}`}
                      </Typography>
                    ) : modifier.max > 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        {`${t("Select upto")} ${modifier.max}`}
                      </Typography>
                    ) : modifier.min > 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        {`${t("Select minimum")} ${modifier.max}`}
                      </Typography>
                    ) : (
                      <></>
                    )}
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 1 }}>
                    {modifier.values?.map((option: any) => {
                      if (modifier?.excluded?.includes(option._id)) {
                        return <Fragment key={option._id}></Fragment>;
                      }

                      return (
                        <Grid item md={6} xs={12} key={option._id}>
                          <Card
                            sx={{
                              "&:hover": {
                                backgroundColor: "action.hover",
                                cursor: "pointer",
                              },
                              borderRadius: 1,
                            }}
                            onClick={() => {
                              if (option.status === "inactive") {
                                toast.error(t("This option has been sold out"));
                              } else if (
                                !maxModifierSelected(modifier, option)
                              ) {
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
                            <CardContent
                              style={{
                                textAlign: "center",
                                padding: "15px",
                                paddingTop: "10px",
                                paddingBottom: "8px",
                                paddingLeft: "20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                {option.contains === "egg" ? (
                                  <Egg />
                                ) : option.contains === "non-veg" ? (
                                  <NonVeg />
                                ) : (
                                  <Veg />
                                )}

                                <Typography sx={{ mt: -0.7 }} variant="body2">
                                  {option.name}
                                </Typography>
                              </Box>

                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Typography variant="body2">
                                  {`${currency} ${option.price?.toFixed(2)}`}
                                </Typography>

                                {modifier.min === 1 && modifier.max === 1 ? (
                                  <Radio
                                    checked={checkModifierSelect(
                                      modifier,
                                      option
                                    )}
                                  />
                                ) : (
                                  <Checkbox
                                    checked={checkModifierSelect(
                                      modifier,
                                      option
                                    )}
                                  />
                                )}
                              </Box>
                            </CardContent>
                          </Card>

                          {option.status === "inactive" && (
                            <Typography
                              sx={{ mt: 1, ml: 2 }}
                              fontSize="13px"
                              variant="body2"
                              color="error"
                            >
                              {t("Sold Out")}
                            </Typography>
                          )}
                        </Grid>
                      );
                    })}
                  </Grid>
                </Fragment>
              );
            })}
          </DialogContent>
          <Divider sx={{ mb: 1 }} />

          {/* footer */}
          <DialogActions
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              mb: 1,
            }}
          >
            <Box
              sx={{
                py: 1,
                borderRadius: 1,
                minWidth: isMobile ? "35%" : "28.2%",
                display: "flex",
                alignItems: "center",
                border: "1px solid #006C35",
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
                    color: "#006C35",
                  }}
                />
              </Box>

              <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <Typography fontWeight={"bold"} color={"#006C35"}>
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
                    color: "#006C35",
                  }}
                />
              </Box>
            </Box>

            <LoadingButton
              size="medium"
              type="submit"
              variant="contained"
              sx={{
                borderRadius: 1,
              }}
              onClick={() => {
                handleAdd();
              }}
            >
              {`${t("Add Item")} | ${currency} ${toFixedNumber(totalPrice)}`}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};
