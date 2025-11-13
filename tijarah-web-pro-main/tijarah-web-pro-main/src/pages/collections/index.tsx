import {
  Box,
  Button,
  Container,
  SvgIcon,
  Typography,
  useTheme,
} from "@mui/material";
import { Stack } from "@mui/system";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { CollectionsTableCard } from "src/components/collections/collections-table-card";
import ImportMessage from "src/components/import-message";
import { ImportExportModal } from "src/components/modals/inport-export-modal";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { usePageView } from "src/hooks/use-page-view";
import useImport from "src/hooks/useImport";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import UpgradePackage from "src/pages/upgrade-package";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import useExportAll from "src/utils/export-all";

const Collections: PageType = () => {
  const { exportCsv } = useExportAll({});
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const { canAccessModule } = useFeatureModuleManager();
  let importEntity = "collection";
  const { importCsv, response } = useImport({ importEntity });
  const canAccess = usePermissionManager();
  const canCreate = canAccess(MoleculeType["device:create"]);
  const [showDialogCustomerEvent, setShowDialogCustomerEvent] = useState(false);
  const [openImportExportModal, setOpenImportExportModal] = useState(false);
  const [actions, setActions] = useState<null | HTMLElement>(null);

  const handleActionsClick = (event: React.MouseEvent<HTMLElement>) => {
    setActions(event.currentTarget);
  };

  const handleActionsClose = () => {
    setActions(null);
  };
  usePageView();

  if (!canAccessModule("collections")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["collection:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Head>
        <title>{t("Collections | Tijarah")}</title>
      </Head>
      <Box component="main" sx={{ py: 2, mb: 4, flexGrow: 1 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <Typography variant="h4">{t("Collections")}</Typography>
                </Stack>
              </Stack>
              <Stack alignItems="center" direction="row" spacing={3}>
                <Button
                  onClick={() => {
                    if (!canCreate) {
                      return toast.error(t("You don't have access"));
                    }
                    router.push({
                      pathname: tijarahPaths?.catalogue?.collections?.create,
                      query: {
                        companyRef: user.company._id,
                        companyName: user.company.name.en,
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
            </Stack>

            <CollectionsTableCard
              companyName={user.company.name.en}
              companyRef={user.company._id}
            />
          </Stack>
        </Container>
      </Box>
      {response && (
        <ImportMessage
          show={showDialogCustomerEvent}
          toggle={() => setShowDialogCustomerEvent(!showDialogCustomerEvent)}
          cancelButtonText={t("Cancel")}
          title={t("Import Message")}
          response={response}
          importEntity={importEntity}
        />
      )}
      <ImportExportModal
        open={openImportExportModal}
        handleClose={() => {
          setOpenImportExportModal(false);
          if (response?.status == true) {
            router.reload();
          }
        }}
        response={response}
        importEntity={importEntity}
      />
    </>
  );
};

Collections.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Collections;
