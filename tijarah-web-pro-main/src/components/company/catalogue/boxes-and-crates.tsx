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
import { useTranslation } from "react-i18next";
import { BoxesAndCratesTableCard } from "src/components/boxes/boxes-table-card";
import withPermission from "src/components/permissionManager/restrict-page";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";

interface BoxesAndCratesTabProps {
  companyRef?: string;
  companyName?: string;
  origin?: string;
  isSaptco?: boolean;
}

const BoxesAndCratesTab: FC<BoxesAndCratesTabProps> = (props) => {
  const { t } = useTranslation();
  const { companyRef, companyName, origin } = props;
  const router = useRouter();

  //   const canAccess = usePermissionManager();
  //   const canCreate =
  //     canAccess(MoleculeType["bulk-price-update:create"]) ||
  //     canAccess(MoleculeType["bulk-price-update:manage"]);

  return (
    <>
      <Card sx={{ my: 4 }}>
        <CardContent>
          <Grid container>
            <Grid xs={12} md={8}>
              <Stack spacing={1}>
                <Typography variant="h6">{t("Boxes and Crates")}</Typography>
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
                    // if (!canCreate) {
                    //   return toast.error(t("You don't have access"));
                    // }
                    router.push({
                      pathname: tijarahPaths.catalogue.boxesAndCrates.create,
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

        <BoxesAndCratesTableCard
          origin={origin}
          companyRef={companyRef}
          companyName={companyName}
        />
      </Card>
    </>
  );
};

export default withPermission(
  BoxesAndCratesTab,
  MoleculeType["bulk-price-update:read"]
);
