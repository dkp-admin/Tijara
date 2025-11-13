import { ArrowBack } from "@mui/icons-material";
import { Box, Container, Link, Stack, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { GetStartedForm } from "src/components/authentication/get-started-form";
import { Seo } from "src/components/seo";
import { usePageView } from "src/hooks/use-page-view";
import { tijarahPaths } from "src/paths";
import type { Page as PageType } from "src/types/page";

const Page: PageType = () => {
  const { t } = useTranslation();
  const router = useRouter();

  usePageView();

  return (
    <>
      <Seo title={`${t("Get Started")}`} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack spacing={3}>
              <Box>
                <Link
                  color="textPrimary"
                  component="a"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    width: 20,
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    router.push(tijarahPaths.authentication.logout)
                  }>
                  <ArrowBack fontSize="small" color="primary" />
                </Link>
              </Box>
              <Typography variant="h5" style={{ marginBottom: "10px" }}>
                {t("Get Started")}
              </Typography>
            </Stack>
            <GetStartedForm />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => page;

export default Page;
