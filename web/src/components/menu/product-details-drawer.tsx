import { Close } from "@mui/icons-material";
import { Card, Drawer, SvgIcon } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Image01Icon from "@untitled-ui/icons-react/build/esm/Image01";
import { useTranslation } from "react-i18next";
import { Egg } from "src/icons/egg";
import { NonVeg } from "src/icons/non-veg";
import { Veg } from "src/icons/veg";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

interface ProductDetailsDrawerProps {
  open: boolean;
  handleClose: any;
  productlist: any;
  locationRef: string;
}

export const ProductDetailsDrawer: React.FC<ProductDetailsDrawerProps> = ({
  open = false,
  handleClose,
  productlist,
  locationRef,
}) => {
  const { t } = useTranslation();
  const currency = useCurrency();

  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const displayVariantPrice = () => {
    const variants = getVariants();
    const boxes = productlist?.boxRefs;
    const crates = productlist?.crateRefs;

    if (variants && variants?.length > 0) {
      if (
        variants?.length === 1 &&
        boxes?.length === 0 &&
        crates?.length === 0
      ) {
        const priceData = variants[0]?.prices?.find(
          (p: any) => p?.locationRef === locationRef
        );

        return `${currency} ${toFixedNumber(
          priceData?.price || variants[0]?.price
        )}`;
      } else {
        return `${variants?.length + boxes?.length + crates?.length} ${t(
          "Variants"
        )}`;
      }
    } else {
      return t("No Variant");
    }
  };

  const getVariants = () => {
    const variants = productlist?.variants?.filter(
      (v: any) =>
        !v?.nonSaleable &&
        v?.unit === "perItem" &&
        v?.prices?.find(
          (p: any) =>
            p?.locationRef === locationRef && Number(p?.price || 0) > 0
        )
    );

    return variants;
  };

  const getContainsName = () => {
    let name = "";

    productlist?.nutritionalInformation?.contains?.map((contain: any) => {
      name += `${name === "" ? "" : ","} ${contain}`;
    });

    return name;
  };

  const getPreferenceName = () => {
    let name = "";

    productlist?.nutritionalInformation?.preference?.map((preference: any) => {
      name += `${name === "" ? "" : ","} ${preference}`;
    });

    return name;
  };

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
            height: {
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
            height: "400px",
            display: "flex",
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
          }}
          role="presentation"
        >
          {productlist.image ? (
            <Box
              sx={{
                width: "100%",
                height: "400px",
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: "neutral.100",
                backgroundImage: `url(${productlist.image})`,
              }}
            />
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "400px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "neutral.100",
              }}
            >
              <SvgIcon>
                <Image01Icon />
              </SvgIcon>
            </Box>
          )}

          <Box
            sx={{
              p: "4px",
              top: 12,
              right: 12,
              borderRadius: 10,
              background: "#fff",
              position: "absolute",
              display: "flex",
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

        <Box
          sx={{ mb: 2, flex: 1, pl: "20px", pr: "20px" }}
          style={{ height: "100%", flex: "1 1 auto" }}
        >
          <Box sx={{ mt: 3, display: "flex", alignItems: "center" }}>
            {productlist?.contains === "egg" ? (
              <Egg />
            ) : productlist?.contains === "non-veg" ? (
              <NonVeg />
            ) : productlist?.contains === "veg" ? (
              <Veg />
            ) : (
              <></>
            )}

            {productlist?.bestSeller && (
              <Typography
                sx={{
                  ml: productlist?.contains ? 0.5 : 0,
                  mt: -0.6,
                  fontSize: 15,
                }}
                variant="subtitle1"
                color="error.main"
              >
                {t("Bestseller")}
              </Typography>
            )}
          </Box>

          <Typography
            variant="h4"
            style={{ marginTop: 3, textTransform: "capitalize" }}
          >
            {isRTL ? productlist?.name?.ar : productlist?.name?.en}
          </Typography>

          <Typography sx={{ mt: 2 }} variant="h6">
            {displayVariantPrice()}
          </Typography>

          {productlist?.description?.length > 0 && (
            <Typography sx={{ mt: 2.5 }} fontSize="15px" variant="body1">
              {productlist?.description}
            </Typography>
          )}

          {(productlist?.nutritionalInformation?.calorieCount !== null ||
            productlist?.nutritionalInformation?.preference?.length > 0 ||
            productlist?.nutritionalInformation?.contains?.length > 0) && (
            <>
              <Typography variant="h6" sx={{ mt: 3.5 }}>
                {t("Nutritional Information")}
              </Typography>

              {productlist?.nutritionalInformation?.calorieCount !== null && (
                <Card
                  sx={{
                    mt: 2,
                    p: 1.5,
                    borderRadius: 1,
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      align="left"
                      fontSize="15px"
                      variant="subtitle2"
                    >
                      {t("Calorie Count")}
                    </Typography>

                    <Typography align="right" fontSize="15px" variant="h6">
                      {`${
                        productlist?.nutritionalInformation?.calorieCount
                      } ${t("calories")}`}
                    </Typography>
                  </Box>
                </Card>
              )}

              {productlist?.nutritionalInformation?.preference?.length > 0 && (
                <Card
                  sx={{
                    mt: 2.5,
                    p: 1.5,
                    borderRadius: 1,
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      sx={{ maxWidth: "30%" }}
                      align="left"
                      fontSize="15px"
                      variant="subtitle2"
                    >
                      {t("Dietary Preferences")}
                    </Typography>

                    <Typography
                      sx={{ maxWidth: "70%" }}
                      align="right"
                      fontSize="15px"
                      variant="h6"
                    >
                      {getPreferenceName()}
                    </Typography>
                  </Box>
                </Card>
              )}

              {productlist?.nutritionalInformation?.contains?.length > 0 && (
                <Card
                  sx={{
                    mt: 2.5,
                    p: 1.5,
                    borderRadius: 1,
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      align="left"
                      fontSize="15px"
                      variant="subtitle2"
                    >
                      {t("Item Contains")}
                    </Typography>

                    <Typography
                      sx={{ maxWidth: "70%" }}
                      align="right"
                      fontSize="15px"
                      variant="h6"
                    >
                      {getContainsName()}
                    </Typography>
                  </Box>
                </Card>
              )}
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
};
