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
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ExportButton from "src/components/custom-button/custom-export-button";
import { LocationsTableCard } from "src/components/locations/locations-table-card";
import { Seo } from "src/components/seo";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { usePageView } from "src/hooks/use-page-view";
import { useSubscription } from "src/hooks/use-subscription";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import UpgradePackage from "src/pages/upgrade-package";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import useExportAll from "src/utils/export-all";

const Page: PageType = () => {
  const { find, entities } = useEntity("location");

  const { exportCsv } = useExportAll({});
  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const canAccess = usePermissionManager();
  const canCreate = canAccess(MoleculeType["location:create"]);
  const { canAccessModule } = useFeatureModuleManager();

  const subscription = useSubscription();

  usePageView();

  useEffect(() => {
    find({
      page: 0,
      limit: 1,
      companyRef: user.company?._id,
      activeTab: "active",
      sort: "desc",
    });
  }, [user]);

  if (!canAccessModule("my_locations")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["location:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title="Locations" />
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
                <Typography variant="h4">{t("Locations")}</Typography>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <ExportButton
                    onClick={(type: string) => {
                      exportCsv("/export/location", type, "location");
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

                    if (entities.total >= subscription?.currentLocationLimit) {
                      return toast.error(
                        t(
                          "You have reached the maximum number of locations allowed by your package."
                        )
                      );
                    }

                    router.push({
                      pathname: tijarahPaths.management.locations.create,
                      query: {
                        companyRef: user.company._id,
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
                  {t("Create New Location")}
                </Button>
              </Stack>
            </Stack>

            <LocationsTableCard
              companyRef={user.company._id}
              companyName={user.company?.name?.en}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
