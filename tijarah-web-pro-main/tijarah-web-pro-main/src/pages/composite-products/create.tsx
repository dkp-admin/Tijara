import { Box, Container, Stack } from "@mui/material";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { CompositeProductCreateForm } from "src/components/composite-product/composite-product-create-form";
import { Seo } from "src/components/seo";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import UpgradePackage from "src/pages/upgrade-package";
import NoPermission from "src/pages/no-permission";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";

const Page: PageType = () => {
  const { t } = useTranslation();
  const router = useRouter();
  usePageView();
  const { canAccessModule } = useFeatureModuleManager();
  const canAccess = usePermissionManager();
  const { id, companyRef, companyName, origin, industry } = router.query;

  if (!canAccessModule("composite_products")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["product:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo
        title={
          id
            ? `${t("Edit Composite Product")}`
            : `${t("Create Composite Product")}`
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
            <CompositeProductCreateForm
              origin={origin as string}
              id={id as string}
              companyRef={companyRef as string}
              companyName={companyName as string}
              industry={industry as string}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
