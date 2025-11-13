import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Stack,
  SvgIcon,
  useTheme,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import CheckIcon from "@untitled-ui/icons-react/build/esm/Check";

interface IncomingDataProps {
  open?: boolean;
  handleClose?: () => void;
  modalData?: {
    en: string;
    ar: string;
  }[];
  name?: { en: string; ar: string };
}

export const PackageViewCardModal = (props: IncomingDataProps) => {
  const { t } = useTranslation();
  const { open, modalData, handleClose, name } = props;
  const theme = useTheme();
  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

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
          {name ? (isRTL ? name.ar : name.en) : t("Package Details")}
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
        <Stack direction="column" spacing={2}>
          {modalData?.map((module) => (
            <Box key={module.en}>
              <Stack
                alignItems="center"
                direction="row"
                spacing={1}
                sx={{ mb: 1 }}
              >
                <SvgIcon color="success">
                  <CheckIcon />
                </SvgIcon>
                <Typography sx={{ fontWeight: 600 }} variant="subtitle1">
                  {module.en}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Stack>
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
