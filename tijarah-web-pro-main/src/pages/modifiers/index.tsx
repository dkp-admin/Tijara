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
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ModifiersTableCard } from "src/components/modifiers/modifiers-table-card";
import { Seo } from "src/components/seo";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import UpgradePackage from "src/pages/upgrade-package";

const Page: PageType = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { canAccessModule } = useFeatureModuleManager();
  usePageView();

  const canAccess = usePermissionManager();
  const canCreate = canAccess(MoleculeType["modifier:create"]);

  if (user?.company?.industry === "retail") {
    return <NoPermission />;
  }

  if (!canAccessModule("modifiers")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["modifier:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Modifiers")}`} />
      <Box component="main" sx={{ mb: 2, py: 2, flexGrow: 1 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack
              spacing={4}
              direction="row"
              flexWrap="wrap"
              justifyContent="space-between"
            >
              <Stack spacing={1}>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <Typography variant="h4">{t("Modifiers")}</Typography>
                </Stack>
              </Stack>
              <Stack
                spacing={3}
                display="flex"
                direction="row"
                alignItems="center"
                justifyContent="flex-end"
                sx={{ width: { xs: "100%", md: "auto" } }}
              >
                <Button
                  onClick={() => {
                    if (!canCreate) {
                      return toast.error(t("You don't have access"));
                    }
                    router.push({
                      pathname: tijarahPaths?.catalogue?.modifiers?.create,
                      query: {
                        companyRef: user.company._id,
                        companyName: user.company.name.en,
                      },
                    });
                  }}
                  sx={{ pr: { xs: 0, md: 4 }, pl: { xs: 1, md: 4 } }}
                  startIcon={
                    <SvgIcon>
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                >
                  <Typography sx={{ display: { xs: "none", md: "inline" } }}>
                    {t("Create")}
                  </Typography>
                </Button>
              </Stack>
            </Stack>

            <ModifiersTableCard
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
