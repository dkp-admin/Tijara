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
import { paths } from "src/paths";
import type { Page as PageType } from "src/types/page";

// dummy
const Page: PageType = () => {
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  usePageView();

  return (
    <>
      <Seo title="Error: No Permission Found" />
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
              alt="NO prermission"
              component="img"
              src="/assets/errors/error-404.png"
              sx={{
                height: "auto",
                maxWidth: "100%",
                width: 250,
              }}
            />
          </Box>
          <Typography align="center" variant={mdUp ? "h1" : "h4"}>
            {t(" You don't have permission for this page")}
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 6,
            }}
          >
            <Button component={RouterLink} href={paths.index}>
              {t("Back to Home")}
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Page;
