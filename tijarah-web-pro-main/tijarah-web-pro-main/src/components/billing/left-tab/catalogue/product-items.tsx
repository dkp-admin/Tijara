import { Box, SvgIcon, TableCell, Typography, useTheme } from "@mui/material";
import Image01Icon from "@untitled-ui/icons-react/build/esm/Image01";
import { t } from "i18next";
import PropTypes from "prop-types";
import { type FC } from "react";
import { useAuth } from "src/hooks/use-auth";
import { Egg } from "src/icons/egg";
import { NonVeg } from "src/icons/non-veg";
import { Veg } from "src/icons/veg";
import { getUnitName } from "src/utils/constants";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

interface ProductItemsProps {
  productlist: any;
  isRestaurant?: boolean;
  handleProductDetails?: any;
}

export const ProductItems: FC<ProductItemsProps> = (props) => {
  const theme = useTheme();
  const { productlist, isRestaurant, handleProductDetails } = props;
  const { device } = useAuth();
  const currency = useCurrency();
  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const getAvailablityText = (productlist: any) => {
    const stocks = productlist.variants[0].stockConfiguration?.find(
      (stock: any) => stock?.locationRef === device?.locationRef
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

  const getTextColor = (productlist: any) => {
    const stocks = productlist.variants[0].stockConfiguration?.find(
      (stock: any) => stock?.locationRef === device?.locationRef
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

  const displayVariantPrice = (productlist: any) => {
    if (productlist.variants && productlist.variants.length > 0) {
      if (productlist.variants.length === 1) {
        const priceData = productlist.variants[0]?.prices?.find(
          (price: any) => price?.locationRef === device?.locationRef
        );

        return priceData?.price
          ? `${currency} ${toFixedNumber(priceData.price)} ${
              getUnitName[productlist.variants[0]?.unit]
            }`
          : `${t("Custom Price")} ${
              getUnitName[productlist.variants[0]?.unit]
            }`;
      } else {
        return `${
          productlist?.variants?.filter((op: any) => !op?.nonSaleable)?.length
        } ${t("Variants")}`;
      }
    } else {
      return t("No Variant");
    }
  };

  const getActiveModifiers = () => {
    const activeModifiers = productlist?.modifiers?.filter(
      (modifier: any) => modifier.status === "active"
    );

    return activeModifiers?.length > 0;
  };

  const getProductNameInitial = () => {
    const name = productlist.name.en?.split(" ");

    return name?.length > 1
      ? name[0]?.charAt(0)?.toUpperCase() + name[1]?.charAt(0)?.toUpperCase()
      : name[0]?.charAt(0)?.toUpperCase();
  };

  return (
    <>
      <TableCell
        sx={{
          cursor: "pointer",
          borderBottom:
            theme.palette.mode === "dark"
              ? "1px dotted #2D3748"
              : "1px dotted #E5E7EB",
        }}
      >
        <Box
          sx={{
            pl: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {productlist.image ? (
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 1,
                display: "flex",
                overflow: "hidden",
                alignItems: "center",
                backgroundSize: "cover",
                justifyContent: "center",
                backgroundPosition: "center",
                backgroundColor: "neutral.50",
                backgroundImage: `url(${productlist.image})`,
              }}
              onClick={(event) => {
                if (isRestaurant) {
                  event.stopPropagation();
                  handleProductDetails();
                }
              }}
            />
          ) : (
            <Box
              sx={{
                height: 60,
                width: 60,
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                  theme.palette.mode === "dark" ? "#0C935680" : "#006C3580",
              }}
              onClick={(event) => {
                if (isRestaurant) {
                  event.stopPropagation();
                  handleProductDetails();
                }
              }}
            >
              <Typography variant="h6" color="#fff">
                {getProductNameInitial()}
              </Typography>
            </Box>
          )}
          <Box sx={{ flex: 1, ml: 2 }}>
            {(productlist?.contains || productlist?.bestSeller) && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {productlist?.contains === "egg" ? (
                  <Egg sx={{ width: 20, height: 20 }} />
                ) : productlist?.contains === "non-veg" ? (
                  <NonVeg sx={{ width: 20, height: 20 }} />
                ) : productlist?.contains === "veg" ? (
                  <Veg sx={{ width: 20, height: 20 }} />
                ) : (
                  <></>
                )}

                {productlist?.bestSeller && (
                  <Typography
                    sx={{ mt: -0.25, ml: productlist?.contains ? 0.25 : 0 }}
                    fontSize="13px"
                    variant="subtitle1"
                    color="error.main"
                  >
                    {t("Bestseller")}
                  </Typography>
                )}
              </Box>
            )}

            <Typography variant="subtitle2">
              {isRTL ? productlist.name.ar : productlist?.name?.en}
            </Typography>

            {productlist?.modifiers?.length > 0 && getActiveModifiers() && (
              <Typography sx={{ fontSize: "11px" }}>
                {t("Customisable")}
              </Typography>
            )}

            {productlist.variants.length === 1 &&
              getAvailablityText(productlist) && (
                <Typography variant="body2" color={getTextColor(productlist)}>
                  {getAvailablityText(productlist)}
                </Typography>
              )}
          </Box>
        </Box>
      </TableCell>
      <TableCell
        sx={{
          pr: 2.5,
          cursor: "pointer",
          textAlign: "right",
          borderBottom:
            theme.palette.mode === "dark"
              ? "1px dotted #2D3748"
              : "1px dotted #E5E7EB",
        }}
      >
        {displayVariantPrice(productlist)}
      </TableCell>
    </>
  );
};

ProductItems.propTypes = {
  // @ts-ignore
  productlist: PropTypes.object,
};
