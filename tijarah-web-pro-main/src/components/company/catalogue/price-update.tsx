import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
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
import { FC, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import withPermission from "src/components/permissionManager/restrict-page";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { CostAdjustmentTableCard } from "src/components/price-adjustment/cost-adjustment-table-card";

interface PriceUpdateTabProps {
  companyRef?: string;
  companyName?: string;
  origin?: string;
  isSaptco?: boolean;
}

const PriceUpdateTab: FC<PriceUpdateTabProps> = (props) => {
  const { t } = useTranslation();
  const { companyRef, companyName, origin, isSaptco } = props;
  const router = useRouter();

  const canAccess = usePermissionManager();
  const canCreate =
    canAccess(MoleculeType["bulk-price-update:create"]) ||
    canAccess(MoleculeType["bulk-price-update:manage"]);

  return (
    <>
      <Card sx={{ my: 4 }}>
        <CardContent>
          <Grid container>
            <Grid xs={12} md={8}>
              <Stack spacing={1}>
                <Typography variant="h6">{t("Price Adjustment")}</Typography>
              </Stack>
            </Grid>
            <Grid xs={12} md={4}>
              <Stack
                alignItems="center"
                justifyContent="flex-end"
                direction="row"
                spacing={3}>
                <Button
                  onClick={() => {
                    if (!canCreate) {
                      return toast.error(t("You don't have access"));
                    }
                    router.push({
                      pathname: tijarahPaths.catalogue.priceAdjustment.create,
                      query: {
                        companyRef: companyRef,
                        companyName: companyName,
                        origin: origin,
                        isSaptco: isSaptco,
                      },
                    });
                  }}
                  startIcon={
                    <SvgIcon>
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained">
                  {t("Update Price")}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>

        <Divider />
        <Divider />

        <CostAdjustmentTableCard
          origin={origin}
          companyRef={companyRef}
          companyName={companyName}
          isSaptco={isSaptco}
        />
      </Card>
    </>
  );
};

export default withPermission(
  PriceUpdateTab,
  MoleculeType["bulk-price-update:read"]
);
