import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import {
  Box,
  Container,
  Stack,
  SvgIcon,
  Typography,
  useTheme,
} from "@mui/material";
import { green } from "@mui/material/colors";
import { useTranslation } from "react-i18next";
import { HistoryTableCard } from "src/components/history/history-table-card";
import { Seo } from "src/components/seo";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import UpgradePackage from "src/pages/upgrade-package";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";

const Page: PageType = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useAuth();
  const canAccess = usePermissionManager();
  const { canAccessModule } = useFeatureModuleManager();
  usePageView();

  if (!canAccessModule("inventory_history")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["stock-history:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("History")}`} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 1,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">{t("History")}</Typography>
              </Stack>
            </Stack>
            <Box
              sx={{
                backgroundColor:
                  theme.palette.mode !== "dark" ? `${green}` : "neutral.900",
                display: "flex",
                alignItems: "center",
                py: 1,
                pl: 2.5,
                pr: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                <SvgIcon fontSize="small">
                  <InfoTwoToneIcon color="primary" />
                </SvgIcon>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    variant="body2"
                    color="gray"
                    sx={{
                      fontSize: "13px",
                      fontWeight: "bold",
                      pl: 0.7,
                    }}
                  >
                    {t("Note: ")}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="gray"
                  sx={{ fontSize: "13px", pl: 0.5 }}
                >
                  {t(
                    "You can see the inventory history of the products that have tracking enabled here"
                  )}
                </Typography>
              </Box>
            </Box>

            <HistoryTableCard
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
