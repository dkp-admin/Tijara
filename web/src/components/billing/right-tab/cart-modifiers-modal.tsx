import { Add, Remove } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  Input,
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
import { getUpdatedProductStock } from "src/utils/check-updated-product-stock";
import { getItemSellingPrice, getItemVAT } from "src/utils/get-price";
import { toFixedNumber } from "src/utils/toFixedNumber";
import CloseIcon from "@mui/icons-material/Close";
import { useCurrency } from "src/utils/useCurrency";

interface ModifierModalProps {
  data: any;
  index: number;
  open: boolean;
  location: any;
  onDelete: any;
  onChange: any;
  handleClose: any;
}

export const CartModifiersModal: React.FC<ModifierModalProps> = ({
  data,
  index = -1,
  open = false,
  location,
  onDelete,
  onChange,
  handleClose,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  // const { customCharges } = useCartStore();
  // const { totalCharges, chargesApplied, totalAmount, subTotalWithoutDiscount } =
  //   useItems();
  const currency = useCurrency();

  const [quantity, setQuantity] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showCustomised, setShowCustomised] = useState(false);
  const [selectedModifier, setSelectedModifier] = useState<any>([]);

  const checkOutOfStockItem = (val: any) => {
    if (!Boolean(location?.allowNegativeBilling) && data.tracking) {
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
        setQuantity(val);
      }
    } else {
      setQuantity(val);
    }
  };

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

  const handleUpdate = () => {
    if (data?.modifiers?.length > 0 && checkModifierSelected()) {
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

    onChange(
      {
        ...data,
        qty: quantity,
        total: totalPrice,
        sellingPrice: data?.itemSubTotal + subTotal,
        vatAmount: data?.itemVAT + vatAmount,
        modifiers: selectedModifier,
      },
      index
    );

    // autoApplyCustomCharges(
    //   totalPrice +
    //     totalAmount -
    //     (data?.itemSubTotal + data?.itemVAT) * data?.qty -
    //     totalCharges +
    //     totalCharges,
    //   customCharges,
    //   chargesApplied,
    //   getItemSellingPrice(totalPrice, data.vat) + subTotalWithoutDiscount
    // );
    handleClose();
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
      setQuantity(data?.qty);
      setSelectedModifier(data?.modifiers || []);
    }
  }, [open, data]);

  useEffect(() => {
    updateTotalPrice();
  }, [quantity, selectedModifier]);

  return (
    <>
      <Box>
        <Dialog fullWidth maxWidth="md" open={open}>
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
          <DialogContent>
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={4.5} md={3} lg={2.5}>
                  <Typography sx={{ mb: 0.5, ml: 1.25 }} variant="subtitle2">
                    {t("Quantity")}
                  </Typography>

                  <Box
                    sx={{
                      py: 1,
                      borderRadius: 1,
                      minWidth: "25%",
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
                      sx={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                      }}
                      onClick={() => {
                        if (quantity > 1) {
                          setQuantity(quantity - 1);
                        }
                      }}
                    >
                      <Remove
                        sx={{
                          color:
                            quantity === 1
                              ? "lightGray"
                              : theme.palette.mode === "dark"
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
                          theme.palette.mode === "dark" ? "#0C9356" : "#006C35"
                        }
                      >
                        {quantity}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                      }}
                      onClick={() => {
                        setQuantity(quantity + 1);
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
                </Grid>

                <Grid item xs={2} md={5} lg={6.5}></Grid>

                <Grid item xs={5.5} md={4} lg={3}>
                  <Typography sx={{ mb: 0.5, ml: 1.25 }} variant="subtitle2">
                    {t("Item Price")}
                  </Typography>

                  <Input
                    disabled
                    fullWidth
                    disableUnderline
                    sx={{
                      px: 1.5,
                      py: 0.75,
                      flexGrow: 1,
                      borderRadius: 1,
                      border: "1px solid lightGray",
                    }}
                    value={`${currency} ${toFixedNumber(
                      Number(data.sellingPrice + data.vatAmount)
                    )}`}
                  />
                </Grid>
              </Grid>

              <Typography sx={{ mt: 3 }} variant="h6">
                {t("Customise as per your taste")}
              </Typography>

              {data?.productModifiers?.map((modifier: any) => {
                if (modifier.status === "inactive") {
                  return <Fragment key={modifier.modifierRef}></Fragment>;
                }

                return (
                  <Fragment key={modifier.modifierRef}>
                    <Box sx={{ mt: 3, mb: 1.25 }}>
                      <Typography variant="subtitle1">
                        {modifier.name}
                      </Typography>

                      {modifier.min === 1 && modifier.max === 1 ? (
                        <Typography
                          sx={{ mt: 0.5 }}
                          variant="body2"
                          color="text.secondary"
                        >
                          {`${t("Select any")} ${modifier.max}`}
                        </Typography>
                      ) : modifier.max > 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          {`${t("Select upto")} ${modifier.max}`}
                        </Typography>
                      ) : modifier.min > 0 ? (
                        <Typography
                          sx={{ mt: 0.5 }}
                          variant="body2"
                          color="text.secondary"
                        >
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
                                  toast.error(
                                    t("This option has been sold out")
                                  );
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

              <Button
                sx={{ mt: 2, color: "#F44837" }}
                variant="text"
                onClick={() => {
                  const updatedTotal =
                    (Number(data.sellingPrice) + Number(data.vatAmount)) *
                    quantity;

                  onDelete({
                    ...data,
                    qty: quantity,
                    total: updatedTotal,
                    modifiers: selectedModifier,
                  });
                  handleClose();
                }}
              >
                {t("Remove Item")}
              </Button>
            </Box>

            {showCustomised && (
              <Box
                sx={{
                  width: "100%",
                  bottom: "95px",
                  position: "absolute",
                  background:
                    theme.palette.mode !== "dark" ? `#fff` : "#111927",
                }}
              >
                <Divider sx={{ my: 0.75 }} />

                <Typography
                  sx={{ px: 3, py: 0.5, fontSize: "14px" }}
                  align="left"
                  variant="body1"
                >
                  {getModifierName()}
                </Typography>

                <Divider sx={{ mt: 0.5 }} />
              </Box>
            )}
          </DialogContent>

          <Divider />
          <DialogActions
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
            }}
          >
            <Box>
              <Typography fontWeight="bold" variant="h6">
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
                  sx={{ mt: 0.5, textTransform: "initial" }}
                >
                  {t("View Customised Items")}
                </Typography>
              </Box>
            </Box>

            <LoadingButton
              type="submit"
              variant="contained"
              sx={{
                borderRadius: 1,
              }}
              onClick={() => {
                handleUpdate();
              }}
            >
              {t("Update Item to Cart")}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};
