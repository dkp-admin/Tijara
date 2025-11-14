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
import { PurchaseOrderTableCard } from "src/components/purchase-order/purchase-order-table-card";
import { useRouter } from "next/router";
import { usePageView } from "src/hooks/use-page-view";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import toast from "react-hot-toast";
import ExportButton from "src/components/custom-button/custom-export-button";
import useExportAll from "src/utils/export-all";
import withPermission from "src/components/permissionManager/restrict-page";

interface PoGrnTabProps {
  companyRef?: string;
  companyName?: string;
  origin?: string;
  industry?: string;
  isSaptco?: boolean;
}

const PoGrnTab: FC<PoGrnTabProps> = (props) => {
  const { t } = useTranslation();
  const { companyRef, companyName, industry, origin, isSaptco } = props;
  const router = useRouter();
  const { exportCsv } = useExportAll({ companyRef });

  const canAccess = usePermissionManager();
  const canCreate =
    canAccess(MoleculeType["po:create"]) ||
    canAccess(MoleculeType["po:manage"]);

  usePageView();

  return (
    <>
      <Card sx={{ my: 4 }}>
        <CardContent>
          <Grid container>
            <Grid xs={12} md={8}>
              <Stack spacing={1}>
                <Typography variant="h6">
                  {t("Purchase Order & GRN")}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {t("PO & GRN of the company can be managed here")}
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
                        tijarahPaths?.inventoryManagement?.purchaseOrder
                          ?.createpo,
                      query: {
                        companyRef: companyRef,
                        companyName: companyName,
                        origin: origin,
                        isReturn: false,
                        industry: industry,
                        isSaptco: isSaptco,
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

        <PurchaseOrderTableCard
          origin={origin}
          companyRef={companyRef}
          companyName={companyName}
          industry={industry}
          isSaptco={isSaptco}
        />
      </Card>
    </>
  );
};

export default withPermission(PoGrnTab, MoleculeType["po:read"]);
