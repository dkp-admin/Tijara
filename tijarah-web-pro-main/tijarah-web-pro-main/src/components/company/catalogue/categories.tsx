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
import Download01Icon from "@untitled-ui/icons-react/build/esm/Download01";
import Upload01Icon from "@untitled-ui/icons-react/build/esm/Upload01";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { useRouter } from "next/router";
import { FC, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import useImport from "src/hooks/useImport";
import { CategoriesTableCard } from "src/components/categories/categories-table-card";
import ExportButton from "src/components/custom-button/custom-export-button";
import { ImportExportModal } from "src/components/modals/inport-export-modal";
import withPermission from "src/components/permissionManager/restrict-page";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import useExportAll from "src/utils/export-all";
import ImportMessage from "src/components/import-message";
import { green } from "src/theme/colors";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";

interface CategoryTabProps {
  companyRef?: string;
  companyName?: string;
  origin?: string;
}

const CategoriesTab: FC<CategoryTabProps> = (props) => {
  const { t } = useTranslation();
  const { companyRef, companyName, origin } = props;
  const { exportCsv } = useExportAll({ companyRef });
  const router = useRouter();
  const [actions, setActions] = useState<null | HTMLElement>(null);
  const handleActionsClick = (event: React.MouseEvent<HTMLElement>) => {
    setActions(event.currentTarget);
  };

  const theme = useTheme();

  const [openImportExportModal, setOpenImportExportModal] = useState(false);
  const [showDialogCustomerEvent, setShowDialogCustomerEvent] = useState(false);
  const canAccess = usePermissionManager();
  const canCreate =
    canAccess(MoleculeType["category:create"]) ||
    canAccess(MoleculeType["category:manage"]);

  let importEntity = "category";
  const { importCsv, response } = useImport({ importEntity, companyRef });

  const handleActionsClose = () => {
    setActions(null);
  };

  return (
    <>
      <Card sx={{ my: 4 }}>
        <CardContent>
          <Grid container>
            <Grid xs={12} md={8}>
              <Stack spacing={1}>
                <Typography variant="h6">{t("Create Category")}</Typography>
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
                  }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                    }}>
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
                      }}>
                      {t("Note: ")}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="gray"
                      sx={{ fontSize: "13px", pl: 0.5 }}>
                      {t(
                        " You can import upto 15000 Categories at a time. Only .xlsx files can be imported, here you can"
                      )}
                      <Link
                        target="_blank"
                        href="https://docs.google.com/spreadsheets/d/1mmJIT0lfIdZGc0dqM44e6s4FgnB-esnH6oh6b543FFU/edit?usp=sharing"
                        variant="body2"
                        color="InfoText"
                        sx={{ fontSize: "13px", pl: 0.5 }}>
                        {t("download")}
                      </Link>
                      <Typography
                        variant="body2"
                        color="gray"
                        sx={{ fontSize: "13px", pl: 0.5 }}>
                        {t("the sample File here")}
                      </Typography>
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      flexDirection: "row",
                    }}></Box>
                </Box>
              </Stack>
            </Grid>
            <Grid xs={12} md={4}>
              <Stack
                alignItems="center"
                justifyContent="flex-end"
                direction="row"
                spacing={3}>
                <Button
                  variant="text"
                  color="inherit"
                  endIcon={<ArrowDropDownIcon fontSize="small" />}
                  onClick={handleActionsClick}
                  sx={{ m: 1 }}
                  data-testid="add">
                  {t("Import/Export")}
                </Button>
                <Menu
                  anchorEl={actions}
                  keepMounted
                  open={Boolean(actions)}
                  onClose={handleActionsClose}>
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
                      }>
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
                        console.log(error);
                        toast.error(`${t("Something went wrong")}`);
                      }
                    }}
                    style={{ display: "none" }}
                  />
                </Menu>

                <Button
                  onClick={() => {
                    if (!canCreate) {
                      return toast.error(t("You don't have access"));
                    }
                    router.push({
                      pathname: tijarahPaths?.catalogue?.categories?.create,
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

        <CategoriesTableCard
          origin={origin}
          companyRef={companyRef}
          companyName={companyName}
        />
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

export default withPermission(CategoriesTab, MoleculeType["category:read"]);
