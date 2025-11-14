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
import { useContext } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { CompanyContext } from "src/contexts/company-context";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { usePageView } from "src/hooks/use-page-view";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { DiscountTableCard } from "../discount/discount-table-card";
import withPermission from "../permissionManager/restrict-page";

const DiscountsTab = ({ origin = "company" }) => {
  const { t } = useTranslation();
  const companyContext = useContext<any>(CompanyContext);
  const canAccess = usePermissionManager();
  const canCreate =
    canAccess(MoleculeType["coupon:create"]) ||
    canAccess(MoleculeType["coupon:manage"]);
  const router = useRouter();

  usePageView();

  return (
    <>
      <Card sx={{ my: 4 }}>
        <CardContent>
          <Grid container>
            <Grid xs={12} md={8}>
              <Stack spacing={1}>
                <Typography variant="h6">{t("Create Discount")}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {t("Discounts of the company can be managed here")}
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
                <Button
                  onClick={() => {
                    if (!canCreate) {
                      return toast.error(t("You don't have access"));
                    }
                    router.push({
                      pathname: tijarahPaths?.management?.discounts?.create,
                      query: {
                        companyRef: companyContext._id,
                        companyName: companyContext.name.en,
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

        <DiscountTableCard
          origin={origin}
          companyRef={companyContext?._id}
          companyName={companyContext?.name?.en}
        />
      </Card>
    </>
  );
};

// DiscountsTab.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default withPermission(DiscountsTab, MoleculeType["coupon:read"]);
