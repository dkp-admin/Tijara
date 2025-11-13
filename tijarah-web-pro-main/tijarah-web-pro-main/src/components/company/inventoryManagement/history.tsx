import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Stack,
  SvgIcon,
  Typography,
  useTheme,
} from "@mui/material";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import { useTranslation } from "react-i18next";
import { HistoryTableCard } from "src/components/history/history-table-card";
import { Seo } from "src/components/seo";
import { usePageView } from "src/hooks/use-page-view";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import type { Page as PageType } from "src/types/page";
import { MoleculeType } from "src/permissionManager";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import withDashboardLayout from "src/components/withDashboardLayout/withDashboardLayout";
import withPermission from "src/components/permissionManager/restrict-page";
import { useAuth } from "src/hooks/use-auth";
import { green } from "@mui/material/colors";
import { useRouter } from "next/router";
import { FC } from "react";
import toast from "react-hot-toast";
import ExportButton from "src/components/custom-button/custom-export-button";
import { tijarahPaths } from "src/paths";
import useExportAll from "src/utils/export-all";

interface HistoryProps {
  companyRef?: string;
  companyName?: string;
  origin?: string;
}

const HistoryTab: FC<HistoryProps> = (props) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { companyRef, companyName, origin } = props;
  const { exportCsv } = useExportAll({});
  const canAccess = usePermissionManager();
  const canCreate =
    canAccess(MoleculeType["vendor:create"]) ||
    canAccess(MoleculeType["vendor:manage"]);

  usePageView();

  return (
    <>
      <Card sx={{ my: 4 }}>
        <CardContent>
          <Grid container>
            <Grid xs={12} md={8}>
              <Stack spacing={1}>
                <Typography variant="h6">{t("History")}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {t(
                    "You can see the inventory history of the products that have tracking enabled here"
                  )}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>

        <Divider />
        <Divider />
        <HistoryTableCard
          origin={origin}
          companyRef={companyRef}
          companyName={companyName}
        />
      </Card>
    </>
  );
};

export default withPermission(HistoryTab, MoleculeType["stock-history:read"]);
