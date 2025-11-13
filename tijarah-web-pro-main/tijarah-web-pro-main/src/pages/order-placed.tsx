import { LoadingButton } from "@mui/lab";
import { Box, Container, Fab, Typography, useMediaQuery } from "@mui/material";
import { t } from "i18next";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Seo } from "src/components/seo";
import OrderPlacedAnimation from "src/components/widgets/animations/order-placed";
import { FRONTEND_URL } from "src/config";

const OrderPlaced = () => {
  const searchParams = useSearchParams();
  const sm = useMediaQuery("(max-width:600px)");

  const [checkoutData, setCheckoutData] = useState<any>(null);

  useEffect(() => {
    const data = JSON.parse(window.localStorage.getItem("checkoutCart"));
    setCheckoutData(data);
  }, []);

  return (
    <>
      <Seo title={t("Order Placed")} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "neutral.800" : "neutral.50",
            mb: "100px",
            mt: "40px",
          }}
        >
          <Container maxWidth="md">
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "calc(100vh - 140px)",
              }}
            >
              <Typography align="center" variant="h3">
                {t("Order Placed")}
              </Typography>

              <OrderPlacedAnimation />

              <Typography
                sx={{ mt: -1.5, mx: 2 }}
                align="center"
                variant="h6"
                color="neutral.500"
              >
                {`${t("Your order has been successfully placed.")}`}
              </Typography>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Fab
                  sx={{
                    position: "fixed",
                    bottom: "0%",
                    height: "90px",
                    width: "100%",
                    borderRadius: 0,
                    alignItems: "flex-start",
                    backgroundColor: "background.paper",
                  }}
                  aria-label="order-placed"
                >
                  <Box
                    sx={{
                      px: 2.5,
                      pb: -1,
                      width: sm ? "100%" : "50%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <LoadingButton
                      sx={{
                        px: 4.5,
                        py: 1.75,
                        width: "100%",
                        bgcolor: (theme) =>
                          theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
                      }}
                      type="submit"
                      variant="contained"
                      onClick={() => {
                        window.localStorage.removeItem("addressData");
                        window.localStorage.removeItem("checkoutCart");

                        // Replace the current page's location with the new URL
                        window.location.replace(
                          `${FRONTEND_URL}/order-details?orderId=${searchParams.get(
                            "orderId"
                          )}`
                        );

                        // Disable the browser's back functionality
                        window.addEventListener("popstate", function (event) {
                          window.localStorage.removeItem("checkoutCart");
                          window.location.replace(
                            `${FRONTEND_URL}/order-details?orderId=${searchParams.get(
                              "orderId"
                            )}`
                          );
                        });
                      }}
                    >
                      {t("View Details")}
                    </LoadingButton>
                  </Box>
                </Fab>
              </div>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default OrderPlaced;
