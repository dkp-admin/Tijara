import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import {
  Box,
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
import ExpirySingleSelect from "src/components/modals/variant-tabs/stocks/expire-dateSelect";
import { useAuth } from "src/hooks/use-auth";
import { useUserType } from "src/hooks/use-user-type";
import { USER_TYPES } from "src/utils/constants";
import TextFieldWrapper from "../text-field-wrapper";

interface BatchSelectModalProps {
  open?: boolean;
  handleClose?: () => void;
  productRef?: string;
  productSku?: string;
  companyRef?: string;
  handleAddEditAction: any;
  itemdata?: any;
  itemIndex?: number;
}

export const BatchSelectModal = (props: BatchSelectModalProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { userType } = useUserType();
  const theme = useTheme();
  const {
    open,
    handleClose,
    productSku,
    productRef,
    companyRef,
    handleAddEditAction,
    itemdata,
    itemIndex,
  } = props;

  const [inputs, setInputs] = useState({
    quantity: "",
    destRef: "",
    quantityAvailDest: "",
    receivedDest: "",
  });

  useEffect(() => {
    if (open && itemdata) {
      setInputs({
        quantity: "",
        destRef: itemdata?.destRef || "",
        quantityAvailDest: itemdata?.quantityAvailDest || "",
        receivedDest: itemdata?.receivedDest || "",
      });
    }
  }, [open, itemdata]);

  const handleSubmit = () => {
    if (inputs.quantity && inputs.destRef) {
      const data = {
        ...inputs,
        count: inputs.quantity,
      };

      handleAddEditAction(data, itemIndex);
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
          {t("Select batch you want to adjust")}
        </Typography>
        <CloseIcon fontSize="medium" onClick={handleClose} />
      </Box>
      <Divider />

      {/* Body */}
      <DialogContent>
        <form>
          <Stack spacing={2}>
            <Grid container spacing={1}>
              <Grid item md={6} xs={12}>
                <ExpirySingleSelect
                  showAllExpiry={false}
                  companyRef={
                    userType === USER_TYPES.ADMIN
                      ? user.company?._id
                      : companyRef
                  }
                  required
                  onChange={(id, expiry, available, received) => {
                    setInputs((prev) => ({
                      ...prev,
                      destRef: id,
                      quantityAvailDest: available,
                      receivedDest: received,
                    }));
                  }}
                  selectedId={inputs.destRef}
                  id="expiry"
                  label={t("Select batch")}
                  sku={productSku}
                  locationRef={itemdata?.locationRef}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextFieldWrapper
                  fullWidth
                  label={t("Recount stock")}
                  name="quantity"
                  required
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setInputs((prev) => ({ ...prev, quantity: value }));
                  }}
                  value={inputs.quantity || ""}
                  inputProps={{ maxLength: 10 }}
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
          {t("Select")}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
