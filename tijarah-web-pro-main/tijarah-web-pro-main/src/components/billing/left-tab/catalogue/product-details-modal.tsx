import { Card, Divider, Modal, useMediaQuery, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useTranslation } from "react-i18next";
import { Egg } from "src/icons/egg";
import { NonVeg } from "src/icons/non-veg";
import { Veg } from "src/icons/veg";
import { getUnitName } from "src/utils/constants";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

interface ProductDetailsModalProps {
  open: boolean;
  handleClose: any;
  productlist: any;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  open = false,
  handleClose,
  productlist,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";
  const currency = useCurrency();

  const sm = useMediaQuery("(max-width:600px)");

  const displayVariantPrice = () => {
    if (productlist.variants && productlist.variants.length > 0) {
      if (productlist.variants.length === 1) {
        const variant = productlist.variants[0]?.prices?.[0];

        return variant?.price
          ? `${currency} ${toFixedNumber(variant.price)} ${
              getUnitName[productlist.variants[0]?.unit]
            }`
          : `${t("Custom Price")} ${
              getUnitName[productlist.variants[0]?.unit]
            }`;
      } else {
        return `${productlist.variants.length} ${t("Variants")}`;
      }
    } else {
      return t("No Variant");
    }
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
      <Modal
        open={open}
        onClose={() => {
          handleClose();
        }}
      >
        <Card
          sx={{
            visibility: "visible",
            scrollbarColor: "transparent",
            scrollBehavior: "auto",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "100vw",
              sm: "100vw",
              md: "75vw",
              lg: "50vw",
            },
            maxHeight: {
              xs: "100vh",
              sm: "100vh",
              md: "95vh",
              lg: "95vh",
            },
            borderRadius: {
              xs: "0px",
              sm: "0px",
              md: "20px",
              lg: "20px",
            },
            py: 2,
          }}
        >
          <Box
            sx={{
              py: 1.5,
              pl: 2.5,
              pr: 2.5,
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1,
              height: "50px",
              flex: "0 0 auto",
              position: "fixed",
              background: theme.palette.mode !== "dark" ? `#fff` : "#111927",
            }}
          >
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-evenly",
              }}
            >
              <XCircle
                fontSize="small"
                onClick={() => {
                  handleClose();
                }}
                style={{ cursor: "pointer" }}
              />

              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" align="center" sx={{ mr: 4 }}>
                  {t("Product Details")}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ mt: 5 }} />

          <Box
            sx={{
              px: 3,
              pt: 2,
              pb: 5,
              maxHeight: {
                xs: "calc(100vh - 75px)",
                sm: "calc(100vh - 75px)",
                md: "calc(95vh - 75px)",
                lg: "calc(95vh - 75px)",
              },
              width: "100%",
              flex: "1 1 auto",
              overflow: "scroll",
              overflowX: "hidden",
            }}
          >
            {sm && productlist.image && (
              <Box
                sx={{
                  mt: 1,
                  mb: 3,
                  width: "100%",
                  height: "300px",
                  borderRadius: 1,
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundColor: "neutral.100",
                  backgroundImage: `url(${productlist.image})`,
                }}
              />
            )}

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box sx={{ width: sm || !productlist.image ? "100%" : "60%" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
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
              </Box>

              {!sm && productlist.image && (
                <Box
                  sx={{
                    width: "35%",
                    height: "220px",
                    borderRadius: 1,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundColor: "neutral.100",
                    backgroundImage: `url(${productlist.image})`,
                  }}
                />
              )}
            </Box>

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

                {productlist?.nutritionalInformation?.preference?.length >
                  0 && (
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
        </Card>
      </Modal>
    </>
  );
};
