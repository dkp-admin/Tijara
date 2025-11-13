import {
  Box,
  Container,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
} from "@mui/material";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import { useTranslation } from "react-i18next";
import { KitchenManagement } from "src/components/kitchen-management/kitchen-management";
import { Seo } from "src/components/seo";
import { useAuth } from "src/hooks/use-auth";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import type { Page as PageType } from "src/types/page";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import UpgradePackage from "src/pages/upgrade-package";
import NoPermission from "src/pages/no-permission";

const Page: PageType = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { canAccessModule } = useFeatureModuleManager();

  if (user?.company?.industry === "retail") {
    return <NoPermission />;
  }

  if (!canAccessModule("kitchens")) {
    return <UpgradePackage />;
  }

  return (
    <>
      <Seo title={`${t("Kitchen Management")}`} />
      <Box component="main" sx={{ flexGrow: 1, py: 2, mb: 5 }}>
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center">
            <Typography variant="h4">{t("Kitchen Management")}</Typography>
            <Tooltip
              sx={{ ml: 2, mt: 1 }}
              title={t("info_kitchen_management_msg")}
            >
              <SvgIcon color="action">
                <InfoCircleIcon />
              </SvgIcon>
            </Tooltip>
          </Stack>

          <KitchenManagement
            companyRef={user.company._id}
            companyName={user.company.name.en}
            businessType={user.company.businessType}
            businessTypeRef={user.company.businessTypeRef}
          />
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
