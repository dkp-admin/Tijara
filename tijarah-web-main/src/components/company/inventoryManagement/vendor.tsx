import {
  Box,
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
import { useTranslation } from "react-i18next";
import { FC, useContext } from "react";
import { VendorTableCard } from "src/components/vendor/vendor-table-card";
import { useRouter } from "next/router";
import { usePageView } from "src/hooks/use-page-view";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { MoleculeType } from "src/permissionManager";
import { tijarahPaths } from "src/paths";
import useExportAll from "src/utils/export-all";
import toast from "react-hot-toast";
import ExportButton from "src/components/custom-button/custom-export-button";
import withPermission from "src/components/permissionManager/restrict-page";

interface VendorProps {
  companyRef?: string;
  companyName?: string;
  origin?: string;
}

const VendorTab: FC<VendorProps> = (props) => {
  const { t } = useTranslation();
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
                <Typography variant="h6">{t("Add Vendor")}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {t("Vendors of the company can be managed here")}
                </Typography>
              </Stack>
            </Grid>
            <Grid xs={12} md={4}>
              <Stack
                alignItems="center"
                justifyContent="flex-end"
                direction="row"
                spacing={3}
              >
                <ExportButton
                  // disabled={true}
                  onClick={(type: string) => {
                    exportCsv("/export/vendor/", type, "vendor");
                  }}
                />
                <Button
                  onClick={() => {
                    if (!canCreate) {
                      return toast.error(t("You don't have access"));
                    }
                    router.push({
                      pathname: tijarahPaths.inventoryManagement.vendor.create,
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
                  variant="contained"
                >
                  {t("Create")}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>

        <Divider />
        <Divider />
        <VendorTableCard
          origin={origin}
          companyRef={companyRef}
          companyName={companyName}
        />
      </Card>
    </>
  );
};

export default withPermission(VendorTab, MoleculeType["vendor:read"]);
