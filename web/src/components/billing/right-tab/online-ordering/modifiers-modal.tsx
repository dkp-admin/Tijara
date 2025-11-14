import { Add, Remove } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
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
  Radio,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useEntity } from "src/hooks/use-entity";
import { Egg } from "src/icons/egg";
import { NonVeg } from "src/icons/non-veg";
import { Veg } from "src/icons/veg";
import { getItemSellingPrice, getItemVAT } from "src/utils/get-price";
import { toFixedNumber } from "src/utils/toFixedNumber";
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

interface ModifierModalProps {
  data: any;
  order: any;
  open: boolean;
  handleClose: any;
  handleSuccess: any;
}

export const ModifiersModal: React.FC<ModifierModalProps> = ({
  data,
  order,
  open = false,
  handleClose,
  handleSuccess,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const currency = useCurrency();

  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const { updateEntity: updateOrder, loading } = useEntity("ordering/order");

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

  const getPaymentData = (items: any[]) => {
    return items.reduce(
      (accumulator: any, item: any) => {
        let totalVat = accumulator.vatAmount;
        let totalAmount = accumulator.total;
        let totalModifierAmount = 0;
        let totalModifierVAT = 0;

        if (item?.modifiers?.length > 0) {
          totalModifierAmount =
            item?.modifiers?.reduce(
              (ac: number, ar: any) => ac + Number(ar.total),
              0
            ) * Number(item.quantity);

          totalModifierVAT =
            item?.modifiers?.reduce(
              (ac: number, ar: any) => ac + Number(ar.vatAmount),
              0
            ) * Number(item.quantity);
        }

        totalVat += Number(
          getItemVAT(
            item.billing.total - totalModifierAmount,
            item.billing.vatPercentage
          ) + totalModifierVAT
        );

        totalAmount += item.billing.total;

        return {
          total: Number(totalAmount),
          subTotal: Number(totalAmount) - Number(totalVat),
          vatAmount: Number(totalVat),
          vatWithoutDiscount: Number(totalVat),
          subTotalWithoutDiscount: Number(totalAmount) - Number(totalVat),
        };
      },
      {
        total: 0,
        subTotal: 0,
        vatAmount: 0,
        vatWithoutDiscount: 0,
        subTotalWithoutDiscount: 0,
      }
    );
  };

  const handleAdd = async () => {
    if (checkModifierSelected()) {
      return;
    }

    const addedItems = order?.items?.map((item: any) => {
      return {
        productRef: item.productRef,
        variant: {
          sku: item.variant.sku,
          type: item.variant.type,
          boxSku: item.variant?.boxSku || "",
          crateSku: item.variant?.crateSku || "",
          boxRef: item.variant?.boxRef || null,
          crateRef: item.variant?.crateRef || null,
          unit: item?.variant?.unit || "perItem",
          unitCount: item?.variant?.unitCount || 1,
        },
        quantity: item.quantity,
        hasMultipleVariants: item.hasMultipleVariants,
        modifiers: item.modifiers?.map((modifier: any) => {
          return {
            modifierRef: modifier.modifierRef,
            modifier: modifier.name,
            optionId: modifier.optionId,
            optionName: modifier.optionName,
          };
        }),
        categoryRef: item.categoryRef,
        billing: {
          total: item.billing.total,
          vatAmount: item.billing.vatAmount,
          vatPercentage: item.billing.vatPercentage,
        },
      };
    });

    const dataObj = {
      productRef: data.productRef,
      variant: {
        sku: data.sku,
        type: data.type,
        boxSku: data.boxSku,
        crateSku: data.crateSku,
        boxRef: data.boxRef,
        crateRef: data.crateRef,
        unit: data.unit || "perItem",
        unitCount: data.unitCount || 1,
      },
      quantity: quantity,
      hasMultipleVariants: data.hasMultipleVariants,
      modifiers: selectedModifier?.map((modifier: any) => {
        return {
          modifierRef: modifier.modifierRef,
          modifier: modifier.name,
          optionId: modifier.optionId,
          optionName: modifier.optionName,
          total: modifier.total,
          vatAmount: modifier.vatAmount,
        };
      }),
      categoryRef: data.categoryRef,
      billing: {
        total: (data?.itemSubTotal + data?.itemVAT) * quantity,
        vatAmount: data?.itemVAT,
        vatPercentage: data?.tax,
      },
    };

    const payment = getPaymentData([...addedItems, dataObj]);

    try {
      const res = await updateOrder(order?._id, {
        items: [...addedItems, dataObj],
        deletedItems: order?.deletedItems,
        companyRef: order?.companyRef,
        locationRef: order?.locationRef,
        discount: order?.payment?.discountCode || "",
        charges: order?.charges?.map((charge: any) => charge?._id) || [],
        startOfDay,
        endOfDay,
        customerRef: order?.customerRef,
        payment: {
          ...order?.payment,
          paymentStatus: order?.payment?.paymentStatus,
          paymentType: order?.payment?.paymentType,
          total: payment?.total,
          subTotal: payment?.subTotal,
          vatAmount: payment?.vatAmount,
          vatWithoutDiscount: payment?.vatWithoutDiscount,
          subTotalWithoutDiscount: payment?.subTotalWithoutDiscount,
        },
      });

      if (res) {
        handleSuccess();
      }
    } catch (error: any) {
      toast.error(error.message);
    }
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
        <Dialog fullWidth open={open} maxWidth="md" fullScreen={isMobile}>
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
              px: 2,
              mb: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
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
                  if (quantity - 1 > 0) {
                    setQuantity(quantity - 1);
                  }
                }}
              >
                <Remove sx={{ color: "#006C35" }} />
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
                <Add sx={{ color: "#006C35" }} />
              </Box>
            </Box>

            <LoadingButton
              size="medium"
              type="submit"
              variant="contained"
              sx={{ borderRadius: 1 }}
              onClick={() => {
                handleAdd();
              }}
              loading={loading}
            >
              {`${t("Add Item")} | ${currency} ${toFixedNumber(totalPrice)}`}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};
