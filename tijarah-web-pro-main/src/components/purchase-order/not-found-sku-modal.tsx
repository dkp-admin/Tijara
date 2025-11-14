import { LoadingButton } from "@mui/lab";
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Modal,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";

interface NotFoundSkuProps {
  open: boolean;
  handleClose?: any;
  handleClear?: any;
  modalData?: any;
}

export const NotFoundSku: React.FC<NotFoundSkuProps> = ({
  open,
  handleClose,
  handleClear,
  modalData,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <>
      <Dialog fullWidth maxWidth="sm" open={open}>
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
            {t("Product not found")}
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

        {/* body */}
        <Divider />
        <DialogContent>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              pb: 4,
              mb: 4,
            }}>
            {modalData.map((notFoundSKU: any, index: number) => (
              <>
                <Typography
                  key={index}
                  sx={{ mt: 0.8, mb: 0.8 }}
                  variant="subtitle1"
                  color="neutral.600">
                  {`${t("SKU")} ${notFoundSKU?.SKU} (${
                    notFoundSKU?.["Product Code"] || "-"
                  }) ${t("not found on row number")} ${notFoundSKU.rowNumber}`}
                </Typography>
                <Divider />
              </>
            ))}
          </Box>
        </DialogContent>

        {/* footer */}
        <Divider />
        <DialogActions
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
          }}>
          <Button
            sx={{ borderRadius: 1 }}
            variant="outlined"
            onClick={() => {
              handleClear();
            }}>
            {t("Clear and re-import")}
          </Button>

          <LoadingButton
            sx={{ borderRadius: 1 }}
            type="submit"
            variant="contained"
            onClick={(e) => {
              e.preventDefault();

              handleClose();
            }}>
            {t("I will add manually")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};
