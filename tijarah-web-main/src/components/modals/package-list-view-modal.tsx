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
    name: string;
    key: string;
    subModules: {
      key: string;
      name: string;
    }[];
  }[];
  name?: { en: string; ar: string };
  modalImage?: string;
  description?: { en: string; ar: string };
}

export const PackageListModal = (props: IncomingDataProps) => {
  const { t } = useTranslation();
  const { open, modalData, handleClose, modalImage, name, description } = props;
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
        {modalImage && (
          <img
            style={{
              marginTop: 0,
              marginBottom: "10px",
              borderRadius: 0,
              maxHeight: "200px",
            }}
            src={modalImage}
            alt=""
            width="100%"
            height="auto"
          />
        )}

        {description && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
              }}
            >
              {isRTL ? description.ar : description.en}
            </Typography>
          </Box>
        )}

        <Stack direction="column" spacing={2}>
          {modalData?.map((module) => (
            <Box key={module.key}>
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
                  {module.name}
                </Typography>
              </Stack>
              {module.subModules && module.subModules.length > 0 && (
                <Stack direction="column" spacing={1} sx={{ ml: 4 }}>
                  {module.subModules.map((subModule) => (
                    <Stack
                      alignItems="center"
                      direction="row"
                      spacing={1}
                      key={subModule.key}
                    >
                      <SvgIcon color="success" sx={{ fontSize: 16 }}>
                        <CheckIcon />
                      </SvgIcon>
                      <Typography sx={{ fontWeight: 400 }} variant="body2">
                        {subModule.name}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              )}
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
