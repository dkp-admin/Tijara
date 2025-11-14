import { Box, Container, Grid, Typography, useTheme } from "@mui/material";
import { t } from "i18next";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import Slider from "react-slick";
import { Seo } from "src/components/seo";
import { FRONTEND_URL } from "src/config";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";

const DisplayToken = () => {
  const qrRef = useRef(null);
  const router = useRouter();
  const { companyRef, companyName } = router.query;
  const {} = router;
  const theme = useTheme();
  const { user, customer } = useAuth();
  const { find, entities } = useEntity("menu");
  const [itemsPerSlide, setItemsPerSlide] = useState(50);

  const dynamicData = [205, 206, 207, 208, 209, 210, 211, 212, 213];
  const dynamicDataNext = [
    214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228,
    229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243,
    244, 245, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231,
    232, 233, 234,
  ];

  useEffect(() => {
    find({
      activeTab: "all",
      page: 0,
      limit: 500,
      sort: "desc",
    });
  }, []);

  useEffect(() => {
    const calculateItemsPerSlide = () => {
      const itemHeight = theme.spacing(6); // Adjust based on your item height
      const viewportHeight = window.innerHeight;
      const newItemsPerSlide = Math.floor(
        Number(viewportHeight) / Number(parseInt(itemHeight))
      );
      setItemsPerSlide(newItemsPerSlide);
    };

    calculateItemsPerSlide();
    window.addEventListener("resize", calculateItemsPerSlide);

    return () => {
      window.removeEventListener("resize", calculateItemsPerSlide);
    };
  }, [theme]);

  const chunkArray = (array: any, size: any) =>
    Array.from({ length: Math.ceil(array.length / size) }, (v, i) =>
      array.slice(i * size, i * size + size)
    );

  const slides = chunkArray(dynamicDataNext, itemsPerSlide);

  return (
    <>
      <Seo title={t("Display Token")} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: "calc(100vh)",
          width: "100%",
        }}>
        <Box
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "neutral.800" : "neutral.50",
            mb: "120px",
            mt: "50px",
            width: "100%",
          }}>
          <Container>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    p: 1,
                    height: "100%",
                    borderRight: "1px solid #11192726",
                  }}>
                  <Typography variant="h4" component="h3" sx={{ mb: 1 }}>
                    {t("In Process")}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      paddingTop: 2,
                    }}>
                    {dynamicData.map((data, index) => (
                      <Typography
                        variant="h5"
                        sx={{ width: "33.33%", p: 1 }}
                        key={index}>
                        {data}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    p: 1,
                    height: "100%",
                    borderRight: "1px solid #11192726",
                  }}>
                  <Typography variant="h4" component="h3" sx={{ mb: 1 }}>
                    {t("Please Collect")}
                  </Typography>
                  <Slider
                    dots={true}
                    infinite={false}
                    speed={500}
                    slidesToShow={1}
                    slidesToScroll={1}
                    adaptiveHeight={true}>
                    {slides.map((slide, index) => (
                      <Box key={index} sx={{ height: "80vh" }}>
                        <Box style={{ display: "flex", flexWrap: "wrap" }}>
                          {slide.map((data: any, dataIndex: any) => (
                            <Typography
                              key={dataIndex}
                              style={{ width: "33.33%", padding: "12px" }}>
                              {data}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Slider>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    gap: 1,
                    p: 1,
                    textAlign: "center",
                  }}>
                  <Box>
                    <Typography fontSize="14px" variant="h6">
                      {t("Scan to View this in your phone")}
                    </Typography>
                  </Box>

                  <Box
                    ref={qrRef}
                    sx={{
                      mt: 2,
                      pl: 1,
                      pt: 1,
                      maxWidth: 165,
                      backgroundColor: "background.paper",
                    }}>
                    <QRCode
                      size={150}
                      viewBox={`0 0 150 150`}
                      style={{ height: "auto", maxWidth: 150 }}
                      value={`${FRONTEND_URL}/display-token?companyRef=${companyRef}`}
                    />
                  </Box>

                  <Box
                    sx={{
                      maxWidth: 165,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                    <Typography
                      fontSize="14px"
                      variant="subtitle2"
                      color="textSecondary">
                      {t("Powered by")}
                    </Typography>
                    <Typography fontSize="14px" variant="subtitle2">
                      {t(" Tijarah360")}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      maxWidth: 165,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      pt: 2,
                    }}>
                    <Box
                      component="img"
                      src="https://tijarah-qa.vercel.app/assets/tijarah-logo/T360-Landscape-Primary.png"
                      alt="logo"
                      width={"200px"}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default DisplayToken;
