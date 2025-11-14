import {
  Box,
  Button,
  Container,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import { useState } from "react";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { useAuth } from "src/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { InternalTransferTableCard } from "src/components/internal-transfer/internal-transfer-table-card";
import { useRouter } from "next/router";
import { Seo } from "src/components/seo";
import { usePageView } from "src/hooks/use-page-view";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import withDashboardLayout from "src/components/withDashboardLayout/withDashboardLayout";
import { MoleculeType } from "src/permissionManager";
import withPermission from "src/components/permissionManager/restrict-page";
import { tijarahPaths } from "src/paths";
import type { Page as PageType } from "src/types/page";
import { toast } from "react-hot-toast";
import ExportButton from "src/components/custom-button/custom-export-button";
import useExportAll from "src/utils/export-all";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import UpgradePackage from "src/pages/upgrade-package";

const Page: PageType = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [actions, setActions] = useState<null | HTMLElement>(null);
  usePageView();
  const canAccess = usePermissionManager();
  const { exportCsv } = useExportAll({});
  const { canAccessModule } = useFeatureModuleManager();
  const canCreate = canAccess(MoleculeType["internal-transfer:create"]);

  if (!canAccessModule("internal_transfer")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["internal-transfer:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Internal Transfer")}`} />
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
                <Typography variant="h4">{t("Internal Transfer")}</Typography>
                <Stack alignItems="center" direction="row" spacing={1}>
                  {/* <ExportButton
                    disabled={true}
                    onClick={(type: string) => {
                      exportCsv("/export/purchase-order", type);
                    }}
                  /> */}
                </Stack>
              </Stack>
              <Stack alignItems="center" direction="row" spacing={3}>
                <Button
                  onClick={() => {
                    if (!canCreate) {
                      return toast.error(t("You don't have access"));
                    }
                    router.push({
                      pathname:
                        tijarahPaths?.inventoryManagement?.internalTransfer
                          ?.create,
                      query: {
                        companyRef: user.company._id,
                        companyName: user.company.name.en,
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
                  {t("Create new")}
                </Button>
              </Stack>
            </Stack>

            <InternalTransferTableCard
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
