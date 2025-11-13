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
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ExportButton from "src/components/custom-button/custom-export-button";
import { UsersTableCard } from "src/components/locations/users/users-table-card";
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
  const { exportCsv } = useExportAll({});
  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const canAccess = usePermissionManager();
  const canCreate = canAccess(MoleculeType["user:create"]);
  const { canAccessModule } = useFeatureModuleManager();
  usePageView();

  if (!canAccessModule("users")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["user:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Users")}`} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">{t("Users")}</Typography>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <ExportButton
                    onClick={(type: string) => {
                      exportCsv("/export/user", type, "user");
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
                      pathname: tijarahPaths.management.locations.users.create,
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
                  {t("Create")}
                </Button>
              </Stack>
            </Stack>

            <UsersTableCard
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
