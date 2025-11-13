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
import { trigger } from "src/utils/custom-event";
import { getItemSellingPrice, getItemVAT } from "src/utils/get-price";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

interface ModifierDrawerProps {
  open: boolean;
  handleClose: any;
  product: any;
  handleSuccess: any;
}

export const CartModifierDrawer: React.FC<ModifierDrawerProps> = ({
  open = false,
  handleClose,
  product,
  handleSuccess,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const currency = useCurrency();

  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const [totalPrice, setTotalPrice] = useState(0);
  const [showCustomised, setShowCustomised] = useState(false);
  const [selectedModifier, setSelectedModifier] = useState<any>([]);

  const updateTotalPrice = () => {
    const price = selectedModifier?.reduce(
      (pc: number, item: any) => pc + item?.total,
      0
    );

    const productPrice = product?.data?.itemSubTotal + product?.data?.itemVAT;
    const quantity = product?.isAdd ? 1 : product?.data?.qty;

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
    for (let i = 0; i < product?.data?.productModifiers?.length; i++) {
      const modifier = selectedModifier?.filter(
        (item: any) =>
          item.modifierRef === product?.data?.productModifiers[i].modifierRef
      );

      if (
        product?.data?.productModifiers[i].min !== 0 &&
        product?.data?.productModifiers[i].min > (modifier?.length || 0)
      ) {
        toast.error(
          `${t("Please select")} ${product?.data?.productModifiers[i].name} ${t(
            "minimum"
          )} ${product?.data?.productModifiers[i].min}`
        );
        return true;
      }
    }

    return false;
  };

  const sameModifierCheck = () => {
    let itemIndex = -1;

    for (let index = 0; index < cart.getCartItems()?.length; index++) {
      for (let i = 0; i < cart.getCartItems()[index].modifiers?.length; i++) {
        const idx = selectedModifier?.findIndex(
          (item: any) =>
            item.modifierRef ===
              cart.getCartItems()[index].modifiers[i].modifierRef &&
            item.optionId === cart.getCartItems()[index].modifiers[i].optionId
        );

        if (
          idx !== -1 &&
          selectedModifier?.length ===
            cart.getCartItems()[index].modifiers?.length
        ) {
          itemIndex = index;
        } else {
          itemIndex = -1;
          break;
        }
      }

      if (itemIndex !== -1) {
        return itemIndex;
      }
    }

    return itemIndex;
  };

  const handleAdd = () => {
    if (checkModifierSelected()) {
      return;
    }

    const itemIndex = sameModifierCheck();

    if (itemIndex !== -1) {
      const updatedQty = cart.getCartItems()[itemIndex]?.qty + 1;
      const updatedTotal = cart.getCartItems()[itemIndex]?.total + totalPrice;

      cart.updateCartItem(
        itemIndex,
        {
          ...cart.getCartItems()[itemIndex],
          qty: updatedQty,
          total: updatedTotal,
        },
        (updatedItems: any) => {
          trigger("itemUpdated", null, updatedItems, null, null);
        }
      );

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

    const productPrice = product?.data?.itemSubTotal + product?.data?.itemVAT;

    const item = {
      ...product?.data,
      sellingPrice:
        getItemSellingPrice(productPrice, product?.data?.vat) + subTotal,
      vatAmount: getItemVAT(productPrice, product?.data?.vat) + vatAmount,
      qty: 1,
      itemSubTotal: getItemSellingPrice(productPrice, product?.data?.vat),
      itemVAT: getItemVAT(productPrice, product?.data?.vat),
      total: totalPrice,
      modifiers: selectedModifier,
    };

    cart.addToCart(item, (items: any) => {
      trigger("itemAdded", null, items, null, null);
    });

    handleSuccess();
  };

  const handleUpdate = () => {
    if (checkModifierSelected()) {
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

    cart.updateCartItem(
      product?.index,
      {
        ...product?.data,
        total: totalPrice,
        sellingPrice: product?.data?.itemSubTotal + subTotal,
        vatAmount: product?.data?.itemVAT + vatAmount,
        modifiers: selectedModifier,
      },
      (updatedItems: any) => {
        trigger("itemUpdated", null, updatedItems, null, null);
      }
    );

    handleSuccess();
  };

  const getModifierName = () => {
    let name = "";

    selectedModifier?.map((mod: any) => {
      name += `${name === "" ? "" : ", "}${mod.name} - ${mod.optionName}`;
    });

    return name;
  };

  useEffect(() => {
    if (open) {
      setSelectedModifier(product?.data?.modifiers);
    }
  }, [open]);

  useEffect(() => {
    updateTotalPrice();
  }, [selectedModifier]);

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
            width: "100%",
            display: "flex",
            flex: "0 0 auto",
            position: "fixed",
            alignItems: "center",
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
              {isRTL ? product?.data?.name.ar : product?.data?.name.en}
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
                  ? theme.palette.grey[100]
                  : "#111927",
            }}
            style={{
              padding: 3,
              paddingBottom: "30px",
            }}
          >
            {product?.data?.productModifiers?.map((modifier: any) => {
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
                      border: "0.25px solid lightgray",
                    }}
                  >
                    {modifier.values?.map((option: any) => {
                      if (modifier?.excluded?.includes(option._id)) {
                        return <></>;
                      }

                      return (
                        <Box
                          key={option.id}
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
          {showCustomised && (
            <Box>
              <Typography
                sx={{
                  px: 0.5,
                  py: 0.5,
                  fontSize: "14px",
                  textTransform: "capitalize",
                }}
                align="left"
                variant="body1"
              >
                {getModifierName()}
              </Typography>

              <Divider sx={{ mt: 1, mb: 2 }} />
            </Box>
          )}

          <Box
            style={{
              gap: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ minWidth: "35%", alignItems: "center" }}>
              <Typography fontWeight="bold">
                {`${currency} ${toFixedNumber(totalPrice)}`}
              </Typography>

              <Box
                onClick={() => {
                  setShowCustomised(!showCustomised);
                }}
              >
                <Typography
                  color="error"
                  fontSize="12px"
                  variant="subtitle1"
                  fontWeight="semibold"
                  sx={{ mt: 0.25, textTransform: "initial" }}
                >
                  {t("View Customised Items")}
                </Typography>
              </Box>
            </Box>

            <LoadingButton
              type="submit"
              variant="contained"
              sx={{
                py: 1.25,
                width: "100%",
                borderRadius: 1,
                background:
                  theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
              }}
              onClick={() => {
                if (product?.isAdd) {
                  handleAdd();
                } else {
                  handleUpdate();
                }
              }}
            >
              {product?.isAdd
                ? t("Add Item to Cart")
                : t("Update Item to Cart")}
            </LoadingButton>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};
