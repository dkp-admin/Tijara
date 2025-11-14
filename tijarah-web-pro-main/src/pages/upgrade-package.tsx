import type { Theme } from "@mui/material";
import {
  Box,
  Button,
  Container,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { t } from "i18next";
import { RouterLink } from "src/components/router-link";
import { Seo } from "src/components/seo";
import { usePageView } from "src/hooks/use-page-view";
import { paths, tijarahPaths } from "src/paths";
import type { Page as PageType } from "src/types/page";

const Page: PageType = () => {
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  usePageView();

  return (
    <>
      <Seo title="Upgrade Required" />
      <Box
        component="main"
        sx={{
          alignItems: "center",
          display: "flex",
          flexGrow: 1,
          py: "80px",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 6,
            }}
          >
            <Box
              alt="Upgrade Required"
              component="img"
              src="/assets/errors/error-401.png"
              sx={{
                height: "auto",
                maxWidth: "100%",
                width: 250,
              }}
            />
          </Box>
          <Typography align="center" variant={mdUp ? "h1" : "h4"}>
            {t("Upgrade your package to access this module")}
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 6,
              gap: 2,
            }}
          >
            <Button component={RouterLink} href={paths.index}>
              {t("Back to Home")}
            </Button>

            <Button
              component={RouterLink}
              href={tijarahPaths.management.account}
              variant="contained"
              color="primary"
            >
              {t("Upgrade Package")}
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Page;
