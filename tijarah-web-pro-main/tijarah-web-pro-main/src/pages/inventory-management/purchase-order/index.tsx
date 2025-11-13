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
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { PurchaseOrderTableCard } from "src/components/purchase-order/purchase-order-table-card";
import { Seo } from "src/components/seo";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import UpgradePackage from "src/pages/upgrade-package";
import NoPermission from "src/pages/no-permission";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import useExportAll from "src/utils/export-all";

const Page: PageType = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [actions, setActions] = useState<null | HTMLElement>(null);
  usePageView();
  const canAccess = usePermissionManager();
  const { exportCsv } = useExportAll({});
  const { canAccessModule } = useFeatureModuleManager();
  const canCreate = canAccess(MoleculeType["po:create"]);

  if (!canAccessModule("purchase_order")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["po:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Purchase Order")}`} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 4,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">
                  {t("Purchase Order & GRN")}
                </Typography>
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
                        tijarahPaths?.inventoryManagement?.purchaseOrder
                          ?.createpo,
                      query: {
                        companyRef: user.company._id,
                        companyName: user.company.name.en,
                        isReturn: false,
                        isSaptco: user?.company?.saptcoCompany,
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

            <PurchaseOrderTableCard
              companyRef={user.company._id}
              companyName={user.company.name.en}
              isSaptco={user?.company?.saptcoCompany}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
