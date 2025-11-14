import {
  Box,
  Button,
  Container,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { PaymentTypesTableCard } from "src/components/payment-types/payment-types-table-card";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import { tijarahPaths } from "src/paths";
import type { Page as PageType } from "src/types/page";

const PaymentTypes: PageType = () => {
  const { t } = useTranslation();
  const router = useRouter();
  usePageView();

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={4}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">{t("Payment Types")}</Typography>
              </Stack>
              <Stack alignItems="center" direction="row" spacing={3}>
                <Button
                  onClick={() => {
                    router.push(tijarahPaths?.platform?.paymentTypes?.create);
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
            </Stack>
            <PaymentTypesTableCard />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

PaymentTypes.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default PaymentTypes;
