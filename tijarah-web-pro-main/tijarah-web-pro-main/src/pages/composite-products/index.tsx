import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
  Box,
  Button,
  Container,
  Link,
  Stack,
  SvgIcon,
  Typography,
  useTheme,
} from "@mui/material";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { CompositeProductTableCard } from "src/components/composite-product/composite-product-table-card";
import ImportMessage from "src/components/import-message";
import { ImportExportModal } from "src/components/modals/inport-export-modal";
import { Seo } from "src/components/seo";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { usePageView } from "src/hooks/use-page-view";
import useImportProduct from "src/hooks/useImportProduct";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import UpgradePackage from "src/pages/upgrade-package";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import useExportProduct from "src/utils/export-product";

const Page: PageType = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { canAccessModule } = useFeatureModuleManager();
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
      {t("Composite Products")}
    </Link>,
  ];

  const { exportCsv } = useExportProduct({});
  const { user } = useAuth();

  usePageView();
  const [showDialogCustomerEvent, setShowDialogCustomerEvent] = useState(false);
  const [openImportExportModal, setOpenImportExportModal] = useState(false);

  const canAccess = usePermissionManager();
  const canCreate = canAccess(MoleculeType["product:create"]);
  const canImport = canAccess(MoleculeType["product:import"]);
  const [importEntity, setImportEntity] = useState("");
  const [actions, setActions] = useState<null | HTMLElement>(null);
  const [actionsExport, setActionsExport] = useState<null | HTMLElement>(null);
  const handleActionsClick = (event: React.MouseEvent<HTMLElement>) => {
    setActions(event.currentTarget);
  };
  const handleExportActionsClick = (event: React.MouseEvent<HTMLElement>) => {
    console.log(event.currentTarget, "TARGET");
    setActionsExport(event.currentTarget);
  };
  const { importCsv, response } = useImportProduct({ importEntity });

  const handleActionsClose = () => {
    setActions(null);
  };
  const handleExportActionsClose = () => {
    setActionsExport(null);
  };

  const handleImport = (entity: string) => {
    if (!canImport) {
      return toast.error(t("You don't have access"));
    }

    switch (entity) {
      case "merchantProducts":
        setImportEntity("merchantProducts");
        break;
      case "boxes":
        setImportEntity("boxes");
        break;
      case "stocks":
        setImportEntity("stocks");
        break;
      default:
        setImportEntity("");
        break;
    }

    document.getElementById("fileInput").click();
  };

  // useEffect(() => {
  //   if (response) {
  //     setShowDialogCustomerEvent(true);
  //   }
  // }, [response]);

  // useEffect(() => {
  //   if (response) {
  //     setOpenImportExportModal(true);
  //   }
  // }, [response]);

  if (user?.company?.industry === "restaurant") {
    return <NoPermission />;
  }

  if (!canAccessModule("composite_products")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["product:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Composite Products")}`} />
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
            <Stack
              direction="row"
              justifyContent="space-between"
              flexWrap={"wrap"}
              spacing={4}
            >
              <Stack spacing={1}>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <Typography variant="h4">
                    {t("Composite Products")}
                  </Typography>

                  {/* <Button
                    variant="text"
                    color="inherit"
                    endIcon={<ArrowDropDownIcon fontSize="small" />}
                    onClick={handleExportActionsClick}
                    sx={{ m: 1 }}
                    data-testid="add"
                  >
                    {t("Export")}
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
                        onClick={() => handleImport("merchantProducts")}
                        startIcon={
                          <SvgIcon>
                            <Upload01Icon />
                          </SvgIcon>
                        }
                      >
                        {t("Products")}
                      </Button>
                    </MenuItem>
                    <MenuItem sx={{ px: 4, py: 0.5 }}>
                      <Button
                        sx={{
                          width: 150,
                        }}
                        color="inherit"
                        size="small"
                        onClick={() => handleImport("boxes")}
                        startIcon={
                          <SvgIcon>
                            <Upload01Icon />
                          </SvgIcon>
                        }
                      >
                        {t("Boxes")}
                      </Button>
                    </MenuItem>
                    <MenuItem sx={{ px: 4, py: 0.5 }}>
                      <Button
                        sx={{
                          width: 150,
                        }}
                        color="inherit"
                        size="small"
                        onClick={() => handleImport("stocks")}
                        startIcon={
                          <SvgIcon>
                            <Upload01Icon />
                          </SvgIcon>
                        }
                      >
                        {t("Stocks")}
                      </Button>
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
                          console.log(error);
                          toast.error(`${t("Something went wrong")}`);
                        }
                      }}
                      style={{ display: "none" }}
                    />
                  </Menu>
                  <Menu
                    anchorEl={actionsExport}
                    keepMounted
                    open={Boolean(actionsExport)}
                    onClose={handleExportActionsClose}
                  >
                    <MenuItem sx={{ px: 4, py: 0.5 }}>
                      <ExportButton
                        onClick={(type: string) => {
                          exportCsv("/export/product", type, "product");
                        }}
                        title={"Products"}
                      />
                    </MenuItem>
                    <MenuItem sx={{ px: 4, py: 0.5 }}>
                      <ExportButton
                        onClick={(type: string) => {
                          exportCsv("/export/boxes", type, "boxes");
                        }}
                        title={"Boxes"}
                      />
                    </MenuItem>
                    <MenuItem sx={{ px: 4, py: 0.5 }}>
                      <ExportButton
                        onClick={(type: string) => {
                          exportCsv("/export/stocks", type, "stocks");
                        }}
                        title={"Stocks"}
                      />
                    </MenuItem>
                  </Menu> */}
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
              <Stack
                display={"flex"}
                alignItems="center"
                justifyContent={"flex-end"}
                direction="row"
                sx={{
                  width: {
                    xs: "100%",
                    md: "auto",
                  },
                }}
                spacing={3}
              >
                <Button
                  onClick={() => {
                    if (!canCreate) {
                      return toast.error(t("You don't have access"));
                    }
                    router.push({
                      pathname:
                        tijarahPaths?.catalogue?.compositeProducts?.create,
                      query: {
                        companyRef: user.company._id,
                        companyName: user.company.name.en,
                        industry: user?.company?.industry,
                      },
                    });
                  }}
                  sx={{
                    pr: {
                      xs: 0,
                      md: 4,
                    },
                    pl: {
                      xs: 1,
                      md: 4,
                    },
                  }}
                  startIcon={
                    <SvgIcon>
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                >
                  <Typography
                    sx={{
                      display: {
                        xs: "none",
                        md: "inline",
                      },
                    }}
                  >
                    {t("Create")}
                  </Typography>
                </Button>
              </Stack>
            </Stack>
            <CompositeProductTableCard
              companyRef={user.company._id}
              companyName={user.company.name.en}
              industry={user?.company?.industry}
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

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
