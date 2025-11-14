import { Close } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Divider, Drawer, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Egg } from "src/icons/egg";
import { NonVeg } from "src/icons/non-veg";
import { Veg } from "src/icons/veg";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { CartModifierDrawer } from "./cart-modifiers-drawer";
import { useCurrency } from "src/utils/useCurrency";

interface ModifierDrawerProps {
  open: boolean;
  handleClose: any;
  product: any;
  handleChoose: any;
  handleRepeatLast: any;
}

export const CartCustomizeRepeatDrawer: React.FC<ModifierDrawerProps> = ({
  open = false,
  handleClose,
  product,
  handleChoose,
  handleRepeatLast,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const currency = useCurrency();

  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const [openModifierDrawer, setOpenModifierDrawer] = useState<boolean>(false);

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
            background: "background.paper",
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
              p: "5px",
              top: 20,
              right: 16,
              borderRadius: 10,
              display: "flex",
              background: "#fff",
              position: "absolute",
              alignItems: "center",
              justifyContent: "flex-end",
              border: "1px solid lightgray",
            }}
            onClick={() => {
              handleClose();
            }}
          >
            <Close sx={{ width: 18, height: 18 }} />
          </Box>
        </Box>

        <Box
          sx={{
            mt: 3.5,
            mb: 2,
            flex: 1,
            pl: "16px",
            pr: "20px",
            display: "flex",
          }}
        >
          {product?.data?.contains === "egg" ? (
            <Egg />
          ) : product?.data?.contains === "non-veg" ? (
            <NonVeg />
          ) : (
            <Veg />
          )}

          <Box sx={{ mt: -0.6, ml: 0.4 }}>
            <Typography fontSize="20px" variant="subtitle1" fontWeight="700">
              {isRTL ? product?.data?.name?.ar : product?.data?.name?.en}
            </Typography>

            <Typography
              sx={{ mt: 0.25 }}
              variant="subtitle2"
              fontSize="14px"
              color="text.secondary"
            >
              {`${currency} ${toFixedNumber(product?.data?.total)}`}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderStyle: "dotted" }} />

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
          <Box sx={{ pt: 2, mb: 2, gap: 2.5, px: "14px", display: "flex" }}>
            <LoadingButton
              type="submit"
              variant="contained"
              sx={{
                py: 1.5,
                width: "100%",
                borderRadius: 1,
                color: theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
                bgcolor:
                  theme.palette.mode === "dark" ? "#0C935633" : "#006C3533",
              }}
              onClick={() => {
                setOpenModifierDrawer(true);
              }}
            >
              {t("I'll Choose")}
            </LoadingButton>

            <LoadingButton
              type="submit"
              variant="contained"
              sx={{
                py: 1.5,
                width: "100%",
                borderRadius: 1,
                bgcolor: theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
              }}
              onClick={() => {
                handleRepeatLast();
              }}
            >
              {t("Repeat Last")}
            </LoadingButton>
          </Box>
        </Box>
      </Drawer>

      {openModifierDrawer && (
        <CartModifierDrawer
          open={openModifierDrawer}
          handleClose={() => {
            handleClose();
            setOpenModifierDrawer(false);
          }}
          handleSuccess={() => {
            handleChoose();
            setOpenModifierDrawer(false);
          }}
          product={product}
        />
      )}
    </>
  );
};
