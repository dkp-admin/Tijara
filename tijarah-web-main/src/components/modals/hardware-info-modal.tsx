import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  useTheme,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

interface HardwareInfoModalProps {
  open: boolean;
  handleClose: () => void;
  hardware: any;
}

export const HardwareInfoModal = (props: HardwareInfoModalProps) => {
  const { t } = useTranslation();
  const { open, handleClose, hardware } = props;
  const theme = useTheme();
  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  console.log(hardware);
  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      {/* header */}
      <Box
        sx={{
          display: "flex",
          p: 2,
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: theme.palette.mode === "light" ? "#fff" : "#111927",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
        <Typography sx={{ ml: 2 }} variant="h6">
          {hardware.name
            ? isRTL
              ? hardware.name.ar
              : hardware.name.en
            : t("Hardware Information")}
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
          }}
        >
          <CloseIcon fontSize="medium" onClick={handleClose} />
        </Box>
      </Box>

      <Divider />

      {/* body */}
      <DialogContent>
        {hardware.imageUrl && (
          <img
            style={{
              marginTop: 0,
              marginBottom: "10px",
              borderRadius: 0,
              maxHeight: "200px",
            }}
            src={hardware.imageUrl}
            alt=""
            width={"100%"}
            height={"auto"}
          />
        )}
        <Typography
          variant="body1"
          sx={{
            whiteSpace: "pre-line",
            p: 2,
          }}
        >
          {hardware.infoText}
        </Typography>
      </DialogContent>

      <Divider />

      {/* footer */}
      <DialogActions sx={{ p: 2 }}>
        <LoadingButton
          sx={{ borderRadius: 1 }}
          onClick={handleClose}
          size="medium"
          variant="contained"
        >
          {t("Close")}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
