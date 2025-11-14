import { Box, Container } from "@mui/material";
import { t } from "i18next";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Seo } from "src/components/seo";
import LoaderAnimation from "src/components/widgets/animations/loader";
import { FRONTEND_URL } from "src/config";
import { useEntity } from "src/hooks/use-entity";

const Menu = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { findOne, entity } = useEntity("ordering/menu-config");

  useEffect(() => {
    if (searchParams.get("locationRef") && searchParams.get("companyRef")) {
      findOne(
        `?locationRef=${searchParams.get(
          "locationRef"
        )}&companyRef=${searchParams.get("companyRef")}`
      );
    }
  }, [searchParams.get("locationRef"), , searchParams.get("companyRef")]);

  useEffect(() => {
    if (entity?.industry === "restaurant") {
      router.push(
        `${FRONTEND_URL}/online-ordering-restaurant?locationRef=${searchParams.get(
          "locationRef"
        )}&companyRef=${searchParams.get("companyRef")}`
      );
    } else if (entity?.industry === "retail") {
      router.push(
        `${FRONTEND_URL}/online-ordering-retail?locationRef=${searchParams.get(
          "locationRef"
        )}&companyRef=${searchParams.get("companyRef")}`
      );
    }
  }, [
    entity?.industry,
    searchParams.get("locationRef"),
    searchParams.get("companyRef"),
  ]);

  return (
    <>
      <Seo title={t("Menu")} />

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "neutral.800" : "neutral.50",
            mb: "120px",
            mt: "50px",
          }}
        >
          <Container maxWidth="md">
            <Box sx={{ mt: "35vh" }}>
              <LoaderAnimation />
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default Menu;
