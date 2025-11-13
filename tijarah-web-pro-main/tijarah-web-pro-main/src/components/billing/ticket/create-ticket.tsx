import { LoadingButton } from "@mui/lab";
import {
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  Modal,
  TextField,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import useScanStore from "src/store/scan-store";
import useTicketStore from "src/store/ticket-store";
import CloseIcon from "@mui/icons-material/Close";

interface CreateTicketModalProps {
  open: boolean;
  items: any;
  handleClose: any;
  handleAddTicket: any;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  open = false,
  items,
  handleClose,
  handleAddTicket,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { setScan } = useScanStore();
  const { addToTicket } = useTicketStore();
  const [customName, setCustomName] = useState("");

  const handleNameChange = (event: any) => {
    setCustomName(event.target.value);
  };

  const handleSaveTicket = () => {
    if (!customName) {
      toast.error(t("Ticket Name is required"));
      return;
    }

    addToTicket({
      name: customName,
      type: "Walk In",
      items: items,
      createdAt: new Date(),
    });

    handleAddTicket();
  };

  useEffect(() => {
    if (open) {
      setCustomName("");
    }
  }, [open]);

  return (
    <>
      <Box>
        <Dialog
          fullWidth
          maxWidth="md"
          open={open}
          onClose={() => {
            handleClose();
          }}>
          {/* header */}
          <Box
            sx={{
              display: "flex",
              p: 2,
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor:
                theme.palette.mode === "light" ? "#fff" : "#111927",
            }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}></Box>

            <Typography sx={{ ml: 2 }} variant="h6">
              {t("Create Ticket")}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": {
                  backgroundColor: "action.hover",
                  cursor: "pointer",
                  opacity: 0.5,
                },
              }}>
              <CloseIcon fontSize="medium" onClick={handleClose} />
            </Box>
          </Box>
          <Divider />
          <DialogContent>
            <Grid container spacing={2} sx={{ justifyContent: "center" }}>
              <Grid item md={6} xs={12}>
                <TextField
                  name="name"
                  label={t("Ticket Name")}
                  value={customName}
                  onChange={handleNameChange}
                  fullWidth
                  onFocus={() => setScan(true)}
                  onBlur={() => setScan(false)}
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <TextField
                  name="name"
                  label={t("Order Type")}
                  value={"Walk In"}
                  fullWidth
                  disabled
                  onFocus={() => setScan(true)}
                  onBlur={() => setScan(false)}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "end",
              p: 2,
            }}>
            <LoadingButton
              onClick={handleSaveTicket}
              sx={{ borderRadius: 1 }}
              variant="contained"
              type="submit">
              {t("Save Ticket")}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};
