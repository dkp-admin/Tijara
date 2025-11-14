import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
  Box,
  Breadcrumbs,
  Button,
  Container,
  Link,
  SvgIcon,
  Typography,
  useTheme,
} from "@mui/material";
import { Stack } from "@mui/system";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { BoxesAndCratesTableCard } from "src/components/boxes/boxes-table-card";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import UpgradePackage from "src/pages/upgrade-package";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";

const BoxesAndCrates: PageType = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const router = useRouter();
  const theme = useTheme();
  const { canAccessModule } = useFeatureModuleManager();
  const breadcrumbs = [
    <Link
      underline="hover"
      key="1"
      color="inherit"
      onClick={() => {
        router.push({
          pathname: tijarahPaths.dashboard.salesDashboard,
        });
      }}
    >
      <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
    </Link>,
    <Link underline="hover" key="2" color="inherit" href="#">
      {t("Boxes and Crates")}
    </Link>,
  ];

  const canAccess = usePermissionManager();
  const canCreate = canAccess(MoleculeType["boxes-crates:create"]);
  const [showDialogCustomerEvent, setShowDialogCustomerEvent] = useState(false);
  const [openImportExportModal, setOpenImportExportModal] = useState(false);
  const [actions, setActions] = useState<null | HTMLElement>(null);
  const handleActionsClick = (event: React.MouseEvent<HTMLElement>) => {
    setActions(event.currentTarget);
  };
  const queryClient = useQueryClient();

  const handleActionsClose = () => {
    setActions(null);
  };
  usePageView();

  if (!canAccessModule("boxes_and_crates")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["boxes-crates:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Head>
        <title>{t("Boxes and Crates| Tijarah")}</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
          mb: 2,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <Typography variant="h4">{t("Boxes and Crates")}</Typography>
                </Stack>

                <Stack>
                  <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    aria-label="breadcrumb"
                  >
                    {breadcrumbs}
                  </Breadcrumbs>
                </Stack>
              </Stack>
              <Stack alignItems="center" direction="row" spacing={3}>
                <Button
                  onClick={() => {
                    if (!canCreate) {
                      return toast.error(t("You don't have access"));
                    }
                    router.push({
                      pathname: tijarahPaths?.catalogue?.boxesAndCrates.create,
                      query: {
                        companyRef: user.company._id,
                        companyName: user.company.name.en,
                        industry: user?.company?.industry,
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

            <BoxesAndCratesTableCard
              companyName={user.company.name.en}
              companyRef={user.company._id}
              industry={user?.company?.industry}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

BoxesAndCrates.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default BoxesAndCrates;
