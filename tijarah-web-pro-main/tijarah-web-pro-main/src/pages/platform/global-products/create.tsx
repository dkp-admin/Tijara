import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Container, Link, Stack, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { GlobalProductCreateForm } from "src/components/platform/product/global-product-create-form";
import { Seo } from "src/components/seo";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import NoPermission from "src/pages/no-permission";

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const Page: PageType = () => {
  const { t } = useTranslation();
  const router = useRouter();
  usePageView();
  const canAccess = usePermissionManager();

  const { id } = router.query;

  if (!canAccess(MoleculeType["global-product:read"])) {
    return <NoPermission />;
  }
  return (
    <>
      <Seo
        title={
          id != null
            ? `${t("Edit Global Product")}`
            : `${t("Create Global Product")}`
        }
      />
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
              <Box
                sx={{ maxWidth: "fit-content" }}
                onClick={() => {
                  router.push({
                    pathname: tijarahPaths?.platform?.globalProducts?.index,
                  });
                }}
              >
                <Link
                  color="textPrimary"
                  component="a"
                  sx={{
                    alignItems: "center",
                    display: "flex",
                    cursor: "pointer",
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

              <Typography variant="h4">
                {id != null
                  ? t("Edit Global Product")
                  : t("Create Global Product")}
              </Typography>
            </Stack>

            <GlobalProductCreateForm id={id as string} />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
