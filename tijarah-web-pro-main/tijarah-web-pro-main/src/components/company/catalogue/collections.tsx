import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
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
import { FC, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { CollectionsTableCard } from "src/components/collections/collections-table-card";
import ExportButton from "src/components/custom-button/custom-export-button";
import ImportMessage from "src/components/import-message";
import { ImportExportModal } from "src/components/modals/inport-export-modal";
import withPermission from "src/components/permissionManager/restrict-page";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import useImport from "src/hooks/useImport";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { green } from "src/theme/colors";
import useExportAll from "src/utils/export-all";

interface CollectionTabProps {
  companyRef?: string;
  companyName?: string;
  origin?: string;
}

const CollectionsTab: FC<CollectionTabProps> = (props) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { companyRef, companyName, origin } = props;
  const { exportCsv } = useExportAll({ companyRef });

  let importEntity = "collection";
  const { importCsv, response } = useImport({ importEntity, companyRef });

  const canAccess = usePermissionManager();
  const canCreate =
    canAccess(MoleculeType["collection:create"]) ||
    canAccess(MoleculeType["collection:manage"]);

  const [actions, setActions] = useState<null | HTMLElement>(null);
  const [openImportExportModal, setOpenImportExportModal] = useState(false);
  const [showDialogCustomerEvent, setShowDialogCustomerEvent] = useState(false);

  const handleActionsClick = (event: React.MouseEvent<HTMLElement>) => {
    setActions(event.currentTarget);
  };

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
                <Typography variant="h6">{t("Create Collection")}</Typography>
                <Box
                  sx={{
                    py: 1,
                    pr: 2,
                    pl: 2.5,
                    display: "flex",
                    backgroundColor:
                      theme.palette.mode !== "dark"
                        ? `${green.light}`
                        : "neutral.900",
                  }}
                >
                  <Box sx={{ display: "flex", flexDirection: "row" }}>
                    <SvgIcon fontSize="small">
                      <InfoTwoToneIcon color="primary" />
                    </SvgIcon>
                    <Typography
                      variant="body2"
                      color="gray"
                      sx={{ pl: 0.7, fontSize: "13px", fontWeight: "bold" }}
                    >
                      {t("Note: ")}
                    </Typography>

                    <Typography
                      color="gray"
                      variant="body2"
                      sx={{ fontSize: "13px", pl: 0.5 }}
                    >
                      {t(
                        " You can import upto 15000 Collections at a time. Only .xlsx files can be imported, here you can"
                      )}
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
                        {t("the sample File here")}
                      </Typography>
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-start",
                    }}
                  ></Box>
                </Box>
              </Stack>
            </Grid>
            <Grid xs={12} md={4}>
              <Stack
                spacing={3}
                direction="row"
                alignItems="center"
                justifyContent="flex-end"
              >
                <Button
                  sx={{ m: 1 }}
                  variant="text"
                  color="inherit"
                  data-testid="add"
                  endIcon={<ArrowDropDownIcon fontSize="small" />}
                  onClick={handleActionsClick}
                >
                  {t("Import/Export")}
                </Button>
                <Menu
                  keepMounted
                  anchorEl={actions}
                  open={Boolean(actions)}
                  onClose={handleActionsClose}
                >
                  <MenuItem sx={{ px: 4, py: 0.5 }}>
                    <Button
                      size="small"
                      color="inherit"
                      sx={{ width: 150 }}
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
                      {t("Import Collections")}
                    </Button>
                  </MenuItem>

                  <MenuItem sx={{ px: 4, py: 0.5 }}>
                    <ExportButton
                      onClick={(type: string) => {
                        exportCsv("/export/collection", type, "collection");
                      }}
                    />
                  </MenuItem>
                  <input
                    type="file"
                    accept=".xlsx"
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
                      pathname: tijarahPaths?.catalogue?.collections?.create,
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

        <CollectionsTableCard
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

export default withPermission(CollectionsTab, MoleculeType["category:read"]); // Replace "collection:read" after collection implementation
