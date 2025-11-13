import { LoadingButton } from "@mui/lab";
import { Card, Modal, TextField, Typography, useTheme } from "@mui/material";
import { Box, style, textTransform } from "@mui/system";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { t } from "i18next";
import { useState } from "react";
import toast from "react-hot-toast";

interface PromotionCodeModalProps {
  open: boolean;
  handleClose: any;
  data: any;
  getPromoCode: (val: any) => void;
}

export const PromotionCodeModal: React.FC<PromotionCodeModalProps> = ({
  open = false,
  handleClose,
  data,
  getPromoCode,
}) => {
  const theme = useTheme();

  const [code, setCode] = useState<string>("");

  return (
    <>
      <Modal
        open={open}
        onClose={() => {
          handleClose();
        }}>
        <Card
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "95vw",
              sm: "80vw",
              md: "50vw",
              lg: "40vw",
            },

            maxHeight: "90%",
            bgcolor: theme.palette.mode !== "dark" ? `#f8f9fa` : "#0B0F19",
            overflow: "inherit",
            display: "flex",
            flexDirection: "column",
            p: 4,
            justifyContent: "center",
          }}>
          <Box style={{ width: "100%", display: "flex", marginBottom: 20 }}>
            <XCircle
              fontSize="small"
              onClick={handleClose}
              style={{ cursor: "pointer" }}
            />

            <Box style={{ flex: 1 }}>
              <Typography variant="h5" align="center" sx={{ mr: 4 }}>
                {t("Enter promo code")}
              </Typography>
            </Box>
          </Box>
          <TextField
            inputProps={{ style: { textTransform: "uppercase" } }}
            required={true}
            label={"Code"}
            fullWidth
            onChange={(e) => setCode(e?.target?.value)}
          />
          <LoadingButton
            fullWidth
            size="large"
            sx={{ mt: 4 }}
            variant="contained"
            onClick={() => {
              if (code === data.code.code) {
                getPromoCode(data);
                handleClose();
              } else toast.error("Invalid Code");
            }}>
            {t("Submit")}
          </LoadingButton>
        </Card>
      </Modal>
    </>
  );
};
