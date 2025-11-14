import {
  Box,
  Button,
  Container,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { CustomChargesTableCard } from "src/components/custom-charges/custom-charges-table-card";
import { Seo } from "src/components/seo";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import NoPermission from "src/pages/no-permission";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import UpgradePackage from "src/pages/upgrade-package";
import toast from "react-hot-toast";

const CustomCharges: PageType = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const canAccess = usePermissionManager();
  const { canAccessModule } = useFeatureModuleManager();
  const canCreate = canAccess(MoleculeType["custom-charge:create"]);
  usePageView();

  if (!canAccessModule("custom_charges")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["custom-charge:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Custom Charges")}`} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={4}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">{t("Custom Charges")}</Typography>
              </Stack>
              <Stack alignItems="center" direction="row" spacing={3}>
                <Button
                  onClick={() => {
                    if (!canCreate) {
                      return toast.error(t("You don't have access"));
                    }
                    router.push({
                      pathname: tijarahPaths.catalogue.customCharges.create,
                      query: {
                        companyRef: user.company._id,
                        companyName: user.company.name.en,
                        companyNameAr: user.company.name.ar,
                      },
                    });
                  }}
                  startIcon={
                    <SvgIcon>
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                >
                  {t("Create")}
                </Button>
              </Stack>
            </Stack>

            <CustomChargesTableCard
              companyRef={user.company._id}
              companyName={user.company.name.en}
              companyNameAr={user.company.name.ar}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

CustomCharges.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default CustomCharges;
