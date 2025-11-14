import { Box, CircularProgress, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useTranslation } from "react-i18next";

type DialogProps = {
  show: boolean;
  ischangedProduct?: boolean;
  toggle: any;
  onOk: any;
  onCancel?: any;
  onDiscard?: any;
  okButtonText: string;
  itemsWithExcessReceived?: any;
  cancelButtonText?: string;
  text: string;
  title: string;
  okButtonPrimaryColor?: boolean;
  cancelButtonErrorColor?: boolean;
  kitchenManagement?: boolean;
  loading?: boolean;
};

export default function ConfirmationDialog({
  show,
  toggle,
  ischangedProduct,
  onOk,
  onCancel,
  onDiscard,
  okButtonText,
  cancelButtonText,
  itemsWithExcessReceived,
  text,
  title,
  okButtonPrimaryColor,
  cancelButtonErrorColor,
  kitchenManagement,
  loading = false,
}: DialogProps) {
  const { t } = useTranslation();

  return (
    <div>
      <Dialog
        open={show}
        onClose={toggle}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {loading ? (
          <DialogContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress />
            </Box>
          </DialogContent>
        ) : (
          <>
            <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {text}

                {itemsWithExcessReceived && (
                  <Box sx={{ pt: 1 }}>
                    {itemsWithExcessReceived.map((item: any, index: any) => (
                      <Typography
                        style={{ textTransform: "capitalize" }}
                        key={index}
                      >
                        {`- ${item.name.en || "Unknown Name"}, ${item.sku}:(${
                          item.received - item.quantity
                        })`}
                      </Typography>
                    ))}
                  </Box>
                )}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <>
                <Button
                  color={cancelButtonErrorColor ? "error" : "inherit"}
                  onClick={
                    ischangedProduct
                      ? onDiscard
                      : kitchenManagement
                      ? onCancel
                      : toggle
                  }
                >
                  {cancelButtonText}
                </Button>
                <Button
                  color={
                    okButtonPrimaryColor
                      ? "primary"
                      : kitchenManagement
                      ? "inherit"
                      : "error"
                  }
                  onClick={onOk}
                  autoFocus
                >
                  {okButtonText}
                </Button>
              </>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}
