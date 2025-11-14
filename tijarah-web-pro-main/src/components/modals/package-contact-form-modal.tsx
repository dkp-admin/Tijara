import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Chip,
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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckIcon from "@untitled-ui/icons-react/build/esm/Check";
import Image from "next/image";
import HubspotContactForm from "src/pages/authentication/HubspotForm";

interface IncomingDataProps {
  open?: boolean;
  handleClose?: () => void;
  modalData?: any;
  name?: any;
  modalImage?: string;
}

export const ContactFormModal = (props: IncomingDataProps) => {
  const { t } = useTranslation();
  const { open, modalData, handleClose, modalImage, name } = props;
  const theme = useTheme();
  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";
  console.log(modalData);

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="sm"
        open={open}
        onClose={() => {
          handleClose();
        }}
      >
        {/* header */}

        <Box
          sx={{
            display: "flex",
            p: 2,
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor:
              theme.palette.mode === "light" ? "#fff" : "#111927",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          ></Box>

          <Typography sx={{ ml: 2 }} variant="h6">
            {isRTL ? name.ar : name.en}
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
          <Stack sx={{ width: "100%" }}>
            <HubspotContactForm
              region="na1"
              portalId="46532737"
              formId="6a920e8e-43f3-4b51-8373-8b7fc092c064"
              scriptSrc="https://js.hsforms.net/forms/shell.js"
              cotainerID="hubspotmodalform"
            />
          </Stack>
        </DialogContent>

        <Divider />
      </Dialog>
    </>
  );
};
