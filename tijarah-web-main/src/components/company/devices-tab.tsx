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
import Download01Icon from "@untitled-ui/icons-react/build/esm/Download01";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useContext } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { CompanyContext } from "src/contexts/company-context";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { usePageView } from "src/hooks/use-page-view";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import useExportAll from "src/utils/export-all";
import { DevicesTableCard } from "../locations/devices/devices-table-card";
import withPermission from "../permissionManager/restrict-page";
import ExportButton from "../custom-button/custom-export-button";

const DevicesTab: NextPage<{ origin?: string }> = ({ origin = "company" }) => {
  const { t } = useTranslation();
  const companyContext = useContext<any>(CompanyContext);
  const companyRef = companyContext?._id;
  const { exportCsv } = useExportAll({ companyRef });
  const router = useRouter();
  const canAccess = usePermissionManager();
  const canCreate =
    canAccess(MoleculeType["device:create"]) ||
    canAccess(MoleculeType["device:manage"]);

  usePageView();

  return (
    <>
      <Card sx={{ my: 4 }}>
        <CardContent>
          <Grid container>
            <Grid xs={12} md={8}>
              <Stack spacing={1}>
                <Typography variant="h6">{t("Add Devices")}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {t("Devices of the company can be managed here")}
                </Typography>
              </Stack>
            </Grid>
            <Grid xs={12} md={4}>
              <Stack
                alignItems="center"
                justifyContent="flex-end"
                direction="row"
                spacing={3}>
                <ExportButton
                  onClick={(type: string) => {
                    exportCsv("/export/device", type, "device");
                  }}
                />
                <Button
                  onClick={() => {
                    if (!canCreate) {
                      return toast.error(t("You don't have access"));
                    }
                    router.push({
                      pathname:
                        tijarahPaths.management.devicesManagement.devices
                          .create,
                      query: {
                        companyRef: companyContext?._id,
                        companyName: companyContext?.name?.en,
                        businessTypeRef: companyContext?.businessTypeRef,
                        businessType: companyContext?.businessType,
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

        <DevicesTableCard
          origin={origin}
          companyRef={companyContext?._id}
          companyName={companyContext?.name?.en}
          businessTypeRef={companyContext?.businessTypeRef}
          businessType={companyContext?.businessType}
        />
      </Card>
    </>
  );
};

export default withPermission(DevicesTab, MoleculeType["device:read"]);
