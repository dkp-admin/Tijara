import {
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import { FC, useState } from "react";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { useAuth } from "src/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { InternalTransferTableCard } from "src/components/internal-transfer/internal-transfer-table-card";
import { useRouter } from "next/router";
import { usePageView } from "src/hooks/use-page-view";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import toast from "react-hot-toast";
import ExportButton from "src/components/custom-button/custom-export-button";
import useExportAll from "src/utils/export-all";
import withPermission from "src/components/permissionManager/restrict-page";

interface InternalTransferTabProps {
  companyRef?: string;
  companyName?: string;
  origin?: string;
}

const InternalTransferTab: FC<InternalTransferTabProps> = (props) => {
  const { t } = useTranslation();
  const { companyRef, companyName, origin } = props;
  const router = useRouter();
  const { exportCsv } = useExportAll({ companyRef });

  const canAccess = usePermissionManager();
  const canCreate = canAccess(MoleculeType["internal-transfer:create"]);

  usePageView();

  return (
    <>
      <Card sx={{ my: 4 }}>
        <CardContent>
          <Grid container>
            <Grid xs={12} md={8}>
              <Stack spacing={1}>
                <Typography variant="h6">{t("Internal Transfer")}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {t("Internal Transfer of the company can be managed here")}
                </Typography>
              </Stack>
            </Grid>
            <Grid xs={12} md={4}>
              <Stack
                alignItems="center"
                justifyContent="flex-end"
                direction="row"
                spacing={3}>
                {/* <ExportButton
                  disabled={true}
                  onClick={(type: string) => {
                    exportCsv("/export/po/", type);
                  }}
                /> */}
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
                        companyRef: companyRef,
                        companyName: companyName,
                        origin: origin,
                      },
                    });
                  }}
                  startIcon={
                    <SvgIcon>
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained">
                  {t("Create")}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>

        <Divider />
        <Divider />

        <InternalTransferTableCard
          origin={origin}
          companyRef={companyRef}
          companyName={companyName}
        />
      </Card>
    </>
  );
};

export default InternalTransferTab;
