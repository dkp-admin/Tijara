import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TextFieldWrapper from "../text-field-wrapper";

interface StockEditModalProps {
  open?: boolean;
  handleClose?: () => void;
  handleAddEditAction: any;
  itemdata?: any;
  itemIndex?: string;
  type?: string;
}

export const StockEditModal = (props: StockEditModalProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { open, handleClose, handleAddEditAction, itemdata, itemIndex, type } =
    props;

  const [inputs, setInputs] = useState<any>({});

  useEffect(() => {
    if (open && itemdata && itemIndex) {
      const matchingItem = itemdata.find(
        (item: any) => item.locationRef === itemIndex
      );

      setInputs(matchingItem);
    }
  }, [open, itemdata]);

  const handleSubmit = () => {
    if (inputs) {
      handleAddEditAction(inputs, itemIndex);
      handleClose();
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          px: 2,
          mt: 2,
          mb: 2,
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: theme.palette.mode === "light" ? "#fff" : "#111927",
        }}
      >
        <Box></Box>
        <Typography sx={{ ml: 2 }} variant="h6">
          {`Stocks for ${inputs?.location?.name}`}
        </Typography>
        <CloseIcon fontSize="medium" onClick={handleClose} />
      </Box>
      <Divider />

      {/* Body */}
      <DialogContent>
        <form>
          <Stack spacing={2}>
            <Grid container spacing={1}>
              <Grid item md={6} xs={12} sx={{ mb: 1 }}>
                <Typography>{t("Stock")}</Typography>
              </Grid>
              <Grid item md={6} xs={12} sx={{ mb: 1 }}>
                <TextFieldWrapper
                  fullWidth
                  label={t("Stock")}
                  name={"count"}
                  disabled={Boolean(!inputs.tracking)}
                  onChange={(e) => {
                    const value = e.target.value;
                    const cleanedNumber = value.replace(/\D/g, "");
                    const trimmedValue = cleanedNumber.slice(0, 10);
                    setInputs((prev: any) => ({
                      ...prev,
                      count: trimmedValue,
                    }));
                  }}
                  value={inputs.count}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <Typography>
                  {type === "crate"
                    ? t(
                        "Do you want to update the stock count on relevant Box and Variant"
                      )
                    : t(
                        "Do you want to update the stock count on relevant Variant"
                      )}
                </Typography>
              </Grid>
              <Grid item md={6} xs={12}>
                <Checkbox
                  checked={Boolean(inputs.isChangeInItem)}
                  onChange={(e) => {
                    setInputs((prev: any) => ({
                      ...prev,
                      isChangeInItem: e.target.checked,
                    }));
                  }}
                />
              </Grid>
            </Grid>
          </Stack>
        </form>
      </DialogContent>
      <Divider />

      {/* Footer */}
      <DialogActions sx={{ px: 2, mb: 1 }}>
        <LoadingButton
          sx={{ borderRadius: 1 }}
          onClick={handleSubmit}
          size="medium"
          variant="contained"
          type="submit"
        >
          {t("Done")}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
