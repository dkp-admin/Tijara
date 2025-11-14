import { Box, Container } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ReceiptTemplates } from "src/components/locations/receipt-templates/receipt-templates";
import withPermission from "src/components/permissionManager/restrict-page";
import { Seo } from "src/components/seo";
import withDashboardLayout from "src/components/withDashboardLayout/withDashboardLayout";
import { useAuth } from "src/hooks/use-auth";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";

const Page: PageType = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <>
      <Seo title={`${t("Receipt Template")}`} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
          mb: 4,
        }}>
        <Container maxWidth="xl">
          <ReceiptTemplates />
        </Container>
      </Box>
    </>
  );
};

export default withDashboardLayout(
  withPermission(Page, MoleculeType["receipt-template:read"])
);
