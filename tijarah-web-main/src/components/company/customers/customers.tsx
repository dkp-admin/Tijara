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
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { useRouter } from "next/router";
import { FC } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ExportButton from "src/components/custom-button/custom-export-button";
import { CustomersTableCard } from "src/components/customer/customer-table-card";
import withPermission from "src/components/permissionManager/restrict-page";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import useExportAll from "src/utils/export-all";

interface CustomerTabProps {
  companyRef?: string;
  companyName?: string;
  origin?: string;
  groupId?: string;
}

const CustomersListTab: FC<CustomerTabProps> = (props) => {
  const { t } = useTranslation();
  const { companyRef, companyName, origin, groupId } = props;
  const router = useRouter();
  const { exportCsv } = useExportAll({ companyRef });
  const canAccess = usePermissionManager();
  const canCreate =
    canAccess(MoleculeType["customer:create"]) ||
    canAccess(MoleculeType["customer:manage"]);

  return (
    <Card sx={{ my: 4 }}>
      <CardContent>
        <Grid container>
          <Grid xs={12} md={8}>
            <Stack spacing={1}>
              <Typography variant="h6">{t("Add Customer")}</Typography>
              <Typography color="text.secondary" variant="body2">
                {t("Customers of the company can be managed here")}
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
                onClick={(type: string) => {
                  exportCsv("/export/customer", type, "customer");
                }}
              />
              <Button
                onClick={() => {
                  if (!canCreate) {
                    return toast.error(t("You don't have access"));
                  }
                  router.push({
                    pathname: tijarahPaths.management.customers.create,
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

      <CustomersTableCard
        origin={origin}
        groupId={groupId}
        companyRef={companyRef}
        companyName={companyName}
      />
    </Card>
  );
};

export default withPermission(CustomersListTab, MoleculeType["customer:read"]);
