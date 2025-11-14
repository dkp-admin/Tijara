import {
  Box,
  Button,
  Container,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { useTranslation } from "react-i18next";
import { VendorTableCard } from "src/components/vendor/vendor-table-card";
import { Seo } from "src/components/seo";
import { useAuth } from "src/hooks/use-auth";
import { usePageView } from "src/hooks/use-page-view";
import withPermission from "src/components/permissionManager/restrict-page";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import withDashboardLayout from "src/components/withDashboardLayout/withDashboardLayout";
import { MoleculeType } from "src/permissionManager";
import { tijarahPaths } from "src/paths";
import type { Page as PageType } from "src/types/page";
import useExportAll from "src/utils/export-all";
import { useRouter } from "next/router";
import { useContext } from "react";
import { CompanyContext } from "src/contexts/company-context";
import toast from "react-hot-toast";
import ExportButton from "src/components/custom-button/custom-export-button";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import UpgradePackage from "src/pages/upgrade-package";

const Page: PageType = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const companyContext = useContext<any>(CompanyContext);
  const { user } = useAuth();
  const { canAccessModule } = useFeatureModuleManager();
  const { exportCsv } = useExportAll({});
  const canAccess = usePermissionManager();
  const canCreate =
    canAccess(MoleculeType["vendor:create"]) ||
    canAccess(MoleculeType["vendor:manage"]);

  usePageView();

  if (!canAccessModule("vendors")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["vendor:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Vendor")}`} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 1,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">{t("Vendor")}</Typography>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <ExportButton
                    // disabled={true}
                    onClick={(type: string) => {
                      exportCsv("/export/vendor", type, "vendor");
                    }}
                  />
                </Stack>
              </Stack>
              <Stack alignItems="center" direction="row" spacing={3}>
                <Button
                  onClick={() => {
                    if (!canCreate) {
                      return toast.error(t("You don't have access"));
                    }
                    router.push({
                      pathname: tijarahPaths.inventoryManagement.vendor.create,
                      query: {
                        companyRef: companyContext._id || user.company._id,
                        companyName:
                          companyContext.name?.en || user.company.name.en,
                        origin: origin,
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
            <VendorTableCard
              companyRef={user.company._id}
              companyName={user.company.name.en}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
