import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Container, Link, Stack, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { ViewGlobalProduct } from "src/components/product/merchant-global-product/view-global-product";
import { Seo } from "src/components/seo";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import { Screens } from "src/utils/screens-names";
import useActiveTabs from "src/utils/use-active-tabs";
import NoPermission from "src/pages/no-permission";

const Page: PageType = () => {
  const { t } = useTranslation();
  const router = useRouter();
  usePageView();
  const { changeTab } = useActiveTabs();
  const canAccess = usePermissionManager();

  const { id, origin } = router.query;
  // if (canAccess(MoleculeType["global-product:read"])) {
  //   return <NoPermission />;
  // }

  return (
    <>
      <Seo title={`${t("View Product")}`} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
          mb: 4,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack spacing={4}>
              <Box sx={{ maxWidth: 140, cursor: "pointer" }}>
                <Link
                  color="textPrimary"
                  component="a"
                  sx={{
                    alignItems: "center",
                    display: "flex",
                  }}
                  onClick={() => {
                    if (origin == "company") {
                      changeTab("singleGlobalProduct", Screens?.companyDetail);
                    }
                    router.back();
                  }}
                >
                  <ArrowBackIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "#6B7280" }}
                  />
                  <Typography variant="subtitle2">
                    {t("Global Products")}
                  </Typography>
                </Link>
              </Box>

              <Typography variant="h4">{t("Product Details")}</Typography>
            </Stack>

            <ViewGlobalProduct id={id as string} />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
