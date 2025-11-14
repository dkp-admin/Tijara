import { Add, Close, Remove } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Divider, Drawer, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import useItems from "src/hooks/use-items";
import { Egg } from "src/icons/egg";
import { NonVeg } from "src/icons/non-veg";
import { Veg } from "src/icons/veg";
import cart from "src/utils/cart";
import { getUpdatedProductStock } from "src/utils/check-updated-product-stock";
import { trigger } from "src/utils/custom-event";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { ModifierDrawer } from "./modifiers-drawer";
import { useCurrency } from "src/utils/useCurrency";

interface ProductDetailsDrawerProps {
  open: boolean;
  handleClose: any;
  product: any;
  variant: any;
  locationRef: string;
}

export const ModifierCustomisationDrawer: React.FC<
  ProductDetailsDrawerProps
> = ({ open = false, handleClose, product, variant, locationRef }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { items } = useItems();
  const currency = useCurrency();

  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const [openModifierDrawer, setOpenModifierDrawer] = useState<boolean>(false);

  const getModifierName = (data: any) => {
    let name = "";

    data?.modifiers?.map((mod: any) => {
      name += `${name === "" ? "" : ", "}${mod.optionName}`;
    });

    return name;
  };

  const checkItemUpdate = (type: "increment" | "decrement", index: number) => {
    const data = items[index];
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
        handleUpdateItem(data, index, quantity);
      }
    } else {
      handleUpdateItem(data, index, quantity);
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

  useEffect(() => {
    const prod = items.filter(
      (item: any) =>
        item.productRef === product?._id && item.sku === variant?.sku
    );

    if (prod?.length === 0) {
      handleClose();
    }
  }, [items]);

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
            background: (theme) =>
              theme.palette.mode !== "dark"
                ? theme.palette.grey[200]
                : "#111927",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
          }}
          role="presentation"
        >
          <Box
            sx={{
              p: "4px",
              top: 20,
              right: 16,
              borderRadius: 10,
              display: "flex",
              background: "#fff",
              position: "absolute",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
            onClick={() => {
              handleClose();
            }}
          >
            <Close />
          </Box>
        </Box>

        <Box sx={{ mt: 3, mb: 0.5, flex: 1, pl: "16px", pr: "20px" }}>
          <Typography
            fontSize="15px"
            variant="subtitle1"
            color="text.secondary"
          >
            {isRTL ? product?.name?.ar : product?.name?.en}
          </Typography>

          <Typography
            variant="subtitle2"
            fontSize="22px"
            fontWeight="700"
            style={{
              textTransform: "capitalize",
            }}
          >
            {t("Your Customisations")}
          </Typography>
        </Box>

        <Box
          sx={{
            pt: 1,
            pb: 2,
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
                  ? theme.palette.grey[200]
                  : "#111927",
            }}
            style={{
              padding: 3,
              paddingBottom: "30px",
            }}
          >
            <Box sx={{ mb: 2, px: "12px" }}>
              <Box
                sx={{
                  pt: 2,
                  borderRadius: 2,
                  bgcolor: "background.paper",
                }}
              >
                {items?.map((item: any, index: number) => {
                  if (
                    item.productRef !== product?._id &&
                    item.sku !== variant?.sku
                  ) {
                    return <></>;
                  }

                  return (
                    <Box key={index}>
                      <Box
                        sx={{
                          gap: 4,
                          py: "3px",
                          px: "15px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box sx={{ width: "100%" }}>
                          {item.contains === "egg" ? (
                            <Egg />
                          ) : item.contains === "non-veg" ? (
                            <NonVeg />
                          ) : (
                            <Veg />
                          )}

                          <Typography
                            sx={{ mt: -0.5 }}
                            fontSize="13px"
                            variant="body2"
                          >
                            {getModifierName(item)}
                          </Typography>

                          <Typography
                            sx={{ mt: 2 }}
                            fontSize="15px"
                            fontWeight="600"
                            variant="subtitle2"
                          >
                            {`${currency} ${toFixedNumber(item.total)}`}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            width: "40%",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Box
                            sx={{
                              py: 1,
                              width: "100%",
                              borderRadius: 1,
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
                                checkItemUpdate("decrement", index);
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
                                {item.qty}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                flex: 1,
                                display: "flex",
                                justifyContent: "center",
                              }}
                              onClick={() => {
                                checkItemUpdate("increment", index);
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
                        </Box>
                      </Box>

                      <Divider sx={{ pt: 1, borderStyle: "dotted" }} />
                    </Box>
                  );
                })}

                <LoadingButton
                  type="submit"
                  variant="text"
                  sx={{
                    pt: 1.5,
                    width: "100%",
                    borderRadius: 1,
                    color:
                      theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
                  }}
                  onClick={() => {
                    setOpenModifierDrawer(true);
                  }}
                >
                  {t("Add new customisation")}
                </LoadingButton>
              </Box>
            </Box>
          </Box>
        </Box>
      </Drawer>

      {openModifierDrawer && (
        <ModifierDrawer
          open={openModifierDrawer}
          handleClose={() => {
            setOpenModifierDrawer(false);
          }}
          locationRef={locationRef}
          product={product}
          variant={variant}
        />
      )}
    </>
  );
};
