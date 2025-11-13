import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Link,
  Menu,
  MenuItem,
  Stack,
  SvgIcon,
  Typography,
  useTheme,
} from "@mui/material";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import Upload01Icon from "@untitled-ui/icons-react/build/esm/Upload01";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ExportButton from "src/components/custom-button/custom-export-button";
import ImportMessage from "src/components/import-message";
import { ImportExportModal } from "src/components/modals/inport-export-modal";
import withPermission from "src/components/permissionManager/restrict-page";
import { ProductTableCard } from "src/components/product/product-table-card";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import useImportProduct from "src/hooks/useImportProduct";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import useExportProduct from "src/utils/export-product";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import { green } from "src/theme/colors";

interface ProductTabProps {
  companyRef?: string;
  companyName?: string;
  industry?: string;
  origin?: string;
  isSaptco?: boolean;
}

const ProductsTab: FC<ProductTabProps> = (props) => {
  const { t } = useTranslation();
  const { companyRef, companyName, origin, industry, isSaptco } = props;
  // console.log(industry);
  console.log("isSaptco", isSaptco);

  const [showDialogCustomerEvent, setShowDialogCustomerEvent] = useState(false);
  const [importEntity, setImportEntity] = useState("");
  const [actions, setActions] = useState<null | HTMLElement>(null);
  const [actionsExport, setActionsExport] = useState<null | HTMLElement>(null);
  const handleActionsClick = (event: React.MouseEvent<HTMLElement>) => {
    setActions(event.currentTarget);
  };
  const handleExportActionsClick = (event: React.MouseEvent<HTMLElement>) => {
    setActionsExport(event.currentTarget);
  };

  const theme = useTheme();
  const { exportCsv } = useExportProduct({ companyRef });
  const { importCsv, response } = useImportProduct({
    importEntity,
    companyRef,
  });
  const router = useRouter();
  const canAccess = usePermissionManager();
  const canCreate = canAccess(MoleculeType["product:create"]);
  const canImport = canAccess(MoleculeType["product:import"]);

  const [openImportExportModal, setOpenImportExportModal] = useState(false);

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

  return (
    <>
      <Card sx={{ my: 4 }}>
        <CardContent>
          <Grid container>
            <Grid xs={12} md={8}>
              <Stack spacing={1}>
                <Typography variant="h6">{t("Create Product")}</Typography>
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
                        display: "inline",
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
                        " You can import upto 15000 Products, Boxes and Stocks  at a time.Only .xlsx files can be imported. Download sample import files here."
                      )}
                      {industry == "restaurant" ? (
                        <Link
                          target="_blank"
                          href="https://docs.google.com/spreadsheets/d/1HkNxE8TcSaq722icBvvGZfS5hjg8H2b2notDOnbItAc/edit?usp=sharing"
                          variant="body2"
                          color="InfoText"
                          sx={{ fontSize: "13px", pl: 0.5 }}
                        >
                          {t("Products Sample Sheet ,")}
                        </Link>
                      ) : (
                        <Link
                          target="_blank"
                          href="https://docs.google.com/spreadsheets/d/1doayyrseum2iWkBilwJjQzGwf-gLmKbxE6N9qxYx0mQ/edit?usp=sharing"
                          variant="body2"
                          color="InfoText"
                          sx={{ fontSize: "13px", pl: 0.5 }}
                        >
                          {t("Products Sample Sheet ,")}
                        </Link>
                      )}

                      <Link
                        target="_blank"
                        href="https://docs.google.com/spreadsheets/d/1pKuEiYAg-KxbioFA2OAyoT-ZUqjOUcp31BTPhMz4xOU/edit?usp=sharing"
                        variant="body2"
                        color="InfoText"
                        sx={{ fontSize: "13px", pl: 0.5, display: "inline" }}
                      >
                        {t("Boxes Sample Sheet. ")}
                      </Link>
                      {t(
                        "Please delete the sample data in the sheet before importing"
                      )}
                    </Typography>
                  </Box>
                </Box>
                {/* <Typography color="text.secondary" variant="body2">
                  {t("Products of the company can be managed here")}
                </Typography> */}
              </Stack>
            </Grid>
            <Grid xs={12} md={4}>
              <Stack
                alignItems="center"
                justifyContent="flex-end"
                direction="row"
                spacing={1}
              >
                <Button
                  variant="text"
                  color="inherit"
                  endIcon={<ArrowDropDownIcon fontSize="small" />}
                  onClick={handleActionsClick}
                  sx={{ m: 1 }}
                  data-testid="add"
                >
                  {t("Import")}
                </Button>
                <Button
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
                        exportCsv("/export/stocks", type, "stocks");
                      }}
                      title={"Stocks"}
                    />
                  </MenuItem>
                </Menu>

                <Button
                  onClick={() => {
                    if (!canCreate) {
                      return toast.error(t("You don't have access"));
                    }
                    router.push({
                      pathname: tijarahPaths?.catalogue?.products?.create,
                      query: {
                        companyRef: companyRef,
                        companyName: companyName,
                        origin: origin,
                        industry: industry,
                        isSaptco: isSaptco,
                      },
                    });
                  }}
                  startIcon={
                    <SvgIcon>
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained"
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
            </Grid>
          </Grid>
        </CardContent>

        <Divider />
        <Divider />

        <Card>
          <Box>
            <ProductTableCard
              origin={origin}
              companyRef={companyRef}
              companyName={companyName}
              industry={industry}
              isSaptco={isSaptco}
            />
          </Box>
        </Card>
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
      </Card>

      <ImportExportModal
        open={openImportExportModal}
        handleClose={() => {
          setOpenImportExportModal(false);
          setImportEntity("");
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

export default withPermission(ProductsTab, MoleculeType["product:read"]);
