import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import HomeIcon from "@mui/icons-material/Home";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
  Box,
  Breadcrumbs,
  Button,
  Container,
  Link,
  Menu,
  MenuItem,
  SvgIcon,
  Typography,
  useTheme,
} from "@mui/material";
import { Stack } from "@mui/system";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import Upload01Icon from "@untitled-ui/icons-react/build/esm/Upload01";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { CategoriesTableCard } from "src/components/categories/categories-table-card";
import ExportButton from "src/components/custom-button/custom-export-button";
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
import { green } from "src/theme/colors";
import type { Page as PageType } from "src/types/page";
import useExportAll from "src/utils/export-all";
const Categories: PageType = () => {
  const { exportCsv } = useExportAll({});
  const { t } = useTranslation();
  const { user } = useAuth();
  const { canAccessModule } = useFeatureModuleManager();
  const router = useRouter();
  const theme = useTheme();

  const breadcrumbs = [
    <Link
      underline="hover"
      key="1"
      color="inherit"
      onClick={() => {
        router.push({
          pathname: tijarahPaths.dashboard.salesDashboard,
        });
      }}
    >
      <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
    </Link>,
    <Link underline="hover" key="2" color="inherit" href="#">
      {t("Categories")}
    </Link>,
  ];

  let importEntity = "category";
  const { importCsv, response } = useImport({ importEntity });
  const canAccess = usePermissionManager();
  const canCreate = canAccess(MoleculeType["category:create"]);
  const [showDialogCustomerEvent, setShowDialogCustomerEvent] = useState(false);
  const [openImportExportModal, setOpenImportExportModal] = useState(false);
  const [actions, setActions] = useState<null | HTMLElement>(null);
  const handleActionsClick = (event: React.MouseEvent<HTMLElement>) => {
    setActions(event.currentTarget);
  };
  const queryClient = useQueryClient();

  const handleActionsClose = () => {
    setActions(null);
  };
  usePageView();

  if (!canAccessModule("categories")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["category:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Head>
        <title>{t("Categories | Tijarah")}</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
          mb: 2,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <Typography variant="h4">{t("Categories")}</Typography>
                  <Button
                    variant="text"
                    color="inherit"
                    endIcon={<ArrowDropDownIcon fontSize="small" />}
                    onClick={handleActionsClick}
                    sx={{ m: 1 }}
                    data-testid="add"
                  >
                    {t("Import/Export")}
                  </Button>
                  <Menu
                    anchorEl={actions}
                    keepMounted
                    open={Boolean(actions)}
                    onClose={handleActionsClose}
                  >
                    <MenuItem sx={{ px: 4, py: 0.5 }}>
                      <Button
                        sx={{
                          width: 150,
                        }}
                        color="inherit"
                        size="small"
                        onClick={() => {
                          if (!canCreate) {
                            return toast.error(t("You don't have access"));
                          }

                          document.getElementById("fileInput").click();
                        }}
                        startIcon={
                          <SvgIcon>
                            <Upload01Icon />
                          </SvgIcon>
                        }
                      >
                        {t("Import Categories")}
                      </Button>
                    </MenuItem>

                    <MenuItem sx={{ px: 4, py: 0.5 }}>
                      <ExportButton
                        onClick={(type: string) => {
                          exportCsv("/export/category", type, "category");
                        }}
                      />
                    </MenuItem>
                    <input
                      accept=".xlsx"
                      type={"file"}
                      id="fileInput"
                      onChange={async (e) => {
                        try {
                          setOpenImportExportModal(true);
                          await importCsv(e.target.files[0]);
                        } catch (error) {
                          toast.error(`${t("Something went wrong")}`);
                        }
                      }}
                      style={{ display: "none" }}
                    />
                  </Menu>
                </Stack>

                <Stack>
                  <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    aria-label="breadcrumb"
                  >
                    {breadcrumbs}
                  </Breadcrumbs>
                </Stack>
              </Stack>
              <Stack alignItems="center" direction="row" spacing={3}>
                <Button
                  onClick={() => {
                    if (!canCreate) {
                      return toast.error(t("You don't have access"));
                    }
                    router.push({
                      pathname: tijarahPaths?.catalogue?.categories?.create,
                      query: {
                        companyRef: user.company._id,
                        companyName: user.company.name.en,
                        industry: user?.company?.industry,
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

            <Box
              sx={{
                backgroundColor:
                  theme.palette.mode !== "dark"
                    ? `${green.light}`
                    : "neutral.900",
                py: 1,
                pl: 2.5,
                pr: 2,
                display: "flex",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <SvgIcon fontSize="small">
                  <InfoTwoToneIcon color="primary" />
                </SvgIcon>
                <Typography
                  variant="body2"
                  color="gray"
                  sx={{
                    fontSize: "13px",
                    fontWeight: "bold",
                    pl: 0.7,
                  }}
                >
                  {t("Note: ")}
                </Typography>

                <Typography
                  variant="body2"
                  color="gray"
                  sx={{ fontSize: "13px", pl: 0.5 }}
                >
                  {t(
                    " You can import upto 15000 Categories at a time. Only .xlsx files can be imported, here you can"
                  )}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  flexDirection: "row",
                }}
              >
                <Link
                  target="_blank"
                  href="https://docs.google.com/spreadsheets/d/1mmJIT0lfIdZGc0dqM44e6s4FgnB-esnH6oh6b543FFU/edit?usp=sharing"
                  variant="body2"
                  color="InfoText"
                  sx={{ fontSize: "13px", pl: 0.5 }}
                >
                  {t("download")}
                </Link>
                <Typography
                  variant="body2"
                  color="gray"
                  sx={{ fontSize: "13px", pl: 0.5 }}
                >
                  {t("the sample File")}
                </Typography>
              </Box>
            </Box>

            <CategoriesTableCard
              companyName={user.company.name.en}
              companyRef={user.company._id}
              industry={user?.company?.industry}
              profilePicture={user?.profilePicture}
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

Categories.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Categories;
