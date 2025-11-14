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
import { ModifiersTableCard } from "src/components/modifiers/modifiers-table-card";
import withPermission from "src/components/permissionManager/restrict-page";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";

interface ModifierTabProps {
  companyRef?: string;
  companyName?: string;
  origin?: string;
}

const ModifiersTab: FC<ModifierTabProps> = (props) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { companyRef, companyName, origin } = props;

  const canAccess = usePermissionManager();
  const canCreate =
    canAccess(MoleculeType["modifier:create"]) ||
    canAccess(MoleculeType["modifier:manage"]);

  console.log(canAccess(MoleculeType["modifier:manage"]));

  return (
    <Card sx={{ my: 4 }}>
      <CardContent>
        <Grid container>
          <Grid xs={12} md={8}>
            <Stack spacing={1}>
              <Typography variant="h6">{t("Create Modifier")}</Typography>
              <Typography color="text.secondary" variant="body2">
                {t("Modifiers of the company can be managed here")}
              </Typography>
            </Stack>
          </Grid>

          <Grid xs={12} md={4}>
            <Stack
              spacing={3}
              direction="row"
              alignItems="center"
              justifyContent="flex-end">
              <Button
                onClick={() => {
                  if (!canCreate) {
                    return toast.error(t("You don't have access"));
                  }
                  router.push({
                    pathname: tijarahPaths?.catalogue?.modifiers?.create,
                    query: {
                      origin: origin,
                      companyRef: companyRef,
                      companyName: companyName,
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

      <Divider sx={{ mt: -1 }} />
      <Divider />

      <ModifiersTableCard
        origin={origin}
        companyRef={companyRef}
        companyName={companyName}
      />
    </Card>
  );
};

export default withPermission(ModifiersTab, MoleculeType["product:read"]); // Replace "modifier:read" after modifier permission implementation
